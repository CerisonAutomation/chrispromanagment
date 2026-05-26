// src/lib/guesty.ts — canonical Guesty Booking Engine client with enterprise-grade features
// Enhanced with idempotency, atomic operations, circuit breaker, retry logic, and comprehensive error handling
import { supabase } from "@/integrations/supabase/client";
import { idempotencyManager, IdempotencyManager } from '@/integrations/guesty/idempotency-manager';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '@/lib/logger';
import { tracing, metrics, OtelLogger } from '@/lib/otel-observability';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
const BEAPI_URL = `${SUPABASE_URL}/functions/v1/guesty-beapi`;

// =============================================
// Type Definitions
// =============================================

export interface GuestyConfig {
  apiEndpoint: string;
  apiKey: string;
  timeout: number;
  maxRetries: number;
  retryDelay: number;
  enableCache: boolean;
  cacheTTL: number;
  enableRateLimit: boolean;
  rateLimitRequests: number;
  rateLimitWindow: number;
}

export interface GuestyRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  cache?: boolean;
  context?: Record<string, unknown>;
  idempotencyKey?: string;
  skipIdempotency?: boolean;
  correlationId?: string;
}

export interface ApiResponse<T = unknown> {
  data: T;
  success: boolean;
  error?: string;
  statusCode: number;
  headers: Headers;
  cached: boolean;
  duration: number;
}

export interface GuestyListing {
  id: string;
  title: string;
  description: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  amenities: string[];
  pricing: {
    basePrice: number;
    currency: string;
    cleaningFee: number;
  };
  images: string[];
  availability: {
    checkIn: string;
    checkOut: string;
  };
}

export interface GuestyQuote {
  id: string;
  listingId: string;
  checkIn: string;
  checkOut: string;
  guestsCount: number;
  basePrice: number;
  taxes: number;
  fees: number;
  totalPrice: number;
  currency: string;
}

export interface GuestyReservation {
  id: string;
  quoteId: string;
  guestId: string;
  listingId: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  checkIn: string;
  checkOut: string;
  totalAmount: number;
  paymentMethod: string;
  createdAt: string;
}

// =============================================
// Circuit Breaker Implementation
// =============================================

export class CircuitBreaker {
  private failureCount: number = 0;
  private lastFailureTime: number = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private readonly failureThreshold: number;
  private readonly recoveryTimeout: number;
  private readonly monitoringPeriod: number;

  constructor(
    failureThreshold: number = 5,
    recoveryTimeout: number = 60000,
    monitoringPeriod: number = 10000
  ) {
    this.failureThreshold = failureThreshold;
    this.recoveryTimeout = recoveryTimeout;
    this.monitoringPeriod = monitoringPeriod;
  }

  async execute<T>(fn: () => Promise<T>, context?: Record<string, unknown>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
        this.state = 'HALF_OPEN';
        logger.info('Circuit breaker entering HALF_OPEN state', context);
      } else {
        throw new Error('Circuit breaker is OPEN - service unavailable');
      }
    }

    try {
      const result = await fn();

      if (this.state === 'HALF_OPEN') {
        this.state = 'CLOSED';
        this.failureCount = 0;
        logger.info('Circuit breaker entering CLOSED state', context);
      }

      return result;
    } catch (error) {
      this.failureCount++;
      this.lastFailureTime = Date.now();

      logger.error('Circuit breaker recorded failure', {
        ...context,
        failureCount: this.failureCount,
        threshold: this.failureThreshold,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      if (this.failureCount >= this.failureThreshold) {
        this.state = 'OPEN';
        logger.error('Circuit breaker entering OPEN state', context);
      }

      throw error;
    }
  }

  getState(): string {
    return this.state;
  }

  reset(): void {
    this.failureCount = 0;
    this.state = 'CLOSED';
    logger.info('Circuit breaker reset');
  }
}

// =============================================
// Cache Implementation
// =============================================

export class RequestCache {
  private cache: Map<string, { data: unknown; timestamp: number; hits: number }> = new Map();
  private ttl: number;

