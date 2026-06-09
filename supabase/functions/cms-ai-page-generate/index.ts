// CMS AI Page Generator — "ZENITH ORACLE" adapted for the Christiano PM
// block registry. Returns: { root:{props:{title,description}}, blocks:[...] }
// where every block uses an EXISTING type registered in src/lib/blockRegistry.js.
//
// Quality model:
//   1. Tight, registry-first system prompt (no broken upstream placeholders).
//   2. Strict JSON output via response_format.
//   3. Server-side sanitation: drop unknown types, deep-merge each block's
//      `data` with that block's `defaults` so required fields are NEVER missing.
//   4. Auto-repair pass: if the model returns 0 valid blocks or invalid JSON,
//      retry once with an error-feedback message.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface AvailableBlock {
  type: string;
  label?: string;
  category?: string;
  defaults?: Record<string, unknown>;
}

interface Body {
  description: string;
  audience?: "owners" | "guests" | "mixed";
  style?: "modern" | "minimal" | "bold" | "elegant";
  pageSlug?: string;
  availableBlocks: AvailableBlock[];
  model?: string;
}

// ── Catalog formatting ─────────────────────────────────────────────────────
function buildCatalog(blocks: AvailableBlock[]) {
  return blocks
    .map((b) => {
      const label = b.label ? ` — ${b.label}` : "";
      const cat = b.category ? ` [${b.category}]` : "";
      const shape = b.defaults
        ? `\n    schema: ${JSON.stringify(b.defaults)}`
        : "";
      return `- "${b.type}"${label}${cat}${shape}`;
    })
    .join("\n");
}

// Pick the first registered block whose type matches any candidate.
function pickFirst(types: Set<string>, candidates: string[]) {
  return candidates.find((t) => types.has(t)) || null;
}

// ── Deep merge helpers ─────────────────────────────────────────────────────
const isObj = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);

// Merge AI data into defaults so missing/required keys are never blank.
// Arrays: if AI provides an array, use it (but pad item shapes with defaults[0]
// when present). Objects: deep merge. Primitives: AI wins when defined.
function mergeWithDefaults(defaults: unknown, data: unknown): unknown {
  if (Array.isArray(defaults)) {
    const arr = Array.isArray(data) ? data : [];
    const template = isObj(defaults[0]) ? defaults[0] : null;
    if (!template) return arr.length ? arr : defaults;
    return arr.map((item) => mergeWithDefaults(template, item));
  }
  if (isObj(defaults)) {
    const src = isObj(data) ? data : {};
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(defaults)) {
      out[k] = k in src ? mergeWithDefaults(defaults[k], src[k]) : defaults[k];
    }
    // Keep AI-only extra keys (don't lose data).
    for (const k of Object.keys(src)) {
      if (!(k in out)) out[k] = src[k];
    }
    return out;
  }
  return data === undefined || data === null || data === "" ? defaults : data;
}

// ── Prompt builder ─────────────────────────────────────────────────────────
function buildSystemPrompt(
  catalog: string,
  allowedTypes: string[],
  hasHeader: boolean,
  hasFooter: boolean,
  heroPreferred: string | null,
  ctaPreferred: string | null
) {
  return `You are ZENITH ORACLE — the master page architect for Christiano Property Management (Christiano PM), a luxury short-term rental + property management brand in Malta.

Brand voice: cinematic, refined, calm, confident, conversion-focused. Audiences are property OWNERS (revenue, trust, hands-off management) and GUESTS (cinematic stays, smooth booking). Locations: Valletta, Sliema, St Julian's, Mellieħa, Gozo. Visual system is dark luxury with gold accent #D4AF37.

YOUR JOB
Generate a complete, production-ready landing page as a single JSON object using ONLY the block types listed in BLOCK CATALOG below. No prose, no markdown, no code fences — JSON only.

OUTPUT SHAPE (exact):
{
  "root": {
    "props": {
      "title":       "<= 60 char SEO title with primary keyword",
      "description": "120-160 char meta description with CTA verb"
    }
  },
  "blocks": [
    { "id": "b_<slug>", "type": "<one allowed type>", "data": { ...matches that block's schema... }, "visible": true }
  ]
}

BLOCK CATALOG (live, generated from blockRegistry — the schema after each type shows the EXACT shape and field names that "data" must use):
${catalog}

HARD RULES — violations are rejected
1. "type" MUST be one of: ${allowedTypes.map((t) => `"${t}"`).join(", ")}. Never invent types or aliases.
2. "data" for each block MUST use the exact keys from that block's schema above. Same key names, same array item field names. Do NOT rename ("heading" vs "title"), do NOT add unknown fields.
3. Arrays in the schema (e.g. items, slides, features, faqs) MUST be filled with 3–6 high-quality items by default, matching the schema's item shape.
4. ${hasHeader ? `First block MUST be type "header".` : `(no header block registered — skip)`}
5. ${hasFooter ? `Last block MUST be type "footer".` : `(no footer block registered — skip)`}
6. Include exactly ONE hero block near the top${heroPreferred ? ` — prefer "${heroPreferred}"` : ""}.
7. Include 4–10 substantive content sections between hero and footer (features, listings, testimonials, stats, gallery, faq, etc.).
8. Include at least one strong call-to-action${ctaPreferred ? ` — use "${ctaPreferred}"` : ""} before the footer.
9. Total blocks: 8–16.
10. Every block needs a unique short snake_case "id" prefixed "b_" (e.g. "b_hero", "b_feat_1", "b_cta_owner").
11. "visible" is always true unless the user asked to hide a block.

COPY RULES
- Production-grade English. Never "Lorem ipsum", "TBD", "Your text here", placeholder URLs, or empty strings.
- Use Malta-aware concrete signals (Valletta limestone, Sliema seafront, Gozo coves, harbour views).
- Headlines: punchy, benefit-led, 4–9 words. Subheads: 12–22 words, specific.
- Owner audience emphasizes: revenue uplift, occupancy, trust, hands-off operations, transparent reporting.
- Guest audience emphasizes: cinematic stays, location, comfort, instant booking, concierge.
- Mixed audience: lead with brand authority, weave both value props.

IMAGES
- For image fields, use https://images.unsplash.com/photo-... style URLs (real Unsplash photo IDs you know exist) OR leave as the schema default. Never invent "example.com" URLs.

Return ONLY the JSON object. No commentary.`;
}

