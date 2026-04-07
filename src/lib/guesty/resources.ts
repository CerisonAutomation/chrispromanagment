/**
 * All Guesty API resource methods — Open API (admin/management) only.
 * 9 resources: listings, reservations, calendar, guests, tasks,
 *              conversations, owners, invoices.
 *
 * ⚠️  QUOTES / BOOKING ENGINE → use src/lib/guesty/booking-api.ts
 *     The Open API has no /quotes endpoint.
 *     createQuote() and getQuote() live in booking-api.ts only.
 */

import { guestyFetch, guestyFetchAll } from './client';
import {
  createQuote as beCreateQuote,
  getQuote as beGetQuote,
} from './booking-api';
import type {
  GuestyListing,
  GuestyListingsResponse,
  GuestyReservation,
  GuestyReservationsResponse,
  GuestyCalendarResponse,
  GuestyGuestProfile,
  GuestyGuestsResponse,
  GuestyQuote,
  GuestyTask,
  GuestyTasksResponse,
  GuestyConversation,
  GuestyConversationsResponse,
  GuestyOwner,
  GuestyOwnersResponse,
  GuestyInvoice,
  GuestyInvoicesResponse,
} from './types';

// ─── Listings ──────────────────────────────────────────────────────────────────

export async function getListings(opts?: {
  limit?: number;
  skip?: number;
  tags?: string;
  fields?: string;
  active?: boolean;
}): Promise<GuestyListingsResponse> {
  const params: Record<string, string> = {
    limit: String(opts?.limit ?? 25),
    skip: String(opts?.skip ?? 0),
    filters: JSON.stringify([{ field: 'active', operator: '$eq', value: opts?.active ?? true }]),
  };
  if (opts?.tags) params.tags = opts.tags;
  if (opts?.fields) params.fields = opts.fields;
  return guestyFetch<GuestyListingsResponse>('/listings', { params });
}

/** Fetch ALL active listings with auto-pagination */
export async function getAllListings(fields?: string): Promise<GuestyListing[]> {
  const params: Record<string, string> = {
    filters: JSON.stringify([{ field: 'active', operator: '$eq', value: true }]),
  };
  if (fields) params.fields = fields;
  return guestyFetchAll<GuestyListing>('/listings', params);
}

export async function getListing(id: string): Promise<GuestyListing> {
  return guestyFetch<GuestyListing>(`/listings/${id}`);
}

// ─── Reservations ──────────────────────────────────────────────────────────────

export async function getReservations(opts?: {
  guestEmail?: string;
  listingId?: string;
  limit?: number;
  skip?: number;
  status?: string;
  from?: string;
  to?: string;
  fields?: string;
  sort?: string;
}): Promise<GuestyReservationsResponse> {
  const params: Record<string, string> = {
    limit: String(opts?.limit ?? 20),
    skip: String(opts?.skip ?? 0),
  };

  const filters: unknown[] = [];
  if (opts?.from) filters.push({ field: 'checkOut', operator: '$gte', value: opts.from });
  if (opts?.to) filters.push({ field: 'checkOut', operator: '$lte', value: opts.to });
  if (opts?.status) filters.push({ field: 'status', operator: '$eq', value: opts.status });
  if (filters.length) params.filters = JSON.stringify(filters);

  if (opts?.guestEmail) params.guestEmail = opts.guestEmail;
  if (opts?.listingId) params.listingId = opts.listingId;
  if (opts?.sort) params.sort = opts.sort;
  if (opts?.fields) params.fields = opts.fields;

  if (!opts?.fields) {
    params.fields = [
      '_id', 'listingId', 'listing', 'guestName', 'guest',
      'checkIn', 'checkOut', 'nightsCount', 'status',
      'money.hostPayout', 'money.ownerRevenue', 'money.totalPaid',
      'money.fareAccommodation', 'money.netIncome', 'money.subTotalPrice',
      'money.balanceDue', 'money.payments', 'money.hostServiceFee',
      'money.totalTaxes', 'money.currency',
      'source', 'bookedAt', 'confirmationCode',
    ].join(' ');
  }

  return guestyFetch<GuestyReservationsResponse>('/reservations', { params });
}

/** Fetch ALL reservations for a date range with auto-pagination */
export async function getAllReservations(from: string, to: string): Promise<GuestyReservation[]> {
  const params: Record<string, string> = {
    filters: JSON.stringify([
      { field: 'checkOut', operator: '$gte', value: from },
      { field: 'checkOut', operator: '$lte', value: to },
    ]),
    sort: 'checkOut',
    fields: [
      '_id', 'listingId', 'listing', 'guestName', 'guest',
      'checkIn', 'checkOut', 'nightsCount', 'status',
      'money.hostPayout', 'money.ownerRevenue', 'money.totalPaid',
      'money.fareAccommodation', 'money.netIncome', 'money.subTotalPrice',
      'money.balanceDue', 'money.payments', 'money.currency',
      'source', 'bookedAt', 'confirmationCode',
    ].join(' '),
  };
  return guestyFetchAll<GuestyReservation>('/reservations', params);
}

export async function getReservation(id: string): Promise<GuestyReservation> {
  return guestyFetch<GuestyReservation>(`/reservations/${id}`);
}

