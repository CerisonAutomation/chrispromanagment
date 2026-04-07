# Christo Property Management

Premium property management & holiday rental platform — Malta.

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 15 App Router |
| Database | Supabase (PostgreSQL) |
| CMS | Puck visual editor |
| Bookings | Guesty Open API |
| Styling | Tailwind CSS v4 |
| Deploy | Vercel |

## Quick Start

```bash
cp .env.example .env.local
# Fill in your Supabase + Guesty keys
npm install
npm run dev
```

## Routes

| Route | Description |
|---|---|
| `/` | CMS-managed homepage |
| `/properties` | Guesty property listings |
| `/admin` | Admin dashboard |
| `/admin/pages` | Page manager |
| `/puck/[slug]` | Visual page editor |
| `/api/puck/[slug]` | CMS REST API |
| `/api/properties` | Guesty listings proxy |
| `/api/quote` | Booking quote API |

## Key Files

```
src/
├── types/index.ts          # All domain types
├── lib/
│   ├── env.ts              # Type-safe env
│   ├── supabase.ts         # DB client + helpers
│   ├── guesty.ts           # Guesty API client
│   └── utils.ts            # Shared utilities
├── puck.config.tsx         # Puck block registry
├── middleware.ts            # Auth + security headers
└── app/
    ├── admin/              # Admin shell
    ├── puck/               # Visual editor
    ├── api/                # API routes
    └── [...puckPath]/      # Public CMS pages
```

## Database (Supabase)

Project: `supabase-citrine-saddle` — `mohpkakmpagvbqsehwhp`

Tables: `cms_pages`, `media_uploads`, `booking_quotes`

## Env Vars (Vercel)

Set these in Vercel Dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
- `SUPABASE_SERVICE_ROLE_KEY`
- `GUESTY_CLIENT_ID`
- `GUESTY_CLIENT_SECRET`
