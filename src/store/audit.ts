// @ts-nocheck
import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

export interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  changes?: Record<string, unknown>;
  created_at: string;
}

interface AuditFilter {
  action?: string;
  entityType?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
}

interface AuditState {
  logs: AuditLog[];
  total: number;
  loading: boolean;
  error: string | null;
  filter: AuditFilter;
  page: number;

  // actions
  fetch: (page?: number) => Promise<void>;
  setFilter: (f: Partial<AuditFilter>) => void;
  clearFilter: () => void;
  log: (action: string, entityType?: string, entityId?: string, changes?: Record<string, unknown>) => Promise<void>;
}

const PAGE_SIZE = 50;

export const useAuditStore = create<AuditState>((set, get) => ({
  logs: [],
  total: 0,
  loading: false,
  error: null,
  filter: {},
  page: 1,

  async fetch(page = 1) {
    set({ loading: true, error: null, page });
    try {
      const { filter } = get();
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let q = supabase
        .from('audit_logs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (filter.action) q = q.eq('action', filter.action);
      if (filter.entityType) q = q.eq('entity_type', filter.entityType);
      if (filter.userId) q = q.eq('user_id', filter.userId);
      if (filter.dateFrom) q = q.gte('created_at', filter.dateFrom);
      if (filter.dateTo) q = q.lte('created_at', filter.dateTo);

      const { data, error, count } = await q;
      if (error) throw error;
      set({ logs: (data as AuditLog[]) || [], total: count ?? 0 });
    } catch (e: unknown) {
      set({ error: (e as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  setFilter(partial) {
    set(s => ({ filter: { ...s.filter, ...partial }, page: 1 }));
    get().fetch(1);
  },

  clearFilter() {
    set({ filter: {}, page: 1 });
    get().fetch(1);
  },

  async log(action, entityType, entityId, changes) {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('audit_logs').insert({
      user_id: user?.id ?? null,
      action,
      entity_type: entityType ?? null,
      entity_id: entityId ?? null,
      changes: changes ?? null,
    });
  },
}));