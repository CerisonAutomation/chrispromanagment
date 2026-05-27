-- Fix RLS initplan issue for contact_submissions table
-- Replace auth.uid() with (select auth.uid()) to prevent per-row re-evaluation
-- The linter warns about policies svc_read and svc_write

-- Drop existing policies that use auth.uid() (may have been created manually)
DROP POLICY IF EXISTS svc_read ON public.contact_submissions;
DROP POLICY IF EXISTS svc_write ON public.contact_submissions;
DROP POLICY IF EXISTS "Admins read contacts" ON public.contact_submissions;
DROP POLICY IF EXISTS "Admins update contacts" ON public.contact_submissions;

-- Recreate admin policies with (select auth.uid()) for optimal performance
-- Table has no user_id column - uses has_role() function for admin checks
CREATE POLICY "Admins read contacts" ON public.contact_submissions
  FOR SELECT TO authenticated
  USING (public.has_role((select auth.uid()), 'admin'::app_role));

CREATE POLICY "Admins update contacts" ON public.contact_submissions
  FOR UPDATE TO authenticated
  USING (public.has_role((select auth.uid()), 'admin'::app_role))
  WITH CHECK (public.has_role((select auth.uid()), 'admin'::app_role));

-- Keep the public insert policy (anyone can submit contact form)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'contact_submissions' AND policyname = 'Anyone can insert contact'
  ) THEN
    CREATE POLICY "Anyone can insert contact" ON public.contact_submissions
      FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- Verify policies are correctly applied
DO $$
BEGIN
  RAISE NOTICE 'Fixed RLS initplan issue for contact_submissions table - replaced auth.uid() with (select auth.uid())';
END $$;
