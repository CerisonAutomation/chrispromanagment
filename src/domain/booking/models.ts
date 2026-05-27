/**
 * Booking Domain Models
 * Type-safe domain entities for booking and reservation operations
 */

export interface Booking {
  id: string;
  guestyId: string;
  guestyPropertyId: string;
  guestName: string;
  guestEmail?: string;
  guestPhone?: string;
  checkIn: string;
  checkOut: string;
  status: BookingStatus;
  money: Money;
  currency: string;
  nights: number;
  guestsCount: number;
  createdAt: string;
  updatedAt?: string;
  notes?: string;
}

export interface Money {
  hostPayout?: number;
  totalPaid?: number;
  netIncome?: number;
  cleaningFee?: number;
  taxes?: number;
  fees?: number;
}

export type BookingStatus = 'confirmed' | 'cancelled' | 'inquiry' | 'reserved' | 'closed' | 'pending';

export interface BookingFilter {
  status?: BookingStatus;
  propertyId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  guestName?: string;
  guestEmail?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface BookingStats {
  totalRevenue: number;
  totalBookings: number;
  avgNightlyRate: number;
  avgOccupancy: number;
  cancelledBookings: number;
  confirmedBookings: number;
}

export interface BookingCreateInput {
  guestyId: string;
  guestyPropertyId: string;
  guestName: string;
  guestEmail?: string;
  guestPhone?: string;
  checkIn: string;
  checkOut: string;
  guestsCount: number;
  money: Partial<Money>;
  currency: string;
  notes?: string;
}

export interface BookingUpdateInput {
  status?: BookingStatus;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  notes?: string;
  money?: Partial<Money>;
}

export interface BookingAnalytics {
  revenueByMonth: Array<{ month: string; revenue: number }>;
  occupancyByMonth: Array<{ month: string; occupancy: number }>;
  bookingsByMonth: Array<{ month: string; bookings: number }>;
  topProperties: Array<{
    id: string;
    title: string;
    revenue: number;
    bookings: number;
  }>;
}
