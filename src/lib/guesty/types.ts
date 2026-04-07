/**
 * Exhaustive Guesty API type definitions.
 * Based on Guesty Open API v1 + patterns from Velocity-BPA/n8n-nodes-guesty (10 resources)
 * and dferrera-creator/margin-app (financial field mapping).
 *
 * If Guesty field names change, update ONLY this file and mapper.ts.
 */

// ─── Auth ───────────────────────────────────────────────────────────────────────────────

export interface GuestyAuthToken {
  access_token: string;
  expires_in: number;
  token_type: string;
}

// ─── Paginated Response ─────────────────────────────────────────────────────────────────

export interface GuestyPaginatedResponse<T> {
  results: T[];
  count: number;
  limit: number;
  skip: number;
}

// ─── Listing ─────────────────────────────────────────────────────────────────────────

export interface GuestyListing {
  _id: string;
  title?: string;
  nickname?: string;
  active?: boolean;
  listed?: boolean;
  address?: {
    full?: string;
    city?: string;
    state?: string;
    country?: string;
    lat?: number;
    lng?: number;
    zipcode?: string;
  };
  bedrooms?: number;
  bathrooms?: number;
  accommodates?: number;
  propertyType?: string;
  roomType?: string;
  prices?: {
    basePrice?: number;
    currency?: string;
    weeklyPriceFactor?: number;
    monthlyPriceFactor?: number;
    cleaningFee?: number;
    extraPersonFee?: number;
    securityDepositFee?: number;
  };
  pictures?: Array<{
    thumbnail?: string;
    large?: string;
    original?: string;
    caption?: string;
    sortOrder?: number;
  }>;
  publicDescription?: {
    summary?: string;
    space?: string;
    access?: string;
    interaction?: string;
    neighborhood?: string;
    transit?: string;
    houseRules?: string;
    notes?: string;
  };
  amenities?: string[];
  tags?: string[];
  checkInOutPolicy?: {
    checkInTime?: string;
    checkOutTime?: string;
    earlyCheckIn?: string;
    lateCheckOut?: string;
  };
  occupancyStats?: {
    occupancyRate?: number;
  };
  [key: string]: unknown;
}

export type GuestyListingsResponse = GuestyPaginatedResponse<GuestyListing>;

// ─── Reservation ───────────────────────────────────────────────────────────────────

