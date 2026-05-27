// @ts-nocheck
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string | null;
  sender_name: string | null;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface ChatRoom {
  id: string;
  property_id: string | null;
  guest_email: string;
  guest_name: string | null;
  owner_id: string | null;
  status: string;
  subject: string | null;
  created_at: string;
  updated_at: string;
}

export function useChat(roomId?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  const fetchRooms = useCallback(async () => {
    const { data, error } = await supabase
      .from('chat_rooms')
      .select('*')
      .order('updated_at', { ascending: false });
    if (error) setError(error as unknown as Error);
    setRooms((data as ChatRoom[]) || []);
  }, []);

  const fetchMessages = useCallback(async (id: string) => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('room_id', id)
      .order('created_at', { ascending: true });
    if (error) setError(error as unknown as Error);
    setMessages((data as ChatMessage[]) || []);
  }, []);

  const sendMessage = useCallback(async (content: string, targetRoomId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('chat_messages').insert({
      room_id: targetRoomId,
      sender_id: user?.id ?? null,
      sender_name: user?.user_metadata?.display_name ?? user?.email ?? 'Admin',
      content,
    });
    if (error) throw error;
    await supabase.from('chat_rooms').update({ updated_at: new Date().toISOString() }).eq('id', targetRoomId);
  }, []);

  const createRoom = useCallback(async (guestEmail: string, guestName: string, subject?: string, propertyId?: string) => {
    const { data, error } = await supabase.from('chat_rooms').insert({
      guest_email: guestEmail,
      guest_name: guestName,
      subject: subject ?? null,
      property_id: propertyId ?? null,
    }).select().single();
    if (error) throw error;
    return data as ChatRoom;
  }, []);

  const markAsRead = useCallback(async (targetRoomId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('chat_messages')
      .update({ is_read: true })
      .eq('room_id', targetRoomId)
      .neq('sender_id', user.id)
      .eq('is_read', false);
  }, []);

  useEffect(() => {
    fetchRooms().finally(() => setLoading(false));

    const roomsSub = supabase.channel('chat_rooms_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_rooms' }, fetchRooms)
      .subscribe();

    return () => { supabase.removeChannel(roomsSub); };
  }, [fetchRooms]);

  useEffect(() => {
    if (!roomId) return;
    fetchMessages(roomId);
    markAsRead(roomId);

    const msgSub = supabase.channel(`chat_messages:${roomId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'chat_messages',
        filter: `room_id=eq.${roomId}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as ChatMessage]);
      })
      .subscribe();

    setChannel(msgSub);
    return () => { supabase.removeChannel(msgSub); };
  }, [roomId, fetchMessages, markAsRead]);

  return { messages, rooms, loading, error, sendMessage, createRoom, markAsRead, channel };
}