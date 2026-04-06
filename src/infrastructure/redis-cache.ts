// =============================================================================
// REDIS CACHE INTEGRATION - Upstash/Redis for Production Caching
// =============================================================================
// Compatible with Vercel Edge, Serverless, and Node.js environments

import { DomainError } from '@/domain/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RedisCacheOptions {
  /** Redis REST API URL (Upstash format) */
  url: string;
  /** Redis REST API token */
  token: string;
  /** Default TTL in seconds */
  defaultTTL?: number;
  /** Key prefix for namespace isolation */
  keyPrefix?: string;
}

export interface CacheEntry<T> {
  data: T;
  expiry: number;
  createdAt: number;
}

export interface RedisCacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  hitRate: number;
}

// ---------------------------------------------------------------------------
// Redis Cache Client (Upstash compatible)
// ---------------------------------------------------------------------------

export class RedisCache {
  private url: string;
  private token: string;
  private defaultTTL: number;
  private keyPrefix: string;
  private stats: RedisCacheStats = { hits: 0, misses: 0, sets: 0, deletes: 0, hitRate: 0 };

  constructor(options: RedisCacheOptions) {
    this.url = options.url;
    this.token = options.token;
    this.defaultTTL = options.defaultTTL ?? 3600; // 1 hour default
    this.keyPrefix = options.keyPrefix ?? 'cpm:';
  }

  private getKey(key: string): string {
    return `${this.keyPrefix}${key}`;
  }

  /**
   * Get value from Redis
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const response = await fetch(`${this.url}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(['get', this.getKey(key)]),
      });

      if (!response.ok) {
        throw new Error(`Redis error: ${response.status}`);
      }

      const result = await response.json() as { result: string | null };
      
      if (result.result === null) {
        this.stats.misses++;
        this.updateHitRate();
        return null;
      }

      const parsed = JSON.parse(result.result) as CacheEntry<T>;
      
      // Check expiry
      if (parsed.expiry < Date.now()) {
        this.stats.misses++;
        this.updateHitRate();
        await this.delete(key); // Clean up expired
        return null;
      }

      this.stats.hits++;
      this.updateHitRate();
      return parsed.data;
    } catch (error) {
      // Fall back to memory or return null on error
      console.error('Redis get error:', error);
      return null;
    }
  }

  /**
   * Set value in Redis with TTL
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
    try {
      const entry: CacheEntry<T> = {
        data: value,
        expiry: Date.now() + (ttl ?? this.defaultTTL) * 1000,
        createdAt: Date.now(),
      };

      const response = await fetch(`${this.url}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([
          'set',
          this.getKey(key),
          JSON.stringify(entry),
          'ex', ttl ?? this.defaultTTL
        ]),
      });

      if (!response.ok) {
        throw new Error(`Redis error: ${response.status}`);
      }

      this.stats.sets++;
      return true;
    } catch (error) {
      console.error('Redis set error:', error);
      return false;
    }
  }

  /**
   * Delete key from Redis
   */
  async delete(key: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.url}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(['del', this.getKey(key)]),
      });

      if (!response.ok) {
        throw new Error(`Redis error: ${response.status}`);
      }

      this.stats.deletes++;
      return true;
    } catch (error) {
      console.error('Redis delete error:', error);
      return false;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.url}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(['exists', this.getKey(key)]),
      });

      if (!response.ok) {
        throw new Error(`Redis error: ${response.status}`);
      }

      const result = await response.json() as { result: number };
      return result.result === 1;
    } catch (error) {
      console.error('Redis exists error:', error);
      return false;
    }
  }

  /**
   * Get multiple keys at once
   */
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    try {
      const redisKeys = keys.map(k => this.getKey(k));
      
      const response = await fetch(`${this.url}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(['mget', ...redisKeys]),
      });

      if (!response.ok) {
        throw new Error(`Redis error: ${response.status}`);
      }

      const result = await response.json() as { result: (string | null)[] };
      
      return result.result.map((item) => {
        if (!item) {
          this.stats.misses++;
          return null;
        }

        try {
          const parsed = JSON.parse(item) as CacheEntry<T>;
          if (parsed.expiry < Date.now()) {
            this.stats.misses++;
            return null;
          }
          this.stats.hits++;
          return parsed.data;
        } catch {
          this.stats.misses++;
          return null;
        }
      });
    } catch (error) {
      console.error('Redis mget error:', error);
      return keys.map(() => null);
    }
  }

  /**
   * Set multiple keys at once
   */
  async mset<T>(entries: Record<string, T>, ttl?: number): Promise<boolean> {
    try {
      const pipeline: (string | number)[] = [];
      
      for (const [key, value] of Object.entries(entries)) {
        const entry: CacheEntry<T> = {
          data: value,
          expiry: Date.now() + (ttl ?? this.defaultTTL) * 1000,
          createdAt: Date.now(),
        };
        pipeline.push('set', this.getKey(key), JSON.stringify(entry), 'ex', ttl ?? this.defaultTTL);
      }

      const response = await fetch(`${this.url}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pipeline),
      });

      if (!response.ok) {
        throw new Error(`Redis error: ${response.status}`);
      }

      this.stats.sets += Object.keys(entries).length;
      return true;
    } catch (error) {
      console.error('Redis mset error:', error);
      return false;
    }
  }

  /**
   * Invalidate keys by pattern
   */
  async invalidatePattern(pattern: string): Promise<number> {
    try {
      // Use SCAN to find matching keys (Upstash)
      const scanResponse = await fetch(`${this.url}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(['scan', '0', 'match', `${this.getKey(pattern)}*`, 'count', '100']),
      });

      if (!scanResponse.ok) {
        throw new Error(`Redis scan error: ${scanResponse.status}`);
      }

      const scanResult = await scanResponse.json() as { result: [string, string[]] };
      const keys = scanResult.result[1];

      if (keys.length === 0) return 0;

      // Delete all found keys
      const deleteResponse = await fetch(`${this.url}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(['del', ...keys]),
      });

      if (!deleteResponse.ok) {
        throw new Error(`Redis delete error: ${deleteResponse.status}`);
      }

      this.stats.deletes += keys.length;
      return keys.length;
    } catch (error) {
      console.error('Redis invalidate pattern error:', error);
      return 0;
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): RedisCacheStats {
    return { ...this.stats };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = { hits: 0, misses: 0, sets: 0, deletes: 0, hitRate: 0 };
  }

  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
  }

  /**
   * Close connection (no-op for HTTP-based Redis)
   */
  async close(): Promise<void> {
    // No-op for Upstash HTTP client
  }
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