// ─── Calendar ─────────────────────────────────────────────────────────────────

export async function getCalendar(
  listingId: string,
  from: string,
  to: string
): Promise<GuestyCalendarResponse> {
  return guestyFetch<GuestyCalendarResponse>(`/availability-pricing/api/v3/listings/${listingId}`, {
    params: { startDate: from, endDate: to },
  });
}

// ─── Guests ─────────────────────────────────────────────────────────────────────

export async function getGuests(opts?: {
  limit?: number;
  skip?: number;
  search?: string;
}): Promise<GuestyGuestsResponse> {
  const params: Record<string, string> = {
    limit: String(opts?.limit ?? 20),
    skip: String(opts?.skip ?? 0),
  };
  if (opts?.search) params.q = opts.search;
  return guestyFetch<GuestyGuestsResponse>('/guests', { params });
}

export async function getGuest(id: string): Promise<GuestyGuestProfile> {
  return guestyFetch<GuestyGuestProfile>(`/guests/${id}`);
}

// ─── Quotes (Booking Engine API — proxied here for barrel-import compatibility) ────
//
// getQuote / createQuote are Booking Engine API operations.
// The Open API has NO /quotes endpoint — calling it there returns 404.
// These exports delegate to booking-api.ts via the correct API.

/**
 * Create a price quote via the Guesty Booking Engine API.
 * Delegates to src/lib/guesty/booking-api.ts createQuote().
 * @see https://booking-api-docs.guesty.com
 */
export async function getQuote(opts: {
  listingId: string;
  checkIn: string;
  checkOut: string;
  guestsCount?: number;
}): Promise<GuestyQuote> {
  // Booking Engine API uses checkInDateLocalized / checkOutDateLocalized
  return beCreateQuote({
    listingId: opts.listingId,
    checkInDateLocalized: opts.checkIn,
    checkOutDateLocalized: opts.checkOut,
    guestsCount: opts.guestsCount ?? 1,
  }) as Promise<GuestyQuote>;
}

/**
 * Retrieve an existing quote by ID via the Guesty Booking Engine API.
 * Delegates to src/lib/guesty/booking-api.ts getQuote().
 */
export async function getQuoteById(quoteId: string): Promise<GuestyQuote> {
  return beGetQuote(quoteId) as Promise<GuestyQuote>;
}

// ─── Tasks ───────────────────────────────────────────────────────────────────────

export async function getTasks(opts?: {
  listingId?: string;
  reservationId?: string;
  status?: string;
  limit?: number;
  skip?: number;
}): Promise<GuestyTasksResponse> {
  const params: Record<string, string> = {
    limit: String(opts?.limit ?? 20),
    skip: String(opts?.skip ?? 0),
  };
  if (opts?.listingId) params.listingId = opts.listingId;
  if (opts?.reservationId) params.reservationId = opts.reservationId;
  if (opts?.status) params.status = opts.status;
  return guestyFetch<GuestyTasksResponse>('/tasks', { params });
}

export async function getTask(id: string): Promise<GuestyTask> {
  return guestyFetch<GuestyTask>(`/tasks/${id}`);
}

// ─── Conversations (messaging) ──────────────────────────────────────────────────

export async function getConversations(opts?: {
  reservationId?: string;
  limit?: number;
  skip?: number;
}): Promise<GuestyConversationsResponse> {
  const params: Record<string, string> = {
    limit: String(opts?.limit ?? 20),
    skip: String(opts?.skip ?? 0),
  };
  if (opts?.reservationId) params.reservationId = opts.reservationId;
  return guestyFetch<GuestyConversationsResponse>('/communication/conversations', { params });
}

export async function getConversation(id: string): Promise<GuestyConversation> {
  return guestyFetch<GuestyConversation>(`/communication/conversations/${id}`);
}

export async function sendMessage(conversationId: string, body: string): Promise<void> {
  await guestyFetch(`/communication/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ body, type: 'host_message' }),
    next: undefined,
  });
}

// ─── Owners ────────────────────────────────────────────────────────────────────

export async function getOwners(opts?: { limit?: number; skip?: number }): Promise<GuestyOwnersResponse> {
  return guestyFetch<GuestyOwnersResponse>('/owners', {
    params: { limit: String(opts?.limit ?? 20), skip: String(opts?.skip ?? 0) },
  });
}

export async function getOwner(id: string): Promise<GuestyOwner> {
  return guestyFetch<GuestyOwner>(`/owners/${id}`);
}

// ─── Invoices ─────────────────────────────────────────────────────────────────

export async function getInvoices(opts?: { reservationId?: string; limit?: number; skip?: number }): Promise<GuestyInvoicesResponse> {
  const params: Record<string, string> = {
    limit: String(opts?.limit ?? 20),
    skip: String(opts?.skip ?? 0),
  };
  if (opts?.reservationId) params.reservationId = opts.reservationId;
  return guestyFetch<GuestyInvoicesResponse>('/invoices', { params });
}

export async function getInvoice(id: string): Promise<GuestyInvoice> {
  return guestyFetch<GuestyInvoice>(`/invoices/${id}`);
}
