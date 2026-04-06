# Lib Directory - Core Utilities and Infrastructure

## Overview

The `src/lib/` directory contains the core utility functions, API clients, type definitions, and integration code that power the Christiano Property Management platform.

## Directory Structure

```
lib/
├── api.ts           # Unified API layer with caching, rate limiting, circuit breakers
├── api-index.ts     # API exports and aggregations
├── constants.ts     # Application constants
├── db.ts           # Database utilities
├── images.ts       # Image asset constants and utilities
├── index.ts        # Main exports
├── puck-integration.tsx  # Puck editor integration hooks and components
├── puck-plugins.tsx      # Puck plugin system
├── query-client.ts      # React Query client configuration
├── types.ts        # Canonical Puck types
├── utils.ts        # Common utility functions
├── adapters/      # External service adapters
├── data/           # Data transformation utilities
├── dnd/           # Drag-and-drop helpers
├── fields/        # Field configuration utilities
├── hooks/         # Custom React hooks
└── utils/         # Additional utilities
```

## Key Exports

### API Layer (api.ts)

The unified API layer provides enterprise-grade HTTP client functionality:

#### Core Classes

| Class | Purpose |
|-------|---------|
| MemoryCache | In-memory cache with LRU eviction |
| CircuitBreaker | Prevents cascading failures |
| RateLimiter | API rate limiting |

#### Pre-configured Clients

```typescript
import { internalApiClient, aiApiClient, externalApiClient } from '@/lib';

// Internal API calls
const result = await internalApiClient.get('/properties');

// AI API with longer timeout
const aiResult = await aiApiClient.post('/ai/generate', { prompt: '...' });

// External APIs (e.g., Guesty)
const guestyResult = await externalApiClient.get('/reservations');
```

#### Pagination Helpers

```typescript
import { 
  normalizePagination, 
  createPaginatedResponse,
  paginationHeaders 
} from '@/lib';

// Normalize with defaults
const { page, limit } = normalizePagination({ page: 2, limit: 10 });

// Create paginated response
const response = createPaginatedResponse(items, total, page, limit);

// Extract from URL params
const params = parsePaginationParams(new URLSearchParams(window.location.search));
```

### Types (types.ts)

Canonical Puck type definitions for type-safe component development:

```typescript
import type { 
  Field, 
  Fields, 
  ComponentConfig, 
  Data, 
  Config,
  Permissions
} from '@/lib/types';
```

#### Field Types

| Type | Description |
|------|-------------|
| TextField | Single-line text input |
| TextareaField | Multi-line text |
| SelectField | Dropdown selection |
| NumberField | Numeric input |
| CheckboxField | Boolean toggle |
| ArrayField | Repeatable fields |
| CustomField | Custom renderer |
| GroupField | Nested field groups |

### Puck Integration (puck-integration.tsx)

```typescript
import { 
  EnhancedPuck, 
  DropZone, 
  usePuck,
  withResolveData 
} from '@/lib/puck-integration';
```

#### usePuck Hook

Access Puck context from anywhere in your app:

```typescript
function MyComponent() {
  const { data, dispatch, selectedItem, history } = usePuck();
  
  return <div>Selected: {selectedItem?.type}</div>;
}
```

#### EnhancedPuck Component

Full-featured Puck editor wrapper:

```typescript
<EnhancedPuck
  config={config}
  data={data}
  onChange={setData}
  onPublish={handlePublish}
  aiEnabled={true}
  resolveData={{ HeroSection: myResolver }}
/>
```

#### Action Interceptors

```typescript
const interceptors = [
  analyticsInterceptor,
  auditLogInterceptor,
  (action, state) => {
    // Custom logic
  }
];

<EnhancedPuck
  config={config}
  data={data}
  actionInterceptors={interceptors}
/>
```

## Utilities

### Utils (utils.ts)

```typescript
import { cn, formatDate, generateId } from '@/lib/utils';

// Class name merging (clsx + tailwind-merge)
const classes = cn('base-class', condition && 'conditional-class');

// Generate unique IDs
const id = generateId();

// Date formatting
const formatted = formatDate(new Date(), 'en-US');
```

### Constants (constants.ts)

Application-wide constants for configuration:

```typescript
import { 
  API_CONFIG,
  CACHE_CONFIG,
  PAGINATION_DEFAULTS 
} from '@/lib/constants';
```

## Usage Examples

### Creating a Custom API Client

```typescript
import { UnifiedApiClient } from '@/lib/api';

const myClient = new UnifiedApiClient({
  baseUrl: 'https://api.example.com',
  timeoutMs: 10000,
  maxRetries: 3,
  cacheEnabled: true,
});

// Make requests with automatic caching
const cached = await myClient.get('/data'); // Cached
const fresh = await myClient.get('/data', { noCache: true }); // Bypass cache
```

### Block Configuration

```typescript
import type { ComponentConfig } from '@/lib/types';

const MyBlock: ComponentConfig<Props, Fields> = {
  render: ({ title, content }) => (
    <div>
      <h1>{title}</h1>
      <p>{content}</p>
    </div>
  ),
  defaultProps: {
    title: 'Default Title',
    content: 'Default content',
  },
  fields: {
    title: { type: 'text' },
    content: { type: 'textarea' },
  },
};
```

### Using the Store

```typescript
import { useEditorStore } from '@/store';

function Toolbar() {
  const { viewMode, setViewMode, undo, canUndo } = useEditorStore();
  
  return (
    <div>
      <button onClick={() => setViewMode('preview')}>Preview</button>
      <button onClick={undo} disabled={!canUndo()}>Undo</button>
    </div>
  );
}
```

## API Reference

### UnifiedApiClient

```typescript
class UnifiedApiClient {
  // HTTP methods
  get<T>(path, options?): Promise<Result<ApiResponse<T>, DomainError>>
  post<T>(path, body, options?): Promise<Result<ApiResponse<T>, DomainError>>
  put<T>(path, body, options?): Promise<Result<ApiResponse<T>, DomainError>>
  patch<T>(path, body, options?): Promise<Result<ApiResponse<T>, DomainError>>
  delete<T>(path, options?): Promise<Result<ApiResponse<T>, DomainError>>
  
  // Cache management
  invalidateCache(pattern?: string | RegExp): number
  getCacheStats(): CacheStats
  
  // Circuit breaker
  getCircuitBreakerState(): CircuitBreakerState
}
```

### MemoryCache

```typescript
class MemoryCache {
  get<T>(key: string): T | null
  set<T>(key: string, data: T, ttlMs?: number): void
  delete(key: string): boolean
  has(key: string): boolean
  invalidate(pattern?: string | RegExp): number
  getStats(): CacheStats
  clear(): void
}
```

## Contributing

When adding new utilities to this directory:

1. Add TypeScript types with JSDoc comments
2. Export from the appropriate index file
3. Add usage examples to this README
4. Include performance notes if applicable
