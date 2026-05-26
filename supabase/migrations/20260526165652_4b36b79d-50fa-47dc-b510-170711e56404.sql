
CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id bigint generated always as identity primary key,
  name text not null,
  email text not null,
  phone text,
  subject text,
  message text not null,
  status text not null default 'new',
  created_at timestamptz not null default now()
);
GRANT INSERT ON public.contact_submissions TO anon, authenticated;
GRANT SELECT, UPDATE ON public.contact_submissions TO authenticated;
GRANT ALL ON public.contact_submissions TO service_role;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert contact" ON public.contact_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins read contacts" ON public.contact_submissions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins update contacts" ON public.contact_submissions FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE IF NOT EXISTS public.owner_inquiries (
  id bigint generated always as identity primary key,
  name text not null,
  email text not null,
  phone text,
  property_type text,
  location text,
  bedrooms text,
  bathrooms text,
  max_guests text,
  services_interested text,
  currently_listed text,
  expected_revenue text,
  additional_info text,
  status text not null default 'new',
  created_at timestamptz not null default now()
);
GRANT INSERT ON public.owner_inquiries TO anon, authenticated;
GRANT SELECT, UPDATE ON public.owner_inquiries TO authenticated;
GRANT ALL ON public.owner_inquiries TO service_role;
ALTER TABLE public.owner_inquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert owner inquiry" ON public.owner_inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins read owner inquiries" ON public.owner_inquiries FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins update owner inquiries" ON public.owner_inquiries FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE IF NOT EXISTS public.coupons (
  id bigint generated always as identity primary key,
  code text not null unique,
  description text,
  discount_type text not null default 'percentage',
  discount_value numeric(10,2) not null,
  active boolean not null default true,
  usage_count integer not null default 0,
  max_uses integer,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);
GRANT SELECT ON public.coupons TO anon, authenticated;
GRANT ALL ON public.coupons TO service_role;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read active coupons" ON public.coupons FOR SELECT USING (active = true);
CREATE POLICY "Admins manage coupons" ON public.coupons FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
