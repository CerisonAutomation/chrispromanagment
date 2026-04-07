/**
 * @fileoverview useProperties hook — fetches Guesty listings client-side.
 */
'use client';
import { useCallback, useEffect, useState } from 'react';
import type { GuestyListing } from '@/types';

interface UsePropertiesResult {
  listings: GuestyListing[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useProperties(limit = 20): UsePropertiesResult {
  const [listings, setListings] = useState<GuestyListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch_ = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const r = await fetch(`/api/properties?limit=${limit}`, { cache: 'no-store' });
      const j = await r.json() as { listings?: GuestyListing[]; error?: string };
      if (j.error) throw new Error(j.error);
      setListings(Array.isArray(j.listings) ? j.listings : []);
    } catch (e) {
      setError((e as Error).message);
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => { void fetch_(); }, [fetch_]);
  return { listings, loading, error, refetch: fetch_ };
}
