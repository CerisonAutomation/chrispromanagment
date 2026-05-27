-- Idempotency keys table for Guesty API operations
-- Ensures that duplicate requests with the same key return the same result
-- Prevents race conditions and duplicate operations

create table if not exists public.guesty_idempotency_keys (
  id            bigint generated always as identity primary key,
  key           text not null,
  operation     text not null,
  params        jsonb,
  result        jsonb,
  status        text not null check (status in ('pending', 'completed', 'failed')),
  response_code integer,
  created_at    timestamptz not null default now(),
  completed_at  timestamptz,
  expires_at    timestamptz not null default (now() + interval '24 hours'),
  
  -- Unique constraint ensures only one operation per key
  constraint guesty_idempotency_keys_key_unique unique (key)
);

-- Index for fast lookups by key
create index if not exists idx_guesty_idempotency_keys_key
  on public.guesty_idempotency_keys (key)
  where expires_at > now();

-- Index for cleanup of expired keys
create index if not exists idx_guesty_idempotency_keys_expires_at
  on public.guesty_idempotency_keys (expires_at);

-- Enable row level security
alter table public.guesty_idempotency_keys enable row level security;

-- Service role can do everything (for backend operations)
create policy "Service role can manage idempotency keys"
  on public.guesty_idempotency_keys for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- Anonymous users can insert keys (for client-side operations)
create policy "Anonymous can insert idempotency keys"
  on public.guesty_idempotency_keys for insert
  with check (auth.role() = 'anon');

-- Authenticated users can insert and read keys
create policy "Authenticated users can manage idempotency keys"
  on public.guesty_idempotency_keys for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

-- Function to check if an idempotency key exists and return its result
create or replace function public.get_idempotency_result(p_key text)
returns table (
  exists boolean,
  result jsonb,
  status text
)
language sql
security definer
as $$
  select
    exists(select 1 from public.guesty_idempotency_keys where key = p_key and expires_at > now()),
    (select result from public.guesty_idempotency_keys where key = p_key and expires_at > now() limit 1),
    (select status from public.guesty_idempotency_keys where key = p_key and expires_at > now() limit 1)
$$;

-- Function to create a new idempotency key entry
create or replace function public.create_idempotency_key(
  p_key text,
  p_operation text,
  p_params jsonb default '{}'
)
returns boolean
language plpgsql
security definer
as $$
declare
  v_created boolean;
begin
  insert into public.guesty_idempotency_keys (key, operation, params, status)
  values (p_key, p_operation, p_params, 'pending')
  on conflict (key) do nothing;
  
  v_created := not exists(
    select 1 from public.guesty_idempotency_keys
    where key = p_key and status = 'pending'
  );
  
  return not v_created; -- Returns true if we created it (i.e., it's the first time)
end;
$$;

-- Function to complete an idempotency key operation
create or replace function public.complete_idempotency_key(
  p_key text,
  p_result jsonb,
  p_status text,
  p_response_code integer default null
)
returns void
language plpgsql
security definer
as $$
begin
  update public.guesty_idempotency_keys
  set
    result = p_result,
    status = p_status,
    response_code = p_response_code,
    completed_at = now()
  where key = p_key;
end;
$$;

-- Function to cleanup expired idempotency keys (run via pg_cron)
create or replace function public.cleanup_expired_idempotency_keys()
returns void
language sql
security definer
as $$
  delete from public.guesty_idempotency_keys
  where expires_at < now();
$$;

-- Schedule cleanup every hour
select cron.schedule(
  'cleanup-guesty-idempotency-keys',
  '0 * * * *',
  'select public.cleanup_expired_idempotency_keys()'
) where not exists (
  select 1 from cron.job where jobname = 'cleanup-guesty-idempotency-keys'
);

-- Add comment for documentation
comment on table public.guesty_idempotency_keys is 'Stores idempotency keys for Guesty API operations to prevent duplicate requests and ensure consistency';
comment on column public.guesty_idempotency_keys.key is 'Unique identifier for the operation (typically a UUID)';
comment on column public.guesty_idempotency_keys.operation is 'The type of operation (e.g., create-reservation, create-quote)';
comment on column public.guesty_idempotency_keys.params is 'The request parameters for the operation';
comment on column public.guesty_idempotency_keys.result is 'The cached result of the operation';
comment on column public.guesty_idempotency_keys.status is 'Current status: pending, completed, or failed';
comment on column public.guesty_idempotency_keys.expires_at is 'When this key expires and can be cleaned up';
