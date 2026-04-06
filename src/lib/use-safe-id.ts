"use client";

import {useState} from "react";

let idCounter = 0;

export function useSafeId(): string {
  const [id] = useState(() => {
    return `puck-${++idCounter}`;
  });
  
  return id;
}

export function generateSafeId(prefix?: string): string {
  return `${prefix || "puck"}-${++idCounter}`;
}
