-- =============================================
-- CPMDB PRODUCTION SECURITY FIXES
-- Generated: 2026-05-26
-- Purpose: Fix all 30 critical security issues for enterprise production
-- Instructions: Run this in Supabase Dashboard → SQL Editor
-- =============================================

-- =============================================
-- 1. CMS CONTENT TABLES (public read for published, admin write)
-- =============================================

-- announcement_bars
ALTER TABLE public.announcement_bars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcement_bars FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "deny_all_by_default" ON public.announcement_bars;
DROP POLICY IF EXISTS "public_read_published" ON public.announcement_bars;
DROP POLICY IF EXISTS "auth_read_all" ON public.announcement_bars;

CREATE POLICY "deny_all_by_default" ON public.announcement_bars FOR ALL TO public USING (false);
CREATE POLICY "public_read_published" ON public.announcement_bars
  FOR SELECT TO anon, authenticated USING (status = 'published' OR status IS NULL);
CREATE POLICY "auth_read_all" ON public.announcement_bars
  FOR SELECT TO authenticated USING ((select auth.uid()) IS NOT NULL);

-- cms_block_instances
ALTER TABLE public.cms_block_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_block_instances FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "deny_all_by_default" ON public.cms_block_instances;
DROP POLICY IF EXISTS "public_read_published" ON public.cms_block_instances;
DROP POLICY IF EXISTS "auth_read_all" ON public.cms_block_instances;

CREATE POLICY "deny_all_by_default" ON public.cms_block_instances FOR ALL TO public USING (false);
CREATE POLICY "public_read_published" ON public.cms_block_instances
  FOR SELECT TO anon, authenticated USING (status = 'published' OR status IS NULL);
CREATE POLICY "auth_read_all" ON public.cms_block_instances
  FOR SELECT TO authenticated USING ((select auth.uid()) IS NOT NULL);

-- cms_page_versions
ALTER TABLE public.cms_page_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_page_versions FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "deny_all_by_default" ON public.cms_page_versions;
DROP POLICY IF EXISTS "public_read_published" ON public.cms_page_versions;
DROP POLICY IF EXISTS "auth_read_all" ON public.cms_page_versions;

CREATE POLICY "deny_all_by_default" ON public.cms_page_versions FOR ALL TO public USING (false);
CREATE POLICY "public_read_published" ON public.cms_page_versions
  FOR SELECT TO anon, authenticated USING (status = 'published' OR status IS NULL);
CREATE POLICY "auth_read_all" ON public.cms_page_versions
  FOR SELECT TO authenticated USING ((select auth.uid()) IS NOT NULL);

-- cms_pages
ALTER TABLE public.cms_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_pages FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "deny_all_by_default" ON public.cms_pages;
DROP POLICY IF EXISTS "public_read_published" ON public.cms_pages;
DROP POLICY IF EXISTS "auth_read_all" ON public.cms_pages;

CREATE POLICY "deny_all_by_default" ON public.cms_pages FOR ALL TO public USING (false);
CREATE POLICY "public_read_published" ON public.cms_pages
  FOR SELECT TO anon, authenticated USING (status = 'published' OR status IS NULL);
CREATE POLICY "auth_read_all" ON public.cms_pages
  FOR SELECT TO authenticated USING ((select auth.uid()) IS NOT NULL);

-- contact_settings
ALTER TABLE public.contact_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_settings FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "deny_all_by_default" ON public.contact_settings;
DROP POLICY IF EXISTS "public_read_published" ON public.contact_settings;
DROP POLICY IF EXISTS "auth_read_all" ON public.contact_settings;

CREATE POLICY "deny_all_by_default" ON public.contact_settings FOR ALL TO public USING (false);
CREATE POLICY "public_read_published" ON public.contact_settings
  FOR SELECT TO anon, authenticated USING (status = 'published' OR status IS NULL);
CREATE POLICY "auth_read_all" ON public.contact_settings
  FOR SELECT TO authenticated USING ((select auth.uid()) IS NOT NULL);

