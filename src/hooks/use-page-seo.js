import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Per-page SEO override hook.
 * Reads from `cms_page_seo` keyed by slug. Returns null while loading
 * and the override (or null) once fetched. Falls back to sitewide defaults
 * declared in index.html when null.
 */
export function usePageSeo(slug) {
  const [seo, setSeo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (!slug) {
      setLoading(false);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("cms_page_seo")
        .select("*")
        .eq("page_slug", slug)
        .maybeSingle();
      if (!cancelled) {
        setSeo(data || null);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { seo, loading };
}
