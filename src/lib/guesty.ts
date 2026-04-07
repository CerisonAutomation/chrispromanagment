/**
 * @fileoverview DEPRECATED — legacy Guesty client. Do not use in new code.
 *
 * This file is kept only for backward-compatibility with any remaining imports.
 * All functionality has been split into canonical modules:
 *
 *   Booking Engine API (guest-facing):
 *     → src/lib/guesty/booking-api.ts  (booking-api.guesty.com)
 *
 *   Open API (admin/management):
 *     → src/lib/guesty/client.ts       (open-api.guesty.com)
 *     → src/lib/guesty/resources.ts
 *
 *   Barrel import:
 *     → import { ... } from '@/lib/guesty'
 *
 * @deprecated Import from '@/lib/guesty' instead.
 */

// Re-export Open API types for any legacy consumers
export type {
  GuestyListingsResponse,
  GuestyListing,
  GuestyReservation,
  GuestyReservationsResponse,
  GuestyCalendarDay,
  GuestyGuest,
  GuestyGuestsResponse,
  GuestyTask,
  GuestyTasksResponse,
  GuestyConversation,
  GuestyConversationsResponse,
} from './guesty/types';

// Re-export canonical Open API client functions
export {
  guestyFetch,
  getAccessToken,
} from './guesty/client';

// Re-export canonical resource methods
export {
  getAllListings as getListings,
  getAllReservations as getReservations,
  getCalendar,
  getGuests,
  getConversations,
} from './guesty/resources';

// NOTE: getBookingQuote has been intentionally REMOVED from this file.
// Quote creation requires the Booking Engine API, not the Open API.
// Use: import { createQuote } from '@/lib/guesty' instead.
