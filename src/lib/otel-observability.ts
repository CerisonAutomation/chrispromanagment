// OpenTelemetry Observability Framework
// Enterprise-grade structured logging with OpenTelemetry standards

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  FATAL = 'FATAL',
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  traceId?: string;
  spanId?: string;
  service?: string;
  environment?: string;
  userId?: string;
  requestId?: string;
}

export interface MetricEntry {
  name: string;
  value: number;
  timestamp: string;
  labels?: Record<string, string>;
  type: 'counter' | 'gauge' | 'histogram';
}

export interface SpanContext {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
}

/**
 * Enhanced Logger with OpenTelemetry standards
 */
export class OtelLogger {
  private logs: LogEntry[] = [];
  private maxBufferSize = 1000;
  private flushInterval = 5000; // 5 seconds
  private flushTimer?: NodeJS.Timeout;
  private isProduction = false;

  constructor(
    private serviceName: string = 'chris-promanagment',
    private environment: string = 'development'
  ) {
    this.isProduction = environment === 'production';
    this.startFlushTimer();
  }

  /**
   * Log a debug message
   */
  debug(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * Log an info message
   */
  info(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * Log a warning message
   */
  warn(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, context);
  }

  /**
   * Log an error message
   */
  error(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.ERROR, message, context);
  }

  /**
   * Log a fatal error message
   */
  fatal(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.FATAL, message, context);
  }

  /**
   * Core logging method with OpenTelemetry formatting
   */
  private log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      service: this.serviceName,
      environment: this.environment,
    };

    this.logs.push(entry);

    // In production, immediately send to logging service
    if (this.isProduction && level >= LogLevel.ERROR) {
      this.flush();
    }

    // Console output for development
    if (!this.isProduction) {
      this.logToConsole(entry);
    }

    // Auto-flush if buffer is full
    if (this.logs.length >= this.maxBufferSize) {
      this.flush();
    }
  }

  /**
   * Log to console with colors
   */
  private logToConsole(entry: LogEntry): void {
    const colorMap = {
      [LogLevel.DEBUG]: '\x1b[36m', // cyan
      [LogLevel.INFO]: '\x1b[32m', // green
      [LogLevel.WARN]: '\x1b[33m', // yellow
      [LogLevel.ERROR]: '\x1b[31m', // red
      [LogLevel.FATAL]: '\x1b[35m', // magenta
    };
    const reset = '\x1b[0m';
    const color = colorMap[entry.level];

    console.log(
      `${color}[${entry.timestamp}] [${entry.level}] [${entry.service}]${reset} ${entry.message}`,
      entry.context || ''
    );
  }

  /**
   * Flush logs to external service
   */
  flush(): void {
    if (this.logs.length === 0) return;

    const logsToSend = [...this.logs];
    this.logs = [];

    // In production, send to logging service
    if (this.isProduction) {
      this.sendToLoggingService(logsToSend).catch((error) => {
        console.error('Failed to send logs:', error);
      });
    }
  }

  /**
   * Send logs to external logging service
   */
  private async sendToLoggingService(logs: LogEntry[]): Promise<void> {
    // Placeholder for sending to actual logging service
    // This could be sent to Datadog, CloudWatch, Splunk, etc.
    const payload = JSON.stringify(logs);
    console.debug(`[Logging Service] Sending ${logs.length} logs:`, payload);
  }

  /**
   * Start auto-flush timer
   */
  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  /**
   * Stop auto-flush timer
   */
  stopFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = undefined;
    }
  }

  /**
   * Create a child logger with additional context
   */
  child(additionalContext: Record<string, unknown>): OtelLogger {
    const child = new OtelLogger(this.serviceName, this.environment);
    child.logs = this.logs;
    return child;
  }
}

/**
 * Metrics Collector for OpenTelemetry metrics
 */
export class MetricsCollector {
  private metrics: MetricEntry[] = [];
  private counters = new Map<string, number>();
  private gauges = new Map<string, number>();

  /**
   * Increment a counter metric
   */
  incrementCounter(name: string, value: number = 1, labels?: Record<string, string>): void {
    const currentValue = this.counters.get(name) || 0;
    this.counters.set(name, currentValue + value);

    this.recordMetric({
      name,
      value: currentValue + value,
      timestamp: new Date().toISOString(),
      labels,
      type: 'counter',
    });
  }

