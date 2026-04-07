/**
 * Guesty HTTP client.
 * Handles: OAuth2 token caching, rate-limit retry, full auto-pagination.
 *
 * Based on:
 * - dferrera-creator/margin-app → token caching, fetchAll pagination pattern
 * - Velocity-BPA/n8n-nodes-guesty → transport layer architecture
 */

import type { GuestyAuthToken, GuestyPaginatedResponse } from './types';

const GUESTY_BASE = process.env.GUESTY_BASE_URL ?? 'https://open-api.guesty.com/v1';
const TOKEN_URL = 'https://open-api.guesty.com/oauth2/token';

// ─── Token cache ────────────────────────────────────────────────────────────────────────

let _cachedToken: { token: string; expiresAt: number } | null = null;

export async function getAccessToken(): Promise<string> {
  // Expire 5 min early to avoid edge race conditions (matches margin-app pattern)
  if (_cachedToken && Date.now() < _cachedToken.expiresAt - 300_000) {
    return _cachedToken.token;
  }

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
  });

  if (!res.ok) {
    throw new Error(`[guesty/client] Token fetch failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json() as GuestyAuthToken;
  _cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return _cachedToken.token;
}

// ─── Core fetch ──────────────────────────────────────────────────────────────────────────

export async function guestyFetch<T>(
  path: string,
  options: RequestInit & { params?: Record<string, string> } = {},
  retries = 3
): Promise<T> {
  const token = await getAccessToken();

  const url = new URL(`${GUESTY_BASE}${path}`);
  if (options.params) {
    for (const [k, v] of Object.entries(options.params)) {
      url.searchParams.set(k, v);
    }
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
    // Next.js ISR caching: revalidate every 60s for GET requests
    next: fetchOptions.method && fetchOptions.method !== 'GET'
      ? undefined
      : { revalidate: 60 },
  });

  if (res.status === 429 && retries > 0) {
    const retryAfter = Number(res.headers.get('Retry-After') ?? '2');
    await new Promise((r) => setTimeout(r, retryAfter * 1000));
    return guestyFetch(path, options, retries - 1);
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`[guesty] ${res.status} ${path}: ${text}`);
  }

  return res.json() as Promise<T>;
}

// ─── Auto-pagination (from dferrera-creator/margin-app pattern) ──────────────────────

/**
 * Fetches ALL pages of a paginated Guesty endpoint.
 * Stops when results.length >= count or results.length < limit.
 */
export async function guestyFetchAll<T>(
  path: string,
  params: Record<string, string> = {},
  limit = 100
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
