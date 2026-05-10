// Guesty Booking Engine API BFF
// OAuth2 client_credentials with cached token + proxied endpoints.
// Docs: base = https://booking.guesty.com/api  | token = https://booking.guesty.com/oauth2/token
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TOKEN_URLS = [
  "https://booking.guesty.com/oauth2/token",
  "https://open-api.guesty.com/oauth2/token",
];
const BEAPI_BASE = "https://booking.guesty.com/api";

let cachedToken: { value: string; expiresAt: number } | null = null;
let inflight: Promise<string> | null = null;

async function getToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt - 60_000 > now) return cachedToken.value;
  if (inflight) return inflight;

  const clientId = Deno.env.get("GUESTY_CLIENT_ID");
  const clientSecret = Deno.env.get("GUESTY_CLIENT_SECRET");
  if (!clientId || !clientSecret) throw new Error("Guesty credentials not configured");

  inflight = (async () => {
    const attempts: Array<{ url: string; scope?: string }> = [
      { url: TOKEN_URLS[0], scope: "booking_engine:api" },
      { url: TOKEN_URLS[0] },
      { url: TOKEN_URLS[1], scope: "open-api" },
      { url: TOKEN_URLS[1] },
    ];
    let lastErr = "";
    for (const a of attempts) {
      const body = new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
        ...(a.scope ? { scope: a.scope } : {}),
      });
      const res = await fetch(a.url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
        body,
      });
      const text = await res.text();
      if (res.ok) {
        const json = JSON.parse(text);
        const expiresIn = (json.expires_in ?? 86400) * 1000;
        cachedToken = { value: json.access_token, expiresAt: Date.now() + expiresIn };
        console.log(`[guesty] token via ${a.url} scope=${a.scope ?? "(none)"}`);
        return cachedToken.value;
      }
      lastErr = `${a.url} ${res.status}: ${text}`;
    }
    throw new Error(`Token error — ${lastErr}`);
  })();

  try {
    return await inflight;
  } finally {
    inflight = null;
  }
}

async function beapi(path: string, init: RequestInit = {}, attempt = 0): Promise<Response> {
  const token = await getToken();
  const url = path.startsWith("http") ? path : `${BEAPI_BASE}${path.startsWith("/") ? path : "/" + path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      ...(init.headers || {}),
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
    },
  });
  if ((res.status === 401 || res.status === 403) && attempt === 0) {
    cachedToken = null;
    return beapi(path, init, 1);
  }
  if (res.status === 429 && attempt < 2) {
    await new Promise((r) => setTimeout(r, 500 * (attempt + 1) + Math.random() * 200));
    return beapi(path, init, attempt + 1);
  }
  return res;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action") ?? "listings";
    const body = req.method !== "GET" && req.method !== "HEAD" ? await req.json().catch(() => ({})) : {};

    switch (action) {
      case "listings": {
        // Pass-through allow-listed query params
        const qs = new URLSearchParams();
        ["city", "minOccupancy", "checkIn", "checkOut", "limit", "skip", "minBedrooms", "amenities"].forEach((k) => {
          const v = url.searchParams.get(k);
          if (v) qs.set(k, v);
        });
        const r = await beapi(`/listings${qs.toString() ? `?${qs}` : ""}`);
        const data = await r.json();
        return json(data, r.status);
      }
      case "listing": {
        const id = url.searchParams.get("id");
        if (!id) return json({ error: "Missing id" }, 400);
        const r = await beapi(`/listings/${encodeURIComponent(id)}`);
        return json(await r.json(), r.status);
      }
      case "calendar": {
        const id = url.searchParams.get("id");
        const from = url.searchParams.get("from");
        const to = url.searchParams.get("to");
        if (!id || !from || !to) return json({ error: "Missing id/from/to" }, 400);
        const r = await beapi(`/listings/${encodeURIComponent(id)}/calendar?from=${from}&to=${to}`);
        return json(await r.json(), r.status);
      }
      case "payment-provider": {
        const id = url.searchParams.get("id");
        if (!id) return json({ error: "Missing id" }, 400);
        const r = await beapi(`/listings/${encodeURIComponent(id)}/payment-provider`);
        return json(await r.json(), r.status);
      }
      case "create-quote": {
        const r = await beapi(`/reservations/quotes`, { method: "POST", body: JSON.stringify(body) });
        return json(await r.json(), r.status);
      }
      case "get-quote": {
        const id = url.searchParams.get("id");
        if (!id) return json({ error: "Missing id" }, 400);
        const r = await beapi(`/reservations/quotes/${encodeURIComponent(id)}`);
        return json(await r.json(), r.status);
      }
      case "apply-coupon": {
        const id = url.searchParams.get("id");
        if (!id) return json({ error: "Missing id" }, 400);
        const r = await beapi(`/reservations/quotes/${encodeURIComponent(id)}/coupons`, {
          method: "POST",
          body: JSON.stringify(body),
        });
        return json(await r.json(), r.status);
      }
      case "instant-charge": {
        const id = url.searchParams.get("id");
        if (!id) return json({ error: "Missing quote id" }, 400);
        const r = await beapi(`/reservations/quotes/${encodeURIComponent(id)}/instant`, {
          method: "POST",
          body: JSON.stringify(body),
        });
        return json(await r.json(), r.status);
      }
      case "verify-payment": {
        const id = url.searchParams.get("id");
        if (!id) return json({ error: "Missing reservation id" }, 400);
        const r = await beapi(`/reservations/${encodeURIComponent(id)}/verify-payment`, {
          method: "POST",
          body: JSON.stringify(body),
        });
        return json(await r.json(), r.status);
      }
      case "reservation": {
        const id = url.searchParams.get("id");
        if (!id) return json({ error: "Missing id" }, 400);
        const r = await beapi(`/reservations/${encodeURIComponent(id)}`);
        return json(await r.json(), r.status);
      }
      default:
        return json({ error: `Unknown action: ${action}` }, 400);
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[guesty-beapi]", msg);
    return json({ error: msg }, 500);
  }
});
