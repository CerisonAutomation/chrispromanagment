ALTER PUBLICATION supabase_realtime ADD TABLE public.cms_content;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cms_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cms_images;
ALTER TABLE public.cms_content REPLICA IDENTITY FULL;
ALTER TABLE public.cms_settings REPLICA IDENTITY FULL;
ALTER TABLE public.cms_images REPLICA IDENTITY FULL;