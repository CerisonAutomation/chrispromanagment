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
