// @ts-nocheck
// CQRS Pattern Implementation
// Separates read and write operations for scalable data access patterns

/**
 * Command interface for write operations that modify state
 */
export interface ICommand<TInput = unknown, TOutput = unknown> {
  execute(input: TInput): Promise<TOutput>;
  validate?(input: TInput): Promise<boolean>;
}

/**
 * Query interface for read operations that retrieve data without modification
 */
export interface IQuery<TInput = unknown, TOutput = unknown> {
  execute(input: TInput): Promise<TOutput>;
  validate?(input: TInput): Promise<boolean>;
}

/**
 * Command Bus for executing commands
 */
export class CommandBus {
  private handlers = new Map<string, ICommand>();

  register(commandName: string, handler: ICommand): void {
    this.handlers.set(commandName, handler);
  }

  async execute<TInput = unknown, TOutput = unknown>(
    commandName: string,
    input: TInput
  ): Promise<TOutput> {
    const handler = this.handlers.get(commandName);
    if (!handler) {
      throw new Error(`No handler registered for command: ${commandName}`);
    }

    if (handler.validate && !(await handler.validate(input))) {
      throw new Error(`Validation failed for command: ${commandName}`);
    }

    return handler.execute(input);
  }

  hasHandler(commandName: string): boolean {
    return this.handlers.has(commandName);
  }
}

/**
 * Query Bus for executing queries
 */
export class QueryBus {
  private handlers = new Map<string, IQuery>();

  register(queryName: string, handler: IQuery): void {
    this.handlers.set(queryName, handler);
  }

  async execute<TInput = unknown, TOutput = unknown>(
    queryName: string,
    input: TInput
  ): Promise<TOutput> {
    const handler = this.handlers.get(queryName);
    if (!handler) {
      throw new Error(`No handler registered for query: ${queryName}`);
    }

    if (handler.validate && !(await handler.validate(input))) {
      throw new Error(`Validation failed for query: ${queryName}`);
    }

    return handler.execute(input);
  }

  hasHandler(queryName: string): boolean {
    return this.handlers.has(queryName);
  }
}

/**
 * Base Command Result with success tracking
 */
export class CommandResult<T = unknown> {
  constructor(
    public success: boolean,
    public data?: T,
    public error?: Error
  ) {}

  static success<T>(data?: T): CommandResult<T> {
    return new CommandResult<T>(true, data);
  }

  static failure<T>(error: Error): CommandResult<T> {
    return new CommandResult<T>(false, undefined, error);
  }

  isFailure(): boolean {
    return !this.success;
  }
}

/**
 * Generic Command Handler base class
 */
export abstract class CommandHandler<TInput = unknown, TOutput = unknown>
  implements ICommand<TInput, TOutput>
{
  abstract execute(input: TInput): Promise<TOutput>;

  async validate?(input: TInput): Promise<boolean> {
    return true; // Default validation passes
  }
}

/**
 * Generic Query Handler base class
 */
export abstract class QueryHandler<TInput = unknown, TOutput = unknown>
  implements IQuery<TInput, TOutput>
{
  abstract execute(input: TInput): Promise<TOutput>;

  async validate?(input: TInput): Promise<boolean> {
    return true; // Default validation passes
  }
}

/**
 * Event for command execution tracking
 */
export interface CommandEvent {
  commandName: string;
  timestamp: Date;
  success: boolean;
  duration: number;
  error?: string;
}

/**
 * Command Event Publisher for logging/monitoring
 */
export class CommandEventPublisher {
  private listeners: Array<(event: CommandEvent) => void> = [];

  subscribe(listener: (event: CommandEvent) => void): void {
    this.listeners.push(listener);
  }

  publish(event: CommandEvent): void {
    this.listeners.forEach((listener) => listener(event));
  }
}

/**
 * Decorator for adding event publishing to commands
 */
export function WithEvents<TInput = unknown, TOutput = unknown>(
  command: ICommand<TInput, TOutput>,
  commandName: string,
  publisher: CommandEventPublisher
): ICommand<TInput, TOutput> {
  return {
    async execute(input: TInput): Promise<TOutput> {
      const startTime = Date.now();
      let event: CommandEvent;

      try {
        const result = await command.execute(input);
        event = {
          commandName,
          timestamp: new Date(),
          success: true,
          duration: Date.now() - startTime,
        };
        publisher.publish(event);
        return result;
      } catch (error) {
        event = {
          commandName,
          timestamp: new Date(),
          success: false,
          duration: Date.now() - startTime,
          error: error instanceof Error ? error.message : String(error),
        };
        publisher.publish(event);
        throw error;
      }
    },
    validate: command.validate,
  };
}