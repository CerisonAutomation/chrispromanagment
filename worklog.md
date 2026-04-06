# Enterprise Rebuild Worklog

---
Task ID: 0
Agent: Main Orchestrator
Task: Initial analysis and planning for enterprise rebuild

Work Log:
- Analyzed entire codebase structure (70+ files)
- Identified root cause: @puckeditor/core module unresolvable, breaking entire app
- Mapped all broken imports: page.tsx, puck-editor.tsx, default-pages.ts, ai-page-builder.tsx
- Discovered puck.config.tsx (4354 lines) has all block render functions - no Puck imports
- Identified Guesty API integration is correct (Booking Engine API only, not Open API)
- Confirmed API routes are solid (pages, properties, bookings, contact, media, AI)
- Confirmed Prisma schema has Property, Booking, CmsPage, ContactSubmission models
- Read all source files to understand full architecture

Stage Summary:
- App completely broken due to @puckeditor/core dependency
- puck.config.tsx has all 25+ block render functions (HeroSection, AboutSection, etc.)
- Block data format: { content: Array<{type: string, props: Record<string, unknown>}>, root: { props: Record<string, unknown> } }
- Guesty API integration correct - uses Booking Engine API at booking-api.guesty.com
- Need: Search, FilePlus, CalendarCheck icons prominently featured
- Plan: Create local types, build custom block renderer, rewrite page.tsx as enterprise SPA

---
## Task ID: 5 - page-rewrite
### Work Task
Complete rewrite of `/home/z/my-project/src/app/page.tsx` to eliminate all `@puckeditor/core` and `@/puck.config` imports. Build an enterprise-grade single-page application with hash-based routing, admin dashboard, custom page editor, and public page rendering.

### Work Summary
- **Problem**: The original `page.tsx` imported `@puckeditor/core` (unresolvable module) and `@/puck.config` (through PuckEditor dynamic import and direct config usage), causing the entire application to crash with `Module not found` errors.
- **Solution**: Completely rewrote `page.tsx` as a self-contained "use client" SPA component (~1900 lines) with zero Puck dependencies.

**Architecture Implemented:**
1. **Hash Router**: Custom `useHashRouter` hook + `parseRoute()` function routing `#/home`, `#/about`, `#/admin`, `#/admin/edit/:slug`, etc.
2. **Public Pages**: Fetches page data from `/api/pages/[slug]`, falls back to `defaultPages` from `@/lib/default-pages`. Renders blocks via `<PageRenderer data={pageData} />` from `@/lib/block-renderer` wrapped in `<ScrollReveal>` for entrance animations.
3. **Admin Dashboard** (`#/admin`): Full CRUD page management with search, create/duplicate/delete/toggle status, responsive table/cards, MediaLibrary integration, branded header with CalendarCheck icon, FilePlus icon for "Create New Page", Sign Out button.
4. **Custom Page Editor** (`#/admin/edit/:slug`): Split-layout with block list sidebar (left), preview area (center), and property editor panel (right, 320px). Features include:
   - Block selection with click-to-edit
   - PropertyField component handling string/number/boolean/array/object props
   - Block reordering (move up/down), deletion, adding via dialog with search filtering
   - Auto-save every 30 seconds with dirty state tracking
   - Keyboard shortcuts: Ctrl/Cmd+S (save), Ctrl/Cmd+Z (undo, 50-level stack)
   - Import/Export JSON, Preview mode, JSON view
   - Responsive: desktop sidebar + mobile Sheet for property editing
5. **Navigation**: Scroll-aware NavBar with mobile hamburger menu, active link highlighting, Book Now CTA button.
6. **UI Polish**: ScrollProgressBar, BackToTopButton with percentage, PageSkeleton loader, LoginScreen with branded design.

**Icons Featured** (from lucide-react): Search (dashboard search, block adder), FilePlus (create page, add block), CalendarCheck (header, booking CTA), plus 20+ supporting icons.

**Lint Status**: 0 errors, 0 warnings after fixes (added missing ExternalLink import, removed unnecessary eslint-disable directives).

**Dev Server**: Successfully compiling and serving pages with `GET / 200` responses and database queries executing normally.

---
Task ID: 6
Agent: Main Orchestrator
Task: Critique user's Malta/Gozo SVG paths and integrate into PageSkeleton loader

Work Log:
- Analyzed user-provided SVG: draw paths for Malta (R→L) and Gozo (L→R) with fill layer deduplication via <use>
- Critiqued: missing viewBox, missing <defs> for #cvGold gradient and #cvGlow filter, missing stroke on draw paths, no accessibility markup
- Created `/home/z/my-project/src/components/malta-svg-loader.tsx` — a reusable animated SVG map loader component
- Implemented 2-phase JS animation: Phase 1 = stroke draw with ease-out cubic (2.6s), Phase 2 = gold fill fade-in (800ms) with stroke dim
- Added `will-change` hints for GPU acceleration, respects `prefers-reduced-motion`
- Integrated into `PageSkeleton` in page.tsx: Malta SVG map renders above the breathing logo, with responsive sizing (w-40→w-64)
- Added `logoBreath` and `skeletonShimmer` keyframes to `puck-animations.css`
- Lint: 0 errors, 0 warnings. Dev server compiling clean with 200 responses.

Stage Summary:
- New component: `src/components/malta-svg-loader.tsx` (170 lines, fully accessible, GPU-accelerated)
- Modified: `src/app/page.tsx` (added import + integrated into PageSkeleton)
- Modified: `src/app/puck-animations.css` (added 2 keyframes)
- The PageSkeleton now shows: animated Malta/Gozo map → breathing logo → shimmer skeleton bars

---
Task ID: 7
Agent: Main Orchestrator
Task: Fix Malta SVG timing, make blocks fully editable, upgrade editor to enterprise-grade

Work Log:
- Fixed MaltaSVGLoader: replaced `setTimeout(() => animate(), 150)` with `requestAnimationFrame(() => animate())` so map draw and logo breathe start at exactly the same frame (zero delay)
- Rewrote PropertyField array-of-objects editor: was read-only list with delete-only, now full inline editing with:
  - Every field (string, number, textarea) is directly editable inline
  - Move up/down buttons with ChevronUp/ChevronDown icons per item
  - Delete with Trash2 icon, "Add item" with FilePlus icon
  - Template-based new items (copies keys from first item)
  - Increased max-height to 64 (from 48) for longer arrays
  - Field labels auto-formatted from camelCase
- Verified block-registry.ts has all 25+ block types with complete field schemas and defaultProps (canonical Puck-compatible structure)
- Verified block-renderer.tsx correctly routes through puck.config.tsx render/Component functions
- Lint: 0 errors, 0 warnings. Dev server compiling with 200 responses.

Stage Summary:
- Modified: src/components/malta-svg-loader.tsx (removed 150ms delay, use rAF)
- Modified: src/app/page.tsx (PropertyField rewrite ~140 lines → full inline editing)
- block-registry.ts confirmed canonical with 25 block types, complete FieldSchema
- Block editor now allows editing every property of every array item inline

