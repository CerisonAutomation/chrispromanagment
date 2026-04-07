// =============================================================================
// Unified API Layer - Consolidated API utilities for Christiano Property Management
// =============================================================================
// Provides typed fetch wrappers, consistent error handling, caching, and pagination
// 
// Features:
// - Unified fetch wrapper with timeout, retry, and circuit breaker
// - Typed API responses with Result pattern
// - Pagination helpers for list endpoints
// - Cache decorators and utilities
// - Rate limiting support

import {DomainError, err, ok, Result} from '../domain/types';

// ---------------------------------------------------------------------------
// SECTION 1: Core Types
// ---------------------------------------------------------------------------

/** Standard API response wrapper */
export interface ApiResponse<T> {
  readonly data: T;
  readonly status: number;
  readonly headers: Headers;
  readonly fromCache: boolean;
  readonly timestamp: number;
}

/** Request options for API calls */
export interface ApiRequestOptions {
  readonly method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  readonly headers?: Record<string, string>;
  readonly body?: unknown;
  readonly ttlMs?: number;
  readonly noCache?: boolean;
  readonly signal?: AbortSignal;
  readonly timeoutMs?: number;
}

/** Pagination parameters */
export interface PaginationParams {
  readonly page?: number;
  readonly limit?: number;
  readonly sortBy?: string;
  readonly sortOrder?: 'asc' | 'desc';
}

/** Paginated response structure */
export interface PaginatedResponse<T> {
  readonly items: T[];
  readonly page: number;
  readonly limit: number;
  readonly totalItems: number;
  readonly totalPages: number;
  readonly hasNextPage: boolean;
  readonly hasPreviousPage: boolean;
}

/** Cursor-based pagination for large datasets */
export interface CursorPaginationParams {
  readonly cursor?: string;
  readonly limit?: number;
}

/** API client configuration */
export interface ApiClientConfig {
  readonly baseUrl: string;
  readonly apiKey?: string;
  readonly timeoutMs?: number;
  readonly maxRetries?: number;
  readonly retryDelayMs?: number;
  readonly cacheEnabled?: boolean;
}

/** Cache entry interface */
export interface CacheEntry<T> {
  readonly data: T;
  readonly expiresAt: number;
  readonly size: number;
}

/** Cache statistics */
export interface CacheStats {
  readonly hitCount: number;
  readonly missCount: number;
  readonly evictionCount: number;
  readonly hitRate: number;
  readonly entryCount: number;
}

/** Circuit breaker states */
export type CircuitBreakerState = 'closed' | 'open' | 'half-open';

/** Circuit breaker statistics */
export interface CircuitBreakerStats {
  readonly state: CircuitBreakerState;
  readonly failures: number;
  readonly lastFailureTime: number | null;
}

/** Rate limiter statistics */
export interface RateLimiterStats {
  readonly remaining: number;
  readonly limit: number;
  readonly windowMs: number;
  readonly used: number;
}

// ---------------------------------------------------------------------------
// SECTION 2: Pagination Utilities
// ---------------------------------------------------------------------------

