// @ts-nocheck
import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

export type AutomationTrigger =
  | 'booking_created'
  | 'booking_cancelled'
  | 'checkin'
  | 'checkout'
  | 'review_received'
  | 'payment_received'
  | 'maintenance_created'
  | 'message_received';

export type AutomationAction =
  | 'send_email'
  | 'send_sms'
  | 'create_task'
  | 'notify_owner'
  | 'update_channel'
  | 'webhook';

export interface AutomationRule {
  id: string;
  name: string;
  description?: string;
  trigger: AutomationTrigger;
  action: AutomationAction;
  action_config: Record<string, unknown>;
  is_active: boolean;
  run_count?: number;
  last_run_at?: string;
  created_at: string;
}

interface AutomationState {
  rules: AutomationRule[];
  loading: boolean;
  error: string | null;

  // actions
  fetch: () => Promise<void>;
  create: (rule: Omit<AutomationRule, 'id' | 'created_at' | 'run_count' | 'last_run_at'>) => Promise<AutomationRule>;
  update: (id: string, patch: Partial<AutomationRule>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  toggle: (id: string, isActive: boolean) => Promise<void>;
  trigger: (ruleId: string) => Promise<void>;
}

export const useAutomationStore = create<AutomationState>((set, get) => ({
  rules: [],
  loading: false,
  error: null,

  async fetch() {
    set({ loading: true, error: null });
    const { data, error } = await supabase
      .from('automation_rules')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) set({ error: error.message });
    else set({ rules: (data as AutomationRule[]) || [] });
    set({ loading: false });
  },

  async create(rule) {
    const { data, error } = await supabase
      .from('automation_rules')
      .insert(rule)
      .select()
      .single();
    if (error) throw error;
    const created = data as AutomationRule;
    set(s => ({ rules: [created, ...s.rules] }));
    return created;
  },

  async update(id, patch) {
    const { error } = await supabase
      .from('automation_rules')
      .update(patch)
      .eq('id', id);
    if (error) throw error;
    set(s => ({ rules: s.rules.map(r => r.id === id ? { ...r, ...patch } : r) }));
  },

  async remove(id) {
    const { error } = await supabase.from('automation_rules').delete().eq('id', id);
    if (error) throw error;
    set(s => ({ rules: s.rules.filter(r => r.id !== id) }));
  },

  async toggle(id, isActive) {
    await get().update(id, { is_active: isActive });
  },

  async trigger(ruleId) {
    await supabase.functions.invoke('automation-run', { body: { rule_id: ruleId } });
    await get().fetch();
  },
}));