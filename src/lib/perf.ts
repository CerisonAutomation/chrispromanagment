// @ts-nocheck
// src/lib/perf.ts — comprehensive performance and caching utilities
// Merged from perf.ts + performance-optimizer.ts

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number | undefined;
  hits: number;
}

interface CacheStats {
  size: number;
  hits: number;
  misses: number;
  hitRate: number;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: Date;
  tags?: Record<string, string>;
}

export interface OptimizationSuggestion {
  type: 'caching' | 'lazy_loading' | 'debouncing' | 'throttling' | 'code_splitting';
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'easy' | 'medium' | 'hard';
  codeExample?: string;
}

export class MemoryCache<T = unknown> {
  private cache = new Map<string, CacheEntry<T>>();
  private stats = { hits: 0, misses: 0 };

  set(key: string, value: T, ttl?: number) {
    this.cache.set(key, { data: value, timestamp: Date.now(), ttl, hits: 0 });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
 this.stats.misses++; return null; 
}
    if (entry.ttl && Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key); this.stats.misses++; return null;
    }
    entry.hits++; this.stats.hits++; return entry.data;
  }

  has(key: string) {
 return this.get(key) != null; 
}
  delete(key: string) {
 this.cache.delete(key); 
}
  clear() {
 this.cache.clear(); this.stats = { hits: 0, misses: 0 }; 
}

  getStats(): CacheStats {
    const t = this.stats.hits + this.stats.misses;
    return { size: this.cache.size, hits: this.stats.hits, misses: this.stats.misses, hitRate: t > 0 ? this.stats.hits / t : 0 };
  }

  invalidate(pattern: string | RegExp) {
    if (typeof pattern === "string") {
return this.delete(pattern);
}
    for (const k of this.cache.keys()) {
if (pattern.test(k)) {
this.delete(k);
}
}
  }
}

export class RequestDeduplicator {
  private pending = new Map<string, Promise<unknown>>();

  async deduplicate<T>(key: string, op: () => Promise<T>): Promise<T> {
    if (this.pending.has(key)) {
return this.pending.get(key) as Promise<T>;
}
    const p = op().finally(() => this.pending.delete(key));
    this.pending.set(key, p);
    return p;
  }

  clear() {
 this.pending.clear(); 
}
}

const pageCache = new MemoryCache();
const blockCache = new MemoryCache();
const bookingCache = new MemoryCache();
export const dedup = new RequestDeduplicator();
export const caches = { pages: pageCache, blocks: blockCache, bookings: bookingCache };

export function invalidateCache(type: keyof typeof caches, pattern?: string) {
  const c = caches[type]; if (!c) {
return;
}
  if (pattern) {
c.invalidate(new RegExp(pattern));
} else {
c.clear();
}
}

export function getCacheStats() {
  return { pages: pageCache.getStats(), blocks: blockCache.getStats(), bookings: bookingCache.getStats() };
}

export function clearAllCaches() {
 pageCache.clear(); blockCache.clear(); bookingCache.clear();
}

// ============================================================================
// Performance Monitor and Advanced Cache Management (merged from performance-optimizer.ts)
// ============================================================================

export class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observers = new Map<string, PerformanceObserver>();

  startOperation(name: string, tags?: Record<string, string>): () => void {
    const startTime = performance.now();
    return () => {
      const duration = performance.now() - startTime;
      this.recordMetric({
        name,
        value: duration,
        timestamp: new Date(),
        tags,
      });
    };
  }

  recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    if (this.metrics.length > 1000) {
      this.metrics.shift();
    }
  }

  getMetrics(name: string): PerformanceMetric[] {
    return this.metrics.filter((m) => m.name === name);
  }

  getAveragePerformance(name: string): number {
    const metrics = this.getMetrics(name);
    if (metrics.length === 0) return 0;
    const total = metrics.reduce((sum, m) => sum + m.value, 0);
    return total / metrics.length;
  }

  getPercentile(name: string, percentile: number): number {
    const metrics = this.getMetrics(name)
      .map((m) => m.value)
      .sort((a, b) => a - b);
    if (metrics.length === 0) return 0;
    const index = Math.ceil((percentile / 100) * metrics.length) - 1;
    return metrics[index];
  }

  getPerformanceSummary(): Record<string, { avg: number; p95: number; p99: number; count: number }> {
    const operations = [...new Set(this.metrics.map((m) => m.name))];
    const summary: Record<string, { avg: number; p95: number; p99: number; count: number }> = {};
    for (const operation of operations) {
      summary[operation] = {
        avg: this.getAveragePerformance(operation),
        p95: this.getPercentile(operation, 95),
        p99: this.getPercentile(operation, 99),
        count: this.getMetrics(operation).length,
      };
    }
    return summary;
  }

  clearMetrics(): void {
    this.metrics = [];
  }
}

