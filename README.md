# Christiano Property Management

Luxury short-let management platform — Malta. Vite + React + Supabase + Guesty.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | Vite 5, React 18, TypeScript, Tailwind CSS, Framer Motion |
| Auth | Supabase Auth (email + Google OAuth) |
| Database | Supabase Postgres (RLS on all tables) |
| CMS | `cms_content` table + visual block editor |
| Property sync | Guesty Open API (OAuth2 client credentials) |
| AI copy | OpenAI GPT-4o-mini via Supabase Edge Function |
| Hosting | Vercel (frontend) + Supabase (DB + Edge Functions) |

---

## Local Development

```bash
# 1. Clone and install
git clone <repo>
cd christiano-property-management
npm install

# 2. Environment
cp .env.example .env.local
# Fill in: VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY

# 3. Apply migrations
supabase db push

# 4. Start dev server
npm run dev        # → http://localhost:8080
```

---

## Supabase Setup

### Required environment variables

**Supabase project settings → API:**
```
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<anon-key>
```

**Supabase project settings → Edge Functions → Secrets:**
```
GUESTY_CLIENT_ID=<guesty-open-api-client-id>
GUESTY_CLIENT_SECRET=<guesty-open-api-client-secret>
OPENAI_API_KEY=<openai-key>          # optional — enables AI copy
```

### Migrations (run in order)

```bash
supabase db push
```

This applies:
1. `20260407000001_guesty_tables.sql` — Guesty sync tables
2. `20260530000002_cms_seed_and_availability.sql` — CMS seed + availability calendar
3. `20260530000003_cms_rls_and_triggers.sql` — RLS write policies + settings seed

### Edge Functions

```bash
supabase functions deploy guesty-listings
supabase functions deploy cms-ai-enhance
```

### Create your admin user

1. Sign up at `/auth`
2. In Supabase dashboard → SQL Editor:
```sql
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin' FROM auth.users WHERE email = 'your@email.com';
```

---

## Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard:
# VITE_SUPABASE_URL
# VITE_SUPABASE_PUBLISHABLE_KEY
```

`vercel.json` is already configured for SPA routing.

---

## CMS Architecture

### How it works

All page copy is stored in `cms_content` rows. Each row has:
- `section_key` — unique identifier (e.g. `landing__hero`)
- `content` — JSONB payload with all copy fields
- `is_visible` — toggle without deleting
- `sort_order` — display order in editor

### ComponentDefinition Registry (`src/lib/cms-types.ts`)

Every registered `section_key` declares its field schema. The editor renders proper inputs (text, textarea, boolean, array, nested objects) instead of raw JSON. Unregistered keys fall back to raw JSON editing.

### Adding a new CMS block

1. Insert a row in `cms_content`:
```sql
INSERT INTO cms_content (section_key, section_label, sort_order, content)
VALUES ('page__my_block', 'Page – My Block', 50, '{"title": "Hello"}');
```

2. Register in `COMPONENT_REGISTRY` in `src/lib/cms-types.ts`:
```ts
{
  section_key: "page__my_block",
  label: "Page – My Block",
  page: "landing",
  fields: [
    { key: "title", label: "Title", type: "text" }
  ]
}
```

3. Read in your page component:
```tsx
const { get } = useCmsContent();
const block = get<{ title: string }>("page__my_block", { title: "Hello" });
```

### Version History

The **History** panel (clock icon in CMS editor) lets you:
- Take named snapshots of all blocks
- Restore any previous snapshot (with confirmation)
- Each snapshot stores full content + visibility state

### AI Copy Enhancement

Click the ✦ AI button on any text/textarea field. Type an instruction ("make it more luxurious", "shorter", "more Malta-specific"). Requires `OPENAI_API_KEY` set in Supabase secrets.

---

## Project Structure

```
src/
├── components/
│   ├── cms/
│   │   ├── BlockEditor.tsx     # Per-block visual editor card
│   │   ├── FieldEditor.tsx     # Field-type dispatch (text/array/bool/etc.)
│   │   └── VersionPanel.tsx    # Snapshot + restore sidebar
│   └── ui/                     # shadcn/ui primitives
├── hooks/
│   ├── use-auth.ts             # Supabase auth + roles
│   └── use-cms-content.ts      # Cached CMS content hook
├── lib/
│   ├── cms-types.ts            # ComponentDefinition registry + Result<T,E>
│   ├── cms-repository.ts       # CQRS: all CMS data access
│   └── utils.ts
├── pages/
│   ├── Landing.tsx             # / — CMS-driven
│   ├── Booking.tsx             # /booking — CMS-driven
│   ├── Owners.tsx              # /owners — CMS-driven
│   ├── ListingDetail.tsx       # /listing/:id — availability calendar
│   ├── Admin.tsx               # /admin — dashboard
│   ├── AdminCMS.tsx            # /admin/cms — visual CMS editor
│   ├── AdminInquiries.tsx      # /admin/inquiries
│   └── Auth.tsx                # /auth
├── integrations/supabase/
│   ├── client.ts
│   └── types.ts                # Generated DB types
supabase/
├── functions/
│   ├── guesty-listings/        # Fetch + cache Guesty listings
│   └── cms-ai-enhance/         # GPT-4o-mini copy improvement
└── migrations/
    ├── 20260407000001_guesty_tables.sql
    ├── 20260530000002_cms_seed_and_availability.sql
    └── 20260530000003_cms_rls_and_triggers.sql
```

---

## Routes

| Path | Description | Auth |
|---|---|---|
| `/` | Landing page | Public |
| `/booking` | Property listings | Public |
| `/listing/:id` | Property detail + availability | Public |
| `/owners` | Owner onboarding | Public |
| `/auth` | Sign in / sign up | Public |
| `/admin` | Dashboard | admin/editor |
| `/admin/cms` | CMS visual editor | admin/editor |
| `/admin/inquiries` | Owner inquiry inbox | admin only |