let redisCacheInstance: RedisCache | null = null;

export function createRedisCache(options: RedisCacheOptions): RedisCache {
  return new RedisCache(options);
}

export function getRedisCache(): RedisCache | null {
  return redisCacheInstance;
}

export function initRedisCache(options: RedisCacheOptions): RedisCache {
  redisCacheInstance = new RedisCache(options);
  return redisCacheInstance;
}

// ---------------------------------------------------------------------------
// Cache Decorator - Wrap any function with Redis caching
// ---------------------------------------------------------------------------

export function cachedFunction<T extends (...args: unknown[]) => Promise<unknown>>(
  cache: RedisCache,
  options: {
    /** Cache key generator */
    keyGenerator: (...args: Parameters<T>) => string;
    /** TTL in seconds */
    ttl?: number;
    /** Whether to stale-while-revalidate */
    swr?: boolean;
    /** SWR TTL in seconds */
    swrTTL?: number;
  }
): T {
  return (async (...args: Parameters<T>) => {
    const key = options.keyGenerator(...args);
    
    // Try to get from cache
    const cached = await cache.get(key);
    if (cached !== null) {
      return cached;
    }

    // Execute function
    const result = await (...args as Parameters<T>)();
    
    // Store in cache
    await cache.set(key, result, options.ttl);
    
    return result;
  }) as T;
}

// ---------------------------------------------------------------------------
// Vercel Edge Runtime Support
// ---------------------------------------------------------------------------

export interface EdgeRedisOptions {
  url: string;
  token: string;
}

/**
 * Create Redis cache compatible with Vercel Edge Runtime
 */
export function createEdgeRedisCache(options: EdgeRedisOptions): RedisCache {
  return new RedisCache({
    url: options.url,
    token: options.token,
    defaultTTL: 3600,
    keyPrefix: 'cpm:edge:',
  });
}

// ---------------------------------------------------------------------------
// Default Export
// ---------------------------------------------------------------------------

export default {
  RedisCache,
  createRedisCache,
  getRedisCache,
  initRedisCache,
  cachedFunction,
  createEdgeRedisCache,
};