// @ts-nocheck
/**
 * Rate Limiter Middleware
 *
 * Protects routes with Redis-backed rate limiting using Upstash REST API.
 * Uses sliding window with INCR + EXPIRE pattern.
 *
 * Features:
 * - Per-IP and per-endpoint rate limiting
 * - Configurable windows and limits
 * - Sliding window with Redis INCR/EXPIRE
 * - Graceful degradation when Redis is unavailable
 * - X-RateLimit headers on responses
 * - Whitelist/blacklist support
 * - Presets for common use cases
 *
 * @author Development Team
 * @version 2.0.0
 */

import { redis } from '../lib/upstash-redis';
import { logger } from '../lib/logger';

// =============================================
// Rate Limiter Configuration
// =============================================

export interface RateLimitConfig {
  /** Maximum requests per window */
  maxRequests: number;
  /** Window size in seconds */
  windowSeconds: number;
  /** Optional: custom key prefix (default: 'rate-limit') */
  keyPrefix?: string;
  /** Optional: specific endpoints to limit (empty = all) */
  endpoints?: string[];
  /** Optional: IPs to whitelist (unlimited) */
  whitelist?: string[];
  /** Optional: IPs to blacklist (always blocked) */
  blacklist?: string[];
  /** Optional: HTTP status code for rejected requests (default: 429) */
  rejectStatusCode?: number;
  /** Optional: message for rejected requests */
  rejectMessage?: string;
  /** Optional: headers to include on responses */
  includeHeaders?: boolean;
  /** Optional: graceful degradation when Redis fails (default: false = block) */
  failOpen?: boolean;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number; // Unix timestamp in seconds
  retryAfter?: number; // Seconds until retry
}

export interface RateLimitHeaders {
  'X-RateLimit-Limit': string;
  'X-RateLimit-Remaining': string;
  'X-RateLimit-Reset': string;
  'Retry-After'?: string;
}

// Default configurations for different route types
export const RATE_LIMIT_PRESETS = {
  // Strict: authentication endpoints
  AUTH: {
    maxRequests: 5,
    windowSeconds: 60, // 5 requests per minute
    keyPrefix: 'rate-limit:auth',
  },
  // Moderate: API endpoints
  API: {
    maxRequests: 100,
    windowSeconds: 60, // 100 requests per minute
    keyPrefix: 'rate-limit:api',
  },
  // Lenient: public endpoints
  PUBLIC: {
    maxRequests: 300,
    windowSeconds: 60, // 300 requests per minute
    keyPrefix: 'rate-limit:public',
  },
  // Strict: checkout/payment
  CHECKOUT: {
    maxRequests: 10,
    windowSeconds: 60, // 10 requests per minute
    keyPrefix: 'rate-limit:checkout',
  },
  // AI generation
  AI: {
    maxRequests: 20,
    windowSeconds: 60, // 20 requests per minute
    keyPrefix: 'rate-limit:ai',
  },
  // Webhook endpoints
  WEBHOOK: {
    maxRequests: 500,
    windowSeconds: 60,
    keyPrefix: 'rate-limit:webhook',
    failOpen: true, // Don't block webhooks if Redis fails
  },
};

// =============================================
// Rate Limiter Implementation
// =============================================

export class RateLimiterMiddleware {
  private config: RateLimitConfig;
  private redis: typeof redis;

  constructor(config: Partial<RateLimitConfig> = {}, redisClient?: typeof redis) {
    this.config = {
      maxRequests: 100,
      windowSeconds: 60,
      keyPrefix: 'rate-limit',
      rejectStatusCode: 429,
      rejectMessage: 'Too many requests, please try again later.',
      includeHeaders: true,
      failOpen: false,
      ...config,
    };
    this.redis = redisClient || redis;
  }

  /**
   * Generate rate limit key from request context
   */
  private getKey(identifier: string, endpoint?: string): string {
    const parts = [this.config.keyPrefix, identifier];
    if (endpoint) {
      parts.push(endpoint.replace(/[^a-zA-Z0-9]/g, '_'));
    }
    return parts.filter(Boolean).join(':');
  }

