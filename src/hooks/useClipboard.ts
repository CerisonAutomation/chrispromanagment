'use client';
import { useState, useCallback } from 'react';

/**
 * Returns `{ copy, copied }` for clipboard interactions.
 * `copied` auto-resets to `false` after `resetMs` (default 2000).
 */
export function useClipboard(resetMs = 2000) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), resetMs);
        return true;
      } catch {
        return false;
      }
    },
    [resetMs]
  );

  return { copy, copied };
}
