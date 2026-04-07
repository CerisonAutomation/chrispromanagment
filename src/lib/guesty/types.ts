/**
 * @fileoverview Guesty canonical types — single source of truth.
 *
 * Covers BOTH APIs:
 *   - Open API (https://open-api.guesty.com/v1) — management/admin
 *   - Booking Engine API (https://booking.guesty.com) — public-facing
 *
 * ⚠️  DO NOT import types from guesty-types.ts or booking-api.ts directly.
 *     Always import from '@/lib/guesty/types' or '@/lib/guesty' barrel.
 */

// ─── Shared primitives ────────────────────────────────────────────────────────

export type GuestyReservationStatus =
  | 'inquiry' | 'declined' | 'expired' | 'canceled'
  | 'reserved' | 'confirmed' | 'checked_in' | 'checked_out' | 'closed';

export type GuestyListingStatus = 'listed' | 'unlisted' | 'draft' | 'archived' | 'active' | 'inactive';

export type GuestyPropertyType =
  | 'apartment' | 'house' | 'villa' | 'room' | 'condo' | 'guest_suite';

export type GuestyStayType = 'NIGHTS';

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface GuestyAuthToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope?: string;
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface GuestyPaginatedResponse<T> {
  results: T[];
  count: number;
  skip?: number;
  limit?: number;
  cursor?: string;
}

// ─── Listing (Open API shape) ─────────────────────────────────────────────────

export interface GuestyListingAddress {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  lat?: number;
  lng?: number;
  full?: string;
}

export interface GuestyListingPrices {
  basePrice?: number;
  currency?: string;
  weekendPrice?: number;
  monthlyPriceFactor?: number;
  weeklyPriceFactor?: number;
}

