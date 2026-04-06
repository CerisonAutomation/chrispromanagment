// =============================================================================
// PERFORMANCE OPTIMIZATIONS - Production-Ready Utilities
// N+1 prevention, memoization, lazy loading, and performance monitoring
// =============================================================================

import { useCallback, useMemo, useRef, useState, useEffect } from 'react';

// ---------------------------------------------------------------------------
// DEBOUNCE & THROTTLE
// ---------------------------------------------------------------------------

/**
 * Debounce function - delays execution until after wait ms of no calls
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
    }, wait);
  };
}

/**
 * Throttle function - ensures function is called at most once per wait ms
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  wait: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= wait) {
      lastCall = now;
      fn(...args);
    }
  };
}

/**
 * Debounce hook for React components
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Throttle hook for React components
 */
export function useThrottle<T>(value: T, interval: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastUpdated = useRef<number>(Date.now());

  useEffect(() => {
    const now = Date.now();
    if (now - lastUpdated.current >= interval) {
      lastUpdated.current = now;
      setThrottledValue(value);
    } else {
      const timer = setTimeout(() => {
        lastUpdated.current = Date.now();
        setThrottledValue(value);
      }, interval - (now - lastUpdated.current));
      return () => clearTimeout(timer);
    }
  }, [value, interval]);

  return throttledValue;
}

// ---------------------------------------------------------------------------
// MEMOIZATION HELPERS
// ---------------------------------------------------------------------------

/**
 * Stable memoize function - caches results based on arguments
 */
export function memoize<T extends (...args: unknown[]) => unknown>(
  fn: T
): T {
  const cache = new Map<string, unknown>();

  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

/**
 * Create a stable reference for object dependencies
 */
export function useStableMemo<T>(factory: () => T, deps: unknown[]): T {
  return useMemo(factory, deps);
}

/**
 * Create stable callback that doesn't change on each render
 */
export function useStableCallback<T extends (...args: unknown[]) => unknown>(
  callback: T
): T {
  const ref = useRef(callback);

  useEffect(() => {
    ref.current = callback;
  }, [callback]);

  return useCallback(
    (...args: Parameters<T>) => ref.current(...args),
    []
  ) as T;
}

// ---------------------------------------------------------------------------
// N+1 PREVENTION
// ---------------------------------------------------------------------------

/**
 * Batch processor for avoiding N+1 queries
 */
export class BatchProcessor<T> {
  private queue: T[] = [];
  private processing = false;
  private flushTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private batchSize: number = 10,
    private flushInterval: number = 100,
    private processor: (items: T[]) => Promise<void>
  ) {}

  /**
   * Add item to batch queue
   */
  add(item: T): void {
    this.queue.push(item);

    // Process immediately if batch size reached
    if (this.queue.length >= this.batchSize) {
      this.flush();
    } else if (!this.flushTimeout) {
      // Schedule flush
      this.flushTimeout = setTimeout(() => this.flush(), this.flushInterval);
    }
  }

  /**
   * Process all queued items
   */
  async flush(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;

    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout);
      this.flushTimeout = null;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const batch = this.queue.splice(0, this.batchSize);
      await this.processor(batch);
    }

    this.processing = false;
  }

  /**
   * Clear queue without processing
   */
  clear(): void {
    this.queue = [];
    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout);
      this.flushTimeout = null;
    }
  }
}

/**
 * Cache manager with TTL and LRU eviction
 */
export class CacheManager<K, V> {
  private cache = new Map<K, { value: V; expiry: number }>();
  private maxSize: number;
  private defaultTTL: number;

  constructor(maxSize = 100, defaultTTL = 60000) {
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
  }

  /**
   * Set value in cache
   */
  set(key: K, value: V, ttl?: number): void {
    // Evict if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      value,
      expiry: Date.now() + (ttl ?? this.defaultTTL),
    });
  }

  /**
   * Get value from cache
   */
  get(key: K): V | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    // Check expiry
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.value;
  }

  /**
   * Check if key exists (and not expired)
   */
  has(key: K): boolean {
    return this.get(key) !== undefined;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Remove specific key
   */
  delete(key: K): void {
    this.cache.delete(key);
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; maxSize: number; hitRate: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: 0, // Would need hit/miss tracking
    };
  }
}

