# Plan v3 — Consolidated Max-Enterprise, Zero Gaps, One-Shot

Single source of truth. Merges v1 + v2 + everything outstanding from chat. Ordered so each phase is independently shippable, with explicit acceptance criteria and 1-command rollback. Nothing depends on a future phase.

---

## Reality baseline (already shipped — DO NOT rebuild)

| Capability | Location |
|---|---|
| Guesty BEAPI pipeline (vault → token-refresh → BEAPI → stale-while-error cache → `guesty.*` client → `useGuesty*` hooks) | `supabase/functions/guesty-*`, `src/lib/guesty.js`, `src/hooks/use-guesty.js`, `src/hooks/use-booking-flow.js` |
| Listing/booking UI wired through `useBookingFlow` | `src/pages/PropertyDetailPage.jsx`, `src/pages/CheckoutPage.jsx` |
| Coupon + payment-provider checkout step | `src/components/CheckoutExtrasPanel.jsx` (mounted in CheckoutPage:517) |
| Admin cache hit/miss + clear panel | `src/components/admin/CacheDebugPanel.jsx` (mounted in AdminPage:1567) |
| Per-page SEO overrides | `cms_page_seo` table + `src/hooks/use-page-seo.js` + `src/components/SEOHead.jsx` |
| Centralized block registry | `src/lib/blockRegistry.js` + `docs/BLOCK_REGISTRY.md` + tests |
| Guesty client-credentials token rotation (uses `GUESTY_CLIENT_ID`/`SECRET` only inside `guesty-token-refresh`; every other function reads `guesty_token_vault`) | `supabase/functions/guesty-token-refresh` |

Anything below that touches these must extend or document — never rebuild.

---

## Phase order (revenue → leverage → cleanup → polish)

```text
P1  AI Theme Editor (Puck-style live iframe)        ← user's stated focus
P2  Block registry AI metadata + block-ai-suggest   ← multiplies P1
P3  Editor consolidation (LiveBlocks <400 lines)    ← debt removal
P4  SEO override admin UI + sitemap.xml             ← finish the half-shipped SEO work
P5  Observability + perf hardening                  ← enterprise polish
```

---

## Phase 1 — AI Theme Editor (Puck-style, live)

**Goal:** non-technical editor types "warmer Provençal at golden hour, less corporate" and the site reskins in <3s in a live iframe; Save persists.

### Architecture
```text
+----------------------------------------------------+
| Admin → Theme                                      |
| ┌─────────────┐  ┌──────────────────────────────┐ |
| │ Left rail   │  │ Live iframe (src=/)          │ |
| │  Token list │  │ postMessage bridge:          │ |
| │  HSL pickers│  │  parent.setTokens(patch) →   │ |
| │  Font pair  │  │  iframe sets                 │ |
| │             │  │  documentElement.style       │ |
| │ AI prompt   │  │  .setProperty('--x', hsl)    │ |
| │ [textarea]  │  │  (no reload, no flash)       │ |
| │ [Apply AI]  │  │                              │ |
| │ [Save][Reset]│ │                              │ |
| └─────────────┘  └──────────────────────────────┘ |
+----------------------------------------------------+
```

### Pieces
1. **Edge function `theme-ai-generate`** — Lovable AI Gateway, `google/gemini-3-flash-preview`, structured tool-calling. Input: current token map + user prompt. Output: `{ tokens: { "--primary": "32 45% 52%", ... } }`. Validates HSL triplets, rejects raw hex, filters unknown token names against allow-list. Surfaces 429/402 as JSON.
2. **`ThemeEditor.jsx` rewrite** — three-pane Puck layout. Iframe loads `/`. Token edits → `postMessage` → child listener calls `setProperty`. Persists to `cms_settings.theme_tokens`.
3. **Boot bootstrap** — `src/main.tsx` reads `cms_settings.theme_tokens` and applies before first paint to avoid FOUC.
4. **Public-site listener** — small module mounted in `src/App.tsx` that listens for `postMessage({type:'lov-theme', tokens})` and applies, gated by same-origin check.

### Acceptance
- "ocean and sage, less gold" → ≤3s → iframe visually shifts.
- Save → reload `/` → theme persists.
- Reset → DOM and DB return to `index.css` defaults.
- CI grep: zero raw hex in admin theme code.
- Zero changes to any block component.

### Rollback
`DELETE FROM cms_settings WHERE setting_key = 'theme_tokens';`

---

## Phase 2 — Block registry AI metadata + suggestions

### Pieces
1. **Extend each registry entry** with two optional fields:
   - `aiUseCases: string[]` from `{generate, improve, summarize, translate, imageAlt, imageGenerate}`
   - `suggestedModels: string[]` (Lovable AI Gateway IDs; default `google/gemini-3-flash-preview`)
2. **Backfill all blocks**: hero/content/faq → `[generate, improve]`; gallery/image → `[imageAlt, imageGenerate]`; booking blocks → `[]`.
3. **Edge function `block-ai-suggest-blocks`** — input = current page's block list, output = `{ suggestions: [{ blockType, reason, suggestedContent, confidence }] }`, max 5, blockType validated against registry.
4. **PageEditor "Suggest next block (AI)" drawer** — renders 3–5 cards; click inserts using registry defaults + AI content.

