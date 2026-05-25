create table if not exists public.guesty_response_cache (
  cache_key text primary key,
  action text not null,
  payload jsonb not null,
  status_code int not null default 200,
  fetched_at timestamptz not null default now()
);

create index if not exists guesty_response_cache_action_idx on public.guesty_response_cache(action, fetched_at desc);

alter table public.guesty_response_cache enable row level security;

create policy "service role manages response cache"
  on public.guesty_response_cache
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');