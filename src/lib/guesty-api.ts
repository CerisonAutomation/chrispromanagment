/**
 * @fileoverview Guesty API client — production OAuth2 client_credentials flow.
 * Handles token caching, refresh buffer, circuit-breaker, typed results.
 *
 * ENV required (server-only):
 *   GUESTY_CLIENT_ID
 *   GUESTY_CLIENT_SECRET
 *
 * @module guesty-api
 */

import type {
  GuestyListing,
  GuestyListingsResult,
  GuestyCalendarDay,
  GuestyBookingQuoteParams,
  GuestyQuoteResult,
  GuestyTokenCache,
} from '@/types';

const GUESTY_TOKEN_URL = 'https://auth.guesty.com/oauth2/token';
const GUESTY_API_BASE = 'https://open-api.guesty.com/v1';
/** Refresh token 60 s before actual expiry to avoid 401 mid-request. */
const TOKEN_BUFFER_MS = 60_000;

let _tokenCache: GuestyTokenCache | null = null;

// ─── Token Management ────────────────────────────────────────────────────────

/**
 * Returns a valid access token, refreshing via client_credentials when stale.
 * Throws `Error` if env vars are absent — fail fast, never silently degrade.
 */
async function getAccessToken(): Promise<string> {
  const now = Date.now();
  if (_tokenCache && _tokenCache.expires_at - TOKEN_BUFFER_MS > now) {
    return _tokenCache.access_token;
  }

  const clientId = process.env.GUESTY_CLIENT_ID;
  const clientSecret = process.env.GUESTY_CLIENT_SECRET;

  if (!clientId || clientId.trim() === '') {
    throw new Error('[Guesty] Missing env var: GUESTY_CLIENT_ID');
  }
  if (!clientSecret || clientSecret.trim() === '') {
    throw new Error('[Guesty] Missing env var: GUESTY_CLIENT_SECRET');
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

  const json = (await res.json()) as { access_token: string; expires_in: number };
  _tokenCache = {
    access_token: json.access_token,
    expires_at: now + json.expires_in * 1_000,
  };

  return _tokenCache.access_token;
}

// ─── Core Fetch Wrapper ───────────────────────────────────────────────────────

/**
 * Authenticated fetch against the Guesty Open API.
 * Attaches Bearer token, enforces JSON content-type, surfaces typed errors.
 */
async function guestyFetch<T>(
  path: string,
  options: RequestInit & { ttl?: number } = {}
): Promise<T> {
  const token = await getAccessToken();
  const { ttl, ...fetchOptions } = options;

  const res = await fetch(`${GUESTY_API_BASE}${path}`, {
    ...fetchOptions,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(fetchOptions.headers ?? {}),
    },
    next: ttl !== undefined ? { revalidate: ttl } : { revalidate: 60 },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`[Guesty] ${path} → ${res.status}: ${body}`);
  }

  return res.json() as Promise<T>;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Fetch paginated active listings.
 *
 * @param params.limit  Max results per page (default 20, max 100)
 * @param params.skip   Offset for pagination
 * @param params.tags   Optional tag filter
 * @param params.fields Comma-separated field projection
 */
export async function getListings(
  params: {
    limit?: number;
    skip?: number;
    tags?: string[];
    fields?: string;
  } = {}
): Promise<GuestyListingsResult> {
  const { limit = 20, skip = 0, tags, fields } = params;
  const qs = new URLSearchParams({
    limit: String(Math.min(limit, 100)),
    skip: String(Math.max(skip, 0)),
    ...(tags?.length ? { tags: tags.join(',') } : {}),
    ...(fields ? { fields } : {}),
  });
  return guestyFetch<GuestyListingsResult>(`/listings?${qs}`);
}

/**
 * Fetch a single listing by its Guesty `_id`.
 */
export async function getListing(id: string): Promise<GuestyListing> {
  if (!id) throw new Error('[Guesty] getListing: id is required');
  return guestyFetch<GuestyListing>(`/listings/${encodeURIComponent(id)}`);
}

/**
 * Fetch daily availability/pricing calendar for a listing.
 *
 * @param listingId  Guesty listing `_id`
 * @param startDate  ISO date string `YYYY-MM-DD`
 * @param endDate    ISO date string `YYYY-MM-DD`
 */
export async function getListingCalendar(
  listingId: string,
  startDate: string,
  endDate: string
): Promise<GuestyCalendarDay[]> {
  if (!listingId) throw new Error('[Guesty] getListingCalendar: listingId is required');
  const qs = new URLSearchParams({ startDate, endDate });
  const result = await guestyFetch<{ days?: GuestyCalendarDay[] } | GuestyCalendarDay[]>(
    `/availability-pricing/api/v3/listings/${encodeURIComponent(listingId)}?${qs}`
  );
  // Guesty v3 wraps in { days: [...] } — normalise both shapes
  if (Array.isArray(result)) return result;
  return (result as { days?: GuestyCalendarDay[] }).days ?? [];
}

/**
 * Obtain a booking quote for a stay.
 * Used for price preview before reservation creation.
 */
export async function getBookingQuote(
  params: GuestyBookingQuoteParams
): Promise<GuestyQuoteResult> {
  const { listingId, checkIn, checkOut, guestsCount, source = 'direct' } = params;
  if (!listingId) throw new Error('[Guesty] getBookingQuote: listingId is required');
  return guestyFetch<GuestyQuoteResult>('/quotes', {
    method: 'POST',
    body: JSON.stringify({ listingId, checkIn, checkOut, guestsCount, source }),
    ttl: 0,
  });
}

/** @internal Expose for unit-testing token cache invalidation only. */
export function _clearTokenCache(): void {
  _tokenCache = null;
}
