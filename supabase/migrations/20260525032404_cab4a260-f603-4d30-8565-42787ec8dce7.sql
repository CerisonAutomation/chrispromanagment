
-- Enable pg_cron + pg_net for zero-effort scheduled token refresh
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Drop any prior schedule with same name (idempotent)
DO $$
DECLARE jid bigint;
BEGIN
  SELECT jobid INTO jid FROM cron.job WHERE jobname = 'guesty-token-auto-refresh';
  IF jid IS NOT NULL THEN PERFORM cron.unschedule(jid); END IF;
END $$;

-- Schedule refresh every 6 hours; the function itself short-circuits if token is still valid
SELECT cron.schedule(
  'guesty-token-auto-refresh',
  '0 */6 * * *',
  $cron$
  SELECT net.http_post(
    url := 'https://mcmzlxdppatjjpxwacco.supabase.co/functions/v1/guesty-token-refresh',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.anon_key', true)
    ),
    body := '{}'::jsonb
  ) AS request_id;
  $cron$
);

-- Also schedule a daily forced refresh (force=1) as a belt-and-suspenders safety net
DO $$
DECLARE jid bigint;
BEGIN
  SELECT jobid INTO jid FROM cron.job WHERE jobname = 'guesty-token-daily-force';
  IF jid IS NOT NULL THEN PERFORM cron.unschedule(jid); END IF;
END $$;

SELECT cron.schedule(
  'guesty-token-daily-force',
  '15 3 * * *',
  $cron$
  SELECT net.http_post(
    url := 'https://mcmzlxdppatjjpxwacco.supabase.co/functions/v1/guesty-token-refresh?force=1',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := '{}'::jsonb
  ) AS request_id;
  $cron$
);
