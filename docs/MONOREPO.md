# Monorepo Architecture Guide

> Cerison Platform — pnpm monorepo with Next.js 16, Drizzle ORM, Supabase, Puck editor, shadcn/ui.

---

## Overview

This repository is a **pnpm workspace monorepo** managed with [Turborepo](https://turbo.build/).  
It consolidates three previously separate repositories (CMS-CPM + christiano-cms + christiano-site).

```
chrispropmanagment/
├── apps/
│   ├── booking/        @cpm/booking    — Guest booking flow (port 3001)
│   ├── enterprise/     @cpm/enterprise — Enterprise admin platform (port 3002)
│   └── website/        @cpm/website    — Public marketing site (port 3003)
├── packages/
│   ├── config/         @cpm/config     — Shared Next.js / ESLint / Tailwind config
│   ├── shared-types/   @cpm/shared-types — TypeScript types (Property, Booking, etc.)
│   ├── shared-utils/   @cpm/shared-utils — Pure utility functions (cn, formatDate, etc.)
│   └── ui-components/  @cpm/ui-components — React component library (shadcn/ui base)
├── src/                Root CMS app (christiano-property-management, port 3000)
├── tsconfig.base.json  Shared TypeScript compiler options
├── pnpm-workspace.yaml Workspace manifest
└── turbo.json          Turborepo pipeline
```

---

## Package Manager

**pnpm v9** — required. Do not use npm or yarn.

```bash
# Install all workspace dependencies
pnpm install

# Add dependency to a specific workspace
pnpm --filter @cpm/booking add some-package

# Run a script in a specific workspace
pnpm --filter @cpm/booking dev

# Run across all workspaces
pnpm turbo build
pnpm turbo lint
pnpm turbo type-check
```

---

## Dependency Management

### `workspace:*` Protocol

Internal packages always use `workspace:*`:

```json
{
  "dependencies": {
    "@cpm/shared-types": "workspace:*",
    "@cpm/shared-utils": "workspace:*",
    "@cpm/ui-components": "workspace:*"
  }
}
```

### Version Strategy

| Package | Version | Notes |
|---------|---------|-------|
| Next.js | 16.2.3 | Pinned — update all workspaces together |
| TypeScript | ^6.0.2 | Consistent across all packages |
| React | ^19.2.4 | Consistent across all packages |
| ESLint | ^10.2.0 | Consistent across all packages |
| Tailwind | ^4.2.2 | Consistent across all packages |

### Adding New Dependencies

1. Check if it belongs in a shared package or a specific app
2. If shared (e.g., a UI component): add to `packages/ui-components`
3. If app-specific: add to `apps/<app-name>`
4. Never add app-specific dependencies to the workspace root

---

## TypeScript Configuration

All packages extend from `tsconfig.base.json`:

```
tsconfig.base.json (root)
├── tsconfig.json (root CMS app)
├── apps/booking/tsconfig.json
├── apps/enterprise/tsconfig.json
├── apps/website/tsconfig.json
├── packages/config/tsconfig.json
├── packages/shared-types/tsconfig.json
├── packages/shared-utils/tsconfig.json
└── packages/ui-components/tsconfig.json
```

To modify a compiler option for ALL packages, edit `tsconfig.base.json`.  
To override for a specific package, add the option in that package's `tsconfig.json`.

---

## Build Pipeline (Turborepo)

| Task | Command | Cached | Depends On |
|------|---------|--------|------------|
| `build` | `pnpm turbo build` | ✅ | `^build` (packages first) |
| `dev` | `pnpm turbo dev` | ❌ | — |
| `lint` | `pnpm turbo lint` | ✅ | `^lint` |
| `type-check` | `pnpm turbo type-check` | ✅ | `^type-check` |
| `test` | `pnpm turbo test` | ✅ | `^build` |
| `clean` | `pnpm turbo clean` | ❌ | — |

### Local Turbo Cache

Turbo stores build cache in `.turbo/`. This is gitignored and local only.  
For remote caching (optional), configure `TURBO_TOKEN` and `TURBO_TEAM` env vars.

---

## Development

```bash
# Start all apps
pnpm dev:all

# Start individual apps
pnpm dev              # Root CMS (port 3000)
pnpm dev:booking      # Booking app (port 3001)
pnpm dev:enterprise   # Enterprise app (port 3002)
pnpm dev:website      # Website (port 3003)
```

---

## Port Allocation

| App | Port | Package |
|-----|------|---------|
| Root CMS | 3000 | christiano-property-management |
| Booking | 3001 | @cpm/booking |
| Enterprise | 3002 | @cpm/enterprise |
| Website | 3003 | @cpm/website |

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in all required values.  
**Never commit `.env` files** — they are gitignored.

See `.env.example` for the full list of required variables.

---

## Troubleshooting

### `pnpm-lock.yaml` conflicts
```bash
# Delete lockfile and reinstall
rm pnpm-lock.yaml
pnpm install
```

### TypeScript path resolution errors
Make sure `paths` in the app's `tsconfig.json` point to the correct package source files.

### Workspace package not found
```bash
# Check workspace packages are resolved
pnpm list -r --depth 0
```

### Turbo cache issues
```bash
# Clear turbo cache
pnpm turbo clean
rm -rf .turbo
```
