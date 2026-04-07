# Christiano Property Management

[![Deploy Status](https://img.shields.io/github/deployments/CerisonAutomation/chrispropmanagment/production?label=vercel&logo=vercel)](https://chrispropmanagment.vercel.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript)](https://www.typescriptlang.org)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)](https://supabase.com)

A production-grade property management & booking platform with an AI-powered Puck CMS editor, Guesty API integration, and Supabase backend.

---

## Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 App Router (RSC-first) |
| CMS Editor | Puck (drag-and-drop, AI-assisted) |
| Database | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth (OAuth PKCE + email) |
| Booking API | Guesty Open API v1 (OAuth2 client_credentials) |
| State | Zustand + Immer (editor) / TanStack Query v5 (server state) |
| UI | shadcn/ui + Tailwind CSS v4 |
| Forms | React Hook Form + Zod |
| Deployment | Vercel (Edge + Node runtimes) |

---

## Quick Start

```bash
npm install
cp .env.example .env.local  # fill in required vars
npm run dev
```

## Required Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ (server) | Supabase service role (never expose to client) |
| `GUESTY_CLIENT_ID` | ✅ | Guesty OAuth2 client ID |
| `GUESTY_CLIENT_SECRET` | ✅ | Guesty OAuth2 client secret |
| `NEXT_PUBLIC_SITE_URL` | ⚡ | Production URL (used in sitemap/robots) |

---

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/                # Route Handlers (server-only)
│   │   ├── listings/       # Guesty proxy endpoints
│   │   ├── booking-quote/  # Quote endpoint
│   │   ├── pages/          # CMS CRUD
│   │   └── health/         # Liveness probe
│   ├── admin/              # CMS admin (protected)
│   ├── puck/               # Puck editor
│   └── properties/         # Property listing pages
├── blocks/                 # Puck block components
├── components/             # Shared UI components
│   └── ui/                 # shadcn/ui primitives
├── hooks/                  # React hooks
├── lib/                    # Server + shared utilities
│   ├── guesty-api.ts       # Guesty OAuth2 client
│   ├── supabase.ts         # DB helpers
│   ├── env.ts              # Validated env vars
│   ├── query-keys.ts       # TanStack Query keys
│   └── utils.ts            # Pure utility functions
├── providers/              # React context providers
├── store/                  # Zustand stores
│   └── editor.ts           # Puck editor store
└── types/                  # Canonical type system
    ├── index.ts            # Single import gateway
    ├── puck.ts             # Puck/editor types
    ├── guesty.ts           # Guesty API types
    ├── cms.ts              # CMS page/theme types
    ├── ui.ts               # UI component types
    └── db.ts               # Supabase table shapes
```

---

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/listings` | GET | All properties (paginated) |
| `/api/listings/[id]` | GET | Single property |
| `/api/listings/[id]/calendar` | GET | Availability calendar |
| `/api/booking-quote` | POST | Price quote |
| `/api/pages` | GET, POST | CMS pages list / create |
| `/api/pages/[slug]` | GET, PATCH, DELETE | CMS page CRUD |
| `/api/health` | GET | Liveness + DB check |

---

## Architecture Decisions

See [ARCHITECTURE.md](./ARCHITECTURE.md) for full ADRs.
