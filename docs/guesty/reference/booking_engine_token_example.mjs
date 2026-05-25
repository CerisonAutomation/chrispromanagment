/**
 * Guesty Booking Engine API — Canonical Reference (Node.js)
 *
 * Demonstrates the proven, production-grade pattern for Guesty Booking Engine:
 *  - Client-credentials token request (scope: booking_engine:api)
 *  - Local token cache with 5-minute safety window (refresh BEFORE expiry)
 *  - Reuse of the cached token across subsequent requests
 *  - Per-second pacing queue (scheduleRequest) to respect rate limits
 *  - withRetry wrapper with exponential backoff + Retry-After honoring
 *
 * This file is a documentation reference. The same patterns are implemented
 * server-side in:
 *   supabase/functions/guesty-beapi/index.ts
 *   supabase/functions/guesty-token-refresh/index.ts
 *
 * Prerequisites:
 *   - Node 18+ (global fetch)
 *   - Env vars: GUESTY_CLIENT_ID, GUESTY_CLIENT_SECRET
 */

import { setTimeout as delay } from "node:timers/promises";

const TOKEN_URL = "https://booking.guesty.com/oauth2/token";
const API_BASE  = "https://booking.guesty.com/api";
const SCOPE     = "booking_engine:api";

// ---------- Token cache ----------
let tokenCache = { access_token: null, expires_at: 0 };
const SAFETY_WINDOW_MS = 5 * 60 * 1000; // refresh 5 min before expiry

async function fetchAccessToken() {
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    scope: SCOPE,
    client_id: process.env.GUESTY_CLIENT_ID,
    client_secret: process.env.GUESTY_CLIENT_SECRET,
  });

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    const retryAfter = res.headers.get("retry-after");
    throw Object.assign(new Error(`Token ${res.status}: ${text}`), { status: res.status, retryAfter });
  }

  const payload = await res.json();
  const expiresInMs = Math.max(60, Number(payload.expires_in ?? 86_400)) * 1000;
  tokenCache = {
    access_token: payload.access_token,
    expires_at: Date.now() + expiresInMs - SAFETY_WINDOW_MS,
  };
  return tokenCache.access_token;
}

export async function getAccessToken() {
  if (tokenCache.access_token && Date.now() < tokenCache.expires_at) {
    return tokenCache.access_token;
  }
  return fetchAccessToken();
}

// ---------- Retry with exponential backoff ----------
const MAX_RETRIES   = 5;
const BASE_BACKOFF  = 500;
const MAX_BACKOFF   = 30_000;

function backoffFor(attempt, headers) {
  const retryAfter = headers?.get?.("retry-after");
  if (retryAfter) {
    const secs = Number(retryAfter);
    if (Number.isFinite(secs)) return Math.min(secs * 1000, MAX_BACKOFF);
  }
  const exp = BASE_BACKOFF * 2 ** attempt;
  return Math.min(exp + Math.floor(Math.random() * 250), MAX_BACKOFF);
}

export async function withRetry(fn) {
  let attempt = 0;
  while (true) {
    const res = await fn();
    if (res.status !== 429 && res.status < 500) return res;
    if (attempt >= MAX_RETRIES) return res;
    await delay(backoffFor(attempt, res.headers));
    attempt += 1;
  }
}

// ---------- Per-second pacing queue ----------
const RPS = 4;
const INTERVAL_MS = Math.ceil(1000 / RPS);
let queue = Promise.resolve();
let lastAt = 0;

export function scheduleRequest(taskFn) {
  const run = async () => {
    const wait = Math.max(0, lastAt + INTERVAL_MS - Date.now());
    if (wait > 0) await delay(wait);
    lastAt = Date.now();
    return taskFn();
  };
  const task = queue.then(run, run);
  queue = task.then(() => undefined, () => undefined);
  return task;
}

// ---------- Authenticated request helper ----------
export async function guestyRequest(path, init = {}) {
  return scheduleRequest(() =>
    withRetry(async () => {
      const token = await getAccessToken();
      const res = await fetch(`${API_BASE}${path}`, {
        ...init,
        headers: {
          ...(init.headers || {}),
          Authorization: `Bearer ${token}`,
          Accept: "application/json; charset=utf-8",
          ...(init.body ? { "Content-Type": "application/json" } : {}),
        },
      });
      // On 401: invalidate cache, let withRetry re-run (next call refreshes token).
      if (res.status === 401) {
        tokenCache = { access_token: null, expires_at: 0 };
      }
      return res;
    }),
  );
}

// ---------- Example: search availability ----------
export function makeSearchRequest(checkIn, checkOut, extra = {}) {
  const qs = new URLSearchParams({ checkIn, checkOut, ...extra }).toString();
  return () => guestyRequest(`/listings/availability?${qs}`);
}

// Example invocations (paced, retried, token cached):
//   scheduleRequest(makeSearchRequest("2025-07-10", "2025-07-12"));
//   scheduleRequest(makeSearchRequest("2025-07-13", "2025-07-15"));
