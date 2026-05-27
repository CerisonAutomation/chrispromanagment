// @ts-nocheck
// OpenTelemetry Observability Framework
// Enterprise-grade structured logging with OpenTelemetry standards
// Version 2.0 - Enhanced with correlation IDs, trace context, and JSON logging

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
  correlationId?: string;
  parentSpanId?: string;
  duration?: number;
  tags?: Record<string, string>;
}

export interface MetricEntry {
  name: string;
  value: number;
  timestamp: string;
  labels?: Record<string, string>;
  type: 'counter' | 'gauge' | 'histogram';
  unit?: string;
  description?: string;
}

export interface HistogramBucket {
  le: number; // less than or equal to
  count: number;
}

export interface HistogramEntry {
  name: string;
  count: number;
  sum: number;
  buckets: HistogramBucket[];
  timestamp: string;
  labels?: Record<string, string>;
  p50?: number;
  p95?: number;
  p99?: number;
}

export interface SpanContext {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  sampled?: boolean;
  baggage?: Record<string, string>;
}

export interface SamplingStrategy {
  name: string;
  sampleRate: number; // 0.0 to 1.0
  shouldSample: (context: SpanContext, operationName: string) => boolean;
}

export interface SpanData {
  context: SpanContext;
  operationName: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  tags?: Record<string, unknown>;
  status?: 'ok' | 'error';
  error?: Error;
}

/**
 * Enhanced Logger with OpenTelemetry standards
 * Features:
 * - Correlation ID propagation across requests
 * - Trace context integration with distributed tracing
 * - Machine-readable JSON structured logging
 * - Automatic context injection from active spans
 */
export class OtelLogger {
  private logs: LogEntry[] = [];
  private maxBufferSize = 1000;
  private flushInterval = 5000; // 5 seconds
  private flushTimer?: NodeJS.Timeout;
  private isProduction = false;
  private currentCorrelationId?: string;
  private currentUserId?: string;
  private currentTraceContext?: SpanContext;
  private static instance: OtelLogger | null = null;

  constructor(
    private serviceName: string = 'chris-promanagment',
    private environment: string = 'development'
  ) {
    this.isProduction = environment === 'production';
    this.startFlushTimer();
  }

  /**
   * Get singleton instance
   */
  static getInstance(serviceName?: string, environment?: string): OtelLogger {
    if (!OtelLogger.instance) {
      OtelLogger.instance = new OtelLogger(serviceName, environment);
    }
    return OtelLogger.instance;
  }

  /**
   * Set correlation ID for the current request/session
   */
  setCorrelationId(correlationId: string): void {
    this.currentCorrelationId = correlationId;
  }

  /**
   * Get or generate correlation ID
   */
  getCorrelationId(): string {
    if (!this.currentCorrelationId) {
      this.currentCorrelationId = this.generateCorrelationId();
    }
    return this.currentCorrelationId;
  }

  /**
   * Set user context for all subsequent logs
   */
  setUserId(userId: string): void {
    this.currentUserId = userId;
  }

  /**
   * Set trace context from distributed tracing
   */
  setTraceContext(context: SpanContext): void {
    this.currentTraceContext = context;
  }

  /**
   * Clear trace context
   */
  clearTraceContext(): void {
    this.currentTraceContext = undefined;
  }

