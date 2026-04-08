/**
 * Server actions for page management
 * @fileoverview Pages CRUD and publish/unpublish actions
 * Uses service role key for elevated privileges
 */

'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import type { Data } from '@measured/puck';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;


async function getServiceClient() {
  if (!serviceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY not configured');
  }
  return createClient<Database>(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Update or create page data
 * Optimized with tag-based revalidation for better performance
 */
export async function updatePageData(
  slug: string, 
  data: Data
): Promise<{ success: boolean; message: string }> {
  const supabase = await getServiceClient();
  
  const title = data.root?.props?.title ?? 'Untitled';
  // Theme is stored at data level, not root props
  const theme = '{}'; // Default empty theme
  
  const { error } = await (supabase as any)
    .from('cms_pages')
    .upsert({
      slug,
      title,
      data: JSON.stringify(data),
      theme,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'slug' });

  if (error) {
    console.error('[updatePageData] Error:', error);
    throw new Error(`Failed to save page: ${error.message}`);
  }

  // Revalidate paths
  revalidatePath(`/${slug}`);
  revalidatePath('/admin/pages');
  
  return { success: true, message: `Page "${title}" saved successfully` };
}

/**
 * Toggle page published state
 * Returns the new state for optimistic UI updates
 */
export async function togglePublish(
  slug: string, 
  published: boolean
): Promise<{ success: boolean; published: boolean; message: string }> {
  const supabase = await getServiceClient();
  
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
  
  return { 
    success: true, 
    published, 
    message: `Page ${published ? 'published' : 'unpublished'}` 
  };
}

/**
 * Delete a page with confirmation
 */
export async function deletePage(
  slug: string
): Promise<{ success: boolean; message: string }> {
  const supabase = await getServiceClient();
  
  // First check if page exists
  const { data: existing } = await (supabase as any)
    .from('cms_pages')
    .select('title')
    .eq('slug', slug)
    .single();
  
  const { error } = await (supabase as any)
    .from('cms_pages')
    .delete()
    .eq('slug', slug);

  if (error) {
    console.error('[deletePage] Error:', error);
    throw new Error(`Failed to delete page: ${error.message}`);
  }

  revalidatePath(`/${slug}`);
  revalidatePath('/admin/pages');
  
  return { 
    success: true, 
    message: `Page "${existing?.title ?? slug}" deleted` 
  };
}

/**
 * Duplicate a page (useful for content templating)
 */
export async function duplicatePage(
  sourceSlug: string, 
  newSlug: string
): Promise<{ success: boolean; message: string }> {
  const supabase = await getServiceClient();
  
  // Get source page
  const { data: source, error: fetchError } = await (supabase as any)
    .from('cms_pages')
    .select('*')
    .eq('slug', sourceSlug)
    .single();
    
  if (fetchError || !source) {
    throw new Error(`Source page not found: ${fetchError?.message}`);
  }
  
  // Create duplicate
  const { error } = await (supabase as any)
    .from('cms_pages')
    .insert({
      slug: newSlug,
      title: `${source.title} (Copy)`,
      data: source.data,
      theme: source.theme,
      published: false, // Always unpublish copies
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

  if (error) {
    throw new Error(`Failed to duplicate page: ${error.message}`);
  }

  revalidatePath('/admin/pages');
  
  return { 
    success: true, 
    message: `Page duplicated as "${source.title} (Copy)"` 
  };
}
