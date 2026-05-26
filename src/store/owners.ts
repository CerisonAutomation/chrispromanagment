import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

export interface Owner {
  id: string;
  user_id?: string;
  full_name: string;
  email: string;
  phone?: string;
  company?: string;
  preferred_contact?: 'email' | 'phone' | 'whatsapp';
  bank_iban?: string;
  notes?: string;
  created_at: string;
}

export interface OwnerReport {
  id: string;
  owner_id: string;
  property_id: string;
  period_start: string;
  period_end: string;
  gross_revenue: number;
  management_fee: number;
  net_payout: number;
  bookings_count: number;
  occupancy_rate: number;
  pdf_url?: string;
  created_at: string;
}

interface OwnersState {
  owners: Owner[];
  reports: OwnerReport[];
  loading: boolean;
  error: string | null;
  selected: Owner | null;

  // actions
  fetch: () => Promise<void>;
  fetchReports: (ownerId?: string) => Promise<void>;
  create: (owner: Omit<Owner, 'id' | 'created_at'>) => Promise<Owner>;
  update: (id: string, patch: Partial<Owner>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  select: (o: Owner | null) => void;
  generateReport: (ownerId: string, propertyId: string, periodStart: string, periodEnd: string) => Promise<void>;
}

export const useOwnersStore = create<OwnersState>((set, get) => ({
  owners: [],
  reports: [],
  loading: false,
  error: null,
  selected: null,

  async fetch() {
    set({ loading: true, error: null });
    const { data, error } = await supabase
      .from('owners')
      .select('*')
      .order('full_name');
    if (error) set({ error: error.message });
    else set({ owners: (data as Owner[]) || [] });
    set({ loading: false });
  },

  async fetchReports(ownerId) {
    let q = supabase.from('owner_reports').select('*').order('period_start', { ascending: false });
    if (ownerId) q = q.eq('owner_id', ownerId);
    const { data, error } = await q;
    if (error) set({ error: error.message });
    else set({ reports: (data as OwnerReport[]) || [] });
  },

  async create(owner) {
    const { data, error } = await supabase.from('owners').insert(owner).select().single();
    if (error) throw error;
    const created = data as Owner;
    set(s => ({ owners: [...s.owners, created] }));
    return created;
  },

  async update(id, patch) {
    const { error } = await supabase.from('owners').update(patch).eq('id', id);
    if (error) throw error;
    set(s => ({
      owners: s.owners.map(o => o.id === id ? { ...o, ...patch } : o),
      selected: s.selected?.id === id ? { ...s.selected, ...patch } : s.selected,
    }));
  },

  async remove(id) {
    const { error } = await supabase.from('owners').delete().eq('id', id);
    if (error) throw error;
    set(s => ({
      owners: s.owners.filter(o => o.id !== id),
      selected: s.selected?.id === id ? null : s.selected,
    }));
  },

  select: (o) => set({ selected: o }),

  async generateReport(ownerId, propertyId, periodStart, periodEnd) {
    const { error } = await supabase.functions.invoke('generate-owner-report', {
      body: { owner_id: ownerId, property_id: propertyId, period_start: periodStart, period_end: periodEnd },
    });
    if (error) throw error;
    await get().fetchReports(ownerId);
  },
}));
