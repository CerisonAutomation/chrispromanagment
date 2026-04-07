/**
 * db.ts — Server-only Supabase service-role client
 *
 * Use this for:
 *   - Server Components, API Routes, Server Actions that need full DB access
 *   - Bypasses RLS (use only in trusted server contexts)
 *
 * The service-role key is read from the SUPABASE_SERVICE_ROLE_KEY env var,
 * which itself should be set in Vercel and mirrors the value stored in Vault.
 *
 * For reading other secrets at runtime use: import { getSecret } from '@/lib/vault'
 */
import 'server-only';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

/**
 * Server-side Supabase client with service_role privileges.
 * - Full RLS bypass
 * - Never expose to browser
 * NOTE: Lazily validates env vars per-request rather than at module load
 *       to prevent build-time crashes when env vars are injected at runtime.
 */
function getDb() {
  if (!url || !serviceKey) {
    throw new Error(
      '[db] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. ' +
      'Set them in Vercel Dashboard → Settings → Environment Variables.',
    );
  }
  return createClient<Database>(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export const db = (() => {
  // Return a proxy that lazily calls getDb() on first property access
  // so module-level import never throws during `next build`.
  let _client: ReturnType<typeof createClient<Database>> | null = null;
  const handler: ProxyHandler<object> = {
    get(_target, prop, receiver) {
      if (!_client) _client = getDb();
      return Reflect.get(_client as object, prop, receiver);
    },
  };
  return new Proxy({} as ReturnType<typeof createClient<Database>>, handler);
})();

/** Typed table helpers */
export type CmsPage = Database['public']['Tables']['cms_pages']['Row'];
export type CmsPageInsert = Database['public']['Tables']['cms_pages']['Insert'];
export type CmsPageUpdate = Database['public']['Tables']['cms_pages']['Update'];

/**
 * cmsPage — Prisma-style helper object for CMS pages.
 * Wraps Supabase queries with familiar findMany/findUnique/upsert/delete API.
 */
export const cmsPage = {
  async findMany() {
    const { data, error } = await db
      .from('cms_pages')
      .select('*')
      .order('updated_at', { ascending: false });
    if (error) throw new Error(`[db] cmsPage.findMany: ${error.message}`);
    return data ?? [];
  },

  async findUnique({ where }: { where: { slug: string } }) {
    const { data, error } = await db
      .from('cms_pages')
      .select('*')
      .eq('slug', where.slug)
      .single();
    if (error && error.code !== 'PGRST116') {
      throw new Error(`[db] cmsPage.findUnique: ${error.message}`);
    }
    return data ?? null;
  },

  async upsert(page: {
    slug: string;
    title: string;
    data: string;
    theme?: string;
    published?: boolean;
  }) {
    const { data, error } = await db
      .from('cms_pages')
      .upsert(
        {
          slug: page.slug,
          title: page.title,
          data: page.data,
          theme: page.theme ?? '{}',
          published: page.published ?? false,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'slug' },
      )
      .select()
      .single();
    if (error) throw new Error(`[db] cmsPage.upsert: ${error.message}`);
    return data;
  },

  async delete({ where }: { where: { slug: string } }) {
    const { error } = await db
      .from('cms_pages')
      .delete()
      .eq('slug', where.slug);
    if (error) throw new Error(`[db] cmsPage.delete: ${error.message}`);
    return { success: true };
  },
};
