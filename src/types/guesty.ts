// =============================================================================
// GUESTY DOMAIN TYPES
// Authoritative. Replaces: src/lib/guesty-types.ts
// =============================================================================

export interface GuestyAddress {
  full?: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zipcode?: string;
  lat?: number;
  lng?: number;
}

export interface GuestyPicture {
  thumbnail?: string;
  regular?: string;
  large?: string;
  original?: string;
  caption?: string;
}

export interface GuestyPrices {
  basePrice?: number;
  weeklyPriceFactor?: number;
  monthlyPriceFactor?: number;
  currency?: string;
  cleaningFee?: number;
  extraPersonFee?: number;
  securityDepositFee?: number;
}

export interface GuestyPublicDescription {
  summary?: string;
  space?: string;
  access?: string;
  interaction?: string;
  neighborhood?: string;
  transit?: string;
  houseRules?: string;
}

export interface GuestyListing {
  _id: string;
  title: string;
  nickname?: string;
  internalName?: string;
  picture?: GuestyPicture;
  pictures?: GuestyPicture[];
  address?: GuestyAddress;
  bedrooms?: number;
  bathrooms?: number;
  beds?: number;
  accommodates?: number;
  propertyType?: string;
  roomType?: string;
  prices?: GuestyPrices;
  publicDescription?: GuestyPublicDescription;
  amenities?: string[];
  tags?: string[];
  active?: boolean;
  listed?: boolean;
  importedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GuestyListingsResult {
  results: GuestyListing[];
  count: number;
  limit: number;
  skip: number;
}

export type GuestyCalendarStatus = 'available' | 'unavailable' | 'booked' | 'blocked';

export interface GuestyCalendarDay {
  date: string;
  status: GuestyCalendarStatus;
  price?: number;
  minNights?: number;
  note?: string;
}

export interface GuestyBookingQuoteParams {
  listingId: string;
  checkIn: string;
  checkOut: string;
  guestsCount: number;
  source?: string;
}

export interface GuestyQuoteResult {
  quoteId?: string;
  totalPrice?: number;
  currency?: string;
  breakdown?: Record<string, unknown>;
  checkIn: string;
  checkOut: string;
  nights?: number;
}

export interface GuestyTokenCache {
  access_token: string;
  expires_at: number;
}
