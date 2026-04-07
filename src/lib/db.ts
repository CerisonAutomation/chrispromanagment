/**
 * @fileoverview DB adapter — re-exports Supabase as the canonical DB layer.
 * Replaces broken SQLite/Prisma setup that caused 500s on every page load.
 * All cms_pages operations go through supabaseAdmin.
 *
 * Supabase SQL to run once:
 * ---------------------------------------------------
 * CREATE TABLE IF NOT EXISTS cms_pages (
 *   id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
 *   slug        text UNIQUE NOT NULL,
 *   title       text NOT NULL DEFAULT 'Untitled',
 *   data        jsonb NOT NULL DEFAULT '{"content":[],"root":{}}',
 *   published   boolean NOT NULL DEFAULT false,
 *   theme       text NOT NULL DEFAULT 'malta-gold',
 *   created_at  timestamptz DEFAULT now(),
 *   updated_at  timestamptz DEFAULT now()
 * );
 * CREATE INDEX IF NOT EXISTS cms_pages_slug_idx ON cms_pages (slug);
 * ALTER TABLE cms_pages ENABLE ROW LEVEL SECURITY;
 * CREATE POLICY "service_role_all" ON cms_pages USING (true) WITH CHECK (true);
 * ---------------------------------------------------
 */
export { supabase, supabaseAdmin } from './supabase';
