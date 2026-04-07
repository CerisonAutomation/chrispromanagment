# Architecture Decision Records

## ADR-001 — Canonical Type System

**Status**: Accepted  
**Date**: 2026-04-07

### Context
The codebase had 6+ competing type files (`canonical-puck-types.ts`, `official-puck-types.ts`, `block-types.ts`, `guesty-types.ts`, `lib/types/*`) causing import confusion and duplicated declarations.

### Decision
All application types are consolidated under `src/types/` with `src/types/index.ts` as the single barrel gateway. Legacy files are retained as zero-break shims with `@deprecated` JSDoc notices.

### Consequences
- Single `import type { ... } from '@/types'` pattern across entire codebase
- Zero-diff migration: old import paths still resolve via shim re-exports
- TypeScript strict mode enforces no `any` across all type files

---

## ADR-002 — Guesty OAuth2 Client Architecture

**Status**: Accepted  
**Date**: 2026-04-07

### Context
Guesty uses OAuth2 `client_credentials` with short-lived tokens (~1h). Previous implementation had no token caching, causing a new auth request on every API call, and no buffer before expiry risking 401s mid-request.

### Decision
- Module-level token cache in `src/lib/guesty-api.ts`
- 60-second pre-expiry refresh buffer (`TOKEN_BUFFER_MS = 60_000`)
- All Guesty calls routed through server-side Route Handlers — credentials never reach client bundle
- Guesty calendar v3 API shape normalisation (array vs `{days:[]}` duality)

### Consequences
- Single token refresh per expiry window, not per request
- Client bundle has zero knowledge of Guesty credentials
- Zod validation on all incoming booking-quote requests

---

## ADR-003 — Puck CMS State Management

**Status**: Accepted  
**Date**: 2026-04-07

### Context
Puck editor state was scattered across multiple stores and local component state, making undo/redo, autosave, and toast notifications unreliable.

### Decision
- Single Zustand + Immer store at `src/store/editor.ts`
- `persist` middleware saves non-sensitive UI preferences to `sessionStorage` (device mode, panel state)
- Undo/redo history capped at 50 entries (`MAX_HISTORY = 50`)
- `useLocalDraft` hook handles localStorage persistence with `syncStatus` tracking

### Consequences
- All editor state accessible via `useEditorStore((s) => s.xxx)` selector pattern
- Undo/redo is reliable and bounded — no memory leak from unbounded history
- Draft recovery survives page refreshes within same session

---

## ADR-004 — Server-First API Design

**Status**: Accepted  
**Date**: 2026-04-07

### Context
API keys (Guesty, Supabase service role) must never be exposed to the browser. All external API calls must be proxied through Next.js Route Handlers.

### Decision
- All Guesty API calls: server-side only via `/api/listings/*` and `/api/booking-quote`
- `supabaseAdmin` (service role): imported only in server files; `env.ts` guards enforce this
- `GUESTY_CLIENT_ID` and `GUESTY_CLIENT_SECRET` validated via `required()` at boot — no silent fallback
- `/api/health` provides Supabase connectivity check for uptime monitoring

### Consequences
- Zero credential leakage to client bundle — enforced by pattern, not just convention
- `env.ts` `required()` guards fail the build if secrets are absent — catches misconfiguration early
- `/api/health` usable by Vercel health checks, Uptime Robot, Datadog etc.
