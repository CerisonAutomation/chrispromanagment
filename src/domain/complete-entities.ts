// =============================================================================
// COMPLETE DOMAIN ENTITIES - 15/10 PRODUCTION QUALITY (CONTINUED)
// =============================================================================

// Import types from the first part
import type {
  BlockId,
  DomainError,
  Option,
  PageId,
  Result,
  Slug,
  SyncStatus,
  ThemeId,
  Timestamp,
  URLString,
  UserId
} from './complete-types';
import {
  createBlockId,
  createPageId,
  createTimestamp,
  err,
  Errors,
  isErr,
  ok,
  Option,
  parseSlug
} from './complete-types';

// ---------------------------------------------------------------------------
// SECTION 7: THEME ENTITY - Complete theme system (from workspace- pattern)
// ---------------------------------------------------------------------------

export interface ColorTokens {
  readonly primary: string;
  readonly secondary: string;
  readonly accent: string;
  readonly background: string;
  readonly foreground: string;
  readonly muted: string;
  readonly border: string;
  readonly card: string;
  readonly error: string;
  readonly success: string;
  readonly warning: string;
}

export interface FontTokens {
  readonly heading: string;
  readonly body: string;
  readonly mono: string;
}

export interface SpacingTokens {
  readonly section: string;
  readonly container: string;
  readonly gap: string;
  readonly xs: string;
  readonly sm: string;
  readonly md: string;
  readonly lg: string;
  readonly xl: string;
}

export interface BorderRadiusTokens {
  readonly none: string;
  readonly sm: string;
  readonly md: string;
  readonly lg: string;
  readonly xl: string;
  readonly full: string;
}

export interface ShadowTokens {
  readonly sm: string;
  readonly md: string;
  readonly lg: string;
  readonly xl: string;
}

export interface AnimationTokens {
  readonly fast: string;
  readonly normal: string;
  readonly slow: string;
}

export interface ThemeTokens {
  readonly colors: ColorTokens;
  readonly fonts: FontTokens;
  readonly spacing: SpacingTokens;
  readonly borderRadius: BorderRadiusTokens;
  readonly shadows: ShadowTokens;
  readonly animations: AnimationTokens;
}

export interface Theme {
  readonly id: ThemeId;
  readonly name: string;
  readonly description: string;
  readonly tokens: ThemeTokens;
  readonly isDefault: boolean;
  readonly previewImage: Option<URLString>;
}

export class ThemeRegistry {
  private readonly themes: Map<ThemeId, Theme> = new Map();

  register(theme: Theme): void {
    this.themes.set(theme.id, theme);
  }

  get(id: ThemeId): Option<Theme> {
    const theme = this.themes.get(id);
    return theme ? Option.some(theme) : Option.none();
  }

  getDefault(): Theme {
    for (const theme of this.themes.values()) {
      if (theme.isDefault) {
        return theme;
      }
    }
    const first = this.themes.values().next().value;
    if (!first) {
      throw new Error('No themes registered');
    }
    return first;
  }

  getAll(): Theme[] {
    return Array.from(this.themes.values());
  }

  toJSON(): Record<string, unknown>[] {
    return this.getAll().map(t => ({
      id: t.id,
      name: t.name,
      description: t.description,
      isDefault: t.isDefault,
    }));
  }
}

