# Plan v2 — Rewritten after brutal critique

Old plan had four flaws: it re-built work already shipped (SEO), buried the user's stated focus (AI Theme Editor), bundled risky refactors into giant single-shot phases, and never decided which of three competing editors dies. This version fixes all four.

---

## Reality check first (no work needed on these)

| Already shipped | Where | Verdict |
|---|---|---|
| Per-page SEO overrides | `cms_page_seo` table, `src/components/SEOHead.jsx`, `src/hooks/use-page-seo.js` | Keep. Document the override > sitewide precedence in one paragraph, done. |
| Block registry interface | `src/lib/blockRegistry.js` + `docs/BLOCK_REGISTRY.md` + tests | Keep. Extend, don't replace. |
| Guesty BEAPI pipeline (vault → token → BEAPI → stale-while-error cache → frontend hooks) | `supabase/functions/guesty-*`, `src/lib/guesty.js`, `src/hooks/use-guesty.js` | Keep. Currently degraded by Guesty's 22h cooldown — outside our control. |
| Coupon + payment-provider step in checkout | `src/components/CheckoutExtrasPanel.jsx` | Keep. |
| Admin cache hit/miss panel | `src/components/admin/CacheDebugPanel.jsx` | Keep. |

Anything below that touches a "Keep" item must extend or document — never rebuild.

---

## Reordered by your stated focus + business value

You said **"FOCUS ON THIS"** next to the AI Theme Editor. Bookings are revenue. Editor chrome is internal-only. Order reflects that:

```text
Phase 1  →  AI Theme Editor (Puck-style, live)         ← your focus
Phase 2  →  Block registry AI metadata + suggestions   ← multiplies Phase 1
Phase 3  →  Editor consolidation (kill the duplicates) ← cleanup, not user-visible
```

Each phase is a single PR-sized commit, independently shippable, with explicit acceptance criteria and a 1-command rollback.

---

## Phase 1 — AI Theme Editor (the focus)

**Goal:** non-technical editor types "make this feel more like a Provençal villa at golden hour, less corporate" and sees the site re-skin in <3 seconds, then clicks Save.

### Architecture

```text
+-----------------------------------------------------+
| /admin → Theme tab                                  |
|                                                     |
| ┌────────────────┐  ┌───────────────────────────┐  |
| │ Left rail      │  │ Live iframe preview       │  |
| │  Tokens        │  │  src = /                  │  |
| │   • colors     │  │  postMessage bridge:      │  |
| │   • typography │  │  parent → iframe sets     │  |
| │   • spacing    │  │  document.documentElement │  |
| │   • radius     │  │  .style.setProperty(...)  │  |
| │   • shadows    │  │                           │  |
| │                │  │  (no reload, no flash)    │  |
| │  AI prompt     │  │                           │  |
| │  [ textarea  ] │  │                           │  |
| │  [ Apply AI  ] │  └───────────────────────────┘  |
| │  [ Save      ] │                                  |
| └────────────────┘                                  |
+-----------------------------------------------------+
```

### Pieces

1. **`theme-ai-generate` edge function** (new). Lovable AI Gateway, `google/gemini-3-flash-preview`, structured tool-calling. Input: current token map + user prompt. Output: `{ tokens: { "--primary": "32 45% 52%", ... } }`. Validates every value is HSL triplet, rejects raw hex. Returns 429/402 as friendly toasts.
2. **`ThemeEditor.jsx` rewrite** as the three-pane layout above. Iframe preview points at `/`. Token changes apply via `postMessage` → `setProperty` (no reload). Persists to existing `cms_settings` row `theme_tokens` (table already exists, schema fits).
3. **Bootstrap on app start**: `src/main.tsx` reads `cms_settings.theme_tokens` and applies once before first paint to avoid flash-of-default-theme.

### Acceptance criteria (you can verify yourself)

- Type "ocean and sage, less gold" → ≤3s → site visibly shifts to blues/greens in the iframe.
- Click Save → reload `/` in a new tab → new theme persists.
- Click Reset → original tokens restored from `index.css` defaults.
- No raw hex anywhere in the diff (grep test in CI).
- Zero changes to any block component — all theming flows through CSS vars.

### Rollback

`DELETE FROM cms_settings WHERE setting_key = 'theme_tokens';` — site instantly returns to baked-in defaults from `index.css`.

### Test cases

- HSL parser rejects `#ff0000`, accepts `0 100% 50%`.
- AI patch with unknown token name (`--banana`) is filtered out before apply.
- 429 from AI Gateway surfaces as toast, not silent failure.
- Save then reload restores from DB.
- Reset clears DB and DOM in same action.

### What this is NOT (scope guard)

- Not a font-file uploader — token only switches CSS var, fonts must already be loaded.
- Not a per-page theme — global only. Per-page would need a different storage shape.
- Not free-form CSS injection — AI can only patch known token names from an allow-list.

---

## Phase 2 — Block registry AI metadata + suggestions

Builds on existing `src/lib/blockRegistry.js`. **Extends, doesn't replace.**

### Pieces