---
## Task ID: 8 - constants-centralization
### Work Task
Create two centralized constant files to serve as the single source of truth for all duplicated values scattered across the Christiano Property Management codebase.

### Work Summary
Created two new files in `/home/z/my-project/src/lib/`:

**`constants.ts`** — Centralized site-wide constants:
- `SITE_NAME`, `SITE_SHORT`, `SITE_BASE`, `SITE_DESCRIPTION` — site configuration
- `BRAND` — stats object (yearsExperience, propertiesManaged, happyGuests, averageRating, satisfactionRate, tagline, superhostYears)
- `CONTACT` — email, phone, whatsapp, location, full address object, map coordinates
- `SOCIAL` — facebook, instagram, linkedin URLs
- `NAV_LINKS` — 9 navigation items with label/slug pairs
- `COPYRIGHT` — dynamic copyright string
- `PAGE_META` — per-page SEO title/description for all 9 routes
- `ADMIN_AUTH` — session storage keys, duration, demo password

**`images.ts`** — Centralized image URL constants:
- `LOGO_URL` — brand logo
- `HERO_BG`, `ABOUT_IMG`, `OG_IMAGE` — hero and about section images
- `PROP_IMAGES` — 6 named property images (valletta, valletta2, baharIcCaghaq, pieta, madliena, gzira)
- `GALLERY_IMAGES` — 13 extra gallery images
- `DEFAULT_PROPERTY_GRID` — pre-built array of 6 properties with name, imageUrl, caption
- `ALL_GALLERY_IMAGES` — flat array derived from GALLERY_IMAGES values

Both files use `as const` assertions for type safety. All URLs share a common CDN base. ESLint: 0 errors, 0 warnings. Dev server compiling clean.

---
## Task ID: 9 - hex-color-canonicalization
### Work Task
Refactor `/home/z/my-project/src/app/page.tsx` to canonicalize all hardcoded hex colors and duplicated constants, replacing them with semantic Tailwind theme classes and centralized imports.

### Work Summary
Systematically refactored the 2731-line `page.tsx` file to eliminate all hardcoded hex color values and duplicated constant definitions:

**Constants Centralization:**
- Added imports: `LOGO_URL` from `@/lib/images`; `SITE_BASE`, `NAV_LINKS`, `PAGE_META`, `ADMIN_AUTH`, `SITE_NAME` from `@/lib/constants`
- Removed 7 local constant definitions (LOGO_URL, NAV_LINKS, ADMIN_PASSWORD, AUTH_KEY, AUTH_TIME_KEY, SITE_BASE, PAGE_META — ~65 lines)
- Updated all auth references: `ADMIN_PASSWORD` → `ADMIN_AUTH.demoPassword`, `AUTH_KEY` → `ADMIN_AUTH.storageKey`, `AUTH_TIME_KEY` → `ADMIN_AUTH.timeKey`
- Replaced `24 * 60 * 60 * 1000` → `ADMIN_AUTH.sessionDurationMs`

**Tailwind Hex Color Canonicalization (46+ replacements):**
- `bg-[#0e0f11]` → `bg-cpm-bg-primary` (and opacity variants: /95, /85, /80, /70, /40, /50, /30)
- `bg-[#15171b]` → `bg-cpm-bg-secondary` (and /90, /80)
- `text-[#ede9e0]` → `text-cpm-text-primary` (and /80)
- `text-[#9a9690]` → `text-cpm-text-secondary`
- `text-[#5a5854]` → `text-cpm-text-tertiary`
- `border-[#1b1e23]` → `border-cpm-border` (and /80, /60, /50, /30)
- `bg-[#1b1e23]` → `bg-cpm-border` (and /30)
- `hover:border-[#2a2d33]` → `hover:border-cpm-border-hover`
- `bg-[#2a2d33]` → `bg-cpm-border-hover`
- `bg-[#c8a96a]` → `bg-cpm-accent` (and opacity variants: /5, /10, /15, /20, /25, /30)
- `text-[#c8a96a]` → `text-cpm-accent` (and /70, /80)
- `border-[#c8a96a]` → `border-cpm-accent` (and /20, /25, /30, /40, /60)
- `ring-[#c8a96a]` → `ring-cpm-accent` (and /20, /50)
- `shadow-[#c8a96a]` → `shadow-cpm-accent` (and /10, /20)
- `hover:bg-[#d4b87a]` → `hover:bg-cpm-accent-hover`
- `hover:text-[#d4b87a]` → `hover:text-cpm-accent-hover`
- `via-[#c8a96a]` → `via-cpm-accent`
- `divide-[#1b1e23]` → `divide-cpm-border`
- `ring-[#1b1e23]` → `ring-cpm-border`
- `ring-offset-[#0e0f11]` → `ring-offset-cpm-bg-primary`
- `border-t-[#c8a96a]` → `border-t-cpm-accent`
- `border-t-[#0e0f11]` → `border-t-cpm-bg-primary`
- `border-[#0e0f11]` → `border-cpm-bg-primary` (and /30)
- `text-[#0e0f11]` → `text-cpm-bg-primary`

**Inline Style CSS Variables:**
- `#c8a96a` → `var(--cpm-accent)` in scroll progress bar gradient
- `#d4b87a` → `var(--cpm-accent-hover)` in scroll progress bar gradient

**Preserved (not changed):**
- All shadcn/ui conventional classes: `bg-red-500/10`, `text-red-400`, `border-red-500/20`, `bg-emerald-500/10`, `text-emerald-400`, `text-amber-400`, `bg-amber-500/10`, `hover:bg-blue-500/10`, `hover:text-blue-400`
- Skeleton loader inline styles using rgba() for complex gradient animations (not simple hex values)
- Component structure and logic remained completely unchanged

**Verification:** `npm run lint` passes with 0 errors, 0 warnings. Zero hex color values (`#[0-9a-fA-F]{6}`) remain in the file.

---
## Task ID: 10 - puck-config-canonicalization
### Work Task
Systematically refactor `/home/z/my-project/src/puck.config.tsx` (4465 lines) to canonicalize all hardcoded hex colors and duplicated constants, replacing them with semantic Tailwind theme classes, CSS variable references, and centralized imports.

### Work Summary
Performed a comprehensive bulk refactoring of the entire puck.config.tsx file across 5 major categories:

**1. Image URL Constants (30+ replacements):**
- Added imports: `LOGO_URL`, `HERO_BG`, `ABOUT_IMG`, `PROP_IMAGES`, `GALLERY_IMAGES` from `@/lib/images`
- Added imports: `CONTACT`, `SITE_NAME`, `SITE_BASE`, `BRAND`, `NAV_LINKS`, `SOCIAL`, `PAGE_META`, `COPYRIGHT` from `@/lib/constants`
- Replaced 20 hardcoded CDN URLs with backward-compatible aliases mapped to centralized image constants (PROP_1 → PROP_IMAGES.valletta2, IMG_2625 → GALLERY_IMAGES.img2625, etc.)

