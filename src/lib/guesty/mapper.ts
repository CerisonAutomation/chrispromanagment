/**
 * @fileoverview Guesty → Internal model mapper.
 * Decouples Guesty's API shape from our Supabase data model.
 * If Guesty field names change, update ONLY this file.
 */

import type { GuestyListing, GuestyReservation, MappedListing, MappedReservation } from './types.ts';

export function mapListing(raw: GuestyListing): MappedListing {
  return {
    id: raw._id,
    title: raw.title ?? raw.nickname ?? 'Unnamed',
    nickname: raw.nickname ?? undefined,
    propertyType: raw.propertyType ?? undefined,
    city: raw.address?.city ?? undefined,
    country: raw.address?.country ?? undefined,
    bedrooms: raw.bedrooms ?? undefined,
    bathrooms: raw.bathrooms ?? undefined,
    maxGuests: raw.accommodates ?? undefined,
    basePrice: raw.prices?.basePrice ?? undefined,
    currency: raw.prices?.currency ?? undefined,
    amenities: Array.isArray(raw.amenities) ? raw.amenities : [],
    images: raw.pictures?.map(p => p.large || p.regular || p.thumbnail || '').filter(Boolean) ?? [],
  };
}

export function mapReservation(raw: GuestyReservation): MappedReservation {
  const checkIn = new Date(raw.checkIn ?? '');
  const checkOut = new Date(raw.checkOut ?? '');
  const nightsBooked =
    raw.nightsCount ??
    Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / 86_400_000));

  return {
    id: raw._id,
    confirmationCode: raw.confirmationCode ?? undefined,
    listingId: raw.listingId ?? raw.listing?._id ?? '',
    guestName: raw.guest?.firstName ? `${raw.guest.firstName} ${raw.guest.lastName ?? ''}`.trim() : raw.guestName ?? undefined,
    guestEmail: raw.guest?.email ?? undefined,
    checkIn,
    checkOut,
    status: raw.status ?? 'confirmed',
    totalAmount: extractPayout(raw.money ?? {}),
    currency: raw.money?.currency ?? undefined,
  };
}

/**
 * Extract payout from Guesty money object.
 * Priority: hostPayout > totalPaid > fareAccommodation > netIncome > subTotalPrice > payments sum.
 */
export function extractPayout(money: Record<string, unknown>): number {
  const priority = [
    'hostPayout', 'totalPaid', 'fareAccommodation',
    'netIncome', 'subTotalPrice', 'balanceDue', 'invoiceTotal',
  ];

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
