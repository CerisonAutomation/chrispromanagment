/**
 * @fileoverview Canonical Supabase Client — Next.js 16 App Router + Publishable Key Pattern
 * 
 * OFFICIAL PATTERN: @supabase/supabase-js v2 + @supabase/ssr
 * https://supabase.com/docs/guides/auth/server-side/nextjs
 * 
 * ENV VARS:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (new) — OR —
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY (legacy, still supported)
 */
'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// Support both new publishable key and legacy anon key
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY 
  || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/** Browser client for Client Components — cookie-based auth, auto-refresh */
export function createClient() {
  return createBrowserClient<Database>(supabaseUrl, supabaseKey);
}

/** Singleton pattern for React components */
let browserClient: ReturnType<typeof createClient> | null = null;

export function getClient() {
  if (!browserClient) {
    browserClient = createClient();
  }
  return browserClient;
}
