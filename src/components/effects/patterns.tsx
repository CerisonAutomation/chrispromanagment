"use client";

import { cn } from "@/lib/utils";
import React from "react";

interface DotPatternProps {
  className?: string;
  width?: number;
  height?: number;
  cx?: number;
  cy?: number;
  cr?: number;
  opacity?: number;
}

export function DotPattern({
  className,
  width = 16,
  height = 16,
  cx = 1,
  cy = 1,
  cr = 1,
  opacity = 0.15,
}: DotPatternProps) {
  const id = React.useId();

  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      aria-hidden="true"
    >
      <svg
        className="absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id={id}
            x={0}
            y={0}
            width={width}
            height={height}
            patternUnits="userSpaceOnUse"
          >
            <circle
              id={id}
              cx={cx}
              cy={cy}
              r={cr}
              fill="var(--cpm-accent)"
              opacity={opacity}
            />
          </pattern>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill={`url(#${id})`}
        />
      </svg>
    </div>
  );
}

interface GridPatternProps {
  className?: string;
  width?: number;
  height?: number;
  strokeDasharray?: string;
  opacity?: number;
}

export function GridPattern({
  className,
  width = 40,
  height = 40,
  strokeDasharray = "0",
  opacity = 0.08,
}: GridPatternProps) {
  const id = React.useId();

  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      aria-hidden="true"
    >
      <svg
        className="absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id={id}
            x={0}
            y={0}
            width={width}
            height={height}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${width} 0 L 0 0 0 ${height}`}
              fill="none"
              stroke="var(--cpm-accent)"
              strokeWidth="0.5"
              strokeDasharray={strokeDasharray}
              opacity={opacity}
            />
          </pattern>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill={`url(#${id})`}
        />
      </svg>
    </div>
  );
}
