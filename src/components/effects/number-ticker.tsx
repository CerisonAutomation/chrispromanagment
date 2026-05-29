"use client";

import {cn} from "@/lib/utils";
import {motion} from "framer-motion";
import React, {type ReactNode} from "react";

interface NumberTickerProps {
  value: number;
  className?: string;
  direction?: "up" | "down";
  delay?: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}

export function NumberTicker({
  value,
  className,
  direction = "up",
  delay = 0,
  duration = 1.5,
  prefix = "",
  suffix = "",
}: NumberTickerProps) {
  return (
    <span className={cn("inline-block tabular-nums", className)}>
      {prefix}
      <motion.span
        initial={{ opacity: 0, y: direction === "up" ? 20 : -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay, duration, ease: [0.21, 0.47, 0.32, 0.98] }}
      >
        <Counter value={value} duration={duration} />
      </motion.span>
      {suffix}
    </span>
  );
}

function Counter({ value, duration }: { value: number; duration: number }) {
  const [display, setDisplay] = React.useState(0);

  React.useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setDisplay(value);
      return;
    }

    let startTime: number | null = null;
    let frame: number;

    const animate = (time: number) => {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / (duration * 1000), 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return <>{display.toLocaleString()}</>;
}

// Marquee component for infinite scrolling
interface MarqueeProps {
  children: ReactNode;
  className?: string;
  reverse?: boolean;
  pauseOnHover?: boolean;
  vertical?: boolean;
  repeat?: number;
}

export function Marquee({
  children,
  className,
  reverse = false,
  pauseOnHover = false,
  vertical = false,
  repeat = 4,
}: MarqueeProps) {
  return (
    <div
      className={cn(
        "group flex overflow-hidden [--gap:1rem] gap-[var(--gap)]",
        vertical ? "flex-col" : "flex-row",
        className
      )}
    >
      {Array.from({ length: repeat }, (_, i) => (
        <motion.div
          key={i}
          className={cn(
            "flex shrink-0 justify-around [gap:var(--gap)]",
            vertical ? "flex-col" : "flex-row"
          )}
          animate={{
            x: vertical ? undefined : (reverse ? [0, "-50%"] : ["-50%", 0]),
            y: vertical ? (reverse ? [0, "-50%"] : ["-50%", 0]) : undefined,
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
          }}
          {...(pauseOnHover && {
            whileHover: { animationPlayState: "paused" },
          })}
        >
          {children}
        </motion.div>
      ))}
    </div>
  );
}
