# CMS / AI Editor — Rolling Plan (v5)

One slice per turn. Each slice = measurable diff, 1-command rollback.

## ✅ Shipped this turn — Landing hero = CarouselHero + search overlay
- `LandingPage.jsx`: static parallax hero replaced with `<CarouselHero>` driven
  by `cms.hero.slides` (3 curated Malta fallbacks). Ken Burns zoom, progress
  bar, dots, arrows, keyboard + swipe inherited from the unified block.
- `CarouselHero` now accepts `children` as a bottom overlay slot;
  `HorizontalSearchBar` is mounted there so search lives directly on the hero.
- Rollback: revert `LandingPage.jsx` + the `children` addition in `CarouselHero.jsx`.

## ✅ Shipped this turn — Phase 3a foundation + hero carousel rebuild

### `src/components/BlockRenderer.jsx` (new) — one block, one renderer
- Single canonical renderer used by both editor canvas and public pages.
- Resolves `block.type` against `LIVE_BLOCKS` (editor map) + `EXTRA_BLOCKS`
  (specialized blocks like `hero_carousel`) so registering a renderer once
  makes it available everywhere.
- Wraps every block in `BlockErrorBoundary` — one broken block can't take
  down a page. Unknown types render a visible warning in editor mode and
  return null in public mode.
- Exports `<BlockList blocks={...} />` for public pages to do
  `const { data } = useCmsPage("home"); return <BlockList blocks={data.blocks} />;`
  once Phase 3b lands.

### `src/components/blocks/CarouselHero.jsx` (rewritten)
- v1 shipped with literal `\"` escapes — file would not compile if imported.
- Ken Burns slow-zoom on active slide, crossfade between slides.
- Top progress bar tied to `interval`, restarts on slide change / pause.
- Pause-on-hover, pause-on-focus, pause-when-tab-hidden.
- Keyboard nav (← → Home End) when section is focused.
- Touch swipe (>50px threshold).
- First image eager + `fetchpriority="high"`; rest lazy + async decode.
- 100dvh hard-stop section (respects project no-scroll-snap rule).
- Honors `prefers-reduced-motion` — disables Ken Burns and autoplay timer.
- Registered as `hero_carousel` in `EXTRA_BLOCKS` inside `BlockRenderer`.

Rollback: revert the two files; no schema, no edge-function, no plan-level changes.

## 🟡 Queued — one per turn, in order

### Phase 3b: Dynamic Header/Footer from `cms_content`
- Replace hardcoded JSX in `Header.jsx` / `Footer.jsx` with `<BlockList />`
  reading the `header` / `footer` rows from `cms_content`.
- Editors can change site chrome the same way they edit any page.
- Risk: medium (touches global chrome). Keep current files as fallback
  while wiring; flip the import last.

### Phase 3c: New blocks pack
Once Phase 3b is stable, ship as one slice:
- `splitFeature`, `logoMarquee`, `parallaxQuote`, `comparisonTable`,
  `stickyScroll`. Each one = registry entry + one renderer; appears in
  editor + public automatically thanks to `BlockRenderer`.

### Slice B: Cmd+K AI command palette (from v3 plan, unchanged)
### Slice C: Multi-step page generator (from v3 plan, unchanged)
### Slice D: Auto-nav + internal linking AI (from v3 plan, unchanged)

## Explicitly out of scope (rejected, do not re-propose)
- Single-turn "OMNIAUDIT" rewrites — bricks editor, no rollback.
- Next.js / `middleware.ts` / Puck / `@dnd-kit` — this project is Vite + React.
  Architecture from the uploaded `*_src_*.txt` files belongs to a different
  stack and cannot be copied wholesale.
- TypeScript migration of editor — separate decision.
- New deps: Puck, @dnd-kit, react-helmet-async.
- Streaming AI inline — defer to Slice C.
