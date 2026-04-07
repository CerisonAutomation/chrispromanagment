/**
 * @fileoverview Canonical type definitions — single source of truth.
 * All domain types live here. Import from '@/types' everywhere.
 */

// ─── CMS ─────────────────────────────────────────────────────────────────────
export interface CmsPage {
  id: string;
  slug: string;
  title: string;
  data: PuckData;
  published: boolean;
  theme: string;
  created_at: string;
  updated_at: string;
}

export interface PuckData {
  content: PuckContent[];
  root: { props: Record<string, unknown> };
}

export interface PuckContent {
  type: string;
  props: Record<string, unknown>;
}

// ─── GUESTY / PROPERTY ───────────────────────────────────────────────────────
export interface GuestyListing {
  _id: string;
  title: string;
  nickname?: string;
  address: {
    full: string;
    city: string;
    country: string;
    lat?: number;
    lng?: number;
  };
  prices: {
    basePrice: number;
    currency: string;
    weeklyPriceFactor?: number;
    monthlyPriceFactor?: number;
  };
  amenities?: string[];
  pictures?: Array<{ thumbnail: string; original: string; caption?: string }>;
  bedrooms?: number;
  bathrooms?: number;
  accommodates?: number;
  propertyType?: string;
  roomType?: string;
  publicDescription?: { summary?: string; space?: string; access?: string };
}

export interface GuestyCalendarDay {
  date: string;
  status: 'available' | 'unavailable' | 'booked';
  price?: number;
  minNights?: number;
}

export interface BookingQuote {
  listingId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  basePrice: number;
  cleaningFee: number;
  taxes: number;
  total: number;
  currency: string;
}

export interface BookingInquiry {
  listingId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  message?: string;
}

// ─── API RESPONSES ────────────────────────────────────────────────────────────
export type ApiSuccess<T> = { data: T; error: null };
export type ApiError = { data: null; error: string };
export type ApiResult<T> = ApiSuccess<T> | ApiError;

export function apiOk<T>(data: T): ApiSuccess<T> {
  return { data, error: null };
}
export function apiErr(error: string): ApiError {
  return { data: null, error };
}

// ─── ENV ──────────────────────────────────────────────────────────────────────
export interface EnvConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceKey: string;
  guestyClientId: string;
  guestyClientSecret: string;
  nextPublicSiteUrl: string;
}
