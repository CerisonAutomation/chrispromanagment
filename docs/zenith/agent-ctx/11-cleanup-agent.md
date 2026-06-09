# Task 11: Clean up dead dependencies, duplicate files, and deprecated code

**Agent:** cleanup-agent
**Date:** 2025-06-01
**Status:** ✅ Completed

## Summary

Systematically cleaned up dead code, deprecated modules, leaked env vars, and stale reference files from the project.

## Changes

### 1. Deprecated `src/lib/guesty-api.ts`
- Still imported by 2 route files — cannot delete yet
- Added `@deprecated` JSDoc + notice redirecting to `guesty-beapi.ts`
- `guesty-client.ts` does not exist — no action needed

### 2. Removed dead barrel export from `src/lib/index.ts`
- Removed `export * as GuestyOpenAPI from "./guesty-api"` (unused)

### 3. Removed dead deps from `package.json`
- Removed `@tanstack/react-table` (not imported anywhere)
- Removed `@mdxeditor/editor` (not imported anywhere)
- Kept `recharts` (used by `chart.tsx` shadcn component)

### 4. Fixed VITE_ env in `src/app/api/cache/warm/route.ts`
- Removed `process.env.VITE_QSTASH_CURRENT_SIGNING_KEY` fallback
- Only `process.env.QSTASH_CURRENT_SIGNING_KEY` remains
- `stripe-server.ts` was already clean

### 5. Deleted stale files from `upload/`
- 6 files deleted (JSX pages + Postman collection)

### 6. Deleted `examples/` directory
- `examples/websocket/` removed entirely

### Post-cleanup
- `bun install` ran successfully (2 packages removed)
- Dev server compiles and runs without errors
- No new lint errors introduced
