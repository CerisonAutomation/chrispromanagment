// @ts-nocheck
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface RealtimeReservation {
  id: string;
  guesty_id: string;
  guesty_property_id: string;
  guest_name: string;
  check_in: string;
  check_out: string;
  status: string;
  created_at: string;
}

export function useRealtimeBookings() {
  const [bookings, setBookings] = useState<RealtimeReservation[]>([]);
  const [newBooking, setNewBooking] = useState<RealtimeReservation | null>(null);

  const fetchRecent = useCallback(async () => {
    const { data } = await supabase
      .from('reservations_cache')
      .select('id, guesty_id, guesty_property_id, guest_name, check_in, check_out, status, created_at')
      .order('created_at', { ascending: false })
      .limit(20);
    setBookings((data as RealtimeReservation[]) || []);
  }, []);

  useEffect(() => {
    fetchRecent();

    const channel = supabase
      .channel('reservations-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'reservations_cache' },
        (payload) => {
          const res = payload.new as RealtimeReservation;
          setBookings(prev => [res, ...prev]);
          setNewBooking(res);
          setTimeout(() => setNewBooking(null), 5000);
        }
      )
      .subscribe();

    return () => {
 supabase.removeChannel(channel); 
};
  }, [fetchRecent]);

  return { bookings, newBooking };
}