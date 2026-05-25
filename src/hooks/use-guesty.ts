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