### Acceptance
- Vitest: every registry entry has both new fields and only allow-list values.
- Suggestion endpoint never returns invalid `blockType`.
- Empty page → ≥1 hero suggestion.
- Page with `[hero, gallery, faq]` → no duplicate hero suggested.

### Rollback
Fields are optional; revert edge function + drawer.

---

## Phase 3 — Editor consolidation

Three things edit pages today: `PageEditor.jsx` (form), `LiveNavigateMode.jsx` (in-place), `LiveBlocks.jsx` (1619-line renderer). **Decision:** keep `LiveNavigateMode` canonical, demote `PageEditor` to a shell hosting Theme + AI Suggestions + block library.

### Pieces
1. Replace every `switch (block.type)` in `LiveBlocks.jsx` with `<BlockRenderer />` resolving via registry.
2. Delete renderer duplicates in `blocks.jsx`, `blocksConsolidated.js`, `advancedBlocks.js` where they shadow registry entries.
3. `PageEditor.jsx` becomes a shell: Theme tab + AI Suggestions tab + library.

### Acceptance
- `rg "switch.*block\\.type" src/` returns 0 outside registry.
- `LiveBlocks.jsx` < 400 lines.
- Home + 2 listing pages render identical block output (snapshot test).

### Rollback
Revert deletions; registry is additive.

---

## Phase 4 — SEO override admin UI + sitemap

Data layer exists (`cms_page_seo`, `use-page-seo.js`, `SEOHead.jsx`). Missing: editor UI + sitemap + structured-data audit.

### Pieces
1. **SEO tab inside `LiveNavigateMode` page settings** — fields: meta title (<60 char counter), meta description (<160 char counter), canonical URL, OG image picker, robots (index/noindex). Writes `cms_page_seo`.
2. **Edge function `sitemap-xml`** — generates `/sitemap.xml` from `cms_pages` + live listings via `guesty.listings()`. Cached 1h.
3. **`robots.txt`** under `/public` referencing sitemap.
4. **JSON-LD per block category** — Listings emit `LodgingBusiness`; FAQ blocks emit `FAQPage`; Hero emits `WebSite`. Already partial — close gaps.
5. **One-paragraph doc** in `docs/SEO.md` explaining override > sitewide precedence.

### Acceptance
- Edit page → save → `<title>` and meta visible in view-source within 1s.
- `/sitemap.xml` returns 200 with all published pages + listings.
- Lighthouse SEO ≥ 95 on home + 1 listing page.

### Rollback
Hide the SEO tab; data layer is harmless if unused.

---

## Phase 5 — Observability + perf hardening

### Pieces
1. **Edge function structured logging** — every `guesty-*` function logs `{fn, ms, cacheHit, status, requestId}` JSON; surfaced in `CacheDebugPanel`.
2. **Frontend perf marks** — `performance.mark` around `useBookingFlow` quote/confirm; render p95 in `CacheDebugPanel`.
3. **Error boundary** — top-level `<ErrorBoundary>` in `App.tsx` posting to a new `client-errors` edge function (table `client_error_log`, RLS: only admins read).
4. **429 / 402 toast surface** — single hook `useGatewayErrors` consumed by Theme AI + Block AI + future AI calls.
5. **Cache TTL tuning** — listings 5m, calendar 1m, quotes no-cache, theme tokens 24h.

### Acceptance
- Hitting Guesty cooldown shows a single global toast, not silent failure.
- `CacheDebugPanel` shows live hit/miss + p95 latency per function.
- Throwing in any block renders the error boundary, logs persist to DB.

### Rollback
Toggle off via `cms_settings.observability_enabled`.

---

## Explicitly OUT of scope

| Item | Why |
|---|---|
| Drag-and-drop with `@dnd-kit` | Not requested, scope creep, adds dep. |
| Undo/redo history | Large state-machine work, adds bugs. |
| TypeScript pivot | Project is JSX; mixing = friction with no benefit. |
| `zod` | Not installed; existing validators are sufficient. |
| `react-helmet-async` | `SEOHead.jsx` already covers this. |
| Fixing Guesty 22h cooldown | Outside our control — only Guesty support can. |
| New auth provider | Existing auth is fine. |

---

## Honest risks
1. **Guesty cooldown** persists until Guesty lifts the 429. No phase fixes that.
2. **Iframe bridge (P1)** assumes admin + public site share origin (`*.lovable.app` / same custom domain). Cross-origin needs an explicit child listener — already included.
3. **AI suggestions (P2)** can hallucinate block types — registry validator catches them; UX must show "no suggestions" not empty silence.
4. **Editor consolidation (P3)** is the riskiest because it deletes code. Ship after P1+P2 stable 24h.

---

## Recommended execution

Ship in order. Each phase is one PR-sized commit, independently revertible.

Reply **"Ship P1"** (or **"Ship P1–P2"**, **"Ship all"**) and I execute without further questions.
