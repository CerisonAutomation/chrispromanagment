-- Chat tables migration
CREATE TABLE IF NOT EXISTS public.chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.chat_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  last_seen_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(room_id, user_id)
);

-- Enable RLS
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_rooms
CREATE POLICY "Users can view their own chat rooms"
  ON public.chat_rooms
  FOR SELECT
  USING (auth.uid() = owner_id OR auth.uid() = guest_id);

CREATE POLICY "Owners can create chat rooms"
  ON public.chat_rooms
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- RLS Policies for chat_messages
CREATE POLICY "Users can view messages in their rooms"
  ON public.chat_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_rooms
      WHERE id = chat_messages.room_id
      AND (owner_id = auth.uid() OR guest_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages to their rooms"
  ON public.chat_messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_rooms
      WHERE id = chat_messages.room_id
      AND (owner_id = auth.uid() OR guest_id = auth.uid())
    )
    AND sender_id = auth.uid()
  );

-- RLS Policies for chat_participants
CREATE POLICY "Users can view participants in their rooms"
  ON public.chat_participants
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_rooms
      WHERE id = chat_participants.room_id
      AND (owner_id = auth.uid() OR guest_id = auth.uid())
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_chat_rooms_property_id ON public.chat_rooms(property_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_owner_id ON public.chat_rooms(owner_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_guest_id ON public.chat_rooms(guest_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON public.chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON public.chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_room_id ON public.chat_participants(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_user_id ON public.chat_participants(user_id);
