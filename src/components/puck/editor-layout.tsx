"use client";

import {ReactNode, useCallback, useEffect, useState} from "react";
import {useAppStore} from "@/store/puck-editor-store";
import getClassNameFactory from "@/lib/get-class-name-factory";
import styles from "./styles.module.css";
import {MenuBar} from "./menu-bar";
import {ResizeHandle} from "./resize-handle";
import {Canvas} from "./canvas";
import {Button, IconButton} from "@/components/ui/button";
import {Globe, PanelLeft, PanelRight} from "lucide-react";

const getClassName = getClassNameFactory("PuckLayout", styles);
const getClassNameEditor = getClassNameFactory("PuckEditor", styles);

export type EditorLayoutProps = {
  children?: ReactNode;
  leftSidebar?: ReactNode;
  rightSidebar?: ReactNode;
  header?: ReactNode;
  onPublish?: () => void;
  onExport?: () => void;
  onImport?: () => void;
  showLeftSidebar?: boolean;
  showRightSidebar?: boolean;
  leftSidebarWidth?: number;
  rightSidebarWidth?: number;
  onLeftSidebarWidthChange?: (width: number) => void;
  onRightSidebarWidthChange?: (width: number) => void;
};

const DEFAULT_LEFT_SIDEBAR_WIDTH = 320;
const DEFAULT_RIGHT_SIDEBAR_WIDTH = 320;
const MIN_SIDEBAR_WIDTH = 240;
const MAX_SIDEBAR_WIDTH = 600;

export const EditorLayout = ({
  children,
  leftSidebar,
  rightSidebar,
  header,
  onPublish,
  onExport,
  onImport,
  showLeftSidebar: initialShowLeftSidebar = true,
  showRightSidebar: initialShowRightSidebar = true,
  leftSidebarWidth: initialLeftSidebarWidth = DEFAULT_LEFT_SIDEBAR_WIDTH,
  rightSidebarWidth: initialRightSidebarWidth = DEFAULT_RIGHT_SIDEBAR_WIDTH,
  onLeftSidebarWidthChange,
  onRightSidebarWidthChange,
}: EditorLayoutProps) => {
  const [showLeftSidebar, setShowLeftSidebar] = useState(initialShowLeftSidebar);
  const [showRightSidebar, setShowRightSidebar] = useState(initialShowRightSidebar);
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(initialLeftSidebarWidth);
  const [rightSidebarWidth, setRightSidebarWidth] = useState(initialRightSidebarWidth);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const dispatch = useAppStore((s) => s.dispatch);
  const status = useAppStore((s) => s.status);

  // Set mounted state after initial render
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        // On mobile, hide both sidebars by default
        if (showLeftSidebar && showRightSidebar) {
          setShowLeftSidebar(false);
        }
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial check

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLeftSidebarResize = useCallback((width: number) => {
    setLeftSidebarWidth(width);
    onLeftSidebarWidthChange?.(width);
  }, [onLeftSidebarWidthChange]);

  const handleLeftSidebarResizeEnd = useCallback((width: number) => {
    onLeftSidebarWidthChange?.(width);
  }, [onLeftSidebarWidthChange]);

  const handleRightSidebarResize = useCallback((width: number) => {
    setRightSidebarWidth(width);
    onRightSidebarWidthChange?.(width);
  }, [onRightSidebarWidthChange]);

  const handleRightSidebarResizeEnd = useCallback((width: number) => {
    onRightSidebarWidthChange?.(width);
  }, [onRightSidebarWidthChange]);

  const toggleLeftSidebar = useCallback(() => {
    setShowLeftSidebar((prev) => !prev);
    if (window.innerWidth < 768) {
      setShowRightSidebar(false);
    }
  }, []);

  const toggleRightSidebar = useCallback(() => {
    setShowRightSidebar((prev) => !prev);
    if (window.innerWidth < 768) {
      setShowLeftSidebar(false);
    }
  }, []);

  const ready = status === "READY";

  return (
    <div className={getClassNameEditor()} data-puck-editor>
      {/* Header */}
      {header && <div className={getClassName("header")}>{header}</div>}

      {/* Menu bar */}
      <MenuBar
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        onPublish={onPublish}
        onExport={onExport}
        onImport={onImport}
      />

      {/* Main layout */}
      <div
        className={getClassName({
          leftSideBarVisible: showLeftSidebar,
          rightSideBarVisible: showRightSidebar,
          mounted,
          isExpanded: menuOpen,
        })}
        style={{
          "--puck-user-left-side-bar-width": `${leftSidebarWidth}px`,
          "--puck-user-right-side-bar-width": `${rightSidebarWidth}px`,
        } as React.CSSProperties}
      >
        {/* Left sidebar */}
        {showLeftSidebar && (
          <>
            <aside
              className={getClassName("leftSidebar")}
              style={{ width: leftSidebarWidth }}
              data-puck-sidebar="left"
            >
              <div className={getClassName("sidebarContent")}>
                {leftSidebar}
              </div>
              <ResizeHandle
                position="right"
                sidebarRef={{ current: null }}
                onResize={handleLeftSidebarResize}
                onResizeEnd={handleLeftSidebarResizeEnd}
                minWidth={MIN_SIDEBAR_WIDTH}
                maxWidth={MAX_SIDEBAR_WIDTH}
              />
            </aside>
          </>
        )}

        {/* Canvas */}
        <main className={getClassName("canvas")}>
          <Canvas>{children}</Canvas>
        </main>

        {/* Right sidebar */}
        {showRightSidebar && (
          <>
            <ResizeHandle
              position="left"
              sidebarRef={{ current: null }}
              onResize={handleRightSidebarResize}
              onResizeEnd={handleRightSidebarResizeEnd}
              minWidth={MIN_SIDEBAR_WIDTH}
              maxWidth={MAX_SIDEBAR_WIDTH}
            />
            <aside
              className={getClassName("rightSidebar")}
              style={{ width: rightSidebarWidth }}
              data-puck-sidebar="right"
            >
              <div className={getClassName("sidebarContent")}>
                {rightSidebar}
              </div>
            </aside>
          </>
        )}
      </div>
    </div>
  );
};