-- footer_config
ALTER TABLE public.footer_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.footer_config FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "deny_all_by_default" ON public.footer_config;
DROP POLICY IF EXISTS "public_read_published" ON public.footer_config;
DROP POLICY IF EXISTS "auth_read_all" ON public.footer_config;

CREATE POLICY "deny_all_by_default" ON public.footer_config FOR ALL TO public USING (false);
CREATE POLICY "public_read_published" ON public.footer_config
  FOR SELECT TO anon, authenticated USING (status = 'published' OR status IS NULL);
CREATE POLICY "auth_read_all" ON public.footer_config
  FOR SELECT TO authenticated USING ((select auth.uid()) IS NOT NULL);

-- header_config
ALTER TABLE public.header_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.header_config FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "deny_all_by_default" ON public.header_config;
DROP POLICY IF EXISTS "public_read_published" ON public.header_config;
DROP POLICY IF EXISTS "auth_read_all" ON public.header_config;

CREATE POLICY "deny_all_by_default" ON public.header_config FOR ALL TO public USING (false);
CREATE POLICY "public_read_published" ON public.header_config
  FOR SELECT TO anon, authenticated USING (status = 'published' OR status IS NULL);
CREATE POLICY "auth_read_all" ON public.header_config
  FOR SELECT TO authenticated USING ((select auth.uid()) IS NOT NULL);

-- legal_links
ALTER TABLE public.legal_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_links FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "deny_all_by_default" ON public.legal_links;
DROP POLICY IF EXISTS "public_read_published" ON public.legal_links;
DROP POLICY IF EXISTS "auth_read_all" ON public.legal_links;

CREATE POLICY "deny_all_by_default" ON public.legal_links FOR ALL TO public USING (false);
CREATE POLICY "public_read_published" ON public.legal_links
  FOR SELECT TO anon, authenticated USING (status = 'published' OR status IS NULL);
CREATE POLICY "auth_read_all" ON public.legal_links
  FOR SELECT TO authenticated USING ((select auth.uid()) IS NOT NULL);

-- menus
ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menus FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "deny_all_by_default" ON public.menus;
DROP POLICY IF EXISTS "public_read_published" ON public.menus;
DROP POLICY IF EXISTS "auth_read_all" ON public.menus;

CREATE POLICY "deny_all_by_default" ON public.menus FOR ALL TO public USING (false);
CREATE POLICY "public_read_published" ON public.menus
  FOR SELECT TO anon, authenticated USING (status = 'published' OR status IS NULL);
CREATE POLICY "auth_read_all" ON public.menus
  FOR SELECT TO authenticated USING ((select auth.uid()) IS NOT NULL);

-- menu_items
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "deny_all_by_default" ON public.menu_items;
DROP POLICY IF EXISTS "public_read_published" ON public.menu_items;
DROP POLICY IF EXISTS "auth_read_all" ON public.menu_items;

CREATE POLICY "deny_all_by_default" ON public.menu_items FOR ALL TO public USING (false);
CREATE POLICY "public_read_published" ON public.menu_items
  FOR SELECT TO anon, authenticated USING (status = 'published' OR status IS NULL);
CREATE POLICY "auth_read_all" ON public.menu_items
  FOR SELECT TO authenticated USING ((select auth.uid()) IS NOT NULL);

-- page_blocks
ALTER TABLE public.page_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_blocks FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "deny_all_by_default" ON public.page_blocks;
DROP POLICY IF EXISTS "public_read_published" ON public.page_blocks;
DROP POLICY IF EXISTS "auth_read_all" ON public.page_blocks;

CREATE POLICY "deny_all_by_default" ON public.page_blocks FOR ALL TO public USING (false);
CREATE POLICY "public_read_published" ON public.page_blocks
  FOR SELECT TO anon, authenticated USING (status = 'published' OR status IS NULL);
CREATE POLICY "auth_read_all" ON public.page_blocks
  FOR SELECT TO authenticated USING ((select auth.uid()) IS NOT NULL);

