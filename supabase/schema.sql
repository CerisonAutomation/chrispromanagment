-- ============================================================
-- CMS Pages + Versioning Schema
-- Run this once in your Supabase project SQL editor:
-- https://app.supabase.com/project/_/sql
-- ============================================================

create extension if not exists "uuid-ossp";

-- CMS pages table
create table if not exists public.cms_pages (
  id          uuid primary key default uuid_generate_v4(),
  slug        text not null unique,
  title       text not null default 'Untitled',
  data        text not null default '{}',
  theme       text not null default 'malta-gold',
  published   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Version history
create table if not exists public.cms_page_versions (
  id          uuid primary key default uuid_generate_v4(),
  page_id     uuid not null references public.cms_pages(id) on delete cascade,
  data        text not null,
  created_at  timestamptz not null default now(),
  created_by  text
);

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists cms_pages_updated_at on public.cms_pages;
create trigger cms_pages_updated_at
  before update on public.cms_pages
  for each row execute procedure public.handle_updated_at();

-- Auto-save version on every data update
create or replace function public.save_page_version()
returns trigger language plpgsql as $$
begin
  if old.data is distinct from new.data then
    insert into public.cms_page_versions (page_id, data)
    values (old.id, old.data);
  end if;
  return new;
end;
$$;

drop trigger if exists cms_pages_version on public.cms_pages;
create trigger cms_pages_version
  before update on public.cms_pages
  for each row execute procedure public.save_page_version();

-- RLS
alter table public.cms_pages enable row level security;
alter table public.cms_page_versions enable row level security;

-- Public can read published pages
create policy "public_read_published" on public.cms_pages
  for select using (published = true);

-- Service role (server) has full access — enforced via db.ts service key
create policy "service_full_access" on public.cms_pages
  for all using (auth.role() = 'service_role');

create policy "service_full_access_versions" on public.cms_page_versions
  for all using (auth.role() = 'service_role');

-- Seed default pages
insert into public.cms_pages (slug, title, data, theme, published)
values
  ('home',       'Home',       '{"blocks":[]}', 'malta-gold', true),
  ('properties', 'Properties', '{"blocks":[]}', 'malta-gold', true),
  ('book',       'Book Now',   '{"blocks":[]}', 'malta-gold', true),
  ('about',      'About',      '{"blocks":[]}', 'malta-gold', true),
  ('faq',        'FAQ',        '{"blocks":[]}', 'malta-gold', false)
on conflict (slug) do nothing;
