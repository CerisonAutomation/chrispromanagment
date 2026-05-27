/**
 * Guesty Repository Interface
 * Defines contract for Guesty data access operations
 */

import { PaginationOptions, PaginatedResult } from '@/core/repository-pattern';
import {
  GuestyListing,
  GuestyQuote,
  GuestyReservation,
  GuestyCalendar,
  GuestyCity,
  GuestyPaymentProvider,
  GuestyCoupon,
  GuestyListingFilter,
  GuestyReservationFilter,
} from './models';

/**
 * Extended repository interface for Guesty-specific operations
 */
export interface IGuestyRepository {
  // Listing operations
  findListingById(id: string): Promise<GuestyListing | null>;
  findListings(filter?: GuestyListingFilter): Promise<GuestyListing[]>;
  searchListings(searchTerm: string, filter?: GuestyListingFilter): Promise<GuestyListing[]>;
  paginateListings(options: PaginationOptions, filter?: GuestyListingFilter): Promise<PaginatedResult<GuestyListing>>;
  
  // Quote operations
  createQuote(params: {
    listingId: string;
    checkIn: string;
    checkOut: string;
    guestsCount: number;
    couponCode?: string;
  }): Promise<GuestyQuote>;
  getQuoteById(id: string): Promise<GuestyQuote | null>;
  applyCouponToQuote(quoteId: string, couponCode: string): Promise<GuestyQuote>;
  
  // Reservation operations
  createReservation(quoteId: string, paymentDetails: Record<string, unknown>): Promise<GuestyReservation>;
  getReservationById(id: string): Promise<GuestyReservation | null>;
  findReservations(filter?: GuestyReservationFilter): Promise<GuestyReservation[]>;
  updateReservationStatus(id: string, status: string): Promise<GuestyReservation>;
  cancelReservation(id: string): Promise<boolean>;
  
  // Calendar operations
  getCalendar(listingId: string, from: string, to: string): Promise<GuestyCalendar[]>;
  checkAvailability(listingId: string, checkIn: string, checkOut: string): Promise<boolean>;
  
  // City operations
  getCities(filter?: { country?: string }): Promise<GuestyCity[]>;
  
  // Payment operations
  getPaymentProvider(listingId: string): Promise<GuestyPaymentProvider | null>;
  processInstantCharge(reservationId: string, amount: number): Promise<{ success: boolean; transactionId?: string }>;
  
  // Coupon operations
  validateCoupon(couponCode: string): Promise<GuestyCoupon | null>;
  
  // Bootstrap/health operations
  pingToken(): Promise<boolean>;
  getTokenStatus(): Promise<{ valid: boolean; expiresAt?: string }>;
  bootstrap(): Promise<{ status: string; connected: boolean }>;
}

/**
 * Base repository for Guesty entities
 */
export interface IGuestyBaseRepository<TEntity, TId = string> extends IRepository<TEntity, TId> {
  // Additional Guesty-specific methods can be added here
  invalidateCache?(id: TId): void;
  clearCache?(): void;
}
