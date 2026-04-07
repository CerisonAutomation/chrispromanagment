/**
 * @fileoverview Guesty Booking Engine API — canonical client.
 *
 * BASE URL  : https://booking.guesty.com  (NOT open-api.guesty.com)
 * AUTH      : OAuth2 client_credentials → Bearer token
 * TOKEN CACHE: Upstash Redis — serverless-safe, shared across cold starts
 *
 * Token lifecycle:
 *   1. Check Redis key 'guesty:be_api:access_token'
 *   2. Cache hit  → use immediately
 *   3. Cache miss → POST /oauth2/token → store with TTL = expires_in - 60
 *   4. On 401     → del Redis key → retry once with fresh token
 *
 * Source: https://booking-api-docs.guesty.com
 */

import { Redis } from '@upstash/redis';
import { z } from 'zod';

// ─── Upstash Redis singleton ──────────────────────────────────────────────────

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const REDIS_TOKEN_KEY = 'guesty:be_api:access_token';

// ─── Zod Schemas — canonical GBE API shapes ───────────────────────────────────

export const GuestyTokenSchema = z.object({
  access_token: z.string(),
  token_type: z.string().default('Bearer'),
  expires_in: z.number(),
});

export const GuestyListingSchema = z.object({
  _id: z.string(),
  title: z.string().optional(),
  nickname: z.string().optional(),
  propertyType: z.string().optional(),
  listingType: z.enum(['SINGLE', 'MTL']).optional(),
  roomType: z.enum(['PRIVATE_ROOM', 'ENTIRE_HOME_APT', 'SHARED_ROOM']).optional(),
  bedrooms: z.number().optional(),
  bathrooms: z.number().optional(),
  /** Maximum guests (accommodates) */
  occupancy: z.number().optional(),
  address: z.object({
    city: z.string().optional(),
    country: z.string().optional(),
    state: z.string().optional(),
    neighborhood: z.string().optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
  }).optional(),
  prices: z.object({
    basePrice: z.number().optional(),
    currency: z.string().optional(),
  }).optional(),
  amenities: z.array(z.string()).optional(),
  pictures: z.array(z.object({
    thumbnail: z.string().optional(),
    regular: z.string().optional(),
    large: z.string().optional(),
  })).optional(),
  publicDescription: z.object({
    summary: z.string().optional(),
    space: z.string().optional(),
  }).optional(),
  reviewsStats: z.object({
    overallRating: z.number().optional(),
    numberOfRatings: z.number().optional(),
  }).optional(),
  bedArrangements: z.array(z.object({
    beds: z.array(z.object({
      type: z.string(),
      quantity: z.number(),
    })).optional(),
  })).optional(),
});

export const GuestyListingsResponseSchema = z.object({
  results: z.array(GuestyListingSchema),
  cursor: z.string().optional(),
  count: z.number().optional(),
});

export const GuestyCalendarDaySchema = z.object({
  date: z.string(),
  minNights: z.number(),
  isBaseMinNights: z.boolean().optional(),
  /** available | unavailable | reserved | booked */
  status: z.enum(['available', 'unavailable', 'reserved', 'booked']),
  /** cta = closed to arrival */
  cta: z.boolean().optional(),
  /** ctd = closed to departure */
  ctd: z.boolean().optional(),
});

/**
 * Invoice item from a quote's rate plan.
 * type examples: ACCOMMODATION_FARE | CLEANING_FEE | CITY_TAX | SERVICE_FEE
 */
const InvoiceItemSchema = z.object({
  type: z.string(),
  title: z.string().optional(),
  amount: z.number(),
  currency: z.string().optional(),
});

const RatePlanMoneySchema = z.object({
  invoiceItems: z.array(InvoiceItemSchema).optional(),
  /**
   * farePaid = the GUEST-FACING total price.
   * ALWAYS use this for display. NEVER show hostPayout to guests.
   */
  farePaid: z.number().optional(),
  netAmount: z.number().optional(),
  /** hostPayout = what the HOST receives after Guesty fees. DO NOT show to guests. */
  hostPayout: z.number().optional(),
  totalTaxes: z.number().optional(),
  totalFees: z.number().optional(),
  subTotal: z.number().optional(),
});

