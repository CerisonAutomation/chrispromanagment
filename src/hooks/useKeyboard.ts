'use client';
import { useEffect } from 'react';

type KeyHandler = (e: KeyboardEvent) => void;
type KeyMap = Record<string, KeyHandler>;

/**
 * Binds keyboard shortcuts declaratively.
 * Key format: 'ctrl+s', 'meta+z', 'escape', 'enter'
 */
export function useKeyboard(keyMap: KeyMap, enabled = true): void {
  useEffect(() => {
    if (!enabled) return;
    const handler = (e: KeyboardEvent) => {
      const parts: string[] = [];
      if (e.ctrlKey) parts.push('ctrl');
      if (e.metaKey) parts.push('meta');
      if (e.altKey) parts.push('alt');
      if (e.shiftKey) parts.push('shift');
      parts.push(e.key.toLowerCase());
      const combo = parts.join('+');
      if (keyMap[combo]) {
        keyMap[combo](e);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [keyMap, enabled]);
}
