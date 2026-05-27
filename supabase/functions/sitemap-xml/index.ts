// sitemap-xml — generates /sitemap.xml from static app routes + any
// per-page SEO overrides stored in cms_page_seo (P4).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-correlation-id",
};

const STATIC_ROUTES = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/properties", changefreq: "daily", priority: "0.9" },
  { path: "/map", changefreq: "weekly", priority: "0.6" },
  { path: "/property-owners", changefreq: "monthly", priority: "0.7" },
  { path: "/for-owners", changefreq: "monthly", priority: "0.7" },
];

function escapeXml(s: string) {
  return s.replace(/[<>&'"]/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c]!)
  );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
return new Response("ok", { headers: corsHeaders });
}

  // Base URL — prefer x-forwarded-host (live custom domain), else request origin.
  const fwdHost = req.headers.get("x-forwarded-host");
  const fwdProto = req.headers.get("x-forwarded-proto") || "https";
  const origin = fwdHost ? `${fwdProto}://${fwdHost}` : new URL(req.url).origin;
  const base = (origin || "").replace(/\/$/, "");

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  const { data: seoRows } = await admin
    .from("cms_page_seo")
    .select("page_slug, updated_at, robots");

  const seoBySlug = new Map<string, { lastmod: string; noindex: boolean }>();
  for (const row of seoRows ?? []) {
    const noindex = /noindex/i.test(row.robots ?? "");
    seoBySlug.set(row.page_slug, {
      lastmod: row.updated_at ?? new Date().toISOString(),
      noindex,
    });
  }

  // Merge static routes + extra slugs from cms_page_seo
  const seen = new Set<string>(STATIC_ROUTES.map((r) => r.path));
  const entries = STATIC_ROUTES.map((r) => {
    const meta = seoBySlug.get(r.path);
    return meta?.noindex ? null : { ...r, lastmod: meta?.lastmod };
  }).filter(Boolean) as Array<{ path: string; changefreq?: string; priority?: string; lastmod?: string }>;

  for (const [slug, meta] of seoBySlug.entries()) {
    if (seen.has(slug) || meta.noindex) {
continue;
}
    entries.push({ path: slug, lastmod: meta.lastmod, changefreq: "monthly", priority: "0.5" });
  }

  const urls = entries
    .map((e) => {
      const loc = `${base}${e.path}`;
      const lastmod = e.lastmod ? `\n    <lastmod>${escapeXml(e.lastmod)}</lastmod>` : "";
      const cf = e.changefreq ? `\n    <changefreq>${e.changefreq}</changefreq>` : "";
      const pr = e.priority ? `\n    <priority>${e.priority}</priority>` : "";
      return `  <url>\n    <loc>${escapeXml(loc)}</loc>${lastmod}${cf}${pr}\n  </url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

  return new Response(xml, {
    headers: {
      ...corsHeaders,
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
});
