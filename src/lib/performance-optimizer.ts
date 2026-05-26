// Performance Optimization and Scalability Framework
// Enterprise-grade performance monitoring, caching, and optimization strategies

export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: Date;
  tags?: Record<string, string>;
}

export interface CacheEntry<T = unknown> {
  data: T;
  timestamp: Date;
  ttl: number;
  hits: number;
  size: number;
}

export interface OptimizationSuggestion {
  type: 'caching' | 'lazy_loading' | 'debouncing' | 'throttling' | 'code_splitting';
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'easy' | 'medium' | 'hard';
  codeExample?: string;
}

/**
 * Performance Monitor
 */
export class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observers = new Map<string, PerformanceObserver>();

  /**
   * Start monitoring a specific operation
   */
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

  /**
   * Record a performance metric
   */
  recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);

    // Keep only last 1000 metrics to prevent memory issues
    if (this.metrics.length > 1000) {
      this.metrics.shift();
    }
  }

  /**
   * Get metrics for a specific operation
   */
  getMetrics(name: string): PerformanceMetric[] {
    return this.metrics.filter((m) => m.name === name);
  }

  /**
   * Get average performance for an operation
   */
  getAveragePerformance(name: string): number {
    const metrics = this.getMetrics(name);
    if (metrics.length === 0) return 0;

    const total = metrics.reduce((sum, m) => sum + m.value, 0);
    return total / metrics.length;
  }

  /**
   * Get performance percentile
   */
  getPercentile(name: string, percentile: number): number {
    const metrics = this.getMetrics(name)
      .map((m) => m.value)
      .sort((a, b) => a - b);

    if (metrics.length === 0) return 0;

    const index = Math.ceil((percentile / 100) * metrics.length) - 1;
    return metrics[index];
  }

  /**
   * Get performance summary
   */
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

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics = [];
  }
}

/**
 * Advanced Cache Manager
 */
export class CacheManager {
  private cache = new Map<string, CacheEntry>();
  private maxSize = 100; // Maximum number of entries
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Set a value in cache
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: new Date(),
      ttl: ttl || this.defaultTTL,
      hits: 0,
      size: JSON.stringify(data).length,
    };

    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    this.cache.set(key, entry);
  }

  /**
   * Get a value from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp.getTime() > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Increment hit counter
    entry.hits++;
    return entry.data as T;
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Delete a key from cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    totalSize: number;
    hitRate: number;
    entries: Array<{ key: string; hits: number; size: number }>;
  } {
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      hits: entry.hits,
      size: entry.size,
    }));

    const totalSize = entries.reduce((sum, e) => sum + e.size, 0);
    const totalHits = entries.reduce((sum, e) => sum + e.hits, 0);
    const hitRate = totalHits > 0 ? totalHits / this.cache.size : 0;

    return {
      size: this.cache.size,
      totalSize,
      hitRate,
      entries,
    };
  }

  /**
   * Evict least recently used entry
   */
  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp.getTime() < oldestTime) {
        oldestTime = entry.timestamp.getTime();
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Clean up expired entries
   */
  cleanupExpired(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp.getTime() > entry.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    return cleaned;
  }
}

/**
 * Request Debouncer
 */
export class Debouncer {
  private timers = new Map<string, NodeJS.Timeout>();

  /**
   * Debounce a function call
   */
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

  /**
   * Cancel a pending debounced call
   */
  cancel(key: string): void {
    const timer = this.timers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(key);
    }
  }

  /**
   * Clear all pending debounced calls
   */
  clear(): void {
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
  }
}

/**
 * Request Throttler
 */
export class Throttler {
  private lastCallTimes = new Map<string, number>();
  private queues = new Map<string, Array<() => void>>();

  /**
   * Throttle a function call
   */
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
        // Queue the call if under limit
        const queue = this.queues.get(key) || [];
        if (queue.length < limit) {
          queue.push(() => fn(...args));
          this.queues.set(key, queue);

          // Schedule the queued call
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

  /**
   * Clear throttle state for a key
   */
  clear(key: string): void {
    this.lastCallTimes.delete(key);
    this.queues.delete(key);
  }

  /**
   * Clear all throttle state
   */
  clearAll(): void {
    this.lastCallTimes.clear();
    this.queues.clear();
  }
}

/**
 * Memory Usage Monitor
 */
export class MemoryMonitor {
  private history: { timestamp: Date; used: number; total: number }[] = [];

