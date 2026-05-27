/**
 * Booking Repository Interface
 * Defines contract for booking and reservation data access operations
 */

import { IRepository, PaginationOptions, PaginatedResult } from '@/core/repository-pattern';
import {
  Booking,
  BookingFilter,
  BookingStats,
  BookingAnalytics,
} from './models';

/**
 * Extended repository interface for Booking-specific operations
 */
export interface IBookingRepository extends IRepository<Booking, string> {
  // Filter and search operations
  findByFilter(filter: BookingFilter): Promise<Booking[]>;
  searchBookings(searchTerm: string, filter?: BookingFilter): Promise<Booking[]>;
  paginateByFilter(options: PaginationOptions, filter: BookingFilter): Promise<PaginatedResult<Booking>>;
  
  // Property-specific operations
  findByPropertyId(propertyId: string): Promise<Booking[]>;
  findByPropertyIdAndDateRange(
    propertyId: string,
    dateFrom: string,
    dateTo: string
  ): Promise<Booking[]>;
  
  // Guest operations
  findByGuestEmail(email: string): Promise<Booking[]>;
  findByGuestName(name: string): Promise<Booking[]>;
  
  // Status operations
  findByStatus(status: string): Promise<Booking[]>;
  updateStatus(id: string, status: string): Promise<Booking>;
  
  // Analytics operations
  getStats(filter?: BookingFilter): Promise<BookingStats>;
  getAnalytics(dateFrom: string, dateTo: string): Promise<BookingAnalytics>;
  getRevenueByDateRange(dateFrom: string, dateTo: string): Promise<Array<{ date: string; amount: number }>>;
  getOccupancyByDateRange(dateFrom: string, dateTo: string): Promise<Array<{ date: string; rate: number }>>;
  getBookingsByDateRange(dateFrom: string, dateTo: string): Promise<Array<{ date: string; count: number }>>;
  
  // Top properties
  getTopProperties(limit?: number): Promise<Array<{ id: string; title: string; revenue: number; bookings: number }>>;
  
  // Date range operations
  findActiveBookings(dateFrom: string, dateTo: string): Promise<Booking[]>;
  findCancelledBookings(dateFrom: string, dateTo: string): Promise<Booking[]>;
  
  // Count operations
  countByStatus(status: string): Promise<number>;
  countByPropertyId(propertyId: string): Promise<number>;
  countByDateRange(dateFrom: string, dateTo: string): Promise<number>;
}
