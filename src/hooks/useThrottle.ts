'use client';
import { useRef, useCallback } from 'react';

/**
 * Returns a throttled version of `fn` that fires at most once per `ms` ms.
 */
export function useThrottle<T extends (...args: unknown[]) => void>(fn: T, ms = 200): T {
  const lastCall = useRef(0);
  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCall.current >= ms) {
        lastCall.current = now;
        fn(...args);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fn, ms]
  ) as T;
}
