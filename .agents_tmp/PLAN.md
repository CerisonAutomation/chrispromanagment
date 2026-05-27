# 1. OBJECTIVE

Transform the Christiano Property Management system from a functional Next.js application into a world-class, enterprise-grade, AI-augmented property management platform. The goal is to achieve 15/10 production excellence through radical architectural re-engineering, implementing CQRS/Repository patterns, zero-trust security, comprehensive observability, and bulletproof code quality across all 50+ CMS blocks, Guesty API integrations, and AI-powered features.

# 2. CONTEXT SUMMARY

## System Architecture Overview

**Current Tech Stack:**
- **Frontend:** Next.js 16.2.3 (App Router), React 19.2.4, TypeScript 6.0.2
- **CMS:** Puck CMS (@measured/puck 0.20.2) with 50+ custom block types
- **Backend:** Supabase (PostgreSQL + Auth + Realtime), Next.js API Routes
- **Integrations:** Guesty API (OAuth2), OpenAI (GPT-4o-mini for AI features)
- **Queue/Async:** Upstash QStash + Redis for background job processing
- **Styling:** Tailwind CSS 4.2.2, Radix UI primitives
- **Monorepo:** Turborepo 2.5.4 with pnpm workspaces

**Current System Components:**
1. **CMS Pages System** (`/src/app/[...puckPath]`, `/src/app/puck/`) - Puck visual editor with versioned pages stored in Supabase
2. **Guesty Integration** (`/src/lib/guesty/`, `/src/app/api/guesty/`) - Property listings, reservations, calendar sync
3. **AI Services** (`/src/lib/ai-service.ts`) - Page auditing, block critique, optimization, content generation
4. **Admin Dashboard** (`/src/app/admin/`) - Page management, analytics
5. **Booking Engine** - Guesty-powered booking widgets and confirmation flows
6. **Block Library** (`/src/blocks/`) - 50+ block types (Hero, Properties, Testimonials, etc.)

**Key Files Identified:**
- `/src/lib/guesty.ts` - Core Guesty API client with OAuth2, rate limiting, type safety
- `/src/lib/db.ts` - Supabase service-role client with Prisma-style helpers
- `/src/lib/ai-service.ts` - OpenAI integration for auditing/optimization
- `/src/lib/qstash/client.ts` - Job queue with HMAC verification
- `/src/blocks/schemas.ts` - Zod schemas for all 50+ block types
- `/src/types/consolidated.ts` - Branded types, Result pattern, Option types
- `/src/middleware.ts` - Supabase session refresh + admin route guards

**Issues Identified:**
- Duplicate type definitions across `consolidated.ts`, `domain/types.ts`, `guesty/types.ts`
- Inconsistent error handling (mix of Result pattern and throw/catch)
- Missing comprehensive testing infrastructure
- No containerization (Docker)
- No CI/CD pipeline
- Some stub implementations in editor store
- Admin auth uses x-admin-key header (needs proper Supabase Auth)
- No observability/monitoring (OpenTelemetry)
- Missing connection pooling strategy
- No rate limiting on public APIs

# 3. APPROACH OVERVIEW

## Transformation Strategy: "Scorched Earth to Enterprise Excellence"

We will implement a **4-Phase Radical Transformation**:

### Phase A: Architectural Foundation (Week 1-2)
- **Pattern Implementation:** CQRS (Command Query Responsibility Segregation), Repository Pattern, Dependency Injection
- **Type System Unification:** Single source of truth for all types using branded types + strict TypeScript
- **Error Handling Standardization:** Consistent Result/Option patterns across entire codebase

### Phase B: Security & Observability (Week 3-4)
- **Zero-Trust Security:** OWASP Top 10 remediation, proper auth, Helmet.js, rate limiting
- **Observability:** OpenTelemetry tracing, structured JSON logging, P95/P99 metrics
- **Secret Management:** Move from env vars to Vault-style secret rotation

### Phase C: Code Quality & Testing (Week 5-6)
- **Testing Pyramid:** Unit (Jest), Integration (Supertest), E2E (Playwright)
- **Code Quality:** ESLint strict config, Prettier, Husky pre-commit hooks
- **Performance:** React Server Components optimization, edge caching, image optimization

### Phase D: DevOps & Scalability (Week 7-8)
- **Containerization:** Multi-stage Dockerfiles, Docker Compose for local dev
- **CI/CD:** GitHub Actions with SAST, DAST, container scanning
- **Scalability:** Connection pooling (PgBouncer), Redis caching, CDN setup

**Why This Approach:**
- Addresses all 6 mandates from the user's request
- Follows enterprise patterns used by Vercel, Stripe, and Vercel
- Maintains backward compatibility during transformation
- Incremental delivery with zero downtime

