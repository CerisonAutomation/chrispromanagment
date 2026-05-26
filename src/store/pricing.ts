import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { pricingEngine } from '@/lib/pricing-engine';
import type { PricingForecast } from '@/lib/pricing-engine';

export interface PricingRule {
  id: string;
  property_id: string;
  name: string;
  rule_type: 'seasonal' | 'event' | 'last_minute' | 'early_bird' | 'weekend' | 'custom';
  adjustment_type: 'percent' | 'fixed';
  adjustment_value: number;
  date_from?: string;
  date_to?: string;
  days_of_week?: number[];
  is_active: boolean;
  priority: number;
  created_at: string;
}

interface PricingState {
  rules: PricingRule[];
  forecasts: Record<string, PricingForecast[]>;
  selectedPropertyId: string | null;
  loading: boolean;
  forecastLoading: boolean;
  error: string | null;

  // actions
  fetchRules: (propertyId?: string) => Promise<void>;
  generateForecast: (propertyId: string, days?: number) => Promise<void>;
  createRule: (rule: Omit<PricingRule, 'id' | 'created_at'>) => Promise<PricingRule>;
  updateRule: (id: string, patch: Partial<PricingRule>) => Promise<void>;
  removeRule: (id: string) => Promise<void>;
  toggleRule: (id: string, isActive: boolean) => Promise<void>;
  setSelectedProperty: (propertyId: string | null) => void;
}

export const usePricingStore = create<PricingState>((set, get) => ({
  rules: [],
  forecasts: {},
  selectedPropertyId: null,
  loading: false,
  forecastLoading: false,
  error: null,

  async fetchRules(propertyId) {
    set({ loading: true, error: null });
    let q = supabase.from('pricing_rules').select('*').order('priority');
    if (propertyId) q = q.eq('property_id', propertyId);
    const { data, error } = await q;
    if (error) set({ error: error.message });
    else set({ rules: (data as PricingRule[]) || [] });
    set({ loading: false });
  },

  async generateForecast(propertyId, days = 30) {
    set({ forecastLoading: true, error: null });
    try {
      const data = await pricingEngine.generateForecast(propertyId, days);
      set(s => ({ forecasts: { ...s.forecasts, [propertyId]: data } }));
    } catch (e: unknown) {
      set({ error: (e as Error).message });
    } finally {
      set({ forecastLoading: false });
    }
  },

  async createRule(rule) {
    const { data, error } = await supabase.from('pricing_rules').insert(rule).select().single();
    if (error) throw error;
    const created = data as PricingRule;
    set(s => ({ rules: [...s.rules, created].sort((a, b) => a.priority - b.priority) }));
    return created;
  },

  async updateRule(id, patch) {
    const { error } = await supabase.from('pricing_rules').update(patch).eq('id', id);
    if (error) throw error;
    set(s => ({ rules: s.rules.map(r => r.id === id ? { ...r, ...patch } : r) }));
  },

  async removeRule(id) {
    const { error } = await supabase.from('pricing_rules').delete().eq('id', id);
    if (error) throw error;
    set(s => ({ rules: s.rules.filter(r => r.id !== id) }));
  },

  async toggleRule(id, isActive) {
    await get().updateRule(id, { is_active: isActive });
  },

  setSelectedProperty(propertyId) {
    set({ selectedPropertyId: propertyId });
    if (propertyId) {
      get().fetchRules(propertyId);
      get().generateForecast(propertyId);
    }
  },
}));
