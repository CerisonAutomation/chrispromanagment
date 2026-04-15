// ============================================================
// @cpm/shared-types — Shared TypeScript types for CPM Monorepo
// ============================================================

// ---- Property Types ----

export interface Property {
  id: string;
  name: string;
  slug: string;
  description: string;
  location: PropertyLocation;
  media: PropertyMedia[];
  pricing: PropertyPricing;
  amenities: string[];
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  status: PropertyStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyLocation {
  address: string;
  city: string;
  country: string;
  coordinates?: { lat: number; lng: number };
}

export interface PropertyMedia {
  id: string;
  url: string;
  alt: string;
  isPrimary?: boolean;
}

export interface PropertyPricing {
  baseNightlyRate: number;
  currency: string;
  cleaningFee?: number;
  minimumStay?: number;
}

export type PropertyStatus = 'active' | 'inactive' | 'maintenance' | 'draft';

// ---- Booking Types ----

export interface Booking {
  id: string;
  propertyId: string;
  guestId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: number;
  currency: string;
  status: BookingStatus;
  source: BookingSource;
  createdAt: string;
  updatedAt: string;
}

export type BookingStatus =
  | 'inquiry'
  | 'pending'
  | 'confirmed'
  | 'checked_in'
  | 'checked_out'
  | 'cancelled'
  | 'no_show';

export type BookingSource = 'direct' | 'airbnb' | 'booking_com' | 'guesty' | 'vrbo' | 'other';

// ---- Guest Types ----

export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  nationality?: string;
  createdAt: string;
}

// ---- User/Auth Types ----

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  createdAt: string;
}

export type UserRole = 'super_admin' | 'admin' | 'manager' | 'staff' | 'owner' | 'guest';

// ---- API Response Types ----

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ---- Availability Types ----

export interface AvailabilityWindow {
  propertyId: string;
  startDate: string;
  endDate: string;
  isAvailable: boolean;
  blockedReason?: 'booking' | 'maintenance' | 'owner_block';
}

// ---- Review Types ----

export interface Review {
  id: string;
  bookingId: string;
  propertyId: string;
  guestId: string;
  rating: number;
  comment: string;
  createdAt: string;
}
