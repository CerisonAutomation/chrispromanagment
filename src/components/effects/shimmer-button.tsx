"use client";

import {cn} from "@/lib/utils";
import {motion} from "framer-motion";
import React, {type ReactNode} from "react";

interface ShimmerButtonProps {
  children: ReactNode;
  className?: string;
  shimmerColor?: string;
  shimmerSize?: string;
  borderRadius?: string;
  shimmerDuration?: number;
  background?: string;
  onClick?: () => void;
}

export function ShimmerButton({
  children,
  className,
  shimmerColor = "rgba(200, 169, 106, 0.3)",
  shimmerSize = "0.1em",
  borderRadius = "0.5rem",
  shimmerDuration = 2,
  background = "var(--cpm-accent)",
  onClick,
}: ShimmerButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        "group relative inline-flex items-center justify-center overflow-hidden",
        "transition-all duration-300",
        className
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Shimmer layer */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ borderRadius }}
        aria-hidden="true"
      >
        <div
          className="absolute inset-[-100%] animate-[shimmer_3s_linear_infinite]"
          style={{
            background: `linear-gradient(90deg, transparent 25%, ${shimmerColor} 50%, transparent 75%)`,
            backgroundSize: "200% 100%",
            animationDuration: `${shimmerDuration}s`,
          }}
        />
      </div>

      {/* Content */}
      <div
        className="relative z-10 flex items-center gap-2 px-8 py-3.5"
        style={{
          background,
          borderRadius,
        }}
      >
        {children}
      </div>
    </motion.button>
  );
}
