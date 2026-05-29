/**
 * Canonical Guesty API client.
 * All Guesty API routes must import from here — never call Guesty directly from route handlers.
 * Handles: OAuth2 token refresh, rate-limit (429) retry with exponential backoff, typed responses.
 */

const GUESTY_BASE = 'https://open-api.guesty.com/v1';
const TOKEN_URL = 'https://open-api.guesty.com/oauth2/token';

// ─── Token cache (module-level singleton) ────────────────────────────────────────────
let _accessToken: string | null = null;
let _tokenExpiry = 0;

async function getAccessToken(): Promise<string> {
  if (_accessToken && Date.now() < _tokenExpiry - 60_000) return _accessToken;

  const clientId = process.env.GUESTY_CLIENT_ID;
  const clientSecret = process.env.GUESTY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('[guesty.ts] Missing GUESTY_CLIENT_ID or GUESTY_CLIENT_SECRET env vars.');
  }

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
    throw new Error(`[guesty.ts] Token fetch failed: ${res.status} ${text}`);
  }

  const json = await res.json() as { access_token: string; expires_in: number };
  _accessToken = json.access_token;
  _tokenExpiry = Date.now() + json.expires_in * 1000;
  return _accessToken;
}

// ─── Core fetch with retry ────────────────────────────────────────────────────────────

