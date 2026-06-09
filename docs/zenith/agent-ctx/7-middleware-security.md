# Task 7: Improve middleware.ts with better security and API route auth

## Summary

Improved the Christiano Property Management middleware, sitemap, and robots configuration for enhanced security and SEO.

## Changes Made

### 1. `src/middleware.ts` — Enhanced Security & API Route Protection

**Added:**
- **Admin API route protection**: Admin-only routes (`/api/cache/invalidate`, `/api/cache/warm`, `/api/cms/pages`, `/api/cms/sync`, `/api/cms/seed`) now require an `Authorization` header for mutation requests (POST/PUT/DELETE/PATCH). Returns 401 with `{ error: "Authorization required", code: "AUTH_REQUIRED" }` if missing.
- **Request size limiting**: Mutation endpoints are limited to 10MB payload. Returns 413 with `{ error: "Request too large", code: "PAYLOAD_TOO_LARGE" }` if exceeded.
- **CORS headers for API routes**: Configured with allowed origins (`christianopm.com`, `www.christianopm.com`, `localhost:3000`), and permissive in development mode. Includes `Access-Control-Allow-Methods`, `Access-Control-Allow-Headers`, and `Access-Control-Max-Age`.
- **Rate limiting awareness headers**: `X-RateLimit-Policy` (60 requests per 60-second window) and `X-RateLimit-Limit` headers for downstream consumption.
- **`X-Content-Version` header**: Set to `"2025-03-04"` for cache busting awareness. Can be updated on deployments.
- **`X-Robots-Tag` header**: Dynamically sets `noindex, nofollow` for `/api/`, `/editor`, and `/admin` routes; `index, follow` for all others.
- **`X-Request-ID` header**: Unique UUID per API request for tracing.
- **`X-API-Access` header**: Marks API responses as `public` or `protected` for downstream awareness.
- **`Cache-Control: no-store`**: Prevents caching of API responses.
- **Public API routes catalog**: `PUBLIC_API_ROUTES` array with `isPublicApiRoute()` helper, used to tag responses appropriately.
- **`.webp` exclusion in matcher**: Added to static asset exclusions.

**Preserved:**
- All existing security headers (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, X-DNS-Prefetch-Control, HSTS).

### 2. `src/app/sitemap.ts` — Dynamic Property & City Pages

**Added:**
- **`/book` page**: Added to static sitemap entries with priority 0.6.
- **Dynamic city/location pages**: Fetches from `/api/guesty/listings/cities` and generates `properties?city=...` URLs with weekly change frequency.
- **Dynamic CMS pages**: Fetches published pages from `/api/cms/pages`, filters out `home` and unpublished pages, generates `/{slug}` URLs.
- **Adjusted priorities**: `/about` and `/contact` bumped to 0.7 for better SEO weight.

**Preserved:**
- All existing static pages.
- Dynamic property pages from Guesty API with graceful fallback.

### 3. `src/app/robots.ts` — Comprehensive Crawler Rules

**Added:**
- **Googlebot-specific rules**: More permissive than general (allows `/book`).
- **AI training crawler blocks**: Rules for `Google-Extended`, `GPTBot` (OpenAI), `CCBot` (Common Crawl), and `anthropic-ai` — all blocked from `/api/`, `/admin`, `/editor`.
- **`host` field**: Set to `https://christianopm.com` for canonical host identification.
- **`/book` disallow** for general user agents (dynamic state, redirect to properties instead).

**Preserved:**
- All existing general rules.
- Sitemap reference.

## Lint Status
No lint errors or warnings in the modified files. All existing project warnings are in the `upload/` folder and are pre-existing.

## Dev Server Status
Application compiles and runs correctly. Sitemap and robots endpoints return 200. Middleware processes requests with all new headers applied.
