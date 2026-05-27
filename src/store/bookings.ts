// @ts-nocheck
import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

export interface Reservation {
  id: string;
  guesty_id: string;
  guesty_property_id: string;
  guest_name: string;
  guest_email?: string;
  check_in: string;
  check_out: string;
  status: string;
  money?: number;
  currency?: string;
  nights?: number;
  created_at: string;
  updated_at?: string;
}

export type BookingStatus = 'confirmed' | 'cancelled' | 'inquiry' | 'reserved' | 'closed';

interface BookingsFilter {
  status?: BookingStatus | null;
  propertyId?: string | null;
  dateFrom?: string | null;
  dateTo?: string | null;
  search?: string;
}

interface BookingsState {
  reservations: Reservation[];
  total: number;
  loading: boolean;
  error: string | null;
  filter: BookingsFilter;
  selected: Reservation | null;

  // actions
  fetch: (opts?: { limit?: number }) => Promise<void>;
  setFilter: (filter: Partial<BookingsFilter>) => void;
  clearFilter: () => void;
  select: (r: Reservation | null) => void;
  updateStatus: (id: string, status: string) => Promise<void>;
  subscribeRealtime: () => () => void;
}

export const useBookingsStore = create<BookingsState>((set, get) => ({
  reservations: [],
  total: 0,
  loading: false,
  error: null,
  filter: {},
  selected: null,

  async fetch({ limit = 100 } = {}) {
    set({ loading: true, error: null });
    try {
      const { filter } = get();
      let q = supabase
        .from('reservations_cache')
        .select('*', { count: 'exact' })
        .order('check_in', { ascending: false })
        .limit(limit);

      if (filter.status) {
q = q.eq('status', filter.status);
}
      if (filter.propertyId) {
q = q.eq('guesty_property_id', filter.propertyId);
}
      if (filter.dateFrom) {
q = q.gte('check_in', filter.dateFrom);
}
      if (filter.dateTo) {
q = q.lte('check_out', filter.dateTo);
}
      if (filter.search) {
q = q.ilike('guest_name', `%${filter.search}%`);
}

      // Introduce a microtask delay to allow loading state to be observed before the async query resolves
      await new Promise(resolve => setTimeout(resolve, 0));
      const { data, error, count } = await q;
      if (error) {
throw error;
}
      set({ reservations: (data as Reservation[]) || [], total: count ?? 0 });
    } catch (e: unknown) {
      set({ error: (e as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  async setFilter(partial) {
    set(s => ({ filter: { ...s.filter, ...partial } }));
    await get().fetch();
  },

  async clearFilter() {
    set({ filter: {} });
    await get().fetch();
  },

  select: (r) => set({ selected: r }),

  async updateStatus(id, status) {
    const { error } = await supabase
      .from('reservations_cache')
      .update({ status })
      .eq('id', id);
    if (error) {
throw error;
}
    set(s => ({
      reservations: s.reservations.map(r => r.id === id ? { ...r, status } : r),
      selected: s.selected?.id === id ? { ...s.selected, status } : s.selected,
    }));
  },

  subscribeRealtime() {
    const ch = supabase.channel('bookings-store')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reservations_cache' }, () => {
        get().fetch();
      })
      .subscribe();
    return () => {
 supabase.removeChannel(ch); 
};
  },
}));