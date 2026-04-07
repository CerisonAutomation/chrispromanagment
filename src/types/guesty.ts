// =============================================================================
// GUESTY DOMAIN TYPES — src/types/guesty.ts
// Thin re-export shim. Canonical definitions live in src/lib/guesty/types.ts.
// This file exists only so src/types/consolidated.ts can barrel-export them.
// DO NOT add new types here — add to src/lib/guesty/types.ts instead.
// =============================================================================

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
} from '../lib/guesty/types';

// Legacy aliases kept for backward compat with any remaining @/types/guesty imports
export type GuestyAddress = import('../lib/guesty/types').GuestyListingAddress;
export type GuestyPicture = { thumbnail?: string; regular?: string; large?: string; original?: string; caption?: string };
export type GuestyPrices = import('../lib/guesty/types').GuestyListingPrices;
export type GuestyListingsResult = import('../lib/guesty/types').GuestyListingsResponse;
export type GuestyCalendarStatus = 'available' | 'unavailable' | 'booked' | 'blocked';
export type GuestyPublicDescription = { summary?: string; space?: string; access?: string; interaction?: string; neighborhood?: string; transit?: string; houseRules?: string };
export type GuestyBookingQuoteParams = { listingId: string; checkIn: string; checkOut: string; guestsCount: number; source?: string };
export type GuestyQuoteResult = { quoteId?: string; totalPrice?: number; currency?: string; breakdown?: Record<string, unknown>; checkIn: string; checkOut: string; nights?: number };
export type GuestyTokenCache = { access_token: string; expires_at: number };
