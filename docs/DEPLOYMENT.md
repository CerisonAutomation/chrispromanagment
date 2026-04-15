# Deployment Runbook

> Cerison Platform — deployment guide for all environments.

---

## Environments

| Environment | Branch | URL | Platform |
|-------------|--------|-----|----------|
| Production | `main` | https://chrispropmanagment.vercel.app | Vercel |
| Staging | `develop` | https://chrispropmanagment-staging.vercel.app | Vercel |
| Local | — | http://localhost:3000 | Local |

---

## Pre-Deployment Checklist

- [ ] All CI checks pass (type-check, lint, build)
- [ ] Environment variables set in Vercel dashboard
- [ ] Database migrations applied (`pnpm db:migrate`)
- [ ] No `NEXT_PUBLIC_` secrets exposed
- [ ] `pnpm-lock.yaml` is committed and up-to-date

---

## Environment Variables

All required environment variables must be set before deployment.

### Required for all environments

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon (public) key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) |
| `NEXTAUTH_SECRET` | NextAuth.js JWT secret (min 32 chars) |
| `NEXTAUTH_URL` | Full URL of the deployed app |
| `OPENAI_API_KEY` | OpenAI API key for AI features |

### Optional / feature flags

| Variable | Description |
|----------|-------------|
| `MCP_BASE_URL` | MCP server base URL (default: http://localhost:3001) |
| `MCP_API_KEY` | MCP server API key |
| `GUESTY_CLIENT_ID` | Guesty OAuth client ID |
| `GUESTY_CLIENT_SECRET` | Guesty OAuth client secret |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis URL for rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis token |

---

## Deploying to Vercel

### First-time setup

```bash
# Install Vercel CLI
npm i -g vercel

# Link to Vercel project
vercel link

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# ... (repeat for all required vars)
```

### Deploy

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Automatic Deployments

Pushing to `main` triggers automatic production deployment via GitHub Actions + Vercel.

---

## Database Migrations

```bash
# Generate a new migration
pnpm db:generate

# Apply migrations
pnpm db:migrate

# Push schema directly (development only)
pnpm db:push

# Open Drizzle Studio (DB GUI)
pnpm db:studio
```

---

## Rollback

```bash
# Via Vercel dashboard: Deployments → Previous deployment → Promote

# Via CLI
vercel rollback [deployment-url]
```

---

## Health Checks

After deployment, verify:

1. **Homepage** loads: `curl -I https://your-domain.com`
2. **API health**: `curl https://your-domain.com/api/health`
3. **Supabase connection**: Check Supabase dashboard for active connections
4. **AI features**: Test the Puck editor AI generation

---

## Troubleshooting

### Build fails on Vercel

1. Check build logs in Vercel dashboard
2. Ensure all environment variables are set
3. Run `pnpm build` locally to reproduce

### Database connection errors

1. Verify `NEXT_PUBLIC_SUPABASE_URL` and keys are correct
2. Check Supabase project is not paused
3. Verify RLS policies allow the required operations

### TypeScript build errors

```bash
# Run type check via pnpm turbo (recommended — respects workspace configs)
pnpm turbo type-check

# Or run on root CMS app only
npx tsc --noEmit
```
