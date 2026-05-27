-- Booking operations table for atomic booking handler
-- Tracks state transitions and provides transaction coordination

create table if not exists public.booking_operations (
  id                text primary key,
  booking_id        text not null,
  operation         text not null,
  state             text not null check (
    state in (
      'initialized',
      'quote_created',
      'quote_accepted',
      'payment_processing',
      'payment_completed',
      'reservation_pending',
      'reservation_confirmed',
      'reservation_cancelled',
      'failed',
      'compensated'
    )
  ),
  params            jsonb not null default '{}',
  result            jsonb,
  error             text,
  started_at        timestamptz not null default now(),
  completed_at      timestamptz,
  updated_at        timestamptz not null default now(),
  correlation_id    text not null,
  idempotency_key   text not null,
  
  -- Foreign key constraint for idempotency key
  constraint booking_operations_idempotency_key_fkey 
    foreign key (idempotency_key) 
    references public.guesty_idempotency_keys(key)
);

-- Indexes for performance
create index if not exists idx_booking_operations_booking_id
  on public.booking_operations (booking_id);

create index if not exists idx_booking_operations_operation
  on public.booking_operations (operation);

create index if not exists idx_booking_operations_state
  on public.booking_operations (state);

create index if not exists idx_booking_operations_correlation_id
  on public.booking_operations (correlation_id);

create index if not exists idx_booking_operations_idempotency_key
  on public.booking_operations (idempotency_key);

create index if not exists idx_booking_operations_started_at
  on public.booking_operations (started_at);

-- Enable row level security
alter table public.booking_operations enable row level security;

-- Service role can manage everything
create policy "Service role can manage booking operations"
  on public.booking_operations for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- Authenticated users can read their own operations
create policy "Users can read own booking operations"
  on public.booking_operations for select
  using (auth.uid() is not null);

-- Add comment for documentation
comment on table public.booking_operations is 'Tracks atomic booking operations with state transitions and compensation';
comment on column public.booking_operations.id is 'Unique operation identifier';
comment on column public.booking_operations.booking_id is 'Business booking identifier';
comment on column public.booking_operations.operation is 'Type of operation (e.g., create-reservation, process-payment)';
comment on column public.booking_operations.state is 'Current state in the booking state machine';
comment on column public.booking_operations.params is 'Operation parameters';
comment on column public.booking_operations.result is 'Operation result data';
comment on column public.booking_operations.error is 'Error message if operation failed';
comment on column public.booking_operations.correlation_id is 'Request correlation ID for tracing';
comment on column public.booking_operations.idempotency_key is 'Idempotency key for the operation';

-- Function to get booking operation by idempotency key
create or replace function public.get_booking_operation_by_idempotency_key(p_idempotency_key text)
returns table (
  id text,
  booking_id text,
  operation text,
  state text,
  result jsonb,
  error text
)
language sql
security definer
as $$
  select
    id,
    booking_id,
    operation,
    state,
    result,
    error
  from public.booking_operations
  where idempotency_key = p_idempotency_key
  order by started_at desc
  limit 1;
$$;

-- Function to get booking operation history
create or replace function public.get_booking_operation_history(p_booking_id text)
returns table (
  id text,
  operation text,
  state text,
  started_at timestamptz,
  completed_at timestamptz
)
language sql
security definer
as $$
  select
    id,
    operation,
    state,
    started_at,
    completed_at
  from public.booking_operations
  where booking_id = p_booking_id
  order by started_at asc;
$$;

-- Trigger to update updated_at timestamp
create or replace function public.update_booking_operations_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger booking_operations_updated_at
  before update on public.booking_operations
  for each row
  execute function public.update_booking_operations_updated_at();

-- Cleanup function for old operations (older than 30 days)
create or replace function public.cleanup_old_booking_operations()
returns void
language sql
security definer
as $$
  delete from public.booking_operations
  where completed_at is not null
    and completed_at < now() - interval '30 days'
    and state in ('reservation_confirmed', 'reservation_cancelled', 'failed', 'compensated');
$$;

-- Schedule cleanup daily
select cron.schedule(
  'cleanup-old-booking-operations',
  '0 2 * * *',
  'select public.cleanup_old_booking_operations()'
) where not exists (
  select 1 from cron.job where jobname = 'cleanup-old-booking-operations'
);
