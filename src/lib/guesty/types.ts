/**
 * @fileoverview Guesty domain types — shared across lib, API routes, and components.
 * All types derived from Guesty Open API v1 + Booking Engine API v2.
 */

// ─── Webhook ────────────────────────────────────────────────────────────────

export type GuestyWebhookEvent =
  | 'reservation.created'
  | 'reservation.updated'
  | 'reservation.canceled'
  | 'reservation.checked_in'
  | 'reservation.checked_out'
  | 'reservation.inquiry'
  | 'listing.updated'
  | 'listing.created'
  | 'message.created'
  | 'review.created'
  | 'task.created'
  | 'task.updated';

export interface GuestyWebhookReservation {
  _id: string;
  listingId: string;
  status: GuestyReservationStatus;
  checkIn: string;
  checkOut: string;
  guestId?: string;
  money?: {
    totalPaid: number;
    currency: string;
    hostPayout?: number;
  };
}

export interface GuestyWebhookListing {
  _id: string;
  title?: string;
  nickname?: string;
}

export interface GuestyWebhookPayload {
  event: GuestyWebhookEvent | string;
  data: {
    reservation?: GuestyWebhookReservation;
    listing?: GuestyWebhookListing;
    message?: Record<string, unknown>;
    review?: Record<string, unknown>;
    task?: Record<string, unknown>;
    [key: string]: unknown;
  };
  accountId?: string;
  timestamp?: string;
}

// ─── Listings ────────────────────────────────────────────────────────────

export type GuestyListingStatus = 'listed' | 'unlisted' | 'draft' | 'archived';

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

export interface GuestyListingRaw {
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

// ─── Reservations ─────────────────────────────────────────────────────────

export type GuestyReservationStatus =
  | 'inquiry'
  | 'declined'
  | 'expired'
  | 'canceled'
  | 'reserved'
  | 'confirmed'
  | 'checked_in'
  | 'checked_out'
  | 'closed';

export interface GuestyReservationMoney {
  totalPaid?: number;
  currency?: string;
  hostPayout?: number;
  fareAccommodation?: number;
  fareCleaning?: number;
  hostServiceFee?: number;
  guestServiceFee?: number;
  taxesPaid?: number;
  netIncome?: number;
}

export interface GuestyReservationGuest {
  _id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  picture?: string;
}

export interface GuestyReservationRaw {
  _id: string;
  listingId: string;
  status: GuestyReservationStatus;
  checkIn: string;
  checkOut: string;
  guestId?: string;
  guest?: GuestyReservationGuest;
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
  bookingDate?: string;
  confirmationCode?: string;
  nightsCount?: number;
}

// ─── Calendar ─────────────────────────────────────────────────────────────

export interface GuestyCalendarDay {
  date: string;
  status: 'available' | 'unavailable' | 'booked' | 'blocked' | 'owner';
  price?: number;
  currency?: string;
  minNights?: number;
  maxNights?: number;
  reservation?: { _id: string; status: GuestyReservationStatus };
}

export interface GuestyCalendar {
  listingId: string;
  days: GuestyCalendarDay[];
}

// ─── Quotes ───────────────────────────────────────────────────────────────

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
}

export interface GuestyQuoteRaw {
  _id?: string;
  listingId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  money?: GuestyQuoteBreakdown;
  status?: string;
}