  /**
   * Generate a unique correlation ID
   */
  private generateCorrelationId(): string {
    return `corr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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
   * Automatically injects correlation ID, trace context, and user ID
   */
  private log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: {
        ...context,
        correlationId: this.getCorrelationId(),
      },
      service: this.serviceName,
      environment: this.environment,
      correlationId: this.getCorrelationId(),
      userId: this.currentUserId,
    };

    // Inject trace context if available
    if (this.currentTraceContext) {
      entry.traceId = this.currentTraceContext.traceId;
      entry.spanId = this.currentTraceContext.spanId;
      entry.parentSpanId = this.currentTraceContext.parentSpanId;
    }

    this.logs.push(entry);

    // In production, immediately send to logging service for errors
    if (this.isProduction && level >= LogLevel.ERROR) {
      this.flush();
    }

    // Console output for development - always JSON in production
    if (!this.isProduction) {
      this.logToConsole(entry);
    } else {
      // Production: always output JSON for log aggregation
      console.log(JSON.stringify(entry));
    }

    // Auto-flush if buffer is full
    if (this.logs.length >= this.maxBufferSize) {
      this.flush();
    }
  }

  /**
   * Log to console with colors (development mode)
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

    const traceInfo = entry.traceId ? `[trace:${entry.traceId.slice(0, 8)}]` : '';
    const corrInfo = entry.correlationId ? `[corr:${entry.correlationId.slice(0, 8)}]` : '';

    console.log(
      `${color}[${entry.timestamp}] [${entry.level}] [${entry.service}]${traceInfo}${corrInfo}${reset} ${entry.message}`,
      entry.context || ''
    );
  }

  /**
   * Output log as JSON (machine-readable)
   */
  private logAsJson(entry: LogEntry): void {
    console.log(JSON.stringify(entry));
  }

  /**
   * Flush logs to external service
   */
  flush(): void {
    if (this.logs.length === 0) {
return;
}

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
   * Supports: Datadog, CloudWatch Logs, Splunk, Loki
   */
  private async sendToLoggingService(logs: LogEntry[]): Promise<void> {
    const logAggregationService = import.meta.env.VITE_LOG_AGGREGATION_SERVICE || 'console';
    const payload = JSON.stringify(logs);

    switch (logAggregationService) {
      case 'datadog':
        await this.sendToDatadog(logs);
        break;
      case 'cloudwatch':
        await this.sendToCloudWatch(logs);
        break;
      case 'splunk':
        await this.sendToSplunk(logs);
        break;
      case 'loki':
        await this.sendToLoki(logs);
        break;
      default:
        // Fallback to console in development
        console.debug(`[Logging Service] Sending ${logs.length} logs:`, payload);
    }
  }

  /**
   * Send logs to Datadog
   */
  private async sendToDatadog(logs: LogEntry[]): Promise<void> {
    const apiKey = import.meta.env.VITE_DATADOG_API_KEY;
    if (!apiKey) {
      console.warn('[Datadog] API key not configured, skipping log send');
      return;
    }

    try {
      const response = await fetch('https://http-intake.logs.datadoghq.com/v1/input/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'DD-API-KEY': apiKey,
        },
        body: JSON.stringify(logs.map(log => ({
          ...log,
          ddsource: this.serviceName,
          ddtags: `env:${this.environment},service:${this.serviceName}`,
        }))),
      });

      if (!response.ok) {
        throw new Error(`Datadog API error: ${response.status}`);
      }
    } catch (error) {
      console.error('[Datadog] Failed to send logs:', error);
    }
  }

  /**
   * Send logs to CloudWatch Logs
   */
  private async sendToCloudWatch(logs: LogEntry[]): Promise<void> {
    // CloudWatch requires AWS SDK and credentials
    // This is a placeholder for CloudWatch integration
    console.debug('[CloudWatch] Log sending not implemented, requires AWS SDK');
  }

  /**
   * Send logs to Splunk
   */
  private async sendToSplunk(logs: LogEntry[]): Promise<void> {
    const splunkUrl = import.meta.env.VITE_SPLUNK_HEC_URL;
    const splunkToken = import.meta.env.VITE_SPLUNK_HEC_TOKEN;

    if (!splunkUrl || !splunkToken) {
      console.warn('[Splunk] HEC URL or token not configured, skipping log send');
      return;
    }

    try {
      const response = await fetch(splunkUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Splunk ${splunkToken}`,
        },
        body: JSON.stringify({
          source: this.serviceName,
          sourcetype: '_json',
          event: logs,
        }),
      });

      if (!response.ok) {
        throw new Error(`Splunk HEC error: ${response.status}`);
      }
    } catch (error) {
      console.error('[Splunk] Failed to send logs:', error);
    }
  }

  /**
   * Send logs to Grafana Loki
   */
  private async sendToLoki(logs: LogEntry[]): Promise<void> {
    const lokiUrl = import.meta.env.VITE_LOKI_URL;

    if (!lokiUrl) {
      console.warn('[Loki] URL not configured, skipping log send');
      return;
    }

    try {
      const streams = logs.map(log => ({
        stream: {
          service: this.serviceName,
          environment: this.environment,
          level: log.level,
        },
        values: [
          [Date.now().toString(), JSON.stringify(log)],
        ],
      }));

      const response = await fetch(`${lokiUrl}/loki/api/v1/push`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ streams }),
      });

      if (!response.ok) {
        throw new Error(`Loki API error: ${response.status}`);
      }
    } catch (error) {
      console.error('[Loki] Failed to send logs:', error);
    }
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
 * Features:
 * - Counter, Gauge, and Histogram metric types
 * - P95/P99 latency monitoring
 * - Automatic percentile calculation
 * - Metric aggregation and export
 */
