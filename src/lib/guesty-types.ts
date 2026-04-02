// =============================================================================
// Guesty Booking Engine API — TypeScript Type Definitions
// Based on https://booking-api-docs.guesty.com/
// =============================================================================

// ---------------------------------------------------------------------------
// Primitive / Enum Types
// ---------------------------------------------------------------------------

export type GuestyPropertyType =
  | "apartment"
  | "house"
  | "villa"
  | "room"
  | "condo"
  | "guest_suite";

export type GuestyListingStatus = "active" | "inactive";

export type GuestyQuoteStatus =
  | "draft"
  | "pending"
  | "accepted"
  | "declined"
  | "expired"
  | "payment-pending"
  | "confirmed";

export type GuestyStayType = "NIGHTS";

// ---------------------------------------------------------------------------
// Listing — Full Object
// ---------------------------------------------------------------------------

export interface GuestyCoordinates {
  lat: number;
  lng: number;
}

export interface GuestyLocation {
  city: string;
  country: string;
  address: string;
  coordinates: GuestyCoordinates;
}

export interface GuestyListingImage {
  url: string;
  caption?: string;
  type?: string;
  order?: number;
}

export interface GuestyRatePlan {
  startDate: string;
  endDate: string;
  amount: number;
  currency: string;
}

export interface GuestyRates {
  baseRate: number;
  currency: string;
  minimumStay: {
    value: number;
    type: GuestyStayType;
  };
  ratesPlan: GuestyRatePlan[];
}

export interface GuestyListingReviewSummary {
  score: number;
  total: number;
  count: number;
}

export interface GuestyCalendarEntry {
  calendarId: string;
  source: string;
  listingCalendarId: string;
  status: string;
}

export interface GuestyListing {
  _id: string;
  listingId: string;
  title: string;
  nickname: string;
  description: string;
  summary: string;
  propertyType: GuestyPropertyType;
  location: GuestyLocation;
  amenities: string[];
  images: GuestyListingImage[];
  rates: GuestyRates;
  reviews: GuestyListingReviewSummary[];
  houseRules: string[];
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  calendars: GuestyCalendarEntry[];
  status: GuestyListingStatus;
}

// ---------------------------------------------------------------------------
// Listings List Response
// ---------------------------------------------------------------------------

