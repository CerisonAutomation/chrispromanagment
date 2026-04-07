/**
 * @fileoverview Guesty lib barrel — single import surface for all Guesty utilities.
 *
 * Two clients:
 *   - booking-api  → https://booking.guesty.com  (public-facing: listings, quotes, reservations)
 *   - client       → https://open-api.guesty.com  (admin: sync, reservations mgmt, webhooks)
 *
 * Usage:
 *   import { syncListings, getListings, getGuestyBeToken } from '@/lib/guesty';
 *   import type { GuestyListing, GuestyWebhookPayload } from '@/lib/guesty';
 */

// ─── Booking Engine API (public-facing) ───────────────────────────────────────
export {
  getGuestyBeToken,
  invalidateGuestyToken,
  guestyBookingFetch,
  getListings,
  getListing,
  getListingCalendar,
  getPaymentProvider,
  createQuote,
  getQuote,
  createInstantReservation,
  createInquiry,
  applyCoupon,
  getCities,
  getReviews,
} from './booking-api';

// ─── Open API (admin/management) ──────────────────────────────────────────────
export {
  getAccessToken,
  guestyFetch,
  guestyFetchAll,
} from './client';

export {
  getAllListings,
  getAllReservations,
  getCalendar,
  getGuests,
  getGuest,
  getQuote as getOpenApiQuote,
  getTasks,
  getTask,
  getConversations,
  getConversation,
  sendMessage,
  getOwners,
  getOwner,
  getInvoices,
  getInvoice,
} from './resources';

// ─── Sync ─────────────────────────────────────────────────────────────────────
export { syncListings, syncReservations } from './sync';
export type { SyncResult } from './sync';

// ─── Mappers ──────────────────────────────────────────────────────────────────
export { mapListing, mapReservation, extractPayout } from './mapper';

// ─── Result helpers ───────────────────────────────────────────────────────────
export {
  getListingsResult,
  getListingResult,
  getListingOpenApi,
  createQuoteResult,
  getCitiesResult,
  getReviewsResult,
} from './booking-api-result';
export type { Result } from './booking-api-result';

// ─── Types (all from single source of truth) ──────────────────────────────────
export type {
  GuestyAuthToken,
  GuestyPaginatedResponse,
  GuestyListingStatus,
  GuestyReservationStatus,
  GuestyPropertyType,
  GuestyListingAddress,
  GuestyListingPrices,
  GuestyListing,
  GuestyListingRaw,
  GuestyListingsResponse,
  GuestyReservationMoney,
  GuestyReservationGuest,
  GuestyReservation,
  GuestyReservationRaw,
  GuestyReservationsResponse,
  GuestyCalendarDay,
  GuestyCalendar,
  GuestyCalendarResponse,
  GuestyQuoteRequest,
  GuestyQuoteBreakdown,
  GuestyQuoteRaw,
  GuestyQuote,
  GuestyGuestProfile,
  GuestyGuestsResponse,
  GuestyTask,
  GuestyTasksResponse,
  GuestyConversation,
  GuestyConversationsResponse,
  GuestyOwner,
  GuestyOwnersResponse,
  GuestyInvoice,
  GuestyInvoicesResponse,
  GuestyWebhookEvent,
  GuestyWebhookPayload,
  MappedListing,
  MappedReservation,
} from './types';
