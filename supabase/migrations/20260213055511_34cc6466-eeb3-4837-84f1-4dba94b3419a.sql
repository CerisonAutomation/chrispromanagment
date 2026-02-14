
-- Fix the permissive sync log policy - restrict to service role or authenticated
DROP POLICY "Anyone can insert sync logs" ON public.cms_sync_log;
CREATE POLICY "Service or authenticated can insert sync logs" ON public.cms_sync_log FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');