// Pre-defined luxury themes (extracted from workspace-)
export const defaultThemes = {
  maltaGold: {
    id: 'malta-gold' as ThemeId,
    name: 'Malta Gold',
    description: 'Luxurious gold and dark theme inspired by Maltese architecture',
    isDefault: true,
    previewImage: Option.none<URLString>(),
    tokens: {
      colors: {
        primary: '#c8a96a',
        secondary: '#a08040',
        accent: '#c8a96a',
        background: '#0e0f11',
        foreground: '#e8e4dc',
        muted: '#1a1b1f',
        border: '#2a2b30',
        card: '#16171b',
        error: '#ef4444',
        success: '#22c55e',
        warning: '#f59e0b',
      },
      fonts: {
        heading: "Inter, system-ui, -apple-system, 'Segoe UI', sans-serif",
        body: "Inter, system-ui, -apple-system, 'Segoe UI', sans-serif",
        mono: "JetBrains Mono, 'Fira Code', monospace",
      },
      spacing: {
        section: '6rem',
        container: '80rem',
        gap: '1.5rem',
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '2rem',
        xl: '4rem',
      },
      borderRadius: {
        none: '0',
        sm: '0.25rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        full: '9999px',
      },
      shadows: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
      },
      animations: {
        fast: '150ms',
        normal: '300ms',
        slow: '500ms',
      },
    },
  } as Theme,

  ivoryMarble: {
    id: 'ivory-marble' as ThemeId,
    name: 'Ivory Marble',
    description: 'Elegant light theme with warm ivory tones',
    isDefault: false,
    previewImage: Option.none<URLString>(),
    tokens: {
      colors: {
        primary: '#9b7240',
        secondary: '#7a5a30',
        accent: '#9b7240',
        background: '#faf6f0',
        foreground: '#2a2318',
        muted: '#f0ebe3',
        border: '#e0d8cc',
        card: '#ffffff',
        error: '#dc2626',
        success: '#16a34a',
        warning: '#d97706',
      },
      fonts: {
        heading: "Georgia, 'Times New Roman', serif",
        body: "Georgia, 'Times New Roman', serif",
        mono: "JetBrains Mono, monospace",
      },
      spacing: {
        section: '6rem',
        container: '76rem',
        gap: '1.5rem',
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '2rem',
        xl: '4rem',
      },
      borderRadius: {
        none: '0',
        sm: '0.25rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        full: '9999px',
      },
      shadows: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
      },
      animations: {
        fast: '150ms',
        normal: '300ms',
        slow: '500ms',
      },
    },
  } as Theme,
} as const;

// ---------------------------------------------------------------------------
// SECTION 8: BLOCK ENTITY - Core building block (from workspace-c3a9a77d pattern)
// ---------------------------------------------------------------------------

export type BlockType =
  | 'hero'
  | 'about'
  | 'services'
  | 'features'
  | 'pricing'
  | 'testimonials'
  | 'cta'
  | 'faq'
  | 'contact'
  | 'footer'
  | 'text'
  | 'image'
  | 'gallery'
  | 'video'
  | 'map'
  | 'divider'
  | 'spacer'
  | 'stats'
  | 'team'
  | 'timeline'
  | 'logo-bar'
  | 'newsletter'
  | 'comparison'
  | 'property-search'
  | 'property-grid'
  | 'property-detail'
  | 'booking-widget'
  | 'booking-confirmation'
  | 'custom';

export interface BlockMeta {
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
  readonly createdBy: UserId;
  readonly updatedBy: UserId;
  readonly syncStatus: SyncStatus;
}

export interface BlockData {
  readonly [key: string]: unknown;
}

export class Block {
  private constructor(
    private readonly _id: BlockId,
    private readonly _type: BlockType,
    private readonly _data: BlockData,
    private readonly _meta: BlockMeta,
    private readonly _version: number,
    private readonly _position: number
  ) {}

  static create(
    type: BlockType,
    data: BlockData,
    userId: UserId,
    position: number = 0,
    id: BlockId = createBlockId()
  ): Block {
    const now = createTimestamp();
    return new Block(
      id,
      type,
      data,
      {
        createdAt: now,
        updatedAt: now,
        createdBy: userId,
        updatedBy: userId,
        syncStatus: { state: 'synced', syncedAt: now },
      },
      1,
      position
    );
  }

  get id(): BlockId {
    return this._id;
  }

  get type(): BlockType {
    return this._type;
  }

  get data(): BlockData {
    return { ...this._data };
  }

  get meta(): BlockMeta {
    return this._meta;
  }

  get version(): number {
    return this._version;
  }

  get position(): number {
    return this._position;
  }

  get isSynced(): boolean {
    return this._meta.syncStatus.state === 'synced';
  }

