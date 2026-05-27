// @ts-nocheck
import { create } from 'zustand';
import { analyticsEngine } from '@/lib/analytics-engine';
import type { RevenuePoint, OccupancyPoint, BookingPoint, TopProperty, KPIStats } from '@/lib/analytics-engine';

type DateRange = 7 | 30 | 90;

interface AnalyticsState {
  range: DateRange;
  revenue: RevenuePoint[];
  occupancy: OccupancyPoint[];
  bookingsTrend: BookingPoint[];
  topProperties: TopProperty[];
  kpi: KPIStats | null;
  loading: boolean;
  error: string | null;

  // actions
  setRange: (r: DateRange) => void;
  fetchAll: (range?: DateRange) => Promise<void>;
  fetchKPI: (range?: DateRange) => Promise<void>;
  fetchRevenue: (range?: DateRange) => Promise<void>;
  fetchOccupancy: (range?: DateRange) => Promise<void>;
  fetchBookingsTrend: (range?: DateRange) => Promise<void>;
  fetchTopProperties: (limit?: number) => Promise<void>;
}

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  range: 30,
  revenue: [],
  occupancy: [],
  bookingsTrend: [],
  topProperties: [],
  kpi: null,
  loading: false,
  error: null,

  setRange(r) {
    set({ range: r });
    get().fetchAll(r);
  },

  async fetchAll(range) {
    const days = range ?? get().range;
    set({ loading: true, error: null });
    try {
      const [revenue, occupancy, bookingsTrend, topProperties, kpi] = await Promise.all([
        analyticsEngine.getRevenueData(days),
        analyticsEngine.getOccupancyData(days),
        analyticsEngine.getBookingsData(days),
        analyticsEngine.getTopProperties(5),
        analyticsEngine.getKPIStats(days),
      ]);
      set({ revenue, occupancy, bookingsTrend, topProperties, kpi });
    } catch (e: unknown) {
      set({ error: (e as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  async fetchKPI(range) {
    const kpi = await analyticsEngine.getKPIStats(range ?? get().range);
    set({ kpi });
  },

  async fetchRevenue(range) {
    const revenue = await analyticsEngine.getRevenueData(range ?? get().range);
    set({ revenue });
  },

  async fetchOccupancy(range) {
    const occupancy = await analyticsEngine.getOccupancyData(range ?? get().range);
    set({ occupancy });
  },

  async fetchBookingsTrend(range) {
    const bookingsTrend = await analyticsEngine.getBookingsData(range ?? get().range);
    set({ bookingsTrend });
  },

  async fetchTopProperties(limit = 5) {
    const topProperties = await analyticsEngine.getTopProperties(limit);
    set({ topProperties });
  },
}));