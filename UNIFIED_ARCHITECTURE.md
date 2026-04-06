# Unified CMS - 15/10 Production Architecture

## Directory Structure

```
src/
├── domain/                    # Business logic, framework-agnostic
│   ├── entities/             # Domain entities with strict types
│   ├── value-objects/        # Immutable value objects
│   ├── repositories/         # Repository interfaces (ports)
│   └── errors/               # Domain-specific errors
├── application/               # Use cases, orchestration
│   ├── services/             # Application services
│   ├── store/                # Zustand store with strict typing
│   └── dto/                  # Data transfer objects
├── infrastructure/            # External concerns
│   ├── cache/                # LRU cache with TTL
│   ├── db/                   # Prisma + connection management
│   ├── api/                  # API clients with retry logic
│   └── auth/                 # JWT + session management
├── presentation/              # UI layer
│   ├── components/           # React components
│   ├── hooks/                # Custom hooks with cleanup
│   └── providers/            # Context providers
└── shared/                    # Utilities
    ├── types/                # Shared TypeScript types
    ├── utils/                # Pure functions
    └── constants/            # Configuration constants
```

## Core Principles

1. **Zero `any` types** - Complete type safety
2. **Result/Option pattern** - No null exceptions
3. **Immutable state** - All updates create new references
4. **Optimistic UI** - Instant feedback with rollback
5. **Transactional operations** - Atomic database updates
6. **LRU caching** - Bounded memory usage
7. **Automatic retry** - Exponential backoff
8. **Rate limiting** - Prevent abuse
9. **Structured logging** - Observable operations
10. **Error boundaries** - Graceful failures

## Best Patterns Combined

### From workspace- (Zustand Store)
- Undo/redo with MAX_UNDO limit
- Autosave with locking mechanism
- Toast notification system
- Optimistic state updates

### From workspace-c3a9a77d (Block System)
- Block-based rendering architecture
- Real-time sync with conflict resolution
- Guesty API pattern (caching + retry)
- Type-safe block definitions

### From puck-main (Monorepo)
- Clean package exports
- Component/Render pattern
- Separation of concerns
- Plugin architecture

## Quality Metrics

- Type Coverage: 100%
- Test Coverage: 90%+
- Bundle Size: <300KB initial
- LCP: <1.2s
- API P99: <150ms
