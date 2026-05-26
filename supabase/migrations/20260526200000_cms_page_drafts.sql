-- CMS page drafts: stores block editor page state
create table if not exists cms_page_drafts (
  page_slug      text primary key,
  blocks         jsonb not null default '[]',
  saved_at       timestamptz,
  published_at   timestamptz,
  status         text not null default 'draft' check (status in ('draft', 'published')),
  created_at     timestamptz not null default now()
);

alter table cms_page_drafts enable row level security;

create policy "service_role full access" on cms_page_drafts
  for all to service_role using (true) with check (true);

create policy "authenticated read" on cms_page_drafts
  for select to authenticated using (true);

-- Extend cms_page_seo with keywords and og_image columns if not present
alter table cms_page_seo
  add column if not exists meta_keywords text,
  add column if not exists og_image      text;
