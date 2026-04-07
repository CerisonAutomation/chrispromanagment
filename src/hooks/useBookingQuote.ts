/**
 * @fileoverview Hook for fetching a Guesty booking price quote.
 */
'use client';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import type { GuestyQuoteResult } from '@/types';

export interface UseBookingQuoteParams {
  listingId: string | undefined;
  checkIn: string | undefined;
  checkOut: string | undefined;
  guestsCount: number;
}

/**
 * Fetches a booking quote when all required params are present.
 * Disabled until listingId, checkIn, checkOut are truthy.
 */
export function useBookingQuote({
  listingId,
  checkIn,
  checkOut,
  guestsCount,
}: UseBookingQuoteParams) {
  const enabled = !!listingId && !!checkIn && !!checkOut && guestsCount > 0;

  return useQuery<GuestyQuoteResult, Error>({
    queryKey: queryKeys.listingQuote(
      listingId ?? '',
      checkIn ?? '',
      checkOut ?? '',
      guestsCount
    ),
    queryFn: async () => {
      const res = await fetch('/api/booking-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, checkIn, checkOut, guestsCount }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText })) as { message?: string };
        throw new Error(err.message ?? `Quote failed: ${res.status}`);
      }
      return res.json() as Promise<GuestyQuoteResult>;
    },
    staleTime: 2 * 60 * 1000,
    enabled,
    retry: 1,
  });
}
