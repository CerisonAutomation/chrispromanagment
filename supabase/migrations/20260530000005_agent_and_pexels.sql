-- ============================================================
-- Migration: cms_agent_messages log + ensure sync_log is writable
-- ============================================================

-- Track agent conversation sessions for audit + replay
CREATE TABLE IF NOT EXISTS cms_agent_sessions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  message_count INTEGER DEFAULT 0,
  last_message  TEXT,
  patches_applied INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_agent_sessions_user ON cms_agent_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_sessions_created ON cms_agent_sessions(created_at DESC);

-- RLS: only admins/editors can read their own sessions
ALTER TABLE cms_agent_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin read agent sessions" ON cms_agent_sessions;
CREATE POLICY "Admin read agent sessions" ON cms_agent_sessions
  FOR SELECT USING (
    user_id = auth.uid() AND (
      public.has_role('admin', auth.uid()) OR
      public.has_role('editor', auth.uid())
    )
  );

-- Ensure cms_sync_log allows service-role inserts (edge functions use service role)
-- No additional policy needed — service role bypasses RLS

-- Add PEXELS_API_KEY note to cms_settings for docs
INSERT INTO cms_settings (setting_key, setting_label, setting_group, setting_value)
VALUES
  ('pexels_enabled', 'Pexels image search', 'features', 'false'::jsonb),
  ('agent_enabled',  'AI Agent chat',       'features', 'true'::jsonb)
ON CONFLICT (setting_key) DO NOTHING;