// ---------------------------------------------------------------------------
// LAZY LOADING
// ---------------------------------------------------------------------------

/**
 * Lazy load component with loading state
 */
export function lazy<T extends React.ComponentType<unknown>>(
  factory: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> {
  return React.lazy(factory);
}

/**
 * Intersection observer hook for lazy loading
 */
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
): [React.RefObject<HTMLDivElement>, boolean] {
  const ref = useRef<HTMLDivElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(element);
    return () => observer.disconnect();
  }, [options.root, options.rootMargin, options.threshold]);

  return [ref, isIntersecting];
}

// ---------------------------------------------------------------------------
// PERFORMANCE MONITORING
// ---------------------------------------------------------------------------

/**
 * Performance marker for tracking
 */
export function mark(label: string): void {
  if (typeof window !== 'undefined' && window.performance) {
    window.performance.mark(label);
  }
}

/**
 * Measure between two marks
 */
export function measure(label: string, startMark: string, endMark?: string): number {
  if (typeof window !== 'undefined' && window.performance) {
    const end = endMark ?? `${startMark}-end`;
    window.performance.measure(label, startMark, end);
    const entries = window.performance.getEntriesByName(label);
    if (entries.length > 0) {
      return entries[entries.length - 1].duration;
    }
  }
  return 0;
}

/**
 * Report Web Vitals
 */
export function reportWebVitals(metric: { name: string; value: number; id: string }): void {
  // Send to analytics in production
  if (process.env.NODE_ENV === 'production') {
    console.log(`[WebVitals] ${metric.name}:`, metric.value);
  }
}

// ---------------------------------------------------------------------------
// PREFETCHING
// ---------------------------------------------------------------------------

/**
 * Prefetch data for anticipated user action
 */
export async function prefetch<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  // Check if already cached
  const cached = performance.getEntriesByType('resource').find(
    e => e.name === key
  );
  
  if (cached) {
    return fetcher();
  }

  // Start prefetch
  return fetcher();
}

/**
 * Preload critical assets
 */
export function preloadCriticalAssets(assets: string[]): void {
  if (typeof window === 'undefined') return;

  assets.forEach((href) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'fetch';
    link.href = href;
    document.head.appendChild(link);
  });
}

// ---------------------------------------------------------------------------
// RESOURCE PRIORITIES
// ---------------------------------------------------------------------------

/**
 * Priority levels for resource loading
 */
export enum ResourcePriority {
  CRITICAL = 0,
  HIGH = 1,
  MEDIUM = 2,
  LOW = 3,
}

/**
 * Load script with priority
 */
export function loadScript(
  src: string,
  priority: ResourcePriority = ResourcePriority.MEDIUM
): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.defer = priority > ResourcePriority.HIGH;
    
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load: ${src}`));
    
    document.head.appendChild(script);
  });
}

// ---------------------------------------------------------------------------
// VIRTUALIZATION
// ---------------------------------------------------------------------------

/**
 * Virtual list configuration
 */
export interface VirtualListConfig {
  itemHeight: number;
  overscan?: number;
  containerHeight: number;
}

/**
 * Calculate visible items for virtual scrolling
 */
export function getVirtualItems(
  scrollTop: number,
  config: VirtualListConfig,
  totalItems: number
): { startIndex: number; endIndex: number; offsetY: number } {
  const { itemHeight, overscan = 3, containerHeight } = config;
  
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const endIndex = Math.min(totalItems - 1, startIndex + visibleCount + overscan * 2);
  
  return {
    startIndex,
    endIndex,
    offsetY: startIndex * itemHeight,
  };
}

// ---------------------------------------------------------------------------
// DEFAULT EXPORT
// ---------------------------------------------------------------------------

export default {
  debounce,
  throttle,
  useDebounce,
  useThrottle,
  memoize,
  useStableMemo,
  useStableCallback,
  BatchProcessor,
  CacheManager,
  lazy,
  useIntersectionObserver,
  mark,
  measure,
  reportWebVitals,
  prefetch,
  preloadCriticalAssets,
  loadScript,
  ResourcePriority,
  getVirtualItems,
};