  update(
    data: Partial<BlockData>,
    userId: UserId
  ): Result<Block, DomainError> {
    const now = createTimestamp();
    return ok(
      new Block(
        this._id,
        this._type,
        { ...this._data, ...data },
        {
          ...this._meta,
          updatedAt: now,
          updatedBy: userId,
          syncStatus: { state: 'pending', pendingSince: now, attempts: 0 },
        },
        this._version + 1,
        this._position
      )
    );
  }

  move(newPosition: number): Block {
    return new Block(
      this._id,
      this._type,
      this._data,
      this._meta,
      this._version,
      newPosition
    );
  }

  markSynced(): Block {
    const now = createTimestamp();
    return new Block(
      this._id,
      this._type,
      this._data,
      {
        ...this._meta,
        syncStatus: { state: 'synced', syncedAt: now },
      },
      this._version,
      this._position
    );
  }

  markConflict(serverVersion: number, details: string): Block {
    return new Block(
      this._id,
      this._type,
      this._data,
      {
        ...this._meta,
        syncStatus: {
          state: 'conflict',
          conflictDetails: details,
          serverVersion,
        },
      },
      this._version,
      this._position
    );
  }

  duplicate(userId: UserId, newPosition: number): Block {
    return Block.create(
      this._type,
      JSON.parse(JSON.stringify(this._data)),
      userId,
      newPosition
    );
  }

  validate(): Result<true, DomainError> {
    // Block-specific validation
    switch (this._type) {
      case 'hero': {
        const title = this._data.title as string | undefined;
        if (title && title.length > 200) {
          return err(Errors.ValidationFailed('title', 'Title must be under 200 characters'));
        }
        break;
      }
      case 'text': {
        const content = this._data.content as string | undefined;
        if (content && content.length > 50000) {
          return err(Errors.ValidationFailed('content', 'Content must be under 50000 characters'));
        }
        break;
      }
    }
    return ok(true);
  }

  equals(other: Block): boolean {
    return this._id === other._id;
  }

  toJSON(): {
    id: BlockId;
    type: BlockType;
    data: BlockData;
    meta: BlockMeta;
    version: number;
    position: number;
  } {
    return {
      id: this._id,
      type: this._type,
      data: this._data,
      meta: this._meta,
      version: this._version,
      position: this._position,
    };
  }

  static fromJSON(json: {
    id: BlockId;
    type: BlockType;
    data: BlockData;
    meta: BlockMeta;
    version: number;
    position: number;
  }): Block {
    return new Block(
      json.id,
      json.type,
      json.data,
      json.meta,
      json.version,
      json.position
    );
  }
}

// ---------------------------------------------------------------------------
// SECTION 9: PAGE ENTITY - Container for blocks
// ---------------------------------------------------------------------------

export type PageStatus = 'draft' | 'published' | 'archived';

export interface SeoData {
  readonly title: Option<string>;
  readonly description: Option<string>;
  readonly keywords: readonly string[];
  readonly ogImage: Option<URLString>;
  readonly canonicalUrl: Option<URLString>;
  readonly noIndex: boolean;
  readonly structuredData: Option<Record<string, unknown>>;
}

export interface PageMeta {
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
  readonly publishedAt: Option<Timestamp>;
  readonly createdBy: UserId;
  readonly updatedBy: UserId;
}

export class Page {
  private constructor(
    private readonly _id: PageId,
    private readonly _slug: Slug,
    private readonly _title: string,
    private readonly _description: Option<string>,
    private readonly _blocks: readonly Block[],
    private readonly _themeId: ThemeId,
    private readonly _status: PageStatus,
    private readonly _meta: PageMeta,
    private readonly _seo: SeoData,
    private readonly _version: number
  ) {}