export const GuestyQuoteSchema = z.object({
  _id: z.string(),
  createdAt: z.string(),
  /** Quote expires — must book before this time */
  expiresAt: z.string(),
  promotions: z.object({
    name: z.string().optional(),
    type: z.string().optional(),
    description: z.string().optional(),
    adjustment: z.number().optional(),
  }).optional(),
  coupons: z.array(z.object({
    name: z.string().optional(),
    type: z.string().optional(),
    code: z.string(),
    adjustment: z.number(),
  })).optional(),
  rates: z.object({
    ratePlans: z.array(z.object({
      ratePlan: z.object({
        /** Use this _id as ratePlanId when creating instant reservation */
        _id: z.string(),
        name: z.string(),
        type: z.string().optional(),
        cancellationPolicy: z.array(z.string()).optional(),
      }),
      inquiryId: z.string().optional(),
      money: RatePlanMoneySchema.optional(),
    })),
  }),
});

export const GuestyInstantReservationSchema = z.object({
  _id: z.string(),
  status: z.literal('confirmed'),
  platform: z.literal('direct'),
  confirmationCode: z.string(),
  createdAt: z.string(),
  guestId: z.string(),
});

export const GuestyPaymentProviderSchema = z.object({
  /** Stripe publishable key — use with Stripe.js to tokenize pm_... SCA tokens */
  publishableKey: z.string(),
});

// ─── Exported Types ────────────────────────────────────────────────────────────

export type GuestyListing = z.infer<typeof GuestyListingSchema>;
export type GuestyListingsResponse = z.infer<typeof GuestyListingsResponseSchema>;
export type GuestyCalendarDay = z.infer<typeof GuestyCalendarDaySchema>;
export type GuestyQuote = z.infer<typeof GuestyQuoteSchema>;
export type GuestyInstantReservation = z.infer<typeof GuestyInstantReservationSchema>;

// ─── Custom Error Classes ─────────────────────────────────────────────────────

export class GuestyAPIError extends Error {
  public readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'GuestyAPIError';
    this.status = status;
  }
}

export class GuestyRateLimitError extends GuestyAPIError {
  public readonly retryAfter: number;
  constructor(message: string, retryAfter: number) {
    super(message, 429);
    this.name = 'GuestyRateLimitError';
    this.retryAfter = retryAfter;
  }
}

// ─── Token Management — Upstash Redis ────────────────────────────────────────

/**
 * Fetches a fresh Guesty BE API token and stores it in Upstash Redis.
 * TTL = expires_in - 60s (60s safety buffer before real expiry).
 * @internal — use getGuestyToken() instead
 */
async function fetchAndCacheToken(): Promise<string> {
  const clientId = process.env.GUESTY_CLIENT_ID;
  const clientSecret = process.env.GUESTY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new GuestyAPIError(
      '[GuestyBEAPI] Missing GUESTY_CLIENT_ID or GUESTY_CLIENT_SECRET. ' +
      'These are Booking Engine API credentials — separate from Open API keys.',
      500,
    );
  }

  const res = await fetch('https://booking.guesty.com/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
      scope: 'booking-engine-api',
    }),
    cache: 'no-store',
  });

  if (!res.ok) {
    const body = await res.text();
    throw new GuestyAPIError(`[GuestyBEAPI] Token fetch failed ${res.status}: ${body}`, res.status);
  }

  const raw: unknown = await res.json();
  const parsed = GuestyTokenSchema.parse(raw);
  const ttl = Math.max(parsed.expires_in - 60, 30);
  await redis.set(REDIS_TOKEN_KEY, parsed.access_token, { ex: ttl });
  return parsed.access_token;
}

/**
 * Returns a valid Guesty BE API Bearer token.
 * Reads from Upstash Redis cache first — only fetches if expired or missing.
 * This is the sole entry point for token retrieval.
 */
export async function getGuestyBeToken(): Promise<string> {
  const cached = await redis.get<string>(REDIS_TOKEN_KEY);
  if (cached) return cached;
  return fetchAndCacheToken();
}

/**
 * Force-invalidates the cached token (call on 401 before retry).
 */
export async function invalidateGuestyToken(): Promise<void> {
  await redis.del(REDIS_TOKEN_KEY);
}

// ─── Authenticated Fetch ──────────────────────────────────────────────────────

const GBE_BASE = 'https://booking.guesty.com';