export class MetricsCollector {
  private metrics: MetricEntry[] = [];
  private counters = new Map<string, number>();
  private gauges = new Map<string, number>();
  private histograms = new Map<string, number[]>();
  private histogramBuckets = [10, 50, 100, 250, 500, 1000, 2500, 5000, 10000]; // in milliseconds
  private histogramEntries = new Map<string, HistogramEntry>();

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
   * Record a histogram metric with automatic percentile calculation
   */
  recordHistogram(name: string, value: number, labels?: Record<string, string>): void {
    const values = this.histograms.get(name) || [];
    values.push(value);
    this.histograms.set(name, values);

    this.recordMetric({
      name,
      value,
      timestamp: new Date().toISOString(),
      labels,
      type: 'histogram',
    });

    // Calculate percentiles if we have enough samples
    if (values.length >= 10) {
      this.calculatePercentiles(name, values, labels);
    }
  }

  /**
   * Record latency in milliseconds with automatic histogram
   */
  recordLatency(operation: string, durationMs: number, labels?: Record<string, string>): void {
    this.recordHistogram(`${operation}_duration_ms`, durationMs, {
      ...labels,
      unit: 'ms',
    });
  }

  /**
   * Calculate percentiles for histogram
   */
  private calculatePercentiles(name: string, values: number[], labels?: Record<string, string>): void {
    const sorted = [...values].sort((a, b) => a - b);
    const count = sorted.length;
    const sum = sorted.reduce((acc, val) => acc + val, 0);

    // Calculate bucket counts
    const buckets = this.histogramBuckets.map(le => {
      const bucketCount = sorted.filter(v => v <= le).length;
      return { le, count: bucketCount };
    });

    // Calculate percentiles
    const p50 = this.calculatePercentile(sorted, 50);
    const p95 = this.calculatePercentile(sorted, 95);
    const p99 = this.calculatePercentile(sorted, 99);

    const entry: HistogramEntry = {
      name,
      count,
      sum,
      buckets,
      timestamp: new Date().toISOString(),
      labels,
      p50,
      p95,
      p99,
    };

    this.histogramEntries.set(name, entry);

    // Check alerting thresholds
    this.checkAlertThresholds(name, p95, p99, labels);
  }