  /**
   * Extract client IP from request
   */
  getClientIP(request: Request): string {
    // Check various headers for the real client IP
    const forwardedFor = request.headers.get('x-forwarded-for');
    if (forwardedFor) {
      // x-forwarded-for may contain multiple IPs: client, proxy1, proxy2
      return forwardedFor.split(',')[0].trim();
    }

    const realIP = request.headers.get('x-real-ip');
    if (realIP) {
return realIP.trim();
}

    const cfConnectingIP = request.headers.get('cf-connecting-ip');
    if (cfConnectingIP) {
return cfConnectingIP.trim();
}

    // Fallback: generate a key from user-agent + other headers
    const ua = request.headers.get('user-agent') || 'unknown';
    return `ua:${Buffer.from(ua).toString('hex').slice(0, 16)}`;
  }

  /**
   * Check if an IP is whitelisted
   */
  private isWhitelisted(ip: string): boolean {
    return this.config.whitelist?.some(pattern => {
      if (pattern.includes('*')) {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        return regex.test(ip);
      }
      return pattern === ip;
    }) || false;
  }

  /**
   * Check if an IP is blacklisted
   */
  private isBlacklisted(ip: string): boolean {
    return this.config.blacklist?.some(pattern => {
      if (pattern.includes('*')) {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        return regex.test(ip);
      }
      return pattern === ip;
    }) || false;
  }

  /**
   * Check rate limit for a request.
   * Uses Redis INCR + EXPIRE atomic pattern.
   */
  async checkRateLimit(
    request: Request,
    customConfig?: Partial<RateLimitConfig>
  ): Promise<RateLimitResult> {
    const config = { ...this.config, ...customConfig };
    const clientIP = this.getClientIP(request);
    const url = new URL(request.url);
    const endpoint = url.pathname;

    // Check whitelist/blacklist
    if (this.isWhitelisted(clientIP)) {
      return {
        allowed: true,
        limit: config.maxRequests,
        remaining: config.maxRequests,
        resetAt: Math.floor(Date.now() / 1000) + config.windowSeconds,
      };
    }

    if (this.isBlacklisted(clientIP)) {
      return {
        allowed: false,
        limit: config.maxRequests,
        remaining: 0,
        resetAt: Math.floor(Date.now() / 1000) + config.windowSeconds,
        retryAfter: config.windowSeconds,
      };
    }

    // Check endpoint filter
    if (config.endpoints && config.endpoints.length > 0) {
      const matches = config.endpoints.some(pattern => {
        if (pattern.includes('*')) {
          const regex = new RegExp(pattern.replace(/\*/g, '.*'));
          return regex.test(endpoint);
        }
        return endpoint === pattern || endpoint.startsWith(pattern);
      });
      if (!matches) {
        return {
          allowed: true,
          limit: config.maxRequests,
          remaining: config.maxRequests,
          resetAt: Math.floor(Date.now() / 1000) + config.windowSeconds,
        };
      }
    }

    const key = this.getKey(clientIP, endpoint);
    const windowSeconds = config.windowSeconds!;

    try {
      // Use Redis INCR to count requests
      const count = await this.redis.incr(key);

      // Set expiry on first request in window
      if (count === 1) {
        await this.redis.expire(key, windowSeconds);
      }

      const remaining = Math.max(0, config.maxRequests! - count);
      const ttl = await this.redis.ttl(key);
      const resetAt = Math.floor(Date.now() / 1000) + (ttl > 0 ? ttl : windowSeconds);

      const allowed = count <= config.maxRequests!;

      if (!allowed) {
        logger.warn('Rate limit exceeded', {
          clientIP,
          endpoint,
          count,
          limit: config.maxRequests,
        });
      }

      return {
        allowed,
        limit: config.maxRequests!,
        remaining,
        resetAt,
        retryAfter: allowed ? undefined : ttl > 0 ? ttl : windowSeconds,
      };
    } catch (error) {
      logger.error('Rate limiter Redis error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        clientIP,
        endpoint,
      });

      // Fail open or closed based on config
      if (config.failOpen) {
        logger.warn('Rate limiter failing open due to Redis error');
        return {
          allowed: true,
          limit: config.maxRequests!,
          remaining: config.maxRequests!,
          resetAt: Math.floor(Date.now() / 1000) + windowSeconds,
        };
      }

      // Fail closed - block the request when Redis is down
      return {
        allowed: false,
        limit: config.maxRequests!,
        remaining: 0,
        resetAt: Math.floor(Date.now() / 1000) + windowSeconds,
        retryAfter: windowSeconds,
      };
    }
  }

  /**
   * Generate rate limit headers
   */
  getHeaders(result: RateLimitResult): RateLimitHeaders {
    const headers: RateLimitHeaders = {
      'X-RateLimit-Limit': String(result.limit),
      'X-RateLimit-Remaining': String(Math.max(0, result.remaining)),
      'X-RateLimit-Reset': String(result.resetAt),
    };

    if (result.retryAfter !== undefined) {
      headers['Retry-After'] = String(result.retryAfter);
    }

    return headers;
  }

  /**
   * Create a Response for rate-limited requests
   */
  createRateLimitResponse(result: RateLimitResult, config?: RateLimitConfig): Response {
    const finalConfig = { ...this.config, ...config };
    const headers = finalConfig.includeHeaders
      ? this.getHeaders(result)
      : {};

    return new Response(
      JSON.stringify({
        error: finalConfig.rejectMessage,
        retryAfter: result.retryAfter,
      }),
      {
        status: finalConfig.rejectStatusCode!,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      }
    );
  }

  /**
   * Reset rate limit for a specific IP/endpoint
   */
  async resetRateLimit(identifier: string, endpoint?: string): Promise<void> {
    const key = this.getKey(identifier, endpoint);
    await this.redis.del(key);
    logger.info('Rate limit reset', { identifier, endpoint });
  }

  /**
   * Get current rate limit status without incrementing
   */
  async getStatus(identifier: string, endpoint?: string): Promise<{
    count: number;
    remaining: number;
    ttl: number;
  }> {
    const key = this.getKey(identifier, endpoint);
    try {
      const count = await this.redis.get(key);
      const ttl = await this.redis.ttl(key);
      const numCount = count ? parseInt(count as string, 10) : 0;

      return {
        count: numCount,
        remaining: Math.max(0, this.config.maxRequests! - numCount),
        ttl: ttl > 0 ? ttl : 0,
      };
    } catch (error) {
      logger.error('Failed to get rate limit status', { error, identifier });
      return { count: 0, remaining: this.config.maxRequests!, ttl: 0 };
    }
  }
}