async function guestyFetch<T>(
  path: string,
  options: RequestInit = {},
  retries = 3
): Promise<T> {
  const token = await getAccessToken();

  const res = await fetch(`${GUESTY_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers ?? {}),
    },
    next: { revalidate: 60 }, // Next.js cache: revalidate every 60s
  });

  if (res.status === 429 && retries > 0) {
    const retryAfter = Number(res.headers.get('Retry-After') ?? '2');
    await new Promise((r) => setTimeout(r, retryAfter * 1000));
    return guestyFetch(path, options, retries - 1);
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`[guesty.ts] ${res.status} ${path}: ${text}`);
  }

  return res.json() as Promise<T>;
}

// ─── Typed API methods ────────────────────────────────────────────────────────────────────

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

/** Get all active listings with optional filters. Returns Result pattern. */
export async function getListings(opts?: {
  limit?: number;
  skip?: number;
  tags?: string;
  fields?: string;
}): Promise<{ success: true; data: GuestyListingsResponse } | { success: false; error: Error }> {
  try {
    const params = new URLSearchParams();
    params.set('limit', String(opts?.limit ?? 25));
    params.set('skip', String(opts?.skip ?? 0));
    params.set('filters', JSON.stringify([{ field: 'active', operator: '$eq', value: true }]));
    if (opts?.tags) params.set('tags', opts.tags);
    if (opts?.fields) params.set('fields', opts.fields);
    const data = await guestyFetch<GuestyListingsResponse>(`/listings?${params}`);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err : new Error(String(err)) };
  }
}

/** Get single listing by ID. Returns Result pattern. */
export async function getListing(id: string): Promise<{ success: true; data: GuestyListing } | { success: false; error: Error }> {
  try {
    const data = await guestyFetch<GuestyListing>(`/listings/${id}`);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err : new Error(String(err)) };
  }
}

/** Get reservations (optionally filtered by date range, guest email or listing). Returns Result pattern. */
export async function getReservations(opts?: {
  from?: string;
  to?: string;
  guestEmail?: string;
  listingId?: string;
  limit?: number;
  skip?: number;
}): Promise<{ success: true; data: GuestyReservationsResponse } | { success: false; error: Error }> {
  try {
    const params = new URLSearchParams();
    params.set('limit', String(opts?.limit ?? 20));
    params.set('skip', String(opts?.skip ?? 0));
    if (opts?.from) params.set('from', opts.from);
    if (opts?.to) params.set('to', opts.to);
    if (opts?.guestEmail) params.set('guestEmail', opts.guestEmail);
    if (opts?.listingId) params.set('listingId', opts.listingId);
    const data = await guestyFetch<GuestyReservationsResponse>(`/reservations?${params}`);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err : new Error(String(err)) };
  }
}

/** Get single reservation by ID */
export async function getReservation(id: string): Promise<GuestyReservation> {
  return guestyFetch<GuestyReservation>(`/reservations/${id}`);
}

// ─── Calendar ────────────────────────────────────────────────────────────────────

export interface GuestyCalendarDay {
  date: string;
  status: string;
  price?: number;
  minNights?: number;
  available?: boolean;
}

/**
 * Fetch calendar availability for a listing.
 * Alias used by /api/guesty/calendar route.
 */
export async function getCalendar(
  listingId: string,
  from: string,
  to: string,
): Promise<GuestyCalendarDay[]> {
  const qs = new URLSearchParams({ from, to });
  return guestyFetch<GuestyCalendarDay[]>(
    `/availability-pricing/api/calendar/listings/${encodeURIComponent(listingId)}?${qs}`,
  );
}

/**
 * Fetch calendar for a listing (detailed).
 * Used by /api/properties/[id]/calendar.
 */
export async function getListingCalendar(
  listingId: string,
  from: string,
  to: string,
): Promise<{ data?: GuestyCalendarDay[]; error?: string }> {
  try {
    const days = await getCalendar(listingId, from, to);
    return { data: days };
  } catch (err) {
    return { error: String(err) };
  }
}

// ─── Guests ───────────────────────────────────────────────────────────────────

export interface GuestyGuest {
  _id: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

export interface GuestyGuestsResponse {
  results: GuestyGuest[];
  count: number;
  limit: number;
  skip: number;
}

/** Fetch guest profiles (admin-only endpoint). Returns Result pattern. */
export async function getGuests(opts?: {
  limit?: number;
  skip?: number;
  search?: string;
}): Promise<{ success: true; data: GuestyGuestsResponse } | { success: false; error: Error }> {
  try {
    const params = new URLSearchParams();
    params.set('limit', String(opts?.limit ?? 20));
    params.set('skip', String(opts?.skip ?? 0));
    if (opts?.search) params.set('q', opts.search);
    const data = await guestyFetch<GuestyGuestsResponse>(`/guests?${params}`);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err : new Error(String(err)) };
  }
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

export interface GuestyTask {
  _id: string;
  title?: string;
  status?: string;
  listingId?: string;
  reservationId?: string;
}

export interface GuestyTasksResponse {
  results: GuestyTask[];
  count: number;
  limit: number;
  skip: number;
}

/** Fetch tasks (admin-only endpoint). Returns Result pattern. */
export async function getTasks(opts?: {
  listingId?: string;
  reservationId?: string;
  status?: string;
  limit?: number;
  skip?: number;
}): Promise<{ success: true; data: GuestyTasksResponse } | { success: false; error: Error }> {
  try {
    const params = new URLSearchParams();
    params.set('limit', String(opts?.limit ?? 20));
    params.set('skip', String(opts?.skip ?? 0));
    if (opts?.listingId) params.set('listingId', opts.listingId);
    if (opts?.reservationId) params.set('reservationId', opts.reservationId);
    if (opts?.status) params.set('status', opts.status);
    const data = await guestyFetch<GuestyTasksResponse>(`/tasks-open-api/tasks?${params}`);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err : new Error(String(err)) };
  }
}

// ─── Conversations ────────────────────────────────────────────────────────────

export interface GuestyConversation {
  _id: string;
  guestName?: string;
  lastMessage?: string;
  reservationId?: string;
}

export interface GuestyConversationsResponse {
  results: GuestyConversation[];
  count: number;
  limit: number;
  skip: number;
}

/** Fetch conversations (admin-only). Returns Result pattern. */
export async function getConversations(opts?: {
  reservationId?: string;
  limit?: number;
  skip?: number;
}): Promise<{ success: true; data: GuestyConversationsResponse } | { success: false; error: Error }> {
  try {
    const params = new URLSearchParams();
    params.set('limit', String(opts?.limit ?? 20));
    params.set('skip', String(opts?.skip ?? 0));
    if (opts?.reservationId) params.set('reservationId', opts.reservationId);
    const data = await guestyFetch<GuestyConversationsResponse>(`/communication/conversations?${params}`);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err : new Error(String(err)) };
  }
}

// ─── Booking Quote ────────────────────────────────────────────────────────────

/**
 * Get a booking quote. Used by /api/quote.
 * Returns { data, error } pattern for safe route handling.
 */
export async function getBookingQuote(
  listingId: string,
  checkIn: string,
  checkOut: string,
  guests: number,
): Promise<{ data?: unknown; error?: string }> {
  try {
    const result = await guestyFetch<unknown>('/reservations/quotes', {
      method: 'POST',
      body: JSON.stringify({
        listingId,
        checkIn,
        checkOut,
        guestsCount: guests,
      }),
    });
    return { data: result };
  } catch (err) {
    return { error: String(err) };
  }
}
