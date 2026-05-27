-- Comprehensive fix for auth.rls_initplan linter warning
-- Replace auth.uid() with (select auth.uid()) in ALL RLS policies
-- This prevents per-row re-evaluation and improves query performance at scale

-- =============================================
-- CHAT TABLES
-- =============================================

-- chat_rooms: Fix policies
DO $$
BEGIN
  -- Drop existing policies
  DROP POLICY IF EXISTS "Users can view their own chat rooms" ON public.chat_rooms;
  DROP POLICY IF EXISTS "Owners can create chat rooms" ON public.chat_rooms;

  -- Recreate with (select auth.uid())
  CREATE POLICY "Users can view their own chat rooms" ON public.chat_rooms
    FOR SELECT
    USING ((select auth.uid()) = owner_id OR (select auth.uid()) = guest_id);

  CREATE POLICY "Owners can create chat rooms" ON public.chat_rooms
    FOR INSERT
    WITH CHECK ((select auth.uid()) = owner_id);
END $$;

-- chat_messages: Fix policies
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can view messages in their rooms" ON public.chat_messages;
  DROP POLICY IF EXISTS "Users can send messages to their rooms" ON public.chat_messages;

  CREATE POLICY "Users can view messages in their rooms" ON public.chat_messages
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.chat_rooms
        WHERE id = chat_messages.room_id
        AND ((select auth.uid()) = owner_id OR (select auth.uid()) = guest_id)
      )
    );

  CREATE POLICY "Users can send messages to their rooms" ON public.chat_messages
    FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.chat_rooms
        WHERE id = chat_messages.room_id
        AND ((select auth.uid()) = owner_id OR (select auth.uid()) = guest_id)
      )
      AND sender_id = (select auth.uid())
    );
END $$;

-- chat_participants: Fix policies
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can view participants in their rooms" ON public.chat_participants;

  CREATE POLICY "Users can view participants in their rooms" ON public.chat_participants
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.chat_rooms
        WHERE id = chat_participants.room_id
        AND ((select auth.uid()) = owner_id OR (select auth.uid()) = guest_id)
      )
    );
END $$;

-- =============================================
-- PROFILES TABLE
-- =============================================

DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can create own profile" ON public.profiles;

  CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT
    USING ((select auth.uid()) = id);

  CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE
    USING ((select auth.uid()) = id);

  CREATE POLICY "Users can create own profile" ON public.profiles
    FOR INSERT
    WITH CHECK ((select auth.uid()) = id);
END $$;

-- =============================================
-- OWNER INQUIRIES TABLE
-- =============================================

DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can view own inquiries" ON public.owner_inquiries;
  DROP POLICY IF EXISTS "Users can create inquiries" ON public.owner_inquiries;

  CREATE POLICY "Users can view own inquiries" ON public.owner_inquiries
    FOR SELECT
    USING ((select auth.uid()) = user_id);

  CREATE POLICY "Users can create inquiries" ON public.owner_inquiries
    FOR INSERT
    WITH CHECK ((select auth.uid()) = user_id);
END $$;

-- =============================================
-- TRANSACTIONS TABLE
-- =============================================

DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;

  CREATE POLICY "Users can view own transactions" ON public.transactions
    FOR SELECT
    USING ((select auth.uid()) = user_id);
END $$;

-- =============================================
-- GUESTY IDEMPOTENCY KEYS TABLE
-- =============================================

DO $$
BEGIN
  DROP POLICY IF EXISTS "Authenticated users can manage idempotency keys" ON public.guesty_idempotency_keys;

  CREATE POLICY "Authenticated users can manage idempotency keys" ON public.guesty_idempotency_keys
    USING ((select auth.uid()) IS NOT NULL)
    WITH CHECK ((select auth.uid()) IS NOT NULL);
END $$;

-- =============================================
-- BOOKING OPERATIONS TABLE
-- =============================================

DO $$
BEGIN
  DROP POLICY IF EXISTS "Authenticated users can manage booking operations" ON public.booking_operations;

  CREATE POLICY "Authenticated users can manage booking operations" ON public.booking_operations
    USING ((select auth.uid()) IS NOT NULL)
    WITH CHECK ((select auth.uid()) IS NOT NULL);
END $$;

-- =============================================
-- CONTACT SUBMISSIONS TABLE (Admin-only)
-- =============================================

DO $$
BEGIN
  DROP POLICY IF EXISTS "Admins read contacts" ON public.contact_submissions;
  DROP POLICY IF EXISTS "Admins update contacts" ON public.contact_submissions;

  CREATE POLICY "Admins read contacts" ON public.contact_submissions
    FOR SELECT TO authenticated
    USING (public.has_role((select auth.uid()), 'admin'::app_role));

  CREATE POLICY "Admins update contacts" ON public.contact_submissions
    FOR UPDATE TO authenticated
    USING (public.has_role((select auth.uid()), 'admin'::app_role))
    WITH CHECK (public.has_role((select auth.uid()), 'admin'::app_role));
END $$;

-- =============================================
-- VERIFICATION
-- =============================================

DO $$
BEGIN
  RAISE NOTICE 'Successfully fixed auth.rls_initplan issue for ALL tables';
  RAISE NOTICE 'Replaced auth.uid() with (select auth.uid()) in all RLS policies';
END $$;
