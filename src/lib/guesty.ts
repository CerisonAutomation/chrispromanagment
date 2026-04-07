/**
 * @fileoverview Guesty Open API v1 client — OAuth2 CC grant, auto-refresh.
 * All methods return ApiResult<T> — never throws.
 */
import { env } from './env';
import { apiOk, apiErr } from '@/types';
import type { ApiResult, GuestyListing, GuestyCalendarDay, BookingQuote, BookingInquiry } from '@/types';

// ─── Token cache (module-level singleton) ────────────────────────────────────
let _token: string | null = null;
let _tokenExpiry = 0;

async function getToken(): Promise<string> {
  if (_token && Date.now() < _tokenExpiry - 60_000) return _token;
  if (!env.GUESTY_CLIENT_ID || !env.GUESTY_CLIENT_SECRET) {
    throw new Error('[Guesty] Missing GUESTY_CLIENT_ID or GUESTY_CLIENT_SECRET');
  }
  const res = await fetch(`${env.GUESTY_API_URL}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: env.GUESTY_CLIENT_ID,
      client_secret: env.GUESTY_CLIENT_SECRET,
      scope: 'open-api',
    }),
  });
  if (!res.ok) throw new Error(`[Guesty] Token fetch failed: ${res.status}`);
  const json = await res.json() as { access_token: string; expires_in: number };
  _token = json.access_token;
  _tokenExpiry = Date.now() + json.expires_in * 1000;
  return _token;
}

async function guestyFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getToken();
  const res = await fetch(`${env.GUESTY_API_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`[Guesty] ${path} → ${res.status}: ${body.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function getListings(limit = 20, skip = 0): Promise<ApiResult<GuestyListing[]>> {
  try {
    const data = await guestyFetch<{ results: GuestyListing[]; count: number }>(
      `/v1/listings?limit=${limit}&skip=${skip}&fields=_id,title,nickname,address,prices,amenities,pictures,bedrooms,bathrooms,accommodates,propertyType,roomType,publicDescription`
    );
    return apiOk(data.results ?? []);
  } catch (e) {
    console.error('[Guesty] getListings:', e);
    return apiErr((e as Error).message);
  }
}

export async function getListing(id: string): Promise<ApiResult<GuestyListing>> {
  try {
    const data = await guestyFetch<GuestyListing>(`/v1/listings/${id}`);
    return apiOk(data);
  } catch (e) {
    console.error('[Guesty] getListing:', e);
    return apiErr((e as Error).message);
  }
}

export async function getListingCalendar(
  id: string, from: string, to: string
): Promise<ApiResult<GuestyCalendarDay[]>> {
  try {
    const data = await guestyFetch<{ days: GuestyCalendarDay[] }>(
      `/v1/listings/${id}/calendar?from=${from}&to=${to}`
    );
    return apiOk(data.days ?? []);
  } catch (e) {
    console.error('[Guesty] getListingCalendar:', e);
    return apiErr((e as Error).message);
  }
}

export async function getBookingQuote(
  listingId: string, checkIn: string, checkOut: string, guests: number
): Promise<ApiResult<BookingQuote>> {
  try {
    const data = await guestyFetch<BookingQuote>('/v1/quotes', {
      method: 'POST',
      body: JSON.stringify({ listingId, checkIn, checkOut, guests }),
    });
    return apiOk(data);
  } catch (e) {
    console.error('[Guesty] getBookingQuote:', e);
    return apiErr((e as Error).message);
  }
}

export async function createInquiry(
  inquiry: BookingInquiry
): Promise<ApiResult<{ id: string }>> {
  try {
    const data = await guestyFetch<{ _id: string }>('/v1/inquiries', {
      method: 'POST',
      body: JSON.stringify(inquiry),
    });
    return apiOk({ id: data._id });
  } catch (e) {
    console.error('[Guesty] createInquiry:', e);
    return apiErr((e as Error).message);
  }
}
