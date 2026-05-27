// @ts-nocheck
import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { guesty } from "@/lib/guesty";

const today = () => new Date().toISOString().split("T")[0];
const inMonths = (n) => { const d = new Date(); d.setMonth(d.getMonth() + n); return d.toISOString().split("T")[0]; };

export function useGuestyListings(filters = {}) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const abortRef = useRef(null);
  const key = JSON.stringify(filters);

  const fetchListings = useCallback(async () => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setLoading(true); setError(null);
    try {
      const action = filters.checkIn && filters.checkOut ? "search" : "listings";
      const params = { limit: filters.limit ?? 50, ...filters };
      const data = await (action === "search" ? guesty.search(params) : guesty.listings(params));
      const results = data?.results ?? [];
      setListings(results);
      setTotal(data?.pagination?.total ?? results.length);
    } catch (e) {
      if (e?.name !== "AbortError") setError(e);
    } finally { setLoading(false); }
  }, [key]);

  useEffect(() => { fetchListings(); return () => abortRef.current?.abort(); }, [fetchListings]);
  return { listings, loading, error, total, refetch: fetchListings };
}

// React Query based hook for better caching
export function useGuestyListingsQuery(filters = {}) {
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: ['guesty-listings', filters],
    queryFn: async () => {
      const action = filters.checkIn && filters.checkOut ? "search" : "listings";
      const params = { limit: filters.limit ?? 50, ...filters };
      const data = await (action === "search" ? guesty.search(params) : guesty.listings(params));
      return {
        listings: data?.results ?? [],
        total: data?.pagination?.total ?? 0,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Payment provider hook - returns Stripe as default provider
// Note: Payment provider configuration should be fetched from CMS or settings
export function usePaymentProvider(listingId) {
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!listingId) return;
    setLoading(true);
    // Default to Stripe as payment provider
    // In production, this should be fetched from CMS settings
    setProvider({ id: "stripe", name: "Stripe" });
    setLoading(false);
  }, [listingId]);

  return { provider, loading, error };
}

// Guesty quote hook for coupon application
// Note: Coupon application should be implemented via Guesty Booking Engine API
export function useGuestyQuote() {
  const [loading, setLoading] = useState(false);

  const applyCoupon = useCallback(async (couponCode) => {
    setLoading(true);
    try {
      // Coupon application via Guesty Booking Engine API
      // This should call the guesty.applyCoupon endpoint
      // Implementation pending Guesty API integration
      throw new Error("Coupon application not yet implemented");
    } finally {
      setLoading(false);
    }
  }, []);

  return { applyCoupon, loading };
}

// Guesty token status hook
// Note: Token status should be fetched from guesty_token_vault table
export function useGuestyTokenStatus() {
  const [status, setStatus] = useState("active");
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      // Token status check via guesty_token_vault table
      // Implementation pending database integration
      // Should check token expiry and refresh status
      setStatus("active");
    } finally {
      setLoading(false);
    }
  }, []);

  return { status, loading, refresh };
}