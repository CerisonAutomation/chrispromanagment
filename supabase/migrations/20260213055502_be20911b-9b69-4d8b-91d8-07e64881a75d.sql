
-- CMS Content table: stores all editable content blocks
CREATE TABLE public.cms_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key TEXT NOT NULL UNIQUE,
  section_label TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- CMS Settings: global site settings (colors, fonts, logo, etc.)
CREATE TABLE public.cms_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL DEFAULT '{}',
  setting_label TEXT NOT NULL DEFAULT '',
  setting_group TEXT NOT NULL DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- CMS Images: store image references
CREATE TABLE public.cms_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_key TEXT NOT NULL UNIQUE,
  url TEXT NOT NULL,
  alt_text TEXT NOT NULL DEFAULT '',
  section_key TEXT REFERENCES public.cms_content(section_key) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Webhook logs for Zapier/Sheets sync tracking
CREATE TABLE public.cms_sync_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT NOT NULL,
  action TEXT NOT NULL,
  payload JSONB,
  status TEXT NOT NULL DEFAULT 'success',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cms_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_sync_log ENABLE ROW LEVEL SECURITY;

-- Public read access (site needs to read content)
CREATE POLICY "Anyone can read cms content" ON public.cms_content FOR SELECT USING (true);
CREATE POLICY "Anyone can read cms settings" ON public.cms_settings FOR SELECT USING (true);
CREATE POLICY "Anyone can read cms images" ON public.cms_images FOR SELECT USING (true);

-- Authenticated users can modify (admin)
CREATE POLICY "Authenticated users can insert cms content" ON public.cms_content FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update cms content" ON public.cms_content FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete cms content" ON public.cms_content FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert cms settings" ON public.cms_settings FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update cms settings" ON public.cms_settings FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete cms settings" ON public.cms_settings FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert cms images" ON public.cms_images FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update cms images" ON public.cms_images FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete cms images" ON public.cms_images FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read sync logs" ON public.cms_sync_log FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Anyone can insert sync logs" ON public.cms_sync_log FOR INSERT WITH CHECK (true);

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_cms_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_cms_content_updated_at BEFORE UPDATE ON public.cms_content FOR EACH ROW EXECUTE FUNCTION public.update_cms_updated_at();
CREATE TRIGGER update_cms_settings_updated_at BEFORE UPDATE ON public.cms_settings FOR EACH ROW EXECUTE FUNCTION public.update_cms_updated_at();

-- Seed default content from the current site
INSERT INTO public.cms_content (section_key, section_label, content, sort_order) VALUES
('navigation', 'Navigation Menu', '{"items": [{"label": "Process", "href": "#process"}, {"label": "Portfolio", "href": "#portfolio"}, {"label": "Pricing", "href": "#pricing"}, {"label": "FAQ", "href": "#faq"}]}', 0),
('hero', 'Hero Section', '{"tagline": "Malta''s Premier Property Partner", "headline": "Maximise your rental income,", "highlightedWord": "effortlessly.", "description": "Full-service short-let management across Malta & Gozo. We handle everything — you earn more.", "ctaText": "Get Your Free Assessment", "secondaryCtaText": "How It Works"}', 1),
('stats', 'Statistics Strip', '{"items": [{"value": "€2.4M+", "label": "Revenue Generated"}, {"value": "45+", "label": "Properties Managed"}, {"value": "4.97", "label": "Average Rating"}, {"value": "94%", "label": "Occupancy Rate"}]}', 2),
('proof', 'Proof Strip', '{}', 3),
('process', 'Process Section', '{}', 4),
('portfolio', 'Portfolio Section', '{}', 5),
('pricing', 'Pricing Section', '{}', 6),
('faq', 'FAQ Section', '{}', 7),
('footer', 'Footer', '{}', 8);

INSERT INTO public.cms_settings (setting_key, setting_label, setting_value, setting_group) VALUES
('site_name', 'Site Name', '"Christiano Property Management"', 'general'),
('primary_color', 'Primary Color', '"#C6A962"', 'styling'),
('logo_url', 'Logo URL', '""', 'branding'),
('whatsapp_number', 'WhatsApp Number', '"+35679790202"', 'contact'),
('google_sheets_id', 'Google Sheets ID', '""', 'integrations'),
('zapier_webhook_url', 'Zapier Webhook URL', '""', 'integrations');