// Header component
export type PuckHeaderProps = {
  children?: ReactNode;
  title?: string;
  path?: string;
  leftSidebarVisible?: boolean;
  rightSidebarVisible?: boolean;
  onToggleLeftSidebar?: () => void;
  onToggleRightSidebar?: () => void;
  onPublish?: () => void;
  actions?: ReactNode;
};

export const PuckHeader = ({
  children,
  title = "Page",
  path,
  leftSidebarVisible = true,
  rightSidebarVisible = true,
  onToggleLeftSidebar,
  onToggleRightSidebar,
  onPublish,
  actions,
}: PuckHeaderProps) => {
  return (
    <header className={getClassName("headerInner")}>
      <div className={getClassName("headerToggle")}>
        {onToggleLeftSidebar && (
          <IconButton
            type="button"
            variant="ghost"
            size="sm"
            onClick={onToggleLeftSidebar}
            title="Toggle left sidebar"
            className={getClassName("toggleButton", { active: leftSidebarVisible })}
          >
            <PanelLeft size={18} />
          </IconButton>
        )}
        {onToggleRightSidebar && (
          <IconButton
            type="button"
            variant="ghost"
            size="sm"
            onClick={onToggleRightSidebar}
            title="Toggle right sidebar"
            className={getClassName("toggleButton", { active: rightSidebarVisible })}
          >
            <PanelRight size={18} />
          </IconButton>
        )}
      </div>

      <div className={getClassName("headerTitle")}>
        <h1 className={getClassName("title")}>{title}</h1>
        {path && <code className={getClassName("path")}>{path}</code>}
      </div>

      <div className={getClassName("headerActions")}>
        {actions}
        {onPublish && (
          <Button variant="default" size="sm" onClick={onPublish}>
            <Globe size={14} />
            Publish
          </Button>
        )}
      </div>
    </header>
  );
};
