# Task 001: Admin Editor & Auto-AI Fix

## Summary
Fixed the admin editor page, auto-AI engine, block renderer, and AI API route.

## Changes Made

### 1. Admin Page (`src/app/admin/page.tsx`)
- **Fix**: Moved `triggerAutoSave` useCallback declaration BEFORE the useEffect that uses it, resolving the "Cannot access variable before it is declared" lint error.
- **Fix**: Added `triggerAutoSave` to the useEffect dependency array.
- **Note**: The admin page was already correctly importing all editor components. No PuckEditor/ThemeEditor/AIPanel references existed - those were already replaced with actual components. Cmd+K shortcut was already implemented.

### 2. Auto-AI Engine (`src/lib/auto-ai-engine.ts`)
- **Add**: New `IntegrityIssue` type exported (was missing, causing import errors in auto-ai-panel.tsx).
- **Fix**: `validateBlockIntegrity()` now returns `{ valid, issues, fixedBlocks }` instead of just `{ valid, issues }`. The `fixedBlocks` array contains auto-fixed blocks (with defaults filled, duplicate IDs regenerated, invalid variants corrected).
- **Fix**: `validateBlockIntegrity()` now checks for:
  - Duplicate block IDs (auto-fix: regenerate with `generateId()`)
  - Missing required props (auto-fix: fill with defaults from block meta)
  - Empty hero/CTA content (auto-fix: use defaults from meta)
  - Invalid variants (auto-fix: reset to first valid variant)
  - Missing visibility
- **Fix**: `auditBlockIntegrity()` now returns `IntegrityIssue[]` instead of a custom inline type. Also added duplicate ID and missing ID checks.

### 3. Auto-AI Panel (`src/components/editor/auto-ai-panel.tsx`)
- **Fix**: `handleValidateIntegrity` now correctly uses `validateBlockIntegrity().fixedBlocks` to apply fixes (was previously using the validation result directly as blocks array, which was wrong since it returned `{ valid, issues }` not `BlockConfig[]`).

### 4. Block Renderer (`src/components/blocks/block-renderer.tsx`)
- **Fix**: Unknown block types now render nothing (null) instead of crashing or falling back to a text block.
- **Fix**: Removed unused `BLOCK_CATALOG` import.
- **Fix**: Changed from `resolveBlock()` to direct `BLOCK_REGISTRY` lookup to avoid "Cannot create components during render" lint error.

### 5. Block Registry (`src/components/blocks/registry.ts`)
- **Fix**: `resolveBlock()` now returns `ComponentType | null` instead of always returning a component (was falling back to `BlockText` for unknown types).

### 6. AI API Route (`src/app/api/ai/generate/route.ts`)
- **Add**: Rate limiting via `withRateLimit(req, 'heavy')` using the existing rate-limit infrastructure.

## Verification
- All modified files pass `bun run lint` with no new errors
- Admin page returns HTTP 200
- Dev server compiles without errors