# 4. IMPLEMENTATION STEPS

## Phase A: Architectural Foundation

### Step A1: Type System Unification
**Goal:** Create single source of truth for all TypeScript types
**Method:**
- Merge `consolidated.ts`, `domain/types.ts`, `guesty/types.ts` into unified `src/types/index.ts`
- Implement branded types for all IDs (UserId, BlockId, PageId, ListingId)
- Add strict TypeScript config with `strict: true`, `noUncheckedIndexedAccess: true`
**Files:** `src/types/index.ts`, `tsconfig.json`, `src/lib/guesty/types.ts`

### Step A2: Implement Repository Pattern
**Goal:** Abstract all data access behind repository interfaces
**Method:**
- Create `src/repositories/` with interfaces: `PageRepository`, `ListingRepository`, `ReservationRepository`
- Implement Supabase-backed repositories: `SupabasePageRepository`, etc.
- Use dependency injection via React context or module-level singletons
**Files:** `src/repositories/*.ts`, `src/lib/db/repositories/`

### Step A3: Implement CQRS Pattern
**Goal:** Separate read (queries) from write (commands) operations
**Method:**
- Create `src/commands/` for write operations (CreatePage, UpdateBlock, SyncGuesty)
- Create `src/queries/` for read operations (GetPage, ListListings, GetAnalytics)
- Add command/query buses for decoupled execution
**Files:** `src/commands/`, `src/queries/`, `src/lib/bus.ts`

### Step A4: Standardize Error Handling
**Goal:** Use Result pattern consistently across all layers
**Method:**
- Use existing `Result<T, E>` and `Option<T>` types from consolidated.ts
- Wrap all external calls (Guesty API, Supabase, OpenAI) in Result
- Create `AppError` class with error codes, HTTP status mapping
**Files:** `src/types/result.ts`, update all API routes and services

## Phase B: Security & Observability

### Step B1: Implement OpenTelemetry Observability
**Goal:** Full distributed tracing and metrics
**Method:**
- Add `@opentelemetry/sdk-node`, `@opentelemetry/instrumentation-http`
- Instrument all API routes, database calls, external API calls
- Export traces to Jaeger/Zipkin or Vercel Observability
- Add structured JSON logging with pino or winston
**Files:** `src/lib/telemetry/`, `src/middleware.ts`, `package.json`

### Step B2: Zero-Trust Security Hardening
**Goal:** Remediate OWASP Top 10 vulnerabilities
**Method:**
- Replace x-admin-key with Supabase Auth + RLS policies
- Add Helmet.js for security headers (already partially in vercel.json)
- Implement rate limiting with Upstash Redis on all public APIs
- Add input validation with Zod on all API routes
- Set up CSRF protection, XSS prevention
**Files:** `src/middleware.ts`, `src/lib/auth.ts`, `src/lib/rate-limit.ts`

### Step B3: Secret Management
**Goal:** Move beyond plain env vars
**Method:**
- Use Vercel Edge Config or Doppler for secret management
- Implement secret rotation for Guesty API tokens
- Add validation with `zod` schema for all env vars (enhance `src/lib/env.ts`)
**Files:** `src/lib/env.ts`, `.env.schema`

## Phase C: Code Quality & Testing

### Step C1: Comprehensive Testing Pyramid
**Goal:** >80% code coverage with fast, reliable tests
**Method:**
- **Unit Tests:** Jest + Testing Library for all blocks, utils, repositories
- **Integration Tests:** Supertest for all API routes with test Supabase instance
- **E2E Tests:** Playwright for critical paths (booking flow, admin login, page editing)
- **Visual Regression:** Percy or Chromatic for UI consistency
**Files:** `src/**/*.test.ts`, `src/**/*.spec.ts`, `e2e/`, `playwright.config.ts`

### Step C2: Code Quality Enforcement
**Goal:** Zero lint warnings, consistent style
**Method:**
- Enhance ESLint config with `@typescript-eslint/strict`, `eslint-plugin-security`
- Add Prettier with import sorting
- Set up Husky + lint-staged for pre-commit hooks
- Add conventional commits with commitlint
**Files:** `.eslintrc.js`, `.prettierrc`, `.husky/`, `package.json`

### Step C3: Performance Optimization
**Goal:** Sub-100ms P95 response times on critical paths
**Method:**
- Convert all possible components to React Server Components
- Implement edge caching with Vercel Edge or Cloudflare Workers
- Add Next.js Image optimization with blur placeholders
- Set up incremental static regeneration (ISR) for property pages
**Files:** Update all `src/app/**/page.tsx`, `next.config.js`

## Phase D: DevOps & Scalability

