// =============================================================================
// SERVER-SIDE DATA FETCHING - React Server Components Pattern
// Provides optimized data fetching for RSC with streaming support
// =============================================================================

import {db} from "./db";
import {unstable_cache} from "next/cache";

// Cache tags for granular revalidation
export const CACHE_TAGS = {
  PAGE: "page",
  PAGES_LIST: "pages-list",
  PROPERTY: "property",
  BOOKING: "booking",
  ASSET: "asset",
} as const;

// =============================================================================
// CACHED DATABASE QUERIES - ISR with on-demand revalidation
// =============================================================================

/**
 * Get a single page by slug with published data
 * Cached for 60 seconds, revalidated on tag
 */
export const getCachedPage = unstable_cache(
  async (slug: string) => {
    const page = await db.cmsPage.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        title: true,
        status: true,
        publishedData: true,
        draftData: true,
        metaTitle: true,
        metaDescription: true,
        ogTitle: true,
        ogDescription: true,
        ogImage: true,
        noIndex: true,
        updatedAt: true,
      },
    });

    if (!page) return null;

    // Parse JSON data
    const dataString = page.publishedData || page.draftData;
    if (!dataString) return null;

    try {
      return {
        ...page,
        data: JSON.parse(dataString),
      };
    } catch {
      return null;
    }
  },
  ["page-by-slug"],
  { 
    tags: [CACHE_TAGS.PAGE],
    revalidate: 60,
  }
);

/**
 * Get all published pages for sitemap/navigation
 * Cached for 5 minutes
 */
export const getCachedPagesList = unstable_cache(
  async () => {
    return db.cmsPage.findMany({
      where: { status: "PUBLISHED" },
      select: {
        slug: true,
        title: true,
        updatedAt: true,
        noIndex: true,
      },
      orderBy: { updatedAt: "desc" },
    });
  },
  ["pages-list"],
  {
    tags: [CACHE_TAGS.PAGES_LIST],
    revalidate: 300,
  }
);

/**
 * Get properties with optimized query
 */
export const getCachedProperties = unstable_cache(
  async (limit?: number) => {
    return db.property.findMany({
      where: { active: true, featured: true },
      select: {
        id: true,
        slug: true,
        name: true,
        type: true,
        location: true,
        city: true,
        bedrooms: true,
        bathrooms: true,
        maxGuests: true,
        basePrice: true,
        images: true,
        rating: true,
        reviewCount: true,
      },
      take: limit || 10,
      orderBy: { rating: "desc" },
    });
  },
  ["properties"],
  {
    tags: [CACHE_TAGS.PROPERTY],
    revalidate: 300,
  }
);

/**
 * Get a single property by slug
 */
export const getCachedProperty = unstable_cache(
  async (slug: string) => {
    return db.property.findUnique({
      where: { slug },
    });
  },
  ["property-by-slug"],
  {
    tags: [CACHE_TAGS.PROPERTY],
    revalidate: 300,
  }
);

// =============================================================================
// MUTATION HELPERS - Server Actions for data updates
// =============================================================================

/**
 * Revalidate page cache on publish/update
 */
export async function revalidatePageCache(slug: string) {
  const { revalidateTag } = await import("next/cache");
  revalidateTag(CACHE_TAGS.PAGE);
  revalidateTag(CACHE_TAGS.PAGES_LIST);
}

/**
 * Revalidate property cache
 */
export async function revalidatePropertyCache() {
  const { revalidateTag } = await import("next/cache");
  revalidateTag(CACHE_TAGS.PROPERTY);
}