// ── AI call ────────────────────────────────────────────────────────────────
async function callAI(apiKey: string, model: string, system: string, user: string) {
  const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    }),
  });
  return aiRes;
}

function parseJsonLoose(raw: string): any {
  try { return JSON.parse(raw); }
  catch {
    const m = String(raw).match(/\{[\s\S]*\}/);
    return m ? JSON.parse(m[0]) : {};
  }
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
    const allowedSet = new Set(allowedTypes);
    const defaultsByType = new Map<string, Record<string, unknown>>(
      body.availableBlocks.map((b) => [b.type, (b.defaults as Record<string, unknown>) || {}])
    );

    const hasHeader = allowedSet.has("header");
    const hasFooter = allowedSet.has("footer");
    const heroPreferred = pickFirst(allowedSet, ["hero_carousel", "heroCarousel", "hero"]);
    const ctaPreferred = pickFirst(allowedSet, ["cta", "callToAction", "newsletter"]);

    const system = buildSystemPrompt(catalog, allowedTypes, hasHeader, hasFooter, heroPreferred, ctaPreferred);
    const user = `Page brief: ${body.description}
Audience: ${body.audience ?? "infer from the brief"}
Style preset: ${body.style ?? "elegant"}
Page slug: ${body.pageSlug ?? "(new)"}

Generate the JSON object now. Remember: only types from the catalog, data keys must match each block's schema exactly, fill array fields with 3–6 great items, no placeholders.`;

    const model = body.model ?? "google/gemini-3-flash-preview";

    // ── Attempt 1 ────────────────────────────────────────────────────────
    let aiRes = await callAI(apiKey, model, system, user);

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

    let data = await aiRes.json();
    let raw = data?.choices?.[0]?.message?.content ?? "{}";
    let parsed = parseJsonLoose(raw);
    let blocks = Array.isArray(parsed?.blocks) ? parsed.blocks : [];

    const droppedTypes: string[] = [];
    const passOne = sanitize(blocks, allowedSet, defaultsByType, droppedTypes);

    // ── Repair attempt if too few valid blocks ──────────────────────────
    let finalBlocks = passOne;
    let root = parsed?.root && typeof parsed.root === "object" ? parsed.root : { props: {} };

    if (finalBlocks.length < 6) {
      const feedback = `Your previous response had only ${finalBlocks.length} valid blocks${droppedTypes.length ? ` and used invalid types: ${[...new Set(droppedTypes)].join(", ")}` : ""}. Regenerate the full page using ONLY the allowed types and matching each block's schema exactly. Aim for 10–14 blocks.`;
      aiRes = await callAI(apiKey, model, system, `${user}\n\nREPAIR FEEDBACK: ${feedback}`);
      if (aiRes.ok) {
        data = await aiRes.json();
        raw = data?.choices?.[0]?.message?.content ?? "{}";
        parsed = parseJsonLoose(raw);
        blocks = Array.isArray(parsed?.blocks) ? parsed.blocks : [];
        const droppedTwo: string[] = [];
        const passTwo = sanitize(blocks, allowedSet, defaultsByType, droppedTwo);
        if (passTwo.length > finalBlocks.length) {
          finalBlocks = passTwo;
          droppedTypes.push(...droppedTwo);
          if (parsed?.root && typeof parsed.root === "object") root = parsed.root;
        }
      }
    }

    if (finalBlocks.length === 0) {
      return new Response(JSON.stringify({ error: "AI returned no valid blocks. Try refining the brief or pick a different style." }), {
        status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        root,
        blocks: finalBlocks,
        warnings: droppedTypes.length ? { droppedUnknownTypes: [...new Set(droppedTypes)] } : undefined,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// ── Sanitize blocks: drop unknown types, deep-merge data with defaults, ensure id ─
function sanitize(
  blocks: any[],
  allowed: Set<string>,
  defaultsByType: Map<string, Record<string, unknown>>,
  dropped: string[]
) {
  const seenIds = new Set<string>();
  const out: any[] = [];
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (!b || typeof b !== "object" || typeof b.type !== "string") continue;
    if (!allowed.has(b.type)) {
      dropped.push(b.type);
      continue;
    }
    const defaults = defaultsByType.get(b.type) || {};
    const mergedData = mergeWithDefaults(defaults, b.data) as Record<string, unknown>;

    let id = typeof b.id === "string" && b.id ? b.id : `b_${b.type}_${i}`;
    if (seenIds.has(id)) id = `${id}_${i}`;
    seenIds.add(id);

    out.push({
      id,
      type: b.type,
      data: mergedData,
      visible: b.visible !== false,
    });
  }
  return out;
}