interface GBEFetchOptions extends Omit<RequestInit, 'headers'> {
  /** Next.js ISR revalidation TTL in seconds. 0 = no-store. Default: 60 */
  revalidate?: number;
}

async function gbeFetch<T>(
  path: string,
  schema: z.ZodType<T>,
  options: GBEFetchOptions = {},
  _isRetry = false,
): Promise<T> {
  const token = await getGuestyBeToken();
  const { revalidate = 60, ...rest } = options;

  const res = await fetch(`${GBE_BASE}${path}`, {
    ...rest,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    ...(revalidate > 0
      ? { next: { revalidate } }
      : { cache: 'no-store' as const }),
  });

  if (res.status === 429) {
    const retryAfter = Number(res.headers.get('Retry-After') ?? '30');
    throw new GuestyRateLimitError(
      `[GuestyBEAPI] Rate limited on ${path}. Retry after ${retryAfter}s`,
      retryAfter,
    );
  }

  // 401: token expired mid-session — invalidate cache and retry once
  if (res.status === 401 && !_isRetry) {
    await invalidateGuestyToken();
    return gbeFetch(path, schema, options, true);
  }

  if (!res.ok) {
    const body = await res.text();
    throw new GuestyAPIError(`[GuestyBEAPI] ${res.status} ${path}: ${body}`, res.status);
  }

  const data: unknown = await res.json();
  return schema.parse(data);
}

// ─── Public API Methods ───────────────────────────────────────────────────────

/** All supported query params for GET /api/listings */
export interface ListingsParams {
  limit?: number;
  cursor?: string;
  checkIn?: string;
  checkOut?: string;
  city?: string;
  country?: string;
  state?: string;
  neighborhood?: string;
  minPrice?: number;
  maxPrice?: number;
  currency?: string;
  numberOfBedrooms?: number;
  numberOfBathrooms?: number;
  minOccupancy?: number;
  propertyType?: string;
  roomType?: string;
  listingType?: 'SINGLE' | 'MTL';
  petsAllowed?: boolean;
  smokingAllowed?: boolean;
  suitableForChildren?: boolean;
  suitableForInfants?: boolean;
  includeAmenities?: string;
  excludeAmenities?: string;
  tags?: string[];
  fields?: string;
  minLng?: number;
  maxLng?: number;
  minLat?: number;
  maxLat?: number;
  kingBed?: number;
  queenBed?: number;
  doubleBed?: number;
  singleBed?: number;
  sofaBed?: number;
  bunkBed?: number;
  crib?: number;
}

/**
 * GET /api/listings
 * Paginated listing search. Use `cursor` from response for next page.
 * Cached 5 minutes (ISR-compatible).
 */
export async function getListings(
  params: ListingsParams = {},
): Promise<GuestyListingsResponse> {
  const qs = new URLSearchParams();
  (Object.entries(params) as [string, unknown][]).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    if (Array.isArray(v)) {
      v.forEach((item) => qs.append(k, String(item)));
    } else {
      qs.set(k, String(v));
    }
  });
  if (!qs.has('limit')) qs.set('limit', '20');
  return gbeFetch(`/api/listings?${qs.toString()}`, GuestyListingsResponseSchema, { revalidate: 300 });
}

/**
 * GET /api/listings/{listingId}
 * Single listing detail. Cached 5 minutes.
 */
export async function getListing(listingId: string): Promise<GuestyListing> {
  return gbeFetch(
    `/api/listings/${encodeURIComponent(listingId)}`,
    GuestyListingSchema,
    { revalidate: 300 },
  );
}

/**
 * GET /api/listings/{listingId}/calendar?from=YYYY-MM-DD&to=YYYY-MM-DD
 * Per-day availability. status: 'available' | 'unavailable' | 'reserved' | 'booked'
 * cta = closed to arrival, ctd = closed to departure
 */
export async function getListingCalendar(
  listingId: string,
  from: string,
  to: string,
): Promise<GuestyCalendarDay[]> {
  return gbeFetch(
    `/api/listings/${encodeURIComponent(listingId)}/calendar?from=${from}&to=${to}`,
    z.array(GuestyCalendarDaySchema),
    { revalidate: 300 },
  );
}

/**
 * GET /api/listings/{listingId}/payment-provider
 * Returns Stripe publishableKey for this listing.
 * REQUIRED before tokenizing a card via Stripe.js.
 * Only pm_... (SCA) tokens are supported — NOT tok_... (pre-SCA).
 */