1. **Add two optional fields** to every existing registry entry:
   - `aiUseCases: string[]` — values from a closed set: `generate | improve | summarize | translate | imageAlt | imageGenerate`
   - `suggestedModels: string[]` — Lovable AI Gateway IDs only (default `google/gemini-3-flash-preview`)
2. **Backfill every existing block** with sensible defaults. Hero/Content/FAQ → `[generate, improve]`. Gallery/Image → `[imageAlt, imageGenerate]`. Booking blocks → `[]` (data-driven, no AI).
3. **`block-ai-suggest` edge function** (new, separate from existing `block-ai-suggest` which does something else — name it `block-ai-suggest-blocks` to avoid collision; check first). Input: current page's block list. Output via tool-calling: `{ suggestions: [{ blockType, reason, suggestedContent, confidence }] }`, max 5.
4. **Wire into `PageEditor.jsx`**: "Suggest next block (AI)" button. Side drawer shows cards. Click → inserts using registry defaults + AI-suggested content.

### Acceptance criteria

- Every entry in `blockRegistry.js` has both new fields (lint check).
- Suggestion endpoint never returns a `blockType` not in the registry (validation guard).
- Suggestion drawer renders 3–5 cards; clicking one appends a block to the page.
- 429/402 surfaced as toast.

### Test cases

- Vitest: every registry entry has `aiUseCases` (array, non-null) and `suggestedModels` (array, all values match allow-list).
- Suggestion edge function with empty page → returns ≥1 hero-category suggestion.
- Suggestion edge function with `[hero, gallery, faq]` → does NOT re-suggest hero.
- Unknown `blockType` from model → filtered out, not crashed.

### Rollback

The two fields are optional. Revert the function file and the editor button; registry consumers ignore unknown fields.

---

## Phase 3 — Editor consolidation (kills duplicates, no new user features)

Today three things edit pages: `PageEditor.jsx` (sidebar form), `LiveNavigateMode.jsx` (in-place on live frontend), and `LiveBlocks.jsx` (1619 lines, renders blocks). This is the real tech debt.

**Decision (was a question in v1, now a decision):** keep `LiveNavigateMode` as the canonical authoring surface (it's closer to Puck — edit on the live page). Demote `PageEditor.jsx` to a thin shell that mounts the Theme Editor and AI Suggestions panel. Do NOT build a fourth editor.

### Pieces

1. **Audit `LiveBlocks.jsx`**: every `switch (block.type)` arm must come from the registry, not from inline JSX. Replace with `<BlockRenderer type={block.type} content={block.content} />` that resolves via registry.
2. **Delete duplicated renderers** from `blocks.jsx`, `blocksConsolidated.js`, `advancedBlocks.js` where they shadow registry entries. Track the line-count delta as the acceptance metric.
3. **`PageEditor.jsx`** keeps only: Theme tab (Phase 1), AI Suggestions tab (Phase 2), block library list. Page authoring happens in `LiveNavigateMode`.

### Acceptance criteria

- `rg "switch.*block\.type" src/` returns 0 results outside the registry.
- `LiveBlocks.jsx` drops below 400 lines (currently 1619).
- Every block previously rendered still renders in the live preview (manual smoke test on home + 2 listing pages).

### Rollback

Revert the file deletions. Registry remains additive.

### Test cases

- Snapshot test: render every registry block with defaults; output is non-empty and has no `undefined` strings.
- Smoke test (Playwright optional, manual acceptable): home page + 2 listing pages render the same block types before and after.

---

## What I deliberately CUT vs. v1

| v1 item | Cut reason |
|---|---|
| Phase 4 SEO overrides | Already shipped. One-paragraph doc update only. |
| Drag-and-drop reorder with `@dnd-kit` | Not requested, adds dep, scope creep. |
| Undo/redo history stack | Not requested, large state-machine work, adds bugs. |
| TypeScript pivot for registry | Project is JSX. Mixing runtimes = friction with no benefit. |
| Zod | Not installed. Use plain validators in registry (already the pattern). |
| `commit-after-plan` skill | Lovable manages git internally — performative. |
| `react-helmet-async` | Project already does per-route SEO via `SEOHead.jsx` + Supabase. Don't add a parallel mechanism. |

---

## Honest risks

1. **Guesty cooldown** is independent of this plan. Site stays cached-stale until Guesty lifts the 429. Nothing in Phases 1–3 fixes that — only Guesty support can.
2. **Iframe preview in Phase 1** requires same-origin for `postMessage` + `setProperty`. Works on `*.lovable.app` and custom domains where the admin and the public site share an origin. If you ever serve admin on a different domain, the bridge needs `postMessage` + a listener inside the public app instead — note for future.
3. **AI suggestions in Phase 2** can hallucinate `blockType` values. The filter guard catches it but the drawer may show "no suggestions" if all 5 were invalid — UX must communicate that, not silently render empty.

---

## Recommended sequence

1. **Approve Phase 1 only** → I ship the AI Theme Editor end-to-end with the iframe bridge, edge function, and persistence. You can verify it the moment it's deployed.
2. Review the live result. If the iframe bridge feels right, approve Phase 2.
3. Phase 3 only after Phases 1+2 are stable for 24h — it's the riskiest because it deletes code.

Reply with **"Ship Phase 1"** and I'll execute without further questions.