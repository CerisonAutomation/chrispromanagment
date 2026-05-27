// @ts-nocheck
// CQRS Pattern Implementation
// Separates read and write operations for scalable data access patterns
// Supports both Class-based DI structures and Event-driven dispatch-object patterns seamlessly.

/**
 * Command interface for write operations that modify state
 */
export interface ICommand<TInput = any, TOutput = any> {
  execute(input: TInput): Promise<TOutput>;
  validate?(input: TInput): Promise<boolean>;
}

/**
 * Query interface for read operations that retrieve data without modification
 */
export interface IQuery<TInput = any, TOutput = any> {
  execute(input: TInput): Promise<TOutput>;
  validate?(input: TInput): Promise<boolean>;
}

/**
 * Simple EventEmitter implementation for event-driven CQRS tracking
 */
class MicroEventEmitter {
  private listeners = new Map<string, Array<(...args: any[]) => void>>();

  on(event: string, callback: (...args: any[]) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  emit(event: string, ...args: any[]): void {
    const list = this.listeners.get(event);
    if (list) {
      list.forEach((cb) => {
        try {
          cb(...args);
        } catch (e) {
          console.error(`Error in event listener for ${event}:`, e);
        }
      });
    }
  }
}

/**
 * Dispatch-object style Command
 */
export interface Command<TPayload = any> {
  id: string;
  type: string;
  payload: TPayload;
  timestamp: Date;
}

/**
 * Dispatch-object style Query
 */
export interface Query<TPayload = any> {
  id: string;
  type: string;
  payload: TPayload;
  timestamp: Date;
}

/**
 * Helper to generate unique IDs
 */
function generateId(): string {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

/**
 * Create a command object
 */
export function createCommand<TPayload = any>(type: string, payload: TPayload): Command<TPayload> {
  return {
    id: generateId(),
    type,
    payload,
    timestamp: new Date(),
  };
}

/**
 * Create a query object
 */
export function createQuery<TPayload = any>(type: string, payload: TPayload): Query<TPayload> {
  return {
    id: generateId(),
    type,
    payload,
    timestamp: new Date(),
  };
}

/**
 * Command Bus for executing commands
 * Supports sync execution, async via QStash, and event-driven dispatch
 */
export class CommandBus extends MicroEventEmitter {
  private handlers = new Map<string, any>();
  private validators = new Map<string, (cmd: any) => Promise<boolean> | boolean>();
  private qstashEnabled = false;

  register(commandName: string, handler: any): void {
    this.handlers.set(commandName, handler);
  }

  unregister(commandName: string): void {
    this.handlers.delete(commandName);
    this.validators.delete(commandName);
  }

  setValidator(commandName: string, validator: (cmd: any) => Promise<boolean> | boolean): void {
    this.validators.set(commandName, validator);
  }

  async execute<TInput = any, TOutput = any>(
    commandOrName: string | Command<TInput> | ICommand<TInput, TOutput>,
    input?: TInput
  ): Promise<TOutput> {
    let commandName: string;
    let payload: any;
    let commandObject: any;

    if (typeof commandOrName === 'string') {
      commandName = commandOrName;
      payload = input;
      commandObject = { type: commandName, payload };
    } else if (commandOrName && typeof (commandOrName as any).type === 'string') {
      const cmd = commandOrName as Command<TInput>;
      commandName = cmd.type;
      payload = cmd.payload;
      commandObject = cmd;
    } else {
      // Direct ICommand implementation
      const handler = commandOrName as ICommand<TInput, TOutput>;
      if (handler.validate && !(await handler.validate(input!))) {
        throw new Error('Validation failed for command execution');
      }
      return handler.execute(input!);
    }

    const handler = this.handlers.get(commandName);
    if (!handler) {
      throw new Error(`No handler registered for command: ${commandName}`);
    }

    // Run validator if set
    const validator = this.validators.get(commandName);
    if (validator) {
      const isValid = await validator(commandObject);
      if (!isValid) {
        this.emit('commandExecuted', {
          command: commandObject,
          status: 'error',
          error: new Error('Command validation failed'),
        });
        throw new Error('Command validation failed');
      }
    }

    this.emit('beforeExecution', { command: commandObject });

    try {
      let result: TOutput;
      if (typeof handler === 'function') {
        result = await handler(commandObject);
      } else if (handler && typeof handler.execute === 'function') {
        if (handler.validate && !(await handler.validate(payload))) {
          throw new Error(`Validation failed for command: ${commandName}`);
        }
        result = await handler.execute(payload);
      } else {
        throw new Error(`Invalid handler for command: ${commandName}`);
      }

      this.emit('afterExecution', { command: commandObject, result });
      this.emit('commandExecuted', {
        command: commandObject,
        status: 'success',
        result,
      });

      return result;
    } catch (error: any) {
      this.emit('commandExecuted', {
        command: commandObject,
        status: 'error',
        error,
      });
      throw error;
    }
  }

  hasHandler(commandName: string): boolean {
    return this.handlers.has(commandName);
  }

  /**
   * Execute command asynchronously via QStash
   * Returns immediately, job processed in background
   */
  private qstashTimeoutMs = 30000;
  private qstashRetries = 3;

  setQStashConfig(opts: { timeoutMs?: number; retries?: number }): void {
    if (opts.timeoutMs !== undefined) {
this.qstashTimeoutMs = opts.timeoutMs;
}
    if (opts.retries !== undefined) {
this.qstashRetries = opts.retries;
}
  }

  async executeAsync<TInput = any, TOutput = any>(
    commandOrName: string | Command<TInput> | ICommand<TInput, TOutput>,
    input?: TInput
  ): Promise<{ messageId: string; status: string }> {
    let commandName: string;
    let payload: any;

    if (typeof commandOrName === 'string') {
      commandName = commandOrName;
      payload = input;
    } else if (typeof (commandOrName as any).type === 'string') {
      commandName = (commandOrName as Command<TInput>).type;
      payload = (commandOrName as Command<TInput>).payload;
    } else {
      throw new Error('Cannot execute async: direct ICommand not supported for async');
    }

    // Resolve QStash via service container
    const { qstash } = await serviceContainer.resolve<{ qstash: QStashClient }>('qstash');
    const result = await qstash.publish({
      url: '/api/qstash-webhook',
      body: { command: commandName, payload, timestamp: new Date().toISOString() },
      retries: this.qstashRetries,
      timeout: this.qstashTimeoutMs,
    });

    this.emit('commandQueued', { command: commandName, messageId: result.messageId });
    return { messageId: result.messageId, status: 'queued' };
  }

  setQStashEnabled(enabled: boolean): void {
    this.qstashEnabled = enabled;
  }
}

/**
 * Query Bus for executing queries with built-in caching support
 */
export class QueryBus extends MicroEventEmitter {
  private handlers = new Map<string, any>();
  private validators = new Map<string, (query: any) => Promise<boolean> | boolean>();
  private cacheConfigs = new Map<string, { ttl: number }>();
  private cache = new Map<string, { data: any; expiresAt: number }>();

  register(queryName: string, handler: any): void {
    this.handlers.set(queryName, handler);
  }

  unregister(queryName: string): void {
    this.handlers.delete(queryName);
    this.validators.delete(queryName);
    this.cacheConfigs.delete(queryName);
  }

  setValidator(queryName: string, validator: (query: any) => Promise<boolean> | boolean): void {
    this.validators.set(queryName, validator);
  }

  enableCache(queryName: string, ttlMs: number): void {
    this.cacheConfigs.set(queryName, { ttl: ttlMs });
  }

  async execute<TInput = any, TOutput = any>(
    queryOrName: string | Query<TInput> | IQuery<TInput, TOutput>,
    input?: TInput
  ): Promise<TOutput> {
    let queryName: string;
    let payload: any;
    let queryObject: any;

    if (typeof queryOrName === 'string') {
      queryName = queryOrName;
      payload = input;
      queryObject = { type: queryName, payload };
    } else if (queryOrName && typeof (queryOrName as any).type === 'string') {
      const q = queryOrName as Query<TInput>;
      queryName = q.type;
      payload = q.payload;
      queryObject = q;
    } else {
      // Direct IQuery implementation
      const handler = queryOrName as IQuery<TInput, TOutput>;
      if (handler.validate && !(await handler.validate(input!))) {
        throw new Error('Validation failed for query execution');
      }
      return handler.execute(input!);
    }

    const handler = this.handlers.get(queryName);
    if (!handler) {
      throw new Error(`No handler registered for query: ${queryName}`);
    }

    // Check validator
    const validator = this.validators.get(queryName);
    if (validator) {
      const isValid = await validator(queryObject);
      if (!isValid) {
        throw new Error('Query validation failed');
      }
    }

    // Check cache
    const cacheConfig = this.cacheConfigs.get(queryName);
    const cacheKey = `${queryName}:${JSON.stringify(payload)}`;
    if (cacheConfig) {
      const cached = this.cache.get(cacheKey);
      if (cached && cached.expiresAt > Date.now()) {
        return cached.data;
      }
    }

    try {
      let result: TOutput;
      if (typeof handler === 'function') {
        result = await handler(queryObject);
      } else if (handler && typeof handler.execute === 'function') {
        if (handler.validate && !(await handler.validate(payload))) {
          throw new Error(`Validation failed for query: ${queryName}`);
        }
        result = await handler.execute(payload);
      } else {
        throw new Error(`Invalid handler for query: ${queryName}`);
      }

      // Populate cache if enabled
      if (cacheConfig) {
        this.cache.set(cacheKey, {
          data: result,
          expiresAt: Date.now() + cacheConfig.ttl,
        });
      }

      this.emit('queryExecuted', {
        query: queryObject,
        status: 'success',
        result,
      });

      return result;
    } catch (error) {
      this.emit('queryExecuted', {
        query: queryObject,
        status: 'error',
        error,
      });
      throw error;
    }
  }

  hasHandler(queryName: string): boolean {
    return this.handlers.has(queryName);
  }
}

/**
 * Base Command Result with success tracking
 */
export class CommandResult<T = any> {
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
export abstract class CommandHandler<TInput = any, TOutput = any>
  implements ICommand<TInput, TOutput> {
  abstract execute(input: TInput): Promise<TOutput>;

  async validate?(input: TInput): Promise<boolean> {
    return true; // Default validation passes
  }
}

/**
 * Generic Query Handler base class
 */
export abstract class QueryHandler<TInput = any, TOutput = any>
  implements IQuery<TInput, TOutput> {
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
export function WithEvents<TInput = any, TOutput = any>(
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