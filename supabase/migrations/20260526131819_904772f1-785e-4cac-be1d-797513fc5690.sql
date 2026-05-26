
-- Profiles: remove public read; restrict to owner or admin
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Users view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));

-- cms_sync_log: restrict reads to admins; writes to service_role only
DROP POLICY IF EXISTS "Authenticated users can read sync logs" ON public.cms_sync_log;
DROP POLICY IF EXISTS "Service or authenticated can insert sync logs" ON public.cms_sync_log;

CREATE POLICY "Admins read sync logs"
ON public.cms_sync_log
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role inserts sync logs"
ON public.cms_sync_log
FOR INSERT
TO public
WITH CHECK (auth.role() = 'service_role'::text);
