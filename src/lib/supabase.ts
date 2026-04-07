/**
 * @fileoverview Supabase singleton clients — browser + server.
 *
 * ⚠️  Never import `supabaseAdmin` from 'use client' files.
 *     It carries the service-role key and bypasses RLS.
 *
 * Usage:
 *   import { supabase } from '@/lib/supabase';          // browser-safe
 *   import { supabaseAdmin } from '@/lib/supabase';     // server-only
 */
import { createClient } from '@supabase/supabase-js';
import { env } from './env';
import type { CmsPage, PuckData } from '@/types';

// ─── Clients ──────────────────────────────────────────────────────────────────

/** Anon client — browser-safe, full RLS enforcement. */
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true },
});

/**
 * Service-role admin client — SERVER ONLY.
 * Bypasses Row Level Security. Never expose to the client bundle.
 */
export const supabaseAdmin = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_KEY || env.SUPABASE_ANON_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

// ─── Constants ────────────────────────────────────────────────────────────────

export const EMPTY_PUCK_DATA: PuckData = { content: [], root: { props: {} } };

/** @deprecated Use EMPTY_PUCK_DATA */
export const EMPTY_DATA = EMPTY_PUCK_DATA;

// ─── Page Helpers ─────────────────────────────────────────────────────────────

/**
 * Returns all CMS pages ordered by most recently updated.
 * Uses the admin client — call only from Server Components or Route Handlers.
 */
export async function getAllPages(): Promise<CmsPage[]> {
  const { data, error } = await supabaseAdmin
    .from('cms_pages')
    .select('id,slug,title,published,theme,updated_at')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('[DB] getAllPages:', error.message);
    return [];
  }
  return (data ?? []) as CmsPage[];
}

/**
 * Returns a single published CMS page by slug, or `null` if not found.
 */
export async function getPageBySlug(slug: string): Promise<CmsPage | null> {
  if (!slug) return null;
  const { data, error } = await supabaseAdmin
    .from('cms_pages')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.error(`[DB] getPageBySlug(${slug}):`, error.message);
    return null;
  }
  return (data as CmsPage | null);
}

/**
 * Creates or updates a CMS page by slug (upsert on conflict).
 * Returns `true` on success, `false` on error.
 */
export async function upsertPage(
  slug: string,
  payload: Partial<Omit<CmsPage, 'id' | 'created_at'>>
): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('cms_pages')
    .upsert(
      { slug, ...payload, updated_at: new Date().toISOString() },
      { onConflict: 'slug' }
    );

  if (error) {
    console.error(`[DB] upsertPage(${slug}):`, error.message);
    return false;
  }
  return true;
}

/**
 * Permanently deletes a CMS page by slug.
 * Returns `true` on success, `false` on error.
 */
export async function deletePage(slug: string): Promise<boolean> {
  if (!slug) return false;
  const { error } = await supabaseAdmin
    .from('cms_pages')
    .delete()
    .eq('slug', slug);

  if (error) {
    console.error(`[DB] deletePage(${slug}):`, error.message);
    return false;
  }
  return true;
}

/**
 * Publishes a page — sets `published = true` and bumps `updated_at`.
 */
export async function publishPage(slug: string): Promise<boolean> {
  return upsertPage(slug, { published: true });
}

/**
 * Unpublishes a page — sets `published = false`.
 */
export async function unpublishPage(slug: string): Promise<boolean> {
  return upsertPage(slug, { published: false });
}
