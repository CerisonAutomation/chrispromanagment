CREATE TABLE public.cms_page_seo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug text NOT NULL UNIQUE,
  meta_title text,
  meta_description text,
  canonical_url text,
  og_image text,
  og_type text DEFAULT 'website',
  robots text DEFAULT 'index,follow',
  json_ld jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.cms_page_seo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read page seo"
  ON public.cms_page_seo FOR SELECT USING (true);

CREATE POLICY "Admins or editors insert page seo"
  ON public.cms_page_seo FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Admins or editors update page seo"
  ON public.cms_page_seo FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Admins delete page seo"
  ON public.cms_page_seo FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_cms_page_seo_updated_at
  BEFORE UPDATE ON public.cms_page_seo
  FOR EACH ROW EXECUTE FUNCTION public.update_cms_updated_at();

CREATE INDEX idx_cms_page_seo_slug ON public.cms_page_seo(page_slug);