import { useEffect, useState } from 'react';
// import { supabase } from '@/lib/supabase'; // TODO: implement supabase client

// Game-changer: Real-time booking updates via Supabase Realtime
export function useRealtimeBookings() {
  const [bookings, setBookings] = useState([]);
  const [newBooking, setNewBooking] = useState(null);

  useEffect(() => {
    const channel = supabase
      .channel('bookings-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'bookings' },
        (payload) => {
          setBookings(prev => [payload.new, ...prev]);
          setNewBooking(payload.new);
          // Clear notification after 5 seconds
          setTimeout(() => setNewBooking(null), 5000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { bookings, newBooking };
}
