/**
 * Server actions for page management
 * @fileoverview Pages CRUD and publish/unpublish actions
 */

'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import type { Data } from '@measured/puck';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function getSupabaseClient() {
  return createClient<Database>(url, anonKey);
}

/**
 * Update or create page data
 */
export async function updatePageData(slug: string, data: Data): Promise<void> {
  const supabase = await getSupabaseClient();
  
  const { error } = await supabase
    .from('cms_pages')
    .upsert({
      slug,
      title: data.root?.props?.title ?? 'Untitled',
      data: JSON.stringify(data),
      updated_at: new Date().toISOString(),
    } as any, { onConflict: 'slug' });

  if (error) {
    console.error('[updatePageData] Error:', error);
    throw new Error(`Failed to save page: ${error.message}`);
  }

  revalidatePath(`/${slug}`);
  revalidatePath('/admin/pages');
}

/**
 * Toggle page published state
 */
export async function togglePublish(slug: string, published: boolean): Promise<void> {
  const supabase = await getSupabaseClient();
  
  const { error } = await (supabase as any)
    .from('cms_pages')
    .update({ published, updated_at: new Date().toISOString() })
    .eq('slug', slug);

  if (error) {
    console.error('[togglePublish] Error:', error);
    throw new Error(`Failed to toggle publish state: ${error.message}`);
  }

  revalidatePath(`/${slug}`);
  revalidatePath('/admin/pages');
}

/**
 * Delete a page
 */
export async function deletePage(slug: string): Promise<void> {
  const supabase = await getSupabaseClient();
  
  const { error } = await supabase
    .from('cms_pages')
    .delete()
    .eq('slug', slug);

  if (error) {
    console.error('[deletePage] Error:', error);
    throw new Error(`Failed to delete page: ${error.message}`);
  }

  revalidatePath(`/${slug}`);
  revalidatePath('/admin/pages');
}
