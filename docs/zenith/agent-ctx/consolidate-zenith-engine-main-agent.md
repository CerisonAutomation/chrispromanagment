# Task: Consolidate 3 Duplicate AI Prompt/Context Systems

## Agent: Main Agent
## Task ID: consolidate-zenith-engine
## Status: COMPLETED

## Summary

Consolidated three duplicate AI prompt/context systems into a single canonical module `src/lib/ai/zenith-engine.ts`.

## Changes Made

### 1. Created `src/lib/ai/zenith-engine.ts` (NEW — canonical module)

**Combined from oracle-prompt.ts:**
- `ZenithMode` type
- `ZenithInput` interface
- `ZENITH_ORACLE_SYSTEM_PROMPT` constant (updated to use real cms-blocks types instead of old PascalCase names like "Navbar", "Hero", "CTA" → now "nav", "hero", "cta")
- `buildZenithUserMessage()` function
- `extractZenithJSON()` function

**Combined from ai/context.ts:**
- `ZenithOracleInput` interface
- `buildZenithSystemPrompt()` function (updated to use real cms-blocks types)
- `buildZenithUserPrompt()` function
- Style presets (elegant, modern, minimal, bold)
- CPM brand context
- JSON enforcement rules
- Theme schema description

**Combined from auto-ai-engine.ts:**
- All types: `AutoFixResult`, `PageAnalysis`, `NavLink`, `IntegrityIssue`
- All functions: `autoFixBlocks`, `autoOptimizeOrder`, `analyzePage`, `autoFixPage`, `autoGenerateNav`, `inferGaps`, `selfHeal`, `validateBlockIntegrity`, `auditBlockIntegrity`, `autoLinkBlocks`, `generateImprovementPrompts`, `disasterAudit`, `autoFixNavigation`, `autoInferGaps`, `autoFixPages`, `autoFixStyles`, `suggestNextBlocks`, `autoCompletePage`, `getPageTemplates`, `buildPageFromTemplate`

**New AI capabilities added:**
- `autoOrganize(blocks)` — Smart block ordering by category (nav first → hero → content → properties → social proof → business → media → CTA → footer)
- `blockConverter(fromType, toType, props)` — Converts props between compatible block types (e.g., hero→hero-split, cta→cta-split, property-grid→guesty-listings)
- `schemaInference(blocks)` — Infers page schema/type from blocks present, returns suggested schema with confidence score

**Key improvement:** Block catalog in AI prompts now uses ACTUAL cms-blocks.ts types (lowercase, hyphenated like "nav", "hero-split", "booking-widget") instead of old Puck-style PascalCase names ("Navbar", "HeroSplit", "BookingEngine"). Both `ZENITH_ORACLE_SYSTEM_PROMPT` and `buildZenithSystemPrompt()` now dynamically generate block catalogs from `BLOCK_CATALOG` in cms-blocks.ts.

### 2. Updated `src/lib/zenith/oracle-prompt.ts` → Re-exports from zenith-engine

Now re-exports: `ZenithMode`, `ZenithInput`, `ZENITH_ORACLE_SYSTEM_PROMPT`, `buildZenithUserMessage`, `extractZenithJSON`

### 3. Updated `src/lib/ai/context.ts` → Re-exports from zenith-engine

Now re-exports: `ZenithOracleInput`, `buildZenithSystemPrompt`, `buildZenithUserPrompt`

### 4. Updated `src/lib/auto-ai-engine.ts` → Re-exports from zenith-engine

Now re-exports all original functions plus the new capabilities: `autoOrganize`, `blockConverter`, `schemaInference`

### 5. Import compatibility

All existing imports remain working:
- `@/lib/ai/context` → still works (re-exports from zenith-engine)
- `@/lib/auto-ai-engine` → still works (re-exports from zenith-engine)
- `@/lib/zenith/oracle-prompt` → still works (re-exports from zenith-engine)

No consumer files needed updating.

## Verification
- `bun run lint` — Only pre-existing warnings (unused `_slug`, `_pages` params), no new errors
- Dev server running cleanly
