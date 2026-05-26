// Strategy Pattern Implementation
// Defines a family of algorithms, encapsulates each one, and makes them interchangeable

/**
 * Base Strategy Interface
 */
export interface IStrategy<TInput = unknown, TOutput = unknown> {
  execute(input: TInput): Promise<TOutput> | TOutput;
  canHandle?(input: TInput): boolean;
  name?: string;
}

/**
 * Strategy Context for executing strategies
 */
export class StrategyContext<TInput = unknown, TOutput = unknown> {
  private strategies: IStrategy<TInput, TOutput>[] = [];

  addStrategy(strategy: IStrategy<TInput, TOutput>): void {
    this.strategies.push(strategy);
  }

  removeStrategy(strategy: IStrategy<TInput, TOutput>): void {
    this.strategies = this.strategies.filter((s) => s !== strategy);
  }

  async execute(input: TInput): Promise<TOutput> {
    for (const strategy of this.strategies) {
      if (strategy.canHandle?.(input) ?? true) {
        return strategy.execute(input);
      }
    }
    throw new Error('No suitable strategy found for the given input');
  }

  findStrategy(input: TInput): IStrategy<TInput, TOutput> | undefined {
    return this.strategies.find((s) => s.canHandle?.(input) ?? true);
  }

  hasStrategy(strategyName: string): boolean {
    return this.strategies.some((s) => s.name === strategyName);
  }
}

/**
 * Strategy Factory for creating strategies based on conditions
 */
export class StrategyFactory<TInput = unknown, TOutput = unknown> {
  private strategies: Map<string, IStrategy<TInput, TOutput>> = new Map();
  private selector: (input: TInput) => string;

  constructor(selector: (input: TInput) => string) {
    this.selector = selector;
  }

  register(key: string, strategy: IStrategy<TInput, TOutput>): void {
    this.strategies.set(key, strategy);
  }

  async execute(input: TInput): Promise<TOutput> {
    const key = this.selector(input);
    const strategy = this.strategies.get(key);

    if (!strategy) {
      throw new Error(`No strategy found for key: ${key}`);
    }

    return strategy.execute(input);
  }

  getStrategy(key: string): IStrategy<TInput, TOutput> | undefined {
    return this.strategies.get(key);
  }

  hasStrategy(key: string): boolean {
    return this.strategies.has(key);
  }
}

/**
 * Chain of Responsibility Pattern for sequential strategy execution
 */
export class StrategyChain<TInput = unknown, TOutput = unknown> {
  private strategies: IStrategy<TInput, TOutput>[] = [];

  addStrategy(strategy: IStrategy<TInput, TOutput>): this {
    this.strategies.push(strategy);
    return this;
  }

  async execute(input: TInput): Promise<TOutput> {
    let currentInput = input;
    let finalOutput: TOutput | undefined;

    for (const strategy of this.strategies) {
      if (strategy.canHandle?.(currentInput) ?? true) {
        finalOutput = await strategy.execute(currentInput);
        // Allow strategies to modify input for next strategy
        currentInput = finalOutput as unknown as TInput;
      }
    }

    return finalOutput as TOutput;
  }

  clear(): void {
    this.strategies = [];
  }
}

/**
 * Composite Strategy for combining multiple strategies
 */
export class CompositeStrategy<TInput = unknown, TOutput = unknown>
  implements IStrategy<TInput, TOutput>
{
  private strategies: IStrategy<TInput, TOutput>[] = [];
  private combineMode: 'all' | 'first' | 'merge' = 'first';

  constructor(combineMode: 'all' | 'first' | 'merge' = 'first') {
    this.combineMode = combineMode;
  }

  addStrategy(strategy: IStrategy<TInput, TOutput>): void {
    this.strategies.push(strategy);
  }

  async execute(input: TInput): Promise<TOutput> {
    switch (this.combineMode) {
      case 'first':
        return this.executeFirst(input);
      case 'all':
        return this.executeAll(input);
      case 'merge':
        return this.executeMerge(input);
      default:
        throw new Error(`Unknown combine mode: ${this.combineMode}`);
    }
  }

  canHandle(input: TInput): boolean {
    return this.strategies.some((s) => s.canHandle?.(input) ?? true);
  }

  private async executeFirst(input: TInput): Promise<TOutput> {
    for (const strategy of this.strategies) {
      if (strategy.canHandle?.(input) ?? true) {
        return strategy.execute(input);
      }
    }
    throw new Error('No strategy can handle the input');
  }

  private async executeAll(input: TInput): Promise<TOutput> {
    const results = await Promise.all(
      this.strategies.map((s) => s.execute(input))
    );
    return results as unknown as TOutput;
  }

  private async executeMerge(input: TInput): Promise<TOutput> {
    const results = await Promise.all(
      this.strategies.map((s) => s.execute(input))
    );
    return Object.assign({}, ...results) as TOutput;
  }
}

/**
 * Adaptive Strategy that learns from execution results
 */
export class AdaptiveStrategy<TInput = unknown, TOutput = unknown>
  implements IStrategy<TInput, TOutput>
{
  private strategies: Map<string, IStrategy<TInput, TOutput>> = new Map();
  private performanceMetrics = new Map<string, { success: number; total: number; avgTime: number }>();
  private selector: (input: TInput) => string;

  constructor(selector: (input: TInput) => string) {
    this.selector = selector;
  }

  register(key: string, strategy: IStrategy<TInput, TOutput>): void {
    this.strategies.set(key, strategy);
    this.performanceMetrics.set(key, { success: 0, total: 0, avgTime: 0 });
  }

  async execute(input: TInput): Promise<TOutput> {
    const key = this.selector(input);
    const strategy = this.strategies.get(key);

    if (!strategy) {
      throw new Error(`No strategy found for key: ${key}`);
    }

    const startTime = Date.now();
    try {
      const result = await strategy.execute(input);
      this.recordSuccess(key, Date.now() - startTime);
      return result;
    } catch (error) {
      this.recordFailure(key);
      throw error;
    }
  }

  canHandle(input: TInput): boolean {
    const key = this.selector(input);
    return this.strategies.has(key);
  }

  private recordSuccess(key: string, duration: number): void {
    const metrics = this.performanceMetrics.get(key);
    if (metrics) {
      metrics.success++;
      metrics.total++;
      metrics.avgTime = (metrics.avgTime * (metrics.total - 1) + duration) / metrics.total;
    }
  }

  private recordFailure(key: string): void {
    const metrics = this.performanceMetrics.get(key);
    if (metrics) {
      metrics.total++;
    }
  }

  getMetrics(key: string) {
    return this.performanceMetrics.get(key);
  }

  getAllMetrics() {
    return Object.fromEntries(this.performanceMetrics);
  }
}

/**
 * Strategy Registry for global strategy management
 */
export class StrategyRegistry {
  private static instance: StrategyRegistry;
  private contexts = new Map<string, StrategyContext>();

  private constructor() {}

  static getInstance(): StrategyRegistry {
    if (!StrategyRegistry.instance) {
      StrategyRegistry.instance = new StrategyRegistry();
    }
    return StrategyRegistry.instance;
  }

  registerContext(name: string, context: StrategyContext): void {
    this.contexts.set(name, context);
  }

  getContext(name: string): StrategyContext | undefined {
    return this.contexts.get(name);
  }

  hasContext(name: string): boolean {
    return this.contexts.has(name);
  }
}