/**
 * Server actions for media management
 * @fileoverview Media CRUD and organization actions
 */

'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

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

interface MediaUploadData {
  url: string;
  filename: string;
  folder?: string;
  mimeType?: string;
  size?: number;
  width?: number;
  height?: number;
}

/**
 * Register media upload in database
 */
export async function registerMediaUpload(
  data: MediaUploadData
): Promise<{ success: boolean; message: string; id?: string }> {
  const supabase = await getServiceClient();
  
  const { data: result, error } = await (supabase as any)
    .from('media')
    .insert({
      url: data.url,
      filename: data.filename,
      folder: data.folder ?? 'uploads',
      mime_type: data.mimeType ?? 'application/octet-stream',
      size: data.size ?? 0,
      width: data.width,
      height: data.height,
      created_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error) {
    console.error('[registerMediaUpload] Error:', error);
    throw new Error(`Failed to register media: ${error.message}`);
  }

  revalidatePath('/admin');
  revalidatePath('/api/media');
  
  return { 
    success: true, 
    message: 'Media uploaded successfully',
    id: result?.id 
  };
}

/**
 * Delete media from database
 */
export async function deleteMedia(
  id: string
): Promise<{ success: boolean; message: string }> {
  const supabase = await getServiceClient();
  
  const { error } = await (supabase as any)
    .from('media')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[deleteMedia] Error:', error);
    throw new Error(`Failed to delete media: ${error.message}`);
  }

  revalidatePath('/admin');
  revalidatePath('/api/media');
  
  return { success: true, message: 'Media deleted successfully' };
}

/**
 * Update media metadata
 */
export async function updateMediaMetadata(
  id: string,
  metadata: { alt?: string; caption?: string; folder?: string }
): Promise<{ success: boolean; message: string }> {
  const supabase = await getServiceClient();
  
  const { error } = await (supabase as any)
    .from('media')
    .update({
      ...metadata,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to update media: ${error.message}`);
  }

  revalidatePath('/admin');
  
  return { success: true, message: 'Media updated successfully' };
}

/**
 * Move media to different folder
 */
export async function moveMediaToFolder(
  id: string,
  folder: string
): Promise<{ success: boolean; message: string }> {
  const supabase = await getServiceClient();
  
  const { error } = await (supabase as any)
    .from('media')
    .update({ folder, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to move media: ${error.message}`);
  }

  revalidatePath('/admin');
  revalidatePath('/api/media');
  
  return { success: true, message: `Media moved to ${folder}` };
}