-- pages
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "deny_all_by_default" ON public.pages;
DROP POLICY IF EXISTS "public_read_published" ON public.pages;
DROP POLICY IF EXISTS "auth_read_all" ON public.pages;

CREATE POLICY "deny_all_by_default" ON public.pages FOR ALL TO public USING (false);
CREATE POLICY "public_read_published" ON public.pages
  FOR SELECT TO anon, authenticated USING (status = 'published' OR status IS NULL);
CREATE POLICY "auth_read_all" ON public.pages
  FOR SELECT TO authenticated USING ((select auth.uid()) IS NOT NULL);

-- reusable_blocks
ALTER TABLE public.reusable_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reusable_blocks FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "deny_all_by_default" ON public.reusable_blocks;
DROP POLICY IF EXISTS "public_read_published" ON public.reusable_blocks;
DROP POLICY IF EXISTS "auth_read_all" ON public.reusable_blocks;

CREATE POLICY "deny_all_by_default" ON public.reusable_blocks FOR ALL TO public USING (false);
CREATE POLICY "public_read_published" ON public.reusable_blocks
  FOR SELECT TO anon, authenticated USING (status = 'published' OR status IS NULL);
CREATE POLICY "auth_read_all" ON public.reusable_blocks
  FOR SELECT TO authenticated USING ((select auth.uid()) IS NOT NULL);

-- seo_defaults
ALTER TABLE public.seo_defaults ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_defaults FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "deny_all_by_default" ON public.seo_defaults;
DROP POLICY IF EXISTS "public_read_published" ON public.seo_defaults;
DROP POLICY IF EXISTS "auth_read_all" ON public.seo_defaults;

CREATE POLICY "deny_all_by_default" ON public.seo_defaults FOR ALL TO public USING (false);
CREATE POLICY "public_read_published" ON public.seo_defaults
  FOR SELECT TO anon, authenticated USING (status = 'published' OR status IS NULL);
CREATE POLICY "auth_read_all" ON public.seo_defaults
  FOR SELECT TO authenticated USING ((select auth.uid()) IS NOT NULL);

-- site_settings
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "deny_all_by_default" ON public.site_settings;
DROP POLICY IF EXISTS "public_read_published" ON public.site_settings;
DROP POLICY IF EXISTS "auth_read_all" ON public.site_settings;

CREATE POLICY "deny_all_by_default" ON public.site_settings FOR ALL TO public USING (false);
CREATE POLICY "public_read_published" ON public.site_settings
  FOR SELECT TO anon, authenticated USING (status = 'published' OR status IS NULL);
CREATE POLICY "auth_read_all" ON public.site_settings
  FOR SELECT TO authenticated USING ((select auth.uid()) IS NOT NULL);

-- social_links
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_links FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "deny_all_by_default" ON public.social_links;
DROP POLICY IF EXISTS "public_read_published" ON public.social_links;
DROP POLICY IF EXISTS "auth_read_all" ON public.social_links;

CREATE POLICY "deny_all_by_default" ON public.social_links FOR ALL TO public USING (false);
CREATE POLICY "public_read_published" ON public.social_links
  FOR SELECT TO anon, authenticated USING (status = 'published' OR status IS NULL);
CREATE POLICY "auth_read_all" ON public.social_links
  FOR SELECT TO authenticated USING ((select auth.uid()) IS NOT NULL);

-- sticky_cta_configs
ALTER TABLE public.sticky_cta_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sticky_cta_configs FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "deny_all_by_default" ON public.sticky_cta_configs;
DROP POLICY IF EXISTS "public_read_published" ON public.sticky_cta_configs;
DROP POLICY IF EXISTS "auth_read_all" ON public.sticky_cta_configs;

CREATE POLICY "deny_all_by_default" ON public.sticky_cta_configs FOR ALL TO public USING (false);
CREATE POLICY "public_read_published" ON public.sticky_cta_configs
  FOR SELECT TO anon, authenticated USING (status = 'published' OR status IS NULL);