/** Default pagination values */
export const DEFAULT_PAGINATION: Required<PaginationParams> = {
  page: 1,
  limit: 20,
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

/** Create pagination params with defaults */
export function normalizePagination(params: PaginationParams = {}): Required<PaginationParams> {
  return {
    page: Math.max(1, params.page ?? DEFAULT_PAGINATION.page),
    limit: Math.min(100, Math.max(1, params.limit ?? DEFAULT_PAGINATION.limit)),
    sortBy: params.sortBy ?? DEFAULT_PAGINATION.sortBy,
    sortOrder: params.sortOrder ?? DEFAULT_PAGINATION.sortOrder,
  };
}

/** Calculate pagination metadata */
export function calculatePagination(
  totalItems: number,
  page: number,
  limit: number
): Pick<PaginatedResponse<never>, 'totalPages' | 'hasNextPage' | 'hasPreviousPage'> {
  const totalPages = Math.ceil(totalItems / limit);
  return {
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

/** Create a paginated response */
export function createPaginatedResponse<T>(
  items: T[],
  totalItems: number,
  page: number,
  limit: number
): PaginatedResponse<T> {
  return {
    items,
    page,
    limit,
    totalItems,
    ...calculatePagination(totalItems, page, limit),
  };
}

/** Parse pagination from URL search params */
export function parsePaginationParams(searchParams: URLSearchParams): PaginationParams {
  const page = searchParams.get('page');
  const limit = searchParams.get('limit');
  const sortBy = searchParams.get('sortBy');
  const sortOrder = searchParams.get('sortOrder');

  return {
    page: page ? parseInt(page, 10) : undefined,
    limit: limit ? parseInt(limit, 10) : undefined,
    sortBy: sortBy ?? undefined,
    sortOrder: (sortOrder as 'asc' | 'desc') ?? undefined,
  };
}

/** Convert pagination to URL search params */
export function paginationToSearchParams(pagination: PaginationParams): URLSearchParams {
  const params = new URLSearchParams();
  if (pagination.page) params.set('page', String(pagination.page));
  if (pagination.limit) params.set('limit', String(pagination.limit));
  if (pagination.sortBy) params.set('sortBy', pagination.sortBy);
  if (pagination.sortOrder) params.set('sortOrder', pagination.sortOrder);
  return params;
}

/** Create pagination response headers */
export function paginationHeaders(pagination: PaginatedResponse<unknown>): Record<string, string> {
  return {
    'X-Total-Items': String(pagination.totalItems),
    'X-Total-Pages': String(pagination.totalPages),
    'X-Current-Page': String(pagination.page),
    'X-Per-Page': String(pagination.limit),
    'X-Has-Next-Page': String(pagination.hasNextPage),
    'X-Has-Previous-Page': String(pagination.hasPreviousPage),
  };
}

// ---------------------------------------------------------------------------
// SECTION 3: In-Memory Cache
// ---------------------------------------------------------------------------

export class MemoryCache {
  private store = new Map<string, CacheEntry<unknown>>();
  private hitCount = 0;
  private missCount = 0;
  private evictionCount = 0;
  private currentMemoryBytes = 0;
  private readonly maxEntries: number;
  private readonly maxMemoryBytes: number;
  private readonly defaultTTLMs: number;

  constructor(maxEntries = 1000, maxMemoryMB = 50, defaultTTLMs = 5 * 60 * 1000) {
    this.maxEntries = maxEntries;
    this.maxMemoryBytes = maxMemoryMB * 1024 * 1024;
    this.defaultTTLMs = defaultTTLMs;
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) {
      this.missCount++;
      return null;
    }
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      this.currentMemoryBytes -= entry.size;
      this.missCount++;
      return null;
    }
    this.hitCount++;
    return entry.data as T;
  }

  set<T>(key: string, data: T, ttlMs?: number): void {
    const size = JSON.stringify(data).length * 2;
    const expiresAt = Date.now() + (ttlMs ?? this.defaultTTLMs);

    const existing = this.store.get(key);
    if (existing) {
      this.currentMemoryBytes -= existing.size;
    }

    while (
      (this.currentMemoryBytes + size > this.maxMemoryBytes || this.store.size >= this.maxEntries) &&
      this.store.size > 0
    ) {
      this.evictLRU();
    }

    this.store.set(key, { data, expiresAt, size });
    this.currentMemoryBytes += size;
  }

  delete(key: string): boolean {
    const entry = this.store.get(key);
    if (!entry) return false;
    this.store.delete(key);
    this.currentMemoryBytes -= entry.size;
    return true;
  }

  has(key: string): boolean {
    const entry = this.store.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.delete(key);
      return false;
    }
    return true;
  }

  invalidate(pattern?: string | RegExp): number {
    if (!pattern) {
      const count = this.store.size;
      this.store.clear();
      this.currentMemoryBytes = 0;
      return count;
    }
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    let count = 0;
    const keys = Array.from(this.store.keys());
    for (const key of keys) {
      if (regex.test(key)) {
        this.delete(key);
        count++;
      }
    }
    return count;
  }

  getStats(): CacheStats {
    const total = this.hitCount + this.missCount;
    return {
      hitCount: this.hitCount,
      missCount: this.missCount,
      evictionCount: this.evictionCount,
      hitRate: total > 0 ? this.hitCount / total : 0,
      entryCount: this.store.size,
    };
  }

  clear(): void {
    this.store.clear();
    this.currentMemoryBytes = 0;
  }

  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;
    const entries = Array.from(this.store.entries());
    for (const [key, entry] of entries) {
      const lastAccessed = entry.expiresAt - this.defaultTTLMs;
      if (lastAccessed < oldestTime) {
        oldestTime = lastAccessed;
        oldestKey = key;
      }
    }
    if (oldestKey) {
      this.delete(oldestKey);
      this.evictionCount++;
    }
  }
}

