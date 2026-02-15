import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { siteBlueprint } from "@/lib/site-blueprint";

// Maps section_key to the corresponding siteBlueprint property
const FALLBACK_MAP: Record<string, unknown> = {
  brand: siteBlueprint.brand,
  external: siteBlueprint.external,
  navItems: siteBlueprint.navItems,
  hero: siteBlueprint.hero,
  stats: siteBlueprint.stats,
  proofStrip: siteBlueprint.proofStrip,
  process: siteBlueprint.process,
  portfolio: siteBlueprint.portfolio,
  pricing: siteBlueprint.pricing,
  testimonials: siteBlueprint.testimonials,
  about: siteBlueprint.about,
  faq: siteBlueprint.faq,
  contact: siteBlueprint.contact,
  footer: siteBlueprint.footer,
  ctaBanner: {
    headline: "Ready to maximise your",
    highlightedWord: "rental income",
    subtitle: "Get a free property assessment and discover how much more your Malta property could earn with professional management.",
    primaryCtaLabel: "Get Your Free Assessment",
    secondaryCtaLabel: "Email Us Directly",
  },
};

/**
 * Fetches section content from CMS (Supabase) with siteBlueprint fallback.
 * Returns typed content for any section.
 */
export function useSectionContent<T = unknown>(sectionKey: string): {
  data: T;
  isLoading: boolean;
  isFromCms: boolean;
} {
  const fallback = FALLBACK_MAP[sectionKey] as T;

  const { data: cmsData, isLoading } = useQuery({
    queryKey: ["cms-section", sectionKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cms_content")
        .select("content, is_visible")
        .eq("section_key", sectionKey)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    staleTime: 60_000, // Cache for 1 minute
    retry: 1,
  });

  // If CMS has data and it's visible, use it; otherwise fallback
  if (cmsData?.content && cmsData.is_visible !== false) {
    return { data: cmsData.content as T, isLoading: false, isFromCms: true };
  }

  return { data: fallback, isLoading, isFromCms: false };
}

/**
 * Bulk-fetch all sections in one query for the homepage.
 */
export function useAllSections() {
  return useQuery({
    queryKey: ["cms-all-sections"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cms_content")
        .select("section_key, content, is_visible")
        .order("sort_order");
      if (error) throw error;
      
      const map: Record<string, { content: unknown; is_visible: boolean }> = {};
      data?.forEach((row) => {
        map[row.section_key] = { content: row.content, is_visible: row.is_visible };
      });
      return map;
    },
    staleTime: 60_000,
    retry: 1,
  });
}

/**
 * Get section content from bulk data with fallback.
 */
export function getSectionFromMap<T>(
  map: Record<string, { content: unknown; is_visible: boolean }> | undefined,
  sectionKey: string
): T {
  const cms = map?.[sectionKey];
  if (cms?.content && cms.is_visible !== false) {
    return cms.content as T;
  }
  return (FALLBACK_MAP[sectionKey] ?? {}) as T;
}
