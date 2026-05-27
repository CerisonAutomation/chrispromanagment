// @ts-nocheck
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, eachDayOfInterval } from 'date-fns';

export interface RevenuePoint   { date: string; amount: number; month: string; revenue: number }
export interface OccupancyPoint { date: string; rate: number; month: string; occupancy: number }
export interface BookingPoint   { date: string; count: number; month: string; bookings: number }
export interface TopProperty    { id: string; title: string; revenue: number; name: string; bookings: number }
export interface KPIStats { totalRevenue: number; avgOccupancy: number; totalBookings: number; avgNightlyRate: number }

function extractAmount(money: unknown): number {
  if (!money || typeof money !== 'object') {
return 0;
}
  const m = money as Record<string, number>;
  return m.hostPayout ?? m.totalPaid ?? m.netIncome ?? 0;
}

class AnalyticsEngine {
  async getRevenueData(days = 30): Promise<RevenuePoint[]> {
    const start = subDays(new Date(), days).toISOString().split('T')[0];
    const { data } = await supabase
      .from('reservations_cache')
      .select('check_in, money')
      .gte('check_in', start)
      .order('check_in');

    const map = new Map<string, number>();
    data?.forEach(r => {
      if (r.check_in) {
map.set(r.check_in, (map.get(r.check_in) || 0) + extractAmount(r.money));
}
    });

    return eachDayOfInterval({ start: subDays(new Date(), days - 1), end: new Date() }).map(d => {
      const date = format(d, 'yyyy-MM-dd');
      const amount = map.get(date) || 0;
      return { date, amount, month: format(d, 'MMM'), revenue: amount };
    });
  }

  async getOccupancyData(days = 30): Promise<OccupancyPoint[]> {
    const start = subDays(new Date(), days).toISOString().split('T')[0];
    const end = new Date().toISOString().split('T')[0];

    const [{ count: totalProps }, { data: reservations }] = await Promise.all([
      supabase.from('guesty_properties_cache').select('*', { count: 'exact', head: true }),
      supabase.from('reservations_cache').select('check_in, check_out').gte('check_in', start).lte('check_out', end),
    ]);

    const propCount = totalProps || 1;
    return eachDayOfInterval({ start: subDays(new Date(), days - 1), end: new Date() }).map(d => {
      const dateStr = format(d, 'yyyy-MM-dd');
      const occupied = reservations?.filter(r => r.check_in <= dateStr && r.check_out > dateStr).length || 0;
      const rate = Math.min(100, (occupied / propCount) * 100);
      return { date: dateStr, rate, month: format(d, 'MMM'), occupancy: rate };
    });
  }

  async getBookingsData(days = 30): Promise<BookingPoint[]> {
    const start = subDays(new Date(), days).toISOString().split('T')[0];
    const { data } = await supabase
      .from('reservations_cache')
      .select('created_at')
      .gte('created_at', start)
      .order('created_at');

    const map = new Map<string, number>();
    data?.forEach(r => {
      const date = r.created_at?.split('T')[0];
      if (date) {
map.set(date, (map.get(date) || 0) + 1);
}
    });

    return eachDayOfInterval({ start: subDays(new Date(), days - 1), end: new Date() }).map(d => {
      const date = format(d, 'yyyy-MM-dd');
      const count = map.get(date) || 0;
      return { date, count, month: format(d, 'MMM'), bookings: count };
    });
  }

  async getTopProperties(limit = 5): Promise<TopProperty[]> {
    const { data } = await supabase
      .from('reservations_cache')
      .select('guesty_property_id, money, guesty_properties_cache(title)');

    if (!data) {
return [];
}
    const propMap = new Map<string, { title: string; revenue: number; bookings: number }>();
    data.forEach(r => {
      const id = r.guesty_property_id;
      if (!id) {
return;
}
      const title = (r.guesty_properties_cache as { title?: string } | null)?.title ?? id;
      const existing = propMap.get(id) ?? { title, revenue: 0, bookings: 0 };
      propMap.set(id, { title, revenue: existing.revenue + extractAmount(r.money), bookings: existing.bookings + 1 });
    });

    return Array.from(propMap.entries())
      .map(([id, v]) => ({ id, ...v, name: v.title }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);
  }

  async getKPIStats(days = 30): Promise<KPIStats> {
    const start = subDays(new Date(), days).toISOString().split('T')[0];
    const { data } = await supabase
      .from('reservations_cache')
      .select('money, nights_count')
      .gte('check_in', start);

    let totalRevenue = 0, totalNights = 0;
    data?.forEach(r => {
      totalRevenue += extractAmount(r.money);
      totalNights += (r as { nights_count?: number }).nights_count ?? 0;
    });

    const totalBookings = data?.length || 0;
    const avgNightlyRate = totalNights > 0 ? totalRevenue / totalNights : 0;
    const occData = await this.getOccupancyData(days);
    const avgOccupancy = occData.reduce((s, d) => s + d.rate, 0) / (occData.length || 1);

    return { totalRevenue, avgOccupancy, totalBookings, avgNightlyRate };
  }
}

export const analyticsEngine = new AnalyticsEngine();