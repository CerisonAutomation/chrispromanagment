"use client";

import {ReactNode, useCallback, useState} from "react";
import {useAppStore} from "@/store/puck-editor-store";
import getClassNameFactory from "@/lib/get-class-name-factory";
import styles from "./styles.module.css";
import {MenuBar} from "./menu-bar";
import {Button, IconButton} from "@/components/ui/button";
import {ChevronDown, ChevronUp, Globe, PanelLeft, PanelRight} from "lucide-react";

const getClassName = getClassNameFactory("PuckHeader", styles);

export type PuckHeaderProps = {
  children?: ReactNode;
  actions?: ReactNode;
  title?: string;
  path?: string;
  onPublish?: () => void;
  hidePlugins?: boolean;
};

export const PuckHeader = ({
  children,
  actions,
  title,
  path,
  onPublish,
  hidePlugins = false,
}: PuckHeaderProps) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const dispatch = useAppStore((s) => s.dispatch);
  const leftSideBarVisible = useAppStore((s) => s.state.ui.leftSideBarVisible);
  const rightSideBarVisible = useAppStore((s) => s.state.ui.rightSideBarVisible);

  const toggleLeftSidebar = useCallback(() => {
    dispatch({
      type: "setUi",
      ui: {
        leftSideBarVisible: !leftSideBarVisible,
        ...(window.matchMedia("(max-width: 637px)").matches
          ? { rightSideBarVisible: false }
          : {}),
      },
    });
  }, [dispatch, leftSideBarVisible]);

  const toggleRightSidebar = useCallback(() => {
    dispatch({
      type: "setUi",
      ui: {
        rightSideBarVisible: !rightSideBarVisible,
        ...(window.matchMedia("(max-width: 637px)").matches
          ? { leftSideBarVisible: false }
          : {}),
      },
    });
  }, [dispatch, rightSideBarVisible]);

  const rootTitle = useAppStore((s) => {
    const rootData = s.state.data.root as { props?: { title?: string } };
    return rootData?.props?.title ?? "";
  });

  const displayTitle = title || rootTitle || "Page";

  return (
    <header
      className={getClassName({
        leftSideBarVisible,
        rightSideBarVisible,
        hidePlugins,
      })}
    >
      <div className={getClassName("inner")}>
        {/* Sidebar toggles */}
        <div className={getClassName("toggle")}>
          <div className={getClassName("leftSideBarToggle")}>
            <IconButton
              type="button"
              variant="ghost"
              size="sm"
              onClick={toggleLeftSidebar}
              title="Toggle left sidebar"
            >
              <PanelLeft size={18} />
            </IconButton>
          </div>
          <div className={getClassName("rightSideBarToggle")}>
            <IconButton
              type="button"
              variant="ghost"
              size="sm"
              onClick={toggleRightSidebar}
              title="Toggle right sidebar"
            >
              <PanelRight size={18} />
            </IconButton>
          </div>
        </div>

        {/* Title */}
        <div className={getClassName("title")}>
          <h2 className={getClassName("titleText")}>{displayTitle}</h2>
          {path && <code className={getClassName("path")}>{path}</code>}
        </div>

        {/* Tools (menu, actions) */}
        <div className={getClassName("tools")}>
          <div className={getClassName("menuButton")}>
            <IconButton
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setMenuOpen(!menuOpen)}
              title={menuOpen ? "Hide menu" : "Show menu"}
            >
              {menuOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </IconButton>
          </div>

          {/* Actions */}
          <div className={getClassName("actions")}>
            {actions}
            {onPublish && (
              <Button
                variant="default"
                size="sm"
                onClick={onPublish}
              >
                <Globe size={14} />
                Publish
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Menu bar */}
      <MenuBar
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        onPublish={onPublish}
      />

      {/* Children (for slot support) */}
      {children}
    </header>
  );
};

// Header actions wrapper component
export const PuckHeaderActions = ({ children }: { children?: ReactNode }) => {
  return <div className={getClassName("headerActions")}>{children}</div>;
};

// Header title component with slot
export const PuckHeaderTitle = ({
  children,
  title,
  path,
}: {
  children?: ReactNode;
  title?: string;
  path?: string;
}) => {
  return (
    <div className={getClassName("title")}>
      {children || (
        <>
          <h2 className={getClassName("titleText")}>{title || "Page"}</h2>
          {path && <code className={getClassName("path")}>{path}</code>}
        </>
      )}
    </div>
  );
};

// Header publish button
export const PuckHeaderPublish = ({
  onClick,
  children = "Publish",
}: {
  onClick?: () => void;
  children?: ReactNode;
}) => {
  return (
    <Button variant="default" size="sm" onClick={onClick}>
      <Globe size={14} />
      {children}
    </Button>
  );
};
