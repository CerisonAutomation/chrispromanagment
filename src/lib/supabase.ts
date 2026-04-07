/**
 * Canonical Supabase client factory.
 * - Server Components / API Routes → import { db } from '@/lib/db'
 * - Client Components              → import { createBrowserSupabaseClient } from '@/lib/supabase'
 */
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/** Browser-safe client — uses anon key, subject to RLS */
export function createBrowserSupabaseClient() {
  return createClient<Database>(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

/** Singleton for use in client components */
let _browserClient: ReturnType<typeof createBrowserSupabaseClient> | null = null;
export function getBrowserSupabaseClient() {
  if (!_browserClient) _browserClient = createBrowserSupabaseClient();
  return _browserClient;
}

/**
 * Typed Supabase table helpers.
 * These mirror the old `db.cmsPage.*` Prisma pattern.
 */
export type CmsPage = Database['public']['Tables']['cms_pages']['Row'];
export type CmsPageInsert = Database['public']['Tables']['cms_pages']['Insert'];
export type CmsPageUpdate = Database['public']['Tables']['cms_pages']['Update'];

// ─── Server-side page queries (using anon client with RLS) ───────────────────

/**
 * Fetch all published CMS pages. Used by sitemap, admin listing, catch-all routes.
 */
export async function getAllPages(): Promise<CmsPage[]> {
  const client = createClient<Database>(url, anonKey);
  const { data, error } = await client
    .from('cms_pages')
    .select('*')
    .order('updated_at', { ascending: false });
  if (error) throw new Error(`[supabase] getAllPages: ${error.message}`);
  return data ?? [];
}

/**
 * Fetch a single CMS page by slug.
 */
export async function getPageBySlug(slug: string): Promise<CmsPage | null> {
  const client = createClient<Database>(url, anonKey);
  const { data, error } = await client
    .from('cms_pages')
    .select('*')
    .eq('slug', slug)
    .single();
  if (error && error.code !== 'PGRST116') {
    throw new Error(`[supabase] getPageBySlug(${slug}): ${error.message}`);
  }
  return data ?? null;
}
