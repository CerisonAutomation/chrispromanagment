/**
 * Ω¹¹-ULTIMATE-OMNI-SYNTHESIZED Guesty Unified Client
 *
 * Consolidated, single source of truth for all Guesty API operations.
 * Merges and unifies:
 *  - guesty-api.ts (legacy)
 *  - guesty/client.ts (redis cached)
 *  - booking-api.ts (public booking engine)
 *  - mapper.ts, resources.ts, sync.ts, ai-context.ts
 *
 * Single import point: `import * as guesty from '@/lib/guesty'`
 *
 * @module guesty
 */

import { Redis } from '@upstash/redis';
import type {
  GuestyListing,
  GuestyListingsResponse,
  GuestyCalendarDay,
  GuestyAuthToken,
  GuestyPaginatedResponse,
  GuestyBookingQuote,
  GuestyReservation,
  GuestyReview
} from '@/types/guesty';

// ─── Configuration ─────────────────────────────────────────────────────────────

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const GUESTY_OPEN_API_BASE = process.env.GUESTY_BASE_URL ?? 'https://open-api.guesty.com/v1';
const GUESTY_BOOKING_API_BASE = 'https://booking-api.guesty.com/v2';
const GUESTY_TOKEN_URL = 'https://open-api.guesty.com/oauth2/token';
const REDIS_TOKEN_KEY = 'guesty:open_api:access_token';
const TOKEN_BUFFER_SECONDS = 60;
const DEFAULT_RETRIES = 3;

// ─── Result Type Pattern ───────────────────────────────────────────────────────

export type Result<T, E = Error> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: E };

function ok<T>(data: T): Result<T, never> {
  return { success: true, data } as const;
}

function err<E>(error: E): Result<never, E> {
  return { success: false, error } as const;
}

// ─── Token Management ─────────────────────────────────────────────────────────

async function fetchAndCacheOpenApiToken(): Promise<string> {
  const clientId = process.env.GUESTY_CLIENT_ID;
  const clientSecret = process.env.GUESTY_CLIENT_SECRET;

  if (!clientId?.trim() || !clientSecret?.trim()) {
    throw new Error('[Guesty] Missing required environment variables');
  }

  const res = await fetch(GUESTY_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      scope: 'open-api',
      client_id: clientId,
      client_secret: clientSecret,
    }),
    cache: 'no-store',
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`[Guesty] Token request failed ${res.status}: ${body}`);
  }

  const data = (await res.json()) as GuestyAuthToken;
  const ttl = Math.max(data.expires_in - TOKEN_BUFFER_SECONDS, 30);

  await redis.set(REDIS_TOKEN_KEY, data.access_token, { ex: ttl });
  return data.access_token;
}

export async function getAccessToken(): Promise<string> {
  try {
    const cached = await redis.get<string>(REDIS_TOKEN_KEY);
    if (cached) return cached;
  } catch {
    // Redis unavailable, fall back to fresh token
  }

  return fetchAndCacheOpenApiToken();
}

// ─── Core Unified Fetch Client ─────────────────────────────────────────────────

interface GuestyFetchOptions extends RequestInit {
  ttl?: number;
  params?: Record<string, string>;
  retries?: number;
  apiBase?: 'open' | 'booking';
}

async function guestyFetchRaw<T>(
  path: string,
  options: GuestyFetchOptions = {}
): Promise<T> {
  const {
    ttl,
    params,
    retries = DEFAULT_RETRIES,
    apiBase = 'open',
    ...fetchOptions
  } = options;

  const baseUrl = apiBase === 'open' ? GUESTY_OPEN_API_BASE : GUESTY_BOOKING_API_BASE;
  const url = new URL(`${baseUrl}${path}`);

  if (params) {
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v);
    }
  }

  const token = await getAccessToken();

  const res = await fetch(url.toString(), {
    ...fetchOptions,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(fetchOptions.headers ?? {}),
    },
    next: fetchOptions.method && fetchOptions.method !== 'GET'
      ? undefined
      : { revalidate: ttl ?? 60 },
  });

  // Automatic retry logic
  if (res.status === 429 && retries > 0) {
    const retryAfter = Number(res.headers.get('Retry-After') ?? '2');
    await new Promise(r => setTimeout(r, retryAfter * 1000));
    return guestyFetchRaw(path, { ...options, retries: retries - 1 });
  }

  if (res.status === 401 && retries > 0) {
    await redis.del(REDIS_TOKEN_KEY);
    return guestyFetchRaw(path, { ...options, retries: 0 });
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`[Guesty] ${res.status} ${path}: ${body}`);
  }

  return res.json() as Promise<T>;
}

/**
 * Safe Result-based fetch wrapper. Never throws.
 * Use this for all new code.
 */
export async function guestyFetch<T>(
  path: string,
  options: GuestyFetchOptions = {}
): Promise<Result<T, Error>> {
  try {
    return ok(await guestyFetchRaw<T>(path, options));
  } catch (e) {
    return err(e instanceof Error ? e : new Error(String(e)));
  }
}

/**
 * Fetch all pages from paginated endpoints automatically
 */