export class CacheManager {
  private cache = new Map<string, CacheEntry<any>>();
  private maxSize = 100;
  private defaultTTL = 5 * 60 * 1000;

  set<T>(key: string, data: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
      hits: 0,
    };
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }
    this.cache.set(key, entry);
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (entry.ttl && Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    entry.hits++;
    return entry.data as T;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  getStats(): {
    size: number;
    totalSize: number;
    hitRate: number;
    entries: Array<{ key: string; hits: number; size: number }>;
  } {
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      hits: entry.hits,
      size: JSON.stringify(entry.data).length,
    }));
    const totalSize = entries.reduce((sum, e) => sum + e.size, 0);
    const totalHits = entries.reduce((sum, e) => sum + e.hits, 0);
    const hitRate = totalHits > 0 ? totalHits / this.cache.size : 0;
    return { size: this.cache.size, totalSize, hitRate, entries };
  }

  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;
    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }
    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  cleanupExpired(): number {
    const now = Date.now();
    let cleaned = 0;
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl!) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    return cleaned;
  }
}

export class Debouncer {
  private timers = new Map<string, NodeJS.Timeout>();

  debounce<T extends (...args: unknown[]) => unknown>(
    key: string,
    fn: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    return (...args: Parameters<T>) => {
      const existingTimer = this.timers.get(key);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }
      const timer = setTimeout(() => {
        fn(...args);
        this.timers.delete(key);
      }, delay);
      this.timers.set(key, timer);
    };
  }

  cancel(key: string): void {
    const timer = this.timers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(key);
    }
  }

  clear(): void {
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
  }
}

export class Throttler {
  private lastCallTimes = new Map<string, number>();
  private queues = new Map<string, Array<() => void>>();

  throttle<T extends (...args: unknown[]) => unknown>(
    key: string,
    fn: T,
    limit: number,
    interval: number
  ): (...args: Parameters<T>) => void {
    return (...args: Parameters<T>) => {
      const now = Date.now();
      const lastCallTime = this.lastCallTimes.get(key) || 0;
      const timeSinceLastCall = now - lastCallTime;
      if (timeSinceLastCall >= interval) {
        this.lastCallTimes.set(key, now);
        fn(...args);
      } else {
        const queue = this.queues.get(key) || [];
        if (queue.length < limit) {
          queue.push(() => fn(...args));
          this.queues.set(key, queue);
          setTimeout(() => {
            const queuedQueue = this.queues.get(key);
            if (queuedQueue && queuedQueue.length > 0) {
              const queuedFn = queuedQueue.shift();
              if (queuedFn) {
                queuedFn();
                this.lastCallTimes.set(key, Date.now());
              }
            }
          }, interval - timeSinceLastCall);
        }
      }
    };
  }

  clear(key: string): void {
    this.lastCallTimes.delete(key);
    this.queues.delete(key);
  }

  clearAll(): void {
    this.lastCallTimes.clear();
    this.queues.clear();
  }
}

export class MemoryMonitor {
  private history: { timestamp: Date; used: number; total: number }[] = [];

  getCurrentMemoryUsage(): { used: number; total: number; percentage: number } {
    const used = process.memoryUsage().heapUsed / 1024 / 1024;
    const total = process.memoryUsage().heapTotal / 1024 / 1024;
    const percentage = (used / total) * 100;
    return { used, total, percentage };
  }

  recordMemoryUsage(): void {
    const current = this.getCurrentMemoryUsage();
    this.history.push({
      timestamp: new Date(),
      used: current.used,
      total: current.total,
    });
    if (this.history.length > 100) {
      this.history.shift();
    }
  }

