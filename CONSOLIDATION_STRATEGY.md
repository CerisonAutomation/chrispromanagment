# Consolidation Strategy — Christiano Property Management

> **Phase 2** of the CerisonAutomation org-wide consolidation.
> This document maps all 20+ CPM variant repositories to their target location
> in the `chrispropmanagment` pnpm monorepo.

---

## Executive Summary

The Christiano Property Management ecosystem currently has **22+ repositories** with significant
duplication. This strategy consolidates them into **1 monorepo** with **4 apps** and
**3 shared packages**, reducing maintenance overhead, eliminating duplicated code, and creating
a single source of truth.

---

## Variant Repository Map

### Tier 1 — ABSORB INTO ROOT CMS APP (`/src/`)

These variants become part of the root Next.js CMS app:

| Variant Repo | Priority | Key Features to Extract |
|---|---|---|
| `christiano-pm-nextjs` | 🔴 CRITICAL | TypeScript types, booking schemas, UI patterns |
| `ChrisPropertyManagement` | 🟡 HIGH | Latest UI components, routing patterns |
| `christiano-cms` | 🟡 HIGH | CMS content models, Puck block definitions |
| `CMS-CPM` | 🟡 HIGH | CMS consolidation logic |
| `CPM-EDITOR` | 🟢 MEDIUM | Editor UI, content editing workflows |
| `chrispropmanagment-cms` | 🟢 MEDIUM | CMS configuration |

### Tier 2 — ABSORB INTO BOOKING APP (`apps/booking/`)

| Variant Repo | Priority | Key Features to Extract |
|---|---|---|
| `christiano-booking-engine` | 🔴 CRITICAL | Booking flow, availability calendar, Guesty API integration |
| `bemen-booking-flow` | 🟡 HIGH | Alternative booking UX, guest checkout flow |
| `bemen-regal-bookings` | 🟡 HIGH | Regal/luxury booking theme |
| `bemen-noir-sanctuary` | 🟢 MEDIUM | Noir/dark theme booking variant |
| `bemens-zenith` | 🟢 MEDIUM | Zenith theme booking |
| `Bemenone` | 🟢 MEDIUM | Single-property booking variant |

### Tier 3 — ABSORB INTO ENTERPRISE APP (`apps/enterprise/`)

| Variant Repo | Priority | Key Features to Extract |
|---|---|---|
| `cvpm-enterprise` | 🔴 CRITICAL | Enterprise multi-property management, channel sync |
| `cvpm` | 🟡 HIGH | JavaScript core, revenue analytics |
| `cvpmmain` | 🟡 HIGH | Main dashboard patterns |
| `CVPMBUILDER` | 🟢 MEDIUM | Property builder/configurator |
| `chrisvinpm` | 🟢 MEDIUM | Vincenti brand variant |
| `christianopropertymanagementWORKING` | 🟢 MEDIUM | Working development prototype |

### Tier 4 — ABSORB INTO WEBSITE APP (`apps/website/`)

| Variant Repo | Priority | Key Features to Extract |
|---|---|---|
| `christiano-site` | 🟡 HIGH | Marketing pages, SEO metadata, blog |
| `christiano-property-management` | 🟡 HIGH | Recent variant — property showcase |
| `christianoproperty` | 🟢 MEDIUM | TypeScript property listing pages |
| `CHRISTIANOPM` | 🟢 MEDIUM | Legacy pages to migrate or discard |

### Tier 5 — ARCHIVE (no code to extract)

| Variant Repo | Reason |
|---|---|
| `christiano-pm` | Sanity CMS version — superseded by Payload/Drizzle |
| `chrischristianopropertymanagement` | Iteration variants — superseded |
| `chrischristianopropertymanagement1` | Iteration variants — superseded |
| `chrischristianopropertymanagement2` | Iteration variants — superseded |
| `chrischristianopropertymanagement3` | Iteration variants — superseded |
| `chrischristianopropertymanagement12` | Iteration variants — superseded |
| `chrischristianopropertymanagement13` | Iteration variants — superseded |
| `chrischristianopropertymanagementfinal` | Superseded by monorepo |
| `christianopropertymanagement` | JavaScript (non-TypeScript) version |
| `christianopropertymanagement1-3` | Old iteration variants |

---

## Shared Code Extraction Plan

### Phase 2 (current): Foundation packages created
- ✅ `@cpm/shared-types` — All domain TypeScript interfaces
- ✅ `@cpm/shared-utils` — Date, currency, string, validation utilities
- ✅ `@cpm/ui-components` — Headless React component library

### Phase 3: Supabase & Auth layer
- [ ] Extract Supabase client setup into `packages/supabase-client`
- [ ] Unify NextAuth configuration across all apps

### Phase 4: Feature packages
- [ ] `packages/booking-engine` — Core booking logic, availability checks
- [ ] `packages/guesty-sdk` — Guesty API client (wrap `BEAPIENGINECORE`)
- [ ] `packages/analytics` — Revenue analytics, reporting utilities

---

## Technical Debt to Address

| Issue | Severity | Apps Affected | Action |
|---|---|---|---|
| Mixed npm/pnpm usage | 🟡 HIGH | All | Standardise on pnpm |
| Next.js version skew (14, 15, 16) | 🟡 HIGH | All | Pin to Next.js 16 |
| Duplicate Supabase clients | 🟡 HIGH | All | Extract to `@cpm/supabase-client` |
| Scattered Zod schemas | 🟢 MEDIUM | All | Move to `@cpm/shared-types` |
| No test infrastructure | 🔴 CRITICAL | All | Add Vitest to each package |
| Missing CI on variant repos | 🟢 MEDIUM | Variants | Handled by archive action |

---

## Decision Log

| Decision | Rationale |
|---|---|
| Keep root app at `/` instead of moving to `apps/cms` | Avoids breaking Vercel deployment config and existing environment setup |
| Use pnpm workspaces over NX | Simpler setup, already aligned with existing `.npmrc` |
| Use Turborepo for orchestration | Native pnpm support, incremental builds, remote caching |
| Keep variant repos until Phase 3 | Allows gradual migration without disrupting any live deployments |
| `@cpm/*` internal package naming | Clear namespace, avoids collision with public npm packages |
