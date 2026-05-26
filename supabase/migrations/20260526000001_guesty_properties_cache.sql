-- Guesty properties cache table — populated by the guesty-webhook-handler edge function.
-- Frontend reads from here instead of calling Guesty API directly on every request.

create table if not exists public.guesty_properties_cache (
  guesty_id       text primary key,
  title           text,
  address_full    text,
  city            text,
  accommodates    integer,
  bedrooms        integer,
  bathrooms       integer,
  base_price      numeric(10, 2),
  currency        text not null default 'EUR',
  thumbnail       text,
  amenities       text[] not null default '{}',
  active          boolean not null default true,
  last_synced_at  timestamptz not null default now(),
  created_at      timestamptz not null default now()
);

alter table public.guesty_properties_cache enable row level security;

-- Public read for active properties (drives the frontend listing grid)
create policy "Public can read active properties"
  on public.guesty_properties_cache for select
  using (active = true);

-- Only service role can write (webhook handler uses service role key)
create policy "Service role can upsert properties"
  on public.guesty_properties_cache for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create index if not exists idx_guesty_properties_cache_city
  on public.guesty_properties_cache (city)
  where active = true;

create index if not exists idx_guesty_properties_cache_price
  on public.guesty_properties_cache (base_price)
  where active = true;

-- Webhook event log for debugging
create table if not exists public.guesty_webhook_log (
  id          bigint generated always as identity primary key,
  event_type  text not null,
  payload     jsonb,
  received_at timestamptz not null default now()
);

alter table public.guesty_webhook_log enable row level security;

create policy "Service role can insert webhook log"
  on public.guesty_webhook_log for insert
  with check (auth.role() = 'service_role');

-- Auto-purge log entries older than 30 days to avoid unbounded growth
create or replace function public.purge_old_webhook_logs()
returns void language sql security definer as $$
  delete from public.guesty_webhook_log where received_at < now() - interval '30 days';
$$;
