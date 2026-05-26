// Repository Pattern Implementation
// Provides abstraction over data storage with domain-focused interfaces

/**
 * Base Repository Interface
 */
export interface IRepository<TEntity, TId = string> {
  findById(id: TId): Promise<TEntity | null>;
  findMany(filter?: RepositoryFilter<TEntity>): Promise<TEntity[]>;
  create(entity: TEntity): Promise<TEntity>;
  update(id: TId, updates: Partial<TEntity>): Promise<TEntity>;
  delete(id: TId): Promise<boolean>;
  exists(id: TId): Promise<boolean>;
  count(filter?: RepositoryFilter<TEntity>): Promise<number>;
}

/**
 * Filter options for repository queries
 */
export interface RepositoryFilter<TEntity> {
  where?: Partial<TEntity>;
  orderBy?: keyof TEntity;
  orderDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

/**
 * Pagination options
 */
export interface PaginationOptions {
  page: number;
  pageSize: number;
}

/**
 * Paginated result
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * Base Repository with common functionality
 */
export abstract class BaseRepository<TEntity, TId = string>
  implements IRepository<TEntity, TId>
{
  abstract findById(id: TId): Promise<TEntity | null>;
  abstract findMany(filter?: RepositoryFilter<TEntity>): Promise<TEntity[]>;
  abstract create(entity: TEntity): Promise<TEntity>;
  abstract update(id: TId, updates: Partial<TEntity>): Promise<TEntity>;
  abstract delete(id: TId): Promise<boolean>;

  async exists(id: TId): Promise<boolean> {
    const entity = await this.findById(id);
    return entity !== null;
  }

  async count(filter?: RepositoryFilter<TEntity>): Promise<number> {
    const results = await this.findMany(filter);
    return results.length;
  }

  /**
   * Get paginated results
   */
  async paginate(
    options: PaginationOptions,
    filter?: RepositoryFilter<TEntity>
  ): Promise<PaginatedResult<TEntity>> {
    const { page, pageSize } = options;
    const offset = (page - 1) * pageSize;

    const results = await this.findMany({
      ...filter,
      limit: pageSize,
      offset,
    });

    const total = await this.count(filter);
    const totalPages = Math.ceil(total / pageSize);

    return {
      data: results,
      total,
      page,
      pageSize,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    };
  }
}

/**
 * In-memory repository for testing and simple use cases
 */
export class InMemoryRepository<TEntity extends { id: TId }, TId = string>
  extends BaseRepository<TEntity, TId>
{
  protected data: Map<TId, TEntity> = new Map();

  async findById(id: TId): Promise<TEntity | null> {
    return this.data.get(id) || null;
  }

  async findMany(filter?: RepositoryFilter<TEntity>): Promise<TEntity[]> {
    let results = Array.from(this.data.values());

    if (filter?.where) {
      results = results.filter((entity) =>
        this.matchesFilter(entity, filter.where!)
      );
    }

    if (filter?.orderBy) {
      results = this.sortResults(results, filter.orderBy, filter.orderDirection);
    }

    if (filter?.offset) {
      results = results.slice(filter.offset);
    }

    if (filter?.limit) {
      results = results.slice(0, filter.limit);
    }

    return results;
  }

  async create(entity: TEntity): Promise<TEntity> {
    this.data.set(entity.id, entity);
    return entity;
  }

  async update(id: TId, updates: Partial<TEntity>): Promise<TEntity> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error(`Entity with id ${id} not found`);
    }

    const updated = { ...existing, ...updates } as TEntity;
    this.data.set(id, updated);
    return updated;
  }

  async delete(id: TId): Promise<boolean> {
    return this.data.delete(id);
  }

  /**
   * Clear all data (useful for testing)
   */
  clear(): void {
    this.data.clear();
  }

  /**
   * Get current data size
   */
  size(): number {
    return this.data.size;
  }

  private matchesFilter(entity: TEntity, where: Partial<TEntity>): boolean {
    return Object.entries(where).every(([key, value]) => {
      return entity[key as keyof TEntity] === value;
    });
  }

  private sortResults(
    results: TEntity[],
    orderBy: keyof TEntity,
    direction: 'asc' | 'desc' = 'asc'
  ): TEntity[] {
    return results.sort((a, b) => {
      const aVal = a[orderBy];
      const bVal = b[orderBy];

      if (aVal === bVal) return 0;
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      return direction === 'asc' ? 1 : -1;
    });
  }
}

/**
 * Caching decorator for repositories
 */
export class CachedRepository<TEntity, TId = string>
  implements IRepository<TEntity, TId>
{
  private cache = new Map<TId, TEntity>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes
  private cacheTimestamps = new Map<TId, number>();

  constructor(
    private repository: IRepository<TEntity, TId>,
    timeoutMs?: number
  ) {
    if (timeoutMs) {
      this.cacheTimeout = timeoutMs;
    }
  }

  async findById(id: TId): Promise<TEntity | null> {
    const cached = this.getFromCache(id);
    if (cached) {
      return cached;
    }

    const result = await this.repository.findById(id);
    if (result) {
      this.setToCache(id, result);
    }
    return result;
  }

  async findMany(filter?: RepositoryFilter<TEntity>): Promise<TEntity[]> {
    return this.repository.findMany(filter);
  }

  async create(entity: TEntity): Promise<TEntity> {
    const result = await this.repository.create(entity);
    this.invalidateCache((entity as any).id);
    return result;
  }

  async update(id: TId, updates: Partial<TEntity>): Promise<TEntity> {
    const result = await this.repository.update(id, updates);
    this.invalidateCache(id);
    return result;
  }

  async delete(id: TId): Promise<boolean> {
    const result = await this.repository.delete(id);
    this.invalidateCache(id);
    return result;
  }

  async exists(id: TId): Promise<boolean> {
    const cached = this.getFromCache(id);
    if (cached) {
      return true;
    }
    return this.repository.exists(id);
  }

  async count(filter?: RepositoryFilter<TEntity>): Promise<number> {
    return this.repository.count(filter);
  }

  /**
   * Clear entire cache
   */
  clearCache(): void {
    this.cache.clear();
    this.cacheTimestamps.clear();
  }

  private getFromCache(id: TId): TEntity | null {
    const timestamp = this.cacheTimestamps.get(id);
    if (!timestamp) return null;

    const age = Date.now() - timestamp;
    if (age > this.cacheTimeout) {
      this.cache.delete(id);
      this.cacheTimestamps.delete(id);
      return null;
    }

    return this.cache.get(id) || null;
  }

  private setToCache(id: TId, entity: TEntity): void {
    this.cache.set(id, entity);
    this.cacheTimestamps.set(id, Date.now());
  }

  private invalidateCache(id: TId): void {
    this.cache.delete(id);
    this.cacheTimestamps.delete(id);
  }
}