  /**
   * Set a gauge metric
   */
  setGauge(name: string, value: number, labels?: Record<string, string>): void {
    this.gauges.set(name, value);

    this.recordMetric({
      name,
      value,
      timestamp: new Date().toISOString(),
      labels,
      type: 'gauge',
    });
  }

  /**
   * Record a histogram metric
   */
  recordHistogram(name: string, value: number, labels?: Record<string, string>): void {
    this.recordMetric({
      name,
      value,
      timestamp: new Date().toISOString(),
      labels,
      type: 'histogram',
    });
  }

  /**
   * Record a metric
   */
  private recordMetric(metric: MetricEntry): void {
    this.metrics.push(metric);

    // In production, send to metrics service
    if (this.metrics.length >= 100) {
      this.flush();
    }
  }

  /**
   * Flush metrics to external service
   */
  flush(): void {
    if (this.metrics.length === 0) return;

    const metricsToSend = [...this.metrics];
    this.metrics = [];

    this.sendToMetricsService(metricsToSend).catch((error) => {
      console.error('Failed to send metrics:', error);
    });
  }

  /**
   * Send metrics to external metrics service
   */
  private async sendToMetricsService(metrics: MetricEntry[]): Promise<void> {
    // Placeholder for sending to actual metrics service
    // This could be sent to Prometheus, Datadog, CloudWatch, etc.
    const payload = JSON.stringify(metrics);
    console.debug(`[Metrics Service] Sending ${metrics.length} metrics:`, payload);
  }

  /**
   * Get current counter values
   */
  getCounter(name: string): number {
    return this.counters.get(name) || 0;
  }

  /**
   * Get current gauge values
   */
  getGauge(name: string): number {
    return this.gauges.get(name) || 0;
  }
}

/**
 * Distributed Tracing with OpenTelemetry
 */
export class DistributedTracing {
  private activeSpans = new Map<string, SpanContext>();
  private traceIdCounter = 0;
  private spanIdCounter = 0;

  /**
   * Start a new trace
   */
  startTrace(operationName: string): SpanContext {
    const traceId = this.generateTraceId();
    const spanId = this.generateSpanId();

    const context: SpanContext = {
      traceId,
      spanId,
    };

    this.activeSpans.set(spanId, context);
    return context;
  }

  /**
   * Start a child span
   */
  startChildSpan(parentSpanId: string, operationName: string): SpanContext {
    const parentContext = this.activeSpans.get(parentSpanId);
    if (!parentContext) {
      throw new Error(`Parent span ${parentSpanId} not found`);
    }

    const spanId = this.generateSpanId();

    const context: SpanContext = {
      traceId: parentContext.traceId,
      spanId,
      parentSpanId,
    };

    this.activeSpans.set(spanId, context);
    return context;
  }

  /**
   * End a span
   */
  endSpan(spanId: string): void {
    const context = this.activeSpans.get(spanId);
    if (context) {
      this.activeSpans.delete(spanId);
      // In production, send to tracing service
      console.debug(`[Tracing] Ending span: ${spanId}`);
    }
  }

  /**
   * Get current span context
   */
  getCurrentSpan(spanId: string): SpanContext | undefined {
    return this.activeSpans.get(spanId);
  }

  /**
   * Generate a unique trace ID
   */
  private generateTraceId(): string {
    return `${Date.now()}-${this.traceIdCounter++}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate a unique span ID
   */
  private generateSpanId(): string {
    return `${this.spanIdCounter++}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Global observability instance
 */
export const observability = {
  logger: new OtelLogger(),
  metrics: new MetricsCollector(),
  tracing: new DistributedTracing(),
};

/**
 * Convenience functions for common operations
 */
export const logger = observability.logger;
export const metrics = observability.metrics;
export const tracing = observability.tracing;

/**
 * Decorator for automatic method tracing
 */
export function Traced(operationName?: string) {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      const name = operationName || `${target.constructor.name}.${propertyKey}`;
      const spanContext = tracing.startTrace(name);

      try {
        logger.debug(`Starting ${name}`);
        const result = await originalMethod.apply(this, args);
        logger.debug(`Completed ${name}`);
        tracing.endSpan(spanContext.spanId);
        return result;
      } catch (error) {
        logger.error(`Error in ${name}`, { error });
        tracing.endSpan(spanContext.spanId);
        throw error;
      }
    };

    return descriptor;
  };
}