-- Token vault
CREATE TABLE public.guesty_token_vault (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  access_token text NOT NULL,
  expires_at timestamptz NOT NULL,
  scope text,
  last_refreshed_at timestamptz NOT NULL DEFAULT now(),
  refresh_count integer NOT NULL DEFAULT 0
);

ALTER TABLE public.guesty_token_vault ENABLE ROW LEVEL SECURITY;

-- No public access whatsoever; only service_role can read/write
CREATE POLICY "service role full access vault"
  ON public.guesty_token_vault FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Refresh log for observability
CREATE TABLE public.guesty_token_refresh_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status text NOT NULL,
  expires_at timestamptz,
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.guesty_token_refresh_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service role inserts refresh log"
  ON public.guesty_token_refresh_log FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Admins read refresh log"
  ON public.guesty_token_refresh_log FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- pg_cron + pg_net for scheduled refresh
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Every 6 hours, call the token-refresh edge function.
-- Schedule lives in cron.job; unschedule if exists, then schedule fresh.
DO $$
BEGIN
  PERFORM cron.unschedule('guesty-token-refresh-6h');
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

SELECT cron.schedule(
  'guesty-token-refresh-6h',
  '0 */6 * * *',
  $$
  SELECT net.http_post(
    url := 'https://mcmzlxdppatjjpxwacco.supabase.co/functions/v1/guesty-token-refresh',
    headers := jsonb_build_object('Content-Type', 'application/json')
  );
  $$
);