  getMemoryTrend(): { average: number; peak: number; trend: 'increasing' | 'decreasing' | 'stable' } {
    if (this.history.length < 2) {
      return { average: 0, peak: 0, trend: 'stable' };
    }
    const usageValues = this.history.map((h) => h.used);
    const average = usageValues.reduce((sum, val) => sum + val, 0) / usageValues.length;
    const peak = Math.max(...usageValues);
    const recent = usageValues.slice(-10);
    const older = usageValues.slice(-20, -10);
    const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
    const olderAvg = older.reduce((sum, val) => sum + val, 0) / older.length;
    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (recentAvg > olderAvg * 1.1) {
      trend = 'increasing';
    } else if (recentAvg < olderAvg * 0.9) {
      trend = 'decreasing';
    }
    return { average, peak, trend };
  }

  isMemoryCritical(threshold: number = 90): boolean {
    const current = this.getCurrentMemoryUsage();
    return current.percentage > threshold;
  }

  forceGC(): void {
    if (global.gc) {
      global.gc();
    }
  }

  clearHistory(): void {
    this.history = [];
  }
}

export class PerformanceOptimizer {
  private monitor = new PerformanceMonitor();
  private cache = new CacheManager();
  private debouncer = new Debouncer();
  private throttler = new Throttler();
  private memoryMonitor = new MemoryMonitor();

  analyzePerformance(code: string): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];
    if (code.includes('fetch(') || code.includes('axios.') || code.includes('http.')) {
      suggestions.push({
        type: 'caching',
        description: 'Consider caching API responses to reduce network requests',
        impact: 'high',
        effort: 'medium',
        codeExample: `const cachedData = cache.get(apiKey); if (cachedData) { return cachedData; } const data = await fetchData(); cache.set(apiKey, data, 5 * 60 * 1000); return data;`,
      });
    }
    if (code.includes('import(') || code.includes('require(')) {
      suggestions.push({
        type: 'lazy_loading',
        description: 'Consider lazy loading modules to reduce initial bundle size',
        impact: 'medium',
        effort: 'easy',
        codeExample: `const LazyComponent = lazy(() => import('./HeavyComponent')); <Suspense fallback={<Loading />}><LazyComponent /></Suspense>`,
      });
    }
    if (code.includes('addEventListener') || code.includes('onChange') || code.includes('onInput')) {
      suggestions.push({
        type: 'debouncing',
        description: 'Consider debouncing frequent event handlers like search inputs',
        impact: 'high',
        effort: 'easy',
        codeExample: `const debouncedSearch = debounce('search', handleSearch, 300); input.addEventListener('input', debouncedSearch);`,
      });
    }
    if (code.includes('resize') || code.includes('scroll')) {
      suggestions.push({
        type: 'throttling',
        description: 'Consider throttling resize/scroll handlers to improve performance',
        impact: 'high',
        effort: 'easy',
        codeExample: `const throttledScroll = throttle('scroll', handleScroll, 100); window.addEventListener('scroll', throttledScroll);`,
      });
    }
    return suggestions;
  }

  getMonitor(): PerformanceMonitor {
    return this.monitor;
  }

  getCache(): CacheManager {
    return this.cache;
  }

  getDebouncer(): Debouncer {
    return this.debouncer;
  }

  getThrottler(): Throttler {
    return this.throttler;
  }

  getMemoryMonitor(): MemoryMonitor {
    return this.memoryMonitor;
  }

  async runPerformanceCheck(): Promise<{
    metrics: Record<string, { avg: number; p95: number; p99: number; count: number }>;
    cache: ReturnType<CacheManager['getStats']>;
    memory: ReturnType<MemoryMonitor['getCurrentMemoryUsage']>;
    suggestions: OptimizationSuggestion[];
  }> {
    return {
      metrics: this.monitor.getPerformanceSummary(),
      cache: this.cache.getStats(),
      memory: this.memoryMonitor.getCurrentMemoryUsage(),
      suggestions: [],
    };
  }
}

export const performanceOptimizer = new PerformanceOptimizer();