import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/realtime-js';

interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: {
    full_name: string;
    avatar_url: string;
  };
}

interface ChatRoom {
  id: string;
  property_id: string;
  owner_id: string;
  guest_id: string;
  created_at: string;
  updated_at: string;
  property?: {
    title: string;
    images: string[];
  };
}

export function useChat(roomId?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  const fetchRooms = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('chat_rooms')
        .select(`
          *,
          property:properties(title, images)
        `)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setRooms(data || []);
    } catch (err) {
      setError(err as Error);
    }
  }, []);

  const fetchMessages = useCallback(async (currentRoomId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          sender:profiles(full_name, avatar_url)
        `)
        .eq('room_id', currentRoomId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      setError(err as Error);
    }
  }, []);

  const sendMessage = useCallback(async (content: string, currentRoomId: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('chat_messages')
        .insert({
          room_id: currentRoomId,
          sender_id: user.user.id,
          content
        });

      if (error) throw error;

      // Update room's updated_at
      await supabase
        .from('chat_rooms')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', currentRoomId);
    } catch (err) {
      setError(err as Error);
    }
  }, []);

  const markAsRead = useCallback(async (currentRoomId: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .eq('room_id', currentRoomId)
        .neq('sender_id', user.user.id)
        .eq('is_read', false);
    } catch (err) {
      setError(err as Error);
    }
  }, []);

  useEffect(() => {
    fetchRooms().then(() => setLoading(false));

    // Subscribe to chat rooms changes
    const roomsChannel = supabase.channel('public:chat_rooms')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'chat_rooms'
      }, () => {
        fetchRooms();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(roomsChannel);
    };
  }, [fetchRooms]);

  useEffect(() => {
    if (!roomId) return;

    fetchMessages(roomId);
    markAsRead(roomId);

    // Subscribe to new messages
    const messagesChannel = supabase.channel(`room:${roomId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `room_id=eq.${roomId}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as ChatMessage]);
      })
      .subscribe();

    setChannel(messagesChannel);

    return () => {
      supabase.removeChannel(messagesChannel);
    };
  }, [roomId, fetchMessages, markAsRead]);

  return {
    messages,
    rooms,
    loading,
    error,
    sendMessage,
    markAsRead,
    channel
  };
}
