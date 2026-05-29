"use client";

import {cn} from "@/lib/utils";
import {motion, type Variants} from "framer-motion";
import React, {type ReactNode} from "react";

interface BlurFadeProps {
  children: ReactNode;
  className?: string;
  variant?: {
    hidden: { filter: string; opacity: number; y: number };
    visible: { filter: string; opacity: number; y: number };
  };
  duration?: number;
  delay?: number;
  yOffset?: number;
  inView?: boolean;
  inViewMargin?: string;
  blur?: string;
}

const BlurFade = React.forwardRef<HTMLDivElement, BlurFadeProps>(
  (
    {
      children,
      className,
      variant,
      duration = 0.4,
      delay = 0,
      yOffset = 6,
      inView = true,
      inViewMargin = "-50px",
      blur = "8px",
    },
    ref
  ) => {
    const defaultVariant: Variants = variant || {
      hidden: {
        filter: `blur(${blur})`,
        opacity: 0,
        y: yOffset,
      },
      visible: {
        filter: "blur(0px)",
        opacity: 1,
        y: 0,
      },
    };

    return (
      <motion.div
        ref={ref}
        className={cn(className)}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        whileInView={inView ? "visible" : undefined}
        viewport={{ once: true, margin: inViewMargin }}
        transition={{
          delay,
          duration,
          ease: [0.21, 0.47, 0.32, 0.98],
        }}
        variants={defaultVariant}
      >
        {children}
      </motion.div>
    );
  }
);
BlurFade.displayName = "BlurFade";

export { BlurFade };