  /**
   * Get current memory usage
   */
  getCurrentMemoryUsage(): { used: number; total: number; percentage: number } {
    const used = process.memoryUsage().heapUsed / 1024 / 1024;
    const total = process.memoryUsage().heapTotal / 1024 / 1024;
    const percentage = (used / total) * 100;

    return { used, total, percentage };
  }

  /**
   * Record memory usage
   */
  recordMemoryUsage(): void {
    const current = this.getCurrentMemoryUsage();
    this.history.push({
      timestamp: new Date(),
      used: current.used,
      total: current.total,
    });

    // Keep only last 100 records
    if (this.history.length > 100) {
      this.history.shift();
    }
  }

  /**
   * Get memory usage trend
   */
  getMemoryTrend(): { average: number; peak: number; trend: 'increasing' | 'decreasing' | 'stable' } {
    if (this.history.length < 2) {
      return { average: 0, peak: 0, trend: 'stable' };
    }

    const usageValues = this.history.map((h) => h.used);
    const average = usageValues.reduce((sum, val) => sum + val, 0) / usageValues.length;
    const peak = Math.max(...usageValues);

    // Determine trend
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

  /**
   * Check if memory usage is critical
   */
  isMemoryCritical(threshold: number = 90): boolean {
    const current = this.getCurrentMemoryUsage();
    return current.percentage > threshold;
  }

  /**
   * Force garbage collection if available
   */
  forceGC(): void {
    if (global.gc) {
      global.gc();
    }
  }

  /**
   * Clear history
   */
  clearHistory(): void {
    this.history = [];
  }
}

/**
 * Performance Optimization Analyzer
 */
export class PerformanceOptimizer {
  private monitor = new PerformanceMonitor();
  private cache = new CacheManager();
  private debouncer = new Debouncer();
  private throttler = new Throttler();
  private memoryMonitor = new MemoryMonitor();

  /**
   * Analyze code and provide optimization suggestions
   */
  analyzePerformance(code: string): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];

    // Check for potential caching opportunities
    if (code.includes('fetch(') || code.includes('axios.') || code.includes('http.')) {
      suggestions.push({
        type: 'caching',
        description: 'Consider caching API responses to reduce network requests',
        impact: 'high',
        effort: 'medium',
        codeExample: `
const cachedData = cache.get(apiKey);
if (cachedData) {
  return cachedData;
}
const data = await fetchData();
cache.set(apiKey, data, 5 * 60 * 1000); // 5 minutes
return data;`,
      });
    }

    // Check for potential lazy loading opportunities
    if (code.includes('import(') || code.includes('require(')) {
      suggestions.push({
        type: 'lazy_loading',
        description: 'Consider lazy loading modules to reduce initial bundle size',
        impact: 'medium',
        effort: 'easy',
        codeExample: `
const LazyComponent = lazy(() => import('./HeavyComponent'));
<Suspense fallback={<Loading />}>
  <LazyComponent />
</Suspense>`,
      });
    }

    // Check for event handlers that could benefit from debouncing
    if (code.includes('addEventListener') || code.includes('onChange') || code.includes('onInput')) {
      suggestions.push({
        type: 'debouncing',
        description: 'Consider debouncing frequent event handlers like search inputs',
        impact: 'high',
        effort: 'easy',
        codeExample: `
const debouncedSearch = debounce('search', handleSearch, 300);
input.addEventListener('input', debouncedSearch);`,
      });
    }

    // Check for resize/scroll handlers that could benefit from throttling
    if (code.includes('resize') || code.includes('scroll')) {
      suggestions.push({
        type: 'throttling',
        description: 'Consider throttling resize/scroll handlers to improve performance',
        impact: 'high',
        effort: 'easy',
        codeExample: `
const throttledScroll = throttle('scroll', handleScroll, 100);
window.addEventListener('scroll', throttledScroll);`,
      });
    }

    return suggestions;
  }

  /**
   * Get performance monitor instance
   */
  getMonitor(): PerformanceMonitor {
    return this.monitor;
  }

  /**
   * Get cache manager instance
   */
  getCache(): CacheManager {
    return this.cache;
  }

  /**
   * Get debouncer instance
   */
  getDebouncer(): Debouncer {
    return this.debouncer;
  }

  /**
   * Get throttler instance
   */
  getThrottler(): Throttler {
    return this.throttler;
  }

  /**
   * Get memory monitor instance
   */
  getMemoryMonitor(): MemoryMonitor {
    return this.memoryMonitor;
  }

  /**
   * Run comprehensive performance check
   */
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
      suggestions: [], // Would analyze actual code in real implementation
    };
  }
}

/**
 * Global performance optimizer instance
 */
export const performanceOptimizer = new PerformanceOptimizer();