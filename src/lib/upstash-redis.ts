import { logger } from './otel-observability';

export interface UpstashRedisOptions {
  baseUrl?: string;
  token?: string;
  timeout?: number;
}

export class UpstashRedis {
  private baseUrl: string;
  private token: string;
  private timeout: number;
  private maxRetries = 3;
  private baseDelayMs = 100;

  constructor(options?: UpstashRedisOptions) {
    const REDIS_URL = import.meta.env?.VITE_KV_REST_API_URL || import.meta.env?.KV_REST_API_URL || '';
    const REDIS_TOKEN = import.meta.env?.VITE_KV_REST_API_TOKEN || import.meta.env?.KV_REST_API_TOKEN || '';
    this.baseUrl = (options?.baseUrl || REDIS_URL).replace(/\/$/, '');
    this.token = options?.token || REDIS_TOKEN;
    this.timeout = options?.timeout || 5000;
    if (!this.baseUrl || !this.token) {
      logger.warn('UpstashRedis: missing URL or token - check KV_REST_API_URL/KV_REST_API_TOKEN');
    }
  }

  private async request(command: string, ...args: (string | number)[]): Promise<unknown> {
    let lastError: unknown;
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await fetch(`${this.baseUrl}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${this.token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify([command, ...args.map(String)]),
          signal: AbortSignal.timeout(this.timeout),
        });
        if (!response.ok) { throw new Error(`Redis error: ${response.status}`); }
        const data = await response.json();
        if (data.error) { throw new Error(`Redis error: ${data.error}`); }
        return data.result;
      } catch (error) {
        lastError = error;
        if (attempt < this.maxRetries) {
          const delay = this.baseDelayMs * Math.pow(2, attempt);
          logger.warn(`Redis ${command} failed, retrying in ${delay}ms`, { attempt, error });
          await new Promise(r => setTimeout(r, delay));
        }
      }
    }
    logger.error(`Redis ${command} failed after ${this.maxRetries} retries`, { error: lastError });
    throw lastError;
  }

  async acquireLock(key: string, ttlMs: number = 10000): Promise<boolean> {
    return (await this.request('SET', `lock:${key}`, '1', 'NX', 'PX', ttlMs)) === 'OK';
  }

  async releaseLock(key: string): Promise<void> {
    await this.del(`lock:${key}`);
  }

  async getWithStampedeProtection<T = unknown>(
    key: string,
    fetcher: () => Promise<T>,
    opts?: { ttlSeconds?: number }
  ): Promise<T> {
    const cached = await this.getJSON<T>(key);
    if (cached !== null) { return cached; }
    const acquired = await this.acquireLock(key);
    if (!acquired) {
      await new Promise(r => setTimeout(r, 100));
      const retry = await this.getJSON<T>(key);
      if (retry !== null) { return retry; }
      throw new Error('Cache stampede: could not acquire lock or get value');
    }
    try {
      const value = await fetcher();
      await this.setJSON(key, value, { ex: opts?.ttlSeconds || 300 });
      return value;
    } finally {
      await this.releaseLock(key);
    }
  }

  async get(key: string): Promise<string | null> {
    return (await this.request('GET', key)) as string | null;
  }

  async set(key: string, value: string, opts?: { ex?: number }): Promise<string> {
    const args: (string | number)[] = [key, value];
    if (opts?.ex) { args.push('EX', opts.ex); }
    return (await this.request('SET', ...args)) as string;
  }

  async del(...keys: string[]): Promise<number> {
    return (await this.request('DEL', ...keys)) as number;
  }

  async hget(key: string, field: string): Promise<string | null> {
    return (await this.request('HGET', key, field)) as string | null;
  }

  async hset(key: string, field: string, value: string): Promise<number> {
    return (await this.request('HSET', key, field, value)) as number;
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    return (await this.request('HGETALL', key)) as Record<string, string>;
  }

  async sadd(key: string, ...members: string[]): Promise<number> {
    return (await this.request('SADD', key, ...members)) as number;
  }

  async smembers(key: string): Promise<string[]> {
    return (await this.request('SMEMBERS', key)) as string[];
  }

  async zadd(key: string, score: number, member: string): Promise<number> {
    return (await this.request('ZADD', key, score, member)) as number;
  }

  async zrange(key: string, start: number, stop: number): Promise<string[]> {
    return (await this.request('ZRANGE', key, start, stop)) as string[];
  }

  async lpush(key: string, ...values: string[]): Promise<number> {
    return (await this.request('LPUSH', key, ...values)) as number;
  }

  async rpop(key: string): Promise<string | null> {
    return (await this.request('RPOP', key)) as string | null;
  }

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    return (await this.request('LRANGE', key, start, stop)) as string[];
  }

  async expire(key: string, seconds: number): Promise<number> {
    return (await this.request('EXPIRE', key, seconds)) as number;
  }

  async ttl(key: string): Promise<number> {
    return (await this.request('TTL', key)) as number;
  }

  async incr(key: string): Promise<number> {
    return (await this.request('INCR', key)) as number;
  }

  async decr(key: string): Promise<number> {
    return (await this.request('DECR', key)) as number;
  }

  async exists(...keys: string[]): Promise<number> {
    return (await this.request('EXISTS', ...keys)) as number;
  }

  async publish(channel: string, message: string): Promise<number> {
    return (await this.request('PUBLISH', channel, message)) as number;
  }

  async pipeline(commands: [string, ...(string | number)[]][]): Promise<unknown[]> {
    const response = await fetch(`${this.baseUrl}/pipeline`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(commands),
      signal: AbortSignal.timeout(this.timeout),
    });
    if (!response.ok) { throw new Error(`Redis pipeline error: ${response.status}`); }
    return response.json();
  }

  async getJSON<T = unknown>(key: string): Promise<T | null> {
    const raw = await this.get(key);
    if (!raw) { return null; }
    return JSON.parse(raw) as T;
  }

  async setJSON(key: string, value: unknown, opts?: { ex?: number }): Promise<string> {
    return this.set(key, JSON.stringify(value), opts);
  }
}

export const redis = new UpstashRedis();

export function Cacheable(keyPrefix: string, ttlSeconds: number = 300) {
  return function (_target: unknown, _propertyKey: string, descriptor: PropertyDescriptor) {
    const original = descriptor.value;
    descriptor.value = async function (...args: unknown[]) {
      const cacheKey = `${keyPrefix}:${JSON.stringify(args)}`;
      const cached = await redis.getJSON(cacheKey);
      if (cached !== null) { return cached; }
      const result = await original.apply(this, args);
      await redis.setJSON(cacheKey, result, { ex: ttlSeconds });
      return result;
    };
    return descriptor;
  };
}
