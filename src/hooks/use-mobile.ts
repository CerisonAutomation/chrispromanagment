'use client';
import { useMediaQuery } from './useMediaQuery';

/** Returns `true` when viewport width is ≤ 768px. */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 768px)');
}
