"use client";

import { cn } from "@/lib/utils";
import React from "react";

interface RetroGridProps {
  className?: string;
  cellSize?: number;
  opacity?: number;
}

export function RetroGrid({
  className,
  cellSize = 40,
  opacity = 0.06,
}: RetroGridProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className
      )}
      aria-hidden="true"
    >
      {/* Grid pattern */}
      <div
        className="absolute inset-0 h-[200%] w-[200%] animate-[grid_15s_linear_infinite]"
        style={{
          backgroundImage: `
            linear-gradient(var(--cpm-accent) 1px, transparent 1px),
            linear-gradient(90deg, var(--cpm-accent) 1px, transparent 1px)
          `,
          backgroundSize: `${cellSize}px ${cellSize}px`,
          opacity,
          maskImage: "radial-gradient(ellipse at center, black 0%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 0%, transparent 70%)",
        }}
      />
      {/* Radial overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, transparent 0%, var(--cpm-bg-primary) 70%)",
        }}
      />
    </div>
  );
}
