-- Move pg_net extension from public schema to extensions schema
-- This addresses the Supabase linter warning about extensions in public schema

-- Create extensions schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS extensions;

-- Revoke public schema usage from pg_net (to prevent accidental usage)
REVOKE ALL ON SCHEMA public FROM pg_net;

-- Drop and recreate extension in extensions schema
-- Note: This requires superuser privileges and may need to be run
-- via Supabase Dashboard SQL Editor if insufficient permissions
DROP EXTENSION IF EXISTS pg_net CASCADE;

CREATE EXTENSION pg_net SCHEMA extensions;

-- Grant usage on extensions schema to authenticated and anon roles
GRANT USAGE ON SCHEMA extensions TO authenticated, anon;

-- Verify extension is now in extensions schema
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_extension e
    JOIN pg_namespace n ON n.oid = e.extnamespace
    WHERE e.extname = 'pg_net' AND n.nspname = 'extensions'
  ) THEN
    RAISE NOTICE 'Successfully moved pg_net extension to extensions schema';
  ELSE
    RAISE WARNING 'pg_net extension may still be in public schema';
  END IF;
END $$;
