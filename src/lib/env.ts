/**
 * @fileoverview Type-safe environment variable validation.
 *
 * Uses lazy getters so module-load (next build) never throws when env vars
 * are injected at runtime by Vercel. Throws only when the value is actually
 * accessed during a request — giving a clear actionable error message.
 *
 * Usage: import { env } from '@/lib/env'
 * NEVER use process.env directly in application code.
 */

function required(key: string): string {
  const v = process.env[key];
  if (!v || v.trim() === '') {
    // Only throw at runtime, not during `next build` static analysis.
    // Vercel injects env vars at runtime — this is intentional.
    if (process.env.NODE_ENV === 'production' || process.env.NEXT_PHASE !== 'phase-production-build') {
      throw new Error(
        `[ENV] Missing required environment variable: ${key}\n` +
        `  → Add it to .env.local (dev) or Vercel Dashboard → Settings → Environment Variables (prod).`,
      );
    }
    return `__MISSING_${key}__`;
  }
  return v.trim();
}

function optional(key: string, fallback = ''): string {
  return process.env[key]?.trim() ?? fallback;
}

/**
 * Lazy env accessor — each property is evaluated on first access, not at import time.
 * This prevents `next build` from crashing when env vars are not present during the
 * static build phase but ARE present at Vercel runtime.
 */
export const env = {
  // ─── Supabase (required) ───────────────────────────────────────────────
  get SUPABASE_URL()        { return required('NEXT_PUBLIC_SUPABASE_URL'); },
  get SUPABASE_ANON_KEY()   { return required('NEXT_PUBLIC_SUPABASE_ANON_KEY'); },
  get SUPABASE_SERVICE_KEY(){ return optional('SUPABASE_SERVICE_ROLE_KEY'); },

  // ─── Guesty OAuth2 (required for booking features) ──────────────────────
  get GUESTY_CLIENT_ID()     { return required('GUESTY_CLIENT_ID'); },
  get GUESTY_CLIENT_SECRET() { return required('GUESTY_CLIENT_SECRET'); },
  get GUESTY_API_URL()       { return optional('GUESTY_API_URL', 'https://open-api.guesty.com'); },

  // ─── OpenAI ─────────────────────────────────────────────────────────
  get OPENAI_API_KEY()       { return optional('OPENAI_API_KEY'); },

  // ─── Site ──────────────────────────────────────────────────────────────
  get SITE_URL()  { return optional('NEXT_PUBLIC_SITE_URL', 'https://chrispropmanagment.vercel.app'); },
  get NODE_ENV()  { return (optional('NODE_ENV', 'development')) as 'development' | 'production' | 'test'; },
  get IS_PROD()   { return process.env.NODE_ENV === 'production'; },
} as const;
