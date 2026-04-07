/**
 * Canonical Guesty API client - 15/10 Quality Implementation.
 * All Guesty API routes must import from here — never call Guesty directly from route handlers.
 * Uses Result<T, E> pattern for railway-oriented error handling.
 */

import { ok, err, type Result } from '@/types/consolidated';

const GUESTY_BASE = 'https://open-api.guesty.com/v1';
const TOKEN_URL = 'https://open-api.guesty.com/oauth2/token';

// ─── Token cache (module-level singleton) ────────────────────────────────────────────
let _accessToken: string | null = null;
let _tokenExpiry = 0;

/**
 * Get access token with Result pattern for explicit error handling.
 */
async function getAccessToken(): Promise<Result<string, Error>> {
  if (_accessToken && Date.now() < _tokenExpiry - 60_000) {
    return ok(_accessToken);
  }

  const clientId = process.env.GUESTY_CLIENT_ID;
  const clientSecret = process.env.GUESTY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return err(new Error('[guesty.ts] Missing GUESTY_CLIENT_ID or GUESTY_CLIENT_SECRET env vars.'));
  }

  try {
    const res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        scope: 'open-api',
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return err(new Error(`[guesty.ts] Token fetch failed: ${res.status} ${text}`));
    }

    const json = await res.json() as { access_token: string; expires_in: number };
    _accessToken = json.access_token;
    _tokenExpiry = Date.now() + json.expires_in * 1000;
    return ok(_accessToken);
  } catch (e) {
    return err(e instanceof Error ? e : new Error(String(e)));
  }
}

// ─── Core fetch with retry (Result-based) ────────────────────────────────────────────

/**
 * Guesty fetch wrapper with Result pattern, retry logic, and rate-limit handling.
 */