// Global cache instances
export const apiCache = new MemoryCache(1000, 50, 5 * 60 * 1000);
export const pageCache = new MemoryCache(500, 20, 60 * 1000);
export const blockCache = new MemoryCache(2000, 30, 30 * 1000);

// ---------------------------------------------------------------------------
// SECTION 4: Circuit Breaker
// ---------------------------------------------------------------------------

export class CircuitBreaker {
  private state: CircuitBreakerState = 'closed';
  private failures = 0;
  private lastFailureTime: number | null = null;
  private halfOpenCalls = 0;
  private readonly failureThreshold: number;
  private readonly recoveryTimeoutMs: number;
  private readonly halfOpenMaxCalls: number;

  constructor(
    failureThreshold = 5,
    recoveryTimeoutMs = 30000,
    halfOpenMaxCalls = 3
  ) {
    this.failureThreshold = failureThreshold;
    this.recoveryTimeoutMs = recoveryTimeoutMs;
    this.halfOpenMaxCalls = halfOpenMaxCalls;
  }

  canExecute(): boolean {
    switch (this.state) {
      case 'closed':
        return true;
      case 'open': {
        const now = Date.now();
        const lastFailure = this.lastFailureTime ?? 0;
        if (now - lastFailure > this.recoveryTimeoutMs) {
          this.state = 'half-open';
          this.halfOpenCalls = 0;
          return true;
        }
        return false;
      }
      case 'half-open':
        if (this.halfOpenCalls < this.halfOpenMaxCalls) {
          this.halfOpenCalls++;
          return true;
        }
        return false;
    }
  }

  recordSuccess(): void {
    if (this.state === 'half-open') {
      this.state = 'closed';
      this.failures = 0;
      this.halfOpenCalls = 0;
    }
  }

  recordFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    if (this.failures >= this.failureThreshold || this.state === 'half-open') {
      this.state = 'open';
    }
  }

  getState(): CircuitBreakerState {
    return this.state;
  }

  getStats(): CircuitBreakerStats {
    return {
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime,
    };
  }
}

// ---------------------------------------------------------------------------
// SECTION 5: Rate Limiter
// ---------------------------------------------------------------------------

export class RateLimiter {
  private requests: number[] = [];
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests = 10, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  canExecute(): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    this.requests = this.requests.filter((time) => time > windowStart);
    return this.requests.length < this.maxRequests;
  }

  recordRequest(): void {
    this.requests.push(Date.now());
  }

  getRemaining(): number {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    return Math.max(0, this.maxRequests - this.requests.filter((t) => t > windowStart).length);
  }

  getResetTime(): number {
    if (this.requests.length === 0) return 0;
    return Math.min(...this.requests) + this.windowMs;
  }

  getStats(): RateLimiterStats {
    return {
      remaining: this.getRemaining(),
      limit: this.maxRequests,
      windowMs: this.windowMs,
      used: this.maxRequests - this.getRemaining(),
    };
  }
}

// Global rate limiters
export const aiRateLimiter = new RateLimiter(10, 60000);
export const bookingRateLimiter = new RateLimiter(5, 60000);
export const contactRateLimiter = new RateLimiter(20, 60000);

// ---------------------------------------------------------------------------
// SECTION 6: Unified API Client
// ---------------------------------------------------------------------------

