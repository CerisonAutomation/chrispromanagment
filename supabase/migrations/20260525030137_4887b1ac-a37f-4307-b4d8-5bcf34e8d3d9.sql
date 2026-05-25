CREATE TABLE IF NOT EXISTS public.cms_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL DEFAULT 'Snapshot',
  note text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','baseline','autosave')),
  snapshot jsonb NOT NULL,
  content_count integer NOT NULL DEFAULT 0,
  image_count integer NOT NULL DEFAULT 0,
  setting_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  published_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_cms_versions_created_at ON public.cms_versions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cms_versions_status ON public.cms_versions(status);

ALTER TABLE public.cms_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Editors read versions"
  ON public.cms_versions FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Editors create versions"
  ON public.cms_versions FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Admins update versions"
  ON public.cms_versions FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins delete versions"
  ON public.cms_versions FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));