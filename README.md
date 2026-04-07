# Chris Property Management

Premium short-term rental platform for Malta — built with Next.js 15, Supabase, Puck CMS, and the Guesty Booking Engine.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| CMS | Puck (visual drag-drop, server-persisted) |
| Database | Supabase (Postgres + RLS) |
| Auth | Supabase Magic Link OTP |
| Bookings | Guesty Open API v1 |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Hosting | Vercel (Edge Network) |
| Package manager | Bun |

## Quick Start

```bash
# 1. Clone & install
git clone https://github.com/CerisonAutomation/chrispropmanagment
cd chrispropmanagment
bun install

# 2. Configure environment
cp .env.example .env.local
# Fill in all required values (see .env.example)

# 3. Run locally
bun dev
```

Open [http://localhost:3000](http://localhost:3000) — admin at `/admin`.

## Environment Variables

See `.env.example` for the full annotated list. Required keys:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` ← server-only, never expose
- `GUESTY_API_KEY`
- `GUESTY_ACCOUNT_ID`

## Project Structure

```
src/
  app/          # Next.js App Router routes
  blocks/       # Puck CMS visual blocks (single source of truth)
  components/   # Shared UI components
  lib/          # Utilities, Supabase clients, Guesty API
  hooks/        # Custom React hooks
  types/        # Global TypeScript types
puck.config.tsx # Puck block registry
drizzle.config.ts
tailwind.config.ts
```

## Deployment

Push to `main` → Vercel auto-deploys. All environment variables must be set in the Vercel dashboard.

```bash
# Type-check before push
bun tsc --noEmit

# Lint
bun eslint src/
```

## License

Private — © CerisonAutomation. All rights reserved.
