# Puck AI Demo Setup - Complete

This workspace now follows the **puck-main next-ai recipe** pattern for AI-powered page building.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        URL Routing                              │
├─────────────────────────────────────────────────────────────────┤
│  /any-path/edit  ──►  middleware.ts  ──►  /puck/any-path      │
│                                                                 │
│  /puck/[...puckPath]  ──►  Puck Editor + AI Plugin            │
│  /[...puckPath]        ──►  Page Renderer (published pages)    │
└─────────────────────────────────────────────────────────────────┘
```

## Key Files Created/Modified

### 1. Middleware (`src/middleware.ts`)
- Rewrites any URL ending in `/edit` to the Puck editor route
- Example: `/about/edit` → `/puck/about`

### 2. Puck Editor Route (`src/app/puck/[...puckPath]/`)
- `page.tsx` - Server component, loads page data
- `client.tsx` - Client component with official Puck + AI plugin

### 3. Page Renderer Route (`src/app/[...puckPath]/`)
- `page.tsx` - Server component for published pages (static generation)
- `client.tsx` - Client component using `<Render>`

### 4. API Routes
- `src/app/api/puck/[...all]/route.ts` - Puck AI proxy (existing, unchanged)
- `src/app/api/pages/route.ts` - Updated to use draft/published separation

### 5. Helper (`src/lib/get-page.ts`)
- Fetches page data from database
- Returns published data if available, otherwise draft

## How to Use

### 1. Set up environment variables
Create `.env.local` with your Puck API key:

```env
PUCK_API_KEY=your_api_key_here
```

Get your API key from: https://cloud.puckeditor.com/api-keys

### 2. Access the editor
Navigate to any page and add `/edit` to the URL:
- `http://localhost:3000/` → `http://localhost:3000/edit`
- `http://localhost:3000/about` → `http://localhost:3000/about/edit`

### 3. AI Features
The editor includes the official `@puckeditor/plugin-ai`:
- Click the AI button in the left sidebar
- Describe the page you want to create
- AI generates blocks using your existing components

### 4. Publishing
- Click "Publish" in the editor to save as published
- Pages are statically generated with ISR
- Cache automatically revalidates on publish

## Important Notes

### Authentication (REQUIRED)
The `/puck/*` routes are currently **public**. You must add authentication before deploying:

```typescript
// In src/app/puck/[...puckPath]/page.tsx
import { requireAuth } from "@/lib/auth";

export default async function Page({ params }) {
  await requireAuth(); // Add your auth check
  // ... rest of component
}
```

### Prisma Client
The Prisma schema has `draftData` and `publishedData` fields. If you see type errors:

```bash
npx prisma db push
npx prisma generate
```

### Existing Components
The AI demo uses your existing `puck.config.tsx` with all 35+ blocks:
- HeroSection, AboutSection, PropertyShowcase
- GuestyPropertySearch, BookingSection
- MaltaMapSection, etc.

## Next Steps

1. **Add authentication** to `/puck/*` routes
2. **Customize AI context** in `src/app/api/puck/[...all]/route.ts`
3. **Test** by visiting `/edit` on any route
4. **Deploy** with proper auth for production

## Differences from Custom Editor

| Feature | Old (Custom) | New (AI Demo) |
|---------|--------------|-----------------|
| Editor | Custom implementation | Official `@puckeditor/core` |
| AI | Custom plugin | `@puckeditor/plugin-ai` |
| Routes | Single page | Catch-all with `/edit` suffix |
| Rendering | Custom renderer | Official `<Render>` |
| Caching | Manual | Next.js ISR + revalidatePath |

## Troubleshooting

**Editor not loading?**
- Check that `PUCK_API_KEY` is set
- Verify `@puckeditor/core` and `@puckeditor/plugin-ai` are installed

**AI not working?**
- Verify `/api/puck/[...all]` route returns 200
- Check browser console for errors

**Pages not saving?**
- Check `/api/pages` responds correctly
- Verify database has `draftData` field
