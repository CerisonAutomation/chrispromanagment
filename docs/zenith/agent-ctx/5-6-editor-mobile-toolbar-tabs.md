# Task 5-6: Block action toolbar mobile + Right sidebar tabs responsive

## Summary
Applied three responsive/mobile improvements to editor sidebar and toolbar components.

## Changes Made

### 1. `src/components/editor/canvas.tsx` — Block Action Toolbar
- Changed toolbar button className from `w-8 h-8` to `w-9 h-9 sm:w-8 sm:h-8`
- Mobile touch targets now 36px (up from 32px)

### 2. `src/components/editor/right-sidebar.tsx` — Right Sidebar Tabs
- min-width: `40px` → `44px` on mobile, `40px` on sm+
- padding: `py-2.5` → `py-3` on mobile, `py-2.5` on sm+
- Active tab: added `bg-primary/5 sm:bg-transparent` background highlight on mobile
- Text labels: hidden on mobile via `hidden sm:inline` on `<span>`, visible on sm+

### 3. `src/components/editor/left-sidebar.tsx` — Left Sidebar Tabs
- padding: `py-2` → `py-3` on mobile, `py-2` on sm+
- Active tab: added `bg-primary/5 sm:bg-transparent` background highlight on mobile
- Labels already hidden on mobile via existing `hidden md:inline`

## Verification
- ESLint: No new errors introduced (all warnings/errors pre-existing)
- All changes use Tailwind responsive prefixes (sm:, md:) for clean breakpoints
