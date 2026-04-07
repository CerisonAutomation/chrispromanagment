/**
 * @fileoverview Supabase singleton clients — browser + server.
 * Never import supabaseAdmin in 'use client' files.
 */
import { createClient } from '@supabase/supabase-js';
import { env } from './env';
import type { CmsPage, PuckData } from '@/types';

/** Anon client — browser-safe, RLS enforced */
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true },
});

/** Service role client — SERVER ONLY, bypasses RLS */
export const supabaseAdmin = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_KEY || env.SUPABASE_ANON_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

const EMPTY_DATA: PuckData = { content: [], root: { props: {} } };

// ─── Page helpers ─────────────────────────────────────────────────────────────

export async function getAllPages(): Promise<CmsPage[]> {
  const { data, error } = await supabaseAdmin
    .from('cms_pages')
    .select('id,slug,title,published,theme,updated_at')
    .order('updated_at', { ascending: false });
  if (error) { console.error('[DB] getAllPages:', error.message); return []; }
  return (data ?? []) as CmsPage[];
}

export async function getPageBySlug(slug: string): Promise<CmsPage | null> {
  const { data, error } = await supabaseAdmin
    .from('cms_pages').select('*').eq('slug', slug).maybeSingle();
  if (error) { console.error(`[DB] getPageBySlug(${slug}):`, error.message); return null; }
  return data as CmsPage | null;
}

export async function upsertPage(
  slug: string, payload: Partial<Omit<CmsPage, 'id' | 'created_at'>>
): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('cms_pages')
    .upsert({ slug, ...payload, updated_at: new Date().toISOString() }, { onConflict: 'slug' });
  if (error) { console.error(`[DB] upsertPage(${slug}):`, error.message); return false; }
  return true;
}

export async function deletePage(slug: string): Promise<boolean> {
  const { error } = await supabaseAdmin.from('cms_pages').delete().eq('slug', slug);
  if (error) { console.error(`[DB] deletePage(${slug}):`, error.message); return false; }
  return true;
}

export { EMPTY_DATA };
