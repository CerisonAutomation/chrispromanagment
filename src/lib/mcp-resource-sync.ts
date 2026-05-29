/**
 * @fileoverview MCP Resource Sync — Client-side cache and sync for MCP resources.
 * Provides efficient access to block schemas, categories, and documentation.
 * @module lib/mcp-resource-sync
 * @version 8.0.0
 */

import { getMcpClient, type ComponentInfo, type PageSummary } from './mcp-client';

// ═══════════════════════════════════════════════════════════════════════════════
// CACHE TYPES — Structured caching for MCP resources
// ═══════════════════════════════════════════════════════════════════════════════

interface CacheEntry<T> {
  readonly data: T;
  readonly timestamp: number;
  readonly ttlMs: number;
}

interface McpResourceCache {
  readonly components?: CacheEntry<readonly ComponentInfo[]>;
  readonly blockSchemas?: CacheEntry<Record<string, unknown>>;
  readonly categories?: CacheEntry<Record<string, readonly string[]>>;
  readonly pageList?: CacheEntry<readonly PageSummary[]>;
  readonly quickstart?: CacheEntry<string>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// RESOURCE SYNC SERVICE — Singleton service for MCP resource management
// ═══════════════════════════════════════════════════════════════════════════════

class McpResourceSync {
  private cache: McpResourceCache = {};
  private readonly defaultTtlMs = 5 * 60 * 1000; // 5 minutes
  private listeners: Set<(cache: McpResourceCache) => void> = new Set();

  // ═══════════════════════════════════════════════════════════════════════════════
  // CACHE OPERATIONS
  // ═══════════════════════════════════════════════════════════════════════════════

  private isValid<T>(entry: CacheEntry<T> | undefined): boolean {
    if (!entry) return false;
    return Date.now() - entry.timestamp < entry.ttlMs;
  }

  private setCache<T>(
    key: keyof McpResourceCache,
    data: T,
    ttlMs: number = this.defaultTtlMs
  ): void {
    this.cache = {
      ...this.cache,
      [key]: { data, timestamp: Date.now(), ttlMs } as CacheEntry<T>,
    };
    this.notifyListeners();
  }

  private getCache<T>(key: keyof McpResourceCache): T | null {
    const entry = this.cache[key] as CacheEntry<T> | undefined;
    return this.isValid(entry) ? entry!.data : null;
  }

  private notifyListeners(): void {
    this.listeners.forEach((cb) => cb(this.cache));
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // PUBLIC API — Resource fetching with caching
  // ═══════════════════════════════════════════════════════════════════════════════

  async getComponents(
    category?: string,
    options: { readonly forceRefresh?: boolean; readonly ttlMs?: number } = {}
  ): Promise<readonly ComponentInfo[] | null> {
    const { forceRefresh = false, ttlMs } = options;

    if (!forceRefresh) {
      const cached = this.getCache<readonly ComponentInfo[]>('components');
      if (cached) return cached;
    }

    try {
      const mcp = getMcpClient();
      const result = await mcp.listComponents(category);

      if (result.success && result.data) {
        this.setCache('components', result.data.components, ttlMs);
        return result.data.components;
      }
      return null;
    } catch {
      return null;
    }
  }

  async getBlockSchemas(
    options: { readonly forceRefresh?: boolean; readonly ttlMs?: number } = {}
  ): Promise<Record<string, unknown> | null> {
    const { forceRefresh = false, ttlMs } = options;

    if (!forceRefresh) {
      const cached = this.getCache<Record<string, unknown>>('blockSchemas');
      if (cached) return cached;
    }

    try {
      const mcp = getMcpClient();
      const result = await mcp.getBlockSchemas();

      if (result.success && result.data) {
        this.setCache('blockSchemas', result.data.schemas, ttlMs);
        return result.data.schemas;
      }
      return null;
    } catch {
      return null;
    }
  }

  async getCategories(
    options: { readonly forceRefresh?: boolean; readonly ttlMs?: number } = {}
  ): Promise<Record<string, readonly string[]> | null> {
    const { forceRefresh = false, ttlMs } = options;

    if (!forceRefresh) {
      const cached = this.getCache<Record<string, readonly string[]>>('categories');
      if (cached) return cached;
    }

    try {
      const mcp = getMcpClient();
      const result = await mcp.getBlockCategories();

      if (result.success && result.data) {
        this.setCache('categories', result.data.categories, ttlMs);
        return result.data.categories;
      }
      return null;
    } catch {
      return null;
    }
  }

  async getPageList(
    options: { readonly forceRefresh?: boolean; readonly ttlMs?: number } = {}
  ): Promise<readonly PageSummary[] | null> {
    const { forceRefresh = false, ttlMs } = options;

    if (!forceRefresh) {
      const cached = this.getCache<readonly PageSummary[]>('pageList');
      if (cached) return cached;
    }

    try {
      const mcp = getMcpClient();
      const result = await mcp.listPages();

      if (result.success && result.data) {
        this.setCache('pageList', result.data.pages, ttlMs);
        return result.data.pages;
      }
      return null;
    } catch {
      return null;
    }
  }

  async getQuickstartGuide(
    options: { readonly forceRefresh?: boolean; readonly ttlMs?: number } = {}
  ): Promise<string | null> {
    const { forceRefresh = false, ttlMs = 30 * 60 * 1000 } = options; // 30 min TTL for docs

    if (!forceRefresh) {
      const cached = this.getCache<string>('quickstart');
      if (cached) return cached;
    }

    try {
      const mcp = getMcpClient();
      const result = await mcp.getQuickstartGuide();

      if (result.success && result.data) {
        this.setCache('quickstart', result.data.content, ttlMs);
        return result.data.content;
      }
      return null;
    } catch {
      return null;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // UTILITY METHODS
  // ═══════════════════════════════════════════════════════════════════════════════

  invalidate(key?: keyof McpResourceCache): void {
    if (key) {
      const { [key]: _, ...rest } = this.cache;
      this.cache = rest;
    } else {
      this.cache = {};
    }
    this.notifyListeners();
  }

  subscribe(callback: (cache: McpResourceCache) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  getCacheStatus(): Record<keyof McpResourceCache, { readonly valid: boolean; readonly ageMs: number | null }> {
    const status = {} as Record<keyof McpResourceCache, { readonly valid: boolean; readonly ageMs: number | null }>;

    (Object.keys(this.cache) as Array<keyof McpResourceCache>).forEach((key) => {
      const entry = this.cache[key] as CacheEntry<unknown> | undefined;
      status[key] = {
        valid: this.isValid(entry),
        ageMs: entry ? Date.now() - entry.timestamp : null,
      };
    });

    return status;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON INSTANCE
// ═══════════════════════════════════════════════════════════════════════════════

let globalSync: McpResourceSync | null = null;

export function getMcpResourceSync(): McpResourceSync {
  if (!globalSync) {
    globalSync = new McpResourceSync();
  }
  return globalSync;
}

export function resetMcpResourceSync(): void {
  globalSync = null;
}

export { McpResourceSync };
export type { McpResourceCache };
