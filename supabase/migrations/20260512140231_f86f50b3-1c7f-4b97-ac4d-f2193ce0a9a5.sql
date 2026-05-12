-- Wipe content from the previous frontend so the new app uses its built-in defaults
DELETE FROM public.cms_content;

-- Ensure realtime + full row payloads are enabled for live mirror
ALTER TABLE public.cms_content REPLICA IDENTITY FULL;
ALTER TABLE public.cms_settings REPLICA IDENTITY FULL;
ALTER TABLE public.cms_images REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'cms_content'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.cms_content;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'cms_settings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.cms_settings;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'cms_images'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.cms_images;
  END IF;
END $$;