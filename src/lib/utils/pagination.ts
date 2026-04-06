// =============================================================================
// CANONICAL PAGINATION UTILITY - Production-Ready
// Supports cursor-based, offset-based, and infinite scroll pagination
// =============================================================================

import { Result, ok, err } from '@/domain/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PaginationParams {
  readonly page?: number;        // 1-based page number (offset-based)
  readonly limit?: number;       // Items per page
  readonly cursor?: string;      // Cursor for cursor-based pagination
  readonly offset?: number;      // Explicit offset value
}

export interface PaginationMeta {
  readonly total: number;
  readonly page: number;
  readonly limit: number;
  readonly totalPages: number;
  readonly hasNext: boolean;
  readonly hasPrevious: boolean;
  readonly nextCursor?: string;
  readonly previousCursor?: string;
}

export interface PaginatedResult<T> {
  readonly data: readonly T[];
  readonly meta: PaginationMeta;
}

export interface InfiniteScrollResult<T> {
  readonly items: readonly T[];
  readonly nextCursor: string | null;
  readonly hasMore: boolean;
  readonly meta: {
    readonly fetched: number;
    readonly total?: number;
  };
}

export type PaginationStrategy = 'offset' | 'cursor' | 'infinite';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const DEFAULT_PAGINATION: Required<PaginationParams> = {
  page: 1,
  limit: 20,
  cursor: undefined,
  offset: 0,
};

export const MAX_LIMIT = 100;
export const MIN_LIMIT = 1;

// ---------------------------------------------------------------------------
// Core Pagination Functions
// ---------------------------------------------------------------------------

/**
 * Validate and normalize pagination params
 */
export function normalizePaginationParams(params: PaginationParams): Required<PaginationParams> {
  const page = Math.max(1, params.page ?? DEFAULT_PAGINATION.page);
  const limit = Math.min(MAX_LIMIT, Math.max(MIN_LIMIT, params.limit ?? DEFAULT_PAGINATION.limit));
  const offset = params.offset ?? (page - 1) * limit;
  
  return {
    page,
    limit,
    cursor: params.cursor,
    offset,
  };
}

/**
 * Create pagination meta from results
 */
export function createPaginationMeta(
  total: number,
  params: Required<PaginationParams>,
  nextCursor?: string,
  previousCursor?: string
): PaginationMeta {
  const totalPages = Math.ceil(total / params.limit);
  
  return {
    total,
    page: params.page,
    limit: params.limit,
    totalPages,
    hasNext: params.page < totalPages,
    hasPrevious: params.page > 1,
    nextCursor,
    previousCursor,
  };
}

/**
 * Paginate an array synchronously (client-side)
 */
export function paginateArray<T>(
  items: readonly T[],
  params: PaginationParams
): PaginatedResult<T> {
  const normalized = normalizePaginationParams(params);
  const start = normalized.offset;
  const end = start + normalized.limit;
  
  const data = items.slice(start, end);
  const meta = createPaginationMeta(items.length, normalized);
  
  return { data, meta };
}

/**
 * Create cursor from last item (for cursor-based pagination)
 */
export function createCursor<T>(items: readonly T[], getCursorKey: (item: T) => string): string | undefined {
  const lastItem = items[items.length - 1];
  if (!lastItem) return undefined;
  
  return Buffer.from(getCursorKey(lastItem)).toString('base64');
}

/**
 * Parse cursor to get the key value
 */
export function parseCursor<T>(cursor: string): T | undefined {
  try {
    const decoded = Buffer.from(cursor, 'base64').toString('utf-8');
    return JSON.parse(decoded) as T;
  } catch {
    return undefined;
  }
}

// ---------------------------------------------------------------------------
// Server-Side Pagination (for API use)
// ---------------------------------------------------------------------------

export interface PaginatedApiResponse<T> {
  readonly data: readonly T[];
  readonly pagination: {
    readonly total: number;
    readonly page: number;
    readonly limit: number;
    readonly totalPages: number;
    readonly nextCursor?: string;
  };
}

/**
 * Build pagination query params for API calls
 */
export function buildPaginationQuery(params: PaginationParams): URLSearchParams {
  const normalized = normalizePaginationParams(params);
  const searchParams = new URLSearchParams();
  
  if (normalized.cursor) {
    searchParams.set('cursor', normalized.cursor);
  } else {
    searchParams.set('page', String(normalized.page));
    searchParams.set('limit', String(normalized.limit));
  }
  
  return searchParams;
}

// ---------------------------------------------------------------------------
// Infinite Scroll Helper
// ---------------------------------------------------------------------------

/**
 * Merge new items with existing for infinite scroll
 */
export function mergeInfiniteScrollResults<T>(
  current: InfiniteScrollResult<T>,
  newItems: readonly T[],
  nextCursor: string | null,
  total?: number
): InfiniteScrollResult<T> {
  return {
    items: [...current.items, ...newItems],
    nextCursor,
    hasMore: nextCursor !== null,
    meta: {
      fetched: current.meta.fetched + newItems.length,
      total,
    },
  };
}

// ---------------------------------------------------------------------------
// Pagination Hook Factory
// ---------------------------------------------------------------------------

export interface UsePaginationOptions<T> {
  readonly initialParams?: PaginationParams;
  readonly strategy?: PaginationStrategy;
  readonly fetchFn: (params: PaginationParams) => Promise<Result<PaginatedResult<T>, Error>>;
  readonly onSuccess?: (result: PaginatedResult<T>) => void;
  readonly onError?: (error: Error) => void;
}

export interface UsePaginationReturn<T> {
  readonly params: PaginationParams;
  readonly setPage: (page: number) => void;
  readonly setLimit: (limit: number) => void;
  readonly setCursor: (cursor: string) => void;
  readonly nextPage: () => void;
  readonly previousPage: () => void;
  readonly reset: () => void;
  readonly goToFirst: () => void;
  readonly goToLast: () => void;
}

// ---------------------------------------------------------------------------
// URL-based Pagination State
// ---------------------------------------------------------------------------

/**
 * Sync pagination params with URL query params
 */
export function paginationParamsFromSearch(searchParams: URLSearchParams): PaginationParams {
  const page = searchParams.get('page');
  const limit = searchParams.get('limit');
  const cursor = searchParams.get('cursor');
  const offset = searchParams.get('offset');
  
  return {
    page: page ? parseInt(page, 10) : undefined,
    limit: limit ? parseInt(limit, 10) : undefined,
    cursor: cursor ?? undefined,
    offset: offset ? parseInt(offset, 10) : undefined,
  };
}

/**
 * Update URL with pagination params
 */
export function updateUrlWithPagination(
  params: PaginationParams,
  baseUrl: string = ''
): string {
  const searchParams = new URLSearchParams();
  
  if (params.page && params.page > 1) {
    searchParams.set('page', String(params.page));
  }
  if (params.limit && params.limit !== 20) {
    searchParams.set('limit', String(params.limit));
  }
  if (params.cursor) {
    searchParams.set('cursor', params.cursor);
  }
  if (params.offset) {
    searchParams.set('offset', String(params.offset));
  }
  
  const queryString = searchParams.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

// ---------------------------------------------------------------------------
// Default Export
// ---------------------------------------------------------------------------

export default {
  normalizePaginationParams,
  createPaginationMeta,
  paginateArray,
  createCursor,
  parseCursor,
  buildPaginationQuery,
  mergeInfiniteScrollResults,
  paginationParamsFromSearch,
  updateUrlWithPagination,
  DEFAULT_PAGINATION,
  MAX_LIMIT,
  MIN_LIMIT,
};