**2. Tailwind Arbitrary Hex Values (600+ replacements across 78+ unique patterns):**
- `bg-[#0e0f11]` → `bg-cpm-bg-primary` (and /95, /80, /70, /50 opacity variants)
- `bg-[#15171b]` → `bg-cpm-bg-secondary` (and /50 opacity variants)
- `bg-[#1b1e23]` → `bg-cpm-border` (and /60, /50 opacity variants)
- `bg-[#2a2d33]` → `bg-cpm-border-hover`
- `bg-[#c8a96a]` → `bg-cpm-accent` (and /5, /8, /10, /15, /40 opacity variants)
- `text-[#ede9e0]` → `text-cpm-text-primary` (and /80, /70, /60 via base replacement)
- `text-[#9a9690]` → `text-cpm-text-secondary` (and /80 via base replacement)
- `text-[#5a5854]` → `text-cpm-text-tertiary`
- `text-[#c8a96a]` → `text-cpm-accent`
- `text-[#0e0f11]` → `text-cpm-bg-primary`
- `text-[#10b981]` → `text-cpm-success`
- `text-[#ef4444]` → `text-cpm-error`
- `border-[#1b1e23]` → `border-cpm-border` (and /80, /60, /50, /40, /30, /20 opacity variants)
- `border-[#c8a96a]` → `border-cpm-accent` (and /40, /30, /20, /10 opacity variants)
- `hover:bg-[#d4b87a]` → `hover:bg-cpm-accent-hover`
- `hover:text-[#d4b87a]` → `hover:text-cpm-accent-hover`
- `bg-[#10b981]` → `bg-cpm-success` (and /10, /20)
- `bg-[#ef4444]` → `bg-cpm-error` (and /10, /20)
- `from-[#...]` → `from-cpm-*` variants (primary, secondary, accent, accent-hover)
- `to-[#...]` → `to-cpm-*` variants (primary, gold-dark, accent)
- `via-[#...]` → `via-cpm-*` variants (primary, secondary, accent, with opacity)
- `placeholder-[#5a5854]` → `placeholder-cpm-text-tertiary`
- `border-[#2a2d33]` → `border-cpm-border-hover`
- `border-[#5a5854]/30` → `border-cpm-text-tertiary/30`
- `hover:border-l-[#c8a96a]` → `hover:border-l-cpm-accent`
- `border-[#10b981]/30`, `border-[#10b981]/20` → `border-cpm-success/30`, `/20`
- `border-[#ef4444]/20`, `border-[#ef4444]/50` → `border-cpm-error/20`, `/50`
- `focus:border-[#ef4444]` → `focus:border-cpm-error`

**3. Inline Style CSS Variable References (100+ replacements in gradient strings):**
- `#c8a96a` → `var(--cpm-accent)` in all CSS gradients (linear-gradient, radial-gradient)
- `#ede9e0` → `var(--cpm-text-primary)` in gradient text overlays
- `#a08040` → `var(--cpm-gold-dark)` in icon gradient containers
- `#d4b87a` → `var(--cpm-accent-hover)` in CTA button gradients
- `#15171b` → `var(--cpm-bg-secondary)` in shimmer gradients
- `#1b1e23` → `var(--cpm-border)` in shimmer gradients
- Preserved raw hex in theme editor bgMap (lines 3449-3467) — needed for `lightenHex`/`hexToRgba` color manipulation functions
- Preserved raw hex in theme editor fallback values (accent, accentHover) — same reason
- Preserved raw hex in shadcn/ui CSS variable definitions (--foreground, --card-foreground, etc.)

**4. Contact Info Centralization (12+ replacements):**
- `info@christianopropertymanagement.com` → `CONTACT.email` (defaultProps + render)
- `+35679790202` → `CONTACT.phone` (defaultProps + render)
- `CONTACT.whatsapp` → for WhatsApp field default
- `Birkirkara, Malta` → `CONTACT.location` (defaultProps + render + Google Maps embed URL)
- `35.8961327` → `CONTACT.mapCoords.lat`
- `14.4644929` → `CONTACT.mapCoords.lng`
- `© 2024-2026 Christiano Property Management` → `COPYRIGHT`
- Social URLs → `SOCIAL.facebook`, `SOCIAL.instagram`, `SOCIAL.linkedin`

**5. Preserved (intentionally unchanged):**
- 2 Tailwind arbitrary hex colors for secondary avatar gradients: `from-[#b8944f] to-[#8a6e30]` and `from-[#e0c88a]`
- 2 shimmer animation mid-tone hex values: `#252830`, `#1e2025` (between border and bg-secondary)
- 14 raw hex values in theme editor bgMap for alternate themes (dark, medium) — all intentionally different
- 6 raw hex values in theme editor CSS variable definitions (source of truth)
- Theme editor `lightenHex()` fallback values — functions require raw hex input
- All `rgba()` values in complex CSS shadows/gradients (not simple hex patterns)

**Verification:** `npm run lint` passes with 0 errors, 0 warnings. Only 23 intentional hex color values remain (all legitimate uses in theme editor, shimmer animations, and decorative avatar gradients).

---
## Task ID: 11 - puck-cms-hex-migration
### Work Task
Migrate hardcoded hex colors in 5 Puck editor and CMS component files to use the semantic CSS variable Tailwind theme system. Replace all `[#hex]` patterns in Tailwind classes with `cpm-*` theme classes.

### Work Summary
Systematically refactored all 5 files to eliminate hardcoded hex color values in Tailwind utility classes using an efficient `[#hex]` → `cpm-*` bracket pattern replacement strategy:

**Files Migrated (5 files, 0 remaining hex patterns):**

1. **`/src/components/puck/puck-editor.tsx`** (672 lines) — 76 hex instances → 0
   - Replaced: `[#0e0f11]` → `cpm-bg-primary`, `[#0a0b0d]` → `cpm-bg-primary`, `[#15171b]` → `cpm-bg-secondary`, `[#1b1e23]` → `cpm-border`, `[#ede9e0]` → `cpm-text-primary`, `[#9a9690]` → `cpm-text-secondary`, `[#5a5854]` → `cpm-text-tertiary`, `[#c8a96a]` → `cpm-accent`, `[#d4b87a]` → `cpm-accent-hover`
   - Coverage: bg, text, border, ring, hover, from/to gradient, border-t variants

2. **`/src/components/puck/block-builder.tsx`** (541 lines) — all hex instances → 0
   - Same replacement set as above, plus focus-visible, placeholder, hover state variants

3. **`/src/components/puck/ai-page-builder.tsx`** (543 lines) — all hex instances → 0
   - Same replacement set including `[#0a0b0d]` → `cpm-bg-primary` (JSON preview panels)

4. **`/src/components/puck/ai-block-editor.tsx`** (431 lines) — all hex instances → 0
   - Same replacement set including Quick Action state colors

5. **`/src/components/cms/media-library.tsx`** (587 lines) — all hex instances → 0
   - Same replacement set for upload dropzone, media grid, filter pills, loading states