export class UnifiedApiClient {
  private readonly baseUrl: string;
  private readonly apiKey: string | undefined;
  private readonly timeoutMs: number;
  private readonly maxRetries: number;
  private readonly retryDelayMs: number;
  private readonly cache: MemoryCache | undefined;
  private readonly circuitBreaker: CircuitBreaker;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.apiKey = config.apiKey;
    this.timeoutMs = config.timeoutMs ?? 15000;
    this.maxRetries = config.maxRetries ?? 3;
    this.retryDelayMs = config.retryDelayMs ?? 1000;
    this.cache = config.cacheEnabled !== false ? apiCache : undefined;
    this.circuitBreaker = new CircuitBreaker();
  }

  /**
   * Core request method with retry, circuit breaker, and caching
   */
  async request<T>(path: string, options: ApiRequestOptions = {}): Promise<Result<ApiResponse<T>, DomainError>> {
    const {
      method = 'GET',
      headers = {},
      body,
      ttlMs,
      noCache = false,
      signal,
      timeoutMs,
    } = options;

    // Check circuit breaker
    if (!this.circuitBreaker.canExecute()) {
      return err(
        new DomainError({
          code: 'SERVICE_UNAVAILABLE',
          message: 'Service temporarily unavailable. Please try again later.',
          statusCode: 503,
        })
      );
    }

    // Check cache for GET requests
    const cacheKey = `${method}:${path}:${body ? JSON.stringify(body) : ''}`;
    if (method === 'GET' && this.cache && !noCache) {
      const cached = this.cache.get<T>(cacheKey);
      if (cached !== null) {
        return ok({
          data: cached,
          status: 200,
          headers: new Headers(),
          fromCache: true,
          timestamp: Date.now(),
        });
      }
    }

    // Build request
    const url = `${this.baseUrl}${path}`;
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...headers,
    };

    if (this.apiKey) {
      requestHeaders['Authorization'] = `Bearer ${this.apiKey}`;
    }

    // Execute with retry
    let lastError: Error | null = null;
    const effectiveTimeout = timeoutMs ?? this.timeoutMs;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), effectiveTimeout);

        if (signal) {
          signal.addEventListener('abort', () => controller.abort(), { once: true });
        }

        const response = await fetch(url, {
          method,
          headers: requestHeaders,
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Handle HTTP errors
        if (!response.ok) {
          const errorBody = await response.text().catch(() => '');

          // Don't retry on 4xx client errors (except 429)
          if (response.status >= 400 && response.status < 500 && response.status !== 429) {
            this.circuitBreaker.recordFailure();
            return err(
              new DomainError({
                code: `HTTP_${response.status}`,
                message: errorBody || response.statusText,
                statusCode: response.status,
              })
            );
          }

          throw new Error(`HTTP ${response.status}: ${errorBody}`);
        }

        // Parse response
        const data = (await response.json()) as T;

        // Cache successful GET responses
        if (method === 'GET' && this.cache && !noCache) {
          this.cache.set(cacheKey, data, ttlMs);
        }

        this.circuitBreaker.recordSuccess();

        return ok({
          data,
          status: response.status,
          headers: response.headers,
          fromCache: false,
          timestamp: Date.now(),
        });
      } catch (error) {
        lastError = error as Error;

        if (error instanceof Error && error.name === 'AbortError') {
          if (attempt >= this.maxRetries) {
            this.circuitBreaker.recordFailure();
            return err(
              new DomainError({
                code: 'REQUEST_TIMEOUT',
                message: `Request timeout after ${effectiveTimeout}ms`,
                statusCode: 408,
                cause: error,
              })
            );
          }
        }

        if (attempt < this.maxRetries) {
          const delay = this.retryDelayMs * Math.pow(2, attempt);
          await this.sleep(delay);
        }
      }
    }

    this.circuitBreaker.recordFailure();

    return err(
      new DomainError({
        code: 'REQUEST_FAILED',
        message: lastError?.message || 'Request failed after retries',
        statusCode: 500,
        cause: lastError ?? undefined,
      })
    );
  }

  // Convenience methods
  async get<T>(path: string, options?: Omit<ApiRequestOptions, 'method'>): Promise<Result<ApiResponse<T>, DomainError>> {
    return this.request<T>(path, { ...options, method: 'GET' });
  }

  async post<T>(path: string, body: unknown, options?: Omit<ApiRequestOptions, 'method' | 'body'>): Promise<Result<ApiResponse<T>, DomainError>> {
    return this.request<T>(path, { ...options, method: 'POST', body });
  }

  async put<T>(path: string, body: unknown, options?: Omit<ApiRequestOptions, 'method' | 'body'>): Promise<Result<ApiResponse<T>, DomainError>> {
    return this.request<T>(path, { ...options, method: 'PUT', body });
  }

  async patch<T>(path: string, body: unknown, options?: Omit<ApiRequestOptions, 'method' | 'body'>): Promise<Result<ApiResponse<T>, DomainError>> {
    return this.request<T>(path, { ...options, method: 'PATCH', body });
  }

  async delete<T>(path: string, options?: Omit<ApiRequestOptions, 'method'>): Promise<Result<ApiResponse<T>, DomainError>> {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  }

  // Cache management
  invalidateCache(pattern?: string | RegExp): number {
    return this.cache?.invalidate(pattern) ?? 0;
  }

  getCacheStats() {
    return this.cache?.getStats();
  }

  getCircuitBreakerState(): CircuitBreakerState {
    return this.circuitBreaker.getState();
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// ---------------------------------------------------------------------------
// SECTION 7: Pre-configured API Clients
// ---------------------------------------------------------------------------

/** Main API client for internal Next.js routes */
export const internalApiClient = new UnifiedApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
  timeoutMs: 10000,
  maxRetries: 2,
  cacheEnabled: true,
});

