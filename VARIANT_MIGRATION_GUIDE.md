# Variant Migration Guide — Christiano Property Management

> Step-by-step instructions for migrating code from each CPM variant
> repository into the `chrispropmanagment` monorepo.

---

## Prerequisites

Before migrating any variant, ensure you have:

```bash
# 1. Clone the monorepo
git clone https://github.com/CerisonAutomation/chrispropmanagment.git
cd chrispropmanagment

# 2. Install pnpm (if not already installed)
npm install -g pnpm@9

# 3. Install all workspace dependencies
pnpm install

# 4. Verify everything builds
pnpm run build  # or: npx turbo build
```

---

## General Migration Steps

Each variant follows the same 6-step process:

### Step 1 — Identify target app

Consult `CONSOLIDATION_STRATEGY.md` to find which app absorbs this variant.

### Step 2 — Extract unique code

```bash
# Clone the variant repo into a temp directory
git clone https://github.com/CerisonAutomation/<VARIANT>.git /tmp/<VARIANT>

# Inspect what's unique vs what already exists
diff -r /tmp/<VARIANT>/src <TARGET_APP>/src
```

### Step 3 — Copy new components/pages

```bash
# Copy files that don't already exist in the target app
cp /tmp/<VARIANT>/src/components/NewComponent.tsx <TARGET_APP>/src/components/
cp /tmp/<VARIANT>/src/app/new-route/ <TARGET_APP>/src/app/new-route/
```

### Step 4 — Update imports

Replace any local utility imports with shared package imports:

```typescript
// Before (variant repo)
import { cn } from '../lib/utils';
import type { Property } from '../types/property';

// After (monorepo)
import { cn } from '@cpm/shared-utils';
import type { Property } from '@cpm/shared-types';
```

### Step 5 — Test the migration

```bash
cd <TARGET_APP>
npx tsc --noEmit   # type-check
npx next build     # build check
```

### Step 6 — Archive the variant repo

Once migration is verified:
1. Add a `DEPRECATED.md` to the variant repo root explaining the consolidation
2. Archive the repo in GitHub settings (Settings → Archive this repository)

---

## Variant-Specific Guides

---

### `christiano-booking-engine` → `apps/booking/`

**Priority:** 🔴 CRITICAL

```bash
# Key files to migrate:
src/
  components/BookingCalendar/   → apps/booking/src/components/BookingCalendar/
  components/GuestForm/         → apps/booking/src/components/GuestForm/
  lib/guesty.ts                 → Extract to packages/guesty-sdk/ (Phase 3)
  app/(booking)/                → apps/booking/src/app/

# Environment variables needed:
GUESTY_API_KEY=
GUESTY_ACCOUNT_ID=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

---

### `cvpm-enterprise` → `apps/enterprise/`

**Priority:** 🔴 CRITICAL

```bash
# Key files to migrate:
src/
  components/Dashboard/         → apps/enterprise/src/components/Dashboard/
  components/RevenueCharts/     → apps/enterprise/src/components/RevenueCharts/
  components/ChannelManager/    → apps/enterprise/src/components/ChannelManager/
  app/(enterprise)/             → apps/enterprise/src/app/
  lib/analytics.ts              → Extract to packages/analytics/ (Phase 3)

# Environment variables needed:
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GUESTY_API_KEY=
```

---

### `christiano-pm-nextjs` → root CMS app (`/src/`)

**Priority:** 🔴 CRITICAL (TypeScript production version)

```bash
# Compare and cherry-pick newer features:
# 1. Review git log for recent commits
cd /tmp/christiano-pm-nextjs
git log --oneline -20

# 2. Extract any components not in the root app
diff -r src/components /home/runner/work/chrispropmanagment/chrispropmanagment/src/components

# 3. Merge unique pages/routes
diff -r src/app /home/runner/work/chrispropmanagment/chrispropmanagment/src/app
```

---

### `christiano-site` → `apps/website/`

**Priority:** 🟡 HIGH

```bash
# Key files to migrate:
src/
  app/(marketing)/              → apps/website/src/app/(marketing)/
  components/HeroSection/       → apps/website/src/components/HeroSection/
  components/PropertyCard/      → apps/website/src/components/PropertyCard/
  components/TestimonialGrid/   → apps/website/src/components/TestimonialGrid/