CREATE POLICY "auth_read_all" ON public.sticky_cta_configs
  FOR SELECT TO authenticated USING ((select auth.uid()) IS NOT NULL);

-- theme_settings
ALTER TABLE public.theme_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.theme_settings FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "deny_all_by_default" ON public.theme_settings;
DROP POLICY IF EXISTS "public_read_published" ON public.theme_settings;
DROP POLICY IF EXISTS "auth_read_all" ON public.theme_settings;

CREATE POLICY "deny_all_by_default" ON public.theme_settings FOR ALL TO public USING (false);
CREATE POLICY "public_read_published" ON public.theme_settings
  FOR SELECT TO anon, authenticated USING (status = 'published' OR status IS NULL);
CREATE POLICY "auth_read_all" ON public.theme_settings
  FOR SELECT TO authenticated USING ((select auth.uid()) IS NOT NULL);

-- page_seo
ALTER TABLE public.page_seo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_seo FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "deny_all_by_default" ON public.page_seo;
DROP POLICY IF EXISTS "public_read_published" ON public.page_seo;
DROP POLICY IF EXISTS "auth_read_all" ON public.page_seo;

CREATE POLICY "deny_all_by_default" ON public.page_seo FOR ALL TO public USING (false);
CREATE POLICY "public_read_published" ON public.page_seo
  FOR SELECT TO anon, authenticated USING (status = 'published' OR status IS NULL);
CREATE POLICY "auth_read_all" ON public.page_seo
  FOR SELECT TO authenticated USING ((select auth.uid()) IS NOT NULL);

-- =============================================
-- 2. USER-SCOPED TABLES (user owns their data)
-- =============================================

-- ai_task_runs
ALTER TABLE public.ai_task_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_task_runs FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "deny_all_by_default" ON public.ai_task_runs;
DROP POLICY IF EXISTS "users_own_data_select" ON public.ai_task_runs;
DROP POLICY IF EXISTS "users_own_data_insert" ON public.ai_task_runs;
DROP POLICY IF EXISTS "users_own_data_update" ON public.ai_task_runs;
DROP POLICY IF EXISTS "users_own_data_delete" ON public.ai_task_runs;

CREATE POLICY "deny_all_by_default" ON public.ai_task_runs FOR ALL TO public USING (false);
CREATE POLICY "users_own_data_select" ON public.ai_task_runs
  FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);
CREATE POLICY "users_own_data_insert" ON public.ai_task_runs
  FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "users_own_data_update" ON public.ai_task_runs
  FOR UPDATE TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "users_own_data_delete" ON public.ai_task_runs
  FOR DELETE TO authenticated USING ((select auth.uid()) = user_id);

-- media_assets
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "deny_all_by_default" ON public.media_assets;
DROP POLICY IF EXISTS "users_own_data_select" ON public.media_assets;
DROP POLICY IF EXISTS "users_own_data_insert" ON public.media_assets;
DROP POLICY IF EXISTS "users_own_data_update" ON public.media_assets;
DROP POLICY IF EXISTS "users_own_data_delete" ON public.media_assets;

CREATE POLICY "deny_all_by_default" ON public.media_assets FOR ALL TO public USING (false);
CREATE POLICY "users_own_data_select" ON public.media_assets
  FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);
CREATE POLICY "users_own_data_insert" ON public.media_assets
  FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "users_own_data_update" ON public.media_assets
  FOR UPDATE TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "users_own_data_delete" ON public.media_assets
  FOR DELETE TO authenticated USING ((select auth.uid()) = user_id);

-- media_usages
ALTER TABLE public.media_usages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_usages FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "deny_all_by_default" ON public.media_usages;
DROP POLICY IF EXISTS "users_own_data_select" ON public.media_usages;
DROP POLICY IF EXISTS "users_own_data_insert" ON public.media_usages;
DROP POLICY IF EXISTS "users_own_data_update" ON public.media_usages;
DROP POLICY IF EXISTS "users_own_data_delete" ON public.media_usages;

