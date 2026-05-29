/**
 * @fileoverview Guesty Type Definitions
 * Canonical type definitions for Guesty API
 */

// Auth & Token Types
export interface GuestyAuthToken {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface GuestyPaginatedResponse<T> {
  results: T[];
  cursor?: string;
  count?: number;
}

// Listing Types
export type GuestyListingStatus = 'active' | 'inactive' | 'pending' | 'suspended';
export type GuestyPropertyType = 'SINGLE' | 'MTL';

export interface GuestyListingAddress {
  city?: string;
  country?: string;
  state?: string;
  neighborhood?: string;
  lat?: number;
  lng?: number;
}

export interface GuestyListingPrices {
  basePrice?: number;
  currency?: string;
  cleaningFee?: number;
  securityDeposit?: number;
}

export interface GuestyListing {
  _id: string;
  title?: string;
  nickname?: string;
  propertyType?: string;
  active?: boolean;
  accommodates?: number;
  listingType?: GuestyPropertyType;
  roomType?: 'PRIVATE_ROOM' | 'ENTIRE_HOME_APT' | 'SHARED_ROOM';
  bedrooms?: number;
  bathrooms?: number;
  occupancy?: number;
  address?: GuestyListingAddress;
  prices?: GuestyListingPrices;
  amenities?: string[];
  pictures?: Array<{
    thumbnail?: string;
    regular?: string;
    large?: string;
    original?: string;
    caption?: string;
  }>;
  publicDescription?: {
    summary?: string;
    space?: string;
    access?: string;
    interaction?: string;
    neighborhood?: string;
    transit?: string;
    houseRules?: string;
  };
  reviewsStats?: {
    overallRating?: number;
    numberOfRatings?: number;
  };
  bedArrangements?: Array<{
    beds?: Array<{
      type: string;
      quantity: number;
    }>;
  }>;
  status?: GuestyListingStatus;
  createdAt?: string;
  updatedAt?: string;
}

// Raw types from API
export interface GuestyListingRaw extends GuestyListing {}

export interface GuestyListingsResponse {
  results: GuestyListing[];
  cursor?: string;
  count?: number;
}

// Reservation Types
export type GuestyReservationStatus = 'confirmed' | 'pending' | 'canceled' | 'declined' | 'awaiting_payment';

export interface GuestyReservationMoney {
  fareAccommodation?: number;
  fareAccommodationDiscount?: number;
  fareCleaning?: number;
  totalTaxes?: number;
  hostPayout?: number;
  currency?: string;
  ownerRevenue?: number;
  // Allow any other numeric fields
  [key: string]: number | string | undefined;
}

export interface GuestyReservationGuest {
  _id?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
  phone?: string;
}

export interface GuestyReservation {
  _id: string;
  confirmationCode?: string;
  listingId?: string;
  listing?: { _id?: string };
  checkIn?: string;
  checkOut?: string;
  status?: GuestyReservationStatus;
  nightsCount?: number;
  guests?: GuestyReservationGuest;
  money?: GuestyReservationMoney & { ownerRevenue?: number };
  guest?: GuestyReservationGuest;
  guestId?: string;
  guestName?: string;
  bookedAt?: string;
  source?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GuestyReservationRaw extends GuestyReservation {}

export interface GuestyReservationsResponse {
  results: GuestyReservation[];
  cursor?: string;
  count?: number;
}

// Calendar Types
export type GuestyCalendarStatus = 'available' | 'unavailable' | 'booked' | 'blocked' | 'reserved';

export interface GuestyCalendarDay {
  date: string;
  minNights?: number;
  status: GuestyCalendarStatus;
  isBaseMinNights?: boolean;
  cta?: boolean;
  ctd?: boolean;
  price?: number;
}

export interface GuestyCalendar {
  listingId: string;
  days: GuestyCalendarDay[];
}

export interface GuestyCalendarResponse {
  results?: GuestyCalendar[];
  data?: GuestyCalendar[];
}

// Quote Types
export interface GuestyQuoteRequest {
  listingId: string;
  checkIn: string;
  checkOut: string;
  guestsCount: number;
  source?: string;
}

export interface GuestyQuoteBreakdown {
  accommodationFare?: number;
  cleaningFee?: number;
  taxes?: number;
  total?: number;
  currency?: string;
}

export interface GuestyQuoteRaw {
  _id: string;
  createdAt: string;
  expiresAt: string;
  listingId?: string;
  checkIn?: string;
  checkOut?: string;
  nights?: number;
  money?: {
    farePaid?: number;
    hostPayout?: number;
    totalTaxes?: number;
    totalFees?: number;
    subTotal?: number;
    invoiceItems?: Array<{
      type: string;
      title?: string;
      amount: number;
      currency?: string;
    }>;
  };
  promotions?: {
    name?: string;
    type?: string;
    description?: string;
    adjustment?: number;
  };
}

export interface GuestyQuote {
  quoteId: string;
  totalPrice: number;
  currency: string;
  breakdown: GuestyQuoteBreakdown;
  checkIn: string;
  checkOut: string;
  nights: number;
  expiresAt?: string;
}

export type GuestyBookingQuote = GuestyQuote;

// Guest Profile Types
export interface GuestyGuestProfile {
  _id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  avatar?: string;
}

export interface GuestyGuestsResponse {
  results: GuestyGuestProfile[];
  cursor?: string;
  count?: number;
}

// Task Types
export interface GuestyTask {
  _id: string;
  title?: string;
  description?: string;
  status?: 'open' | 'in_progress' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  assignedTo?: string;
  listingId?: string;
  reservationId?: string;
}

export interface GuestyTasksResponse {
  results: GuestyTask[];
  cursor?: string;
  count?: number;
}

// Conversation Types
export interface GuestyConversation {
  _id: string;
  guestId?: string;
  reservationId?: string;
  listingId?: string;
  status?: 'active' | 'archived';
  lastMessageAt?: string;
  unreadCount?: number;
}

export interface GuestyConversationsResponse {
  results: GuestyConversation[];
  cursor?: string;
  count?: number;
}

// Owner Types
export interface GuestyOwner {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  company?: string;
}

export interface GuestyOwnersResponse {
  results: GuestyOwner[];
  cursor?: string;
  count?: number;
}

// Invoice Types
export interface GuestyInvoice {
  _id: string;
  reservationId?: string;
  amount?: number;
  currency?: string;
  status?: 'pending' | 'paid' | 'overdue' | 'cancelled';
  dueDate?: string;
  items?: Array<{
    description: string;
    amount: number;
  }>;
}

export interface GuestyInvoicesResponse {
  results: GuestyInvoice[];
  cursor?: string;
  count?: number;
}

// Webhook Types
export type GuestyWebhookEvent = 
  | 'listing.created'
  | 'listing.updated'
  | 'listing.deleted'
  | 'reservation.created'
  | 'reservation.updated'
  | 'reservation.cancelled'
  | 'reservation.confirmed'
  | 'guest.created'
  | 'guest.updated'
  | 'conversation.created'
  | 'conversation.message.received';

export interface GuestyWebhookPayload<T = unknown> {
  event: GuestyWebhookEvent;
  data: T;
  timestamp: string;
  webhookId?: string;
}

// Review Types
export interface GuestyReview {
  _id: string;
  listingId?: string;
  reservationId?: string;
  guestId?: string;
  rating?: number;
  comment?: string;
  createdAt?: string;
  response?: string;
  respondedAt?: string;
}

// Mapped Types (for internal use)
export interface MappedListing {
  id: string;
  title: string;
  nickname?: string;
  propertyType?: string;
  city?: string;
  country?: string;
  bedrooms?: number;
  bathrooms?: number;
  maxGuests?: number;
  basePrice?: number;
  currency?: string;
  amenities?: string[];
  images?: string[];
  rating?: number;
  reviewCount?: number;
}

export interface MappedReservation {
  id: string;
  confirmationCode?: string;
  listingId: string;
  guestName?: string;
  guestEmail?: string;
  checkIn: Date;
  checkOut: Date;
  bookingDate?: Date | null;
  status: GuestyReservationStatus;
  totalAmount?: number;
  currency?: string;
}
