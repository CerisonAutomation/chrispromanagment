"use client";

import React, {useCallback, useRef} from "react";
import getClassNameFactory from "@/lib/get-class-name-factory";
import styles from "./styles.module.css";

const getClassName = getClassNameFactory("ResizeHandle", styles);

export type ResizeHandleProps = {
  position: "left" | "right";
  sidebarRef: React.RefObject<HTMLDivElement | null>;
  onResize: (width: number) => void;
  onResizeEnd: (width: number) => void;
  minWidth?: number;
  maxWidth?: number;
};

export const ResizeHandle: React.FC<ResizeHandleProps> = ({
  position,
  sidebarRef,
  onResize,
  onResizeEnd,
  minWidth = 192,
  maxWidth = 600,
}) => {
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging.current) return;

      const delta = e.clientX - startX.current;
      const newWidth =
        position === "left"
          ? startWidth.current + delta
          : startWidth.current - delta;

      // Clamp width between min and max
      const clampedWidth = Math.min(Math.max(newWidth, minWidth), maxWidth);
      onResize(clampedWidth);
      e.preventDefault();
    },
    [onResize, position, minWidth, maxWidth]
  );

  const handleMouseUp = useCallback(() => {
    if (!isDragging.current) return;

    isDragging.current = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";

    // Remove overlay
    const overlay = document.getElementById("resize-overlay");
    if (overlay) {
      overlay.remove();
    }

    // Remove event listeners
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);

    const finalWidth = sidebarRef.current?.getBoundingClientRect().width || 0;
    onResizeEnd(finalWidth);
  }, [handleMouseMove, onResizeEnd, sidebarRef]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      isDragging.current = true;
      startX.current = e.clientX;
      startWidth.current =
        sidebarRef.current?.getBoundingClientRect().width || 0;

      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";

      // Create overlay to prevent iframe from capturing events
      const overlay = document.createElement("div");
      overlay.id = "resize-overlay";
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 9998;
        cursor: col-resize;
      `;
      document.body.appendChild(overlay);

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      e.preventDefault();
      e.stopPropagation();
    },
    [handleMouseMove, handleMouseUp, sidebarRef]
  );

  return (
    <div
      className={getClassName({ [position]: true })}
      onMouseDown={handleMouseDown}
      role="separator"
      aria-orientation="vertical"
      aria-label={`Resize ${position} panel`}
    />
  );
};

// Standalone resize handle for custom panels
export const PanelResizeHandle: React.FC<{
  onResize: (delta: number) => void;
  onResizeEnd: (delta: number) => void;
  side?: "left" | "right";
}> = ({ onResize, onResizeEnd, side = "left" }) => {
  const isDragging = useRef(false);
  const startX = useRef(0);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging.current) return;

      const delta = e.clientX - startX.current;
      onResize(side === "right" ? -delta : delta);
      e.preventDefault();
    },
    [onResize, side]
  );

  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      if (!isDragging.current) return;

      isDragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";

      const delta = e.clientX - startX.current;
      onResizeEnd(side === "right" ? -delta : delta);

      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    },
    [handleMouseMove, onResizeEnd, side]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      isDragging.current = true;
      startX.current = e.clientX;

      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      e.preventDefault();
      e.stopPropagation();
    },
    [handleMouseMove, handleMouseUp]
  );

  return (
    <div
      className={getClassName({ standalone: true, [side]: true })}
      onMouseDown={handleMouseDown}
      role="separator"
      aria-orientation="vertical"
    />
  );
};
