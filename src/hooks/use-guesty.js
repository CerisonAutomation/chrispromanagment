// src/hooks/use-guesty.js — React hooks over the Guesty client.
// Ported from the TS reference. Realtime subscriptions removed
// (the original depended on a `guesty_listings_cache` table that doesn't exist here).

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
      if (e?.name !== "AbortError") setError(e?.message ?? "Failed to load listings");
    } finally { setLoading(false); }
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchListings(); return () => abortRef.current?.abort(); }, [fetchListings]);
  return { listings, loading, error, total, refetch: fetchListings };
}

export function useGuestyListing(id) {
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (!id) { setListing(null); setLoading(false); return; }
    let alive = true;
    setLoading(true); setError(null);
    guesty.listing(id)
      .then((d) => { if (alive) setListing(d); })
      .catch((e) => { if (alive) setError(e?.message ?? "Failed to load listing"); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [id]);
  return { listing, loading, error };
}

export function useGuestyCalendar(id, from, to) {
  const [calendar, setCalendar] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fromDate = from ?? today();
  const toDate = to ?? inMonths(3);
  useEffect(() => {
    if (!id) return;
    let alive = true; setLoading(true); setError(null);
    guesty.calendar(id, fromDate, toDate)
      .then((days) => { if (alive) setCalendar(Array.isArray(days) ? days : []); })
      .catch((e) => { if (alive) setError(e?.message ?? "Calendar unavailable"); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [id, fromDate, toDate]);
  const isAvailable = useCallback((date) => calendar.find((d) => d.date === date)?.status === "available", [calendar]);
  const blockedDates = calendar.filter((d) => d.status !== "available").map((d) => new Date(d.date + "T12:00:00"));
  return { calendar, loading, error, isAvailable, blockedDates };
}

export function useGuestyCities(searchText) {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    let alive = true;
    guesty.cities({ limit: 100, ...(searchText ? { searchText } : {}) })
      .then((d) => { if (alive) setCities((d?.results ?? []).map((c) => c.city).filter(Boolean)); })
      .catch((e) => { if (alive) setError(e?.message ?? "Failed to load cities"); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [searchText]);
  return { cities, loading, error };
}

export function usePaymentProvider(listingId) {
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (!listingId) return;
    let alive = true; setLoading(true);
    guesty.paymentProvider(listingId)
      .then((d) => { if (alive) setProvider(d); })
      .catch((e) => { if (alive) setError(e?.message ?? "Payment provider unavailable"); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [listingId]);
  return { provider, loading, error };
}

export function useGuestyQuote() {
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const wrap = (fn, label) => async (...args) => {
    setLoading(true); setError(null);
    try { const d = await fn(...args); setQuote(d); return d; }
    catch (e) { setError(e?.message ?? label); throw e; }
    finally { setLoading(false); }
  };
  return {
    quote, loading, error,
    createQuote: wrap(guesty.createQuote, "Failed to create quote"),
    fetchQuote:  wrap(guesty.getQuote, "Failed to fetch quote"),
    applyCoupon: wrap(guesty.applyCoupon, "Invalid coupon"),
  };
}

export function useGuestyReservation(id) {
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState(null);
  const fetchOne = useCallback(async (resId) => {
    setLoading(true);
    try { const d = await guesty.reservation(resId); setReservation(d); return d; }
    catch (e) { setError(e?.message ?? "Reservation not found"); throw e; }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { if (!id) { setLoading(false); return; } fetchOne(id); }, [id, fetchOne]);
  return { reservation, loading, error, refetch: () => id ? fetchOne(id) : Promise.resolve() };
}

export function useGuestyTokenStatus() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => {
    try { setStatus(await guesty.tokenStatus()); }
    catch (e) { console.error("Guesty token status check failed:", e); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { refresh(); }, [refresh]);
  return { status, loading, refresh };
}

export function useBookingFlow(listingId) {
  const [step, setStep] = useState("search");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [quote, setQuote] = useState(null);
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const guestsCount = Math.max(1, adults + children);

  const requestQuote = useCallback(async () => {
    if (!listingId || !checkIn || !checkOut) return;
    setLoading(true); setError(null);
    try {
      const body = { listingId, checkIn, checkOut, guestsCount, adults,
        ...(children > 0 ? { children } : {}), ...(infants > 0 ? { infants } : {}) };
      const q = await guesty.createQuote(body);
      setQuote(q); setStep("details");
    } catch (e) { setError(e?.message ?? "Could not create quote"); }
    finally { setLoading(false); }
  }, [listingId, checkIn, checkOut, adults, children, infants, guestsCount]);

  const confirmBooking = useCallback(async (ccToken, guestInfo, specialRequests) => {
    if (!quote?._id) return;
    setLoading(true); setError(null);
    try {
      const res = await guesty.instantCharge(quote._id, {
        ccToken, guest: guestInfo, specialRequests, guestsCount, adults,
        ...(children > 0 ? { children } : {}), ...(infants > 0 ? { infants } : {}),
      });
      setReservation(res); setStep("confirmed"); return res;
    } catch (e) { setError(e?.message ?? "Booking failed"); throw e; }
    finally { setLoading(false); }
  }, [quote, adults, children, infants, guestsCount]);

  const reset = useCallback(() => {
    setStep("search"); setCheckIn(""); setCheckOut("");
    setAdults(2); setChildren(0); setInfants(0);
    setQuote(null); setReservation(null); setError(null);
  }, []);

  return {
    step, setStep, checkIn, setCheckIn, checkOut, setCheckOut,
    adults, setAdults, children, setChildren, infants, setInfants,
    guestsCount, quote, setQuote, reservation, loading, error,
    requestQuote, confirmBooking, reset,
  };
}

// React Query bindings
export const useCreateQuote = () => useMutation({ mutationFn: (params) => guesty.createQuote(params) });
export const useUpdateCoupon = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ quoteId, coupon }) => guesty.applyCoupon(quoteId, coupon),
    onSuccess: (data, vars) => qc.setQueryData(["quote", vars.quoteId], data),
  });
};
export const useListingsQuery = (filters = {}) =>
  useQuery({ queryKey: ["guesty:listings", filters], queryFn: () => guesty.listings(filters), staleTime: 60_000 });
export const useListingQuery = (id) =>
  useQuery({ queryKey: ["guesty:listing", id], queryFn: () => guesty.listing(id), enabled: !!id, staleTime: 60_000 });