/** Raw Guesty listing from Open API — use mapListing() to convert to MappedListing */
export interface GuestyListing {
  _id: string;
  title?: string;
  nickname?: string;
  propertyType?: string;
  roomType?: string;
  bedrooms?: number;
  bathrooms?: number;
  beds?: number;
  accommodates?: number;
  address?: GuestyListingAddress;
  prices?: GuestyListingPrices;
  pictures?: Array<{ thumbnail?: string; original?: string; caption?: string }>;
  publicDescription?: { summary?: string; space?: string; access?: string; notes?: string };
  amenities?: string[];
  tags?: string[];
  active?: boolean;
  listed?: boolean;
  status?: GuestyListingStatus;
  accountId?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** @alias for backwards compat */
export type GuestyListingRaw = GuestyListing;

export interface GuestyListingsResponse extends GuestyPaginatedResponse<GuestyListing> {}

// ─── Reservation (Open API shape) ─────────────────────────────────────────────

export interface GuestyReservationMoney {
  totalPaid?: number;
  currency?: string;
  hostPayout?: number;
  ownerRevenue?: number;
  fareAccommodation?: number;
  fareCleaning?: number;
  hostServiceFee?: number;
  guestServiceFee?: number;
  taxesPaid?: number;
  netIncome?: number;
  subTotalPrice?: number;
  balanceDue?: number;
  invoiceTotal?: number;
  payments?: Array<Record<string, unknown>>;
}

export interface GuestyReservationGuest {
  _id?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  picture?: string;
}

/** Raw Guesty reservation from Open API — use mapReservation() to convert */
export interface GuestyReservation {
  _id: string;
  listingId: string;
  listing?: { _id: string; title?: string; nickname?: string };
  status: GuestyReservationStatus;
  checkIn: string;
  checkOut: string;
  guestId?: string;
  guest?: GuestyReservationGuest;
  guestName?: string;
  money?: GuestyReservationMoney;
  source?: string;
  channel?: string;
  numberOfGuests?: number;
  adults?: number;
  children?: number;
  infants?: number;
  pets?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  bookedAt?: string;
  bookingDate?: string;
  confirmationCode?: string;
  nightsCount?: number;
}

/** @alias for backwards compat */
export type GuestyReservationRaw = GuestyReservation;

export interface GuestyReservationsResponse extends GuestyPaginatedResponse<GuestyReservation> {}

// ─── Calendar ─────────────────────────────────────────────────────────────────

export interface GuestyCalendarDay {
  date: string;
  status: 'available' | 'unavailable' | 'booked' | 'blocked' | 'owner' | 'reserved';
  price?: number;
  currency?: string;
  minNights?: number;
  maxNights?: number;
  note?: string;
  /** cta = closed to arrival */
  cta?: boolean;
  /** ctd = closed to departure */
  ctd?: boolean;
  reservation?: { _id: string; status: GuestyReservationStatus };
}

export interface GuestyCalendar {
  listingId: string;
  days: GuestyCalendarDay[];
}

export interface GuestyCalendarResponse {
  listingId: string;
  days: GuestyCalendarDay[];
  range?: { from: string; to: string };
}

// ─── Quote (Booking Engine API shape) ─────────────────────────────────────────

export interface GuestyQuoteRequest {
  listingId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  coupon?: string;
}

export interface GuestyQuoteBreakdown {
  total: number;
  currency: string;
  fareAccommodation?: number;
  fareCleaning?: number;
  guestServiceFee?: number;
  taxes?: number;
  nights?: number;
  avgNightlyRate?: number;
  farePaid?: number;
  hostPayout?: number;
  subTotal?: number;
  totalFees?: number;
  totalTaxes?: number;
  invoiceItems?: Array<{ type: string; title?: string; amount: number; currency?: string }>;
}

export interface GuestyQuoteRatePlan {
  _id: string;
  name: string;
  type?: string;
  cancellationPolicy?: string[];
}

export interface GuestyQuoteRaw {
  _id: string;
  listingId?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  createdAt?: string;
  expiresAt?: string;
  money?: GuestyQuoteBreakdown;
  status?: string;
  rates?: {
    ratePlans: Array<{
      ratePlan: GuestyQuoteRatePlan;
      inquiryId?: string;
      money?: GuestyQuoteBreakdown;
    }>;
  };
}

/** @alias for usage in Booking Engine contexts */
export type GuestyQuote = GuestyQuoteRaw;

// ─── Guests (Open API) ────────────────────────────────────────────────────────

export interface GuestyGuestProfile {
  _id: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  picture?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GuestyGuestsResponse extends GuestyPaginatedResponse<GuestyGuestProfile> {}

// ─── Tasks (Open API) ─────────────────────────────────────────────────────────

export interface GuestyTask {
  _id: string;
  listingId?: string;
  reservationId?: string;
  title?: string;
  description?: string;
  status?: string;
  assignee?: string;
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GuestyTasksResponse extends GuestyPaginatedResponse<GuestyTask> {}

// ─── Conversations (Open API) ─────────────────────────────────────────────────

export interface GuestyConversation {
  _id: string;
  reservationId?: string;
  guestId?: string;
  messages?: Array<{
    _id: string;
    body: string;
    type: string;
    createdAt: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

export interface GuestyConversationsResponse extends GuestyPaginatedResponse<GuestyConversation> {}

// ─── Owners (Open API) ────────────────────────────────────────────────────────

export interface GuestyOwner {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  createdAt?: string;
}

export interface GuestyOwnersResponse extends GuestyPaginatedResponse<GuestyOwner> {}

// ─── Invoices (Open API) ──────────────────────────────────────────────────────

export interface GuestyInvoice {
  _id: string;
  reservationId?: string;
  listingId?: string;
  amount?: number;
  currency?: string;
  status?: string;
  dueDate?: string;
  createdAt?: string;
}

export interface GuestyInvoicesResponse extends GuestyPaginatedResponse<GuestyInvoice> {}

// ─── Webhooks ─────────────────────────────────────────────────────────────────

export type GuestyWebhookEvent =
  | 'reservation.created' | 'reservation.updated' | 'reservation.canceled'
  | 'reservation.checked_in' | 'reservation.checked_out' | 'reservation.inquiry'
  | 'listing.updated' | 'listing.created'
  | 'message.created' | 'review.created'
  | 'task.created' | 'task.updated';

export interface GuestyWebhookPayload {
  event: GuestyWebhookEvent | string;
  data: {
    reservation?: Pick<GuestyReservation, '_id' | 'listingId' | 'status' | 'checkIn' | 'checkOut'>;
    listing?: Pick<GuestyListing, '_id' | 'title' | 'nickname'>;
    message?: Record<string, unknown>;
    review?: Record<string, unknown>;
    task?: Record<string, unknown>;
    [key: string]: unknown;
  };
  accountId?: string;
  timestamp?: string;
}

// ─── Mapped / Internal models (Supabase row shapes) ───────────────────────────

export interface MappedListing {
  guestyListingId: string;
  nickname: string;
  title: string | null;
  active: boolean;
  city: string | null;
  country: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  accommodates: number | null;
  basePrice: number | null;
  currency: string | null;
  thumbnailUrl: string | null;
  amenities: string[];
}

export interface MappedReservation {
  guestyReservationId: string;
  guestyListingId: string;
  guestName: string | null;
  guestEmail: string | null;
  checkIn: Date;
  checkOut: Date;
  nightsBooked: number;
  staysBooked: number;
  bookingDate: Date | null;
  status: string;
  payoutAmount: number;
  ownerPayoutAmount: number | null;
  source: string | null;
  confirmationCode: string | null;
  rawPayload: string;
}
