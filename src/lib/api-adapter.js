/**
 * Universal axios adapter that routes the CRA app's REST calls to
 * Lovable Cloud (Supabase) + edge functions instead of an external backend.
 *
 * Imported once at the top of main.tsx so every axios call (and a wrapped
 * window.fetch) is transparently intercepted before any module fires.
 */
import axios from "axios";
import { supabase } from "@/integrations/supabase/client";

/* ─── helpers ─────────────────────────────────────────────────────────── */
const ok = (data, config) => ({
  data,
  status: 200,
  statusText: "OK",
  headers: {},
  config,
});

const err = (status, message, config) => ({
  data: { error: message },
  status,
  statusText: message,
  headers: {},
  config,
});

function parseBody(config) {
  if (!config.data) return {};
  if (typeof config.data === "string") {
    try {
      return JSON.parse(config.data);
    } catch {
      return {};
    }
  }
  return config.data;
}

async function invokeGuesty(action, params = {}, body) {
  const qs = new URLSearchParams({ action, ...params });
  const { data, error } = await supabase.functions.invoke(
    `guesty-beapi?${qs.toString()}`,
    { body }
  );
  if (error) throw error;
  return data;
}

/* ─── route table ─────────────────────────────────────────────────────── */
const routes = [
  /* ── CMS content ─────────────────────────────────────────────────── */
  {
    method: "GET",
    pattern: /\/api\/cms\/?$/,
    handler: async () => {
      const { data, error } = await supabase
        .from("cms_content")
        .select("section_key, content")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      const out = {};
      (data || []).forEach((row) => {
        out[row.section_key] = row.content;
      });
      return out;
    },
  },
  {
    method: "PUT",
    pattern: /\/api\/cms\/([^/]+)$/,
    handler: async (config, [section]) => {
      const body = parseBody(config);
      const payload = body.data ?? body;
      const { error } = await supabase.from("cms_content").upsert(
        {
          section_key: section,
          section_label: section,
          content: payload,
        },
        { onConflict: "section_key" }
      );
      if (error) throw error;
      return { ok: true };
    },
  },

  /* ── CMS pages / drafts (page builder) ───────────────────────────── */
  {
    method: "GET",
    pattern: /\/api\/cms\/admin\/draft\/page_(.+)$/,
    handler: async (_, [page]) => {
      const { data } = await supabase
        .from("cms_content")
        .select("content")
        .eq("section_key", `page_${page}_draft`)
        .maybeSingle();
      return data?.content ?? { blocks: [] };
    },
  },
  {
    method: "GET",
    pattern: /\/api\/cms\/admin\/drafts$/,
    handler: async () => {
      const { data } = await supabase
        .from("cms_content")
        .select("section_key, content, updated_at")
        .like("section_key", "page_%_draft");
      return data || [];
    },
  },
  {
    method: "POST",
    pattern: /\/api\/cms\/admin\/publish$/,
    handler: async (config) => {
      const body = parseBody(config);
      const { page, blocks } = body;
      if (!page) return { ok: false, error: "page required" };
      // Save published version
      await supabase.from("cms_content").upsert(
        {
          section_key: `page_${page}`,
          section_label: page,
          content: { blocks: blocks || [] },
        },
        { onConflict: "section_key" }
      );
      return { ok: true };
    },
  },
  {
    method: "PUT",
    pattern: /\/api\/cms\/admin\/draft\/page_(.+)$/,
    handler: async (config, [page]) => {
      const body = parseBody(config);
      await supabase.from("cms_content").upsert(
        {
          section_key: `page_${page}_draft`,
          section_label: `${page} (draft)`,
          content: body,
        },
        { onConflict: "section_key" }
      );
      return { ok: true };
    },
  },

  /* ── Admin auth (any key works on Lovable Cloud) ─────────────────── */
  {
    method: "GET",
    pattern: /\/api\/admin\/stats$/,
    handler: async () => ({
      ok: true,
      properties: 0,
      bookings: 0,
      revenue: 0,
    }),
  },
  {
    method: "POST",
    pattern: /\/api\/admin\/refresh-token$/,
    handler: async () => ({ ok: true }),
  },
  {
    method: "POST",
    pattern: /\/api\/admin\/clear-cache$/,
    handler: async () => ({ ok: true }),
  },

  /* ── AI generation ───────────────────────────────────────────────── */
  {
    method: "POST",
    pattern: /\/api\/ai\/generate(-image)?$/,
    handler: async (config) => {
      const body = parseBody(config);
      const { data, error } = await supabase.functions.invoke(
        "cms-ai-generate",
        { body }
      );
      if (error) throw error;
      return data || { content: "" };
    },
  },

  /* ── Guesty proxy: listings ──────────────────────────────────────── */
  {
    method: "GET",
    pattern: /\/api\/listings\/([^/]+)\/calendar/,
    handler: async (config, [id]) => {
      const url = new URL("http://x" + (config.url || ""));
      const from = url.searchParams.get("from") || url.searchParams.get("startDate");
      const to = url.searchParams.get("to") || url.searchParams.get("endDate");
      return invokeGuesty("calendar", { id, from: from || "", to: to || "" });
    },
  },
  {
    method: "GET",
    pattern: /\/api\/listings\/([^/?]+)\/?$/,
    handler: async (_, [id]) => invokeGuesty("listing", { id }),
  },
  {
    method: "GET",
    pattern: /\/api\/listings/,
    handler: async (config) => {
      const url = new URL("http://x" + (config.url || ""));
      const params = {};
      url.searchParams.forEach((v, k) => (params[k] = v));
      const data = await invokeGuesty("listings", params);
      // The CRA app expects { results, count } shape
      const results = data?.results ?? data?.data ?? [];
      return { results, count: data?.count ?? results.length };
    },
  },

  /* ── Guesty proxy: quotes / coupons ──────────────────────────────── */
  {
    method: "POST",
    pattern: /\/api\/quotes$/,
    handler: async (config) => invokeGuesty("create-quote", {}, parseBody(config)),
  },
  {
    method: "GET",
    pattern: /\/api\/quotes\/([^/]+)$/,
    handler: async (_, [id]) => invokeGuesty("get-quote", { id }),
  },
  {
    method: "POST",
    pattern: /\/api\/quotes\/([^/]+)\/coupons$/,
    handler: async (config, [id]) => {
      const body = parseBody(config);
      return invokeGuesty("apply-coupon", { id }, { couponCode: body.couponCode || body.code });
    },
  },
  {
    method: "DELETE",
    pattern: /\/api\/quotes\/([^/]+)\/coupons\/(.+)$/,
    handler: async (_, [id]) => invokeGuesty("apply-coupon", { id }, { couponCode: "" }),
  },

  /* ── Forms (contact / owner inquiry) — log to sync_log ───────────── */
  {
    method: "POST",
    pattern: /\/api\/(contact|property-owner-inquiry)$/,
    handler: async (config, [kind]) => {
      const body = parseBody(config);
      try {
        await supabase.from("cms_sync_log").insert({
          source: "frontend-form",
          action: kind,
          payload: body,
          status: "received",
        });
      } catch (e) {
        console.warn("[contact log]", e);
      }
      return { ok: true, message: "Submission received" };
    },
  },

  /* ── Stub-only endpoints (return safe empty responses) ──────────── */
  {
    method: "GET",
    pattern: /\/api\/admin\/(coupons|reviews|seo|media)/,
    handler: async () => [],
  },
  {
    method: "POST",
    pattern: /\/api\/admin\/(coupons|seo|media)/,
    handler: async () => ({ ok: true }),
  },
  {
    method: "PUT",
    pattern: /\/api\/admin\/(coupons|seo|media)/,
    handler: async () => ({ ok: true }),
  },
  {
    method: "DELETE",
    pattern: /\/api\/admin\/(coupons|seo|media)/,
    handler: async () => ({ ok: true }),
  },
  {
    method: "POST",
    pattern: /\/api\/payments\/(create-intent|finalize)$/,
    handler: async () =>
      ({ error: "Payments not configured. Connect Stripe to enable checkout." }),
  },
  {
    method: "GET",
    pattern: /\/api\/(checkout\/status|transaction)\//,
    handler: async () => ({ status: "not_configured" }),
  },
];

