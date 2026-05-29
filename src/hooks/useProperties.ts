/**
 * @fileoverview Hook for fetching Guesty property listings.
 * Server-side data is pre-fetched in RSC; this hook handles CSR re-fetching.
 */
'use client';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import type { GuestyListing, GuestyListingsResult } from '@/types/guesty';

async function fetchListings(limit = 20, skip = 0): Promise<GuestyListingsResult> {
  const res = await fetch(`/api/listings?limit=${limit}&skip=${skip}`);
  if (!res.ok) throw new Error(`Failed to fetch listings: ${res.status}`);
  return res.json() as Promise<GuestyListingsResult>;
}

export interface UsePropertiesOptions {
  limit?: number;
  skip?: number;
  enabled?: boolean;
}

/**
 * TanStack Query hook for Guesty property listings.
 * Stale time 5 min — listings change infrequently.
 */
export function useProperties(options: UsePropertiesOptions = {}) {
  const { limit = 20, skip = 0, enabled = true } = options;

  return useQuery<GuestyListingsResult, Error>({
    queryKey: [...queryKeys.listings, { limit, skip }],
    queryFn: () => fetchListings(limit, skip),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled,
    retry: 2,
  });
}

/**
 * Fetch a single property by its Guesty listing ID.
 */
export function useProperty(id: string | undefined) {
  return useQuery<GuestyListing, Error>({
    queryKey: queryKeys.listing(id ?? ''),
    queryFn: async () => {
      if (!id) throw new Error('No listing id');
      const res = await fetch(`/api/listings/${id}`);
      if (!res.ok) throw new Error(`Failed to fetch listing ${id}: ${res.status}`);
      return res.json() as Promise<GuestyListing>;
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
    retry: 2,
  });
}
