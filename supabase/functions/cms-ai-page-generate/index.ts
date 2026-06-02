// CMS AI Page Generator — "ZENITH ORACLE" adapted for the Christiano PM
// block registry. Returns a full page object: { root, blocks: [...] }
// where every block uses an EXISTING registered type (header, hero,
// hero_carousel, features, listingsGrid, testimonials, faq, cta, footer, ...).
//
// The client passes `availableBlocks` (derived from src/lib/blockRegistry.js)
// so the prompt always reflects the live catalog without redeploying.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface AvailableBlock {
  type: string;
  label?: string;
  category?: string;
  defaults?: unknown;
}

interface Body {
  description: string;
  audience?: "owners" | "guests" | "mixed";
  style?: "modern" | "minimal" | "bold" | "elegant";
  pageSlug?: string;
  availableBlocks: AvailableBlock[];
  model?: string;
}

function buildCatalog(blocks: AvailableBlock[]) {
  return blocks
    .map((b) => {
      const label = b.label ? ` — ${b.label}` : "";
      const cat = b.category ? ` [${b.category}]` : "";
      const shape = b.defaults
        ? `\n    defaults: ${JSON.stringify(b.defaults)}`
        : "";
      return `- ${b.type}${label}${cat}${shape}`;
    })
    .join("\n");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "AI gateway not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as Body;
    if (!body?.description || !Array.isArray(body?.availableBlocks) || body.availableBlocks.length === 0) {
      return new Response(JSON.stringify({ error: "description and availableBlocks[] are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const catalog = buildCatalog(body.availableBlocks);
    const allowedTypes = body.availableBlocks.map((b) => b.type);

    const system = `You are ZENITH ORACLE, principal AI page builder for Christiano Property Management (Christiano PM) — luxury property management and vacation rentals in Malta.

You output ONE strict JSON object — no prose, no markdown, no code fences.

DOMAIN
- Audiences: property owners (revenue / management) and guests (cinematic Malta stays).
- Brand: Cinematic Gold. Dark backgrounds (#0A0A0A / #050505), gold accent (#D4AF37), white titles, body text on dark.
- Tone: luxury, sophisticated, warm, confident, conversion-focused. No lorem ipsum. No placeholders.
- Malta context: Valletta, Mdina, Sliema, St Julian's, Gozo, coastal & historic detail.

BLOCK CATALOG — you MUST only use these type ids. Field shapes must match each block's "defaults" exactly (same keys, same nesting, same array item shape). You may freely change values and grow / shrink arrays.

${catalog}

OUTPUT SHAPE (this exact JSON shape, nothing else):
{
  "root": {
    "props": {
      "title": "<SEO title, includes Malta when relevant, <=60 chars>",
      "description": "<120-160 char meta description>"
    }
  },
  "blocks": [
    { "id": "b_<slug>", "type": "<one of the allowed types>", "data": { ... matches that block's defaults shape ... }, "visible": true }
  ]
}

HARD RULES
1. Use ONLY these types: ${allowedTypes.join(", ")}.
2. First block MUST be type "header" (if present in catalog).
3. There MUST be exactly one hero-style block near the top — prefer "hero_carousel" when available, else "hero".
4. Include 4–10 content sections between hero and footer chosen to match the audience:
   - owner pages: features, stats, pricing, faq, testimonials, cta, contactForm / leadCapture.
   - guest pages: listingsGrid / properties, gallery, testimonials, faq, cta.
   - mixed / brand pages: features, stats, testimonials, faq, cta.
5. Include at least one strong CTA-style block before the footer.
6. Last block MUST be type "footer" (if present in catalog).
7. Total blocks between 8 and 16.
8. Every block needs a unique short "id" string (e.g. "b_hero", "b_feat1").
9. Every block's "data" must conform to that block's defaults shape — same keys, same array item field names. Do NOT invent fields.
10. All copy must be production-ready, specific to Christiano PM and Malta.
11. CTAs must be action-oriented ("Request a revenue assessment", "Explore Sliema seafront stays").
12. Output a single JSON object. No surrounding text. No code fences.`;

    const user = `Page description: ${body.description}
Audience: ${body.audience ?? "infer from description"}
Style preset: ${body.style ?? "elegant"}
Page slug: ${body.pageSlug ?? "(new)"}

Return the JSON object now.`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: body.model ?? "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (aiRes.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again shortly." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (aiRes.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in Workspace settings." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!aiRes.ok) {
      const text = await aiRes.text();
      return new Response(JSON.stringify({ error: `AI gateway error: ${text}` }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await aiRes.json();
    const raw = data?.choices?.[0]?.message?.content ?? "{}";
    let parsed: any;
    try { parsed = JSON.parse(raw); }
    catch {
      const m = String(raw).match(/\{[\s\S]*\}/);
      parsed = m ? JSON.parse(m[0]) : {};
    }

    // Server-side sanitation: drop unknown types, ensure ids + visible flag.
    const allowed = new Set(allowedTypes);
    const blocks = Array.isArray(parsed?.blocks) ? parsed.blocks : [];
    const cleaned = blocks
      .filter((b: any) => b && typeof b === "object" && allowed.has(b.type))
      .map((b: any, i: number) => ({
        id: typeof b.id === "string" && b.id ? b.id : `b_${b.type}_${i}`,
        type: b.type,
        data: b.data && typeof b.data === "object" ? b.data : {},
        visible: b.visible !== false,
      }));

    const droppedTypes = blocks
      .filter((b: any) => b && b.type && !allowed.has(b.type))
      .map((b: any) => b.type);

    const root = parsed?.root && typeof parsed.root === "object" ? parsed.root : { props: {} };

    return new Response(
      JSON.stringify({
        root,
        blocks: cleaned,
        warnings: droppedTypes.length ? { droppedUnknownTypes: droppedTypes } : undefined,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
