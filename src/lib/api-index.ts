/**
 * @fileoverview API Index - Unified API exports
 * 
 * @example
 * import { internalApiClient, aiApiClient } from '@/lib/api-index';
 */

// Unified API Client with caching, rate limiting, circuit breakers
export {
  UnifiedApiClient,
  MemoryCache,
  CircuitBreaker,
  RateLimiter,
  apiCache,
  pageCache,
  blockCache,
  aiRateLimiter,
  bookingRateLimiter,
  contactRateLimiter,
  internalApiClient,
  aiApiClient,
  externalApiClient,
} from './api';

export type {
  ApiResponse,
  ApiRequestOptions,
  PaginationParams,
  PaginatedResponse,
  CursorPaginationParams,
  ApiClientConfig,
  CacheEntry,
  CacheStats,
  CircuitBreakerState,
  CircuitBreakerStats,
  RateLimiterStats,
} from './api';

// Pagination utilities
export {
  DEFAULT_PAGINATION,
  normalizePagination,
  calculatePagination,
  createPaginatedResponse,
  parsePaginationParams,
  paginationToSearchParams,
  paginationHeaders,
} from './api';

// Fetch helpers
export {
  fetchWithTimeout,
  fetchWithRetry,
  parseJsonBody,
  apiErrorResponse,
  apiSuccessResponse,
  apiCreatedResponse,
} from './api';

// Result types (re-exported from domain)
