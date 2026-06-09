# Task: Centralize and Consolidate Codebase — Agent Record

## Task ID: codebase-consolidation-001
## Agent: Code Audit & Consolidation Agent
## Date: 2025-03-04

## Summary

Audited and consolidated the Christiano Property Management Next.js codebase to eliminate duplication and create a clean, organized architecture. No files were deleted — only deprecation comments, barrel export improvements, and JSDoc documentation were added.

## Changes Made

### 1. `src/lib/index.ts` — Barrel Export Overhaul
- **Fixed broken export**: Removed `getGuestyOpenAPIToken` (doesn't exist in guesty-auth.ts — Open API uses static X-API-KEY, not OAuth)
- **Fixed broken export**: Replaced non-existent `withRateLimitAndAuth`, `extractIP`, `RateLimitTier` with actual exports `globalRatelimit`, `heavyRatelimit`
- **Added missing exports** for 10+ modules:
  - `api-auth.ts` → `requireAdmin`
  - `auto-features.ts` → All auto-composition functions + `DiagnosticIssue` type
  - `blob.ts` → All blob storage functions + `BlobPhoto` type
  - `commerce-blocks.ts` → Commerce block catalog and helpers + types
  - `cms-sync.ts` → `savePageToDB`, `publishPageToDB`, `loadPageFromDB`, etc. + `SyncResult` type
  - `date-utils.ts` → `formatDate`, `formatDateFull`, `formatDateTime`
  - `editor-store.ts` → `useEditorStore`, `Viewport` type
  - `editor-utils.ts` → All utility functions (debounce, throttle, escapeHtml, safeClone, etc.)
  - `listing-utils.ts` → `resolveImageUrl`, `getNights`, `getTodayStr`, `getMinCheckoutStr`, `PLACEHOLDER_IMAGE`
  - `mock-data.ts` → `mockListings`, `maltaCities`, `PropertyListing` type
  - `performance.ts` → `createPerformanceMonitor`, `createDebouncedUpdate`, `createThrottle`, etc.
  - `pagination.ts` → `parsePaginationParams`, `buildPaginationMeta`, `buildPageLinks`, `DEFAULT_PAGE_SIZE`, `MAX_PAGE_SIZE`, types
- **Added comprehensive JSDoc** with architecture notes explaining module relationships

### 2. `src/hooks/index.ts` — Documentation Improvement
- Added clear documentation about the **two `usePagination` hooks** (sync vs async)
- Clarified that importing from `@/hooks` gives the async server-driven version
- All hooks already properly exported — no missing exports found

### 3. Guesty Module Consolidation
- **`guesty-client.ts`** → Marked as **DEPRECATED** with detailed explanation:
  - Does NOT auto-retry on 401/403 (guesty-beapi does)
  - Uses raw redis instead of cacheAside abstraction
  - Has its own hashPayload() instead of shared one
  - Missing TypeScript types
  - Points to `guesty-beapi.ts` as the canonical module
- **`guesty-beapi.ts`** → Added "CANONICAL MODULE" designation with comparison to guesty-client.ts
- **`guesty-api.ts`** → Clarified it covers a DIFFERENT API surface (v1 Open API with X-API-KEY)
- **`guesty-auth.ts`** → Added auth architecture documentation explaining which modules use OAuth vs API key

### 4. Service Layer Documentation (`src/lib/services/`)
Each service file now has a **DELEGATION CHAIN** comment showing exactly which underlying module it wraps:
- `guesty.service.ts` → Delegates to `guesty-beapi.ts` (server) and `apiClient` (client)
- `booking.service.ts` → Delegates to `guesty-beapi.ts` and `stripe-server.ts`
- `stripe.service.ts` → Delegates to `stripe-server.ts`
- `cache.service.ts` → Delegates to `redis.ts` and `cache.ts`
- `cms.service.ts` → Delegates to `supabase.ts` (server) and `apiClient` (client)
- `commerce.service.ts` → Self-contained pure functions
- `contact.service.ts` → Delegates to `apiClient`
- `ai.service.ts` → Delegates to local templates and `/api/ai/generate`
- `export.service.ts` → Self-contained local generation
- `services/index.ts` → Added architecture note that services are facades

### 5. CMS Module Separation of Concerns
Each CMS module now has explicit SEPARATION OF CONCERNS documentation:
- **`cms-data.ts`** → Static CONTENT (pure data, no logic)
- **`cms-blocks.ts`** → Block TYPE definitions and catalog (structure, no content)
- **`cms-store.ts`** → Client-side STATE (Zustand + localStorage, no API calls)
- **`cms-sync.ts`** → Server-side PERSISTENCE (Supabase CRUD, no client state)

### 6. Pagination Layer Documentation
All four pagination layers now cross-reference each other:
- **`lib/pagination.ts`** → Server-side utilities (parse params, paginate arrays)
- **`hooks/use-pagination.ts`** → Async React hook (server-driven)
- **`components/shared/pagination.tsx`** → UI component + sync usePagination hook
- **`components/ui/pagination.tsx`** → shadcn/ui primitives

### 7. API Client Clarification
- **`api-client.ts`** → Clarified it's the CLIENT-SIDE fetch wrapper (in-memory cache, calls /api/* routes)
- Explicitly contrasted with `guesty-beapi.ts` (server-side, Redis cache, calls Guesty directly)

### 8. Component Barrel Exports
- **`components/shared/index.ts`** → Added note about usePagination naming conflict
- **`components/blocks/index.ts`** → Added architecture documentation

## Pre-existing Issues Found (Not Fixed)
- `blob.ts` has type errors (Date vs string mismatch, missing contentType property)
- `guesty-api.ts` references missing CACHE_KEYS (QUOTE_PREFIX, COUPON_PREFIX) and TTL (QUOTE, COUPON)
- `guesty-beapi.ts` has a safeSet call with incorrect arguments
- These are pre-existing and not related to the consolidation work

## Verification
- All barrel exports compile cleanly (no TypeScript errors in barrel files)
- No new lint errors introduced
- Dev server runs successfully
- No existing imports broken
