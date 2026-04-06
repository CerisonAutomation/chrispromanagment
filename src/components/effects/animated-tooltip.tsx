"use client";

import { cn } from "@/lib/utils";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import React, { useRef, type ReactNode } from "react";

interface AnimatedTooltipProps {
  items: {
    id: number;
    name: string;
    designation?: string;
    image?: string;
  }[];
  className?: string;
}

function TooltipItem({ item }: { item: { id: number; name: string; designation?: string; image?: string } }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const xSpring = useSpring(x, { stiffness: 300, damping: 20 });
  const ySpring = useSpring(y, { stiffness: 300, damping: 20 });

  const transform = useTransform([xSpring, ySpring], ([latestX, latestY]) => {
    const moveX = latestX * 10;
    const moveY = latestY * 10;
    return `translateX(${moveX}px) translateY(${moveY}px)`;
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  return (
    <div className="group relative -mr-4">
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        initial={{ opacity: 0, y: 20, scale: 0.6 }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            type: "spring",
            stiffness: 260,
            damping: 10,
          },
        }}
        exit={{ opacity: 0, y: 20, scale: 0.6 }}
        style={{
          transform,
        }}
        whileHover={{ scale: 1.08 }}
        className="relative flex items-center justify-center"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-cpm-accent/40 bg-cpm-bg-secondary text-sm font-bold text-cpm-accent">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            item.name.charAt(0).toUpperCase()
          )}
        </div>
      </motion.div>
    </div>
  );
}

export function AnimatedTooltip({ items, className }: AnimatedTooltipProps) {
  return (
    <div className={cn("flex items-center", className)}>
      {items.map((item) => (
        <TooltipItem key={item.id} item={item} />
      ))}
    </div>
  );
}
