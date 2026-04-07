# AGENT_PROMPT.md — Cerison Property Platform

> Working prompt for AI agents on this codebase. Replace vague god-prompts with this.

---

## What This Is

A **premium short-term rental platform for Malta**, built by CerisonAutomation. Not a generic app — it has specific business logic, a specific visual identity, and a specific user (Chris).

Stack: **Next.js 15 App Router · Supabase · Puck CMS · Guesty Booking Engine · Tailwind v4 · shadcn/ui · Bun**

---

## How to Work on This Codebase

### Before touching anything:
1. Read `worklog.md` — it documents what's been done, what broke, and why decisions were made
2. Read `ARCHITECTURE.md` — understand the system before changing it
3. Check `BUILD_CHECKLIST.md` — know what "done" looks like

### Core rules:
- **Bun, not npm/yarn** — always `bun install`, `bun dev`, `bun build`
- **`@puckeditor/core` is broken** — use the local custom block renderer (`src/lib/block-renderer.ts`) and `src/puck.config.tsx`
- **Guesty = Booking Engine API** (`booking-api.guesty.com`) — NOT the Open API. Don't change this.
- **Supabase for persistence** — pages, bookings, media stored there. Prisma schema is the source of truth for DB shape.
- **No `any` types** — the codebase is strict TypeScript. Keep it that way.
- **Malta identity** — brand colors, the Malta/Gozo SVG loader, `#cvGold` gradient. Don't strip this out.

---

## What "Done" Means Here

- `bun build` passes with zero errors
- Zero TypeScript errors in strict mode
- Zero ESLint warnings
- Dev server (`bun dev`) serves pages with 200s
- Admin at `/admin` works (CRUD pages, block editor, media library)
- Public pages render via the custom block renderer
- Guesty booking widget loads on property pages

---

## Current Known Issues (check `worklog.md` for latest)

- `@puckeditor/core` was unresolvable — custom renderer was built as a workaround, don't reintroduce Puck imports in app routes
- Some store files are `.disabled` — they were intentionally removed from compilation, don't re-enable without understanding why
- Prisma and Drizzle both exist — Prisma is primary, Drizzle config is legacy

---

## What to Do When Stuck

1. Read the relevant source file first — don't guess
2. Check `CODEBASE_AUDIT.md` and `OMNISCAN_SUMMARY.md` for prior analysis
3. Check `docs/BRUTAL_AUDIT.md` — it's honest about what's broken
4. If an API call fails, check `.env` — most issues are missing env vars
5. Log the `worklog.md` entry when you make a significant change

---

## Log Format (append to worklog.md)

```
---
Task ID: <n>
Agent: <name or "Main">
Task: <one-line description>

Work Log:
- What you read
- What you found
- What you changed and why
- Any blockers

Stage Summary:
- Files modified
- Build status
- Lint status
```

---

## What Matters to Chris

- The site looks premium — Malta aesthetic, gold accents, clean typography
- Bookings work reliably — Guesty integration must not break
- The admin is usable — Chris manages pages himself without code
- Fast and mobile-friendly — guests browse on phones
- The Puck editor feels good — drag-drop page building is the core feature

---

*This prompt is grounded in the actual codebase. Update it when the architecture changes.*
