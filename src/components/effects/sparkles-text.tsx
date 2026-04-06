"use client";

import {cn} from "@/lib/utils";
import {motion} from "framer-motion";
import React, {type ReactNode} from "react";

interface SparklesTextProps {
  children: ReactNode;
  className?: string;
  sparklesCount?: number;
  colors?: {
    first: string;
    second: string;
  };
}

interface Sparkle {
  id: number;
  x: string;
  y: string;
  color: string;
  delay: number;
  scale: number;
  rotation: number;
}

function generateSparkles(count: number, colors: { first: string; second: string }): Sparkle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: `${Math.random() * 100}%`,
    y: `${Math.random() * 100}%`,
    color: Math.random() > 0.5 ? colors.first : colors.second,
    delay: Math.random() * 2,
    scale: 0.5 + Math.random() * 0.5,
    rotation: Math.random() * 360,
  }));
}

export function SparklesText({
  children,
  className,
  sparklesCount = 10,
  colors = { first: "#c8a96a", second: "#ede9e0" },
}: SparklesTextProps) {
  const [sparkles] = React.useState(() => generateSparkles(sparklesCount, colors));

  return (
    <span className={cn("relative inline-block", className)}>
      {sparkles.map((sparkle) => (
        <motion.span
          key={sparkle.id}
          className="pointer-events-none absolute z-20"
          style={{
            left: sparkle.x,
            top: sparkle.y,
            color: sparkle.color,
          }}
          animate={{
            scale: [0, sparkle.scale, 0],
            opacity: [0, 1, 0],
            rotate: [sparkle.rotation, sparkle.rotation + 90],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatDelay: Math.random() * 3,
            delay: sparkle.delay,
            ease: "easeInOut",
          }}
        >
          <svg
            width="6"
            height="6"
            viewBox="0 0 6 6"
            fill="currentColor"
          >
            <path d="M3 0L3.8 2.2L6 3L3.8 3.8L3 6L2.2 3.8L0 3L2.2 2.2L3 0Z" />
          </svg>
        </motion.span>
      ))}
      <span className="relative z-10">{children}</span>
    </span>
  );
}
