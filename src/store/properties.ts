import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

export interface Property {
  guesty_id: string; // primary key
  title: string;
  city?: string;
  country?: string;
  bedrooms?: number;
  bathrooms?: number;
  accommodates?: number;
  base_price?: number;
  currency?: string;
  thumbnail?: string;
  lat?: number;
  lng?: number;
  active: boolean;
  last_synced_at?: string;
}

interface PropertiesFilter {
  active?: boolean;
  city?: string;
  search?: string;
}

interface PropertiesState {
  properties: Property[];
  total: number;
  loading: boolean;
  error: string | null;
  filter: PropertiesFilter;
  selected: Property | null;

  // actions
  fetch: () => Promise<void>;
  setFilter: (f: Partial<PropertiesFilter>) => void;
  clearFilter: () => void;
  select: (p: Property | null) => void;
  toggleActive: (id: string, active: boolean) => Promise<void>;
  sync: () => Promise<void>;
}

export const usePropertiesStore = create<PropertiesState>((set, get) => ({
  properties: [],
  total: 0,
  loading: false,
  error: null,
  filter: { active: true },
  selected: null,

  async fetch() {
    set({ loading: true, error: null });
    try {
      const { filter } = get();
      let q = supabase
        .from('guesty_properties_cache')
        .select('*', { count: 'exact' })
        .order('title');

      if (filter.active !== undefined) q = q.eq('active', filter.active);
      if (filter.city) q = q.ilike('city', `%${filter.city}%`);
      if (filter.search) q = q.ilike('title', `%${filter.search}%`);

      const { data, error, count } = await q;
      if (error) throw error;
      set({ properties: (data as Property[]) || [], total: count ?? 0 });
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

  select: (p) => set({ selected: p }),

  async toggleActive(id, active) {
    const { error } = await supabase
      .from('guesty_properties_cache')
      .update({ active })
      .eq('guesty_id', id);
    if (error) throw error;
    set(s => ({
      properties: s.properties.map(p => p.guesty_id === id ? { ...p, active } : p),
      selected: s.selected?.guesty_id === id ? { ...s.selected, active } : s.selected,
    }));
  },

  async sync() {
    const { error } = await supabase.functions.invoke('guesty-sync');
    if (error) throw error;
    await get().fetch();
  },
}));
