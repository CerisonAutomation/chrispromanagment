# Task 2 — Animation Presets System Upgrade

## Agent: lib-builder
## Status: COMPLETED

## Work Done

### 1. Read existing file (`src/lib/animation-presets.ts`)
- Found 14 presets (8 entrance, 3 emphasis, 2 hover, 2 continuous)
- Existing types: `AnimationTrigger`, `AnimationCategory`, `AnimationKeyframe`, `AnimationPreset`
- Existing helpers: `getAnimationPreset`, `getAnimationPresetsByCategory`, `getAnimationPresetsByTrigger`
- Existing generators: `presetToCSSKeyframes`, `presetToCSSAnimationValue`, `generateAnimationCSS`, `generateAnimationObserverJS`, `createAnimationFromPreset`

### 2. Read Vue source (`upload/all-src.txt` lines 1725-2285)
- Found same 14 presets with slightly different values (durations, easing, trigger assignments)
- Vue source had `pulse` as continuous/looping (vs existing as onClick), `bounce` as onHover (vs existing as onClick), `shake` as onHover (vs existing as onClick)
- Vue source used `translateX(-100px)` for slide-in-left (vs existing `-100%`)

### 3. Created upgraded animation-presets.ts
- Merged both sources, preferring Vue source values where they were more refined
- Added 6 Malta-luxury presets: gold-shimmer, mediterranean-wave, sea-breeze, sunrise-reveal, coin-flip, curtain-open
- Added 4 property-specific presets: property-card-lift, gallery-reveal, price-highlight, badge-pop
- Total: 22 presets across 7 categories
- New types: `AnimationOptions`, `ScrollTriggerConfig`, `AnimationInstance`, `BlockAnimationConfig`
- New functions: `searchAnimationPresets`, `getAvailableCategories`, `createAnimationFromPresetId`, `generateCSSKeyframes`, `generateAllAnimationCSS`, `getScrollObserverConfig`, `generateScrollObserverBundle`, `resolveBlockAnimation`, `getAnimationInlineStyle`
- Added `ANIMATION_CATEGORY_META` and `DEFAULT_BLOCK_ANIMATION` constants

### 4. Updated barrel export (`src/lib/index.ts`)
- Added 18 named exports + 8 type exports from animation-presets

### Lint: 0 new errors
