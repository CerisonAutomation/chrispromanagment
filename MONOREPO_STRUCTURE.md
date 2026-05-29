# Monorepo Structure — Christiano Property Management

> **Phase 2** of the CerisonAutomation org-wide consolidation.
> This document describes the full monorepo layout and every app/package it hosts.

---

## Directory Overview

```
chrispropmanagment/               ← pnpm workspace root
├── apps/
│   ├── booking/                  ← Booking Engine app  (@cpm/booking)
│   ├── enterprise/               ← Enterprise Platform (@cpm/enterprise)
│   └── website/                  ← Public Website      (@cpm/website)
├── packages/
│   ├── shared-types/             ← TypeScript types    (@cpm/shared-types)
│   ├── shared-utils/             ← Utility functions   (@cpm/shared-utils)
│   └── ui-components/            ← React components    (@cpm/ui-components)
├── src/                          ← Root CMS app (christiano-property-management)
├── pnpm-workspace.yaml           ← Workspace manifest
├── turbo.json                    ← Turborepo pipeline
├── package.json                  ← Root app + workspace root
└── tsconfig.json                 ← Root TypeScript config
```

---

## Apps

### Root CMS App (`/src/`)
- **Package name:** `christiano-property-management`
- **Port:** 3000
- **Description:** Primary CMS + admin dashboard built on Next.js 16, Drizzle ORM, Supabase,
  Puck visual editor, and AI-powered MCP tools.
- **Consolidates variants:**
  - `christiano-pm-nextjs` (TypeScript production version)
  - `christiano-cms` (CMS-only variant)
  - `CMS-CPM` (CMS consolidation)
  - `CPM-EDITOR` (Editor variant)
  - `chrispropmanagment-cms`
  - `ChrisPropertyManagement` (latest TypeScript version)

### Booking Engine (`apps/booking/`)
- **Package name:** `@cpm/booking`
- **Port:** 3001
- **Description:** Guest-facing booking flow — search, availability calendar, checkout, and
  confirmation. Integrates with the Guesty API via `BEAPIENGINECORE`.
- **Consolidates variants:**
  - `christiano-booking-engine`
  - `bemen-booking-flow`
  - `bemen-regal-bookings`
  - `bemen-noir-sanctuary`
  - `bemens-zenith`

### Enterprise Platform (`apps/enterprise/`)
- **Package name:** `@cpm/enterprise`
- **Port:** 3002
- **Description:** Multi-property enterprise dashboard — owner portal, revenue analytics,
  channel management, and bulk operations.
- **Consolidates variants:**
  - `cvpm-enterprise` (**CRITICAL** — enterprise version)
  - `cvpm` (JavaScript variant)
  - `CVPMBUILDER` (builder variant)
  - `cvpmmain` (main variant)
  - `chrisvinpm` (Vincenti variant)

### Public Website (`apps/website/`)
- **Package name:** `@cpm/website`
- **Port:** 3003
- **Description:** Marketing / public-facing site — property showcase, SEO-optimised pages,
  blog, and contact forms.
- **Consolidates variants:**
  - `christiano-site` (marketing site)
  - `christiano-property-management` (recent variant)
  - `christianoproperty` (TypeScript variant)
  - `CHRISTIANOPM` (legacy)

---

## Shared Packages

### `@cpm/shared-types` (`packages/shared-types/`)
TypeScript interfaces and type definitions shared across all apps:
- `Property`, `PropertyLocation`, `PropertyMedia`, `PropertyPricing`, `PropertyStatus`
- `Booking`, `BookingStatus`, `BookingSource`
- `Guest`, `User`, `UserRole`
- `ApiResponse<T>`, `PaginatedResponse<T>`
- `AvailabilityWindow`, `Review`

### `@cpm/shared-utils` (`packages/shared-utils/`)
Pure utility functions shared across all apps:
- **CSS:** `cn()` — Tailwind class merging (clsx + tailwind-merge)
- **Dates:** `formatDate`, `formatDateShort`, `getNights`, `isDateInRange`
- **Currency:** `formatCurrency`
- **Strings:** `slugify`, `truncate`, `capitalize`
- **URL:** `buildUrl`
- **Arrays:** `groupBy`, `uniqueBy`
- **Validation:** `isValidEmail`, `isValidPhone`

### `@cpm/ui-components` (`packages/ui-components/`)
Shared React component library (headless, Tailwind-styled):
- `Button` (with variants: default, destructive, outline, secondary, ghost, link)
- `Badge` (with variants: default, secondary, destructive, outline)
- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`
- `Input`
- `Label`
- `Separator`

---

## Build Pipeline (Turborepo)

| Task         | Description                              | Cached |
|--------------|------------------------------------------|--------|
| `build`      | Build all apps/packages in dependency order | ✅ Yes |
| `dev`        | Start all dev servers                    | ❌ No  |
| `lint`       | Lint all workspaces                      | ✅ Yes |
| `type-check` | TypeScript check all workspaces          | ✅ Yes |
| `test`       | Run test suites                          | ✅ Yes |
| `clean`      | Remove all build artifacts               | ❌ No  |

---

## Future Apps (Phase 3+)

| App              | Source Variants                           | Status   |
|------------------|-------------------------------------------|----------|
| `apps/cms`       | Payload CMS 3.x (if migrated from root)   | Planned  |
| `apps/mobile`    | React Native / Expo variant               | Planned  |
| `apps/api`       | Standalone API server                     | Planned  |
| `apps/storybook` | Component documentation                   | Planned  |

---

## Port Allocation

| App                   | Dev Port |
|-----------------------|----------|
| Root CMS              | 3000     |
| Booking Engine        | 3001     |
| Enterprise Platform   | 3002     |
| Public Website        | 3003     |
| Storybook (future)    | 6006     |
