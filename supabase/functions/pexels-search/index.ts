/**
 * pexels-search — Proxy for Pexels image search
 * Keeps API key server-side. Pattern from OpenPage api/pexels.ts.
 * Used for listing image fallbacks when Guesty doesn't provide photos.
 */
const corsHeaders = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PexelsPhoto {
  id?:           number;
  alt?:          string;
  photographer?: string;
  src?: {
    small?:   string;
    medium?:  string;
    large?:   string;
    portrait?: string;
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const apiKey = Deno.env.get("PEXELS_API_KEY");
  if (!apiKey) {
    return new Response(
      JSON.stringify({ photos: [], error: "PEXELS_API_KEY not configured" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.json() as {
      query:        string;
      per_page?:    number;
      orientation?: string;
    };

    if (!body.query?.trim()) {
      return new Response(JSON.stringify({ photos: [], error: "query is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const params = new URLSearchParams({
      query:    body.query,
      per_page: String(Math.min(body.per_page ?? 6, 20)),
    });
    if (body.orientation) params.set("orientation", body.orientation);

    const res = await fetch(`https://api.pexels.com/v1/search?${params}`, {
      headers: { Authorization: apiKey },
      signal:  AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      return new Response(JSON.stringify({ photos: [], error: `Pexels API error: ${res.status}` }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await res.json() as { photos?: unknown[] };
    const photos = (Array.isArray(data.photos) ? data.photos : [])
      .filter((p): p is PexelsPhoto => typeof p === "object" && p !== null)
      .map((p) => ({
        id:           p.id,
        alt:          p.alt ?? "",
        photographer: p.photographer ?? "",
        src: {
          small:   p.src?.small   ?? "",
          medium:  p.src?.medium  ?? "",
          large:   p.src?.large   ?? "",
          portrait: p.src?.portrait ?? "",
        },
      }));

    return new Response(JSON.stringify({ photos }), {
      headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "public, max-age=3600" },
    });

  } catch (e) {
    return new Response(JSON.stringify({ photos: [], error: String(e) }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
