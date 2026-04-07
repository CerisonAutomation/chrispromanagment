/**
 * @fileoverview Canonical DB entry point. Import from here always.
 * Prisma/SQLite/Drizzle are REMOVED. Supabase is the only DB layer.
 */
export {
  supabase,
  supabaseAdmin,
  getAllPages,
  getPageBySlug,
  upsertPage,
  deletePage,
  EMPTY_DATA,
} from './supabase';