/** AI API client with longer timeout */
export const aiApiClient = new UnifiedApiClient({
  baseUrl: process.env.NEXT_PUBLIC_AI_API_URL || '/api/ai',
  timeoutMs: 30000,
  maxRetries: 1,
  cacheEnabled: true,
});

/** External API client (e.g., Guesty) */
export const externalApiClient = new UnifiedApiClient({
  baseUrl: process.env.EXTERNAL_API_URL || '',
  apiKey: process.env.EXTERNAL_API_KEY,
  timeoutMs: 15000,
  maxRetries: 3,
  cacheEnabled: true,
});

// ---------------------------------------------------------------------------
// SECTION 8: Fetch Helpers
// ---------------------------------------------------------------------------

/** Simple fetch wrapper with timeout */
export async function fetchWithTimeout<T>(
  url: string,
  options: RequestInit & { timeoutMs?: number } = {}
): Promise<T> {
  const { timeoutMs = 10000, ...fetchOptions } = options;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      throw new Error(`HTTP ${response.status}: ${errorBody || response.statusText}`);
    }

    return response.json() as Promise<T>;
  } catch (error) {
    clearTimeout(timeoutId);
    if ((error as Error).name === 'AbortError') {
      throw new Error(`Request timeout after ${timeoutMs}ms`);
    }
    throw error;
  }
}

/** Fetch with automatic retry */
export async function fetchWithRetry<T>(
  url: string,
  options: RequestInit & { maxRetries?: number; retryDelayMs?: number } = {}
): Promise<T> {
  const { maxRetries = 3, retryDelayMs = 1000, ...fetchOptions } = options;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, fetchOptions);

      if (!response.ok) {
        const errorBody = await response.text().catch(() => '');
        const error = new Error(`HTTP ${response.status}: ${errorBody || response.statusText}`);
        (error as Error & { status: number }).status = response.status;

        // Don't retry on 4xx (except 429)
        if (response.status >= 400 && response.status < 500 && response.status !== 429) {
          throw error;
        }
        throw error;
      }

      return response.json() as Promise<T>;
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, retryDelayMs * Math.pow(2, attempt)));
      }
    }
  }

  throw lastError ?? new Error('Request failed after retries');
}

// ---------------------------------------------------------------------------
// SECTION 9: Server-Side API Utilities
// ---------------------------------------------------------------------------

/** Parse JSON body safely */
export function parseJsonBody<T>(body: unknown): Result<T, DomainError> {
  if (typeof body !== 'object' || body === null) {
    return err(
      new DomainError({
        code: 'INVALID_BODY',
        message: 'Request body must be a JSON object',
        statusCode: 400,
      })
    );
  }

  try {
    return ok(body as T);
  } catch {
    return err(
      new DomainError({
        code: 'PARSE_ERROR',
        message: 'Failed to parse request body as JSON',
        statusCode: 400,
      })
    );
  }
}

/** Create standardized API error response */
export function apiErrorResponse(error: DomainError | Error): Response {
  const domainError = error instanceof DomainError ? error : new DomainError({
    code: 'INTERNAL_ERROR',
    message: error.message,
    statusCode: 500,
    cause: error,
  });

  return new Response(JSON.stringify({
    error: {
      code: domainError.code,
      message: domainError.message,
      ...(domainError.context && { context: domainError.context }),
    },
  }), {
    status: domainError.statusCode,
    headers: { 'Content-Type': 'application/json' },
  });
}

/** Create standardized API success response */
export function apiSuccessResponse<T>(data: T, extraHeaders?: Record<string, string>): Response {
  return new Response(JSON.stringify({ data }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      ...extraHeaders,
    },
  });
}

/** Create standardized API created response */
export function apiCreatedResponse<T>(data: T, location?: string): Response {
  return new Response(JSON.stringify({ data }), {
    status: 201,
    headers: {
      'Content-Type': 'application/json',
      ...(location && { Location: location }),
    },
  });
}

// ---------------------------------------------------------------------------
// SECTION 10: Re-exports from domain
// ---------------------------------------------------------------------------

export type {DomainError, Result} from '../domain/types';
export {err, ok} from '../domain/types';