export async function guestyFetchAll<T>(
  path: string,
  params: Record<string, string> = {},
  limit = 100
): Promise<Result<T[], Error>> {
  try {
    const all: T[] = [];
    let skip = 0;

    while (true) {
      const data = await guestyFetchRaw<GuestyPaginatedResponse<T>>(path, {
        params: { ...params, limit: String(limit), skip: String(skip) },
      });

      all.push(...data.results);

      if (all.length >= (data.count ?? 0) || data.results.length < limit) {
        break;
      }

      skip += limit;
    }

    return ok(all);
  } catch (e) {
    return err(e instanceof Error ? e : new Error(String(e)));
  }
}

// ─── Public API Methods ────────────────────────────────────────────────────────

/**
 * Get paginated property listings
 */
export async function getListings(
  params: {
    limit?: number;
    skip?: number;
    tags?: string[];
    fields?: string;
  } = {}
): Promise<Result<GuestyListingsResponse, Error>> {
  const { limit = 20, skip = 0, tags, fields } = params;

  return guestyFetch<GuestyListingsResponse>('/listings', {
    params: {
      limit: String(Math.min(limit, 100)),
      skip: String(Math.max(skip, 0)),
      ...(tags?.length ? { tags: tags.join(',') } : {}),
      ...(fields ? { fields } : {}),
    },
  });
}

/**
 * Get single property listing by ID
 */
export async function getListing(
  id: string
): Promise<Result<GuestyListing, Error>> {
  if (!id?.trim()) {
    return err(new Error('[Guesty] getListing: id is required'));
  }

  return guestyFetch<GuestyListing>(`/listings/${encodeURIComponent(id)}`);
}

/**
 * Get property calendar availability
 */
export async function getListingCalendar(
  listingId: string,
  startDate: string,
  endDate: string
): Promise<Result<GuestyCalendarDay[], Error>> {
  if (!listingId?.trim()) {
    return err(new Error('[Guesty] getListingCalendar: listingId is required'));
  }

  const result = await guestyFetch<{ days?: GuestyCalendarDay[] } | GuestyCalendarDay[]>(
    '/availability-pricing/api/v3/listings/' + encodeURIComponent(listingId),
    {
      params: { startDate, endDate },
    }
  );

  if (!result.success) return err(result.error);

  const data = result.data;
  return ok(Array.isArray(data) ? data : (data.days ?? []));
}

/**
 * Get booking price quote for specific dates
 */
export async function getBookingQuote(
  params: {
    listingId: string;
    checkIn: string;
    checkOut: string;
    guestsCount?: number;
  }
): Promise<Result<GuestyBookingQuote, Error>> {
  const { listingId, checkIn, checkOut, guestsCount = 1 } = params;

  if (!listingId?.trim()) {
    return err(new Error('[Guesty] getBookingQuote: listingId is required'));
  }

  return guestyFetch<GuestyBookingQuote>(
    `/listings/${encodeURIComponent(listingId)}/price-quote`,
    {
      params: {
        checkInDate: checkIn,
        checkOutDate: checkOut,
        guests: String(guestsCount),
      },
    }
  );
}

/**
 * Get all reviews for a listing
 */
export async function getListingReviews(
  listingId: string
): Promise<Result<GuestyReview[], Error>> {
  return guestyFetchAll<GuestyReview>(`/listings/${encodeURIComponent(listingId)}/reviews`);
}

/**
 * Get upcoming reservations
 */
export async function getReservations(
  params: { from?: string; to?: string; status?: string } = {}
): Promise<Result<GuestyReservation[], Error>> {
  return guestyFetchAll<GuestyReservation>('/reservations', params);
}

// ─── Legacy Throwing Wrappers (Backwards Compatibility) ───────────────────────

/**
 * @deprecated Use getListings() which returns Result pattern
 */
export async function getListingsLegacy(
  params?: Parameters<typeof getListings>[0]
): Promise<GuestyListingsResponse> {
  const result = await getListings(params);
  if (!result.success) throw result.error;
  return result.data;
}

/**
 * @deprecated Use getListing() which returns Result pattern
 */
export async function getListingLegacy(id: string): Promise<GuestyListing> {
  const result = await getListing(id);
  if (!result.success) throw result.error;
  return result.data;
}

/**
 * @deprecated Use getListingCalendar() which returns Result pattern
 */
export async function getListingCalendarLegacy(
  listingId: string,
  startDate: string,
  endDate: string
): Promise<GuestyCalendarDay[]> {
  const result = await getListingCalendar(listingId, startDate, endDate);
  if (!result.success) throw result.error;
  return result.data;
}

// ─── Internal Test Utilities ───────────────────────────────────────────────────

/**
 * @internal For unit testing only
 */
export async function _clearTokenCache(): Promise<void> {
  await redis.del(REDIS_TOKEN_KEY);
}

/**
 * Re-export all submodules from single entry point
 */
export * from './mapper';
export * from './resources';
export * from './sync';
export * from './ai-context';
// Note: booking-api exports are imported by resources.ts, not re-exported here to avoid duplicates

export type {
  GuestyListing,
  GuestyListingsResponse,
  GuestyCalendarDay,
  GuestyAuthToken,
  GuestyPaginatedResponse,
  GuestyBookingQuote,
  GuestyReservation,
  GuestyReview
} from '@/types/guesty';
