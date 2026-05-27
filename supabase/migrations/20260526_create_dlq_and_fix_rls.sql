-- Create dead letter queue table for failed QStash jobs
CREATE TABLE IF NOT EXISTS public.qstash_dlq (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id TEXT NOT NULL,
  job_type TEXT NOT NULL,
  payload JSONB,
  error_message TEXT,
  error_stack TEXT,
  attempt INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  resolution TEXT CHECK (resolution IN ('retried', 'discarded', 'fixed'))
);

-- Enable RLS on DLQ
ALTER TABLE public.qstash_dlq ENABLE ROW LEVEL SECURITY;

-- Only service role can access DLQ (admin-only)
CREATE POLICY "Service role full access on dlq" ON public.qstash_dlq
  FOR ALL USING (auth.role() = 'service_role');

-- Index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_qstash_dlq_message_id ON public.qstash_dlq(message_id);
CREATE INDEX IF NOT EXISTS idx_qstash_dlq_job_type ON public.qstash_dlq(job_type);
CREATE INDEX IF NOT EXISTS idx_qstash_dlq_created_at ON public.qstash_dlq(created_at DESC);

-- Fix RLS on sensitive tables that are missing proper policies
-- guesty_tokens: should only be accessible by service role
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'guesty_tokens' AND policyname = 'Service role only'
  ) THEN
    CREATE POLICY "Service role only on guesty_tokens" ON public.guesty_tokens
      FOR ALL USING (auth.role() = 'service_role');
  END IF;
END $$;

-- profiles: users can only see their own profile
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view own profile'
  ) THEN
    CREATE POLICY "Users can view own profile" ON public.profiles
      FOR SELECT USING (auth.uid() = id);
    CREATE POLICY "Users can update own profile" ON public.profiles
      FOR UPDATE USING (auth.uid() = id);
  END IF;
END $$;

-- contact_submissions: only authenticated users (admin) can view
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'contact_submissions' AND policyname = 'Authenticated users can view submissions'
  ) THEN
    CREATE POLICY "Authenticated users can view submissions" ON public.contact_submissions
      FOR SELECT USING (auth.role() = 'authenticated');
    CREATE POLICY "Anyone can submit contact form" ON public.contact_submissions
      FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- owner_inquiries: users can only see their own inquiries
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'owner_inquiries' AND policyname = 'Users can view own inquiries'
  ) THEN
    CREATE POLICY "Users can view own inquiries" ON public.owner_inquiries
      FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users can create inquiries" ON public.owner_inquiries
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- transactions: users can only see their own transactions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'transactions' AND policyname = 'Users can view own transactions'
  ) THEN
    CREATE POLICY "Users can view own transactions" ON public.transactions
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

-- reservations_cache: service role only (cached data)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'reservations_cache' AND policyname = 'Service role only on reservations_cache'
  ) THEN
    CREATE POLICY "Service role only on reservations_cache" ON public.reservations_cache
      FOR ALL USING (auth.role() = 'service_role');
  END IF;
END $$;

-- guesty_*_cache tables: service role only
DO $$
DECLARE
  cache_table TEXT;
BEGIN
  FOREACH cache_table IN ARRAY ARRAY[
    'guesty_properties_cache', 'guesty_calendar_cache', 'guesty_payment_cache',
    'guesty_reviews_cache', 'guesty_quotes_cache', 'guesty_response_cache',
    'guesty_listings_cache', 'guesty_listing_list_cache', 'guesty_availability_cache',
    'guesty_cities_cache', 'guesty_money_cache'
  ] LOOP
    EXECUTE format('
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = %L AND policyname = ''Service role only'') THEN
          CREATE POLICY "Service role only" ON public.%I FOR ALL USING (auth.role() = ''service_role'');
        END IF;
      END $$;
    ', cache_table, cache_table);
  END LOOP;
END $$;