### Step D1: Containerization
**Goal:** Reproducible local dev and deployment artifacts
**Method:**
- Create multi-stage `Dockerfile` (builder stage, production stage with node:alpine)
- Add `docker-compose.yml` with Next.js app, Supabase local, Redis, QStash emulator
- Include health checks and graceful shutdown
**Files:** `Dockerfile`, `docker-compose.yml`, `.dockerignore`

### Step D2: CI/CD Pipeline
**Goal:** Automated, secure deployment pipeline
**Method:**
- GitHub Actions workflow with parallel jobs: lint, test, build, security-scan
- Add SAST with CodeQL, DAST with OWASP ZAP
- Container scanning with Trivy or Snyk
- Auto-deploy to Vercel on merge to main
**Files:** `.github/workflows/ci-cd.yml`

### Step D3: Scalability Infrastructure
**Goal:** Handle 10x traffic spikes gracefully
**Method:**
- Add PgBouncer for Supabase connection pooling
- Implement Redis caching layer for frequently accessed data (listings, pages)
- Set up CDN (Vercel Edge Network) for static assets
- Configure auto-scaling rules for Vercel Pro/Enterprise
**Files:** `src/lib/cache/`, `next.config.js`, `vercel.json`

## Phase E: Documentation & Mapping

### Step E1: System Topography Documentation
**Goal:** Complete README with architecture diagrams
**Method:**
- Write comprehensive README.md with:
  - System overview and features
  - C4 Model architecture diagrams (Context, Containers, Components)
  - Mermaid.js sequence diagrams for critical flows
  - API documentation with OpenAPI/Swagger
**Files:** `README.md`, `docs/architecture.md`, `docs/api.yaml`

### Step E2: Code Map & Feature Map
**Goal:** Complete mapping of all features and code relationships
**Method:**
- Generate dependency graph with Madge or dependency-cruiser
- Create feature matrix mapping all 50+ blocks to components
- Document all Guesty API endpoints and data mappings
**Files:** `docs/code-map.md`, `docs/feature-matrix.md`

### Step E3: Self-Critique & Polish
**Goal:** Recursive audit and perfection
**Method:**
- Run through all files systematically checking for:
  - Inconsistent patterns
  - Missing error handling
  - Performance bottlenecks
  - Edge cases
- Fix all issues found
- Update PLAN.md with final status
**Files:** Review all `src/**/*` files

# 5. TESTING AND VALIDATION

## Success Criteria

### Phase A (Architecture):
- ✅ All types unified in `src/types/index.ts` - no duplicate definitions
- ✅ All data access goes through Repository interfaces
- ✅ CQRS pattern implemented - commands and queries separated
- ✅ All functions return `Result<T, E>` - no uncaught exceptions

### Phase B (Security & Observability):
- ✅ OpenTelemetry traces visible in dashboard for all API calls
- ✅ All admin routes protected by Supabase Auth (not x-admin-key)
- ✅ Rate limiting active on `/api/guesty/*` and `/api/booking/*`
- ✅ Security headers present (helmet, CORS properly configured)

### Phase C (Code Quality):
- ✅ Test coverage >80% with passing tests
- ✅ `npm run lint` passes with zero warnings
- ✅ All critical E2E flows passing (booking, admin, editing)
- ✅ P95 response time <100ms for cached pages, <500ms for dynamic

### Phase D (DevOps):
- ✅ `docker-compose up` brings up full local environment
- ✅ GitHub Actions pipeline passes on all PRs
- ✅ Container scan shows zero high/critical vulnerabilities
- ✅ Load test handles 1000 concurrent users without errors

### Phase E (Documentation):
- ✅ README.md is comprehensive with architecture diagrams
- ✅ Code map shows all dependencies and relationships
- ✅ Feature matrix documents all 50+ blocks with props
- ✅ Self-critique finds zero issues

## Validation Methods

1. **Automated Tests:** `npm test`, `npm run test:e2e`, `npm run test:integration`
2. **Linting:** `npm run lint`, `npm run type-check`
3. **Security Scans:** `npm run security:scan` (with Snyk)
4. **Performance:** `npm run benchmark` (with autocannon)
5. **Manual Testing:** Follow E2E checklists for booking flow, admin operations

## Rollout Strategy

- **Week 1-2:** Phase A (Architecture) - deploy incrementally with feature flags
- **Week 3-4:** Phase B (Security) - coordinate with stakeholders for auth changes
- **Week 5-6:** Phase C (Testing) - parallel development, no breaking changes
- **Week 7-8:** Phase D (DevOps) - infrastructure changes, monitor closely
- **Week 9:** Phase E (Documentation) - final polish before full release

All changes will be made via small, reviewable PRs with comprehensive test coverage.
