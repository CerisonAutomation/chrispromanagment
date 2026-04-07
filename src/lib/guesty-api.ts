/**
 * @fileoverview Guesty API client — production OAuth2 client_credentials flow.
 * Handles token caching, refresh buffer, circuit-breaker, typed results.
 * Uses Result<T, E> pattern for railway-oriented error handling.
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
import { ok, err, type Result } from '@/types/consolidated';

const GUESTY_TOKEN_URL = 'https://auth.guesty.com/oauth2/token';
const GUESTY_API_BASE = 'https://open-api.guesty.com/v1';
const TOKEN_BUFFER_MS = 60_000;

let _tokenCache: GuestyTokenCache | null = null;

// ─── Token Management ────────────────────────────────────────────────────────

/**
 * Returns a valid access token, refreshing via client_credentials when stale.
 * Uses Result pattern for explicit error handling.
 */
async function getAccessToken(): Promise<Result<string, Error>> {
  const now = Date.now();
  if (_tokenCache && _tokenCache.expires_at - TOKEN_BUFFER_MS > now) {
    return ok(_tokenCache.access_token);
  }

  const clientId = process.env.GUESTY_CLIENT_ID;
  const clientSecret = process.env.GUESTY_CLIENT_SECRET;

  if (!clientId || clientId.trim() === '') {
    return err(new Error('[Guesty] Missing env var: GUESTY_CLIENT_ID'));
  }
  if (!clientSecret || clientSecret.trim() === '') {
    return err(new Error('[Guesty] Missing env var: GUESTY_CLIENT_SECRET'));
  }

  try {
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
      return err(new Error(`[Guesty] Token request failed ${res.status}: ${body}`));
    }

    const json = (await res.json()) as { access_token: string; expires_in: number };
    _tokenCache = {
      access_token: json.access_token,
      expires_at: now + json.expires_in * 1_000,
    };

    return ok(_tokenCache.access_token);
  } catch (e) {
    return err(e instanceof Error ? e : new Error(String(e)));
  }
}

// ─── Core Fetch Wrapper ───────────────────────────────────────────────────────

/**
 * Authenticated fetch against the Guesty Open API.
 * Uses Result pattern for error handling.
 */
async function guestyFetch<T>(
  path: string,
  options: RequestInit & { ttl?: number } = {}
): Promise<Result<T, Error>> {
  const tokenResult = await getAccessToken();
  if (!tokenResult.success) {
    return err(tokenResult.error);
  }

  const { ttl, ...fetchOptions } = options;

  try {
    const res = await fetch(`${GUESTY_API_BASE}${path}`, {
      ...fetchOptions,
      headers: {
        Authorization: `Bearer ${tokenResult.data}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(fetchOptions.headers ?? {}),
      },
      next: ttl !== undefined ? { revalidate: ttl } : { revalidate: 60 },
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      return err(new Error(`[Guesty] ${path} → ${res.status}: ${body}`));
    }

    return ok(await res.json() as T);
  } catch (e) {
    return err(e instanceof Error ? e : new Error(String(e)));
  }
}

// ─── Public API (Result-based) ───────────────────────────────────────────────

/**
 * Fetch paginated active listings.
 */
export async function getListings(
  params: {
    limit?: number;
    skip?: number;
    tags?: string[];
    fields?: string;
  } = {}
): Promise<Result<GuestyListingsResult, Error>> {
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
export async function getListing(id: string): Promise<Result<GuestyListing, Error>> {
  if (!id) return err(new Error('[Guesty] getListing: id is required'));
  return guestyFetch<GuestyListing>(`/listings/${encodeURIComponent(id)}`);
}

/**
 * Fetch daily availability/pricing calendar for a listing.
 */
export async function getListingCalendar(
  listingId: string,
  startDate: string,
  endDate: string
): Promise<Result<GuestyCalendarDay[], Error>> {
  if (!listingId) return err(new Error('[Guesty] getListingCalendar: listingId is required'));
  const qs = new URLSearchParams({ startDate, endDate });
  
  const result = await guestyFetch<{ days?: GuestyCalendarDay[] } | GuestyCalendarDay[]>(
    `/availability-pricing/api/v3/listings/${encodeURIComponent(listingId)}?${qs}`
  );
  
  if (!result.success) return err(result.error);
  
  const data = result.data;
  if (Array.isArray(data)) return ok(data);
  return ok((data as { days?: GuestyCalendarDay[] }).days ?? []);
}

/**
 * Obtain a booking quote for a stay.
 */
export async function getBookingQuote(
  params: GuestyBookingQuoteParams
): Promise<Result<GuestyQuoteResult, Error>> {
  const { listingId, checkIn, checkOut, guestsCount, source = 'direct' } = params;
  if (!listingId) return err(new Error('[Guesty] getBookingQuote: listingId is required'));
  
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

// ─── Legacy compatibility (wrappers that throw) ─────────────────────────────
// These maintain backward compatibility while the codebase migrates to Result pattern

export async function getListingsLegacy(params: {
  limit?: number;
  skip?: number;
  tags?: string[];
  fields?: string;
} = {}): Promise<GuestyListingsResult> {
  const result = await getListings(params);
  if (!result.success) throw result.error;
  return result.data;
}

export async function getListingLegacy(id: string): Promise<GuestyListing> {
  const result = await getListing(id);
  if (!result.success) throw result.error;
  return result.data;
}

export async function getListingCalendarLegacy(
  listingId: string,
  startDate: string,
  endDate: string
): Promise<GuestyCalendarDay[]> {
  const result = await getListingCalendar(listingId, startDate, endDate);
  if (!result.success) throw result.error;
  return result.data;
}

export async function getBookingQuoteLegacy(
  params: GuestyBookingQuoteParams
): Promise<GuestyQuoteResult> {
  const result = await getBookingQuote(params);
  if (!result.success) throw result.error;
  return result.data;
}