export async function getPaymentProvider(
  listingId: string,
): Promise<z.infer<typeof GuestyPaymentProviderSchema>> {
  return gbeFetch(
    `/api/listings/${encodeURIComponent(listingId)}/payment-provider`,
    GuestyPaymentProviderSchema,
    { revalidate: 3600 },
  );
}

export interface CreateQuoteParams {
  listingId: string;
  /** Format: YYYY-MM-DD */
  checkInDateLocalized: string;
  /** Format: YYYY-MM-DD */
  checkOutDateLocalized: string;
  guestsCount: number;
  /** Optional coupon code */
  coupons?: string;
}

/**
 * POST /api/reservations/quotes
 * Creates a price quote. MUST be called before any reservation.
 * Quote expires at response.expiresAt — must book before then.
 *
 * PRICING: use rates.ratePlans[0].money.farePaid for guest-facing total.
 * hostPayout is what the host receives after Guesty fees — NEVER display to guests.
 */
export async function createQuote(params: CreateQuoteParams): Promise<GuestyQuote> {
  return gbeFetch('/api/reservations/quotes', GuestyQuoteSchema, {
    method: 'POST',
    body: JSON.stringify(params),
    revalidate: 0,
  });
}

/**
 * GET /api/reservations/quotes/{quoteId}
 * Retrieve existing quote by ID.
 */
export async function getQuote(quoteId: string): Promise<GuestyQuote> {
  return gbeFetch(
    `/api/reservations/quotes/${encodeURIComponent(quoteId)}`,
    GuestyQuoteSchema,
    { revalidate: 0 },
  );
}

export interface CreateInstantReservationParams {
  /** Must be one of the ratePlan._id values from the quote response */
  ratePlanId: string;
  /**
   * Stripe SCA payment method token.
   * MUST start with pm_... — tok_... pre-SCA tokens are NOT supported by GBE API.
   * Obtain via: stripe.createPaymentMethod() after calling getPaymentProvider().
   */
  ccToken: string;
  guest: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
}

/**
 * POST /api/reservations/quotes/{quoteId}/instant
 * Creates an instant (confirmed) reservation from a valid quote.
 * Response contains confirmationCode for the booking confirmation page.
 */
export async function createInstantReservation(
  quoteId: string,
  params: CreateInstantReservationParams,
): Promise<GuestyInstantReservation> {
  return gbeFetch(
    `/api/reservations/quotes/${encodeURIComponent(quoteId)}/instant`,
    GuestyInstantReservationSchema,
    { method: 'POST', body: JSON.stringify(params), revalidate: 0 },
  );
}

/**
 * POST /api/reservations/quotes/{quoteId}/inquiry
 * Creates an inquiry (request to book — not instant confirmation).
 */
export async function createInquiry(
  quoteId: string,
  params: CreateInstantReservationParams,
): Promise<GuestyInstantReservation> {
  return gbeFetch(
    `/api/reservations/quotes/${encodeURIComponent(quoteId)}/inquiry`,
    GuestyInstantReservationSchema,
    { method: 'POST', body: JSON.stringify(params), revalidate: 0 },
  );
}

/**
 * POST /api/reservations/quotes/{quoteId}/coupons
 * Apply a coupon code to an existing quote.
 */
export async function applyCoupon(
  quoteId: string,
  couponCode: string,
): Promise<GuestyQuote> {
  return gbeFetch(
    `/api/reservations/quotes/${encodeURIComponent(quoteId)}/coupons`,
    GuestyQuoteSchema,
    { method: 'POST', body: JSON.stringify({ code: couponCode }), revalidate: 0 },
  );
}

/**
 * GET /api/cities
 * List of all cities for listings in the booking engine.
 * Useful for search dropdowns.
 */
export async function getCities(): Promise<string[]> {
  return gbeFetch('/api/cities', z.array(z.string()), { revalidate: 3600 });
}

/**
 * GET /api/reviews?listingId={listingId}
 * Guest reviews for a specific listing.
 */
export async function getReviews(
  listingId: string,
): Promise<unknown[]> {
  return gbeFetch(
    `/api/reviews?listingId=${encodeURIComponent(listingId)}`,
    z.array(z.unknown()),
    { revalidate: 1800 },
  );
}