  static create(
    slug: string,
    title: string,
    userId: UserId,
    themeId: ThemeId = 'malta-gold' as ThemeId
  ): Result<Page, DomainError> {
    const slugResult = parseSlug(slug);
    if (isErr(slugResult)) {
      return slugResult;
    }

    const now = createTimestamp();
    return ok(
      new Page(
        createPageId(),
        slugResult.value,
        title,
        Option.none(),
        [],
        themeId,
        'draft',
        {
          createdAt: now,
          updatedAt: now,
          publishedAt: Option.none(),
          createdBy: userId,
          updatedBy: userId,
        },
        {
          title: Option.none(),
          description: Option.none(),
          keywords: [],
          ogImage: Option.none(),
          canonicalUrl: Option.none(),
          noIndex: false,
          structuredData: Option.none(),
        },
        1
      )
    );
  }

  get id(): PageId {
    return this._id;
  }

  get slug(): Slug {
    return this._slug;
  }

  get title(): string {
    return this._title;
  }

  get description(): Option<string> {
    return this._description;
  }

  get blocks(): readonly Block[] {
    return this._blocks;
  }

  get themeId(): ThemeId {
    return this._themeId;
  }

  get status(): PageStatus {
    return this._status;
  }

  get meta(): PageMeta {
    return this._meta;
  }

  get seo(): SeoData {
    return this._seo;
  }

  get version(): number {
    return this._version;
  }

  get isPublished(): boolean {
    return this._status === 'published';
  }

  get isDraft(): boolean {
    return this._status === 'draft';
  }

  get hasUnsyncedBlocks(): boolean {
    return this._blocks.some(b => !b.isSynced);
  }

  addBlock(block: Block, position?: number): Page {
    const insertAt = position ?? this._blocks.length;
    const newBlocks = [...this._blocks];
    newBlocks.splice(insertAt, 0, block);
    
    // Reassign positions
    const repositioned = newBlocks.map((b, idx) => b.move(idx));
    
    return new Page(
      this._id,
      this._slug,
      this._title,
      this._description,
      repositioned,
      this._themeId,
      this._status,
      { ...this._meta, updatedAt: createTimestamp() },
      this._seo,
      this._version + 1
    );
  }

  removeBlock(blockId: BlockId): Result<Page, DomainError> {
    const blockExists = this._blocks.some(b => b.id === blockId);
    if (!blockExists) {
      return err(Errors.BlockNotFound(blockId));
    }

    const filtered = this._blocks.filter(b => b.id !== blockId);
    const repositioned = filtered.map((b, idx) => b.move(idx));

    return ok(
      new Page(
        this._id,
        this._slug,
        this._title,
        this._description,
        repositioned,
        this._themeId,
        this._status,
        { ...this._meta, updatedAt: createTimestamp() },
        this._seo,
        this._version + 1
      )
    );
  }

  updateBlock(blockId: BlockId, data: Partial<BlockData>, userId: UserId): Result<Page, DomainError> {
    const blockIndex = this._blocks.findIndex(b => b.id === blockId);
    if (blockIndex === -1) {
      return err(Errors.BlockNotFound(blockId));
    }

    const block = this._blocks[blockIndex];
    const updatedResult = block.update(data, userId);

    if (isErr(updatedResult)) {
      return updatedResult;
    }

    const newBlocks = [...this._blocks];
    newBlocks[blockIndex] = updatedResult.value;

    return ok(
      new Page(
        this._id,
        this._slug,
        this._title,
        this._description,
        newBlocks,
        this._themeId,
        this._status,
        { ...this._meta, updatedAt: createTimestamp(), updatedBy: userId },
        this._seo,
        this._version + 1
      )
    );
  }

  moveBlock(blockId: BlockId, newPosition: number): Result<Page, DomainError> {
    const currentIndex = this._blocks.findIndex(b => b.id === blockId);
    if (currentIndex === -1) {
      return err(Errors.BlockNotFound(blockId));
    }

    if (newPosition < 0 || newPosition >= this._blocks.length) {
      return err(Errors.ValidationFailed('position', 'Position out of bounds'));
    }

    const newBlocks = [...this._blocks];
    const [moved] = newBlocks.splice(currentIndex, 1);
    newBlocks.splice(newPosition, 0, moved);

    const repositioned = newBlocks.map((b, idx) => b.move(idx));

    return ok(
      new Page(
        this._id,
        this._slug,
        this._title,
        this._description,
        repositioned,
        this._themeId,
        this._status,
        { ...this._meta, updatedAt: createTimestamp() },
        this._seo,
        this._version + 1
      )
    );
  }

