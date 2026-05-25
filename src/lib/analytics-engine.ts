import { supabase } from '@/lib/supabase';
import { format, subDays } from 'date-fns';

export interface AnalyticsData {
  revenue: { date: string; amount: number }[];
  occupancy: { date: string; rate: number }[];
  bookings: { date: string; count: number }[];
  topProperties: { id: string; title: string; revenue: number }[];
}

export class AnalyticsEngine {
  async getRevenueData(days: number = 30): Promise<AnalyticsData['revenue']> {
    const startDate = subDays(new Date(), days).toISOString();

    const { data } = await supabase
      .from('bookings')
      .select('created_at, total_price')
      .gte('created_at', startDate)
      .order('created_at');

    const revenueMap = new Map<string, number>();
    data?.forEach(booking => {
      const date = booking.created_at.split('T')[0];
      revenueMap.set(date, (revenueMap.get(date) || 0) + booking.total_price);
    });

    return Array.from(revenueMap.entries()).map(([date, amount]) => ({
      date,
      amount
    }));
  }

  async getOccupancyData(days: number = 30): Promise<AnalyticsData['occupancy']> {
    const startDate = subDays(new Date(), days).toISOString();

    const { data: properties } = await supabase
      .from('properties')
      .select('id');

    const { data: bookings } = await supabase
      .from('bookings')
      .select('check_in, check_out, property_id')
      .gte('check_in', startDate);

    const occupancyMap = new Map<string, { occupied: number; total: number }>();
    const totalProperties = properties?.length || 1;

    for (let i = 0; i < days; i++) {
      const date = format(subDays(new Date(), days - i - 1), 'yyyy-MM-dd');
      const dayBookings = bookings?.filter(b => {
        const checkIn = new Date(b.check_in);
        const checkOut = new Date(b.check_out);
        const currentDate = new Date(date);
        return currentDate >= checkIn && currentDate < checkOut;
      }) || [];

      occupancyMap.set(date, {
        occupied: dayBookings.length,
        total: totalProperties
      });
    }

    return Array.from(occupancyMap.entries()).map(([date, { occupied, total }]) => ({
      date,
      rate: (occupied / total) * 100
    }));
  }

  async getBookingsData(days: number = 30): Promise<AnalyticsData['bookings']> {
    const startDate = subDays(new Date(), days).toISOString();

    const { data } = await supabase
      .from('bookings')
      .select('created_at')
      .gte('created_at', startDate)
      .order('created_at');

    const bookingsMap = new Map<string, number>();
    data?.forEach(booking => {
      const date = booking.created_at.split('T')[0];
      bookingsMap.set(date, (bookingsMap.get(date) || 0) + 1);
    });

    return Array.from(bookingsMap.entries()).map(([date, count]) => ({
      date,
      count
    }));
  }

  async getTopProperties(limit: number = 5): Promise<AnalyticsData['topProperties']> {
    const { data } = await supabase
      .from('bookings')
      .select(`
        property_id,
        total_price,
        property:properties(title)
      `)
      .order('total_price', { ascending: false })
      .limit(limit);

    return data?.map(b => ({
      id: b.property_id,
      title: (b.property as { title: string } | undefined)?.title || 'Unknown',
      revenue: b.total_price
    })) || [];
  }
}

export const analyticsEngine = new AnalyticsEngine();
