# Task: Version Toolbar + AI Command Palette Enhancement

## Summary

Completed two tasks for the Christiano Property Management Next.js app:

### Task A: Version Number in Editor Toolbar
- Added `APP_VERSION = "v0.2.0"` constant to `canvas-toolbar.tsx`
- Placed a subtle version label at the top-right of the toolbar, after the Export button
- Styling: `text-[9px] text-muted-foreground/50 font-mono tracking-tight ml-1 select-none`
- Also added version display in the command palette footer next to the logo

### Task B: AI Context-Aware Commands
Added 6 new AI pipeline commands to the command palette, all grouped under the "AI" category:

1. **AI: Generate Page from Prompt** (`Wand2` icon)
   - Opens `window.prompt()` for user input
   - Calls `POST /api/ai/generate` with slug + prompt + `generateBlocks: true`
   - Converts returned `blockData` or `blocks` to `BlockConfig[]` and applies to page
   - Toast on success/failure

2. **AI: Auto-Link All CTAs** (`Waypoints` icon)
   - Uses client-side `autoLinkBlocks()` from `@/lib/auto-ai-engine`
   - Pushes undo before applying, reports change count
   - Distinct from existing "Auto-Link CTAs" (uses "AI:" prefix)

3. **AI: Hydrate from Guesty** (`Database` icon)
   - Fetches listings from `GET /api/guesty/listings`
   - Maps Guesty listing data to property grid block props (title, location, price, image, bedrooms, etc.)
   - Applies hydrated blocks to current page

4. **AI: Auto-Fill Images** (`ImageIcon` icon)
   - Fetches photos from `GET /api/photos` (Vercel Blob)
   - Fills missing images in hero, gallery, image, and about blocks
   - Cycles through available photos for multiple empty slots

5. **AI: Full Pipeline** (`Rocket` icon)
   - Runs client-side `autoFixPages()` first
   - Then calls `POST /api/ai/generate` with `usePipeline: true` for server-side validation, linking, hydration
   - Falls back to client-side fixes only if server pipeline returns no blocks

6. **AI: Critique This Page** (`ClipboardCheck` icon)
   - Calls `POST /api/ai/generate` with `mode: "critique"`
   - Parses JSON critique results (good/warn/improve)
   - Shows toast with summary and top 3 suggestions
   - Opens AI panel for full details

### New Imports Added
- `Database`, `ImageIcon`, `Rocket`, `RefreshCw`, `ClipboardCheck` from lucide-react

### Files Modified
- `src/components/editor/canvas-toolbar.tsx` — version label + APP_VERSION constant
- `src/components/editor/command-palette.tsx` — 6 new AI commands + version in footer + new imports

### Lint Status
- No new lint errors introduced
- Pre-existing errors in canvas-toolbar.tsx (setState in effect) are unrelated
