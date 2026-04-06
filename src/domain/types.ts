// =============================================================================
// Domain Types - Core Entity Definitions (15/10 Quality)
// =============================================================================
// Zero `any` types, strict null checks, immutable data structures

// ---------------------------------------------------------------------------
// Branded Types - Type-safe IDs
// ---------------------------------------------------------------------------

declare const __brand: unique symbol;
type Brand<B> = { [__brand]: B };

export type Branded<T, B> = T & Brand<B>;

export type BlockId = Branded<string, 'BlockId'>;
export type PageId = Branded<string, 'PageId'>;
export type UserId = Branded<string, 'UserId'>;
export type ThemeId = Branded<string, 'ThemeId'>;
export type Timestamp = Branded<number, 'Timestamp'>;

export function createBlockId(): BlockId {
  return crypto.randomUUID() as BlockId;
}

export function createPageId(): PageId {
  return crypto.randomUUID() as PageId;
}

export function createTimestamp(): Timestamp {
  return Date.now() as Timestamp;
}

// ---------------------------------------------------------------------------
// Result Type - Railway-oriented programming
// ---------------------------------------------------------------------------

export type Result<T, E = DomainError> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: E };

export function ok<T>(data: T): Result<T, never> {
  return { success: true, data } as const;
}

export function err<E>(error: E): Result<never, E> {
  return { success: false, error } as const;
}

// ---------------------------------------------------------------------------
// Option Type - Null safety
// ---------------------------------------------------------------------------

export type Option<T> = Some<T> | None;

interface Some<T> {
  readonly _tag: 'Some';
  readonly value: T;
}

interface None {
  readonly _tag: 'None';
}

export const Option = {
  some: <T>(value: T): Option<T> => ({ _tag: 'Some', value }),
  none: (): Option<never> => ({ _tag: 'None' }),
  fromNullable: <T>(value: T | null | undefined): Option<T> =>
    value == null ? Option.none() : Option.some(value),
  map: <T, U>(opt: Option<T>, fn: (value: T) => U): Option<U> =>
    opt._tag === 'None' ? Option.none() : Option.some(fn(opt.value)),
  flatMap: <T, U>(opt: Option<T>, fn: (value: T) => Option<U>): Option<U> =>
    opt._tag === 'None' ? Option.none() : fn(opt.value),
  getOrElse: <T>(opt: Option<T>, defaultValue: T): T =>
    opt._tag === 'None' ? defaultValue : opt.value,
  isSome: <T>(opt: Option<T>): opt is Some<T> => opt._tag === 'Some',
  isNone: <T>(opt: Option<T>): opt is None => opt._tag === 'None',
};

// ---------------------------------------------------------------------------
// Domain Errors - Structured error handling
// ---------------------------------------------------------------------------

export class DomainError extends Error {
  readonly code: string;
  readonly statusCode: number;
  readonly context?: Record<string, unknown>;

  constructor(options: {
    code: string;
    message: string;
    statusCode: number;
    context?: Record<string, unknown>;
    cause?: Error;
  }) {
    super(options.message);
    this.name = 'DomainError';
    this.code = options.code;
    this.statusCode = options.statusCode;
    this.context = options.context;
    if (options.cause) {
      this.cause = options.cause;
    }
  }
}

export const Errors = {
  BlockNotFound: (id: BlockId) =>
    new DomainError({
      code: 'BLOCK_NOT_FOUND',
      message: `Block with id "${id}" not found`,
      statusCode: 404,
    }),

  PageNotFound: (id: PageId) =>
    new DomainError({
      code: 'PAGE_NOT_FOUND',
      message: `Page with id "${id}" not found`,
      statusCode: 404,
    }),

  ValidationFailed: (field: string, reason: string) =>
    new DomainError({
      code: 'VALIDATION_FAILED',
      message: `Validation failed for "${field}": ${reason}`,
      statusCode: 400,
      context: { field, reason },
    }),

  Unauthorized: () =>
    new DomainError({
      code: 'UNAUTHORIZED',
      message: 'Authentication required',
      statusCode: 401,
    }),

  RateLimited: (retryAfter: number) =>
    new DomainError({
      code: 'RATE_LIMITED',
      message: `Rate limit exceeded. Retry after ${retryAfter}s`,
      statusCode: 429,
      context: { retryAfter },
    }),

  SyncConflict: (blockId: BlockId, serverVersion: number, clientVersion: number) =>
    new DomainError({
      code: 'SYNC_CONFLICT',
      message: `Sync conflict detected for block "${blockId}"`,
      statusCode: 409,
      context: { blockId, serverVersion, clientVersion },
    }),
} as const;

