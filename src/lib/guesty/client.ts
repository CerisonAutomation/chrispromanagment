/**
 * @fileoverview Guesty Open API client — management/admin operations only.
 *
 * BASE URL: https://open-api.guesty.com/v1
 * USE FOR : reservations management, tasks, guests, conversations, webhooks, sync
 *
 * ⚠️  FOR BOOKING ENGINE (public-facing listings/quotes/reservations):
 *     Use src/lib/guesty/booking-api.ts (https://booking.guesty.com)
 *
 * Token cache: Upstash Redis (serverless-safe).
 * Key: 'guesty:open_api:access_token'
 */

import { Redis } from '@upstash/redis';
import type { GuestyAuthToken, GuestyPaginatedResponse } from './types';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const GUESTY_BASE = process.env.GUESTY_BASE_URL ?? 'https://open-api.guesty.com/v1';
const TOKEN_URL = 'https://open-api.guesty.com/oauth2/token';
const REDIS_TOKEN_KEY = 'guesty:open_api:access_token';

async function fetchAndCacheOpenApiToken(): Promise<string> {
  const clientId = process.env.GUESTY_CLIENT_ID;
  const clientSecret = process.env.GUESTY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('[guesty/client] Missing GUESTY_CLIENT_ID or GUESTY_CLIENT_SECRET.');
  }

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      scope: 'open-api',
      client_id: clientId,
      client_secret: clientSecret,
    }),
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`[guesty/client] Token fetch failed: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as GuestyAuthToken;
  const ttl = Math.max(data.expires_in - 60, 30);
  await redis.set(REDIS_TOKEN_KEY, data.access_token, { ex: ttl });
  return data.access_token;
}

/** Returns valid Open API token from Upstash Redis cache or fetches fresh. */
export async function getAccessToken(): Promise<string> {
  const cached = await redis.get<string>(REDIS_TOKEN_KEY);
  if (cached) return cached;
  return fetchAndCacheOpenApiToken();
}

export async function guestyFetch<T>(
  path: string,
  options: RequestInit & { params?: Record<string, string> } = {},
  retries = 3,
): Promise<T> {
  const token = await getAccessToken();
  const url = new URL(`${GUESTY_BASE}${path}`);

  if (options.params) {
    for (const [k, v] of Object.entries(options.params)) url.searchParams.set(k, v);
  }

  const { params: _params, ...fetchOptions } = options;

  const res = await fetch(url.toString(), {
    ...fetchOptions,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(fetchOptions.headers ?? {}),
    },
    next: fetchOptions.method && fetchOptions.method !== 'GET'
      ? undefined
      : { revalidate: 60 },
  });

  if (res.status === 429 && retries > 0) {
    const retryAfter = Number(res.headers.get('Retry-After') ?? '2');
    await new Promise((r) => setTimeout(r, retryAfter * 1_000));
    return guestyFetch(path, options, retries - 1);
  }

  if (res.status === 401 && retries > 0) {
    await redis.del(REDIS_TOKEN_KEY);
    return guestyFetch(path, options, 0);
  }

  if (!res.ok) {
    throw new Error(`[guesty] ${res.status} ${path}: ${await res.text()}`);
  }

  return res.json() as Promise<T>;
}

/**
 * Fetches ALL pages of a paginated Guesty Open API endpoint.
 * Uses skip/limit pagination pattern.
 */
export async function guestyFetchAll<T>(
  path: string,
  params: Record<string, string> = {},
  limit = 100,
): Promise<T[]> {
  const all: T[] = [];
  let skip = 0;

  while (true) {
    const data = await guestyFetch<GuestyPaginatedResponse<T>>(path, {
      params: { ...params, limit: String(limit), skip: String(skip) },
    });
    all.push(...data.results);
    if (all.length >= data.count || data.results.length < limit) break;
    skip += limit;
  }

  return all;
}
