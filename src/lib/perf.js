// src/lib/perf.js — canonical perf utilities (MemoryCache + RequestDeduplicator)
// Ported from the reference TS core. Pure JS, zero external deps.

export class MemoryCache {
  constructor() { this.cache = new Map(); this.stats = { hits: 0, misses: 0 }; }
  set(key, value, ttl) { this.cache.set(key, { data: value, timestamp: Date.now(), ttl, hits: 0 }); }
  get(key) {
    const entry = this.cache.get(key);
    if (!entry) { this.stats.misses++; return null; }
    if (entry.ttl && Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key); this.stats.misses++; return null;
    }
    entry.hits++; this.stats.hits++; return entry.data;
  }
  has(key) { return this.get(key) != null; }
  delete(key) { this.cache.delete(key); }
  clear() { this.cache.clear(); this.stats = { hits: 0, misses: 0 }; }
  getStats() {
    const t = this.stats.hits + this.stats.misses;
    return { size: this.cache.size, hits: this.stats.hits, misses: this.stats.misses, hitRate: t > 0 ? this.stats.hits / t : 0 };
  }
  invalidate(pattern) {
    if (typeof pattern === "string") return this.delete(pattern);
    for (const k of this.cache.keys()) if (pattern.test(k)) this.delete(k);
  }
}

export class RequestDeduplicator {
  constructor() { this.pending = new Map(); }
  async deduplicate(key, op) {
    if (this.pending.has(key)) return this.pending.get(key);
    const p = op().finally(() => this.pending.delete(key));
    this.pending.set(key, p);
    return p;
  }
  clear() { this.pending.clear(); }
}

const pageCache = new MemoryCache();
const blockCache = new MemoryCache();
const bookingCache = new MemoryCache();
export const dedup = new RequestDeduplicator();
export const caches = { pages: pageCache, blocks: blockCache, bookings: bookingCache };

export function invalidateCache(type, pattern) {
  const c = caches[type]; if (!c) return;
  if (pattern) c.invalidate(new RegExp(pattern)); else c.clear();
}
export function getCacheStats() {
  return { pages: pageCache.getStats(), blocks: blockCache.getStats(), bookings: bookingCache.getStats() };
}
export function clearAllCaches() { pageCache.clear(); blockCache.clear(); bookingCache.clear(); }