/* ─── axios adapter ───────────────────────────────────────────────────── */
function matchRoute(config) {
  const method = (config.method || "GET").toUpperCase();
  const url = config.url || "";
  for (const r of routes) {
    if (r.method !== method) continue;
    const m = url.match(r.pattern);
    if (m) return { route: r, params: m.slice(1) };
  }
  return null;
}

async function adapter(config) {
  const url = config.url || "";
  // Only intercept calls to our virtual /api endpoint
  if (!url.includes("/api/")) {
    // Fall through to a network XHR for genuinely external URLs
    return defaultXhr(config);
  }
  const matched = matchRoute(config);
  if (!matched) {
    console.warn("[api-adapter] unmatched", config.method, url);
    return ok({}, config);
  }
  try {
    const result = await matched.route.handler(config, matched.params);
    return ok(result, config);
  } catch (e) {
    console.error("[api-adapter] handler error", url, e);
    return err(500, e?.message || "adapter error", config);
  }
}

async function defaultXhr(config) {
  // Use fetch under the hood for any non-/api/ call
  const res = await fetch(config.url, {
    method: config.method || "GET",
    headers: config.headers,
    body: ["GET", "HEAD"].includes((config.method || "GET").toUpperCase())
      ? undefined
      : typeof config.data === "string"
      ? config.data
      : JSON.stringify(config.data ?? {}),
  });
  let data;
  const ct = res.headers.get("content-type") || "";
  data = ct.includes("application/json") ? await res.json() : await res.text();
  return {
    data,
    status: res.status,
    statusText: res.statusText,
    headers: {},
    config,
  };
}

axios.defaults.adapter = adapter;

/* ─── fetch shim for the few non-axios callers ────────────────────────── */
const _origFetch = window.fetch.bind(window);
window.fetch = async function patchedFetch(input, init = {}) {
  const url = typeof input === "string" ? input : input?.url || "";
  if (!url.includes("/api/")) return _origFetch(input, init);

  const config = {
    url: url.replace(/^https?:\/\/[^/]+/, ""),
    method: (init.method || "GET").toUpperCase(),
    data: init.body,
    headers: init.headers || {},
  };
  const matched = matchRoute(config);
  if (!matched) return _origFetch(input, init);
  try {
    const result = await matched.route.handler(config, matched.params);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e?.message || "error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

console.log("[api-adapter] axios + fetch routed to Lovable Cloud");