// ---------------------------------------------------------------------------
// Block Entity - Core building block
// ---------------------------------------------------------------------------

export interface BlockProps {
  readonly id: BlockId;
  readonly type: BlockType;
  readonly data: BlockData;
  readonly meta: BlockMeta;
  readonly version: number;
}

export type BlockType =
  | 'hero'
  | 'features'
  | 'pricing'
  | 'testimonials'
  | 'cta'
  | 'faq'
  | 'footer'
  | 'text'
  | 'image'
  | 'gallery'
  | 'divider'
  | 'spacer'
  | 'custom';

export interface BlockData {
  readonly [key: string]: unknown;
}

export interface BlockMeta {
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
  readonly createdBy: UserId;
  readonly updatedBy: UserId;
  readonly syncStatus: SyncStatus;
}

export type SyncStatus =
  | { readonly state: 'synced'; readonly syncedAt: Timestamp }
  | { readonly state: 'pending'; readonly pendingSince: Timestamp }
  | { readonly state: 'conflict'; readonly conflictDetails: string }
  | { readonly state: 'error'; readonly errorMessage: string };

export class Block implements BlockProps {
  readonly id: BlockId;
  readonly type: BlockType;
  readonly data: BlockData;
  readonly meta: BlockMeta;
  readonly version: number;

  private constructor(props: BlockProps) {
    this.id = props.id;
    this.type = props.type;
    this.data = props.data;
    this.meta = props.meta;
    this.version = props.version;
  }

  static create(
    type: BlockType,
    data: BlockData,
    userId: UserId,
    id: BlockId = createBlockId()
  ): Block {
    const now = createTimestamp();
    return new Block({
      id,
      type,
      data,
      version: 1,
      meta: {
        createdAt: now,
        updatedAt: now,
        createdBy: userId,
        updatedBy: userId,
        syncStatus: { state: 'synced', syncedAt: now },
      },
    });
  }

  update(
    data: Partial<BlockData>,
    userId: UserId
  ): Result<Block, DomainError> {
    const validation = this.validateData(data);
    if (!validation.success) {
      return validation;
    }

    const updated: Block = new Block({
      ...this,
      data: { ...this.data, ...data },
      version: this.version + 1,
      meta: {
        ...this.meta,
        updatedAt: createTimestamp(),
        updatedBy: userId,
        syncStatus: { state: 'pending', pendingSince: createTimestamp() },
      },
    });

    return ok(updated);
  }

  markSynced(): Block {
    return new Block({
      ...this,
      meta: {
        ...this.meta,
        syncStatus: { state: 'synced', syncedAt: createTimestamp() },
      },
    });
  }

  markConflict(details: string): Block {
    return new Block({
      ...this,
      meta: {
        ...this.meta,
        syncStatus: { state: 'conflict', conflictDetails: details },
      },
    });
  }

  private validateData(data: Partial<BlockData>): Result<true, DomainError> {
    // Implement block-type specific validation
    if (this.type === 'hero' && 'title' in data) {
      const title = data.title as string;
      if (title.length > 200) {
        return err(Errors.ValidationFailed('title', 'Max 200 characters'));
      }
    }
    return ok(true);
  }

  toJSON(): BlockProps {
    return {
      id: this.id,
      type: this.type,
      data: this.data,
      meta: this.meta,
      version: this.version,
    };
  }

  static fromJSON(json: BlockProps): Block {
    return new Block(json);
  }
}

