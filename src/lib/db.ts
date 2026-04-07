/**
 * @fileoverview DB layer — Supabase only. SQLite/Prisma REMOVED.
 * Import from here for all DB operations to keep a single canonical entry point.
 */
export { supabase, supabaseAdmin, getAllPages, getPageBySlug, upsertPage } from './supabase';
export type { CmsPage } from './supabase';
