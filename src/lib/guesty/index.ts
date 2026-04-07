/**
 * Guesty module barrel export.
 * All other files in the codebase import from '@/lib/guesty' (this file).
 * Never import from sub-files directly outside this module.
 */

// Core client (expose for edge cases like custom fetching)
export { getAccessToken, guestyFetch, guestyFetchAll } from './client';

// All resource methods
export {
  // Listings
  getListings,
  getAllListings,
  getListing,
  // Reservations
  getReservations,
  getAllReservations,
  getReservation,
  // Calendar
  getCalendar,
  // Guests
  getGuests,
  getGuest,
  // Quotes
  getQuote,
  // Tasks
  getTasks,
  getTask,
  // Conversations
  getConversations,
  getConversation,
  sendMessage,
  // Owners
  getOwners,
  getOwner,
  // Invoices
  getInvoices,
  getInvoice,
} from './resources';

// Mapper utilities
export { mapListing, mapReservation, extractPayout } from './mapper';

// Sync helpers (server-side only)
export { syncListings, syncReservations } from './sync';

// All types
export type {
  GuestyAuthToken,
  GuestyPaginatedResponse,
  GuestyListing,
  GuestyListingsResponse,
  GuestyReservation,
  GuestyReservationMoney,
  GuestyReservationsResponse,
  GuestyGuest,
  GuestyGuestProfile,
  GuestyGuestsResponse,
  GuestyCalendarDay,
  GuestyCalendarResponse,
  GuestyQuote,
  GuestyTask,
  GuestyTasksResponse,
  GuestyConversation,
  GuestyConversationsResponse,
  GuestyOwner,
  GuestyOwnersResponse,
  GuestyInvoice,
  GuestyInvoicesResponse,
  MappedListing,
  MappedReservation,
} from './types';
