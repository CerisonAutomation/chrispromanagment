-- ============================================================
-- Migration: CMS write RLS + auto-timestamp trigger + settings
-- ============================================================

-- ── updated_at auto-trigger (used on cms_content) ─────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS cms_content_updated_at ON cms_content;
CREATE TRIGGER cms_content_updated_at
  BEFORE UPDATE ON cms_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── RLS on cms_content ────────────────────────────────────────────────────────
-- Public read (all visible blocks)
DROP POLICY IF EXISTS "Public read cms_content" ON cms_content;
CREATE POLICY "Public read cms_content" ON cms_content
  FOR SELECT USING (is_visible = true);

-- Admin/editor read (ALL rows, including invisible — needed for CMS editor)
DROP POLICY IF EXISTS "Admin read cms_content" ON cms_content;
CREATE POLICY "Admin read cms_content" ON cms_content
  FOR SELECT USING (
    public.has_role('admin', auth.uid()) OR
    public.has_role('editor', auth.uid())
  );

-- Admin/editor write
DROP POLICY IF EXISTS "Admins can insert cms_content" ON cms_content;
DROP POLICY IF EXISTS "Admins can update cms_content" ON cms_content;

CREATE POLICY "Admins can insert cms_content" ON cms_content
  FOR INSERT WITH CHECK (
    public.has_role('admin', auth.uid()) OR
    public.has_role('editor', auth.uid())
  );

CREATE POLICY "Admins can update cms_content" ON cms_content
  FOR UPDATE USING (
    public.has_role('admin', auth.uid()) OR
    public.has_role('editor', auth.uid())
  );

-- ── RLS on cms_versions ───────────────────────────────────────────────────────
ALTER TABLE cms_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin read versions"  ON cms_versions;
DROP POLICY IF EXISTS "Admin write versions" ON cms_versions;

CREATE POLICY "Admin read versions" ON cms_versions
  FOR SELECT USING (
    public.has_role('admin', auth.uid()) OR
    public.has_role('editor', auth.uid())
  );

CREATE POLICY "Admin write versions" ON cms_versions
  FOR INSERT WITH CHECK (
    public.has_role('admin', auth.uid()) OR
    public.has_role('editor', auth.uid())
  );

-- ── RLS on cms_sync_log ───────────────────────────────────────────────────────
ALTER TABLE cms_sync_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin read sync_log" ON cms_sync_log;
CREATE POLICY "Admin read sync_log" ON cms_sync_log
  FOR SELECT USING (public.has_role('admin', auth.uid()));
-- Service role bypasses RLS for inserts from edge functions

-- ── cms_settings — unique key constraint + seed ────────────────────────────────
-- Fix: ADD CONSTRAINT … UNIQUE does not support IF NOT EXISTS in Postgres < 15
-- Use DO block with exception handling instead
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'cms_settings_key_unique'
      AND conrelid = 'cms_settings'::regclass
  ) THEN
    ALTER TABLE cms_settings ADD CONSTRAINT cms_settings_key_unique UNIQUE (setting_key);
  END IF;
END $$;

INSERT INTO cms_settings (setting_key, setting_label, setting_group, setting_value)
VALUES
  ('site_name',          'Site name',           'brand',    '"Christiano"'::jsonb),
  ('site_tagline',       'Tagline',             'brand',    '"Luxury stays, effortlessly managed."'::jsonb),
  ('contact_email',      'Contact email',       'contact',  '"hello@christiano.mt"'::jsonb),
  ('contact_whatsapp',   'WhatsApp number',     'contact',  '"+356 99 000 000"'::jsonb),
  ('booking_min_nights', 'Default min nights',  'booking',  '2'::jsonb),
  ('currency_default',   'Default currency',    'booking',  '"EUR"'::jsonb),
  ('ai_copy_enabled',    'AI copy enhancement', 'features', 'true'::jsonb)
ON CONFLICT (setting_key) DO NOTHING;

-- ── RLS on cms_settings ───────────────────────────────────────────────────────
ALTER TABLE cms_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read settings" ON cms_settings;
CREATE POLICY "Public read settings" ON cms_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin write settings" ON cms_settings;
CREATE POLICY "Admin write settings" ON cms_settings
  FOR ALL USING (public.has_role('admin', auth.uid()));

-- ── Ensure listing_availability has RLS ───────────────────────────────────────
DROP POLICY IF EXISTS "Public read availability" ON listing_availability;
CREATE POLICY "Public read availability" ON listing_availability
  FOR SELECT USING (true);