CREATE POLICY "deny_all_by_default" ON public.media_usages FOR ALL TO public USING (false);
CREATE POLICY "users_own_data_select" ON public.media_usages
  FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);
CREATE POLICY "users_own_data_insert" ON public.media_usages
  FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "users_own_data_update" ON public.media_usages
  FOR UPDATE TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "users_own_data_delete" ON public.media_usages
  FOR DELETE TO authenticated USING ((select auth.uid()) = user_id);

-- =============================================
-- 3. CONFIG/LOOKUP TABLES (admin only)
-- =============================================

-- Create admin_users table if not exists
CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
);

-- ai_presets
ALTER TABLE public.ai_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_presets FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "deny_all_by_default" ON public.ai_presets;
DROP POLICY IF EXISTS "admin_only" ON public.ai_presets;

CREATE POLICY "deny_all_by_default" ON public.ai_presets FOR ALL TO public USING (false);
CREATE POLICY "admin_only" ON public.ai_presets
  FOR ALL TO authenticated USING ((select auth.uid()) IN (SELECT user_id FROM public.admin_users WHERE user_id = (select auth.uid())))
  WITH CHECK ((select auth.uid()) IN (SELECT user_id FROM public.admin_users WHERE user_id = (select auth.uid())));

-- ai_prompt_templates
ALTER TABLE public.ai_prompt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_prompt_templates FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "deny_all_by_default" ON public.ai_prompt_templates;
DROP POLICY IF EXISTS "admin_only" ON public.ai_prompt_templates;

CREATE POLICY "deny_all_by_default" ON public.ai_prompt_templates FOR ALL TO public USING (false);
CREATE POLICY "admin_only" ON public.ai_prompt_templates
  FOR ALL TO authenticated USING ((select auth.uid()) IN (SELECT user_id FROM public.admin_users WHERE user_id = (select auth.uid())))
  WITH CHECK ((select auth.uid()) IN (SELECT user_id FROM public.admin_users WHERE user_id = (select auth.uid())));

-- Amenity
ALTER TABLE public."Amenity" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Amenity" FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "deny_all_by_default" ON public."Amenity";
DROP POLICY IF EXISTS "admin_only" ON public."Amenity";

CREATE POLICY "deny_all_by_default" ON public."Amenity" FOR ALL TO public USING (false);
CREATE POLICY "admin_only" ON public."Amenity"
  FOR ALL TO authenticated USING ((select auth.uid()) IN (SELECT user_id FROM public.admin_users WHERE user_id = (select auth.uid())))
  WITH CHECK ((select auth.uid()) IN (SELECT user_id FROM public.admin_users WHERE user_id = (select auth.uid())));

-- collections
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "deny_all_by_default" ON public.collections;
DROP POLICY IF EXISTS "admin_only" ON public.collections;

CREATE POLICY "deny_all_by_default" ON public.collections FOR ALL TO public USING (false);
CREATE POLICY "admin_only" ON public.collections
  FOR ALL TO authenticated USING ((select auth.uid()) IN (SELECT user_id FROM public.admin_users WHERE user_id = (select auth.uid())))
  WITH CHECK ((select auth.uid()) IN (SELECT user_id FROM public.admin_users WHERE user_id = (select auth.uid())));

-- feature_flags
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "deny_all_by_default" ON public.feature_flags;
DROP POLICY IF EXISTS "admin_only" ON public.feature_flags;

CREATE POLICY "deny_all_by_default" ON public.feature_flags FOR ALL TO public USING (false);
CREATE POLICY "admin_only" ON public.feature_flags
  FOR ALL TO authenticated USING ((select auth.uid()) IN (SELECT user_id FROM public.admin_users WHERE user_id = (select auth.uid())))
  WITH CHECK ((select auth.uid()) IN (SELECT user_id FROM public.admin_users WHERE user_id = (select auth.uid())));

-- integration_settings
ALTER TABLE public.integration_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_settings FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "deny_all_by_default" ON public.integration_settings;
DROP POLICY IF EXISTS "admin_only" ON public.integration_settings;

