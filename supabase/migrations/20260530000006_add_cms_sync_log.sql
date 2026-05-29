-- ============================================================
-- Migration: Create cms_sync_log table for edge-function audit
-- ============================================================

CREATE TABLE IF NOT EXISTS cms_sync_log (
  id          BIGSERIAL PRIMARY KEY,
  source      TEXT NOT NULL,
  action      TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'success',
  payload     JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cms_sync_log_source   ON cms_sync_log(source);
CREATE INDEX IF NOT EXISTS idx_cms_sync_log_created  ON cms_sync_log(created_at DESC);

ALTER TABLE cms_sync_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin read sync_log" ON cms_sync_log;
CREATE POLICY "Admin read sync_log" ON cms_sync_log
  FOR SELECT USING (public.has_role('admin', auth.uid()));
