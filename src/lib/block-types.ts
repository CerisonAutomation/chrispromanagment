/**
 * @fileoverview Block type shims — legacy compatibility layer.
 *
 * All types have been migrated to `src/types/puck.ts`.
 * This file exists solely to prevent import breakage in files that
 * still reference '@/lib/block-types'. Migrate callsites to '@/types'.
 *
 * @deprecated Import from '@/types' instead.
 */

export type {
  PuckData as BlockData,
  PuckData,
  ComponentData as BlockItem,
  PageListItem,
} from '@/types';

import type { PuckData } from '@/types';

/**
 * Create an empty Puck data structure.
 * @deprecated Use `{ content: [], root: { props: { title } } }` inline.
 */
export function createEmptyBlockData(title = 'Untitled'): PuckData {
  return {
    content: [],
    root: { props: { title } },
  };
}

/**
 * Type-guard: returns true if `data` conforms to the PuckData shape.
 */
export function isValidBlockData(data: unknown): data is PuckData {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return Array.isArray(d.content) && d.root !== null && typeof d.root === 'object';
}
