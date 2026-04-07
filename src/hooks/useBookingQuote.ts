'use client';
/**
 * @fileoverview useBookingQuote — fetches a price quote for a given stay.
 */
import { useCallback, useState } from 'react';
import type { BookingQuote } from '@/types';

interface QuoteParams {
  listingId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
}

interface UseBookingQuoteResult {
  quote: BookingQuote | null;
  loading: boolean;
  error: string | null;
  fetchQuote: (params: QuoteParams) => Promise<void>;
  reset: () => void;
}

export function useBookingQuote(): UseBookingQuoteResult {
  const [quote, setQuote] = useState<BookingQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuote = useCallback(async (params: QuoteParams) => {
    setLoading(true); setError(null); setQuote(null);
    try {
      const r = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const j = await r.json() as BookingQuote & { error?: string };
      if (j.error) throw new Error(j.error);
      setQuote(j);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setQuote(null); setError(null); setLoading(false);
  }, []);

  return { quote, loading, error, fetchQuote, reset };
}