export interface GuestyReservationMoney {
  /** Priority: hostPayout > ownerRevenue > totalPaid > fareAccommodation > netIncome */
  hostPayout?: number;
  ownerRevenue?: number;
  totalPaid?: number;
  fareAccommodation?: number;
  netIncome?: number;
  subTotalPrice?: number;
  balanceDue?: number;
  hostServiceFee?: number;
  totalTaxes?: number;
  hostPayoutUsd?: number;
  cleaningFee?: number;
  currency?: string;
  invoiceTotal?: number;
  payments?: Array<{
    amount?: number;
    currency?: string;
    status?: string;
    paidAt?: string;
    method?: string;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}

export interface GuestyGuest {
  _id?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  picture?: string;
  [key: string]: unknown;
}

export interface GuestyReservation {
  _id: string;
  status?: 'inquiry' | 'declined' | 'expired' | 'canceled' | 'reserved' | 'confirmed' | 'closed' | 'checked_in' | 'checked_out' | string;
  listingId?: string;
  listing?: {
    _id?: string;
    title?: string;
    nickname?: string;
    address?: { city?: string; country?: string };
    pictures?: Array<{ thumbnail?: string }>;
  };
  guest?: GuestyGuest;
  guestName?: string;
  checkIn?: string;
  checkOut?: string;
  checkInDateLocalized?: string;
  checkOutDateLocalized?: string;
  nightsCount?: number;
  guestsCount?: number;
  adultsCount?: number;
  childrenCount?: number;
  infantsCount?: number;
  money?: GuestyReservationMoney;
  confirmationCode?: string;
  source?: string;
  channelId?: string;
  bookedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  guestNote?: string;
  hostNote?: string;
  [key: string]: unknown;
}

export type GuestyReservationsResponse = GuestyPaginatedResponse<GuestyReservation>;

// ─── Calendar ──────────────────────────────────────────────────────────────────────

export interface GuestyCalendarDay {
  date: string;
  status: 'available' | 'unavailable' | 'booked' | string;
  price?: number;
  currency?: string;
  minNights?: number;
  cta?: boolean; // close to arrival
  ctd?: boolean; // close to departure
  reservationId?: string;
  note?: string;
  [key: string]: unknown;
}

export type GuestyCalendarResponse = GuestyCalendarDay[];

// ─── Guest ───────────────────────────────────────────────────────────────────────────

export interface GuestyGuestProfile {
  _id: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  picture?: string;
  preferredLocale?: string;
  reservations?: string[];
  [key: string]: unknown;
}

export type GuestyGuestsResponse = GuestyPaginatedResponse<GuestyGuestProfile>;

// ─── Quote ───────────────────────────────────────────────────────────────────────────

export interface GuestyQuote {
  listingId: string;
  checkIn: string;
  checkOut: string;
  guestsCount: number;
  money?: {
    fareAccommodation?: number;
    cleaningFee?: number;
    totalPrice?: number;
    tax?: number;
    currency?: string;
  };
  nights?: number;
  [key: string]: unknown;
}

// ─── Task ────────────────────────────────────────────────────────────────────────────

export interface GuestyTask {
  _id: string;
  title?: string;
  description?: string;
  status?: 'todo' | 'in-progress' | 'done' | string;
  dueDate?: string;
  assignee?: { _id?: string; fullName?: string };
  listingId?: string;
  reservationId?: string;
  [key: string]: unknown;
}

export type GuestyTasksResponse = GuestyPaginatedResponse<GuestyTask>;

// ─── Webhook ────────────────────────────────────────────────────────────────────────

export type GuestyWebhookEvent =
  | 'reservation.created'
  | 'reservation.updated'
  | 'reservation.canceled'
  | 'reservation.checked_in'
  | 'reservation.checked_out'
  | 'listing.created'
  | 'listing.updated'
  | 'guest.created'
  | 'guest.updated'
  | 'message.created';

export interface GuestyWebhookPayload {
  event: GuestyWebhookEvent;
  data: {
    reservation?: GuestyReservation;
    listing?: GuestyListing;
    guest?: GuestyGuestProfile;
    [key: string]: unknown;
  };
  accountId?: string;
  timestamp?: string;
}

// ─── Conversation ───────────────────────────────────────────────────────────────────

export interface GuestyMessage {
  _id?: string;
  body?: string;
  type?: 'host_message' | 'guest_message' | 'system' | string;
  createdAt?: string;
  attachments?: Array<{ url?: string; type?: string }>;
}

export interface GuestyConversation {
  _id: string;
  guestId?: string;
  reservationId?: string;
  listingId?: string;
  messages?: GuestyMessage[];
  lastMessage?: GuestyMessage;
  unreadCount?: number;
  [key: string]: unknown;
}

export type GuestyConversationsResponse = GuestyPaginatedResponse<GuestyConversation>;

// ─── Owner ───────────────────────────────────────────────────────────────────────────

export interface GuestyOwner {
  _id: string;
  fullName?: string;
  email?: string;
  phone?: string;
  [key: string]: unknown;
}

export type GuestyOwnersResponse = GuestyPaginatedResponse<GuestyOwner>;

// ─── Invoice ────────────────────────────────────────────────────────────────────────

export interface GuestyInvoice {
  _id: string;
  reservationId?: string;
  status?: 'paid' | 'unpaid' | 'partial' | string;
  total?: number;
  currency?: string;
  items?: Array<{
    type?: string;
    amount?: number;
    description?: string;
  }>;
  [key: string]: unknown;
}

export type GuestyInvoicesResponse = GuestyPaginatedResponse<GuestyInvoice>;

// ─── Internal mapped models (for Supabase storage) ────────────────────────────────────

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
