-- Contact form submissions
create table if not exists public.contact_submissions (
  id          bigint generated always as identity primary key,
  name        text not null,
  email       text not null,
  phone       text,
  subject     text,
  message     text not null,
  status      text not null default 'new', -- new | read | replied
  created_at  timestamptz not null default now()
);
alter table public.contact_submissions enable row level security;
create policy "Anyone can insert contact" on public.contact_submissions for insert with check (true);
create policy "Admins read contacts" on public.contact_submissions for select using (auth.role() = 'service_role' or auth.role() = 'authenticated');
create policy "Admins update contacts" on public.contact_submissions for update using (auth.role() = 'service_role' or auth.role() = 'authenticated');

-- Property owner inquiries
create table if not exists public.owner_inquiries (
  id                  bigint generated always as identity primary key,
  name                text not null,
  email               text not null,
  phone               text,
  property_type       text,
  location            text,
  bedrooms            text,
  bathrooms           text,
  max_guests          text,
  services_interested text,
  currently_listed    text,
  expected_revenue    text,
  additional_info     text,
  status              text not null default 'new',
  created_at          timestamptz not null default now()
);
alter table public.owner_inquiries enable row level security;
create policy "Anyone can insert owner inquiry" on public.owner_inquiries for insert with check (true);
create policy "Admins read owner inquiries" on public.owner_inquiries for select using (auth.role() = 'service_role' or auth.role() = 'authenticated');
create policy "Admins update owner inquiries" on public.owner_inquiries for update using (auth.role() = 'service_role' or auth.role() = 'authenticated');

-- Discount coupons
create table if not exists public.coupons (
  id              bigint generated always as identity primary key,
  code            text not null unique,
  description     text,
  discount_type   text not null default 'percentage', -- percentage | fixed
  discount_value  numeric(10,2) not null,
  active          boolean not null default true,
  usage_count     integer not null default 0,
  max_uses        integer,
  expires_at      timestamptz,
  created_at      timestamptz not null default now()
);
alter table public.coupons enable row level security;
create policy "Public can read active coupons" on public.coupons for select using (active = true);
create policy "Service role manages coupons" on public.coupons for all using (auth.role() = 'service_role' or auth.role() = 'authenticated');

-- Reservations cache (populated by guesty webhook)
create table if not exists public.reservations_cache (
  guesty_id         text primary key,
  listing_id        text references public.guesty_properties_cache(guesty_id) on delete cascade,
  guest_name        text,
  guest_email       text,
  check_in          date,
  check_out         date,
  nights            integer,
  guests            integer,
  total_price       numeric(10,2),
  currency          text not null default 'EUR',
  status            text not null default 'confirmed', -- confirmed | cancelled | inquiry
  channel           text, -- airbnb | booking.com | direct
  last_synced_at    timestamptz not null default now(),
  created_at        timestamptz not null default now()
);
alter table public.reservations_cache enable row level security;
create policy "Service role manages reservations" on public.reservations_cache for all using (auth.role() = 'service_role');
create policy "Authenticated reads reservations" on public.reservations_cache for select using (auth.role() = 'authenticated');

create index if not exists idx_reservations_listing on public.reservations_cache(listing_id);
create index if not exists idx_reservations_checkin on public.reservations_cache(check_in);
create index if not exists idx_reservations_status on public.reservations_cache(status);