  duplicateBlock(blockId: BlockId, userId: UserId): Result<Page, DomainError> {
    const blockIndex = this._blocks.findIndex(b => b.id === blockId);
    if (blockIndex === -1) {
      return err(Errors.BlockNotFound(blockId));
    }

    const original = this._blocks[blockIndex];
    const clone = original.duplicate(userId, blockIndex + 1);

    return ok(this.addBlock(clone, blockIndex + 1));
  }

  updateSEO(seo: Partial<SeoData>, userId: UserId): Page {
    return new Page(
      this._id,
      this._slug,
      this._title,
      this._description,
      this._blocks,
      this._themeId,
      this._status,
      { ...this._meta, updatedAt: createTimestamp(), updatedBy: userId },
      { ...this._seo, ...seo },
      this._version + 1
    );
  }

  changeTheme(themeId: ThemeId, userId: UserId): Page {
    return new Page(
      this._id,
      this._slug,
      this._title,
      this._description,
      this._blocks,
      themeId,
      this._status,
      { ...this._meta, updatedAt: createTimestamp(), updatedBy: userId },
      this._seo,
      this._version + 1
    );
  }

  publish(userId: UserId): Result<Page, DomainError> {
    if (this._blocks.length === 0) {
      return err(Errors.InvalidState('publish', 'draft', 'has content'));
    }

    const now = createTimestamp();
    return ok(
      new Page(
        this._id,
        this._slug,
        this._title,
        this._description,
        this._blocks,
        this._themeId,
        'published',
        {
          ...this._meta,
          updatedAt: now,
          updatedBy: userId,
          publishedAt: Option.some(now),
        },
        this._seo,
        this._version + 1
      )
    );
  }

  unpublish(userId: UserId): Page {
    return new Page(
      this._id,
      this._slug,
      this._title,
      this._description,
      this._blocks,
      this._themeId,
      'draft',
      {
        ...this._meta,
        updatedAt: createTimestamp(),
        updatedBy: userId,
        publishedAt: Option.none(),
      },
      this._seo,
      this._version + 1
    );
  }

  archive(userId: UserId): Page {
    return new Page(
      this._id,
      this._slug,
      this._title,
      this._description,
      this._blocks,
      this._themeId,
      'archived',
      {
        ...this._meta,
        updatedAt: createTimestamp(),
        updatedBy: userId,
      },
      this._seo,
      this._version + 1
    );
  }

  getBlockById(blockId: BlockId): Option<Block> {
    const block = this._blocks.find(b => b.id === blockId);
    return block ? Option.some(block) : Option.none();
  }

  getBlocksByType(type: BlockType): readonly Block[] {
    return this._blocks.filter(b => b.type === type);
  }

  toJSON(): {
    id: PageId;
    slug: Slug;
    title: string;
    description: Option<string>;
    blocks: ReturnType<Block['toJSON']>[];
    themeId: ThemeId;
    status: PageStatus;
    meta: PageMeta;
    seo: SeoData;
    version: number;
  } {
    return {
      id: this._id,
      slug: this._slug,
      title: this._title,
      description: this._description,
      blocks: this._blocks.map(b => b.toJSON()),
      themeId: this._themeId,
      status: this._status,
      meta: this._meta,
      seo: this._seo,
      version: this._version,
    };
  }

  static fromJSON(json: {
    id: PageId;
    slug: Slug;
    title: string;
    description: Option<string>;
    blocks: Parameters<typeof Block.fromJSON>[0][];
    themeId: ThemeId;
    status: PageStatus;
    meta: PageMeta;
    seo: SeoData;
    version: number;
  }): Page {
    return new Page(
      json.id,
      json.slug,
      json.title,
      json.description,
      json.blocks.map(b => Block.fromJSON(b)),
      json.themeId,
      json.status,
      json.meta,
      json.seo,
      json.version
    );
  }
}
