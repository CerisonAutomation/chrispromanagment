/**
 * Guesty Domain Models
 * Type-safe domain entities for Guesty integration
 */

export interface GuestyListing {
  id: string;
  title: string;
  description: string;
  propertyType: string;
  accommodates: number;
  bedrooms: number;
  bathrooms: number;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    neighborhood?: string;
  };
  amenities: string[];
  pricing: {
    basePrice: number;
    currency: string;
    cleaningFee: number;
  };
  images: GuestyImage[];
  availability: {
    checkIn: string;
    checkOut: string;
  };
  reviews?: {
    avg: number;
    total: number;
  };
  nightlyRates?: Record<string, number>;
  publicDescription?: {
    summary?: string;
    space?: string;
    neighborhood?: string;
  };
}

export interface GuestyImage {
  thumbnail?: string;
  regular?: string;
  large?: string;
  original?: string;
}

export interface GuestyQuote {
  id: string;
  listingId: string;
  checkIn: string;
  checkOut: string;
  guestsCount: number;
  basePrice: number;
  taxes: number;
  fees: number;
  totalPrice: number;
  currency: string;
  breakdown?: PricingBreakdown;
}

export interface PricingBreakdown {
  basePrice: number;
  cleaningFee: number;
  taxes: number;
  fees: number;
  total: number;
  currency: string;
}

export interface GuestyReservation {
  id: string;
  quoteId: string;
  guestId: string;
  listingId: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  checkIn: string;
  checkOut: string;
  totalAmount: number;
  paymentMethod: string;
  createdAt: string;
  updatedAt?: string;
}

export interface GuestyCalendar {
  listingId: string;
  date: string;
  available: boolean;
  price?: number;
  minimumStay?: number;
}

export interface GuestyCity {
  id: string;
  name: string;
  country: string;
  state?: string;
}

export interface GuestyPaymentProvider {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
}

export interface GuestyCoupon {
  code: string;
  discountPercentage: number;
  maxAmount?: number;
  expiresAt?: string;
  isActive: boolean;
}

// Filter types for repositories
export interface GuestyListingFilter {
  city?: string;
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  minBathrooms?: number;
  accommodates?: number;
  amenities?: string[];
  checkIn?: string;
  checkOut?: string;
}

export interface GuestyReservationFilter {
  listingId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  guestId?: string;
}

export interface GuestyCalendarFilter {
  listingId: string;
  from: string;
  to: string;
}
