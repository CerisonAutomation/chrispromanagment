## Why login is broken

`src/components/modals/ContactModal.tsx` line 92 references an undefined symbol `API` inside the `useCallback` deps array:

```
}, [form, cms?.contact?.email, API]);
```

`API` is never imported, so the module throws `ReferenceError: API is not defined` on render. The modal is mounted by the global `ModalProvider`, so the crash propagates to every route that mounts the provider — including `/auth` and `/admin`. That's the "I can't log in" symptom.

**Fix:** drop `API` from the deps array (it was never used in the callback body).

## Admin gate logo

`src/pages/AdminPage.tsx` line 1929–1934 renders the locked-out admin gate with a gold-gradient tile + `<Sparkles>` icon. Replace it with the white brand logo already defined in CMS (`cms.brand.logoWhite`, fallback to the same URL `Header.tsx` uses). Keep the rest of the gate copy and the Sign In button unchanged.

## Mirror the full frontend in the editor

Today `ALL_PAGES` in `AdminPage.tsx` marks Properties, Property Detail, Checkout, Confirmation, and Map as `type: "preview"` — they render as a read-only iframe. Convert the public-facing pages into the same `type: "cms"` editor experience that Home/Owners use, driven by block lists stored under `cms.pages.<slug>.blocks`.

Scope (per your answer "Landing + Properties + Detail" + "All routes in src/pages"):

1. **Phase 1 — guest funnel as live-editable blocks**
   - `/properties` (`PropertiesPage`)
   - `/property/:id` (`PropertyDetailPage`)
   - `/` landing (already CMS, but audit blocks)
   - Refactor each page to read its block list via `useBlock`/`useEditableList` against a `pages.<slug>` namespace, falling back to the current hard-coded layout as defaults.
   - Add corresponding entries in `ALL_PAGES` as `type: "cms"` with `pageKey: "properties" | "property_detail" | …`.
   - Extend `live-blocks.tsx` with any missing renderers (`propertyHero`, `amenitiesList`, `bookingWidget`, `reviewCard`, `locationMap` — already declared in `blockRegistry` META but not wired into `LIVE_BLOCK_MAP`).

2. **Phase 2 — secondary routes**
   - `property-owners`, `concierge`, `chat`, `checkout`, `confirmation`, `map`, `arview`, `offline-booking`, `privacy-policy`, `terms`, `maintenance`, `landing`.
   - For each: add to `ALL_PAGES` as `type: "cms"`, give it a default block list (header + content blocks + footer), and switch the page to render via `BlockRenderer` over `cms.pages[slug].blocks` with the current JSX as the seed defaults.
   - Admin/dev-only routes (`admin`, `auth`, `audit-logs`, `error-dashboard`, `analytics-dashboard`, `automation-rules`, `pricing-engine`, `listings-management`, `owner-portal`, `tax-reports`, `property-tokens`) stay out of the editor.

3. **Phase 3 — editor surface upgrades**
   - Page Editor sidebar: show every mirrored page grouped by Guest / Owner / Legal / System.
   - Block Library: surface every registered block (Phase 1 added renderers) and group by `blockRegistry.category`.
   - Theme Editor: verify `theme-ai-generate` round-trip, persistence in `cms_settings.theme_tokens`, and live preview on the iframe; fix the apply path so token writes immediately re-style the mirrored editor canvas.
   - SEO Overrides: ensure each mirrored page has a row creator in `cms_page_seo` and that `useSEO`/`SEOHead` reads it on the public page.
   - Version History: snapshot the new `pages.<slug>` payloads in `cms_versions.snapshot`.

## Loop-fix sweep (target: 50 issues)

After the above, run a structured pass and fix everything we find. Each item below is one "issue" slot; the actual count will be filled as we go.

- Editor wiring: missing renderers, broken drag handles, stale field schemas, AI-fill on every block, default content for newly mirrored pages, block reordering on Properties/Detail.
- Data-driven correctness: Guesty data shape mismatches in `PropertyGallery`, lazy-load fallback chain on `SmartImage`, pagination on `/properties`, empty-state copy, skeletons.
- Theme: token allow-list coverage vs. actual usages in `index.css`, contrast guards, reset path.
- SEO: JSON-LD per page type, OG image fallback, canonical normalization.
- Accessibility: alt text required where `blockRegistry.seo.imageAltRequired`, focus states on the new editable elements, lightbox keyboard traps.
- Performance: memoize new live blocks, code-split per-page editors, kill duplicate `LiveBlocks` re-renders.
- Build hygiene: TypeScript errors surfaced by the new wiring, unused imports, stale `// keep existing code` markers.

We iterate until `npm run build`, vitest, and a manual click-through of every mirrored page in `/admin` show zero console errors and zero broken blocks.

## Files touched

- `src/components/modals/ContactModal.tsx` — fix deps array
- `src/pages/AdminPage.tsx` — logo swap, `ALL_PAGES` expansion, sidebar grouping
- `src/components/admin/live-blocks.tsx` — add missing renderers, register in `LIVE_BLOCK_MAP`
- `src/components/admin/block-library.tsx` — category grouping from registry
- `src/components/admin/theme-editor.tsx`, `seo-overrides-panel.tsx`, `version-history-panel.tsx` — coverage fixes
- `src/pages/properties-page.tsx`, `property-detail-page.tsx`, plus Phase-2 pages — switch to `BlockRenderer` over `cms.pages.<slug>.blocks`
- `src/context/cmscontext.tsx` — seed `pages.<slug>` defaults
- `src/lib/blocks.tsx` / `blockRegistry.js` — any missing field schemas
- Migration: optional `cms_pages` view or just rely on `cms_content` JSON (no schema change needed)

No backend schema changes are required; everything lives in existing `cms_content` JSON.
