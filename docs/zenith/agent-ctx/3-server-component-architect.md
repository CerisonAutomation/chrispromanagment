# Task 3 — Server Component Architect

## Task: Convert property/[id]/page.tsx to Server Component with generateMetadata

### What was done
- Converted the property detail page from a pure "use client" component to a hybrid server/client architecture
- Created `property-client.tsx` with "use client" directive containing all interactive logic
- Converted `page.tsx` to a server component with `generateMetadata` for SSR SEO
- Added `primary.jwwb.nl` to `next.config.ts` remote patterns for next/image
- Replaced raw `<img>` tags with `next/image` components
- Removed `document.title` useEffect (now handled by generateMetadata)
- If initialData provided by server, no loading flash; otherwise falls back to client-side fetch

### Files Changed
- `next.config.ts` — Added primary.jwwb.nl image domain
- `src/app/property/[id]/page.tsx` — Rewritten as server component with generateMetadata
- `src/app/property/[id]/property-client.tsx` — NEW: Extracted client interactive component

### Verification
- Lint: No new errors. Warnings match original code patterns.
- Dev server: `/property/st-julians-penthouse` renders 200 OK
