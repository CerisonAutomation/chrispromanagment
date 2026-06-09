# Task: Consolidate Guesty API Modules — Summary

## Task ID: guesty-consolidation

## What Was Done

### 1. Read and Analyzed All Guesty Files
- `src/lib/guesty-auth.ts` — BEAPI token management with Redis + OpenAPI token support (4 exports)
- `src/lib/guesty-api.ts` — Open API v1 client with X-API-KEY auth (10 exports)
- `src/lib/guesty-beapi.ts` — Booking Engine API client with Redis caching (13 exports)
- `src/lib/guesty/` directory — Phase 1 rewrite with auth.ts, client.ts, types.ts, mock-data.ts, index.ts

### 2. Determined Canonical Module
The `src/lib/guesty/` directory was confirmed as the most organized and canonical module. The top-level files were marked `@deprecated` with notes pointing to the guesty/ directory.

### 3. Consolidated into `src/lib/guesty/`

#### Merged `guesty-auth.ts` → `guesty/auth.ts`
- Added `getGuestyBEAPIToken()` / `invalidateGuestyBEAPIToken()` (BEAPI OAuth2 with env var + Redis + JWT validation)
- Added `getGuestyOpenAPIToken()` / `invalidateGuestyOpenAPIToken()` (Open API legacy auth)
- Preserved existing `getToken()` / `invalidateToken()` (Phase 1, GUESTY_CLIENT_ID-based)
- Updated imports to use `@/lib/redis` instead of `./redis`

#### Moved `guesty-beapi.ts` → `guesty/beapi.ts`
- All 13 public exports preserved: `beListListings`, `beGetListing`, `beGetListingCalendar`, `beListAvailableListings`, `beListCities`, `beGetReservationMoney`, `beCreateReservation`, `invalidateListingCaches`, `invalidateAllListingCaches`, `forceReauth`, `warmCache`, plus type re-exports
- Updated imports: `./guesty-auth` → `./auth`, `./redis` → `@/lib/redis`, `./cache` → `@/lib/cache`

#### Moved `guesty-api.ts` → `guesty/openapi.ts`
- All 10 public exports preserved: `guestyFetch`, `fetchListings`, `fetchListing`, `fetchListingCalendar`, `createQuote`, `fetchQuote`, `applyCoupon`, `removeCoupon`, `createReservation`, `fetchReservation`
- Updated imports to use `@/lib/redis` and `@/lib/cache`
- Note: `createQuote` re-exported as `openApiCreateQuote` to avoid name clash with Phase 1 `createQuote` in client.ts
- Note: `createReservation` re-exported as `openApiCreateReservation` for same reason

### 4. Updated `guesty/index.ts` Barrel
Now re-exports everything from all sub-modules:
- **Auth**: `getToken`, `invalidateToken`, `getGuestyBEAPIToken`, `invalidateGuestyBEAPIToken`, `getGuestyOpenAPIToken`, `invalidateGuestyOpenAPIToken`
- **Client**: `getListings`, `getListing`, `getAvailability`, `createQuote`, `getQuote`, `isUsingMockData`
- **BEAPI**: All 11 public functions
- **OpenAPI**: All 10 public functions (with renamed exports to avoid collisions)
- **Mock Data**: All 9 mock data exports
- **Types**: All BEAPI-specific and shared types

### 5. Updated All Project Imports (16 files)
| File | Old Import | New Import |
|------|-----------|------------|
| `app/api/quotes/[quoteId]/coupons/route.ts` | `@/lib/guesty-api` | `@/lib/guesty` |
| `app/api/cache/warm/route.ts` | `@/lib/guesty-beapi` | `@/lib/guesty` |
| `app/api/cache/invalidate/route.ts` | `@/lib/guesty-auth` | `@/lib/guesty` |
| `app/api/quotes/route.ts` | `@/lib/guesty-beapi` | `@/lib/guesty` |
| `app/api/payments/confirm/route.ts` | `@/lib/guesty-beapi` | `@/lib/guesty` |
| `app/api/listings/route.ts` | `@/lib/guesty-beapi` | `@/lib/guesty` |
| `app/api/listings/[id]/route.ts` | `@/lib/guesty-beapi` | `@/lib/guesty` |
| `app/api/listings/[id]/calendar/route.ts` | `@/lib/guesty-beapi` | `@/lib/guesty` |
| `app/api/guesty/listings/route.ts` | `@/lib/guesty-beapi` | `@/lib/guesty` |
| `app/api/guesty/listings/[id]/route.ts` | `@/lib/guesty-beapi` | `@/lib/guesty` |
| `app/api/guesty/listings/[id]/calendar/route.ts` | `@/lib/guesty-beapi` | `@/lib/guesty` |
| `app/api/guesty/listings/availability/route.ts` | `@/lib/guesty-beapi` | `@/lib/guesty` |
| `app/api/guesty/listings/cities/route.ts` | `@/lib/guesty-beapi` | `@/lib/guesty` |
| `app/api/guesty/availability/route.ts` | `@/lib/guesty-beapi` | `@/lib/guesty` |
| `app/api/guesty/reservations/route.ts` | `@/lib/guesty-beapi` | `@/lib/guesty` |
| `app/api/guesty/reservations/money/route.ts` | `@/lib/guesty-beapi` | `@/lib/guesty` |
| `app/api/guesty/token/route.ts` | `@/lib/guesty-auth` (dynamic) | `@/lib/guesty` (dynamic) |
| `lib/services/guesty.service.ts` | `../guesty-beapi` | `@/lib/guesty/beapi` |
| `lib/services/booking.service.ts` | `../guesty-beapi` | `@/lib/guesty/beapi` |

### 6. Updated `lib/index.ts`
Changed `from "./guesty-auth"` → `from "./guesty"` and added `invalidateGuestyBEAPIToken` + `invalidateGuestyOpenAPIToken` exports.

### 7. Deleted Top-Level Files
- ❌ `src/lib/guesty-auth.ts` — deleted
- ❌ `src/lib/guesty-api.ts` — deleted
- ❌ `src/lib/guesty-beapi.ts` — deleted

### 8. Updated Stale Comments
- `src/types/guesty.ts`: Updated reference from `guesty-beapi.ts` → `guesty/beapi.ts`
- `src/lib/cache.ts`: Updated reference from `guesty-beapi.ts and guesty-api.ts` → `guesty/beapi.ts and guesty/openapi.ts`
- `src/lib/index.ts`: Updated example from `@/lib/guesty-beapi` → `@/lib/guesty/beapi`

## Issues Found
- **None**. All lint checks pass with only pre-existing warnings (no new errors). The dev server compiles and serves the app successfully.
- Minor: The OpenAPI `createQuote` and `createReservation` are re-exported with prefixed names (`openApiCreateQuote`, `openApiCreateReservation`) to avoid name collisions with the Phase 1 client's `createQuote` and the BEAPI's `beCreateReservation`. This is intentional — the OpenAPI module is deprecated and only used by the coupons route.

## Final File Structure
```
src/lib/guesty/
├── auth.ts        # All auth: Phase 1 getToken + BEAPI + OpenAPI
├── beapi.ts       # Booking Engine API (BEAPI) client
├── client.ts      # Phase 1 client (normalized Property/BookingQuote)
├── index.ts       # Barrel export — single import point
├── mock-data.ts   # Mock data fallback
├── openapi.ts     # Legacy Open API v1 client
└── types.ts       # BEAPI-specific TypeScript interfaces
```
