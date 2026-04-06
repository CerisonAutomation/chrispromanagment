# Production Build Checklist

## Pre-Build Verification

### Environment Variables
- [ ] Verify all required `.env` variables are set
- [ ] Check `DATABASE_URL` is correct for production database
- [ ] Verify `NEXT_PUBLIC_SITE_URL` matches production domain
- [ ] Confirm API keys and secrets are in `.env.local` (not committed)

### Database
- [ ] Run `bun db:generate` to generate Prisma client
- [ ] Run `bun db:push` to sync database schema
- [ ] Verify database backups are in place
- [ ] Test database connection string

### Code Quality
- [ ] Run `bun lint` and fix all issues
- [ ] Ensure no console.logs remain in production code
- [ ] Review error handling implementation
- [ ] Check TypeScript strict mode compliance

## Build Process

### Dependencies
- [ ] Update `bun.lock` with `bun install`
- [ ] Audit dependencies: `bun audit`
- [ ] Remove unused dependencies
- [ ] Check for security vulnerabilities

### Type Safety
- [ ] Run type checking: `bun tsc --noEmit`
- [ ] Verify no `any` types in critical paths
- [ ] Check all API responses are typed

### Build
- [ ] Run `bun build` locally and verify success
- [ ] Check build output size
- [ ] Verify no unexpected files in `.next`
- [ ] Test production build locally: `bun start`

## Post-Build Verification

### Performance
- [ ] Check Core Web Vitals metrics
- [ ] Verify image optimization
- [ ] Review bundle size
- [ ] Test page load times

### Security
- [ ] Verify environment variables are not exposed
- [ ] Check CORS headers are correct
- [ ] Verify CSP headers are set
- [ ] Test rate limiting on API routes

### Functionality
- [ ] Test all critical user flows
- [ ] Verify API endpoints work correctly
- [ ] Check database queries are optimized
- [ ] Test error pages (404, 500, etc.)

## Deployment

### Pre-Deployment
- [ ] Create git tag for release: `git tag v1.0.0`
- [ ] Push to main branch
- [ ] Create release notes

### Deployment
- [ ] Deploy to Vercel or production server
- [ ] Verify build completes successfully
- [ ] Check production logs for errors
- [ ] Monitor error tracking (Sentry, etc.)

### Post-Deployment
- [ ] Verify site is accessible
- [ ] Test critical flows in production
- [ ] Check analytics tracking
- [ ] Monitor application performance
- [ ] Set up alerts for errors

## Monitoring & Maintenance

### Ongoing
- [ ] Monitor error logs daily
- [ ] Review performance metrics weekly
- [ ] Update dependencies monthly
- [ ] Audit security quarterly

### Incident Response
- [ ] Document any issues that occur
- [ ] Update error handling if needed
- [ ] Review logs and fix root causes
- [ ] Update documentation as needed