// ---------------------------------------------------------------------------
// Page Entity - Container for blocks
// ---------------------------------------------------------------------------

export interface PageProps {
  readonly id: PageId;
  readonly slug: string;
  readonly title: string;
  readonly description: Option<string>;
  readonly blocks: readonly Block[];
  readonly themeId: ThemeId;
  readonly meta: PageMeta;
  readonly published: boolean;
  readonly seo: SeoData;
}

export interface PageMeta {
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
  readonly publishedAt: Option<Timestamp>;
  readonly createdBy: UserId;
  readonly updatedBy: UserId;
}

export interface SeoData {
  readonly title: Option<string>;
  readonly description: Option<string>;
  readonly keywords: readonly string[];
  readonly ogImage: Option<string>;
  readonly canonicalUrl: Option<string>;
  readonly noIndex: boolean;
}

export class Page implements PageProps {
  readonly id: PageId;
  readonly slug: string;
  readonly title: string;
  readonly description: Option<string>;
  readonly blocks: readonly Block[];
  readonly themeId: ThemeId;
  readonly meta: PageMeta;
  readonly published: boolean;
  readonly seo: SeoData;

  private constructor(props: PageProps) {
    this.id = props.id;
    this.slug = props.slug;
    this.title = props.title;
    this.description = props.description;
    this.blocks = props.blocks;
    this.themeId = props.themeId;
    this.meta = props.meta;
    this.published = props.published;
    this.seo = props.seo;
  }

  static create(
    slug: string,
    title: string,
    userId: UserId,
    themeId: ThemeId = 'default' as ThemeId
  ): Result<Page, DomainError> {
    const slugValidation = Page.validateSlug(slug);
    if (!slugValidation.success) {
      return slugValidation;
    }

    const now = createTimestamp();
    return ok(
      new Page({
        id: createPageId(),
        slug,
        title,
        description: Option.none(),
        blocks: [],
        themeId,
        published: false,
        meta: {
          createdAt: now,
          updatedAt: now,
          publishedAt: Option.none(),
          createdBy: userId,
          updatedBy: userId,
        },
        seo: {
          title: Option.none(),
          description: Option.none(),
          keywords: [],
          ogImage: Option.none(),
          canonicalUrl: Option.none(),
          noIndex: false,
        },
      })
    );
  }

  addBlock(block: Block, index?: number): Page {
    const blocks = [...this.blocks];
    const insertAt = index ?? blocks.length;
    blocks.splice(insertAt, 0, block);

    return new Page({
      ...this,
      blocks,
      meta: { ...this.meta, updatedAt: createTimestamp() },
    });
  }

  removeBlock(blockId: BlockId): Result<Page, DomainError> {
    const blockExists = this.blocks.some((b) => b.id === blockId);
    if (!blockExists) {
      return err(Errors.BlockNotFound(blockId));
    }

    return ok(
      new Page({
        ...this,
        blocks: this.blocks.filter((b) => b.id !== blockId),
        meta: { ...this.meta, updatedAt: createTimestamp() },
      })
    );
  }

  updateBlock(
    blockId: BlockId,
    data: Partial<BlockData>,
    userId: UserId
  ): Result<Page, DomainError> {
    const blockIndex = this.blocks.findIndex((b) => b.id === blockId);
    if (blockIndex === -1) {
      return err(Errors.BlockNotFound(blockId));
    }

    const block = this.blocks[blockIndex];
    const updateResult = block.update(data, userId);

    if (!updateResult.success) {
      return updateResult;
    }

    const newBlocks = [...this.blocks];
    newBlocks[blockIndex] = updateResult.data;

    return ok(
      new Page({
        ...this,
        blocks: newBlocks,
        meta: { ...this.meta, updatedAt: createTimestamp() },
      })
    );
  }