**Replacement Strategy:**
Used bracket-level replacement `[#hex]` → `cpm-name` (e.g., `[#c8a96a]` → `cpm-accent`) which automatically handles ALL Tailwind utility prefixes (bg-, text-, border-, ring-, from-, to-, hover:, focus:, etc.) in a single replacement per hex color. This reduced ~80 unique patterns to just 9 bracket-level replacements.

**Preserved (unchanged):**
- All shadcn/ui conventional classes: `bg-red-500/10`, `text-red-400`, `text-emerald-400`, `bg-emerald-500/5`, `border-red-500/20`, `border-emerald-500/20`
- `text-white`, `text-black`, `bg-black/60`, `text-gray-*` generic colors (not CPM theme)
- Component structure and logic completely unchanged
- No logo URL replacements needed (none of these 5 files contained hardcoded logo URLs)

**Verification:** `npm run lint` passes with 0 errors, 0 warnings. Zero `[#hex]` patterns remain across all 5 files.

---
## Task ID: 2 - modular-block-architecture
### Work Task
Refactor the monolithic `/home/z/my-project/src/puck.config.tsx` (4,460 lines, 35 block definitions) into a clean modular architecture with individual block files under `src/blocks/`.

### Work Summary
Split the 4,460-line `puck.config.tsx` monolith into 38 modular files:

**Files Created:**

1. **`src/blocks/helpers.ts`** — Shared utilities:
   - `safeHref()` — URL validation helper (prevents XSS)
   - 17 image alias exports (`PROP_1`, `PROP_2`, `PROP_3`, `PROP_VALLETTA`, `PROP_MADLIENA`, `PROP_GZIRA`, `IMG_2625`–`IMG_6115`) mapping to centralized `@/lib/images` constants

2. **35 individual block files** (`src/blocks/*.tsx`):
   - `hero-section.tsx`, `about-section.tsx`, `why-choose-us.tsx`, `services-section.tsx`, `property-showcase.tsx`
   - `booking-section.tsx`, `pricing-table.tsx`, `testimonial-section.tsx`, `faq-section.tsx`, `contact-section.tsx`
   - `logo-bar.tsx`, `cta-banner.tsx`, `stats-section.tsx`, `footer-section.tsx`, `divider.tsx`
   - `guesty-property-search.tsx`, `guesty-property-grid.tsx`, `guesty-property-detail.tsx`, `guesty-booking-widget.tsx`, `guesty-booking-confirmation.tsx`, `guesty-booking-dashboard.tsx`
   - `image-gallery.tsx`, `timeline.tsx`, `text-block.tsx`, `feature-grid.tsx`, `map-section.tsx`, `spacer.tsx`, `theme-settings.tsx`
   - `team-section.tsx`, `video-section.tsx`, `newsletter-section.tsx`, `comparison-section.tsx`, `image-with-text.tsx`, `malta-map-section.tsx`, `social-proof-strip.tsx`

3. **`src/blocks/index.ts`** — Aggregator importing all 35 blocks and exporting the `config` object with identical shape

**Files Modified:**

4. **`src/puck.config.tsx`** — Reduced from 4,460 lines to 8 lines:
   ```typescript
   export { config as default } from "@/blocks";
   ```

**Key Architecture Decisions:**

- Each block file imports only the dependencies it needs (React, toast, MaltaSVGLoader, image/constants, safeHref)
- Helper components used only within single blocks (e.g., `GuestySkeletonCard`, `GuestyAmenityIcon`, `GuestyRenderStars`, `GuestyStatCard`) are defined locally in their respective block files rather than shared globally
- The `config` export shape is preserved exactly: `{ components: { HeroSection, AboutSection, ... }, ... }`
- `block-renderer.tsx` continues to import `config` from `@/puck.config` (backward compatible)

**Verification:**
- `npm run lint` — 0 errors, 0 warnings
- Dev server `GET /` — 200 response confirmed

---
Task ID: 2-c
Agent: Research Specialist - Puck AI Recipes
Task: Crawl and extract Puck next-ai and next recipes for best practices

Work Log:
- Read full project worklog (12 previous tasks) to understand current architecture: 35 blocks in modular src/blocks/, custom SPA editor with hash routing, Prisma DB, Guesty API, no @puckeditor/core dependency
- Crawled 4 primary GitHub URLs: next-ai README, next-ai tree, next README, next tree
- Explored complete directory trees via GitHub API for both recipes
- Extracted all source code files from next-ai recipe (13 files total)
- Ran 3 web searches covering Puck AI best practices, plugin ecosystem, and source code
- Crawled 6 official Puck documentation pages: AI Getting Started, AI Configuration, Business Context, Tools, Headless Generation, Plugin API
- Crawled Puck 0.21 blog post and awesome-puck repo for plugin ecosystem

Stage Summary:

## 1. FILE STRUCTURE - next-ai recipe
```
recipes/next-ai/
├── .env.example              # PUCK_API_KEY=your-api-key
├── package.json              # @puckeditor/core, @puckeditor/cloud-client, @puckeditor/plugin-ai
├── puck.config.tsx           # Minimal Puck config (HeadingBlock)
├── proxy.ts                  # Dev proxy: /edit → /puck/* rewrite
├── database.json             # JSON file-based persistence
├── next.config.js
├── app/
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Re-exports from [...puckPath]
│   ├── styles.css
│   ├── [...puckPath]/
│   │   ├── page.tsx          # Public page (force-static ISR, notFound if missing)
│   │   └── client.tsx        # <Render config={config} data={data} />
│   ├── puck/
│   │   ├── page.tsx          # Re-exports from [...puckPath]
│   │   └── [...puckPath]/
│   │       ├── page.tsx      # Editor (force-dynamic, imports plugin-ai/styles.css)
│   │       └── client.tsx    # <Puck plugins={[aiPlugin]} /> with onPublish
│   └── api/
│       ├── pages/
│       │   └── route.ts      # POST: save to JSON + revalidatePath
│       └── puck/
│           └── [...all]/
│               └── route.ts  # AI PROXY: puckHandler(request, { ai: { context } })
└── lib/
    └── get-page.ts           # getPage(path): read from database.json
```

## 2. KEY DIFFERENCES: next vs next-ai
- next-ai adds: @puckeditor/cloud-client, @puckeditor/plugin-ai packages
- next-ai adds: app/api/puck/[...all]/route.ts (AI proxy using puckHandler)
- next-ai adds: PUCK_API_KEY env var, createAiPlugin() in editor client
- next-ai adds: @puckeditor/plugin-ai/styles.css import in editor page
- Both use identical ISR pattern (force-static for public, force-dynamic for editor)
- Both use revalidatePath for cache invalidation on publish

## 3. EXTRACTED CRITICAL SOURCE CODE

### 3a. AI PROXY ROUTE (app/api/puck/[...all]/route.ts)
```typescript
import { NextRequest } from "next/server";
import { puckHandler } from "@puckeditor/cloud-client";

export const POST = (request: NextRequest) => {
  return puckHandler(request, {
    ai: {
      context: "We are Google. You create Google landing pages.",
    },
  });
};
```

