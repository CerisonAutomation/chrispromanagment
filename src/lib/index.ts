// @ts-nocheck
// Enterprise-Grade Library Framework
// Central export point for all enhanced libraries and frameworks

// Architectural Patterns
export * from '../core';

// Enhanced Infrastructure
export {
  OtelLogger,
  LogLevel,
  LogEntry,
  MetricEntry,
  SpanContext,
  MetricsCollector,
  DistributedTracing,
  observability,
  logger,
  metrics,
  tracing,
  Traced,
} from './otel-observability';

export {
  OWASPSecurityAuditor,
  SecurityMiddleware,
  OWASPCategory,
  SecurityIssue,
  SecurityAuditResult,
  securityAuditor,
} from './owasp-security-audit';

export {
  UnitTestRunner,
  IntegrationTestRunner,
  E2ETestRunner,
  TestPyramidOrchestrator,
  TestHelpers,
  TestType,
  TestSuite,
  TestCase,
  TestResult,
  TestRunReport,
  testOrchestrator,
} from './testing-framework';

export {
  PerformanceMonitor,
  CacheManager,
  Debouncer,
  Throttler,
  MemoryMonitor,
  PerformanceOptimizer,
  PerformanceMetric,
  CacheEntry,
  OptimizationSuggestion,
  performanceOptimizer,
} from './performance-optimizer';

// Enhanced Guesty Integration
export {
  EnterpriseGuestyClient,
  guesty as guestyClient,
} from './guesty';

export { buildBreakdown, formatMoney, describeCancellationPolicy } from './guestyPricing';