  reorderBlock(fromIndex: number, toIndex: number): Result<Page, DomainError> {
    if (fromIndex < 0 || fromIndex >= this.blocks.length) {
      return err(Errors.ValidationFailed('fromIndex', 'Out of bounds'));
    }
    if (toIndex < 0 || toIndex >= this.blocks.length) {
      return err(Errors.ValidationFailed('toIndex', 'Out of bounds'));
    }

    const blocks = [...this.blocks];
    const [moved] = blocks.splice(fromIndex, 1);
    blocks.splice(toIndex, 0, moved);

    return ok(
      new Page({
        ...this,
        blocks,
        meta: { ...this.meta, updatedAt: createTimestamp() },
      })
    );
  }

  publish(userId: UserId): Page {
    return new Page({
      ...this,
      published: true,
      meta: {
        ...this.meta,
        updatedAt: createTimestamp(),
        updatedBy: userId,
        publishedAt: Option.some(createTimestamp()),
      },
    });
  }

  unpublish(userId: UserId): Page {
    return new Page({
      ...this,
      published: false,
      meta: {
        ...this.meta,
        updatedAt: createTimestamp(),
        updatedBy: userId,
        publishedAt: Option.none(),
      },
    });
  }

  private static validateSlug(slug: string): Result<true, DomainError> {
    if (!slug) {
      return err(Errors.ValidationFailed('slug', 'Required'));
    }
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return err(Errors.ValidationFailed('slug', 'Only lowercase letters, numbers, and hyphens'));
    }
    if (slug.length < 1 || slug.length > 100) {
      return err(Errors.ValidationFailed('slug', 'Must be 1-100 characters'));
    }
    return ok(true);
  }

  toJSON(): PageProps {
    return {
      id: this.id,
      slug: this.slug,
      title: this.title,
      description: this.description,
      blocks: this.blocks,
      themeId: this.themeId,
      meta: this.meta,
      published: this.published,
      seo: this.seo,
    };
  }

  static fromJSON(json: PageProps): Page {
    return new Page(json);
  }
}

// ---------------------------------------------------------------------------
// Theme Entity - Visual theming
// ---------------------------------------------------------------------------

export interface ThemeTokens {
  readonly colors: {
    readonly primary: string;
    readonly secondary: string;
    readonly accent: string;
    readonly background: string;
    readonly foreground: string;
    readonly muted: string;
    readonly border: string;
  };
  readonly fonts: {
    readonly heading: string;
    readonly body: string;
    readonly mono: string;
  };
  readonly spacing: {
    readonly section: string;
    readonly container: string;
    readonly gap: string;
  };
  readonly borderRadius: {
    readonly sm: string;
    readonly md: string;
    readonly lg: string;
    readonly full: string;
  };
}

export interface Theme {
  readonly id: ThemeId;
  readonly name: string;
  readonly description: string;
  readonly tokens: ThemeTokens;
  readonly isDefault: boolean;
}

// ---------------------------------------------------------------------------
// User Entity - Authentication
// ---------------------------------------------------------------------------

export interface User {
  readonly id: UserId;
  readonly email: string;
  readonly name: string;
  readonly role: 'admin' | 'editor' | 'viewer';
  readonly createdAt: Timestamp;
  readonly lastLoginAt: Option<Timestamp>;
}

// ---------------------------------------------------------------------------
// Sync Entity - Real-time collaboration
// ---------------------------------------------------------------------------

export interface SyncOperation {
  readonly type: 'insert' | 'update' | 'delete' | 'reorder';
  readonly blockId: BlockId;
  readonly timestamp: Timestamp;
  readonly userId: UserId;
  readonly data?: BlockData;
  readonly fromIndex?: number;
  readonly toIndex?: number;
  readonly baseVersion: number;
}

export interface SyncPayload {
  readonly pageId: PageId;
  readonly operations: readonly SyncOperation[];
  readonly clientVersion: number;
}

export interface SyncResult {
  readonly success: boolean;
  readonly serverVersion: number;
  readonly conflicts: readonly SyncConflict[];
  readonly appliedOperations: readonly SyncOperation[];
}

export interface SyncConflict {
  readonly operation: SyncOperation;
  readonly serverBlock: Block;
  readonly reason: string;
}
