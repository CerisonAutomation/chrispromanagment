import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

export type TicketStatus = 'open' | 'in-progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface MaintenanceTicket {
  id: string;
  property_id?: string;
  title: string;
  description?: string;
  status: TicketStatus;
  priority: TicketPriority;
  vendor_id?: string;
  assigned_to?: string;
  cost?: number;
  resolved_at?: string;
  created_at: string;
  updated_at?: string;
}

interface MaintenanceFilter {
  status?: TicketStatus | null;
  priority?: TicketPriority | null;
  propertyId?: string | null;
}

interface MaintenanceState {
  tickets: MaintenanceTicket[];
  loading: boolean;
  error: string | null;
  filter: MaintenanceFilter;
  selected: MaintenanceTicket | null;

  // actions
  fetch: () => Promise<void>;
  setFilter: (f: Partial<MaintenanceFilter>) => void;
  clearFilter: () => void;
  select: (t: MaintenanceTicket | null) => void;
  create: (ticket: Omit<MaintenanceTicket, 'id' | 'created_at'>) => Promise<MaintenanceTicket>;
  update: (id: string, patch: Partial<MaintenanceTicket>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  resolve: (id: string, cost?: number) => Promise<void>;
  subscribeRealtime: () => () => void;
}

export const useMaintenanceStore = create<MaintenanceState>((set, get) => ({
  tickets: [],
  loading: false,
  error: null,
  filter: {},
  selected: null,

  async fetch() {
    set({ loading: true, error: null });
    try {
      const { filter } = get();
      let q = supabase
        .from('maintenance_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter.status) q = q.eq('status', filter.status);
      if (filter.priority) q = q.eq('priority', filter.priority);
      if (filter.propertyId) q = q.eq('property_id', filter.propertyId);

      const { data, error } = await q;
      if (error) throw error;
      set({ tickets: (data as MaintenanceTicket[]) || [] });
    } catch (e: unknown) {
      set({ error: (e as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  setFilter(partial) {
    set(s => ({ filter: { ...s.filter, ...partial } }));
    get().fetch();
  },

  clearFilter() {
    set({ filter: {} });
    get().fetch();
  },

  select: (t) => set({ selected: t }),

  async create(ticket) {
    const { data, error } = await supabase
      .from('maintenance_tickets')
      .insert(ticket)
      .select()
      .single();
    if (error) throw error;
    const created = data as MaintenanceTicket;
    set(s => ({ tickets: [created, ...s.tickets] }));
    return created;
  },

  async update(id, patch) {
    const { error } = await supabase
      .from('maintenance_tickets')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
    set(s => ({
      tickets: s.tickets.map(t => t.id === id ? { ...t, ...patch } : t),
      selected: s.selected?.id === id ? { ...s.selected, ...patch } : s.selected,
    }));
  },

  async remove(id) {
    const { error } = await supabase.from('maintenance_tickets').delete().eq('id', id);
    if (error) throw error;
    set(s => ({
      tickets: s.tickets.filter(t => t.id !== id),
      selected: s.selected?.id === id ? null : s.selected,
    }));
  },

  async resolve(id, cost) {
    await get().update(id, {
      status: 'resolved',
      cost,
      resolved_at: new Date().toISOString(),
    });
  },

  subscribeRealtime() {
    const ch = supabase.channel('maintenance-store')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'maintenance_tickets' }, () => {
        get().fetch();
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  },
}));
