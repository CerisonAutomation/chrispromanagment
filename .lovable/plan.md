# Plan: Block Registry + Puck-Style AI Editor + Per-Page SEO

Scope is large. I'm proposing one cohesive plan but breaking it into 4 independently shippable phases so we can review/commit between each. **Recommend approving Phase 1 first**, then iterating.

---

## Phase 1 — Centralized Block Registry (foundation for everything else)

Today block definitions are scattered across `src/lib/blocks.jsx` (903 lines), `blocksConsolidated.js`, `advancedBlocks.js`, and inline in `LiveBlocks.jsx` (1619 lines). No single source of truth → editor and renderer drift.

**Build** `src/lib/blockRegistry.ts`:

```text
BlockDefinition {
  type: string              // stable ID, e.g. "hero.carousel"
  category: "hero"|"content"|"media"|"booking"|"layout"|"social"|"seo"
  label, icon, description
  schema: ZodSchema         // validated content shape
  defaults: () => Content   // factory for new instances
  editorFields: Field[]     // declarative form (text|richtext|image|select|repeater|color|number|toggle)
  Renderer: React.FC<{content, editing}>
  ai: {
    useCases: string[]      // ["content-generation","summarization","image-analysis","translation"]
    suggestedModels: string[] // ["google/gemini-3-flash-preview", ...]
    promptTemplates: { generate?: string; improve?: string; translate?: string }
    canSuggest: boolean
  }
  seo?: { contributesHeadings: boolean; imageAltRequired: boolean }
}

registerBlock(def) / getBlock(type) / listBlocks(filter) / migrateContent(type, oldContent)
```

**Migrate every block** from `blocks.jsx`, `blocksConsolidated.js`, `advancedBlocks.js`, and the inline ones in `LiveBlocks.jsx` into the registry. Categories: Hero, Content, Media (gallery/video), Booking (Guesty listings, calendar, quote, search bar), Layout (grid, columns, spacer, divider), Social (testimonial, instagram), SEO (FAQ, structured-data).

**Refactor** `PageEditor.jsx` + `LiveBlocks.jsx` to render from the registry only (delete duplicated switch statements).

**Tests** (`src/lib/__tests__/blockRegistry.test.ts`):
- registers and retrieves a block by type
- rejects duplicate type IDs
- validates content against schema (good + bad payload)
- defaults() produces schema-valid content
- migrateContent upgrades v1 → current
- listBlocks filters by category and by ai.canSuggest

---

## Phase 2 — Puck-Style Visual Editor

Replace the current sidebar form editor with an in-canvas Puck-style experience:

- **Left rail**: block library grouped by category, drag to canvas
- **Canvas**: live page preview, click a block → inline floating toolbar (move up/down, duplicate, delete, AI-improve), right-rail shows that block's `editorFields` form
- **Right rail**: contextual — block fields when selected, page settings (incl. SEO from Phase 4) when nothing selected
- **Drag & drop reorder** using `@dnd-kit` (already in tree via shadcn)
- **Undo/redo** via a content history stack in `CMSContext`
- **Live preview toggle**: hides chrome, renders pure frontend

Uses the registry exclusively — no per-block hardcoding in the editor.

**Tests**:
- drag reorders blocks in state
- undo restores previous content
- selecting block populates right-rail with correct fields
- delete + duplicate work and update sort_order

---

## Phase 3 — AI Capabilities + Block Suggestions

Two edge functions (Lovable AI Gateway, default model `google/gemini-3-flash-preview`):

1. **`block-ai-action`** — given `{blockType, content, action: "generate"|"improve"|"translate"|"summarize", context}`, returns new content matching the block schema (tool-calling for structured output).
2. **`block-ai-suggest`** — given the current page's block list, returns suggested next blocks (type + rationale + pre-filled content) based on registry `ai.canSuggest` blocks and content gaps (e.g., page has hero + gallery but no CTA → suggest booking-search block).

Wire into editor:
- ✨ AI button on every selected block → action menu
- "Suggest next block" button at end of canvas → shows 3 cards with rationales
- AI Theme Editor: existing `ThemeEditor.jsx` gets a prompt box → AI proposes token changes (HSL only) applied to `index.css` design tokens preview

Document in `docs/AI_BLOCKS.md`: metadata fields, prompt templates, how to add AI to a new block.

**Tests**:
- edge function returns schema-valid content for each action
- 429/402 surfaced as toasts
- suggestion engine never suggests a block whose `canSuggest` is false

---

## Phase 4 — Per-Page SEO Overrides

**DB migration**: new table `cms_page_seo`
```text
page_slug text PK, meta_title text, meta_description text,
canonical_url text, og_image text, robots text, json_ld jsonb,
updated_at timestamptz
```
RLS: anyone read; admin/editor write (mirrors `cms_content`).

**Frontend**:
- New `<SEOHead>` component using `react-helmet-async` reads `cms_page_seo` for the current route, falls back to `index.html` sitewide defaults
- Editor right-rail "Page Settings" tab → SEO fields (title ≤60, description ≤160 with live counter, canonical, og:image picker from MediaLibrary, robots toggle, JSON-LD textarea)
- Precedence: per-page override > registry-contributed (e.g. FAQ block → FAQPage JSON-LD) > sitewide

Docs in `docs/SEO_OVERRIDES.md`.

**Tests**:
- override beats sitewide default
- missing override falls back cleanly
- title/description length validation
- canonical normalizes to relative path

---

## Cross-cutting

- **Git checkpoints**: I'll create a tiny skill `commit-after-plan` that wraps a logical commit message after each phase ships (note: Lovable manages git internally, so this surfaces as a checkpoint marker in chat history rather than a manual `git commit`).
- **No new external libs** beyond `@dnd-kit/*` (already transitive) and `react-helmet-async`.
- **Design tokens only** — no raw colors in any new component.
- **All edge functions** go through Lovable AI; no client-side keys.

---

## Suggested order of approval

1. **Approve Phase 1 now** → I ship registry + migrate blocks + tests.
2. Review, then approve Phase 2.
3. Then Phase 3.
4. Then Phase 4.

If you'd rather I ship all four in one go (auto-mode), say so — but Phase 1 alone touches ~5,500 lines of block code and is the right place to pause and verify nothing visually regressed before layering the editor rewrite on top.

**Questions before I start:**
- Phase-by-phase, or all-in-one auto-mode?
- Keep existing `LiveNavigateMode` (in-place edit on live frontend) **alongside** the new Puck editor, or replace it?
- Any blocks in `advancedBlocks.js` you want dropped rather than migrated?
