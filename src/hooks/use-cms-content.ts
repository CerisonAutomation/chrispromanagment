import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { CmsRow } from "@/lib/cms-types";

type SectionMap = Record<string, CmsRow>;

// Module-level singleton — one fetch per session, shared across all mounts
let _cache: SectionMap | null = null;
let _promise: Promise<SectionMap> | null = null;
const _listeners = new Set<() => void>();

function notifyListeners() {
  _listeners.forEach((fn) => fn());
}

export function invalidateCmsCache() {
  _cache   = null;
  _promise = null;
  notifyListeners();
}

async function fetchAll(): Promise<SectionMap> {
  if (_cache)   return _cache;
  if (_promise) return _promise;

  _promise = (async () => {
    try {
      const { data, error } = await supabase
        .from("cms_content")
        .select("*")
        .eq("is_visible", true)
        .order("sort_order");
      if (error) throw error;
      const map: SectionMap = {};
      (data ?? []).forEach((row) => { map[row.section_key] = row as CmsRow; });
      _cache = map;
      return map;
    } finally {
      _promise = null;
    }
  })();

  return _promise;
}

export function useCmsContent() {
  const [data,    setData]    = useState<SectionMap>(_cache ?? {});
  const [loading, setLoading] = useState(!_cache);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    // Re-fetch if cache was invalidated after an admin save
    const onInvalidate = () => {
      setLoading(true);
      fetchAll()
        .then((map) => { setData(map); setLoading(false); setError(null); })
        .catch((e: unknown) => { setError(e instanceof Error ? e.message : "CMS fetch failed"); setLoading(false); });
    };
    _listeners.add(onInvalidate);

    if (_cache) {
      setData(_cache);
      setLoading(false);
      return () => { _listeners.delete(onInvalidate); };
    }

    fetchAll()
      .then((map) => { setData(map); setLoading(false); })
      .catch((e: unknown) => { setError(e instanceof Error ? e.message : "CMS fetch failed"); setLoading(false); });

    return () => { _listeners.delete(onInvalidate); };
  }, []);

  const get = useCallback(
    <T extends Record<string, unknown>>(key: string, fallback: T = {} as T): T => {
      const row = data[key];
      if (!row) return fallback;
      return { ...fallback, ...(row.content as T) };
    },
    [data]
  );

  return { get, data, loading, error };
}