# SEO — migrate next-sitemap config
next-sitemap.config.js          → apps/website/next-sitemap.config.js
```

---

### `cvpm` → `apps/enterprise/`

**Priority:** 🟡 HIGH (JavaScript variant — needs TypeScript migration)

```bash
# JavaScript → TypeScript conversion steps:
# 1. Copy JS files
cp -r /tmp/cvpm/src/components apps/enterprise/src/components/cvpm-legacy/

# 2. Rename .js → .tsx/.ts
find apps/enterprise/src/components/cvpm-legacy -name '*.js' -exec sh -c 'mv "$1" "${1%.js}.tsx"' _ {} \;

# 3. Fix type errors iteratively
cd apps/enterprise
npx tsc --noEmit 2>&1 | head -50
```

---

### Iteration Variants (`chrischristianopropertymanagement*`) — ARCHIVE

These are development iterations with no unique production code:

```bash
# For each variant (1, 2, 3, 12, 13, final):
# 1. Quick scan for any unique business logic
git clone https://github.com/CerisonAutomation/chrischristianopropertymanagement<N>.git /tmp/cpm<N>
diff -r /tmp/cpm<N>/src /home/runner/work/chrispropmanagment/chrispropmanagment/src

# 2. If diff shows nothing unique → archive immediately
# 3. If diff shows unique code → extract and migrate before archiving
```

---

## Environment Variable Consolidation

Create a unified `.env.example` at the monorepo root. Each app uses a subset:

```bash
# ============================================================
# SUPABASE (all apps)
# ============================================================
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# ============================================================
# GUESTY API (booking + enterprise)
# ============================================================
GUESTY_API_KEY=
GUESTY_ACCOUNT_ID=
GUESTY_WEBHOOK_SECRET=

# ============================================================
# AI / OPENAI (root CMS)
# ============================================================
OPENAI_API_KEY=
MCP_BASE_URL=
MCP_API_KEY=

# ============================================================
# AUTH (all apps)
# ============================================================
NEXTAUTH_URL=
NEXTAUTH_SECRET=

# ============================================================
# UPSTASH (root CMS — queuing)
# ============================================================
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
QSTASH_TOKEN=

# ============================================================
# ANALYTICS (enterprise)
# ============================================================
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=
```

---

## Rollback Plan

If a migration causes regressions:

```bash
# 1. Revert your changes
git revert HEAD

# 2. Re-enable the variant repo (un-archive in GitHub settings)

# 3. Open an issue documenting what failed
# Title: "Migration blocked: <VARIANT_NAME>"
# Include: error messages, conflicting code sections
```

---

## Migration Tracker

| Variant | Target App | Status | Assignee |
|---|---|---|---|
| `christiano-booking-engine` | `apps/booking` | ⏳ Pending | — |
| `cvpm-enterprise` | `apps/enterprise` | ⏳ Pending | — |
| `christiano-pm-nextjs` | root CMS | ⏳ Pending | — |
| `christiano-site` | `apps/website` | ⏳ Pending | — |
| `cvpm` | `apps/enterprise` | ⏳ Pending | — |
| `cvpmmain` | `apps/enterprise` | ⏳ Pending | — |
| `CVPMBUILDER` | `apps/enterprise` | ⏳ Pending | — |
| `chrisvinpm` | `apps/enterprise` | ⏳ Pending | — |
| `christiano-cms` | root CMS | ⏳ Pending | — |
| `CMS-CPM` | root CMS | ⏳ Pending | — |
| `CPM-EDITOR` | root CMS | ⏳ Pending | — |
| `christiano-property-management` | `apps/website` | ⏳ Pending | — |
| `christianoproperty` | `apps/website` | ⏳ Pending | — |
| `CHRISTIANOPM` | `apps/website` | ⏳ Pending | — |
| `ChrisPropertyManagement` | root CMS | ⏳ Pending | — |
| `christiano-pm` | ARCHIVE | ⏳ Pending | — |
| `christianopropertymanagementWORKING` | `apps/enterprise` | ⏳ Pending | — |
| `christianopropertymanagement` | ARCHIVE | ⏳ Pending | — |
| `christianopropertymanagement1-3` | ARCHIVE | ⏳ Pending | — |
| `chrischristianopropertymanagement*` | ARCHIVE | ⏳ Pending | — |
| `bemen-booking-flow` | `apps/booking` | ⏳ Pending | — |
| `bemen-*` variants | `apps/booking` | ⏳ Pending | — |
