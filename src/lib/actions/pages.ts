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

export interface PageVersion {
  id: string;
  page_id: string;
  data: Data;
  title: string;
  created_at: string;
}

// Version control helper: Save current state before update
async function saveVersion(supabase: any, pageId: string, data: any, title: string) {
  await supabase
    .from('cms_page_versions')
    .insert({
      page_id: pageId,
      data: JSON.stringify(data),
      title,
      created_by: 'system',
    });
}

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
): Promise<{ success: boolean; message: string; version?: PageVersion }> {
  const supabase = await getServiceClient();
  
  const title = data.root?.props?.title ?? 'Untitled';
  const theme = '{}';
  
  // 1. Get current page to create version
  const { data: currentPage } = await (supabase as any)
    .from('cms_pages')
    .select('id, data, title')
    .eq('slug', slug)
    .single();
  
  // 2. Save current state as version (for rollback)
  if (currentPage?.id) {
    await saveVersion(supabase, currentPage.id, currentPage.data, currentPage.title || 'Untitled');
  }
  
  // 3. Upsert the page with new data
  const { data: upserted, error } = await (supabase as any)
    .from('cms_pages')
    .upsert({
      slug,
      title,
      data: JSON.stringify(data),
      theme,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'slug' })
    .select()
    .single();

  if (error) {
    console.error('[updatePageData] Error:', error);
    throw new Error(`Failed to save page: ${error.message}`);
  }

  // Revalidate paths
  revalidatePath(`/${slug}`);
  revalidatePath('/admin/pages');
  
  return { 
    success: true, 
    message: `Page "${title}" saved successfully`,
    version: upserted 
  };
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
 * Get page versions for rollback
 */
export async function getPageVersions(
  slug: string
): Promise<PageVersion[]> {
  const supabase = await getServiceClient();
  
  // First get the page ID
  const { data: page } = await (supabase as any)
    .from('cms_pages')
    .select('id')
    .eq('slug', slug)
    .single();
    
  if (!page?.id) return [];
    
  const { data, error } = await (supabase as any)
    .from('cms_page_versions')
    .select('*')
    .eq('page_id', page.id)
    .order('created_at', { ascending: false })
    .limit(20);
    
  if (error) {
    console.error('[getPageVersions] Error:', error);
    return [];
  }
    
  return data ?? [];
}

/**
 * Rollback to a specific version
 */
export async function rollbackToVersion(
  versionId: string,
  slug: string
): Promise<{ success: boolean; message: string }> {
  const supabase = await getServiceClient();
    
  // Get the version
  const { data: version } = await (supabase as any)
    .from('cms_page_versions')
    .select('*')
    .eq('id', versionId)
    .single();
    
  if (!version) {
    return { success: false, message: 'Version not found' };
  }
    
  // Save current state as a version first (for undo)
  const { data: currentPage } = await (supabase as any)
    .from('cms_pages')
    .select('id, data, title')
    .eq('slug', slug)
    .single();
    
  if (currentPage?.id) {
    await saveVersion(supabase, currentPage.id, currentPage.data, currentPage.title || 'Untitled');
  }
    
  // Restore the version
  const { error } = await (supabase as any)
    .from('cms_pages')
    .update({
      data: version.data,
      title: version.title,
      updated_at: new Date().toISOString(),
    })
    .eq('slug', slug);
    
  if (error) {
    return { success: false, message: `Rollback failed: ${error.message}` };
  }
    
  revalidatePath(`/${slug}`);
  revalidatePath('/admin/pages');
    
  return { 
    success: true, 
    message: `Rolled back to version from ${new Date(version.created_at).toLocaleString()}` 
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