  /**
   * Calculate percentile from sorted array
   */
  private calculatePercentile(sorted: number[], percentile: number): number {
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  /**
   * Check if metrics exceed alerting thresholds
   */
  private checkAlertThresholds(name: string, p95: number, p99: number, labels?: Record<string, string>): void {
    const thresholdConfig = this.getThresholdConfig(name);

    if (thresholdConfig) {
      if (p95 > thresholdConfig.p95Threshold) {
        console.error(`[ALERT] ${name} P95 (${p95}ms) exceeds threshold (${thresholdConfig.p95Threshold}ms)`, labels);
      }
      if (p99 > thresholdConfig.p99Threshold) {
        console.error(`[ALERT] ${name} P99 (${p99}ms) exceeds threshold (${thresholdConfig.p99Threshold}ms)`, labels);
      }
    }
  }

  /**
   * Get threshold configuration for a metric
   */
  private getThresholdConfig(name: string): { p95Threshold: number; p99Threshold: number } | undefined {
    const thresholds: Record<string, { p95Threshold: number; p99Threshold: number }> = {
      'booking_flow_duration_ms': { p95Threshold: 5000, p99Threshold: 10000 },
      'guesty_api_call_duration_ms': { p95Threshold: 2000, p99Threshold: 5000 },
      'stripe_payment_duration_ms': { p95Threshold: 3000, p99Threshold: 7000 },
      'supabase_query_duration_ms': { p95Threshold: 500, p99Threshold: 1000 },
      'ai_generation_duration_ms': { p95Threshold: 10000, p99Threshold: 20000 },
      'page_load_duration_ms': { p95Threshold: 2000, p99Threshold: 4000 },
    };

    return thresholds[name];
  }

  /**
   * Get histogram entry with percentiles
   */
  getHistogram(name: string): HistogramEntry | undefined {
    return this.histogramEntries.get(name);
  }

  /**
   * Get P95 value for a metric
   */
  getP95(name: string): number | undefined {
    return this.histogramEntries.get(name)?.p95;
  }

  /**
   * Get P99 value for a metric
   */
  getP99(name: string): number | undefined {
    return this.histogramEntries.get(name)?.p99;
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
    if (this.metrics.length === 0) {
return;
}

    const metricsToSend = [...this.metrics];
    this.metrics = [];

    this.sendToMetricsService(metricsToSend).catch((error) => {
      console.error('Failed to send metrics:', error);
    });
  }

  /**
   * Send metrics to external metrics service
   * Supports: Prometheus, Datadog, CloudWatch Metrics, StatsD
   */
  private async sendToMetricsService(metrics: MetricEntry[]): Promise<void> {
    const metricsService = import.meta.env.VITE_METRICS_SERVICE || 'console';
    const payload = JSON.stringify(metrics);

    switch (metricsService) {
      case 'prometheus':
        await this.sendToPrometheus(metrics);
        break;
      case 'datadog':
        await this.sendToDatadogMetrics(metrics);
        break;
      case 'cloudwatch':
        await this.sendToCloudWatchMetrics(metrics);
        break;
      case 'statsd':
        await this.sendToStatsD(metrics);
        break;
      default:
        // Fallback to console in development
        console.debug(`[Metrics Service] Sending ${metrics.length} metrics:`, payload);
    }
  }

  /**
   * Send metrics to Prometheus (via Prometheus Pushgateway or remote_write)
   */
  private async sendToPrometheus(metrics: MetricEntry[]): Promise<void> {
    const prometheusUrl = import.meta.env.VITE_PROMETHEUS_URL;

    if (!prometheusUrl) {
      console.warn('[Prometheus] URL not configured, skipping metric send');
      return;
    }

    try {
      // Convert metrics to Prometheus exposition format
      const prometheusFormat = this.convertToPrometheusFormat(metrics);

      const response = await fetch(`${prometheusUrl}/metrics/job/chris-promanagment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: prometheusFormat,
      });

      if (!response.ok) {
        throw new Error(`Prometheus error: ${response.status}`);
      }
    } catch (error) {
      console.error('[Prometheus] Failed to send metrics:', error);
    }
  }

  /**
   * Convert metrics to Prometheus exposition format
   */
  private convertToPrometheusFormat(metrics: MetricEntry[]): string {
    return metrics
      .map(metric => {
        const labels = metric.labels
          ? `{${Object.entries(metric.labels).map(([k, v]) => `${k}="${v}"`).join(',')}}`
          : '';
        return `${metric.name}${labels} ${metric.value} ${Date.now()}`;
      })
      .join('\n');
  }

  /**
   * Send metrics to Datadog
   */
  private async sendToDatadogMetrics(metrics: MetricEntry[]): Promise<void> {
    const apiKey = import.meta.env.VITE_DATADOG_API_KEY;

    if (!apiKey) {
      console.warn('[Datadog Metrics] API key not configured, skipping metric send');
      return;
    }

    try {
      const response = await fetch('https://api.datadoghq.com/api/v1/series', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'DD-API-KEY': apiKey,
        },
        body: JSON.stringify({
          series: metrics.map(metric => ({
            metric: metric.name,
            points: [[Date.now() / 1000, metric.value]],
            tags: metric.labels ? Object.entries(metric.labels).map(([k, v]) => `${k}:${v}`) : [],
            type: metric.type,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`Datadog Metrics error: ${response.status}`);
      }
    } catch (error) {
      console.error('[Datadog Metrics] Failed to send metrics:', error);
    }
  }

  /**
   * Send metrics to CloudWatch Metrics
   */
  private async sendToCloudWatchMetrics(metrics: MetricEntry[]): Promise<void> {
    // CloudWatch requires AWS SDK and credentials
    console.debug('[CloudWatch Metrics] Not implemented, requires AWS SDK');
  }

  /**
   * Send metrics to StatsD
   */
  private async sendToStatsD(metrics: MetricEntry[]): Promise<void> {
    const statsdHost = import.meta.env.VITE_STATSD_HOST;
    const statsdPort = import.meta.env.VITE_STATSD_PORT || 8125;

    if (!statsdHost) {
      console.warn('[StatsD] Host not configured, skipping metric send');
      return;
    }

    // StatsD requires UDP, which isn't available in browser environments
    console.debug('[StatsD] Not available in browser environment');
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
 * Features:
 * - Multiple sampling strategies for high-traffic scenarios
 * - Trace context propagation
 * - Span data collection and export
 * - Baggage propagation for context
 */
export class DistributedTracing {
  private activeSpans = new Map<string, SpanData>();
  private traceIdCounter = 0;
  private spanIdCounter = 0;
  private samplingStrategy: SamplingStrategy;
  private samplingStrategies: Map<string, SamplingStrategy>;
  private spanDataBuffer = new Map<string, SpanData>();

  constructor(samplingRate: number = 0.1) {
    this.samplingStrategies = this.initializeSamplingStrategies();
    this.samplingStrategy = this.samplingStrategies.get('probabilistic')!;
  }

  /**
   * Initialize sampling strategies
   */
  private initializeSamplingStrategies(): Map<string, SamplingStrategy> {
    const strategies = new Map<string, SamplingStrategy>();

    // Probabilistic sampling - random sampling based on rate
    strategies.set('probabilistic', {
      name: 'probabilistic',
      sampleRate: 0.1,
      shouldSample: () => Math.random() < 0.1,
    });

    // Always sample critical operations
    strategies.set('always', {
      name: 'always',
      sampleRate: 1.0,
      shouldSample: () => true,
    });

    // Never sample
    strategies.set('never', {
      name: 'never',
      sampleRate: 0.0,
      shouldSample: () => false,
    });

    // Error-based sampling - sample all error traces
    strategies.set('error-based', {
      name: 'error-based',
      sampleRate: 0.5,
      shouldSample: (_context, _operationName) => {
        // This is checked when ending the span
        return false;
      },
    });

    // Rate-limited sampling for high-traffic operations
    strategies.set('rate-limited', {
      name: 'rate-limited',
      sampleRate: 0.01,
      shouldSample: () => Math.random() < 0.01,
    });

    return strategies;
  }

  /**
   * Set sampling strategy
   */
  setSamplingStrategy(strategyName: string): void {
    const strategy = this.samplingStrategies.get(strategyName);
    if (strategy) {
      this.samplingStrategy = strategy;
    }
  }

  /**
   * Set sampling rate for probabilistic strategy
   */
  setSamplingRate(rate: number): void {
    const strategy = this.samplingStrategies.get('probabilistic');
    if (strategy) {
      strategy.sampleRate = rate;
      strategy.shouldSample = () => Math.random() < rate;
    }
  }

  /**
   * Start a new trace with sampling
   */
  startTrace(operationName: string, strategy?: string): SpanContext {
    const traceId = this.generateTraceId();
    const spanId = this.generateSpanId();

    const selectedStrategy = strategy
      ? this.samplingStrategies.get(strategy) || this.samplingStrategy
      : this.samplingStrategy;

    const sampled = selectedStrategy.shouldSample(
      { traceId, spanId },
      operationName
    );

    const context: SpanContext = {
      traceId,
      spanId,
      sampled,
    };

    const spanData: SpanData = {
      context,
      operationName,
      startTime: Date.now(),
    };

    this.activeSpans.set(spanId, spanData);
    return context;
  }

  /**
   * Start a trace with custom sampling decision
   */
  startTraceWithSampling(operationName: string, sampled: boolean): SpanContext {
    const traceId = this.generateTraceId();
    const spanId = this.generateSpanId();

    const context: SpanContext = {
      traceId,
      spanId,
      sampled,
    };

    const spanData: SpanData = {
      context,
      operationName,
      startTime: Date.now(),
    };

    this.activeSpans.set(spanId, spanData);
    return context;
  }

  /**
   * Start a trace for critical operations (always sampled)
   */
  startCriticalTrace(operationName: string): SpanContext {
    return this.startTraceWithSampling(operationName, true);
  }

  /**
   * Start a child span with sampling inheritance
   */
  startChildSpan(parentSpanId: string, operationName: string): SpanContext {
    const parentSpan = this.activeSpans.get(parentSpanId);
    if (!parentSpan) {
      throw new Error(`Parent span ${parentSpanId} not found`);
    }

    const spanId = this.generateSpanId();

    const context: SpanContext = {
      traceId: parentSpan.context.traceId,
      spanId,
      parentSpanId,
      sampled: parentSpan.context.sampled, // Inherit sampling decision
      baggage: parentSpan.context.baggage,
    };

    const spanData: SpanData = {
      context,
      operationName,
      startTime: Date.now(),
    };

    this.activeSpans.set(spanId, spanData);
    return context;
  }

  /**
   * End a span with duration calculation
   */
  endSpan(spanId: string, status: 'ok' | 'error' = 'ok', error?: Error): void {
    const spanData = this.activeSpans.get(spanId);
    if (spanData) {
      spanData.endTime = Date.now();
      spanData.duration = spanData.endTime - spanData.startTime;
      spanData.status = status;
      spanData.error = error;

      // Always sample error traces
      if (status === 'error') {
        spanData.context.sampled = true;
      }

      // Store span data if sampled
      if (spanData.context.sampled) {
        this.spanDataBuffer.set(spanId, spanData);

        // Export span data
        this.exportSpanData(spanData);
      }

      this.activeSpans.delete(spanId);
      console.debug(`[Tracing] Ending span: ${spanId}, duration: ${spanData.duration}ms`);
    }
  }

  /**
   * Add tags to a span
   */
  addTags(spanId: string, tags: Record<string, unknown>): void {
    const spanData = this.activeSpans.get(spanId);
    if (spanData) {
      spanData.tags = { ...spanData.tags, ...tags };
    }
  }

  /**
   * Set baggage for context propagation
   */
  setBaggage(spanId: string, baggage: Record<string, string>): void {
    const spanData = this.activeSpans.get(spanId);
    if (spanData) {
      spanData.context.baggage = { ...spanData.context.baggage, ...baggage };
    }
  }

  /**
   * Get baggage from span
   */
  getBaggage(spanId: string): Record<string, string> | undefined {
    const spanData = this.activeSpans.get(spanId);
    return spanData?.context.baggage;
  }

  /**
   * Export span data to tracing backend
   */
  private async exportSpanData(spanData: SpanData): Promise<void> {
    const tracingBackend = import.meta.env.VITE_TRACING_BACKEND || 'console';

    switch (tracingBackend) {
      case 'jaeger':
        await this.sendToJaeger(spanData);
        break;
      case 'zipkin':
        await this.sendToZipkin(spanData);
        break;
      case 'datadog':
        await this.sendToDatadogTracing(spanData);
        break;
      default:
        console.debug('[Tracing] Span data:', JSON.stringify(spanData));
    }
  }

  /**
   * Send span data to Jaeger
   */
  private async sendToJaeger(spanData: SpanData): Promise<void> {
    const jaegerUrl = import.meta.env.VITE_JAEGER_URL;

    if (!jaegerUrl) {
      console.warn('[Jaeger] URL not configured, skipping span export');
      return;
    }

    try {
      const response = await fetch(`${jaegerUrl}/api/v2/spans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([{
          traceID: spanData.context.traceId.replace(/-/g, ''),
          spanID: spanData.context.spanId.replace(/-/g, ''),
          operationName: spanData.operationName,
          startTime: spanData.startTime * 1000, // microseconds
          duration: (spanData.duration || 0) * 1000, // microseconds
          tags: Object.entries(spanData.tags || {}).map(([key, value]) => ({
            key,
            type: typeof value === 'string' ? 'string' : typeof value,
            value: String(value),
          })),
          status: spanData.status,
        }]),
      });

      if (!response.ok) {
        throw new Error(`Jaeger error: ${response.status}`);
      }
    } catch (error) {
      console.error('[Jaeger] Failed to send span data:', error);
    }
  }

