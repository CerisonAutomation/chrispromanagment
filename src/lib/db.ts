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

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!url || !serviceKey) {
  throw new Error(
    '[db] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. ' +
    'Set them in Vercel Dashboard → Settings → Environment Variables.'
  );
}

/**
 * Server-side Supabase client with service_role privileges.
 * - Full RLS bypass
 * - Never expose to browser
 */
export const db = createClient<Database>(url, serviceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

/** Typed table helpers */
export type CmsPage = Database['public']['Tables']['cms_pages']['Row'];
export type CmsPageInsert = Database['public']['Tables']['cms_pages']['Insert'];
export type CmsPageUpdate = Database['public']['Tables']['cms_pages']['Update'];
export type GuestyListing = Database['public']['Tables']['guesty_listings_cache']['Row'];
export type GuestyReservation = Database['public']['Tables']['guesty_reservations']['Row'];
export type GuestyGuest = Database['public']['Tables']['guesty_guests']['Row'];