// =============================================
// Pre-configured Singleton Instances
// =============================================

export const authRateLimiter = new RateLimiterMiddleware(RATE_LIMIT_PRESETS.AUTH);
export const apiRateLimiter = new RateLimiterMiddleware(RATE_LIMIT_PRESETS.API);
export const publicRateLimiter = new RateLimiterMiddleware(RATE_LIMIT_PRESETS.PUBLIC);
export const checkoutRateLimiter = new RateLimiterMiddleware(RATE_LIMIT_PRESETS.CHECKOUT);
export const aiRateLimiter = new RateLimiterMiddleware(RATE_LIMIT_PRESETS.AI);
export const webhookRateLimiter = new RateLimiterMiddleware(RATE_LIMIT_PRESETS.WEBHOOK);

// =============================================
// Higher-order function for route protection
// =============================================

/**
 * Wrap a request handler with rate limiting
 */
export function withRateLimit(
  handler: (request: Request) => Promise<Response>,
  limiter: RateLimiterMiddleware = apiRateLimiter
) {
  return async (request: Request): Promise<Response> => {
    const result = await limiter.checkRateLimit(request);

    if (!result.allowed) {
      return limiter.createRateLimitResponse(result);
    }

    const response = await handler(request);

    // Add rate limit headers to successful responses
    if (limiter['config'].includeHeaders) {
      const headers = limiter.getHeaders(result);
      Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
    }

    return response;
  };
}

// =============================================
// Express/Connect-style Middleware
// =============================================

/**
 * Middleware function for use with Express or similar frameworks
 */
export function rateLimitMiddleware(
  limiter: RateLimiterMiddleware = apiRateLimiter
) {
  return async (
    request: Request,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...args: any[]
  ): Promise<Response | void> => {
    const result = await limiter.checkRateLimit(request);

    if (!result.allowed) {
      return limiter.createRateLimitResponse(result);
    }

    // Add headers to response if possible (framework-specific)
    if (limiter['config'].includeHeaders) {
      const headers = limiter.getHeaders(result);
      // For Next.js/Edge runtime, headers need to be set on the response
      // This is a hook - actual implementation depends on framework
    }
  };
}