### 3b. EDITOR CLIENT with AI Plugin (app/puck/[...puckPath]/client.tsx)
```typescript
"use client";
import type { Data } from "@puckeditor/core";
import { Puck } from "@puckeditor/core";
import { createAiPlugin } from "@puckeditor/plugin-ai";
import config from "../../../puck.config";

const aiPlugin = createAiPlugin();

export function Client({ path, data }: { path: string; data: Partial<Data> }) {
  return (
    <Puck
      plugins={[aiPlugin]}
      config={config}
      data={data}
      onPublish={async (data) => {
        await fetch("/api/pages", {
          method: "post",
          body: JSON.stringify({ data, path }),
        });
      }}
    />
  );
}
```

### 3c. EDITOR SERVER PAGE (app/puck/[...puckPath]/page.tsx)
```typescript
import "@puckeditor/core/puck.css";
import "@puckeditor/plugin-ai/styles.css";
import { Client } from "./client";
import { Metadata } from "next";
import { getPage } from "../../../lib/get-page";

export async function generateMetadata({ params }: { params: Promise<{ puckPath: string[] }> }): Promise<Metadata> {
  const { puckPath = [] } = await params;
  const path = `/${puckPath.join("/")}`;
  return { title: "Puck: " + path };
}

export default async function Page({ params }: { params: Promise<{ puckPath: string[] }> }) {
  const { puckPath = [] } = await params;
  const path = `/${puckPath.join("/")}`;
  const data = getPage(path);
  return <Client path={path} data={data || {}} />;
}

export const dynamic = "force-dynamic";
```

### 3d. PUBLIC PAGE with ISR (app/[...puckPath]/page.tsx)
```typescript
import { Client } from "./client";
import { notFound } from "next/navigation";
import { getPage } from "../../lib/get-page";

export default async function Page({ params }: { params: Promise<{ puckPath: string[] }> }) {
  const { puckPath = [] } = await params;
  const path = `/${puckPath.join("/")}`;
  const data = getPage(path);
  if (!data) return notFound();
  return <Client data={data} />;
}

export const dynamic = "force-static";
```

### 3e. PAGES API with Cache Invalidation (app/api/pages/route.ts)
```typescript
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import fs from "fs";

export async function POST(request: Request) {
  const payload = await request.json();
  const existingData = JSON.parse(fs.existsSync("database.json") ? fs.readFileSync("database.json", "utf-8") : "{}");
  const updatedData = { ...existingData, [payload.path]: payload.data };
  fs.writeFileSync("database.json", JSON.stringify(updatedData));
  revalidatePath(payload.path);
  return NextResponse.json({ status: "ok" });
}
```

### 3f. DEV PROXY for /edit rewrite (proxy.ts)
```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(req: NextRequest) {
  const res = NextResponse.next({ request: req });
  if (req.method === "GET") {
    if (req.nextUrl.pathname.endsWith("/edit")) {
      const pathWithoutEdit = req.nextUrl.pathname.slice(0, req.nextUrl.pathname.length - 5);
      return NextResponse.rewrite(new URL(`/puck${pathWithoutEdit}`, req.url));
    }
    if (req.nextUrl.pathname.startsWith("/puck")) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }
  return res;
}
```

## 4. AI CONFIGURATION PATTERNS (from docs)

### Component-Level AI Instructions
```typescript
ai: { instructions: "Always place this first" }
```

### Field-Level AI Config
```typescript
// Instructions
ai: { instructions: "Always use caps" }
// Schema for custom fields
ai: { schema: z.toJSONSchema(z.object({ title: z.string() })) }
// Exclude from AI
ai: { exclude: true }
// Control streaming
ai: { stream: false }
// Required fields
ai: { required: true }
// Bind tool result to field
ai: { bind: "getImageUrl" }
```

## 5. TOOLS API - Server Functions AI Can Call
```typescript
import { puckHandler, tool } from "@puckeditor/cloud-client";
import z from "zod/v4";

const handler = puckHandler({
  ai: {
    tools: {
      getImageUrl: tool({
        description: "Get a property image",
        inputSchema: z.object({ category: z.enum(["valletta", "gozo"]) }),
        execute: ({ category }) => fetchPropertyImage(category),
        mode: "auto",
      }),
    },
  },
});
```

## 6. HEADLESS GENERATION API
```typescript
import { generate } from "@puckeditor/cloud-client";

const page = await generate({
  prompt: "Create a luxury property landing page",
  config: { components: { /* our 35 blocks */ } },
  context: "We are Christiano Property Management in Malta...",
});

// Update existing page
const updated = await generate({
  prompt: "Make the hero section more vibrant",
  config: { components: { /* ... */ } },
  pageData: existingData,
});
```

## 7. PLUGIN API (Puck 0.21)
```typescript
const MyPlugin = {
  name: "my-plugin",
  label: "My plugin",
  icon: <svg />,
  render: () => <div>Plugin UI</div>,
  overrides: { drawerItem: ({ name }) => <div /> },
  fieldTransforms: { text: ({ value }) => <span>{value}</span> },
  mobilePanelHeight: "min-content",
};
```

## 8. RECOMMENDED UPGRADE PATTERNS FOR CPM

### Integration Strategy
1. Install: @puckeditor/core, @puckeditor/cloud-client, @puckeditor/plugin-ai, zod
2. Create: app/api/puck/[...all]/route.ts with CPM business context
3. Create: app/api/pages/route.ts with Prisma + revalidatePath (replace JSON file DB)
4. Add: createAiPlugin() to editor component alongside custom blocks
5. Add: ai.instructions to each of 35 block definitions in src/blocks/
6. Create: Server-side tools for property images, booking links
7. Use: generate() API for existing ai-page-builder.tsx feature
8. Add: PUCK_API_KEY to .env.local

### Package Versions
- @puckeditor/core: latest (was @measured/puck before 0.21)
- @puckeditor/cloud-client: ^0.5.0
- @puckeditor/plugin-ai: ^0.5.0
- Requires: Next.js 16+, React 19+
- Auth: MUST add authentication to /edit routes (recipe explicitly warns)

