'use client';
import { useState, useEffect } from 'react';

/**
 * Returns a debounced copy of `value` that updates only after `delay` ms
 * of inactivity. Ideal for search inputs.
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}