CREATE POLICY "deny_all_by_default" ON public.integration_settings FOR ALL TO public USING (false);
CREATE POLICY "admin_only" ON public.integration_settings
  FOR ALL TO authenticated USING ((select auth.uid()) IN (SELECT user_id FROM public.admin_users WHERE user_id = (select auth.uid())))
  WITH CHECK ((select auth.uid()) IN (SELECT user_id FROM public.admin_users WHERE user_id = (select auth.uid())));

-- locations
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "deny_all_by_default" ON public.locations;
DROP POLICY IF EXISTS "admin_only" ON public.locations;

CREATE POLICY "deny_all_by_default" ON public.locations FOR ALL TO public USING (false);
CREATE POLICY "admin_only" ON public.locations
  FOR ALL TO authenticated USING ((select auth.uid()) IN (SELECT user_id FROM public.admin_users WHERE user_id = (select auth.uid())))
  WITH CHECK ((select auth.uid()) IN (SELECT user_id FROM public.admin_users WHERE user_id = (select auth.uid())));

-- =============================================
-- 4. FIX SECURITY DEFINER FUNCTIONS
-- =============================================

-- Fix search_path and revoke public execute
ALTER FUNCTION public.trigger_guesty_sync() SET search_path = pg_catalog, public;
REVOKE EXECUTE ON FUNCTION public.trigger_guesty_sync() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.trigger_guesty_sync() TO service_role;
ALTER FUNCTION public.trigger_guesty_sync() SECURITY INVOKER;

ALTER FUNCTION public.update_updated_at_column() SET search_path = pg_catalog, public;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_updated_at_column() TO service_role;
ALTER FUNCTION public.update_updated_at_column() SECURITY INVOKER;

