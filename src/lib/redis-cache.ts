// @ts-nocheck
import { createClient, RedisClientType } from 'redis';

interface RedisConfig {
  url: string;
  password?: string;
  ttl?: number;
  maxRetries?: number;
  retryDelay?: number;
  connectTimeout?: number;
  lazyConnect?: boolean;
  keepAlive?: number;
  enableTls?: boolean;
  keyPrefix?: string;
}

interface CacheOptions {
  ttl?: number;
  nx?: boolean;
  xx?: boolean;
}

interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  keys: number;
  memory: string;
}

class RedisCache {
  private client: RedisClientType;
  private config: RedisConfig;
  private stats: CacheStats = { hits: 0, misses: 0, hitRate: 0, keys: 0, memory: '0B' };
  private isConnected: boolean = false;

  constructor(config: RedisConfig) {
    this.config = {
      ttl: 3600,
      maxRetries: 3,
      retryDelay: 1000,
      connectTimeout: 10000,
      lazyConnect: false,
      keepAlive: 30000,
      enableTls: process.env.NODE_ENV === 'production',
      keyPrefix: 'chrispromanagment:',
      ...config,
    };

    this.client = createClient({
      url: this.config.url,
      password: this.config.password,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > (this.config.maxRetries || 3)) {
            return new Error('Max reconnection attempts reached');
          }
          return Math.min(retries * 100, this.config.retryDelay || 1000);
        },
        connectTimeout: this.config.connectTimeout,
        keepAlive: this.config.keepAlive,
      },
      ...(this.config.enableTls && { tls: { rejectUnauthorized: false } }),
    });

    this.client.on('error', (error) => console.error('[RedisCache] Error:', error));
    this.client.on('connect', () => { this.isConnected = true; });
    this.client.on('disconnect', () => { this.isConnected = false; });
  }

  async connect(): Promise<void> {
    if (!this.isConnected && !this.config.lazyConnect) {
      await this.client.connect();
    }
    await this.updateStats();
  }

  async set(key: string, value: unknown, options?: CacheOptions): Promise<boolean> {
    try {
      const prefixedKey = this.prefixedKey(key);
      const serialized = JSON.stringify(value);
      const ttl = options?.ttl || this.config.ttl || 3600;
      await this.client.set(prefixedKey, serialized, { EX: ttl, NX: options?.nx, XX: options?.xx });
      return true;
    } catch (error) {
      console.error('[RedisCache] Set error:', error);
      return false;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(this.prefixedKey(key));
      if (value) { this.stats.hits++; this.updateHitRate(); return JSON.parse(value) as T; }
      this.stats.misses++; this.updateHitRate(); return null;
    } catch (error) {
      console.error('[RedisCache] Get error:', error);
      this.stats.misses++; this.updateHitRate(); return null;
    }
  }

  async del(key: string): Promise<boolean> {
    try { await this.client.del(this.prefixedKey(key)); return true; }
    catch (error) { console.error('[RedisCache] Delete error:', error); return false; }
  }

  async delPattern(pattern: string): Promise<number> {
    try {
      const keys = await this.client.keys(this.prefixedKey(pattern));
      if (keys.length > 0) { await this.client.del(keys); }
      return keys.length;
    } catch (error) { console.error('[RedisCache] Delete pattern error:', error); return 0; }
  }

  async exists(key: string): Promise<boolean> {
    try { return (await this.client.exists(this.prefixedKey(key))) === 1; }
    catch (error) { console.error('[RedisCache] Exists error:', error); return false; }
  }

  async expire(key: string, ttl: number): Promise<boolean> {
    try { await this.client.expire(this.prefixedKey(key), ttl); return true; }
    catch (error) { console.error('[RedisCache] Expire error:', error); return false; }
  }

  async ttl(key: string): Promise<number> {
    try { return await this.client.ttl(this.prefixedKey(key)); }
    catch (error) { console.error('[RedisCache] TTL error:', error); return -1; }
  }

  async mset(keyValuePairs: Record<string, unknown>, options?: CacheOptions): Promise<boolean> {
    try {
      const pipeline = this.client.multi();
      const ttl = options?.ttl || this.config.ttl || 3600;
      for (const [key, value] of Object.entries(keyValuePairs)) {
        pipeline.set(this.prefixedKey(key), JSON.stringify(value), { EX: ttl });
      }
      await pipeline.exec();
      return true;
    } catch (error) { console.error('[RedisCache] Mset error:', error); return false; }
  }

  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    try {
      const values = await this.client.mGet(keys.map(k => this.prefixedKey(k)));
      return values.map(value => {
        if (value) { this.stats.hits++; try { return JSON.parse(value) as T; } catch { return null; } }
        this.stats.misses++; return null;
      });
    } catch (error) { console.error('[RedisCache] Mget error:', error); return keys.map(() => null); }
    finally { this.updateHitRate(); }
  }

  async incr(key: string, by: number = 1): Promise<number> {
    try { return await this.client.incrBy(this.prefixedKey(key), by); }
    catch (error) { console.error('[RedisCache] Incr error:', error); return 0; }
  }

  async decr(key: string, by: number = 1): Promise<number> {
    try { return await this.client.decrBy(this.prefixedKey(key), by); }
    catch (error) { console.error('[RedisCache] Decr error:', error); return 0; }
  }

  async getOrSet<T>(key: string, factory: () => Promise<T>, options?: CacheOptions): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) { return cached; }
    const value = await factory();
    await this.set(key, value, options);
    return value;
  }

  async flushAll(): Promise<boolean> {
    try { await this.client.flushDb(); return true; }
    catch (error) { console.error('[RedisCache] Flush error:', error); return false; }
  }

  async getStats(): Promise<CacheStats> {
    await this.updateStats();
    return { ...this.stats };
  }

  private async updateStats(): Promise<void> {
    try {
      const [keyCount, memoryInfo] = await Promise.all([this.client.dbSize(), this.client.info('memory')]);
      this.stats.keys = keyCount;
      const match = memoryInfo.match(/used_memory_human:(.+)/);
      if (match) { this.stats.memory = match[1].trim(); }
    } catch (error) { console.error('[RedisCache] Update stats error:', error); }
  }

  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
  }

  private prefixedKey(key: string): string {
    return `${this.config.keyPrefix}${key}`;
  }

  async disconnect(): Promise<void> {
    await this.client.quit();
    this.isConnected = false;
  }

  getClient(): RedisClientType {
    return this.client;
  }
}

let cacheInstance: RedisCache | null = null;

export function getRedisCache(): RedisCache {
  if (!cacheInstance) {
    cacheInstance = new RedisCache({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      password: process.env.REDIS_PASSWORD,
      ttl: parseInt(process.env.CACHE_TTL || '3600'),
      enableTls: process.env.NODE_ENV === 'production',
    });
  }
  return cacheInstance;
}

export async function initializeRedisCache(): Promise<void> {
  await getRedisCache().connect();
}

export type { RedisConfig, CacheOptions, CacheStats };
export { RedisCache };