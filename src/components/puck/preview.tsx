"use client";

import {ReactNode, useCallback, useEffect, useRef, useState} from "react";
import {useAppStore} from "@/store/puck-editor-store";
import getClassNameFactory from "@/lib/get-class-name-factory";
import styles from "./styles.module.css";
import {Loader} from "@/components/ui/loader";
import {Button} from "@/components/ui/button";
import {Edit3, Eye, Maximize2, Monitor, Smartphone, Tablet} from "lucide-react";
import {cn} from "@/lib/utils";

const getClassName = getClassNameFactory("PuckPreview", styles);

export type PreviewMode = "edit" | "preview" | "live";

export type PreviewProps = {
  children?: ReactNode;
  mode?: PreviewMode;
  viewport?: "desktop" | "tablet" | "mobile";
  onViewportChange?: (viewport: "desktop" | "tablet" | "mobile") => void;
  showControls?: boolean;
  className?: string;
};

const VIEWPORT_SIZES = {
  desktop: { width: "100%", icon: Monitor },
  tablet: { width: 768, icon: Tablet },
  mobile: { width: 375, icon: Smartphone },
};

export const Preview = ({
  children,
  mode: controlledMode,
  viewport: controlledViewport = "desktop",
  onViewportChange,
  showControls = true,
  className,
}: PreviewProps) => {
  const [mode, setMode] = useState<PreviewMode>(controlledMode || "edit");
  const [viewport, setViewport] = useState(controlledViewport);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);

  const state = useAppStore((s) => s.state);
  const iframe = useAppStore((s) => s.iframe);
  const setStatus = useAppStore((s) => s.setStatus);

  // Sync controlled mode
  useEffect(() => {
    if (controlledMode !== undefined) {
      setMode(controlledMode);
    }
  }, [controlledMode]);

  // Sync controlled viewport
  useEffect(() => {
    setViewport(controlledViewport);
  }, [controlledViewport]);

  // Handle viewport change
  const handleViewportChange = useCallback((newViewport: "desktop" | "tablet" | "mobile") => {
    setViewport(newViewport);
    onViewportChange?.(newViewport);
  }, [onViewportChange]);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  // Toggle mode
  const toggleMode = useCallback(() => {
    setMode((prev) => (prev === "edit" ? "preview" : "edit"));
  }, []);

  const viewportSize = VIEWPORT_SIZES[viewport];
  const ViewportIcon = viewportSize.icon;

  const isReady = !isLoading;

  return (
    <div
      ref={containerRef}
      className={cn(
        getClassName({ 
          mode,
          viewport,
          fullscreen: isFullscreen,
          ready: isReady,
        }),
        className
      )}
      data-puck-preview
      data-preview-mode={mode}
    >
      {/* Controls */}
      {showControls && (
        <div className={getClassName("controls")}>
          {/* Viewport selector */}
          <div className={getClassName("controlGroup")}>
            <div className={getClassName("controlLabel")}>Viewport</div>
            <div className={getClassName("controlButtons")}>
              {(["desktop", "tablet", "mobile"] as const).map((vp) => {
                const Icon = VIEWPORT_SIZES[vp].icon;
                return (
                  <Button
                    key={vp}
                    type="button"
                    variant={viewport === vp ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleViewportChange(vp)}
                    title={vp.charAt(0).toUpperCase() + vp.slice(1)}
                    className={getClassName("controlButton")}
                  >
                    <Icon size={16} />
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Mode toggle */}
          <div className={getClassName("controlGroup")}>
            <div className={getClassName("controlLabel")}>Mode</div>
            <div className={getClassName("controlButtons")}>
              <Button
                type="button"
                variant={mode === "edit" ? "default" : "ghost"}
                size="sm"
                onClick={() => setMode("edit")}
                title="Edit mode"
              >
                <Edit3 size={16} />
                <span>Edit</span>
              </Button>
              <Button
                type="button"
                variant={mode === "preview" ? "default" : "ghost"}
                size="sm"
                onClick={() => setMode("preview")}
                title="Preview mode"
              >
                <Eye size={16} />
                <span>Preview</span>
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className={getClassName("controlGroup")}>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              <Maximize2 size={16} />
            </Button>
          </div>
        </div>
      )}

      {/* Preview container */}
      <div
        className={getClassName("container")}
        data-viewport-width={viewportSize.width}
      >
        <div
          className={getClassName("frame")}
          style={{
            width: typeof viewportSize.width === "number" 
              ? `${viewportSize.width}px` 
              : viewportSize.width,
          }}
        >
          {/* Mode indicator */}
          {mode === "preview" && (
            <div className={getClassName("modeIndicator")}>
              <Eye size={14} />
              Preview Mode
            </div>
          )}

          {/* Content */}
          <div className={getClassName("content")}>
            {isLoading && (
              <div className={getClassName("loading")}>
                <Loader size={24} />
              </div>
            )}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// Standalone preview component with iframe support
export type StandalonePreviewProps = {
  url?: string;
  className?: string;
};

export const StandalonePreview = ({
  url,
  className,
}: StandalonePreviewProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setError(null);
  }, []);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setError("Failed to load preview");
  }, []);

  return (
    <div className={cn(getClassName(), className)}>
      {isLoading && (
        <div className={getClassName("loading")}>
          <Loader size={24} />
          <span>Loading preview...</span>
        </div>
      )}
      {error && (
        <div className={getClassName("error")}>
          <span>{error}</span>
        </div>
      )}
      <iframe
        ref={iframeRef}
        src={url}
        className={getClassName("iframe")}
        onLoad={handleLoad}
        onError={handleError}
        title="Preview"
      />
    </div>
  );
};
