// =============================================================================
// API Client - Production-grade with retry, timeout, and circuit breaker
// =============================================================================
// Combines workspace-c3a9a77d Guesty patterns + proper error handling

import {LRUCache} from './cache';
import {DomainError, err, ok, Result} from '@/domain/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ApiClientOptions {
  readonly baseUrl: string;
  readonly apiKey?: string;
  readonly timeoutMs?: number;
  readonly maxRetries?: number;
  readonly retryDelayMs?: number;
  readonly cache?: LRUCache;
}

export interface RequestOptions {
  readonly method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  readonly headers?: Record<string, string>;
  readonly body?: unknown;
  readonly ttlMs?: number;
  readonly noCache?: boolean;
  readonly signal?: AbortSignal;
}

export interface ApiResponse<T> {
  readonly data: T;
  readonly status: number;
  readonly headers: Headers;
  readonly fromCache: boolean;
}

interface CircuitBreakerState {
  readonly failures: number;
  readonly lastFailureTime: number | null;
  readonly state: 'closed' | 'open' | 'half-open';
}

// ---------------------------------------------------------------------------
// Circuit Breaker - Fail fast when service is down
// ---------------------------------------------------------------------------

class CircuitBreaker {
  private state: CircuitBreakerState = {
    failures: 0,
    lastFailureTime: null,
    state: 'closed',
  };

  private readonly failureThreshold: number;
  private readonly recoveryTimeoutMs: number;
  private readonly halfOpenMaxCalls: number;
  private halfOpenCalls = 0;

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
    if (this.state.state === 'closed') return true;

    if (this.state.state === 'open') {
      const now = Date.now();
      const lastFailure = this.state.lastFailureTime ?? 0;

      if (now - lastFailure > this.recoveryTimeoutMs) {
        this.state = { ...this.state, state: 'half-open' };
        this.halfOpenCalls = 0;
        return true;
      }
      return false;
    }

    // Half-open
    if (this.halfOpenCalls < this.halfOpenMaxCalls) {
      this.halfOpenCalls++;
      return true;
    }
    return false;
  }

  recordSuccess(): void {
    if (this.state.state === 'half-open') {
      this.state = {
        failures: 0,
        lastFailureTime: null,
        state: 'closed',
      };
      this.halfOpenCalls = 0;
    }
  }

  recordFailure(): void {
    const failures = this.state.failures + 1;

    if (failures >= this.failureThreshold || this.state.state === 'half-open') {
      this.state = {
        failures,
        lastFailureTime: Date.now(),
        state: 'open',
      };
    } else {
      this.state = {
        ...this.state,
        failures,
      };
    }
  }

  getState(): CircuitBreakerState['state'] {
    return this.state.state;
  }
}

// ---------------------------------------------------------------------------
// API Client
// ---------------------------------------------------------------------------

export class ApiClient {
  private readonly baseUrl: string;
  private readonly apiKey: string | undefined;
  private readonly timeoutMs: number;
  private readonly maxRetries: number;
  private readonly retryDelayMs: number;
  private readonly cache: LRUCache | undefined;
  private readonly circuitBreaker: CircuitBreaker;

  constructor(options: ApiClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, '');
    this.apiKey = options.apiKey;
    this.timeoutMs = options.timeoutMs ?? 15000;
    this.maxRetries = options.maxRetries ?? 3;
    this.retryDelayMs = options.retryDelayMs ?? 1000;
    this.cache = options.cache;
    this.circuitBreaker = new CircuitBreaker();
  }

  async request<T>(
    path: string,
    options: RequestOptions = {}
  ): Promise<Result<ApiResponse<T>, DomainError>> {
    const {
      method = 'GET',
      headers = {},
      body,
      ttlMs,
      noCache = false,
      signal,
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
      requestHeaders.Authorization = `Bearer ${this.apiKey}`;
    }

    // Execute with retry
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

        // Combine external signal with internal timeout
        if (signal) {
          signal.addEventListener('abort', () => controller.abort());
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

          // Don't retry on 4xx client errors (except 429 rate limit)
          if (
            response.status >= 400 &&
            response.status < 500 &&
            response.status !== 429
          ) {
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
        });
      } catch (error) {
        lastError = error as Error;

        // Handle abort/timeout
        if (error instanceof Error && error.name === 'AbortError') {
          if (attempt >= this.maxRetries) {
            this.circuitBreaker.recordFailure();
            return err(
              new DomainError({
                code: 'REQUEST_TIMEOUT',
                message: `Request timeout after ${this.timeoutMs}ms`,
                statusCode: 408,
                cause: error,
              })
            );
          }
        }

        // Exponential backoff before retry
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
  async get<T>(
    path: string,
    options?: Omit<RequestOptions, 'method'>
  ): Promise<Result<ApiResponse<T>, DomainError>> {
    return this.request<T>(path, { ...options, method: 'GET' });
  }

  async post<T>(
    path: string,
    body: unknown,
    options?: Omit<RequestOptions, 'method' | 'body'>
  ): Promise<Result<ApiResponse<T>, DomainError>> {
    return this.request<T>(path, { ...options, method: 'POST', body });
  }

  async put<T>(
    path: string,
    body: unknown,
    options?: Omit<RequestOptions, 'method' | 'body'>
  ): Promise<Result<ApiResponse<T>, DomainError>> {
    return this.request<T>(path, { ...options, method: 'PUT', body });
  }

  async patch<T>(
    path: string,
    body: unknown,
    options?: Omit<RequestOptions, 'method' | 'body'>
  ): Promise<Result<ApiResponse<T>, DomainError>> {
    return this.request<T>(path, { ...options, method: 'PATCH', body });
  }

  async delete<T>(
    path: string,
    options?: Omit<RequestOptions, 'method'>
  ): Promise<Result<ApiResponse<T>, DomainError>> {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  }

  getCircuitBreakerState(): string {
    return this.circuitBreaker.getState();
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// ---------------------------------------------------------------------------
// Rate Limiter - Client-side rate limiting
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

    // Remove old requests outside the window
    this.requests = this.requests.filter((time) => time > windowStart);

    return this.requests.length < this.maxRequests;
  }

  recordRequest(): void {
    this.requests.push(Date.now());
  }

  getRemaining(): number {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    const recentRequests = this.requests.filter((time) => time > windowStart);
    return Math.max(0, this.maxRequests - recentRequests.length);
  }

  getResetTime(): number {
    if (this.requests.length === 0) return 0;
    const oldest = Math.min(...this.requests);
    return oldest + this.windowMs;
  }
}

// ---------------------------------------------------------------------------
// Pre-configured clients
// ---------------------------------------------------------------------------

export const apiClient = new ApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
  timeoutMs: 10000,
  maxRetries: 2,
});

export const aiApiClient = new ApiClient({
  baseUrl: process.env.NEXT_PUBLIC_AI_API_URL || '/api/ai',
  timeoutMs: 30000, // AI takes longer
  maxRetries: 1,
  cache: new LRUCache({
    maxSize: 100,
    defaultTTLMs: 60000,
  }),
});
