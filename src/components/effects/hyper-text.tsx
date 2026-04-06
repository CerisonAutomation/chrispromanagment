"use client";

import {cn} from "@/lib/utils";
import React, {type ReactNode} from "react";

interface HyperTextProps {
  children: ReactNode;
  className?: string;
  as?: "span" | "a" | "h1" | "h2" | "h3" | "h4" | "p";
}

export function HyperText({
  children,
  className,
  as: Component = "span",
}: HyperTextProps) {
  return (
    <Component
      className={cn(
        "relative inline-block bg-clip-text text-transparent transition-all duration-300",
        "bg-gradient-to-r from-cpm-accent via-cpm-text-primary to-cpm-accent",
        "bg-[length:200%_auto] hover:bg-[position:100%_center]",
        className
      )}
    >
      {children}
    </Component>
  );
}
