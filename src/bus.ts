// =============================================================================
// CQRS BUS - Command Query Responsibility Segregation
// =============================================================================
import type { Result } from '@/types/consolidated';

/**
 * Command interface - represents a write operation
 */
export interface Command {
  type: string;
}

/**
 * Query interface - represents a read operation
 */
export interface Query<T = unknown> {
  type: string;
}

/**
 * Command handler interface
 */
export type CommandHandler<C extends Command, R = void> = (
  command: C
) => Promise<Result<R, Error>>;

/**
 * Query handler interface
 */
export type QueryHandler<Q extends Query, R = unknown> = (
  query: Q
) => Promise<Result<R, Error>>;

// =============================================================================
// COMMAND BUS
// =============================================================================
class CommandBus {
  private handlers = new Map<string, CommandHandler<any, any>>();

  /**
   * Register a command handler
   */
  register<C extends Command, R = void>(
    commandType: string,
    handler: CommandHandler<C, R>
  ): void {
    if (this.handlers.has(commandType)) {
      throw new Error(`Handler already registered for command: ${commandType}`);
    }
    this.handlers.set(commandType, handler);
  }

  /**
   * Execute a command
   */
  async execute<C extends Command, R = void>(
    command: C
  ): Promise<Result<R, Error>> {
    const handler = this.handlers.get(command.type);
    
    if (!handler) {
      return {
        success: false,
        error: new Error(`No handler registered for command: ${command.type}`),
      } as const;
    }

    try {
      return await handler(command);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      } as const;
    }
  }
}

// =============================================================================
// QUERY BUS
// =============================================================================
class QueryBus {
  private handlers = new Map<string, QueryHandler<any, any>>();

  /**
   * Register a query handler
   */
  register<Q extends Query, R = unknown>(
    queryType: string,
    handler: QueryHandler<Q, R>
  ): void {
    if (this.handlers.has(queryType)) {
      throw new Error(`Handler already registered for query: ${queryType}`);
    }
    this.handlers.set(queryType, handler);
  }

  /**
   * Execute a query
   */
  async execute<Q extends Query, R = unknown>(
    query: Q
  ): Promise<Result<R, Error>> {
    const handler = this.handlers.get(query.type);
    
    if (!handler) {
      return {
        success: false,
        error: new Error(`No handler registered for query: ${query.type}`),
      } as const;
    }

    try {
      return await handler(query);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      } as const;
    }
  }
}

// Singleton instances
export const commandBus = new CommandBus();
export const queryBus = new QueryBus();

// =============================================================================
// COMMAND DEFINITIONS (Examples)
// =============================================================================

// Page Commands
export class CreatePageCommand implements Command {
  type = 'CREATE_PAGE';
  constructor(
    public readonly slug: string,
    public readonly title: string,
    public readonly data: any
  ) {}
}

export class UpdatePageCommand implements Command {
  type = 'UPDATE_PAGE';
  constructor(
    public readonly pageId: string,
    public readonly data: any
  ) {}
}

export class PublishPageCommand implements Command {
  type = 'PUBLISH_PAGE';
  constructor(public readonly pageId: string) {}
}

export class DeletePageCommand implements Command {
  type = 'DELETE_PAGE';
  constructor(public readonly pageId: string) {}
}

// =============================================================================
// QUERY DEFINITIONS (Examples)
// =============================================================================

export class GetPageQuery implements Query<any> {
  type = 'GET_PAGE';
  constructor(public readonly slug: string) {}
}

export class ListPagesQuery implements Query<any[]> {
  type = 'LIST_PAGES';
  constructor(public readonly status?: 'draft' | 'published') {}
}

export class GetPublishedPagesQuery implements Query<any[]> {
  type = 'GET_PUBLISHED_PAGES';
}
