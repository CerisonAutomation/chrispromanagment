# Zenith → Vite Port Plan

Source: uploaded Next.js project (`project.zip`, Christiano PM v5).
Target: this Vite + React Router + Supabase project.

## Stage 1 — DONE
- `supabase/functions/cms-ai-page-generate/_oracle-prompt.ts` — verbatim copy of `ZENITH_ORACLE_SYSTEM_PROMPT` from upstream `src/lib/ai/zenith-engine.ts` (lines 461–624).
- Edge function `cms-ai-page-generate/index.ts` now imports the upstream prompt and appends a runtime override block listing only the live `blockRegistry` types so the model emits JSON our renderer can parse.
- Reference copies kept for stages 2–4:
  - `docs/zenith/upstream-registry.ts.txt` — full BLOCK_REGISTRY (≈110 types).
  - `docs/zenith/upstream-schema.ts.txt` — block schema/zod source.
  - `docs/zenith/agent-ctx/` — upstream agent role briefs.

## Block mapping (Stage 2 target)

| Upstream `BlockType`            | Local registry key   | Action                             |
| ------------------------------- | -------------------- | ---------------------------------- |
| `nav` / `site-header`           | `header`             | alias (existing)                   |
| `hero`                          | `hero`               | existing                           |
| `hero-carousel`                 | `hero_carousel`      | existing (CarouselHero)            |
| `hero-split` / `hero-video`     | —                    | PORT                               |
| `banner`                        | —                    | PORT                               |
| `text` / `rich-text`            | `textBlock` / `richText` | existing                       |
| `columns`                       | `columns`            | existing                           |
| `image-text` / `about`          | —                    | PORT                               |
| `quote`                         | `quote`              | existing                           |
| `services` / `owners`           | —                    | PORT                               |
| `property-grid` / `property-featured` / `property-card` | `listingsGrid` | alias |
| `property-map`                  | `mapBlock`           | alias                              |
| `booking-widget` / `availability` | `guestyCalendar` / `guestyQuote` | alias            |
| `properties*` (page sections)   | —                    | PORT (PropertiesPage composition)  |
| `search-bar`                    | `searchBar`          | existing                           |
| `stats`                         | `stats`              | existing                           |
| `features`                      | `features`           | existing                           |
| `testimonials` / `team` / `logos` / `comparison` | `testimonials` / — / — / — | testimonials existing; rest PORT |
| `pricing`                       | `pricing`            | existing                           |
| `faq`                           | `faq`                | existing                           |
| `timeline` / `process`          | —                    | PORT                               |
| `image` / `gallery` / `video` / `map-embed` | `imageBlock` / `gallery` / `videoBlock` / `mapBlock` | existing |
| `location-*` (8 blocks)         | —                    | PORT                               |
| `cta` / `cta-split` / `contact` / `form` / `newsletter` | `cta` / — / `contactForm` / `contactForm` / `newsletter` | partial; PORT split + variants |
| `guesty-listings` / `guesty-booking` | `listingsGrid` / `guestyQuote` | alias                  |
| `google-map` / `social-feed` / `stripe-payment` | `mapBlock` / — / — | partial; PORT social + payment shell |
| `renovation-*` (4 blocks)       | —                    | PORT                               |
| `floating-cta` / `exit-intent` / `countdown-timer` / `social-proof` / `guarantee-badge` / `calculator` / `pricing-toggle` / `comparison-table` | — | PORT |
| `footer`                        | `footer`             | existing                           |
| `divider` / `spacer` / `html` / `script` | `divider` / `spacer` / `embed` / — | existing; skip `script` for security |
| `section-wrapper` / `grid-layout` / `sidebar-layout` / `card-grid` / `full-screen-section` / `split-section` / `asymmetric-layout` / `masonry-grid` / `diagonal-section` / `curved-section` | `grid` / — | PORT as layout primitives |
| `accordion` / `tabs` / `content-carousel` / `logo-cloud` / `numbered-steps` / `icon-grid` / `side-by-side` / `key-metrics` / `video-background` / `image-reveal` | — | PORT |
| `status-card` / `findings-list` / `collapsible-section` / `progress-indicator` / `status-tree` / `action-bar` / `expandable-logs` / `alert-banner` / `approval-workflow` / `status-message` / review-*/PR-* | — | SKIP (internal admin/PR review blocks, not customer-facing) |
| `scroll-reveal` / `parallax-image` / `magnetic-button` / `tilt-card` / `count-up` / `typewriter` / `marquee` / `text-reveal` / `scroll-video` / `parallax-depth` / `reveal-text` / `stagger-grid` / `morph-shape` / `glitch-text` / `spotlight-card` / `wavy-divider` | — | PORT (Framer Motion, premium animation suite) |

## Stage 2 priority

1. Premium animation suite (`scroll-reveal`, `parallax-image`, `tilt-card`, `marquee`, `count-up`, `text-reveal`, `spotlight-card`, `wavy-divider`).
2. Conversion premium (`floating-cta`, `countdown-timer`, `social-proof`, `guarantee-badge`, `pricing-toggle`).
3. Location suite (`neighborhood-guide`, `area-highlights`, `distance-matrix`, `local-tips`, `location-hero`).
4. Renovation suite (`renovation-compare`, `renovation-gallery`, `renovation-story`, `renovation-stats`).
5. Layout primitives (`split-section`, `asymmetric-layout`, `masonry-grid`, `card-grid`).

## Rules for porting

- JSX + Tailwind only. No `'use client'`. No `next/image`, `next/link`, `next/dynamic`, server components, or server actions.
- Replace `next/image` → native `<img>` or `<OptimizedImage>`.
- Replace `next/link` → `react-router-dom` `Link`.
- Replace `fetch('/api/...')` with `supabase.functions.invoke(...)` or the existing helpers in `src/lib/guesty.js` / `src/lib/api-adapter.js`.
- Every ported block registers in `src/lib/blockRegistry.js` with `defaults`, editor `fields`, and is added to `LIVE_BLOCKS` (or `EXTRA_BLOCKS` for specialised ones).
- Skip Prisma — Supabase remains the DB. Skip Vercel Blob — Supabase storage instead.

## Rollback

```bash
rm -rf docs/zenith supabase/functions/cms-ai-page-generate/_oracle-prompt.ts
# revert supabase/functions/cms-ai-page-generate/index.ts to inline prompt
```
