/**
 * @fileoverview Result-pattern wrappers for Guesty Booking Engine API.
 *
 * All functions return { success: true, data } | { success: false, error: Error }
 * so route handlers never need try/catch around the API call itself.
 *
 * Import these in API route handlers:
 *   import { getListingsResult, createQuoteResult, ... } from '@/lib/guesty/booking-api-result'
 */

import {
  getListings,
  getListing,
  getCities,
  getReviews,
  createQuote,
  type ListingsParams,
  type CreateQuoteParams,
  type GuestyListing,
  type GuestyListingsResponse,
  type GuestyQuote,
} from './booking-api';

// ─── Result Type ──────────────────────────────────────────────────────────────

export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: Error };

function ok<T>(data: T): Result<T> {
  return { success: true, data };
}

function err(e: unknown): Result<never> {
  return { success: false, error: e instanceof Error ? e : new Error(String(e)) };
}

// ─── Wrapped Exports ──────────────────────────────────────────────────────────

/**
 * Result-wrapped getListings().
 * Route handler: src/app/api/guesty/listings/route.ts
 */
export async function getListingsResult(
  params: ListingsParams = {},
): Promise<Result<GuestyListingsResponse>> {
  try {
    return ok(await getListings(params));
  } catch (e) {
    return err(e);
  }
}

/**
 * Result-wrapped getListing() — also aliased as getListingOpenApi
 * for legacy imports.
 * Route handler: src/app/api/guesty/listings/[id]/route.ts
 */
export async function getListingResult(
  listingId: string,
): Promise<Result<GuestyListing>> {
  try {
    return ok(await getListing(listingId));
  } catch (e) {
    return err(e);
  }
}

/** @alias getListingResult — kept for backward compat */
export const getListingOpenApi = getListingResult;

/**
 * Result-wrapped createQuote().
 * Route handler: src/app/api/guesty/quotes/route.ts
 */
export async function createQuoteResult(
  params: CreateQuoteParams,
): Promise<Result<GuestyQuote>> {
  try {
    return ok(await createQuote(params));
  } catch (e) {
    return err(e);
  }
}

/**
 * Result-wrapped getCities().
 * Route handler: src/app/api/guesty/cities/route.ts
 */
export async function getCitiesResult(): Promise<Result<string[]>> {
  try {
    return ok(await getCities());
  } catch (e) {
    return err(e);
  }
}

/**
 * Result-wrapped getReviews().
 * Route handler: src/app/api/guesty/reviews/route.ts
 */
export async function getReviewsResult(
  listingId: string,
): Promise<Result<unknown[]>> {
  try {
    return ok(await getReviews(listingId));
  } catch (e) {
    return err(e);
  }
}
