/**
 * @fileoverview Guesty API client — production OAuth2 client credentials flow.
 * Replaces the disabled stub. Handles token caching, refresh, and all listing ops.
 * ENV required: GUESTY_CLIENT_ID, GUESTY_CLIENT_SECRET
 */

const GUESTY_TOKEN_URL = 'https://auth.guesty.com/oauth2/token';
const GUESTY_API_BASE = 'https://open-api.guesty.com/v1';
const TOKEN_BUFFER_MS = 60_000; // refresh 1 min before expiry

interface GuestyTokenCache {
  access_token: string;
  expires_at: number;
}

let tokenCache: GuestyTokenCache | null = null;

async function getAccessToken(): Promise<string> {
  const now = Date.now();
  if (tokenCache && tokenCache.expires_at - TOKEN_BUFFER_MS > now) {
    return tokenCache.access_token;
  }

  const clientId = process.env.GUESTY_CLIENT_ID;
  const clientSecret = process.env.GUESTY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      '[Guesty] Missing env vars: GUESTY_CLIENT_ID and GUESTY_CLIENT_SECRET are required.'
    );
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
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`[Guesty] Token request failed ${res.status}: ${text}`);
  }

  const json = await res.json();
  tokenCache = {
    access_token: json.access_token,
    expires_at: now + json.expires_in * 1000,
  };

  return tokenCache.access_token;
}

async function guestyFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAccessToken();
  const res = await fetch(`${GUESTY_API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`[Guesty] API ${path} failed ${res.status}: ${text}`);
  }

  return res.json() as Promise<T>;
}

export interface GuestyListing {
  _id: string;
  title: string;
  nickname?: string;
  picture?: { thumbnail?: string; regular?: string; large?: string };
  address?: {
    full?: string;
    city?: string;
    country?: string;
    lat?: number;
    lng?: number;
  };
  bedrooms?: number;
  bathrooms?: number;
  accommodates?: number;
  prices?: { basePrice?: number; currency?: string };
  publicDescription?: { summary?: string; space?: string };
  amenities?: string[];
  tags?: string[];
  active?: boolean;
}

export interface GuestyListingsResult {
  results: GuestyListing[];
  count: number;
}

export interface GuestyCalendarDay {
  date: string;
  status: 'available' | 'unavailable' | 'booked';
  price?: number;
  minNights?: number;
}

/**
 * Fetch all active listings with optional filters.
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
    limit: String(limit),
    skip: String(skip),
    ...(tags?.length ? { tags: tags.join(',') } : {}),
    ...(fields ? { fields } : {}),
  });
  return guestyFetch<GuestyListingsResult>(`/listings?${qs}`);
}

/**
 * Fetch a single listing by ID.
 */
export async function getListing(id: string): Promise<GuestyListing> {
  return guestyFetch<GuestyListing>(`/listings/${id}`);
}

/**
 * Fetch availability calendar for a listing.
 */
export async function getListingCalendar(
  listingId: string,
  startDate: string,
  endDate: string
): Promise<GuestyCalendarDay[]> {
  const qs = new URLSearchParams({ startDate, endDate });
  return guestyFetch<GuestyCalendarDay[]>(
    `/availability-pricing/api/v3/listings/${listingId}?${qs}`
  );
}

/**
 * Get quote / pricing for a booking inquiry.
 */
export async function getBookingQuote(params: {
  listingId: string;
  checkIn: string;
  checkOut: string;
  guestsCount: number;
}): Promise<Record<string, unknown>> {
  return guestyFetch<Record<string, unknown>>('/quotes', {
    method: 'POST',
    body: JSON.stringify(params),
    next: undefined,
  });
}