async function guestyFetch<T>(
  path: string,
  options: RequestInit = {},
  retries = 3
): Promise<Result<T, Error>> {
  const tokenResult = await getAccessToken();
  if (!tokenResult.success) return err(tokenResult.error);

  try {
    const res = await fetch(`${GUESTY_BASE}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${tokenResult.data}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(options.headers ?? {}),
      },
      next: { revalidate: 60 },
    });

    if (res.status === 429 && retries > 0) {
      const retryAfter = Number(res.headers.get('Retry-After') ?? '2');
      await new Promise((r) => setTimeout(r, retryAfter * 1000));
      return guestyFetch(path, options, retries - 1);
    }

    if (!res.ok) {
      const text = await res.text();
      return err(new Error(`[guesty.ts] ${res.status} ${path}: ${text}`));
    }

    return ok(await res.json() as T);
  } catch (e) {
    return err(e instanceof Error ? e : new Error(String(e)));
  }
}

// ─── Typed API methods (Result-based) ─────────────────────────────────────────────────

export interface GuestyListingsResponse {
  results: GuestyListing[];
  count: number;
  limit: number;
  skip: number;
}

export interface GuestyListing {
  _id: string;
  title: string;
  nickname?: string;
  address: {
    city: string;
    country: string;
    full?: string;
    lat?: number;
    lng?: number;
  };
  bedrooms: number;
  bathrooms: number;
  accommodates: number;
  prices: { basePrice: number; currency: string };
  pictures: Array<{ thumbnail: string; large: string }>;
  publicDescription?: { summary?: string; space?: string; houseRules?: string };
  amenities?: string[];
  tags?: string[];
  checkInOutPolicy?: { checkIn: string; checkOut: string };
  active: boolean;
  listed: boolean;
}

export interface GuestyReservation {
  _id: string;
  status: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  nights?: number;
  listing: {
    nickname?: string;
    title: string;
    address?: { city: string };
    pictures?: Array<{ thumbnail: string }>;
  };
  money: { totalPaid: number; currency: string };
  guests: { adults: number; children: number };
  confirmationCode?: string;
}

export interface GuestyReservationsResponse {
  results: GuestyReservation[];
  count: number;
  limit: number;
  skip: number;
}

/** Get all active listings with optional filters - Result pattern */
export async function getListings(opts?: {
  limit?: number;
  skip?: number;
  tags?: string;
  fields?: string;
}): Promise<Result<GuestyListingsResponse, Error>> {
  const params = new URLSearchParams();
  params.set('limit', String(opts?.limit ?? 25));
  params.set('skip', String(opts?.skip ?? 0));
  params.set('filters', JSON.stringify([{ field: 'active', operator: '$eq', value: true }]));
  if (opts?.tags) params.set('tags', opts.tags);
  if (opts?.fields) params.set('fields', opts.fields);
  
  return guestyFetch<GuestyListingsResponse>(`/listings?${params}`);
}

/** Get single listing by ID - Result pattern */
export async function getListing(id: string): Promise<Result<GuestyListing, Error>> {
  return guestyFetch<GuestyListing>(`/listings/${id}`);
}

/** Get reservations - Result pattern */
export async function getReservations(opts?: {
  guestEmail?: string;
  listingId?: string;
  limit?: number;
  skip?: number;
}): Promise<Result<GuestyReservationsResponse, Error>> {
  const params = new URLSearchParams();
  params.set('limit', String(opts?.limit ?? 20));
  params.set('skip', String(opts?.skip ?? 0));
  if (opts?.guestEmail) params.set('guestEmail', opts.guestEmail);
  if (opts?.listingId) params.set('listingId', opts.listingId);
  
  return guestyFetch<GuestyReservationsResponse>(`/reservations?${params}`);
}

/** Get single reservation by ID - Result pattern */
export async function getReservation(id: string): Promise<Result<GuestyReservation, Error>> {
  return guestyFetch<GuestyReservation>(`/reservations/${id}`);
}

// ─── Legacy wrappers (backward compatibility) ─────────────────────────────────────

/** @deprecated Use Result-based version above */
export async function getListingsLegacy(opts?: {
  limit?: number;
  skip?: number;
  tags?: string;
  fields?: string;
}): Promise<GuestyListingsResponse> {
  const result = await getListings(opts);
  if (!result.success) throw result.error;
  return result.data;
}

/** @deprecated Use Result-based version above */
export async function getListingLegacy(id: string): Promise<GuestyListing> {
  const result = await getListing(id);
  if (!result.success) throw result.error;
  return result.data;
}

/** @deprecated Use Result-based version above */
export async function getReservationsLegacy(opts?: {
  guestEmail?: string;
  listingId?: string;
  limit?: number;
  skip?: number;
}): Promise<GuestyReservationsResponse> {
  const result = await getReservations(opts);
  if (!result.success) throw result.error;
  return result.data;
}

/** @deprecated Use Result-based version above */
export async function getReservationLegacy(id: string): Promise<GuestyReservation> {
  const result = await getReservation(id);
  if (!result.success) throw result.error;
  return result.data;
}

// ─── Additional Resources from resources.ts ─────────────────────────────────────

import { 
  getGuests as getGuestsRaw,
  getTasks as getTasksRaw,
  getConversations as getConversationsRaw,
  getListing as getListingRaw,
  getListingCalendar as getListingCalendarRaw,
  getQuote as getQuoteRaw,
  createQuote as createQuoteRaw,
  createReservation as createReservationRaw,
  cancelReservation as cancelReservationRaw,
  GuestyGuestsResponse,
  GuestyTasksResponse,
  GuestyConversationsResponse,
} from './resources';

/** Get guests - Result pattern */
export async function getGuests(opts?: {
  limit?: number;
  skip?: number;
  search?: string;
}): Promise<Result<GuestyGuestsResponse, Error>> {
  try {
    const data = await getGuestsRaw(opts);
    return ok(data);
  } catch (e) {
    return err(e instanceof Error ? e : new Error(String(e)));
  }
}

/** Get tasks - Result pattern */
export async function getTasks(opts?: {
  listingId?: string;
  reservationId?: string;
  status?: string;
  limit?: number;
  skip?: number;
}): Promise<Result<GuestyTasksResponse, Error>> {
  try {
    const data = await getTasksRaw(opts);
    return ok(data);
  } catch (e) {
    return err(e instanceof Error ? e : new Error(String(e)));
  }
}

/** Get conversations - Result pattern */
export async function getConversations(opts?: {
  reservationId?: string;
  limit?: number;
  skip?: number;
}): Promise<Result<GuestyConversationsResponse, Error>> {
  try {
    const data = await getConversationsRaw(opts);
    return ok(data);
  } catch (e) {
    return err(e instanceof Error ? e : new Error(String(e)));
  }
}

/** Get listing from open-api - Result pattern */
export async function getListingOpenApi(id: string): Promise<Result<GuestyListing, Error>> {
  try {
    const data = await getListingRaw(id);
    return ok(data);
  } catch (e) {
    return err(e instanceof Error ? e : new Error(String(e)));
  }
}

/** Get listing calendar from open-api - Result pattern */
export async function getListingCalendarOpenApi(
  listingId: string,
  startDate: string,
  endDate: string
): Promise<Result<GuestyCalendarDay[], Error>> {
  try {
    const data = await getListingCalendarRaw(listingId, startDate, endDate);
    return ok(data);
  } catch (e) {
    return err(e instanceof Error ? e : new Error(String(e)));
  }
}