export interface GuestyListingsResponse {
  results: GuestyListing[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ---------------------------------------------------------------------------
// Calendar / Availability
// ---------------------------------------------------------------------------

export interface GuestyCalendarDay {
  date: string;
  status: "available" | "booked" | "blocked" | "unavailable";
  note?: string;
  minStay?: number;
  price?: number;
  currency?: string;
}

export interface GuestyCalendarResponse {
  listingId: string;
  days: GuestyCalendarDay[];
  range: {
    from: string;
    to: string;
  };
}

// ---------------------------------------------------------------------------
// Quote / Booking Request
// ---------------------------------------------------------------------------

export interface GuestyGuest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  adults: number;
  children: number;
  infants: number;
}

export interface GuestyMoney {
  rentalAmount: number;
  cleaningFee: number;
  serviceFee: number;
  hostPayout: number;
  totalAmount: number;
  currency: string;
}

export interface GuestyQuote {
  _id: string;
  quoteId: string;
  status: GuestyQuoteStatus;
  listingId: string;
  checkIn: string;
  checkOut: string;
  guest: GuestyGuest;
  money: GuestyMoney;
  source: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface GuestyQuoteCreated {
  _id: string;
  quoteId: string;
  status: GuestyQuoteStatus;
  listingId: string;
  checkIn: string;
  checkOut: string;
  guest: GuestyGuest;
  money: GuestyMoney;
  source: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  paymentUrl?: string;
}

// ---------------------------------------------------------------------------
// Create Quote Request Body
// ---------------------------------------------------------------------------

export interface GuestyCreateQuoteBody {
  listingId: string;
  checkIn: string;
  checkOut: string;
  guest: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    adults?: number;
    children?: number;
    infants?: number;
  };
  source?: string;
  notes?: string;
}

// ---------------------------------------------------------------------------
// Accept Quote Response
// ---------------------------------------------------------------------------

export interface GuestyAcceptQuoteResponse {
  success: boolean;
  quote: GuestyQuote;
  paymentUrl?: string;
}

// ---------------------------------------------------------------------------
// Payment Gateway
// ---------------------------------------------------------------------------

export interface GuestyPaymentGateway {
  id: string;
  type: string;
  name: string;
  isActive: boolean;
  currencies: string[];
}

export interface GuestyPaymentGatewaysResponse {
  gateways: GuestyPaymentGateway[];
}

// ---------------------------------------------------------------------------
// Review
// ---------------------------------------------------------------------------

export interface GuestyReview {
  id: string;
  listingId: string;
  author: {
    name: string;
    avatar?: string;
  };
  rating: number;
  title?: string;
  content: string;
  date: string;
  response?: {
    content: string;
    date: string;
  };
  source: string;
}

export interface GuestyReviewsResponse {
  results: GuestyReview[];
  count: number;
  average: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ---------------------------------------------------------------------------
// Local Fallback Types (mapped from our Property / Booking schema)
// ---------------------------------------------------------------------------

export interface MappedProperty {
  id: string;
  externalId: string;
  slug: string;
  title: string;
  nickname: string;
  description: string;
  summary: string;
  propertyType: string;
  location: {
    city: string;
    country: string;
    address: string;
    coordinates: { lat: number; lng: number };
  };
  amenities: string[];
  images: { url: string; caption?: string; type?: string; order?: number }[];
  rates: {
    baseRate: number;
    currency: string;
    minimumStay: { value: number; type: string };
    ratesPlan: { startDate: string; endDate: string; amount: number; currency: string }[];
  };
  reviews: { score: number; total: number; count: number }[];
  houseRules: string[];
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  calendars: { calendarId: string; source: string; listingCalendarId: string; status: string }[];
  status: string;
  source: "guesty" | "local";
}

export interface MappedQuote {
  id: string;
  externalId: string;
  status: string;
  listingId: string;
  checkIn: string;
  checkOut: string;
  guest: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    adults: number;
    children: number;
    infants: number;
  };
  money: {
    rentalAmount: number;
    cleaningFee: number;
    serviceFee: number;
    hostPayout: number;
    totalAmount: number;
    currency: string;
  };
  source: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  sourceSystem: "guesty" | "local";
}

export interface MappedAvailability {
  listingId: string;
  days: {
    date: string;
    status: "available" | "booked" | "blocked" | "unavailable";
    note?: string;
  }[];
  range: { from: string; to: string };
  source: "guesty" | "local";
}

export interface MappedReview {
  id: string;
  listingId: string;
  author: { name: string; avatar?: string };
  rating: number;
  title?: string;
  content: string;
  date: string;
  response?: { content: string; date: string };
  source: string;
  sourceSystem: "guesty" | "local";
}

// ---------------------------------------------------------------------------
// Unified API Response Wrappers
// ---------------------------------------------------------------------------

export interface GuestyListingsResult {
  listings: MappedProperty[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
  source: "guesty" | "local";
}

export interface GuestyQuoteResult {
  quote: MappedQuote;
  paymentUrl?: string;
  source: "guesty" | "local";
}

// ---------------------------------------------------------------------------
// Query Parameter Types
// ---------------------------------------------------------------------------

export interface GuestyListingsQuery {
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  page?: number;
  limit?: number;
  propertyType?: string;
  bedrooms?: number;
  amenities?: string[];
}

export interface GuestyAvailabilityQuery {
  from?: string;
  to?: string;
}

export interface GuestyReviewsQuery {
  page?: number;
  limit?: number;
}
