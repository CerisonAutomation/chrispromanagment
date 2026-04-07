// =============================================================================
// CANONICAL PUCK USE-PAGES HOOK
// TanStack Query hooks for page management with optimistic updates
// =============================================================================

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Data } from "@puckeditor/core";

// =============================================================================
// QUERY KEYS - Hierarchical cache keys for granular invalidation
// =============================================================================

export const pageKeys = {
  all: ['pages'] as const,
  lists: () => [...pageKeys.all, 'list'] as const,
  list: (filters: { status?: string; search?: string }) => 
    [...pageKeys.lists(), filters] as const,
  details: () => [...pageKeys.all, 'detail'] as const,
  detail: (slug: string) => [...pageKeys.details(), slug] as const,
  versions: (slug: string) => [...pageKeys.detail(slug), 'versions'] as const,
  preview: (slug: string) => [...pageKeys.detail(slug), 'preview'] as const,
};

// =============================================================================
// TYPES - API Response Types
// =============================================================================

export interface PageResponse {
  id: string;
  slug: string;
  title: string;
  status: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED';
  draftData: Data;
  publishedData: Data | null;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  publishedAt: string | null;
  updatedAt: string;
  versions?: PageVersion[];
}

export interface PageVersion {
  id: string;
  message: string | null;
  authorName: string | null;
  createdAt: string;
  blocksAdded: number;
  blocksRemoved: number;
  blocksModified: number;
}

export interface PageListItem {
  id: string;
  slug: string;
  title: string;
  status: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED';
  updatedAt: string;
  publishedAt: string | null;
}

// =============================================================================
// API FUNCTIONS
// =============================================================================

const API_BASE = '/api/pages';

async function fetchPage(slug: string): Promise<PageResponse> {
  const res = await fetch(`${API_BASE}/${slug}`);
  if (!res.ok) throw new Error('Failed to fetch page');
  return res.json();
}

async function fetchPages(): Promise<PageListItem[]> {
  const res = await fetch(API_BASE);
  if (!res.ok) throw new Error('Failed to fetch pages');
  return res.json();
}

async function fetchPublishedPage(slug: string): Promise<PageResponse> {
  const res = await fetch(`${API_BASE}/${slug}?status=published`);
  if (!res.ok) throw new Error('Failed to fetch published page');
  return res.json();
}

interface SavePageData {
  slug: string;
  title: string;
  data: Data;
  isDraft?: boolean;
}

async function savePage({ slug, title, data, isDraft = true }: SavePageData): Promise<PageResponse> {
  const res = await fetch(`${API_BASE}/${slug}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title,
      data,
      saveAsDraft: isDraft,
    }),
  });
  if (!res.ok) throw new Error('Failed to save page');
  return res.json();
}

interface PublishPageData {
  slug: string;
  message?: string;
}

async function publishPage({ slug, message }: PublishPageData): Promise<PageResponse> {
  const res = await fetch(`${API_BASE}/${slug}/publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error('Failed to publish page');
  return res.json();
}

async function revertPage({ slug, versionId }: { slug: string; versionId: string }): Promise<PageResponse> {
  const res = await fetch(`${API_BASE}/${slug}/revert`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ versionId }),
  });
  if (!res.ok) throw new Error('Failed to revert page');
  return res.json();
}

// =============================================================================
// REACT QUERY HOOKS - With Optimistic Updates
// =============================================================================

// Hook: Get all pages
export function usePages() {
  return useQuery({
    queryKey: pageKeys.lists(),
    queryFn: fetchPages,
  });
}

// Hook: Get single page (for editing)
export function usePage(slug: string) {
  return useQuery({
    queryKey: pageKeys.detail(slug),
    queryFn: () => fetchPage(slug),
    enabled: !!slug,
    // Keep previous data while loading new data
    placeholderData: (prev) => prev,
  });
}

// Hook: Get published page (for public viewing)
export function usePublishedPage(slug: string) {
  return useQuery({
    queryKey: pageKeys.preview(slug),
    queryFn: () => fetchPublishedPage(slug),
    enabled: !!slug,
    // Cache published pages longer since they change less frequently
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Hook: Save page with optimistic updates
export function useSavePage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: savePage,
    
    // OPTIMISTIC UPDATE: Update UI immediately before server responds
    onMutate: async ({ slug, title, data, isDraft }) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: pageKeys.detail(slug) });
      
      // Snapshot previous value for rollback
      const previousPage = queryClient.getQueryData<PageResponse>(pageKeys.detail(slug));
      
      // Optimistically update to new value
      queryClient.setQueryData<PageResponse>(pageKeys.detail(slug), (old) => {
        if (!old) return old;
        return {
          ...old,
          title,
          draftData: data,
          // If publishing, also update published data
          ...(isDraft ? {} : { publishedData: data, status: 'PUBLISHED' as const }),
        };
      });
      
      // Return context for rollback
      return { previousPage, slug };
    },
    
    // Rollback on error
    onError: (err, variables, context) => {
      if (context?.previousPage) {
        queryClient.setQueryData(pageKeys.detail(context.slug), context.previousPage);
      }
    },
    
    // Always refetch after error or success to ensure server state
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: pageKeys.detail(variables.slug) });
      queryClient.invalidateQueries({ queryKey: pageKeys.lists() });
    },
  });
}

// Hook: Publish page
export function usePublishPage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: publishPage,
    
    onMutate: async ({ slug }) => {
      await queryClient.cancelQueries({ queryKey: pageKeys.detail(slug) });
      const previousPage = queryClient.getQueryData<PageResponse>(pageKeys.detail(slug));
      
      // Optimistically mark as published
      queryClient.setQueryData<PageResponse>(pageKeys.detail(slug), (old) => {
        if (!old) return old;
        return {
          ...old,
          status: 'PUBLISHED',
          publishedData: old.draftData,
          publishedAt: new Date().toISOString(),
        };
      });
      
      return { previousPage, slug };
    },
    
    onError: (err, variables, context) => {
      if (context?.previousPage) {
        queryClient.setQueryData(pageKeys.detail(context.slug), context.previousPage);
      }
    },
    
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: pageKeys.detail(variables.slug) });
      queryClient.invalidateQueries({ queryKey: pageKeys.preview(variables.slug) });
      queryClient.invalidateQueries({ queryKey: pageKeys.lists() });
    },
  });
}

// Hook: Revert to version
export function useRevertPage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: revertPage,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: pageKeys.detail(variables.slug) });
      queryClient.invalidateQueries({ queryKey: pageKeys.versions(variables.slug) });
    },
  });
}

// =============================================================================
// PREFETCH HELPERS - For SSR and navigation optimization
// =============================================================================

export async function prefetchPage(queryClient: ReturnType<typeof useQueryClient>, slug: string) {
  await queryClient.prefetchQuery({
    queryKey: pageKeys.detail(slug),
    queryFn: () => fetchPage(slug),
  });
}

export async function prefetchPublishedPage(queryClient: ReturnType<typeof useQueryClient>, slug: string) {
  await queryClient.prefetchQuery({
    queryKey: pageKeys.preview(slug),
    queryFn: () => fetchPublishedPage(slug),
  });
}