### Recommended CPM Business Context
We are Christiano Property Management, a premium vacation rental company in Birkirkara, Malta. Gold accent (#c8a96a), dark backgrounds (#0e0f11, #15171b), luxury aesthetic. 35 components available. Target: high-end vacation rental guests. Focus on Malta/Gozo destination appeal and guest experience.

---
## Task ID: 12 - fix-all-critical-bugs
### Work Task
Fix all critical bugs preventing the application from running: parse errors, broken imports, and architectural issues.

### Work Summary

**Bug 1: page.tsx Parse Error (CRITICAL — app returning 500)**
- Root cause: JSX comment at line 362 was missing its closing `}`
- Before: `{/* Content-aware skeleton cascade */` (missing `}`)
- After: `{/* Content-aware skeleton cascade */}`
- This caused brace depth imbalance, making the SWC/Turbopack parser think we were still inside a JSX expression context at line 469
- Error messages: "Unterminated regexp literal" (Turbopack), `'}' expected` (TypeScript)
- Impact: **Entire app was returning HTTP 500** — completely broken
- File: `src/app/page.tsx`

**Bug 2: default-pages.ts Broken Imports**
- Root cause: File used `PROP_VALLETTA`, `PROP_1`, `PROP_2`, `PROP_MADLIENA`, `PROP_3`, `PROP_GZIRA` variables that were only defined in `puck.config.tsx` (not imported)
- Fix: Added local alias definitions at the top of `default-pages.ts` mapping to centralized `PROP_IMAGES` constants
- Impact: Properties page and any page using property images would have undefined URLs at runtime
- File: `src/lib/default-pages.ts`

**Bug 3: puck.config.tsx Architecture (4,460-line monolith)**
- Root cause: All 35 block definitions (fields + defaultProps + full JSX render functions) stuffed into a single file
- This was a historical artifact from when `@puckeditor/core` required all blocks in one config object
- After Puck was removed, the monolith was never refactored
- Fix: Split into 38 modular files under `src/blocks/` with a clean aggregator pattern
- Before: 1 file at 4,460 lines
- After: 36 individual block files + 1 helpers file + 1 index.ts + 1 puck.config.tsx re-export (8 lines)
- File: `src/puck.config.tsx` (4,460 → 8 lines), new `src/blocks/` directory

**Verification:**
- `bun run lint` — 0 errors, 0 warnings
- `next build` — Clean production build (no errors)
- Dev server `GET /` — 200 response confirmed

---
Task ID: 2-d
Agent: Research Specialist - AI Prompts
Task: Crawl AI system prompts repo for best CMS/AI builder prompts

Work Log:
- Read full project worklog (13 previous tasks) to understand CPM architecture: 35 modular blocks in src/blocks/, custom SPA editor, Prisma DB, Guesty API, Puck AI integration planned
- Crawled system-prompts-and-models-of-ai-tools repo: retrieved full directory tree via GitHub API (36 directories: v0, Cursor, Lovable, Leap.new, Manus, Claude Code, Devin AI, Windsurf, Replit, etc.)
- Extracted full system prompts from 4 major AI web builders: v0 (36KB), Cursor Agent 2.0 (39KB), Lovable (20KB), Leap.new (52KB)
- Ran 7 web searches: Puck AI blocks, v0/Next.js CMS, AI CMS editor prompts, lovabled.dev, awesome-ai-system-prompts, Puck editor AI generation, AI block component schema
- Read Puck blog post "AI Slop vs Constrained UI" (Feb 2026) — comprehensive analysis of constrained generative UI patterns
- Identified complementary resources: dontriskit/awesome-ai-system-prompts, instructa/ai-prompts, Builder.io ChatGPT prompts, Strapi AI prompts

Stage Summary:

## 1. REPO STRUCTURE: system-prompts-and-models-of-ai-tools
```
x1xhlol/system-prompts-and-models-of-ai-tools/
├── v0 Prompts and Tools/     → Prompt.txt (36KB), Tools.json (29KB)
├── Cursor Prompts/           → Agent Prompt 2.0.txt (39KB), v1.2 (32KB), Chat (13KB), Tools (24KB)
├── Lovable/                  → Agent Prompt.txt (20KB), Agent Tools.json (28KB)
├── Leap.new/                 → Prompts.txt (52KB), tools.json (17KB)
├── Manus Agent Tools & Prompt/
├── Anthropic/Claude Code/    → Prompt.txt, Tools.json
├── Devin AI/
├── Windsurf/
├── Replit/                   → Tools.json
├── Trae/                     → Builder Prompt.txt
├── VSCode Agent/             → Prompt.txt
├── Google/Antigravity/       → Fast Prompt.txt
├── Augment Code/
├── CodeBuddy Prompts/
├── Comet Assistant/
├── Same.dev/
├── NotionAi/
├── Perplexity/
├── Poke/
├── Qoder/
├── Kiro/
├── Emergent/
├── Orchids.app/
├── Warp.dev/
├── Amp/
├── Cluely/
├── Junie/
├── Xcode/
├── Z.ai Code/
├── dia/
└── Open Source prompts/
```

## 2. EXTRACTED SYSTEM PROMPTS — KEY PATTERNS FOR CPM

### 2a. VERCEL v0 SYSTEM PROMPT (36KB) — Key Extracts

**Core Identity:**
"You are v0, Vercel's highly skilled AI-powered assistant that always follows best practices."

**Coding Guidelines (relevant to CPM):**
- Default to Next.js App Router
- Use SWR for data fetching, caching, and client-side state
- Do NOT fetch inside useEffect
- Split code into multiple components. Do NOT have one large page.tsx
- Use semantic HTML (main, header) with ARIA roles
- Mobile-first responsive design with iOS Safari optimization
- 44px minimum touch targets for interactive elements

**Design System Rules:**
- ALWAYS use exactly 3-5 colors total (1 primary brand + 2-3 neutrals + 1-2 accents)
- NEVER exceed 5 total colors without explicit permission
- NEVER use purple or violet prominently unless asked
- Avoid gradients unless explicitly asked; use solid colors
- Maximum 2 font families (headings + body)
- Use line-height 1.4-1.6 for body text
- Use Tailwind spacing scale (p-4, mx-2), NOT arbitrary values
- Use gap classes for spacing, NOT space-* classes

**AI/Chatbot Apps:**
- Use Vercel AI SDK ("ai": "^6.0.0", "@ai-sdk/react": "^3.0.0")
- Uses Vercel AI Gateway by default (zero config for AWS Bedrock, Google Vertex, OpenAI, Anthropic)

**Context Gathering Strategy:**
- Don't stop at first match — examine ALL files
- Understand the full system before changes
- Search systematically: broad → specific → verify relationships
- Use parallel tool calls wherever possible

**Next.js 16 Features:**
- middleware.ts → proxy.js (backwards compatible)
- Turbopack default bundler (stable)
- React Compiler Support (stable)
- params/searchParams must be awaited (no longer synchronous)
- New revalidateTag('tag', 'max') requires cacheLife profile
- New updateTag() and refresh() Server Actions APIs
- Cache Components: "use cache" directive for pages/components/functions

### 2b. LOVABLE AGENT PROMPT (20KB) — Key Extracts

**Core Identity:**
"You are Lovable, an AI editor that creates and modifies web applications."

**Tech Stack:** React, Vite, Tailwind CSS, TypeScript (NOT Next.js, Angular, Vue, Svelte)
**Backend:** Supabase native integration only

**Architecture Patterns:**
- PERFECT ARCHITECTURE: Always consider refactoring. "Spaghetti code is your enemy."
- MAXIMIZE EFFICIENCY: Invoke all relevant tools simultaneously
- NEVER READ FILES ALREADY IN CONTEXT: Check "useful-context" first
- BE CONCISE: <2 lines of text after editing code, unless detail requested
- COMMUNICATE ACTIONS: Briefly inform user what you will do before changes

**Workflow (7-step):**
1. CHECK USEFUL-CONTEXT FIRST
2. TOOL REVIEW: think about relevant tools
3. DEFAULT TO DISCUSSION MODE: Assume user wants to discuss, not implement
4. THINK & PLAN: Restate what user ACTUALLY asks for
5. ASK CLARIFYING QUESTIONS before implementing
6. GATHER CONTEXT EFFICIENTLY (batch file reads)
7. IMPLEMENTATION: Focus on explicitly requested changes only
8. VERIFY & CONCLUDE: Very concise summary

**Design System Rules (CRITICAL):**
- NEVER write custom styles in components — ALWAYS use the design system
- NEVER use classes like text-white, bg-white — use design system tokens
- Use HSL colors ONLY in index.css
- Create component variants using design system tokens
- Leverage index.css and tailwind.config.ts for consistent design
- Customize shadcn components with correct variants
- Pay attention to dark vs light mode contrast

**SEO Requirements:**
- Title tags < 60 chars with keyword
- Meta description < 160 chars
- Single H1 matching primary intent
- Semantic HTML (header, nav, main, section, article, footer)
- JSON-LD structured data for products/articles/FAQs
- Lazy loading for images, canonical tags

### 2c. CURSOR AGENT 2.0 PROMPT (39KB) — Key Extracts

**Core Identity:**
"You are an AI coding assistant, powered by GPT-4.1. You operate in Cursor."

**Agent Behavior:**
- "You are an agent — please keep going until the user's query is completely resolved"
- Autonomously resolve query before coming back to user
- If plan made, immediately follow it without waiting for user confirmation
- Bias towards NOT asking user if answer can be found via tools

**Tool Architecture (relevant to CPM editor):**
- `codebase_search`: Semantic search that finds code by meaning, not exact text
- `grep`: Powerful ripgrep-based search
- `edit_file`: Propose edits with `// ... existing code ...` for unchanged lines
- `read_file`: Read any file (supports images)
- `list_dir`: List files/directories
- `glob_file_search`: Find files by name pattern
- `todo_write`: Manage task lists
- `web_search`: Real-time information retrieval

**Search Strategy:**
- CRITICAL: Start with broad, high-level query
- Break multi-part questions into focused sub-queries
- MANDATORY: Run multiple searches with different wording
- Keep searching until CONFIDENT nothing important remains

**Code Change Rules:**
- NEVER output code to user unless requested — use edit tools
- Code must run immediately (include imports, deps, endpoints)
- If linter errors introduced, fix if clear how to; stop after 3 loops on same file

### 2d. LEAP.NEW PROMPT (52KB) — Key Extracts

**Core Identity:**
"You are Leap, an expert AI assistant and exceptional senior software developer."

**Architecture:**
- Frontend: React, TypeScript, Vite, Tailwind CSS v4, shadcn-ui, Lucide icons
- Backend: Encore.ts (TypeScript REST API framework)
- Output: Single `<leapArtifact>` containing `<leapFile>` elements

**Key Patterns:**
- Think HOLISTICALLY and COMPREHENSIVELY before creating artifacts
- Consider ALL relevant files, review ALL previous changes
- ALWAYS provide FULL updated content of modified files
- NEVER use placeholders like "// rest of code remains same"
- Split functionality into smaller modules
- Keep files as small as possible
- Use CSS variables for theming (text-foreground, not text-black/text-white)

## 3. PUCK "AI SLOP VS CONSTRAINED UI" BLOG (Feb 2026) — Key Architecture Insights

**Where AI excels in UI:**
1. Translating intent into layout structure
2. Generating first-pass scaffolding
3. Automating repetitive component assembly
4. Supporting rapid experimentation

**Where unbounded generation fails:**
1. Design system violations (arbitrary margins, inconsistent hierarchies)
2. Inconsistent component usage (misusing primitives, bypassing abstractions)
3. Non-deterministic outputs (identical prompts → different layouts)
4. Brand and compliance drift (no regulatory/accessibility awareness)
5. Output requiring engineering cleanup (normalization before integration)

**The Solution — Constrained Generation:**
1. **Component registry boundaries**: Limit to approved React components
2. **Prop schema enforcement**: Validate against typed definitions
3. **Layout rules and composition limits**: Restrict component nesting
4. **Business context injection**: Embed brand, regulatory, domain constraints
5. **Deterministic output structures**: Structured JSON for predictable rendering

**Puck AI Implementation:**
- Generates from registered components only (Hero, FeatureGrid, PricingTable)
- Structured page schema output (component types → configured props → placement)
- Business context and brand rules as configuration layers
- Design system preservation through component implementation
- Deterministic behavior via controlled configuration

**Decision Framework:**
| Scenario | AI SHOULD Generate | AI SHOULD NOT Generate |
|----------|-------------------|----------------------|
| Component Model | Predefined registry | Arbitrary markup |
| Design System | Approved components | Direct styling without tokens |
| Output Format | Validated JSON schema | Raw HTML/inline styles |
| Context | Brand rules injected | Prompt-only guidance |
| Determinism | Config-controlled variability | Divergent results per prompt |

## 4. RECOMMENDED PROMPTS FOR CPM AI INTEGRATION

### 4a. Business Context (for Puck AI proxy / ai-page-builder)
```
We are Christiano Property Management, a premium vacation rental company based in Birkirkara, Malta. We specialize in luxury short-term rentals across Malta and Gozo, targeting high-end travelers seeking exceptional Mediterranean experiences.

Brand Identity:
- Primary color: Gold accent (#c8a96a / hsl(var(--cpm-accent)))
- Backgrounds: Dark luxury (#0e0f11 primary, #15171b secondary)
- Text: Warm cream (#ede9e0 primary, #9a9690 secondary)
- Typography: Clean sans-serif, elegant spacing
- Aesthetic: Premium, sophisticated, Mediterranean luxury

Available Components (35 blocks):
- Content blocks: HeroSection, AboutSection, WhyChooseUs, ServicesSection, TextBlock, VideoSection, Timeline, NewsletterSection
- Property blocks: PropertyShowcase, GuestyPropertySearch, GuestyPropertyGrid, GuestyPropertyDetail, GuestyBookingWidget
- Social proof: TestimonialSection, StatsSection, LogoBar, SocialProofStrip, TeamSection
- Conversion: BookingSection, PricingTable, CTASection, ComparisonSection
- Utility: ImageGallery, ImageWithText, FeatureGrid, MapSection, MaltaMapSection, Spacer, Divider, FooterSection, ThemeSettings

Content Guidelines:
- Always mention Malta and Gozo as destinations
- Emphasize personalized guest experience and local expertise
- Use warm, inviting language with luxury connotations
- Include specific locations: Valletta, Sliema, Mdina, Gozo
- Reference 8+ years of experience, 20+ properties, Superhost status
- Contact: info@christianopropertymanagement.com, +356 7979 0202

Technical Constraints:
- Always use semantic Tailwind theme tokens (cpm-*), never raw hex colors
- All images from centralized CDN (PROP_IMAGES, GALLERY_IMAGES constants)
- Mobile-first responsive design with 44px touch targets
- Accessible: ARIA labels, alt text, keyboard navigation
- Single H1 per page, proper heading hierarchy
```

### 4b. AI Page Generation Prompt Template (for ai-page-builder.tsx)
```
Create a [PAGE_TYPE] page for Christiano Property Management.

Page goal: [SPECIFIC_GOAL]
Target audience: [AUDIENCE]
Key message: [MESSAGE]
Call to action: [CTA]

Use these components in this order:
1. [Component 1] - [purpose]
2. [Component 2] - [purpose]
...

Style: Luxury Mediterranean, gold accents on dark backgrounds.
Tone: Warm, professional, inviting.
```

### 4c. Per-Block AI Instructions (add to each block in src/blocks/)
```typescript
// hero-section.tsx
ai: {
  instructions: "Always place as the first block. Use compelling headline about Malta/Gozo luxury experience. Background image from PROP_IMAGES. Gold accent gradient overlay.",
}

// property-showcase.tsx
ai: {
  instructions: "Display 3-6 properties in a responsive grid. Use real property names: Valletta, Madliena, Gzira, Pieta, Bahar ic-Caghaq. Each card shows image, name, location, price range, and Book Now CTA.",
}

// testimonial-section.tsx
ai: {
  instructions: "3 testimonials maximum. Use realistic guest names and nationalities. Mention specific properties or locations. 5-star ratings only. Include guest photos.",
}

// booking-section.tsx
ai: {
  instructions: "Integrate with Guesty Booking Engine. Show check-in/check-out date picker, guest count, and property selector. Gold CTA button. Display starting prices.",
}

// about-section.tsx
ai: {
  instructions: "Highlight 8+ years experience, 20+ properties, Superhost status. Use Malta/Gozo imagery. Emphasize personalized service and local expertise.",
}

// contact-section.tsx
ai: {
  instructions: "Include email (info@christianopropertymanagement.com), phone (+356 7979 0202), WhatsApp, and Google Maps embed of Birkirkara office. Social media links to Facebook, Instagram, LinkedIn.",
}
```

## 5. CROSS-TOOL PATTERN COMPARISON

| Pattern | v0 | Lovable | Cursor | Leap.new | Puck AI | CPM Should |
|---------|-----|---------|--------|----------|---------|-----------|
| Component Registry | Implicit (shadcn) | shadcn + custom | N/A | shadcn pre-installed | Explicit config | ✅ Explicit 35 blocks |
| Design Tokens | Tailwind tokens | CSS vars (HSL) | N/A | CSS variables | Component-level | ✅ cpm-* Tailwind tokens |
| Mobile-First | ✅ Required | ✅ Required | N/A | ✅ Required | Via components | ✅ Already implemented |
| Color Limit | 3-5 colors | Design system only | N/A | Via CSS vars | Via components | ✅ Gold + neutrals |
| AI Context | Implicit (prompt) | Business rules | Codebase | Backend schema | Business context | ✅ Inject Malta context |
| Output Format | Files | Search-replace | Edit tool | Artifact XML | Puck Data JSON | ✅ Block data JSON |
| SEO | Auto (layout.tsx) | Auto (per-page) | N/A | N/A | N/A | ✅ PAGE_META constants |
| Auth Required | Vercel project | Supabase | N/A | Clerk | /edit routes | ✅ ADMIN_AUTH already exists |

## 6. ACTIONABLE RECOMMENDATIONS FOR CPM

1. **Adopt v0's color constraint**: Limit to 3-5 colors (already done with cpm-* tokens)
2. **Adopt Lovable's discussion-first workflow**: AI editor should plan before implementing
3. **Adopt Cursor's semantic search**: Add codebase search to AI page builder for context
4. **Adopt Leap's holistic approach**: Always consider ALL blocks before generating a page
5. **Adopt Puck AI's constrained generation**: Only use registered 35 blocks, never arbitrary markup
6. **Add per-block AI instructions**: Add `ai.instructions` to each of 35 block definitions
7. **Use business context injection**: Malta brand identity, property data, contact info
8. **Implement Puck's tool API**: Server-side tools for property images, booking links, weather data
9. **Follow v0's Next.js 16 patterns**: Await params, use "use cache", new caching APIs
10. **Follow Lovable's SEO auto-generation**: Auto-generate meta tags, JSON-LD, canonical URLs

---
Task ID: 13 - AI-POWERED CMS UPGRADE
Agent: Main Orchestrator (parallel execution)
Task: Crawl Puck AI recipes + system prompts repos, build AI context, install Puck AI plugins, integrate AI into editor and all blocks

Work Log:
- Crawled github.com/puckeditor/puck/tree/main/recipes/next-ai — extracted official AI proxy pattern, plugin API, tools API, headless generation
- Crawled github.com/puckeditor/puck/tree/main/recipes/next — extracted ISR pattern (force-static/force-dynamic), revalidatePath
- Crawled x1xhlol/system-prompts-and-models-of-ai-tools — extracted prompts from v0 (36KB), Cursor Agent 2.0 (39KB), Lovable (20KB), Leap.new (52KB)
- Installed @puckeditor/cloud-client@0.6.0 and @puckeditor/plugin-ai@0.6.0
- Created /home/z/my-project/src/lib/ai-context.ts with 5 exports:
  - BUSINESS_CONTEXT (CPM brand identity for Puck AI)
  - BLOCK_INSTRUCTIONS (per-block AI guidance for all 35 blocks)
  - AI_SYSTEM_PROMPT (master prompt combining v0/Lovable/Cursor/Puck best patterns)
  - BLOCK_EDIT_PROMPT (specialized for block editing)
  - PAGE_GENERATION_PROMPT (specialized for page generation)
- Created /home/z/my-project/src/app/api/puck/[...all]/route.ts — Puck AI proxy route using puckHandler with CPM business context
- Verified puck-editor.tsx already had createAiPlugin and plugins={[aiPlugin]} integrated (from previous session)
- Upgraded /home/z/my-project/src/app/api/ai/build-page/route.ts — imports from ai-context.ts, injects per-block instructions
- Upgraded /home/z/my-project/src/app/api/ai/edit-block/route.ts — imports BLOCK_EDIT_PROMPT + BLOCK_INSTRUCTIONS
- Rewrote /home/z/my-project/src/app/api/ai/chat/route.ts — added conversation history support (max 10 messages), imports full AI_SYSTEM_PROMPT
- Added ai: { instructions: "..." } property to ALL 35 block files in src/blocks/

Stage Summary:
- Puck AI plugin ecosystem fully integrated: @puckeditor/plugin-ai + @puckeditor/cloud-client
- AI proxy route at /api/puck/[...all] ready for Puck Cloud connection
- 5 specialized AI prompts in ai-context.ts combining patterns from v0, Lovable, Cursor, Leap.new, and Puck constrained UI
- All 35 CMS blocks now carry AI metadata for contextual content generation
- All 3 AI API routes upgraded with business context, block schemas, and per-block instructions
- Chat route now supports conversation history for multi-turn AI assistance
- bun run lint: 0 errors, 0 warnings
- Dev server: GET / 200 confirmed