  constructor(ttl: number = 60000) {
    this.ttl = ttl;
  }

  set(key: string, data: unknown): void {
    this.cache.set(key, { data, timestamp: Date.now(), hits: 0 });
  }

  get<T = unknown>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
return null;
}

    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    entry.hits++;
    return entry.data as T;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) {
return false;
}

    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// =============================================
// Rate Limiter
// =============================================

export class RateLimiter {
  private requests: number[] = [];
  private maxRequests: number;
  private window: number;

  constructor(maxRequests: number = 100, window: number = 60000) {
    this.maxRequests = maxRequests;
    this.window = window;
  }

  async acquire(): Promise<void> {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.window);

    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = this.window - (now - oldestRequest);

      logger.warn(`Rate limit reached, waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.requests.push(now);
  }

  reset(): void {
    this.requests = [];
  }
}

/**
 * Enhanced guestyFetch with idempotency support and comprehensive error handling
 */
export async function guestyFetch(
  action: string,
  getParams: Record<string, string | number | boolean | null | undefined> = {},
  postBody: Record<string, unknown> | null = null,
  options: {
    idempotencyKey?: string;
    skipIdempotency?: boolean;
    correlationId?: string;
  } = {}
) {
  const correlationId = options.correlationId || uuidv4();
  const startTime = Date.now();
  
  logger.info('Guesty API request started', {
    action,
    correlationId,
    hasIdempotencyKey: !!options.idempotencyKey,
    hasBody: !!postBody,
  });

  // Handle idempotency for write operations
  const isWriteOperation = postBody !== null && 
    ['create-quote', 'apply-coupon', 'instant-charge', 'create-reservation'].includes(action);

  if (isWriteOperation && !options.skipIdempotency) {
    const idempotencyKey = options.idempotencyKey || uuidv4();
    
    // Check if this operation was already completed
    const checkResult = await idempotencyManager.checkKey(idempotencyKey);
    if (checkResult.exists && checkResult.result) {
      logger.info('Returning cached idempotency result', {
        action,
        idempotencyKey,
        correlationId,
        status: checkResult.status,
      });
      
      if (checkResult.status === 'completed') {
        return checkResult.result;
      }
      if (checkResult.status === 'failed') {
        throw new Error('Operation previously failed with idempotency key');
      }
      if (checkResult.status === 'pending') {
        throw new Error('Operation is currently pending with this idempotency key');
      }
    }

    // Create the idempotency key
    await idempotencyManager.createKey(
      idempotencyKey,
      action,
      { getParams, postBody }
    );

    try {
      const result = await performGuestyFetch(action, getParams, postBody, correlationId);
      
      // Cache the successful result
      await idempotencyManager.completeKey(idempotencyKey, result, 'completed', 200);
      
      return result;
    } catch (error) {
      // Cache the failure
      await idempotencyManager.completeKey(
        idempotencyKey,
        { error: error instanceof Error ? error.message : 'Unknown error' },
        'failed',
        500
      );
      
      throw error;
    }
  }

  // Non-write operations or idempotency skipped
  return performGuestyFetch(action, getParams, postBody, correlationId);
}

/**
 * Core Guesty API fetch implementation
 */
async function performGuestyFetch(
  action: string,
  getParams: Record<string, string | number | boolean | null | undefined>,
  postBody: Record<string, unknown> | null,
  correlationId: string
) {
  const qs = new URLSearchParams({ action });
  for (const [k, v] of Object.entries(getParams)) {
    if (v != null && v !== "" && v !== false) {
qs.set(k, String(v));
}
  }
  
  const { data: { session } } = await supabase.auth.getSession();
  const bearer = session?.access_token || ANON_KEY;
  
  const init: RequestInit = {
    method: postBody ? "POST" : "GET",
    headers: {
      apikey: ANON_KEY,
      Authorization: `Bearer ${bearer}`,
      Accept: "application/json",
      "X-Correlation-ID": correlationId,
      ...(postBody ? { "Content-Type": "application/json" } : {}),
    },
    ...(postBody ? { body: JSON.stringify(postBody) } : {}),
  };
  
  const res = await fetch(`${BEAPI_URL}?${qs}`, init);
  
  if (!res.ok) {
    let msg = `Guesty error ${res.status}`;
    try { 
      const j = await res.json(); 
      msg = j.error || msg; 
    } catch { /* noop */ }
    
    logger.error('Guesty API request failed', {
      action,
      correlationId,
      status: res.status,
      error: msg,
    });
    
    throw new Error(msg);
  }
  
  const result = await res.json();
  
  logger.info('Guesty API request completed', {
    action,
    correlationId,
    status: res.status,
  });
  
  return result;
}

/**
 * Enhanced guesty API object with idempotency support
 */
export const guesty = {
  // Read operations (no idempotency needed)
  listings:         (p: Record<string, unknown> = {}) => guestyFetch("listings", p),
  search:           (p: Record<string, unknown> = {}) => guestyFetch("search", p),
  listing:          (id: string) => guestyFetch("listing", { id }),
  calendar:         (id: string, from: string, to: string) => guestyFetch("calendar", { id, from, to }),
  cities:           (p: Record<string, unknown> = {}) => guestyFetch("cities", p),
  reservationMoney: (listingId: string, checkIn: string, checkOut: string, guestsCount: number, coupon?: string) =>
    guestyFetch("reservation-money", { listingId, checkIn, checkOut, guestsCount, ...(coupon ? { coupon } : {}) }),
  paymentProvider:  (id: string) => guestyFetch("payment-provider", { id }),
  getQuote:         (id: string) => guestyFetch("get-quote", { id }),
  reservation:      (id: string) => guestyFetch("reservation", { id }),
  pingToken:        () => guestyFetch("ping-token"),
  tokenStatus:      () => guestyFetch("token-status"),
  bootstrap:        () => guestyFetch("bootstrap"),

  // Write operations with idempotency
  createQuote:      (body: Record<string, unknown>, idempotencyKey?: string) => 
    guestyFetch("create-quote", {}, body, { idempotencyKey }),
  applyCoupon:      (id: string, couponCode: string, idempotencyKey?: string) => 
    guestyFetch("apply-coupon", { id }, { couponCode }, { idempotencyKey }),
  instantCharge:    (id: string, body: Record<string, unknown>, idempotencyKey?: string) => 
    guestyFetch("instant-charge", { id }, body, { idempotencyKey }),
  createReservation: (body: Record<string, unknown>, idempotencyKey?: string) => 
    guestyFetch("create-reservation", {}, body, { idempotencyKey }),
};

// Helper function to generate idempotency key for operations
export function generateIdempotencyKey(): string {
  return uuidv4();
}

// =============================================
// Enterprise Guesty Client
// =============================================

export class EnterpriseGuestyClient {
  private config: GuestyConfig;
  private cache: RequestCache;
  private rateLimiter: RateLimiter;
  private circuitBreaker: CircuitBreaker;
  private requestCount = 0;
  private otelLogger: OtelLogger;

  constructor(config: Partial<GuestyConfig> = {}) {
    this.config = {
      apiEndpoint: BEAPI_URL,
      apiKey: ANON_KEY,
      timeout: config.timeout || 30000,
      maxRetries: config.maxRetries || 3,
      retryDelay: config.retryDelay || 1000,
      enableCache: config.enableCache ?? true,
      cacheTTL: config.cacheTTL || 300000, // 5 minutes
      enableRateLimit: config.enableRateLimit ?? true,
      rateLimitRequests: config.rateLimitRequests || 50,
      rateLimitWindow: config.rateLimitWindow || 60000,
    };

    this.cache = new RequestCache(this.config.cacheTTL);
    this.rateLimiter = new RateLimiter(
      this.config.rateLimitRequests,
      this.config.rateLimitWindow
    );
    this.circuitBreaker = new CircuitBreaker(5, 60000, 10000);
    this.otelLogger = new OtelLogger('guesty-api', import.meta.env.MODE);

    // Periodic cache cleanup
    setInterval(() => this.cache.cleanup(), 60000);
  }

  private async getAuthToken(): Promise<string> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || this.config.apiKey;
  }

  private generateCacheKey(action: string, params: Record<string, unknown>): string {
    return `${action}:${JSON.stringify(params)}`;
  }

  private async executeRequest<T>(
    action: string,
    params: Record<string, unknown> = {},
    body: Record<string, unknown> | null = null,
    options: GuestyRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const startTime = performance.now();
    const cacheKey = this.generateCacheKey(action, params);
    const correlationId = options.correlationId || uuidv4();
    const isWriteOperation = body !== null;

    // Set correlation ID in OtelLogger
    this.otelLogger.setCorrelationId(correlationId);

    const context = {
      ...options.context,
      action,
      requestCount: ++this.requestCount,
      correlationId,
    };

    // Start trace for Guesty API call
    const spanContext = tracing.startTrace(`guesty_api_${action}`);

    this.otelLogger.setTraceContext(spanContext);
    this.otelLogger.info(`Guesty API request: ${action}`, context);

    try {
      // Handle idempotency for write operations
      if (isWriteOperation && !options.skipIdempotency) {
        const idempotencyKey = options.idempotencyKey || uuidv4();

        // Check if this operation was already completed
        const checkResult = await idempotencyManager.checkKey(idempotencyKey);
        if (checkResult.exists && checkResult.result) {
          logger.info('Returning cached idempotency result', {
            action,
            idempotencyKey,
            correlationId,
            status: checkResult.status,
          });

          const duration = performance.now() - startTime;
          metrics.recordLatency(`guesty_api_${action}_duration_ms`, duration);

          if (checkResult.status === 'completed') {
            tracing.endSpan(spanContext.spanId, 'ok');
            this.otelLogger.clearTraceContext();
            return {
              data: checkResult.result as T,
              success: true,
              statusCode: 200,
              headers: new Headers(),
              cached: true,
              duration,
            };
          }
          if (checkResult.status === 'failed') {
            tracing.endSpan(spanContext.spanId, 'error', new Error('Operation previously failed'));
            this.otelLogger.clearTraceContext();
            throw new Error('Operation previously failed with idempotency key');
          }
          if (checkResult.status === 'pending') {
            tracing.endSpan(spanContext.spanId, 'ok');
            this.otelLogger.clearTraceContext();
            throw new Error('Operation is currently pending with this idempotency key');
          }
        }

        // Create the idempotency key
        await idempotencyManager.createKey(
          idempotencyKey,
          action,
          { params, body }
        );

        try {
          const result = await this.performRequest<T>(
            action,
            params,
            body,
            options,
            correlationId,
            cacheKey,
            startTime,
            context
          );

          // Cache the successful result
          await idempotencyManager.completeKey(idempotencyKey, result.data, 'completed', result.statusCode);

          tracing.endSpan(spanContext.spanId, 'ok');
          this.otelLogger.clearTraceContext();
          return result;
        } catch (error) {
          // Cache the failure
          await idempotencyManager.completeKey(
            idempotencyKey,
            { error: error instanceof Error ? error.message : 'Unknown error' },
            'failed',
            500
          );

          tracing.endSpan(spanContext.spanId, 'error', error as Error);
          this.otelLogger.clearTraceContext();
          throw error;
        }
      }

      // Non-write operations or idempotency skipped
      const result = await this.performRequest<T>(
        action,
        params,
        body,
        options,
        correlationId,
        cacheKey,
        startTime,
        context
      );

      tracing.endSpan(spanContext.spanId, 'ok');
      this.otelLogger.clearTraceContext();
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      metrics.incrementCounter(`guesty_api_${action}_errors`);
      this.otelLogger.error(`Guesty API error: ${action}`, { error, duration });
      tracing.endSpan(spanContext.spanId, 'error', error as Error);
      this.otelLogger.clearTraceContext();
      throw error;
    }
  }

  private async performRequest<T>(
    action: string,
    params: Record<string, unknown>,
    body: Record<string, unknown> | null,
    options: GuestyRequestOptions,
    correlationId: string,
    cacheKey: string,
    startTime: number,
    context: Record<string, unknown>
  ): Promise<ApiResponse<T>> {
    // Check cache for GET requests
    if (this.config.enableCache && !body && options.cache !== false) {
      const cached = this.cache.get<T>(cacheKey);
      if (cached) {
        logger.debug('Cache hit for Guesty request', { ...context, cacheKey });
        return {
          data: cached,
          success: true,
          statusCode: 200,
          headers: new Headers(),
          cached: true,
          duration: performance.now() - startTime,
        };
      }
    }

    // Apply rate limiting
    if (this.config.enableRateLimit) {
      await this.rateLimiter.acquire();
    }

    return this.circuitBreaker.execute(async () => {
      const token = await this.getAuthToken();
      const method = body ? 'POST' : 'GET';

      const queryParams = new URLSearchParams({ action });
      for (const [k, v] of Object.entries(params)) {
        if (v != null && v !== '' && v !== false) {
          queryParams.set(k, String(v));
        }
      }

      const requestInit: RequestInit = {
        method,
        headers: {
          'api-key': this.config.apiKey,
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Correlation-ID': correlationId,
          ...options.headers,
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), options.timeout || this.config.timeout);

      try {
        const response = await fetch(`${this.config.apiEndpoint}?${queryParams}`, {
          ...requestInit,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        const duration = performance.now() - startTime;

        // Record latency metric
        metrics.recordLatency(`guesty_api_${action}_duration_ms`, duration);

        if (!response.ok) {
          let errorMessage = `Guesty API error ${response.status}`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch {
            // Ignore JSON parse errors
          }

          metrics.incrementCounter(`guesty_api_${action}_errors`);

          logger.error('Guesty API request failed', {
            ...context,
            statusCode: response.status,
            error: errorMessage,
            duration,
          });

          throw new Error(errorMessage);
        }

        const data = await response.json();

        // Cache successful GET requests
        if (this.config.enableCache && !body && response.ok && options.cache !== false) {
          this.cache.set(cacheKey, data);
        }

        metrics.incrementCounter(`guesty_api_${action}_success`);

        logger.info('Guesty API request completed', {
          ...context,
          statusCode: response.status,
          duration,
          cached: false,
        });

        return {
          data: data as T,
          success: true,
          statusCode: response.status,
          headers: response.headers,
          cached: false,
          duration,
        };
      } catch (error) {
        clearTimeout(timeoutId);
        const duration = performance.now() - startTime;

        metrics.recordLatency(`guesty_api_${action}_duration_ms`, duration);
        metrics.incrementCounter(`guesty_api_${action}_errors`);

        logger.error('Guesty API request error', {
          ...context,
          error: error instanceof Error ? error.message : 'Unknown error',
          duration,
        });

        throw error;
      }
    }, context);
  }

  private async executeWithRetry<T>(
    action: string,
    params: Record<string, unknown> = {},
    body: Record<string, unknown> | null = null,
    options: GuestyRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const maxRetries = options.retries ?? this.config.maxRetries;
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.executeRequest<T>(action, params, body, options);
      } catch (error) {
        lastError = error as Error;

        if (attempt === maxRetries) {
          logger.error(`Guesty request failed after ${maxRetries} retries`, {
            action,
            params,
            error: lastError.message,
          });
          throw lastError;
        }

        const delay = this.config.retryDelay * Math.pow(2, attempt - 1);
        logger.info(`Retrying Guesty request (attempt ${attempt}/${maxRetries})`, {
          action,
          delay,
        });

        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }

  // =============================================
  // Public API Methods
  // =============================================

  async getListings(params: Record<string, unknown> = {}): Promise<ApiResponse<GuestyListing[]>> {
    return this.executeWithRetry<GuestyListing[]>('listings', params);
  }

  async searchProperties(params: Record<string, unknown> = {}): Promise<ApiResponse<GuestyListing[]>> {
    return this.executeWithRetry<GuestyListing[]>('search', params);
  }

  async getListing(id: string): Promise<ApiResponse<GuestyListing>> {
    return this.executeWithRetry<GuestyListing>('listing', { id });
  }

  async getCalendar(
    listingId: string,
    checkIn: string,
    checkOut: string
  ): Promise<ApiResponse<Record<string, unknown>>> {
    return this.executeWithRetry('calendar', { id: listingId, from: checkIn, to: checkOut });
  }

  async getCities(params: Record<string, unknown> = {}): Promise<ApiResponse<Record<string, unknown>[]>> {
    return this.executeWithRetry('cities', params);
  }

  async getReservationQuote(
    listingId: string,
    checkIn: string,
    checkOut: string,
    guestsCount: number,
    coupon?: string
  ): Promise<ApiResponse<GuestyQuote>> {
    return this.executeWithRetry<GuestyQuote>('reservation-money', {
      listingId,
      checkIn,
      checkOut,
      guestsCount,
      ...(coupon ? { coupon } : {}),
    });
  }

  async getPaymentProvider(listingId: string): Promise<ApiResponse<Record<string, unknown>>> {
    return this.executeWithRetry('payment-provider', { id: listingId });
  }

  async createQuote(quoteData: Record<string, unknown>): Promise<ApiResponse<GuestyQuote>> {
    return this.executeWithRetry<GuestyQuote>('create-quote', {}, quoteData);
  }

  async getQuote(quoteId: string): Promise<ApiResponse<GuestyQuote>> {
    return this.executeWithRetry<GuestyQuote>('get-quote', { id: quoteId });
  }

  async applyCoupon(quoteId: string, couponCode: string): Promise<ApiResponse<GuestyQuote>> {
    return this.executeWithRetry<GuestyQuote>('apply-coupon', { id: quoteId }, { couponCode });
  }

  async instantCharge(
    chargeId: string,
    chargeData: Record<string, unknown>
  ): Promise<ApiResponse<Record<string, unknown>>> {
    return this.executeWithRetry('instant-charge', { id: chargeId }, chargeData);
  }

  async getReservation(reservationId: string): Promise<ApiResponse<GuestyReservation>> {
    return this.executeWithRetry<GuestyReservation>('reservation', { id: reservationId });
  }

  async createReservation(reservationData: Record<string, unknown>): Promise<ApiResponse<GuestyReservation>> {
    return this.executeWithRetry<GuestyReservation>('create-reservation', {}, reservationData);
  }

  async pingToken(): Promise<ApiResponse<boolean>> {
    return this.executeWithRetry<boolean>('ping-token');
  }

  async getTokenStatus(): Promise<ApiResponse<Record<string, unknown>>> {
    return this.executeWithRetry('token-status');
  }

  async bootstrap(): Promise<ApiResponse<Record<string, unknown>>> {
    return this.executeWithRetry('bootstrap');
  }

  // =============================================
  // Utility Methods
  // =============================================

  getCircuitBreakerState(): string {
    return this.circuitBreaker.getState();
  }

  resetCircuitBreaker(): void {
    this.circuitBreaker.reset();
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size(),
      keys: Array.from(this.cache.keys()),
    };
  }

  resetRateLimiter(): void {
    this.rateLimiter.reset();
  }

  getRequestCount(): number {
    return this.requestCount;
  }
}

// =============================================
// Singleton Instance
// =============================================

const guestyClient = new EnterpriseGuestyClient();

export default guestyClient;

export { buildBreakdown, formatMoney, describeCancellationPolicy } from "./guestyPricing";

// Export idempotency manager for advanced use cases
export { idempotencyManager, IdempotencyManager } from '@/integrations/guesty/idempotency-manager';
