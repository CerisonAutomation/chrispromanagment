/**
 * @fileoverview Database Queries — Canonical query patterns
 */
import { cmsPages, properties, reservations, media } from './schema.js';
import { eq, desc, and, ilike } from 'drizzle-orm';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Database client using Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// ─── CMS Pages ─────────────────────────────────────────────────────────────

export async function getAllPages() {
  const { data, error } = await supabase.from('cms_pages').select('*').order('updated_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getPageBySlug(slug: string) {
  const { data, error } = await supabase.from('cms_pages').select('*').eq('slug', slug).single();
  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

export async function createPage(data: Record<string, unknown>) {
  const { data: result, error } = await supabase.from('cms_pages').insert(data).select();
  if (error) throw error;
  return result || [];
}

export async function updatePage(id: string, data: Record<string, unknown>) {
  const { data: result, error } = await supabase.from('cms_pages').update({ ...data, updated_at: new Date().toISOString() }).eq('id', id).select();
  if (error) throw error;
  return result || [];
}

export async function deletePage(id: string) {
  const { data: result, error } = await supabase.from('cms_pages').delete().eq('id', id).select();
  if (error) throw error;
  return result || [];
}

// ─── Properties ────────────────────────────────────────────────────────────

export async function getAllProperties() {
  const { data, error } = await supabase.from('properties').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getPropertyById(id: string) {
  const { data, error } = await supabase.from('properties').select('*').eq('id', id).single();
  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

export async function getPropertyByGuestyId(guestyId: string) {
  const { data, error } = await supabase.from('properties').select('*').eq('guesty_id', guestyId).single();
  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

export async function createProperty(data: any) {
  const { data: result, error } = await supabase.from('properties').insert(data).select();
  if (error) throw error;
  return result || [];
}

export async function updateProperty(id: string, data: any) {
  const { data: result, error } = await supabase.from('properties').update({ ...data, updated_at: new Date().toISOString() }).eq('id', id).select();
  if (error) throw error;
  return result || [];
}

// ─── Media ─────────────────────────────────────────────────────────────────

export async function getAllMedia(folder?: string) {
  let query = supabase.from('media').select('*').order('created_at', { ascending: false });
  if (folder) {
    query = query.eq('folder', folder);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function createMedia(data: any) {
  const { data: result, error } = await supabase.from('media').insert(data).select();
  if (error) throw error;
  return result || [];
}

export async function deleteMedia(id: string) {
  const { data: result, error } = await supabase.from('media').delete().eq('id', id).select();
  if (error) throw error;
  return result || [];
}
