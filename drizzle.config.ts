/**
 * @fileoverview Drizzle Kit configuration — Supabase Postgres target.
 * @see https://orm.drizzle.team/kit-docs/config-reference
 */
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!,
  },
  verbose: process.env.NODE_ENV === 'development',
  strict: true,
});
