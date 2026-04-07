/**
 * Canonical Supabase server client — replaces the broken Prisma/SQLite setup.
 * Import `db` anywhere in Server Components or API routes.
 * For browser/client components use `createBrowserClient` from @/lib/supabase.
 */
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    '[db.ts] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars. ' +
    'Add them to .env.local — see supabase/schema.sql for the required table.'
  );
}

/**
 * Server-side Supabase client using the service role key.
 * NEVER expose this to the browser — server/API routes only.
 */
export const db = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

/**
 * Convenience accessor that mimics the old Prisma cmsPage shape
 * so existing API routes require zero refactoring.
 */
export const cmsPage = {
  async findUnique({ where, include }: { where: { slug: string }; include?: Record<string, unknown> }) {
    const { data, error } = await db
      .from('cms_pages')
      .select(include?.versions ? '*, cms_page_versions(*)' : '*')
      .eq('slug', where.slug)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async findMany(opts?: { where?: Partial<{ published: boolean }>; orderBy?: Record<string, string> }) {
    let query = db.from('cms_pages').select('*');
    if (opts?.where?.published !== undefined) {
      query = query.eq('published', opts.where.published);
    }
    query = query.order('updated_at', { ascending: false });
    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
  },

  async upsert(values: {
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
          slug: values.slug,
          title: values.title,
          data: values.data,
          theme: values.theme ?? 'malta-gold',
          published: values.published ?? false,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'slug' }
      )
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete({ where }: { where: { slug: string } }) {
    const { error } = await db.from('cms_pages').delete().eq('slug', where.slug);
    if (error) throw error;
  },
};
