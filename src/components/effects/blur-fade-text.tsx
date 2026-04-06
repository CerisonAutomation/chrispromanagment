"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import React, { type ReactNode } from "react";

interface BlurFadeTextProps {
  text: string;
  className?: string;
  delay?: number;
  yOffset?: number;
  inView?: boolean;
  /** Split text into individual characters for staggered animation */
  characterDelay?: number;
  /** If true, animates each word instead of each character */
  byWord?: boolean;
}

export function BlurFadeText({
  text,
  className,
  delay = 0,
  yOffset = 6,
  inView = true,
  characterDelay = 0.03,
  byWord = false,
}: BlurFadeTextProps) {
  const segments = byWord ? text.split(" ") : text.split("");

  return (
    <span className={cn("inline-block", className)}>
      {segments.map((segment, i) => (
        <motion.span
          key={i}
          className="inline-block"
          initial={{ filter: "blur(8px)", opacity: 0, y: yOffset }}
          animate={inView ? { filter: "blur(0px)", opacity: 1, y: 0 } : {}}
          whileInView={inView ? undefined : { filter: "blur(0px)", opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{
            delay: delay + i * characterDelay,
            duration: 0.35,
            ease: [0.21, 0.47, 0.32, 0.98],
          }}
        >
          {segment}
          {byWord && i < segments.length - 1 ? "\u00A0" : ""}
        </motion.span>
      ))}
    </span>
  );
}

// Multi-directional blur fade for staggered children
interface BlurFadeDirectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  from?: "left" | "right" | "top" | "bottom";
}

export function BlurFadeDirection({
  children,
  className,
  delay = 0,
  from = "bottom",
}: BlurFadeDirectionProps) {
  const offsets = {
    left: { x: -20, y: 0 },
    right: { x: 20, y: 0 },
    top: { x: 0, y: -20 },
    bottom: { x: 0, y: 20 },
  };

  const { x, y } = offsets[from];

  return (
    <motion.div
      className={cn(className)}
      initial={{ filter: "blur(6px)", opacity: 0, x, y }}
      whileInView={{ filter: "blur(0px)", opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{
        delay,
        duration: 0.5,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
    >
      {children}
    </motion.div>
  );
}