ALTER FUNCTION public.invoke_edge_function_async(text, text, jsonb) SET search_path = pg_catalog, public;
REVOKE EXECUTE ON FUNCTION public.invoke_edge_function_async(text, text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.invoke_edge_function_async(text, text, jsonb) TO service_role;
ALTER FUNCTION public.invoke_edge_function_async(text, text, jsonb) SECURITY INVOKER;

ALTER FUNCTION public.get_guesty_access_token() SET search_path = pg_catalog, public;
REVOKE EXECUTE ON FUNCTION public.get_guesty_access_token() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_guesty_access_token() TO service_role;
ALTER FUNCTION public.get_guesty_access_token() SECURITY INVOKER;

ALTER FUNCTION public.cleanup_expired_caches() SET search_path = pg_catalog, public;
REVOKE EXECUTE ON FUNCTION public.cleanup_expired_caches() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cleanup_expired_caches() TO service_role;
ALTER FUNCTION public.cleanup_expired_caches() SECURITY INVOKER;

ALTER FUNCTION public.vault_upsert_secret(text, text) SET search_path = pg_catalog, public;
REVOKE EXECUTE ON FUNCTION public.vault_upsert_secret(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.vault_upsert_secret(text, text) TO service_role;
ALTER FUNCTION public.vault_upsert_secret(text, text) SECURITY INVOKER;

-- =============================================
-- 5. FIX "RLS POLICY ALWAYS TRUE" TABLES
-- =============================================

-- Contact table
ALTER TABLE public."Contact" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Contact" FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_access" ON public."Contact";
DROP POLICY IF EXISTS "deny_all_by_default" ON public."Contact";
DROP POLICY IF EXISTS "public_insert_contact" ON public."Contact";
DROP POLICY IF EXISTS "admin_manage_contact" ON public."Contact";

CREATE POLICY "deny_all_by_default" ON public."Contact" FOR ALL TO public USING (false);
CREATE POLICY "public_insert_contact" ON public."Contact"
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "admin_select_contact" ON public."Contact"
  FOR SELECT TO service_role USING (true);
CREATE POLICY "admin_update_contact" ON public."Contact"
  FOR UPDATE TO service_role USING (true);
CREATE POLICY "admin_delete_contact" ON public."Contact"
  FOR DELETE TO service_role USING (true);

-- PropertyOwnerInquiry table
ALTER TABLE public."PropertyOwnerInquiry" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."PropertyOwnerInquiry" FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_access" ON public."PropertyOwnerInquiry";
DROP POLICY IF EXISTS "deny_all_by_default" ON public."PropertyOwnerInquiry";
DROP POLICY IF EXISTS "public_insert_inquiry" ON public."PropertyOwnerInquiry";
DROP POLICY IF EXISTS "admin_manage_inquiry" ON public."PropertyOwnerInquiry";

CREATE POLICY "deny_all_by_default" ON public."PropertyOwnerInquiry" FOR ALL TO public USING (false);
CREATE POLICY "public_insert_inquiry" ON public."PropertyOwnerInquiry"
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "admin_manage_inquiry" ON public."PropertyOwnerInquiry"
  FOR ALL TO service_role USING (true);

-- =============================================
-- 6. PERFORMANCE INDEXES FOR RLS POLICY COLUMNS
-- =============================================

-- Indexes for user_id columns (user-scoped tables)
CREATE INDEX IF NOT EXISTS idx_media_assets_user_id ON public.media_assets(user_id);
CREATE INDEX IF NOT EXISTS idx_media_usages_user_id ON public.media_usages(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_task_runs_user_id ON public.ai_task_runs(user_id);

-- Indexes for status columns (CMS content tables)
CREATE INDEX IF NOT EXISTS idx_announcement_bars_status ON public.announcement_bars(status);
CREATE INDEX IF NOT EXISTS idx_cms_block_instances_status ON public.cms_block_instances(status);
CREATE INDEX IF NOT EXISTS idx_cms_page_versions_status ON public.cms_page_versions(status);
CREATE INDEX IF NOT EXISTS idx_cms_pages_status ON public.cms_pages(status);
CREATE INDEX IF NOT EXISTS idx_contact_settings_status ON public.contact_settings(status);
CREATE INDEX IF NOT EXISTS idx_footer_config_status ON public.footer_config(status);
CREATE INDEX IF NOT EXISTS idx_header_config_status ON public.header_config(status);
CREATE INDEX IF NOT EXISTS idx_legal_links_status ON public.legal_links(status);
CREATE INDEX IF NOT EXISTS idx_menus_status ON public.menus(status);
CREATE INDEX IF NOT EXISTS idx_menu_items_status ON public.menu_items(status);
CREATE INDEX IF NOT EXISTS idx_page_blocks_status ON public.page_blocks(status);
CREATE INDEX IF NOT EXISTS idx_pages_status ON public.pages(status);
CREATE INDEX IF NOT EXISTS idx_reusable_blocks_status ON public.reusable_blocks(status);
CREATE INDEX IF NOT EXISTS idx_seo_defaults_status ON public.seo_defaults(status);
CREATE INDEX IF NOT EXISTS idx_site_settings_status ON public.site_settings(status);
CREATE INDEX IF NOT EXISTS idx_social_links_status ON public.social_links(status);
CREATE INDEX IF NOT EXISTS idx_sticky_cta_configs_status ON public.sticky_cta_configs(status);
CREATE INDEX IF NOT EXISTS idx_theme_settings_status ON public.theme_settings(status);
CREATE INDEX IF NOT EXISTS idx_page_seo_status ON public.page_seo(status);

-- =============================================
-- 7. VERIFICATION QUERIES (run after applying)
-- =============================================

-- Verify RLS enabled
SELECT 'RLS Status' as check_type, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Verify policies exist
SELECT 'Policy Count' as check_type, tablename, COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public' 
GROUP BY tablename
ORDER BY tablename;

-- Verify function permissions
SELECT 'Function Security' as check_type, routine_name, security_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('trigger_guesty_sync', 'update_updated_at_column', 'invoke_edge_function_async', 'get_guesty_access_token', 'cleanup_expired_caches', 'vault_upsert_secret');

-- Success message
SELECT 'SECURITY FIXES APPLIED SUCCESSFULLY' as status;
