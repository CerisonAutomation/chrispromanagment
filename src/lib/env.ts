/**
 * @fileoverview Type-safe env validation — fails fast at startup, never at runtime.
 * Import { env } from '@/lib/env' everywhere. Never use process.env directly.
 */

function required(key: string): string {
  const v = process.env[key];
  if (!v || v.trim() === '') {
    throw new Error(
      `[ENV] Missing required environment variable: ${key}\n` +
      `Add it to .env.local (dev) or Vercel Dashboard (prod).`
    );
  }
  return v.trim();
}

function optional(key: string, fallback = ''): string {
  return process.env[key]?.trim() ?? fallback;
}

export const env = {
  // Supabase
  SUPABASE_URL: required('NEXT_PUBLIC_SUPABASE_URL'),
  SUPABASE_ANON_KEY: required('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  SUPABASE_SERVICE_KEY: optional('SUPABASE_SERVICE_ROLE_KEY'),

  // Guesty
  GUESTY_CLIENT_ID: optional('GUESTY_CLIENT_ID'),
  GUESTY_CLIENT_SECRET: optional('GUESTY_CLIENT_SECRET'),
  GUESTY_API_URL: optional('GUESTY_API_URL', 'https://open-api.guesty.com'),

  // Site
  SITE_URL: optional('NEXT_PUBLIC_SITE_URL', 'https://chrispropmanagment.vercel.app'),
  NODE_ENV: optional('NODE_ENV', 'development') as 'development' | 'production' | 'test',
  IS_PROD: process.env.NODE_ENV === 'production',
} as const;
