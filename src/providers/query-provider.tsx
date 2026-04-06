// =============================================================================
// ENHANCED REACT QUERY PROVIDER
// Optimized caching, background refetching, and prefetching
// =============================================================================

"use client";

import {QueryClient, QueryClientProvider, useQueryClient} from "@tanstack/react-query";
import {ReactQueryDevtools} from "@tanstack/react-query-devtools";
import {type ReactNode, useState} from "react";

/**
 * Enhanced Query Client with performance optimizations
 * - Longer stale times for static content
 * - Background refetching on window focus
 * - Aggressive caching for reduced network requests
 * - Optimistic updates support
 */
function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Default stale time: 30 seconds
        // Reduces unnecessary refetches for semi-static content
        staleTime: 1000 * 30,
        
        // Cache time: 5 minutes
        // Keeps unused data in memory for quick back/forward navigation
        gcTime: 1000 * 60 * 5,
        
        // Retry configuration
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        
        // Refetch on window focus (for data freshness)
        refetchOnWindowFocus: true,
        
        // Refetch when reconnecting
        refetchOnReconnect: true,
        
        // Network mode for offline support
        networkMode: "offlineFirst",
        
        // Background refetch interval for critical data
        refetchInterval: false, // Disabled by default
        
        // Keep previous data while fetching new
        placeholderData: (previousData) => previousData,
        
        // Don't refetch on mount if data is fresh
        initialDataUpdatedAt: Date.now(),
      },
      mutations: {
        // Retry failed mutations
        retry: 2,
        retryDelay: 1000,
        networkMode: "offlineFirst",
      },
    },
  });
}

export function EnhancedQueryProvider({ children }: { children: ReactNode }) {
  // Create client once per session to avoid recreation
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}

// =============================================================================
// QUERY KEYS FACTORY
// Centralized query key management for cache invalidation
// =============================================================================

export const queryKeys = {
  // Page queries
  pages: {
    all: ["pages"] as const,
    list: () => [...queryKeys.pages.all, "list"] as const,
    detail: (slug: string) => [...queryKeys.pages.all, "detail", slug] as const,
    byStatus: (status: string) => [...queryKeys.pages.all, "status", status] as const,
  },
  
  // Property queries
  properties: {
    all: ["properties"] as const,
    list: (filters?: Record<string, unknown>) => 
      [...queryKeys.properties.all, "list", filters] as const,
    detail: (slug: string) => [...queryKeys.properties.all, "detail", slug] as const,
    featured: () => [...queryKeys.properties.all, "featured"] as const,
    search: (query: string) => [...queryKeys.properties.all, "search", query] as const,
  },
  
  // Booking queries
  bookings: {
    all: ["bookings"] as const,
    list: (propertyId?: string) => 
      [...queryKeys.bookings.all, "list", propertyId] as const,
    detail: (id: string) => [...queryKeys.bookings.all, "detail", id] as const,
    availability: (propertyId: string, checkIn: string, checkOut: string) =>
      [...queryKeys.bookings.all, "availability", propertyId, checkIn, checkOut] as const,
  },
  
  // Asset/media queries
  assets: {
    all: ["assets"] as const,
    list: (folder?: string) => [...queryKeys.assets.all, "list", folder] as const,
    detail: (id: string) => [...queryKeys.assets.all, "detail", id] as const,
  },
  
  // Navigation
  nav: {
    links: () => ["nav", "links"] as const,
  },
} as const;

// =============================================================================
// PREFETCH HOOKS
// Preload data for faster navigation
// =============================================================================

export function usePrefetch() {
  const queryClient = useQueryClient();

  const prefetchPage = (slug: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.pages.detail(slug),
      queryFn: async () => {
        const res = await fetch(`/api/pages/${slug}`);
        if (!res.ok) throw new Error("Failed to fetch page");
        return res.json();
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  };

  const prefetchProperties = () => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.properties.featured(),
      queryFn: async () => {
        const res = await fetch("/api/properties");
        if (!res.ok) throw new Error("Failed to fetch properties");
        return res.json();
      },
      staleTime: 1000 * 60 * 5,
    });
  };

  const prefetchPagesList = () => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.pages.list(),
      queryFn: async () => {
        const res = await fetch("/api/pages");
        if (!res.ok) throw new Error("Failed to fetch pages");
        return res.json();
      },
      staleTime: 1000 * 60 * 5,
    });
  };

  return { prefetchPage, prefetchProperties, prefetchPagesList };
}