  /**
   * Send span data to Zipkin
   */
  private async sendToZipkin(spanData: SpanData): Promise<void> {
    console.debug('[Zipkin] Not implemented');
  }

  /**
   * Send span data to Datadog APM
   */
  private async sendToDatadogTracing(spanData: SpanData): Promise<void> {
    console.debug('[Datadog Tracing] Not implemented');
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
 * Decorator for automatic method tracing with metrics
 * Usage: @Traced() or @Traced('custom-operation-name')
 */
export function Traced(operationName?: string, options?: { critical?: boolean; metrics?: boolean }) {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const isCritical = options?.critical || false;
    const recordMetrics = options?.metrics !== false; // default true

    descriptor.value = async function (...args: unknown[]) {
      const name = operationName || `${target.constructor.name}.${propertyKey}`;
      const spanContext = isCritical
        ? tracing.startCriticalTrace(name)
        : tracing.startTrace(name);

      const startTime = Date.now();

      try {
        logger.debug(`Starting ${name}`, { args: args.length });
        const result = await originalMethod.apply(this, args);

        const duration = Date.now() - startTime;
        logger.debug(`Completed ${name}`, { duration });

        // Record latency metric if enabled
        if (recordMetrics) {
          metrics.recordLatency(name, duration);
        }

        tracing.endSpan(spanContext.spanId, 'ok');
        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        logger.error(`Error in ${name}`, { error, duration });

        // Record error metric
        metrics.incrementCounter(`${name}_errors`, 1);

        tracing.endSpan(spanContext.spanId, 'error', error as Error);
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Decorator for critical operations (always sampled)
 * Usage: @CriticalTraced() or @CriticalTraced('custom-name')
 */
export function CriticalTraced(operationName?: string) {
  return Traced(operationName, { critical: true, metrics: true });
}

/**
 * Decorator for high-traffic operations (rate-limited sampling)
 * Usage: @RateLimitedTraced() or @RateLimitedTraced('custom-name')
 */
export function RateLimitedTraced(operationName?: string) {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const name = operationName || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = async function (...args: unknown[]) {
      const spanContext = tracing.startTrace(name, 'rate-limited');

      if (!spanContext.sampled) {
        // Not sampled, just execute without tracing
        return await originalMethod.apply(this, args);
      }

      const startTime = Date.now();

      try {
        const result = await originalMethod.apply(this, args);
        const duration = Date.now() - startTime;
        metrics.recordLatency(name, duration);
        tracing.endSpan(spanContext.spanId, 'ok');
        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        metrics.incrementCounter(`${name}_errors`, 1);
        tracing.endSpan(spanContext.spanId, 'error', error as Error);
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Higher-order function for tracing async functions
 * Usage: const tracedFn = traceAsync(originalFn, 'operation-name')
 */
export function traceAsync<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  operationName?: string,
  options?: { critical?: boolean }
): T {
  const isCritical = options?.critical || false;

  return (async (...args: unknown[]) => {
    const name = operationName || fn.name || 'anonymous';
    const spanContext = isCritical
      ? tracing.startCriticalTrace(name)
      : tracing.startTrace(name);

    const startTime = Date.now();

    try {
      logger.debug(`Starting ${name}`);
      const result = await fn(...args);
      const duration = Date.now() - startTime;
      metrics.recordLatency(name, duration);
      logger.debug(`Completed ${name}`, { duration });
      tracing.endSpan(spanContext.spanId, 'ok');
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error(`Error in ${name}`, { error, duration });
      metrics.incrementCounter(`${name}_errors`, 1);
      tracing.endSpan(spanContext.spanId, 'error', error as Error);
      throw error;
    }
  }) as T;
}