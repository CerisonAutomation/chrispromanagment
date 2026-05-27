// @ts-nocheck
import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface ChatRoom {
  id: string;
  property_id: string | null;
  guest_email: string;
  guest_name: string | null;
  owner_id: string | null;
  status: string;
  subject: string | null;
  unread_count?: number;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string | null;
  sender_name: string | null;
  content: string;
  is_read: boolean;
  created_at: string;
}

interface ChatState {
  rooms: ChatRoom[];
  messages: ChatMessage[];
  activeRoomId: string | null;
  loading: boolean;
  sending: boolean;
  channel: RealtimeChannel | null;

  // actions
  fetchRooms: () => Promise<void>;
  fetchMessages: (roomId: string) => Promise<void>;
  setActiveRoom: (roomId: string | null) => void;
  sendMessage: (content: string, roomId?: string) => Promise<void>;
  createRoom: (guestEmail: string, guestName: string, subject?: string, propertyId?: string) => Promise<ChatRoom>;
  closeRoom: (roomId: string) => Promise<void>;
  markRead: (roomId: string) => Promise<void>;
  subscribeMessages: (roomId: string) => () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  rooms: [],
  messages: [],
  activeRoomId: null,
  loading: false,
  sending: false,
  channel: null,

  async fetchRooms() {
    set({ loading: true });
    const { data } = await supabase
      .from('chat_rooms')
      .select('*')
      .order('updated_at', { ascending: false });
    set({ rooms: (data as ChatRoom[]) || [], loading: false });
  },

  async fetchMessages(roomId) {
    set({ loading: true });
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true });
    set({ messages: (data as ChatMessage[]) || [], loading: false });
  },

  setActiveRoom(roomId) {
    set({ activeRoomId: roomId, messages: [] });
    if (roomId) {
      get().fetchMessages(roomId);
      get().markRead(roomId);
    }
  },

  async sendMessage(content, roomId) {
    const targetRoomId = roomId ?? get().activeRoomId;
    if (!targetRoomId) {
throw new Error('No active room');
}
    set({ sending: true });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('chat_messages').insert({
        room_id: targetRoomId,
        sender_id: user?.id ?? null,
        sender_name: user?.user_metadata?.display_name ?? user?.email ?? 'Admin',
        content,
      });
      if (error) {
throw error;
}
      await supabase.from('chat_rooms')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', targetRoomId);
    } finally {
      set({ sending: false });
    }
  },

  async createRoom(guestEmail, guestName, subject, propertyId) {
    const { data, error } = await supabase.from('chat_rooms').insert({
      guest_email: guestEmail,
      guest_name: guestName,
      subject: subject ?? null,
      property_id: propertyId ?? null,
    }).select().single();
    if (error) {
throw error;
}
    const room = data as ChatRoom;
    set(s => ({ rooms: [room, ...s.rooms] }));
    return room;
  },

  async closeRoom(roomId) {
    const { error } = await supabase.from('chat_rooms').update({ status: 'closed' }).eq('id', roomId);
    if (error) {
throw error;
}
    set(s => ({ rooms: s.rooms.map(r => r.id === roomId ? { ...r, status: 'closed' } : r) }));
  },

  async markRead(roomId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
return;
}
    await supabase.from('chat_messages')
      .update({ is_read: true })
      .eq('room_id', roomId)
      .neq('sender_id', user.id)
      .eq('is_read', false);
  },

  subscribeMessages(roomId) {
    const { channel: existing } = get();
    if (existing) {
supabase.removeChannel(existing);
}

    const ch = supabase.channel(`chat-store:${roomId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'chat_messages',
        filter: `room_id=eq.${roomId}`,
      }, (payload) => {
        set(s => ({ messages: [...s.messages, payload.new as ChatMessage] }));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_rooms' }, () => {
        get().fetchRooms();
      })
      .subscribe();

    set({ channel: ch });
    return () => {
 supabase.removeChannel(ch); set({ channel: null }); 
};
  },
}));