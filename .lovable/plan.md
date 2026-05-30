# CMS / AI Editor — Rolling Plan (v3)

Slices ship one per turn. Each slice = measurable diff, 1-command rollback, edge-function rate-limit toasts surfaced.

## ✅ Shipped this turn — Slice A: Context-aware AI inline actions

**File:** `src/components/admin/LiveNavigateMode.jsx`
- Added `Improve / Shorter / Expand / Rewrite` buttons to the live-edit side panel.
- Routes through existing `block-ai-action` edge function as a synthetic single-field block (`{text}`).
- Context passed: surrounding DOM tag + current URL → tone-matched rewrites for headings vs body vs buttons.
- 429/402 surfaced as toasts. No new tables, no new edge function, no migration.
- Rollback: revert `LiveNavigateMode.jsx`.

## 🟡 Queued — one per turn, in order

### Slice B: Cmd+K AI command palette
- New `<AICommandPalette />` mounted in `AdminPage.jsx`.
- `Cmd+K` opens; presets ("Rewrite for SEO", "Make shorter", "Translate to Italian") + free-form prompt.
- Targets currently-focused live-edit selection. Reuses `block-ai-action`.
- Risk: low. Files: 1 new component, 1 edit to AdminPage.

### Slice C: Multi-step page generator
- New edge function `cms-page-generate`: outline → block skeletons → fill copy (3 LLM calls).
- Reads block registry catalog, returns `{ blocks: [...] }` validated against block schemas.
- "Generate page" button in PageEditor opens prompt modal, streams progress.
- Risk: medium (new function, multi-step latency). Add timeout + cancel.

### Slice D: Auto-nav + internal linking AI
- New edge function `cms-nav-suggest`: reads all `cms_content` pages, returns proposed `NavItem[]` + `InternalLinkSuggestion[]`.
- New admin tab "AI Navigation" — reviewer UI, apply-on-confirm writes to `cms_settings`.
- Header/Footer components read nav from `cms_settings` (replaces hardcoded items).
- Risk: medium (touches global chrome).

### Phase 3: Editor consolidation + mirror canvas
- `LiveNavigateMode` becomes canonical. `PageEditor.jsx` demoted to thin shell.
- `LiveBlocks.jsx` (1619 lines) → split per-category, replace `switch(block.type)` with `<BlockRenderer />` from registry.
- Header/Footer dynamic from `cms_content` (no hardcoded layout in components).
- Risk: high. Do AFTER slices B–D land and are stable for 24h.

## Explicitly out of scope (rejected, do not re-propose)
- Single-file "OmniBuilder v4" rewrite — bricks the editor, no rollback.
- TypeScript migration of the editor — separate decision.
- New deps: Puck, @dnd-kit (drag-and-drop ships later if needed), react-helmet-async.
- Streaming AI in inline editor — defer to Slice C where it matters.
