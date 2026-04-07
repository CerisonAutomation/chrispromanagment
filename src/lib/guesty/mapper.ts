/**
 * Guesty → Internal model mapper.
 * Decouples Guesty's response shape from our Supabase data model.
 * If Guesty field names change, update ONLY this file.
 *
 * Based on: dferrera-creator/margin-app mapper.ts
 * Enhanced with: full listing mapping + exhaustive payout extraction.
 */

import type { GuestyListing, GuestyReservation, MappedListing, MappedReservation } from './types';

export function mapListing(raw: GuestyListing): MappedListing {
  return {
    guestyListingId: raw._id,
    nickname: raw.nickname ?? raw.title ?? 'Unnamed',
    title: raw.title ?? null,
    active: raw.active !== false,
    city: raw.address?.city ?? null,
    country: raw.address?.country ?? null,
    bedrooms: raw.bedrooms ?? null,
    bathrooms: raw.bathrooms ?? null,
    accommodates: raw.accommodates ?? null,
    basePrice: raw.prices?.basePrice ?? null,
    currency: raw.prices?.currency ?? null,
    thumbnailUrl: raw.pictures?.[0]?.thumbnail ?? null,
    amenities: Array.isArray(raw.amenities) ? raw.amenities : [],
  };
}

export function mapReservation(raw: GuestyReservation): MappedReservation {
  const checkIn = new Date(raw.checkIn ?? '');
  const checkOut = new Date(raw.checkOut ?? '');
  const nightsBooked =
    raw.nightsCount ??
    Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / 86_400_000));

  return {
    guestyReservationId: raw._id,
    guestyListingId: raw.listingId ?? raw.listing?._id ?? '',
    guestName: raw.guest?.fullName ?? raw.guestName ?? null,
    guestEmail: raw.guest?.email ?? null,
    checkIn,
    checkOut,
    nightsBooked,
    staysBooked: 1,
    bookingDate: raw.bookedAt ? new Date(raw.bookedAt) : null,
    status: raw.status ?? 'confirmed',
    payoutAmount: extractPayout(raw.money ?? {}),
    ownerPayoutAmount: raw.money?.ownerRevenue ?? null,
    source: raw.source ?? null,
    confirmationCode: raw.confirmationCode ?? null,
    rawPayload: JSON.stringify(raw),
  };
}

/**
 * Extract payout from Guesty money object.
 * Priority: hostPayout > totalPaid > fareAccommodation > netIncome > subTotalPrice > payments sum.
 * Falls back to scanning all numeric keys > 0.
 */
export function extractPayout(money: Record<string, unknown>): number {
  const priority = ['hostPayout', 'totalPaid', 'fareAccommodation', 'netIncome', 'subTotalPrice', 'balanceDue', 'invoiceTotal'];

  for (const field of priority) {
    const val = money[field];
    if (typeof val === 'number' && val > 0) return val;
  }

  const payments = money.payments;
  if (Array.isArray(payments)) {
    const sum = (payments as Array<Record<string, unknown>>)
      .filter((p) => typeof p.amount === 'number' && p.amount > 0 && p.status !== 'refunded' && p.status !== 'failed')
      .reduce((acc, p) => acc + (p.amount as number), 0);
    if (sum > 0) return sum;
  }

  for (const val of Object.values(money)) {
    if (typeof val === 'number' && val > 0) return val;
  }

  return 0;
}
