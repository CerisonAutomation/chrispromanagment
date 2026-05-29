"use client";

import {cn} from "@/lib/utils";
import {motion} from "framer-motion";
import React, {type ReactNode} from "react";

interface AnimatedShinyTextProps {
  children: ReactNode;
  className?: string;
  shimmerWidth?: number;
  speed?: number;
}

export function AnimatedShinyText({
  children,
  className,
  shimmerWidth = 100,
  speed = 3,
}: AnimatedShinyTextProps) {
  return (
    <span
      className={cn(
        "relative inline-block overflow-hidden",
        className
      )}
    >
      <motion.span
        className="absolute inset-0"
        style={{
          background: `linear-gradient(120deg, transparent 0%, rgba(200,169,106,0.15) 40%, rgba(200,169,106,0.3) 50%, rgba(200,169,106,0.15) 60%, transparent 100%)`,
          backgroundSize: `${shimmerWidth}% 100%`,
          backgroundRepeat: "no-repeat",
        }}
        animate={{
          backgroundPosition: ["200% 0", "-200% 0"],
        }}
        transition={{
          duration: speed,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      <span className="relative z-10">{children}</span>
    </span>
  );
}
