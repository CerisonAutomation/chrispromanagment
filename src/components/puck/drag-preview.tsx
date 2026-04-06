"use client";

import {CSSProperties, ReactNode, useCallback, useEffect, useRef, useState,} from "react";
import {createPortal} from "react-dom";
import getClassNameFactory from "@/lib/get-class-name-factory";
import styles from "./styles.module.css";

const getClassName = getClassNameFactory("DragPreview", styles);

export type DragPreviewProps = {
  children: ReactNode;
  isDragging: boolean;
  position?: { x: number; y: number };
  componentType?: string;
  label?: string;
};

export const DragPreview = ({
  children,
  isDragging,
  position,
  componentType,
  label,
}: DragPreviewProps) => {
  const [style, setStyle] = useState<CSSProperties>({});
  const [isVisible, setIsVisible] = useState(false);
  const [portalEl, setPortalEl] = useState<HTMLElement | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Set portal to body or the preview container
    const previewEl = document.querySelector("[data-puck-preview]");
    setPortalEl(previewEl || document.body);
  }, []);

  const updatePosition = useCallback(() => {
    if (!isDragging || !ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    setStyle({
      position: "fixed",
      left: position?.x ?? rect.left,
      top: position?.y ?? rect.top,
      width: rect.width,
      height: rect.height,
      zIndex: 9999,
      pointerEvents: "none",
    });
    setIsVisible(true);
  }, [isDragging, position]);

  useEffect(() => {
    if (isDragging) {
      updatePosition();
    } else {
      setIsVisible(false);
    }
  }, [isDragging, updatePosition]);

  if (!isVisible || !portalEl) {
    return null;
  }

  return createPortal(
    <div ref={ref} className={getClassName()} style={style}>
      <div className={getClassName("content")}>
        {children}
      </div>
      {label && (
        <div className={getClassName("label")}>
          {componentType && <span className={getClassName("type")}>{componentType}</span>}
          <span className={getClassName("name")}>{label}</span>
        </div>
      )}
    </div>,
    portalEl
  );
};

// Component drag preview for the sidebar
export type ComponentDragPreviewProps = {
  componentType: string;
  label: string;
  isDragging: boolean;
  position?: { x: number; y: number };
};

export const ComponentDragPreview = ({
  componentType,
  label,
  isDragging,
  position,
}: ComponentDragPreviewProps) => {
  return (
    <DragPreview
      isDragging={isDragging}
      position={position}
      componentType={componentType}
      label={label}
    >
      <div className={getClassName("component")}>
        <div className={getClassName("icon")}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="9" y1="21" x2="9" y2="9" />
          </svg>
        </div>
      </div>
    </DragPreview>
  );
};

// Canvas drag preview for reordering
export type CanvasDragPreviewProps = {
  children: ReactNode;
  isDragging: boolean;
  index: number;
  zone: string;
};

export const CanvasDragPreview = ({
  children,
  isDragging,
  index,
  zone,
}: CanvasDragPreviewProps) => {
  return (
    <DragPreview isDragging={isDragging}>
      <div className={getClassName("canvas")}>
        {children}
        <div className={getClassName("index")}>
          #{index + 1}
        </div>
      </div>
    </DragPreview>
  );
};
