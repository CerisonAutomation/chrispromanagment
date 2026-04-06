# Domain Types - Core Entity Definitions

## Overview

The domain module provides type-safe, immutable entity definitions with zero `any` types. It implements Railway-oriented programming (Result types) and strict null safety (Option types).

## Key Features

- **Branded Types**: Type-safe IDs for Block, Page, User, Theme
- **Result Type**: Railway-oriented error handling
- **Option Type**: Null-safe value handling
- **Domain Errors**: Structured error creation
- **Immutable Entities**: Block, Page, Theme, User classes

## Branded Types

Prevent mixing up different ID types:

```typescript
import { 
  BlockId, 
  PageId, 
  UserId, 
  createBlockId,
  createPageId 
} from '@/domain/types';

// Create IDs
const blockId = createBlockId(); // BlockId
const pageId = createPageId();    // PageId

// Type-safe assignment
function getBlock(id: BlockId): Block { ... }
getBlock(blockId);   // OK
getBlock(pageId);    // Error: Type 'PageId' is not assignable to 'BlockId'
```

## Result Type

Railway-oriented programming for explicit error handling:

```typescript
import { Result, ok, err, DomainError } from '@/domain/types';

type UserResult = Result<User, DomainError>;

function findUser(id: string): UserResult {
  const user = database.find(id);
  if (!user) {
    return err(new DomainError({
      code: 'USER_NOT_FOUND',
      message: `User ${id} not found`,
      statusCode: 404,
    }));
  }
  return ok(user);
}

// Usage with pattern matching
const result = findUser('123');
if (result.success) {
  console.log(result.data.name);
} else {
  console.error(result.error.code);
}
```

### Result Helpers

```typescript
import { isOk, isErr } from '@/domain/types';

const result = someOperation();

if (isOk(result)) {
  // result is Ok<T>
  console.log(result.data);
}

if (isErr(result)) {
  // result is Err<E>
  console.error(result.error.message);
}
```

## Option Type

Null-safe handling without null checks:

```typescript
import { Option, Some, None } from '@/domain/types';

// Create options
const present = Option.some('value');    // Option<string>
const absent = Option.none();            // Option<never>

// Convert nullable
const name: string | null = getName();
const option = Option.fromNullable(name); // Option<string>

// Map & Chain
const upper = Option.map(option, s => s.toUpperCase());
const nested = Option.flatMap(option, s => getRelated(s));

// Get with default
const value = Option.getOrElse(option, 'default');

// Type guards
if (Option.isSome(option)) {
  console.log(option.value);  // TypeScript knows it's present
}
```

## Domain Errors

Pre-defined error factory functions:

```typescript
import { Errors } from '@/domain/types';

// Common errors
const notFound = Errors.BlockNotFound(blockId);
const validation = Errors.ValidationFailed('email', 'Invalid format');
const unauthorized = Errors.Unauthorized();
const rateLimited = Errors.RateLimited(60);
const conflict = Errors.SyncConflict(blockId, serverVersion, clientVersion);

// Access properties
console.log(notFound.code);     // 'BLOCK_NOT_FOUND'
console.log(notFound.statusCode); // 404
console.log(notFound.message);   // 'Block with id "xxx" not found'
```

## Block Entity

Immutable block representation:

```typescript
import { Block, BlockType, BlockId, UserId, createBlockId } from '@/domain/types';

// Create a block
const block = Block.create(
  'hero',                           // type
  { title: 'Welcome', subtitle: '...' },
  userId                            // createdBy
);

// Update with validation
const updateResult = block.update(
  { title: 'New Title' },
  userId
);

if (updateResult.success) {
  const updated = updateResult.data;
  console.log(updated.version);  // Incremented
}

// Mark sync status
const synced = block.markSynced();
const conflicted = block.markConflict('Server has newer version');

// Serialize/Deserialize
const json = block.toJSON();
const restored = Block.fromJSON(json);
```

## Page Entity

Page container for blocks:

```typescript
import { Page, PageId, UserId } from '@/domain/types';

// Create page
const createResult = Page.create('/about', 'About Us', userId);
if (!createResult.success) {
  console.error(createResult.error.message);
  return;
}

let page = createResult.data;

// Add block
page = page.addBlock(block, 0);  // At index 0
page = page.addBlock(block2);    // At end

// Update block
const updateResult = page.updateBlock(blockId, { title: 'Updated' }, userId);
if (updateResult.success) {
  page = updateResult.data;
}

// Remove block
const removeResult = page.removeBlock(blockId);

// Reorder blocks
const reorderResult = page.reorderBlock(0, 2);

// Publish/Unpublish
page = page.publish(userId);
page = page.unpublish(userId);

// Serialize
const json = page.toJSON();
const restored = Page.fromJSON(json);
```

## Theme Entity

Visual theming configuration:

```typescript
import { Theme, ThemeTokens } from '@/domain/types';

const theme: Theme = {
  id: 'luxury-dark' as ThemeId,
  name: 'Luxury Dark',
  description: 'Premium dark theme for luxury properties',
  isDefault: false,
  tokens: {
    colors: {
      primary: '#d4a574',    // Gold accent
      secondary: '#1a1a1a',
      accent: '#d4a574',
      background: '#0a0a0a',
      foreground: '#fafafa',
      muted: '#27272a',
      border: '#3f3f46',
    },
    fonts: {
      heading: 'Inter, system-ui, sans-serif',
      body: 'Inter, system-ui, sans-serif',
      mono: 'JetBrains Mono, monospace',
    },
    spacing: {
      section: '4rem',
      container: '1200px',
      gap: '1.5rem',
    },
    borderRadius: {
      sm: '0.25rem',
      md: '0.5rem',
      lg: '0.75rem',
      full: '9999px',
    },
  },
};
```

## Sync Entities

Real-time collaboration types:

```typescript
import { SyncOperation, SyncPayload, SyncResult } from '@/domain/types';

// Sync operation types
type OpType = 'insert' | 'update' | 'delete' | 'reorder';

// Create sync operation
const operation: SyncOperation = {
  type: 'update',
  blockId: blockId,
  timestamp: Date.now() as Timestamp,
  userId: userId,
  data: { title: 'New' },
  baseVersion: 5,
};

// Sync payload
const payload: SyncPayload = {
  pageId: pageId,
  operations: [operation],
  clientVersion: 10,
};

// Handle sync result
if (result.success) {
  console.log(`Server version: ${result.serverVersion}`);
  console.log(`Conflicts: ${result.conflicts.length}`);
}
```

## User Entity

```typescript
import { User, UserId } from '@/domain/types';

const user: User = {
  id: userId,
  email: 'admin@example.com',
  name: 'Admin User',
  role: 'admin',
  createdAt: timestamp,
  lastLoginAt: Option.some(lastLogin),
};

// Role-based access
if (user.role === 'admin') {
  // Full access
} else if (user.role === 'editor') {
  // Limited access
}
```
