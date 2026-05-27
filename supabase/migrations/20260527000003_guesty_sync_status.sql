-- Guesty sync status tracking table
-- Tracks synchronization status between local database and Guesty API

create table if not exists public.guesty_sync_status (
  id               bigint generated always as identity primary key,
  entity           text not null check (entity in ('listing', 'reservation', 'calendar', 'quote')),
  entity_id        text not null,
  last_synced_at   timestamptz not null default now(),
  sync_status      text not null check (sync_status in ('synced', 'pending', 'conflict', 'error')),
  last_error       text,
  data_hash        text,
  guesty_data_hash text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  
  -- Unique constraint per entity
  constraint guesty_sync_status_entity_unique unique (entity, entity_id)
);

-- Indexes for performance
create index if not exists idx_guesty_sync_status_entity
  on public.guesty_sync_status (entity);

create index if not exists idx_guesty_sync_status_sync_status
  on public.guesty_sync_status (sync_status);

create index if not exists idx_guesty_sync_status_last_synced_at
  on public.guesty_sync_status (last_synced_at);

-- Enable row level security
alter table public.guesty_sync_status enable row level security;

-- Service role can manage everything
create policy "Service role can manage sync status"
  on public.guesty_sync_status for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- Authenticated users can read sync status
create policy "Users can read sync status"
  on public.guesty_sync_status for select
  using (auth.uid() is not null);

-- Add comment for documentation
comment on table public.guesty_sync_status is 'Tracks synchronization status between local database and Guesty API';
comment on column public.guesty_sync_status.entity is 'Type of entity (listing, reservation, calendar, quote)';
comment on column public.guesty_sync_status.entity_id is 'ID of the entity';
comment on column public.guesty_sync_status.sync_status is 'Current sync status: synced, pending, conflict, or error';
comment on column public.guesty_sync_status.data_hash is 'Hash of local data for comparison';
comment on column public.guesty_sync_status.guesty_data_hash is 'Hash of Guesty data for comparison';

-- Function to get entities that need syncing
create or replace function public.get_entities_needing_sync(p_entity text, p_hours_ago integer default 24)
returns table (
  entity_id text,
  last_synced_at timestamptz,
  sync_status text
)
language sql
security definer
as $$
  select
    entity_id,
    last_synced_at,
    sync_status
  from public.guesty_sync_status
  where entity = p_entity
    and (
      sync_status != 'synced'
      or last_synced_at < now() - (p_hours_ago || ' hours')::interval
    )
  order by last_synced_at asc
  limit 100;
$$;

-- Function to mark entity as pending sync
create or replace function public.mark_entity_pending_sync(p_entity text, p_entity_id text)
returns void
language plpgsql
security definer
as $$
begin
  insert into public.guesty_sync_status (entity, entity_id, sync_status, last_synced_at)
  values (p_entity, p_entity_id, 'pending', now())
  on conflict (entity, entity_id)
  do update set
    sync_status = 'pending',
    last_synced_at = now();
end;
$$;

-- Trigger to update updated_at timestamp
create or replace function public.update_guesty_sync_status_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger guesty_sync_status_updated_at
  before update on public.guesty_sync_status
  for each row
  execute function public.update_guesty_sync_status_updated_at();

-- Cleanup function for old sync status entries (older than 90 days)
create or replace function public.cleanup_old_sync_status()
returns void
language sql
security definer
as $$
  delete from public.guesty_sync_status
  where last_synced_at < now() - interval '90 days';
$$;

-- Schedule cleanup weekly
select cron.schedule(
  'cleanup-old-sync-status',
  '0 3 * * 0',
  'select public.cleanup_old_sync_status()'
) where not exists (
  select 1 from cron.job where jobname = 'cleanup-old-sync-status'
);
