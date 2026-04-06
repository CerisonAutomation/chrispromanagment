// =============================================================================
// LRU Cache - Production-grade with TTL and size limits
// =============================================================================
// Combines best patterns from workspace-c3a9a77d (Guesty caching) + proper eviction

export interface CacheEntry<T> {
  readonly data: T;
  readonly expiresAt: number;
  readonly size: number;
  readonly accessCount: number;
  readonly lastAccessed: number;
}

export interface CacheStats {
  readonly size: number;
  readonly maxSize: number;
  readonly entryCount: number;
  readonly hitCount: number;
  readonly missCount: number;
  readonly evictionCount: number;
  readonly hitRate: number;
}

export interface CacheOptions {
  readonly maxSize?: number;        // Max entries (default: 1000)
  readonly maxMemoryMB?: number;    // Max memory in MB (default: 50)
  readonly defaultTTLMs?: number;    // Default TTL in ms (default: 5 min)
  readonly checkIntervalMs?: number; // Cleanup interval (default: 30s)
}

export class LRUCache<T = unknown> {
  private readonly store = new Map<string, CacheEntry<T>>();
  private readonly maxSize: number;
  private readonly maxMemoryBytes: number;
  private readonly defaultTTLMs: number;
  private hitCount = 0;
  private missCount = 0;
  private evictionCount = 0;
  private currentMemoryBytes = 0;
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;

  constructor(options: CacheOptions = {}) {
    this.maxSize = options.maxSize ?? 1000;
    this.maxMemoryBytes = (options.maxMemoryMB ?? 50) * 1024 * 1024;
    this.defaultTTLMs = options.defaultTTLMs ?? 5 * 60 * 1000;

    // Start periodic cleanup
    const interval = options.checkIntervalMs ?? 30000;
    this.cleanupTimer = setInterval(() => this.cleanup(), interval);
  }

  /**
   * Get item from cache - O(1)
   */
  get<K extends T>(key: string): K | null {
    const entry = this.store.get(key);

    if (!entry) {
      this.missCount++;
      return null;
    }

    // Check expiration
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      this.currentMemoryBytes -= entry.size;
      this.missCount++;
      return null;
    }

    // Update access stats (LRU)
    const updated: CacheEntry<T> = {
      ...entry,
      accessCount: entry.accessCount + 1,
      lastAccessed: Date.now(),
    };
    this.store.set(key, updated);
    this.hitCount++;

    return entry.data as K;
  }

  /**
   * Set item in cache - O(1) with automatic eviction
   */
  set<K extends T>(key: string, data: K, ttlMs?: number): void {
    const size = this.estimateSize(data);
    const expiresAt = Date.now() + (ttlMs ?? this.defaultTTLMs);

    // If item already exists, subtract old size
    const existing = this.store.get(key);
    if (existing) {
      this.currentMemoryBytes -= existing.size;
    }

    // Check if new item would exceed memory limit
    while (
      (this.currentMemoryBytes + size > this.maxMemoryBytes ||
        this.store.size >= this.maxSize) &&
      this.store.size > 0
    ) {
      this.evictLRU();
    }

    const entry: CacheEntry<K> = {
      data,
      expiresAt,
      size,
      accessCount: 0,
      lastAccessed: Date.now(),
    };

    this.store.set(key, entry as CacheEntry<T>);
    this.currentMemoryBytes += size;
  }

  /**
   * Delete item from cache - O(1)
   */
  delete(key: string): boolean {
    const entry = this.store.get(key);
    if (!entry) return false;

    this.store.delete(key);
    this.currentMemoryBytes -= entry.size;
    return true;
  }

  /**
   * Check if key exists and is not expired - O(1)
   */
  has(key: string): boolean {
    const entry = this.store.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.delete(key);
      return false;
    }
    return true;
  }

  /**
   * Get or compute value - "Cache-Aside" pattern
   */
  async getOrCompute<K extends T>(
    key: string,
    compute: () => Promise<K>,
    ttlMs?: number
  ): Promise<K> {
    const cached = this.get<K>(key);
    if (cached !== null) {
      return cached;
    }

    const computed = await compute();
    this.set(key, computed, ttlMs);
    return computed;
  }

  /**
   * Invalidate by pattern - O(n) but rare operation
   */
  invalidate(pattern?: string | RegExp): number {
    if (!pattern) {
      const count = this.store.size;
      this.store.clear();
      this.currentMemoryBytes = 0;
      return count;
    }

    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    let count = 0;

    for (const [key, entry] of this.store.entries()) {
      if (regex.test(key)) {
        this.store.delete(key);
        this.currentMemoryBytes -= entry.size;
        count++;
      }
    }

    return count;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const total = this.hitCount + this.missCount;
    const hitRate = total > 0 ? this.hitCount / total : 0;

    return {
      size: this.currentMemoryBytes,
      maxSize: this.maxMemoryBytes,
      entryCount: this.store.size,
      hitCount: this.hitCount,
      missCount: this.missCount,
      evictionCount: this.evictionCount,
      hitRate: Math.round(hitRate * 100) / 100,
    };
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.store.clear();
    this.currentMemoryBytes = 0;
    this.hitCount = 0;
    this.missCount = 0;
    this.evictionCount = 0;
  }

  /**
   * Dispose cache - stop cleanup timer
   */
  dispose(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.clear();
  }

  /**
   * Get all keys (for debugging)
   */
  keys(): string[] {
    return Array.from(this.store.keys());
  }

  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.store.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.delete(oldestKey);
      this.evictionCount++;
    }
  }

  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
        this.currentMemoryBytes -= entry.size;
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`[LRUCache] Cleaned up ${cleaned} expired entries`);
    }
  }

  private estimateSize(data: unknown): number {
    // Rough estimation for memory usage
    const str = JSON.stringify(data);
    // UTF-16 encoding = 2 bytes per character
    return str.length * 2;
  }
}

// =============================================================================
// Global cache instances
// =============================================================================

export const pageCache = new LRUCache({
  maxSize: 500,
  maxMemoryMB: 20,
  defaultTTLMs: 60_000, // 1 minute for pages
});

export const blockCache = new LRUCache({
  maxSize: 2000,
  maxMemoryMB: 30,
  defaultTTLMs: 30_000, // 30 seconds for blocks
});

export const apiCache = new LRUCache({
  maxSize: 1000,
  maxMemoryMB: 50,
  defaultTTLMs: 300_000, // 5 minutes for API responses
});

// =============================================================================
// Cache decorators
// =============================================================================

export function withCache<T extends (...args: any[]) => Promise<any>>(
  cache: LRUCache,
  keyGenerator: (...args: Parameters<T>) => string,
  ttlMs?: number
) {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: Parameters<T>): Promise<ReturnType<T>> {
      const key = keyGenerator(...args);
      const cached = cache.get<ReturnType<T>>(key);

      if (cached !== null) {
        return cached;
      }

      const result = await originalMethod.apply(this, args);
      cache.set(key, result, ttlMs);
      return result;
    };

    return descriptor;
  };
}
