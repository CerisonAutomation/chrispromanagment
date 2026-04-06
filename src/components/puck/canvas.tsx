"use client";

import {memo, ReactNode, useCallback, useEffect, useMemo, useRef, useState} from "react";
import {useAppStore} from "@/store/puck-editor-store";
import getClassNameFactory from "@/lib/get-class-name-factory";
import {Loader} from "@/components/ui/loader";
import {ViewportControls} from "./viewport-controls";

const getClassName = getClassNameFactory("puck-canvas");

export type CanvasProps = {
  children?: ReactNode;
  className?: string;
};

const ZOOM_LEVELS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2] as const;
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.1;

export const Canvas = memo(function Canvas({ children, className }: CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [gridSize, setGridSize] = useState(8);

  const dispatch = useAppStore((s) => s.dispatch);
  const status = useAppStore((s) => s.status);
  const iframe = useAppStore((s) => s.iframe);

  // Memoized callbacks
  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - ZOOM_STEP, MIN_ZOOM));
  }, []);

  const handleZoomReset = useCallback(() => {
    setZoom(1);
  }, []);

  const handleZoomToFit = useCallback(() => {
    // Calculate zoom to fit content
    setZoom(1);
  }, []);

  const handleZoomSelect = useCallback((level: number) => {
    setZoom(level);
  }, []);

  // Memoized grid style
  const gridStyle = useMemo(
    () => ({
      backgroundSize: `${gridSize}px ${gridSize}px`,
      opacity: 0.4,
    }),
    [gridSize]
  );

  // Memoized transform style
  const transformStyle = useMemo(
    () => ({
      transform: `scale(${zoom})`,
      transformOrigin: "top center",
    }),
    [zoom]
  );

  // Keyboard shortcuts for zoom - stable callback references
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        if (e.key === "=" || e.key === "+") {
          e.preventDefault();
          handleZoomIn();
        } else if (e.key === "-") {
          e.preventDefault();
          handleZoomOut();
        } else if (e.key === "0") {
          e.preventDefault();
          handleZoomReset();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleZoomIn, handleZoomOut, handleZoomReset]);

  const isReady = status === "READY";

  return (
    <div
      ref={containerRef}
      className={getClassName({ ready: isReady, fullScreen: false })}
      data-puck-canvas
    >
      {/* Toolbar */}
      <div className={getClassName("toolbar")}>
        <ViewportControls
          zoom={zoom}
          onZoom={setZoom}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onZoomReset={handleZoomReset}
          onZoomToFit={handleZoomToFit}
          showGrid={showGrid}
          onToggleGrid={() => setShowGrid((prev) => !prev)}
          snapToGrid={snapToGrid}
          onToggleSnap={() => setSnapToGrid((prev) => !prev)}
          gridSize={gridSize}
          onGridSizeChange={setGridSize}
          zoomLevels={ZOOM_LEVELS}
        />
      </div>

      {/* Canvas content */}
      <div
        className={getClassName("content", className)}
        style={transformStyle}
        data-puck-canvas-content
      >
        {showGrid && (
          <div
            className={getClassName("grid")}
            style={gridStyle}
          />
        )}
        {children}
      </div>

      {/* Loading overlay */}
      {!isReady && (
        <div className={getClassName("loadingOverlay")}>
          <Loader size={32} />
        </div>
      )}
    </div>
  );
});

// Viewport presets
export const DEFAULT_VIEWPORTS = {
  desktop: { label: "Desktop", width: "100%", height: "auto" },
  tablet: { label: "Tablet", width: 768, height: "auto" },
  mobile: { label: "Mobile", width: 375, height: "auto" },
} as const;
