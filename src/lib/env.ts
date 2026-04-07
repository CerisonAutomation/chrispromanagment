/**
 * @fileoverview Type-safe environment variable validation.
 * Fails fast at module load time — never silently at runtime.
 *
 * Usage: import { env } from '@/lib/env'
 * NEVER use process.env directly in application code.
 */

function required(key: string): string {
  const v = process.env[key];
  if (!v || v.trim() === '') {
    throw new Error(
      `[ENV] Missing required environment variable: ${key}\n` +
      `  → Add it to .env.local (dev) or the Vercel Dashboard (prod).`
    );
  }
  return v.trim();
}

function optional(key: string, fallback = ''): string {
  return process.env[key]?.trim() ?? fallback;
}

export const env = {
  // ─── Supabase (required) ────────────────────────────────────────────────
  SUPABASE_URL:        required('NEXT_PUBLIC_SUPABASE_URL'),
  SUPABASE_ANON_KEY:   required('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  SUPABASE_SERVICE_KEY: optional('SUPABASE_SERVICE_ROLE_KEY'),

  // ─── Guesty OAuth2 (required for booking features) ──────────────────────
  GUESTY_CLIENT_ID:     required('GUESTY_CLIENT_ID'),
  GUESTY_CLIENT_SECRET: required('GUESTY_CLIENT_SECRET'),
  GUESTY_API_URL:       optional('GUESTY_API_URL', 'https://open-api.guesty.com'),

  // ─── Site ────────────────────────────────────────────────────────────────
  SITE_URL:  optional('NEXT_PUBLIC_SITE_URL', 'https://chrispropmanagment.vercel.app'),
  NODE_ENV:  optional('NODE_ENV', 'development') as 'development' | 'production' | 'test',
  IS_PROD:   process.env.NODE_ENV === 'production',
} as const;
