/**
 * @fileoverview Supabase singleton clients — browser + server safe.
 * Project: supabase-citrine-saddle (mohpkakmpagvbqsehwhp) — ACTIVE_HEALTHY
 *
 * Browser client: anon key, RLS enforced
 * Admin client:   service role, bypasses RLS — SERVER ONLY, never import in 'use client'
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '[Supabase] FATAL: Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY env vars.'
  );
}

/** Browser-safe singleton — anon key, RLS enforced */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true, autoRefreshToken: true },
});

/** Server-only admin singleton — service role, never expose to client */
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? supabaseAnonKey,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// ─── CMS Page types ──────────────────────────────────────────
export interface CmsPage {
  id: string;
  slug: string;
  title: string;
  data: Record<string, unknown>;
  published: boolean;
  theme: string;
  created_at: string;
  updated_at: string;
}

// ─── Safe helpers — NEVER throw, always return [] on error ───

/** Load all CMS pages — safe, returns [] on error */
export async function getAllPages(): Promise<CmsPage[]> {
  const { data, error } = await supabaseAdmin
    .from('cms_pages')
    .select('id, slug, title, published, theme, updated_at')
    .order('updated_at', { ascending: false });
  if (error) {
    console.error('[Supabase] getAllPages error:', error.message);
    return [];
  }
  return (data ?? []) as CmsPage[];
}

/** Load single page by slug — safe, returns null on miss */
export async function getPageBySlug(slug: string): Promise<CmsPage | null> {
  const { data, error } = await supabaseAdmin
    .from('cms_pages')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  if (error) {
    console.error(`[Supabase] getPageBySlug(${slug}) error:`, error.message);
    return null;
  }
  return data as CmsPage | null;
}

/** Upsert a page — safe, returns success boolean */
export async function upsertPage(
  slug: string,
  payload: Partial<CmsPage>
): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('cms_pages')
    .upsert({ slug, ...payload, updated_at: new Date().toISOString() }, { onConflict: 'slug' });
  if (error) {
    console.error(`[Supabase] upsertPage(${slug}) error:`, error.message);
    return false;
  }
  return true;
}
