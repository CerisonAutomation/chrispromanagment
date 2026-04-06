"use client";

import {cn} from "@/lib/utils";
import {AnimatePresence, motion} from "framer-motion";
import React, {useCallback, useEffect, useState} from "react";

interface MorphingTextProps {
  texts: string[];
  className?: string;
  interval?: number;
}

export function MorphingText({
  texts,
  className,
  interval = 3000,
}: MorphingTextProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const next = useCallback(() => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % texts.length);
      setIsAnimating(false);
    }, 300);
  }, [texts.length]);

  useEffect(() => {
    const timer = setInterval(next, interval);
    return () => clearInterval(timer);
  }, [next, interval]);

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={texts[currentIndex]}
        className={cn("inline-block", className)}
        initial={{ opacity: 0, filter: "blur(8px)", y: 10 }}
        animate={{
          opacity: isAnimating ? 0 : 1,
          filter: isAnimating ? "blur(8px)" : "blur(0px)",
          y: isAnimating ? -10 : 0,
        }}
        exit={{ opacity: 0, filter: "blur(8px)", y: -10 }}
        transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
      >
        {texts[currentIndex]}
      </motion.span>
    </AnimatePresence>
  );
}
