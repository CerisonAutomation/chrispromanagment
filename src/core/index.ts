// @ts-nocheck
// Core Architectural Patterns
// Exports all foundational patterns for enterprise-grade application architecture

export {
  ICommand,
  IQuery,
  CommandBus,
  QueryBus,
  CommandResult,
  CommandHandler,
  QueryHandler,
  CommandEvent,
  CommandEventPublisher,
  WithEvents,
} from './cqrs-pattern';

export {
  IRepository,
  RepositoryFilter,
  PaginationOptions,
  PaginatedResult,
  BaseRepository,
  InMemoryRepository,
  CachedRepository,
} from './repository-pattern';

export {
  IStrategy,
  StrategyContext,
  StrategyFactory,
  StrategyChain,
  CompositeStrategy,
  AdaptiveStrategy,
  StrategyRegistry,
} from './strategy-pattern';

export {
  ServiceContainer,
  ServiceLifetime,
  ServiceDescriptor,
  Injectable,
  serviceContainer,
  registerService,
  resolveService,
  autoRegister,
  ServiceLocator,
} from './service-container';