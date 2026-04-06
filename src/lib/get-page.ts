// =============================================================================
// GET PAGE HELPER - Fetch page data from database
// Follows puck-main next-ai recipe pattern
// =============================================================================

import {Data} from "@puckeditor/core";
import {db} from "./db";

/**
 * Fetch page data from the database by path
 * Returns parsed Data object or null if not found
 */
export const getPage = async (path: string): Promise<Data | null> => {
  try {
    const page = await db.cmsPage.findUnique({
      where: { slug: path },
    });

    if (!page) {
      return null;
    }

    // Return published data if available, otherwise draft data
    const dataString = page.publishedData || page.draftData;
    if (!dataString) {
      return null;
    }

    return JSON.parse(dataString) as Data;
  } catch (error) {
    console.error("[getPage] Error fetching page:", error);
    return null;
  }
};

/**
 * Synchronous version for static rendering
 * Uses a cached/pages API endpoint or localStorage fallback
 */
export const getPageSync = (path: string): Data | null => {
  // For client-side usage - can be extended to use localStorage cache
  if (typeof window !== "undefined") {
    const cached = localStorage.getItem(`puck-page-${path}`);
    if (cached) {
      try {
        return JSON.parse(cached) as Data;
      } catch {
        return null;
      }
    }
  }
  return null;
};
