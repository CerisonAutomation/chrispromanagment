// =============================================================================
// DB / SUPABASE TABLE SHAPES
// Mirror of Postgres schema — used by supabase.ts helpers.
// Keep in sync with Supabase migrations.
// =============================================================================
import type { PuckData } from './puck';

/**
 * Mirrors the `cms_pages` table row.
 * Imported by supabase.ts — never import supabase.ts in 'use client' files.
 */
export interface CmsPage {
  id: string;
  slug: string;
  title: string;
  published: boolean;
  theme?: string;
  content?: PuckData | null;
  meta_title?: string;
  meta_description?: string;
  created_at: string;
  updated_at: string;
}
