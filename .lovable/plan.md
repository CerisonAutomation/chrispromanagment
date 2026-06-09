## Reality check

The uploaded `project.zip` is a **Next.js 15 App Router** project (Prisma, Vercel Blob, Upstash Redis/QStash, Stripe, multi-provider AI SDK) with **353 TS/TSX files**, **28 block source files (~8.9k lines)**, a full editor suite, and a dedicated Zenith Oracle prompt module.

This project is **Vite + React Router + Supabase + Guesty** (no Next server runtime, no Prisma, no Vercel Blob). A literal "merge everything" is not possible — Next API routes, server components, server actions, Prisma, and Blob storage have no 1:1 in this stack and would silently break Guesty/Stripe/CMS that already work.

I will do a **staged, equivalence-preserving port**, not a copy-paste. Nothing currently working gets regressed.

## Stage 1 — this turn (safe, additive)

1. Copy the **Zenith Oracle prompt** verbatim from `src/lib/zenith/oracle-prompt.ts` into `supabase/functions/cms-ai-page-generate/_oracle-prompt.ts` and use it as the system prompt (replacing the inline one), keeping our live `availableBlocks` catalog injection. Locks in the upstream prompt without changing our renderer contract.
2. Copy `agent-ctx/` and the upstream `src/components/blocks/registry.ts` + `src/lib/blocks/schema.ts` into `docs/zenith/` as **reference only** — used by future stages to map block types.
3. Write `docs/zenith/PORT_PLAN.md` listing every upstream block → our `blockRegistry` mapping (port / alias / skip), so later stages are mechanical.

Rollback: `rm -rf supabase/functions/cms-ai-page-generate/_oracle-prompt.ts docs/zenith` and revert the one import in the edge function.

## Stage 2 — next turn (block parity)

For each upstream block missing locally (e.g. `premium-blocks`, `conversion-premium-blocks`, `renovation-blocks`, `location-blocks`), port to `src/components/blocks/*.jsx` and register in `src/lib/blockRegistry.js`. Strict JSX/Tailwind only — no `next/image`, no `next/link`, no server components. Each block ships with defaults + zod schema so the Oracle can emit them.

## Stage 3 — editor parity (optional)

Port `command-palette`, `template-library`, `version-history`, `unified-ai-panel` into `src/components/admin/` as additive panels behind `/admin`. No replacement of `LiveNavigateMode`.

## Stage 4 — API surface (only what's missing)

Only port API routes that don't already exist as Supabase edge functions: `cache/warm`, `cache/invalidate`, `listings/[id]/calendar` (if not covered by `guesty-beapi`). Skip Prisma — keep Supabase as the DB.

## Explicitly NOT doing

- No Next.js install, no app router, no server components.
- No Prisma, no Vercel Blob (we use Supabase storage/JSON).
- No wholesale `cp -r src → src` (would break ~80% of files: `'use client'`, `next/*` imports, server-only APIs).
- No Puck (per project memory).

## Technical details

- Upstream stack: Next 15, Prisma, Vercel Blob, Upstash Redis/QStash, ai-sdk multi-provider, Stripe, Tailwind, Radix.
- Local stack: Vite 5, React Router, Supabase (DB + edge functions + auth), Guesty BE-API, Lovable AI Gateway, Framer Motion, Tailwind, Radix.
- Oracle prompt file is 17 lines — trivial to lift. Block registry is 319 lines and references TSX blocks — needs per-block port, not bulk copy.

## Ask

Confirm Stage 1 (Oracle prompt + reference docs) and I'll ship it this turn. Stages 2–4 will each be their own turn so you can review.