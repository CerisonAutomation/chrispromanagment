// @ts-nocheck
/**
 * Guesty Cache Middleware
 * 
 * Implements intelligent caching with TTL and invalidation
 * Provides stale-while-revalidate strategy
 * Manages cache keys and invalidation logic
 * 
 * Features:
 * - Cache key generation
 * - TTL management
 * - Cache invalidation on mutations
 * - Stale-while-revalidate
 * - Cache statistics
 * 
 * @author Development Team
 * @version 1.0.0
 */

import { logger } from '@/lib/logger';

// =============================================
// Cache Configuration
// =============================================

export interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  staleWhileRevalidate: boolean;
  maxEntries: number;
  persistToStorage: boolean;
  storageKey?: string;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
  lastAccessed: number;
}

export interface CacheStats {
  totalGets: number;
  totalSets: number;
  totalDeletes: number;
  hits: number;
  misses: number;
  hitRate: number;
  currentSize: number;
  maxEntries: number;
}

// Default TTL configurations
export const CACHE_TTL = {
  PROPERTY_DATA: 5 * 60 * 1000, // 5 minutes
  CALENDAR_DATA: 2 * 60 * 1000, // 2 minutes
  QUOTE_DATA: 15 * 60 * 1000, // 15 minutes (matches Guesty quote expiry)
  RESERVATION_DATA: 60 * 60 * 1000, // 1 hour
  PRICING_DATA: 10 * 60 * 1000, // 10 minutes
  LISTINGS_DATA: 5 * 60 * 1000, // 5 minutes
};

// =============================================
// Cache Implementation
// =============================================

