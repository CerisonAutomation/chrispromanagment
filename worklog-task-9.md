---
## Task ID: 9 - CSS Theme Canonicalization (globals.css Foundation)
### Work Task
Update `src/app/globals.css` to add comprehensive Tailwind v4 theme extensions, CSS utility classes, missing variables, and deduplicate keyframe animations. This is the foundation for all other canonicalization work.

### Work Summary
Modified `/home/z/my-project/src/app/globals.css` (642 → 706 lines) with six targeted edit groups:

1. **Tailwind v4 @theme color aliases** (lines 45–62): Added 17 `--color-cpm-*` mappings inside `@theme inline {}` so Tailwind utility classes like `bg-cpm-accent`, `text-cpm-text-primary`, `border-cpm-border`, `bg-cpm-success`, `text-cpm-error` etc. are available project-wide.

2. **Missing :root CSS variables** (lines 120–126): Added semantic color variables `--cpm-gold-dark`, `--cpm-success`, `--cpm-success-dim`, `--cpm-error`, `--cpm-error-dim`, `--cpm-info` used throughout the codebase but previously undefined.

3. **Light theme variables** (lines 207–212): Added the same 6 semantic variables to `[data-theme="light"]` block with adjusted light-theme values (e.g., `--cpm-gold-dark: #7a5c28`, `--cpm-success: #059669`).

4. **Dark theme variables** (lines 248–253): Added matching semantic variables to `.dark` block with dark-theme values (same as :root defaults).

5. **Deduplicated keyframes** (was lines 264–272): Removed `gradientShift` (duplicate of `gradient-shift`) and `pulseRing` (duplicate of `pulse-ring`). Retained 24 unique canonical keyframes, zero duplicates.

6. **New @utility classes** (lines 404–434): Added 8 new utilities:
   - `gradient-gold` — 135deg gold-to-hover gradient
   - `gradient-gold-dark` — 135deg gold-to-dark-gold gradient
   - `gradient-gold-text` — animated gold text gradient with background-clip
   - `gradient-hero-overlay` — top-to-bottom dark overlay (solid to 0.6 to 0.3)
   - `gradient-surface-glass` — subtle glass surface gradient
   - `gradient-divider` — horizontal fade-in/fade-out gold line
   - `shadow-glow` — 30px ambient gold glow
   - `shadow-glow-strong` — 40px stronger gold glow

### Validation
- Brace balance: OK (balanced)
- Duplicate keyframes: 0 (24 unique)
- Theme color aliases: 17 registered
- File integrity: 706 lines, 20,342 chars
- Note: Pre-existing page.tsx build error (unterminated regexp) is unrelated to CSS changes

### Next Actions
- Components using inline style background gradients can migrate to className utilities
- Components using inline boxShadow can migrate to shadow-glow / shadow-glow-strong
- Color hardcodes in className strings can replace with cpm-* Tailwind utilities
