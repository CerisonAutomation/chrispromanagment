/**
 * Server actions for property management
 * @fileoverview Properties CRUD and sync actions
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

/**
 * Create a new property
 */
export async function createProperty(
  data: Record<string, unknown>
): Promise<{ success: boolean; message: string; id?: string }> {
  const supabase = await getServiceClient();
  
  const { data: result, error } = await (supabase as any)
    .from('properties')
    .insert({
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error) {
    console.error('[createProperty] Error:', error);
    throw new Error(`Failed to create property: ${error.message}`);
  }

  revalidatePath('/properties');
  revalidatePath('/admin');
  
  return { 
    success: true, 
    message: 'Property created successfully',
    id: result?.id 
  };
}

/**
 * Update property data
 */
export async function updateProperty(
  id: string,
  data: Record<string, unknown>
): Promise<{ success: boolean; message: string }> {
  const supabase = await getServiceClient();
  
  const { error } = await (supabase as any)
    .from('properties')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    console.error('[updateProperty] Error:', error);
    throw new Error(`Failed to update property: ${error.message}`);
  }

  revalidatePath('/properties');
  revalidatePath(`/properties/${id}`);
  revalidatePath('/admin');
  
  return { success: true, message: 'Property updated successfully' };
}

/**
 * Delete a property
 */
export async function deleteProperty(
  id: string
): Promise<{ success: boolean; message: string }> {
  const supabase = await getServiceClient();
  
  const { error } = await (supabase as any)
    .from('properties')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[deleteProperty] Error:', error);
    throw new Error(`Failed to delete property: ${error.message}`);
  }

  revalidatePath('/properties');
  revalidatePath('/admin');
  
  return { success: true, message: 'Property deleted successfully' };
}

/**
 * Toggle property featured status
 */
export async function togglePropertyFeatured(
  id: string,
  featured: boolean
): Promise<{ success: boolean; featured: boolean; message: string }> {
  const supabase = await getServiceClient();
  
  const { error } = await (supabase as any)
    .from('properties')
    .update({ featured, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to toggle featured status: ${error.message}`);
  }

  revalidatePath('/properties');
  revalidatePath(`/properties/${id}`);
  
  return { 
    success: true, 
    featured, 
    message: `Property ${featured ? 'featured' : 'unfeatured'}` 
  };
}

/**
 * Update property availability
 */
export async function updatePropertyAvailability(
  id: string,
  available: boolean
): Promise<{ success: boolean; message: string }> {
  const supabase = await getServiceClient();
  
  const { error } = await (supabase as any)
    .from('properties')
    .update({ available, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to update availability: ${error.message}`);
  }

  revalidatePath('/properties');
  
  return { success: true, message: `Property ${available ? 'available' : 'unavailable'}` };
}