export class GuestyCacheMiddleware {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private config: CacheConfig;
  private stats = {
    totalGets: 0,
    totalSets: 0,
    totalDeletes: 0,
    hits: 0,
    misses: 0,
  };

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      ttl: CACHE_TTL.PROPERTY_DATA,
      staleWhileRevalidate: true,
      maxEntries: 1000,
      persistToStorage: false,
      ...config,
    };

    // Load from storage if enabled
    if (this.config.persistToStorage && this.config.storageKey) {
      this.loadFromStorage();
    }

    // Periodic cleanup
    setInterval(() => this.cleanup(), 60 * 1000); // Every minute
  }

  /**
   * Generate cache key from parameters
   */
  generateCacheKey(prefix: string, params: Record<string, unknown>): string {
    const paramString = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|');
    return `${prefix}:${paramString}`;
  }

  /**
   * Generate cache key for listings
   */
  generateListingsKey(filters: Record<string, unknown> = {}): string {
    return this.generateCacheKey('guesty:listings', filters);
  }

  /**
   * Generate cache key for single listing
   */
  generateListingKey(listingId: string): string {
    return `guesty:listing:${listingId}`;
  }

  /**
   * Generate cache key for calendar
   */
  generateCalendarKey(listingId: string, from: string, to: string): string {
    return this.generateCacheKey('guesty:calendar', { listingId, from, to });
  }

  /**
   * Generate cache key for quote
   */
  generateQuoteKey(quoteId: string): string {
    return `guesty:quote:${quoteId}`;
  }

  /**
   * Generate cache key for reservation
   */
  generateReservationKey(reservationId: string): string {
    return `guesty:reservation:${reservationId}`;
  }

  /**
   * Generate cache key for pricing
   */
  generatePricingKey(listingId: string, dates: { checkIn: string; checkOut: string }): string {
    return this.generateCacheKey('guesty:pricing', { listingId, ...dates });
  }

  /**
   * Set cache entry
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.ttl,
      hits: 0,
      lastAccessed: Date.now(),
    };

    // Enforce max entries
    if (this.cache.size >= this.config.maxEntries) {
      this.evictLRU();
    }

    this.cache.set(key, entry as CacheEntry<unknown>);
    this.stats.totalSets++;

    // Persist to storage if enabled
    if (this.config.persistToStorage) {
      this.saveToStorage();
    }

    logger.debug('Cache set', { key, ttl: entry.ttl });
  }

  /**
   * Get cache entry
   */
  get<T>(key: string): T | null {
    this.stats.totalGets++;

    const entry = this.cache.get(key);
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    const now = Date.now();
    const age = now - entry.timestamp;

    // Check if expired
    if (age > entry.ttl) {
      // If stale-while-revalidate is enabled, return stale data
      if (this.config.staleWhileRevalidate && age < entry.ttl * 2) {
        entry.hits++;
        entry.lastAccessed = now;
        logger.debug('Cache hit (stale)', { key, age });
        this.stats.hits++;
        return entry.data as T;
      }

      // Otherwise, delete and return null
      this.delete(key);
      this.stats.misses++;
      return null;
    }

    entry.hits++;
    entry.lastAccessed = now;
    this.stats.hits++;
    logger.debug('Cache hit', { key, age });
    return entry.data as T;
  }

  /**
   * Check if key exists and is valid
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) {
return false;
}

    const now = Date.now();
    const age = now - entry.timestamp;

    if (age > entry.ttl) {
      if (this.config.staleWhileRevalidate && age < entry.ttl * 2) {
        return true; // Stale but within revalidate window
      }
      this.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete cache entry
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.totalDeletes++;
      logger.debug('Cache delete', { key });
    }
    return deleted;
  }

  /**
   * Delete multiple keys by pattern
   */
  deletePattern(pattern: string): number {
    let deleted = 0;
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.delete(key);
        deleted++;
      }
    }

    logger.info('Cache pattern delete', { pattern, deleted });
    return deleted;
  }

  /**
   * Clear all cache
   */
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    this.stats.totalDeletes += size;
    logger.info('Cache cleared', { size });
  }

  /**
   * Evict least recently used entry
   */
  private evictLRU(): void {
    let lruKey: string | null = null;
    let lruTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < lruTime) {
        lruTime = entry.lastAccessed;
        lruKey = key;
      }
    }

    if (lruKey) {
      this.delete(lruKey);
      logger.debug('Cache evicted LRU', { key: lruKey });
    }
  }

  /**
   * Cleanup expired entries
   */
  cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      const age = now - entry.timestamp;
      // Only delete if beyond stale-while-revalidate window
      if (age > entry.ttl * 2) {
        this.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.info('Cache cleanup completed', { cleaned });
    }
  }

  /**
   * Invalidate cache for listing changes
   */
  invalidateListing(listingId: string): void {
    this.delete(this.generateListingKey(listingId));
    this.deletePattern(`guesty:calendar:*listingId:${listingId}*`);
    this.deletePattern(`guesty:pricing:*listingId:${listingId}*`);
    // Also invalidate listings cache as it may contain this listing
    this.deletePattern('guesty:listings:*');
    logger.info('Cache invalidated for listing', { listingId });
  }

  /**
   * Invalidate cache for booking changes
   */
  invalidateBooking(reservationId: string, listingId?: string): void {
    this.delete(this.generateReservationKey(reservationId));
    if (listingId) {
      this.invalidateListing(listingId);
    }
    this.deletePattern('guesty:calendar:*');
    logger.info('Cache invalidated for booking', { reservationId, listingId });
  }

  /**
   * Invalidate cache for quote changes
   */
  invalidateQuote(quoteId: string): void {
    this.delete(this.generateQuoteKey(quoteId));
    logger.info('Cache invalidated for quote', { quoteId });
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const totalRequests = this.stats.totalGets;
    const hitRate = totalRequests > 0 ? this.stats.hits / totalRequests : 0;

    return {
      totalGets: this.stats.totalGets,
      totalSets: this.stats.totalSets,
      totalDeletes: this.stats.totalDeletes,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate,
      currentSize: this.cache.size,
      maxEntries: this.config.maxEntries,
    };
  }

  /**
   * Save cache to localStorage
   */
  private saveToStorage(): void {
    if (!this.config.storageKey) {
return;
}

    try {
      const serialized = JSON.stringify(Array.from(this.cache.entries()));
      localStorage.setItem(this.config.storageKey, serialized);
    } catch (error) {
      logger.error('Failed to save cache to storage', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Load cache from localStorage
   */
  private loadFromStorage(): void {
    if (!this.config.storageKey) {
return;
}

    try {
      const serialized = localStorage.getItem(this.config.storageKey);
      if (serialized) {
        const entries = JSON.parse(serialized);
        this.cache = new Map(entries);
        logger.info('Cache loaded from storage', { entries: entries.length });
      }
    } catch (error) {
      logger.error('Failed to load cache from storage', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Reset cache and statistics
   */
  reset(): void {
    this.cache.clear();
    this.stats = {
      totalGets: 0,
      totalSets: 0,
      totalDeletes: 0,
      hits: 0,
      misses: 0,
    };
    logger.info('Cache reset');
  }
}

// Singleton instances for different cache types
export const propertyCache = new GuestyCacheMiddleware({
  ttl: CACHE_TTL.PROPERTY_DATA,
  staleWhileRevalidate: true,
  maxEntries: 500,
  persistToStorage: true,
  storageKey: 'guesty-property-cache',
});

export const calendarCache = new GuestyCacheMiddleware({
  ttl: CACHE_TTL.CALENDAR_DATA,
  staleWhileRevalidate: true,
  maxEntries: 1000,
  persistToStorage: false, // Calendar changes frequently, don't persist
});

export const quoteCache = new GuestyCacheMiddleware({
  ttl: CACHE_TTL.QUOTE_DATA,
  staleWhileRevalidate: false, // Don't serve stale quotes
  maxEntries: 100,
  persistToStorage: false, // Security: don't persist quotes
});

export const reservationCache = new GuestyCacheMiddleware({
  ttl: CACHE_TTL.RESERVATION_DATA,
  staleWhileRevalidate: true,
  maxEntries: 500,
  persistToStorage: true,
  storageKey: 'guesty-reservation-cache',
});

// =============================================
// Cache Hooks
// =============================================

/**
 * Hook to cache and fetch Guesty data with automatic invalidation
 */
export function useGuestyCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  cache: GuestyCacheMiddleware = propertyCache,
  options: {
    enabled?: boolean;
    staleTime?: number;
  } = {}
) {
  const [data, setData] = React.useState<T | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const { enabled = true, staleTime = 0 } = options;

  React.useEffect(() => {
    if (!enabled) {
return;
}

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Try cache first
        const cached = cache.get<T>(key);
        if (cached) {
          setData(cached);
          setIsLoading(false);
          return;
        }

        // Fetch fresh data
        const fresh = await fetcher();
        cache.set(key, fresh);
        setData(fresh);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [key, enabled]);

  // Stale-while-revalidate
  React.useEffect(() => {
    if (!data || !enabled) {
return;
}

    const revalidate = async () => {
      try {
        const fresh = await fetcher();
        cache.set(key, fresh);
        setData(fresh);
      } catch (err) {
        logger.error('Cache revalidation failed', {
          key,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    };

    if (staleTime > 0) {
      const timeout = setTimeout(revalidate, staleTime);
      return () => clearTimeout(timeout);
    }
  }, [data, key, staleTime, enabled]);

  return { data, isLoading, error, invalidate: () => cache.delete(key) };
}