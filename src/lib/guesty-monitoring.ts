/**
 * Guesty Monitoring Service
 * 
 * Monitors data consistency, API performance, booking flow, and errors
 * Provides metrics collection and alerting
 * Integrates with existing monitoring infrastructure
 * 
 * Features:
 * - Data consistency monitoring
 * - API performance tracking
 * - Booking flow monitoring
 * - Error monitoring and alerting
 * - Metrics aggregation and reporting
 * 
 * @author Development Team
 * @version 1.0.0
 */

import { logger } from '@/lib/logger';

// =============================================
// Metrics Types
// =============================================

export interface DataConsistencyMetrics {
  cacheHitRate: number;
  cacheStalenessDuration: number;
  syncFailureRate: number;
  dataInconsistencyCount: number;
  webhookProcessingLatency: number;
  lastSyncTime: Date | null;
}

export interface APIPerformanceMetrics {
  responseTimeByEndpoint: Map<string, number[]>;
  rateLimitHitRate: number;
  tokenRefreshFrequency: number;
  circuitBreakerStateChanges: number;
  requestQueueDepth: number;
  totalRequests: number;
  failedRequests: number;
}

export interface BookingFlowMetrics {
  quoteCreationRate: number;
  quoteToReservationConversionRate: number;
  paymentSuccessRate: number;
  bookingConflictRate: number;
  couponApplicationRate: number;
  averageBookingTime: number;
}

export interface ErrorMetrics {
  apiErrorRateByEndpoint: Map<string, number>;
  errorTypeDistribution: Map<string, number>;
  errorRecoveryRate: number;
  userFacingErrorRate: number;
  totalErrors: number;
}

export interface MonitoringAlert {
  id: string;
  type: 'data_consistency' | 'api_performance' | 'booking_flow' | 'error';
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  timestamp: Date;
  metrics?: Record<string, unknown>;
  resolved: boolean;
}

// =============================================
// Alert Thresholds
// =============================================

const ALERT_THRESHOLDS = {
  cacheHitRate: 0.8, // Alert if below 80%
  syncFailureRate: 0.05, // Alert if above 5%
  dataInconsistencyDetected: true, // Always alert on inconsistency
  webhookProcessingLatency: 30000, // Alert if above 30s
  responseTime: 5000, // Alert if above 5s (p95)
  rateLimitHitRate: 0.1, // Alert if above 10%
  circuitBreakerOpen: true, // Always alert on circuit breaker open
  conversionRate: 0.5, // Alert if below 50%
  paymentFailureRate: 0.1, // Alert if above 10%
  errorRate: 0.05, // Alert if above 5%
  errorRecoveryRate: 0.8, // Alert if below 80%
};

// =============================================
// Monitoring Service
// =============================================

export class GuestyMonitoringService {
  private dataConsistencyMetrics: DataConsistencyMetrics = {
    cacheHitRate: 1.0,
    cacheStalenessDuration: 0,
    syncFailureRate: 0,
    dataInconsistencyCount: 0,
    webhookProcessingLatency: 0,
    lastSyncTime: null,
  };

  private apiPerformanceMetrics: APIPerformanceMetrics = {
    responseTimeByEndpoint: new Map(),
    rateLimitHitRate: 0,
    tokenRefreshFrequency: 0,
    circuitBreakerStateChanges: 0,
    requestQueueDepth: 0,
    totalRequests: 0,
    failedRequests: 0,
  };

  private bookingFlowMetrics: BookingFlowMetrics = {
    quoteCreationRate: 0,
    quoteToReservationConversionRate: 0,
    paymentSuccessRate: 0,
    bookingConflictRate: 0,
    couponApplicationRate: 0,
    averageBookingTime: 0,
  };

  private errorMetrics: ErrorMetrics = {
    apiErrorRateByEndpoint: new Map(),
    errorTypeDistribution: new Map(),
    errorRecoveryRate: 1.0,
    userFacingErrorRate: 0,
    totalErrors: 0,
  };

  private alerts: MonitoringAlert[] = [];
  private metricsHistory: Array<{
    timestamp: Date;
    dataConsistency: DataConsistencyMetrics;
    apiPerformance: APIPerformanceMetrics;
    bookingFlow: BookingFlowMetrics;
    errorMetrics: ErrorMetrics;
  }> = [];

  // =============================================
  // Data Consistency Monitoring
  // =============================================

  recordCacheHit(hit: boolean): void {
    this.updateCacheHitRate(hit);
  }

  recordSyncFailure(): void {
    this.dataConsistencyMetrics.syncFailureRate += 1;
    this.checkAlerts('data_consistency');
  }

  recordDataInconsistency(): void {
    this.dataConsistencyMetrics.dataInconsistencyCount += 1;
    this.createAlert({
      type: 'data_consistency',
      severity: 'critical',
      message: 'Data inconsistency detected',
      metrics: { inconsistencyCount: this.dataConsistencyMetrics.dataInconsistencyCount },
    });
  }

  recordWebhookLatency(latency: number): void {
    this.dataConsistencyMetrics.webhookProcessingLatency = latency;
    this.checkAlerts('data_consistency');
  }

  recordSyncSuccess(): void {
    this.dataConsistencyMetrics.lastSyncTime = new Date();
    this.dataConsistencyMetrics.syncFailureRate = 0;
  }

  private updateCacheHitRate(hit: boolean): void {
    const currentRate = this.dataConsistencyMetrics.cacheHitRate;
    const alpha = 0.1; // Smoothing factor
    this.dataConsistencyMetrics.cacheHitRate = alpha * (hit ? 1 : 0) + (1 - alpha) * currentRate;
    this.checkAlerts('data_consistency');
  }

  // =============================================
  // API Performance Monitoring
  // =============================================

  recordAPIRequest(endpoint: string, responseTime: number, success: boolean): void {
    this.apiPerformanceMetrics.totalRequests++;
    
    if (!success) {
      this.apiPerformanceMetrics.failedRequests++;
      this.recordAPIError(endpoint, 'api_error');
    }

    // Track response time by endpoint
    const times = this.apiPerformanceMetrics.responseTimeByEndpoint.get(endpoint) || [];
    times.push(responseTime);
    // Keep only last 100 measurements
    if (times.length > 100) {
times.shift();
}
    this.apiPerformanceMetrics.responseTimeByEndpoint.set(endpoint, times);

    this.checkAlerts('api_performance');
  }

  recordRateLimitHit(): void {
    this.apiPerformanceMetrics.rateLimitHitRate += 0.01;
    this.checkAlerts('api_performance');
  }

  recordTokenRefresh(): void {
    this.apiPerformanceMetrics.tokenRefreshFrequency += 1;
  }

  recordCircuitBreakerChange(): void {
    this.apiPerformanceMetrics.circuitBreakerStateChanges += 1;
    this.createAlert({
      type: 'api_performance',
      severity: 'warning',
      message: 'Circuit breaker state changed',
      metrics: {
        stateChanges: this.apiPerformanceMetrics.circuitBreakerStateChanges,
      },
    });
  }

  recordRequestQueueDepth(depth: number): void {
    this.apiPerformanceMetrics.requestQueueDepth = depth;
  }

  // =============================================
  // Booking Flow Monitoring
  // =============================================

  recordQuoteCreation(): void {
    this.bookingFlowMetrics.quoteCreationRate += 1;
  }

  recordQuoteToReservation(success: boolean): void {
    const conversions = success ? 1 : 0;
    const alpha = 0.1;
    this.bookingFlowMetrics.quoteToReservationConversionRate = 
      alpha * conversions + (1 - alpha) * this.bookingFlowMetrics.quoteToReservationConversionRate;
    this.checkAlerts('booking_flow');
  }

  recordPayment(success: boolean): void {
    const alpha = 0.1;
    this.bookingFlowMetrics.paymentSuccessRate = 
      alpha * (success ? 1 : 0) + (1 - alpha) * this.bookingFlowMetrics.paymentSuccessRate;
    this.checkAlerts('booking_flow');
  }

  recordBookingConflict(): void {
    this.bookingFlowMetrics.bookingConflictRate += 1;
    this.createAlert({
      type: 'booking_flow',
      severity: 'error',
      message: 'Booking conflict detected',
      metrics: { conflictCount: this.bookingFlowMetrics.bookingConflictRate },
    });
  }

  recordCouponApplication(): void {
    this.bookingFlowMetrics.couponApplicationRate += 1;
  }

  recordBookingTime(duration: number): void {
    const alpha = 0.1;
    this.bookingFlowMetrics.averageBookingTime = 
      alpha * duration + (1 - alpha) * this.bookingFlowMetrics.averageBookingTime;
  }

  // =============================================
  // Error Monitoring
  // =============================================

  recordAPIError(endpoint: string, errorType: string): void {
    const errors = this.errorMetrics.apiErrorRateByEndpoint.get(endpoint) || 0;
    this.errorMetrics.apiErrorRateByEndpoint.set(endpoint, errors + 1);

    const typeCount = this.errorMetrics.errorTypeDistribution.get(errorType) || 0;
    this.errorMetrics.errorTypeDistribution.set(errorType, typeCount + 1);

    this.errorMetrics.totalErrors++;
    this.checkAlerts('error');
  }

  recordErrorRecovery(success: boolean): void {
    const alpha = 0.1;
    this.errorMetrics.errorRecoveryRate = 
      alpha * (success ? 1 : 0) + (1 - alpha) * this.errorMetrics.errorRecoveryRate;
    this.checkAlerts('error');
  }

  recordUserFacingError(): void {
    this.errorMetrics.userFacingErrorRate += 0.01;
    this.checkAlerts('error');
  }

  // =============================================
  // Alert Management
  // =============================================

  private checkAlerts(type: MonitoringAlert['type']): void {
    switch (type) {
      case 'data_consistency':
        this.checkDataConsistencyAlerts();
        break;
      case 'api_performance':
        this.checkAPIPerformanceAlerts();
        break;
      case 'booking_flow':
        this.checkBookingFlowAlerts();
        break;
      case 'error':
        this.checkErrorAlerts();
        break;
    }
  }

  private checkDataConsistencyAlerts(): void {
    const metrics = this.dataConsistencyMetrics;

    if (metrics.cacheHitRate < ALERT_THRESHOLDS.cacheHitRate) {
      this.createAlert({
        type: 'data_consistency',
        severity: 'warning',
        message: `Cache hit rate below threshold: ${metrics.cacheHitRate.toFixed(2)}`,
        metrics: { cacheHitRate: metrics.cacheHitRate },
      });
    }

    if (metrics.syncFailureRate > ALERT_THRESHOLDS.syncFailureRate) {
      this.createAlert({
        type: 'data_consistency',
        severity: 'error',
        message: `Sync failure rate above threshold: ${metrics.syncFailureRate.toFixed(2)}`,
        metrics: { syncFailureRate: metrics.syncFailureRate },
      });
    }

    if (metrics.webhookProcessingLatency > ALERT_THRESHOLDS.webhookProcessingLatency) {
      this.createAlert({
        type: 'data_consistency',
        severity: 'warning',
        message: `Webhook processing latency high: ${metrics.webhookProcessingLatency}ms`,
        metrics: { webhookProcessingLatency: metrics.webhookProcessingLatency },
      });
    }
  }

  private checkAPIPerformanceAlerts(): void {
    const metrics = this.apiPerformanceMetrics;

    // Check response times for each endpoint
    for (const [endpoint, times] of metrics.responseTimeByEndpoint.entries()) {
      if (times.length === 0) {
continue;
}
      
      const p95 = this.calculatePercentile(times, 95);
      if (p95 > ALERT_THRESHOLDS.responseTime) {
        this.createAlert({
          type: 'api_performance',
          severity: 'warning',
          message: `Response time p95 high for ${endpoint}: ${p95.toFixed(0)}ms`,
          metrics: { endpoint, p95 },
        });
      }
    }

    if (metrics.rateLimitHitRate > ALERT_THRESHOLDS.rateLimitHitRate) {
      this.createAlert({
        type: 'api_performance',
        severity: 'warning',
        message: `Rate limit hit rate above threshold: ${metrics.rateLimitHitRate.toFixed(2)}`,
        metrics: { rateLimitHitRate: metrics.rateLimitHitRate },
      });
    }
  }

  private checkBookingFlowAlerts(): void {
    const metrics = this.bookingFlowMetrics;

    if (metrics.quoteToReservationConversionRate < ALERT_THRESHOLDS.conversionRate) {
      this.createAlert({
        type: 'booking_flow',
        severity: 'warning',
        message: `Conversion rate below threshold: ${metrics.quoteToReservationConversionRate.toFixed(2)}`,
        metrics: { conversionRate: metrics.quoteToReservationConversionRate },
      });
    }

    const paymentFailureRate = 1 - metrics.paymentSuccessRate;
    if (paymentFailureRate > ALERT_THRESHOLDS.paymentFailureRate) {
      this.createAlert({
        type: 'booking_flow',
        severity: 'error',
        message: `Payment failure rate above threshold: ${paymentFailureRate.toFixed(2)}`,
        metrics: { paymentFailureRate },
      });
    }
  }

  private checkErrorAlerts(): void {
    const metrics = this.errorMetrics;

    // Calculate overall error rate
    const errorRate = metrics.totalErrors / Math.max(1, this.apiPerformanceMetrics.totalRequests);
    if (errorRate > ALERT_THRESHOLDS.errorRate) {
      this.createAlert({
        type: 'error',
        severity: 'error',
        message: `Error rate above threshold: ${errorRate.toFixed(2)}`,
        metrics: { errorRate },
      });
    }

    if (metrics.errorRecoveryRate < ALERT_THRESHOLDS.errorRecoveryRate) {
      this.createAlert({
        type: 'error',
        severity: 'warning',
        message: `Error recovery rate below threshold: ${metrics.errorRecoveryRate.toFixed(2)}`,
        metrics: { errorRecoveryRate: metrics.errorRecoveryRate },
      });
    }
  }

  private createAlert(alert: Omit<MonitoringAlert, 'id' | 'timestamp' | 'resolved'>): void {
    const newAlert: MonitoringAlert = {
      ...alert,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      resolved: false,
    };

    this.alerts.push(newAlert);
    logger.warn('Monitoring alert created', newAlert);

    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts.shift();
    }
  }

  // =============================================
  // Utilities
  // =============================================

  private calculatePercentile(values: number[], percentile: number): number {
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index] || 0;
  }

  // =============================================
  // Metrics Retrieval
  // =============================================

  getDataConsistencyMetrics(): DataConsistencyMetrics {
    return { ...this.dataConsistencyMetrics };
  }

  getAPIPerformanceMetrics(): APIPerformanceMetrics {
    return {
      responseTimeByEndpoint: new Map(this.apiPerformanceMetrics.responseTimeByEndpoint),
      rateLimitHitRate: this.apiPerformanceMetrics.rateLimitHitRate,
      tokenRefreshFrequency: this.apiPerformanceMetrics.tokenRefreshFrequency,
      circuitBreakerStateChanges: this.apiPerformanceMetrics.circuitBreakerStateChanges,
      requestQueueDepth: this.apiPerformanceMetrics.requestQueueDepth,
      totalRequests: this.apiPerformanceMetrics.totalRequests,
      failedRequests: this.apiPerformanceMetrics.failedRequests,
    };
  }

  getBookingFlowMetrics(): BookingFlowMetrics {
    return { ...this.bookingFlowMetrics };
  }

  getErrorMetrics(): ErrorMetrics {
    return {
      apiErrorRateByEndpoint: new Map(this.errorMetrics.apiErrorRateByEndpoint),
      errorTypeDistribution: new Map(this.errorMetrics.errorTypeDistribution),
      errorRecoveryRate: this.errorMetrics.errorRecoveryRate,
      userFacingErrorRate: this.errorMetrics.userFacingErrorRate,
      totalErrors: this.errorMetrics.totalErrors,
    };
  }

  getAlerts(resolved = false): MonitoringAlert[] {
    return this.alerts.filter(a => a.resolved === resolved);
  }

  getMetricsHistory(limit = 100): typeof this.metricsHistory {
    return this.metricsHistory.slice(-limit);
  }

  // =============================================
  // Metrics Snapshot
  // =============================================

  takeSnapshot(): void {
    const snapshot = {
      timestamp: new Date(),
      dataConsistency: { ...this.dataConsistencyMetrics },
      apiPerformance: {
        responseTimeByEndpoint: new Map(this.apiPerformanceMetrics.responseTimeByEndpoint),
        rateLimitHitRate: this.apiPerformanceMetrics.rateLimitHitRate,
        tokenRefreshFrequency: this.apiPerformanceMetrics.tokenRefreshFrequency,
        circuitBreakerStateChanges: this.apiPerformanceMetrics.circuitBreakerStateChanges,
        requestQueueDepth: this.apiPerformanceMetrics.requestQueueDepth,
        totalRequests: this.apiPerformanceMetrics.totalRequests,
        failedRequests: this.apiPerformanceMetrics.failedRequests,
      },
      bookingFlow: { ...this.bookingFlowMetrics },
      errorMetrics: {
        apiErrorRateByEndpoint: new Map(this.errorMetrics.apiErrorRateByEndpoint),
        errorTypeDistribution: new Map(this.errorMetrics.errorTypeDistribution),
        errorRecoveryRate: this.errorMetrics.errorRecoveryRate,
        userFacingErrorRate: this.errorMetrics.userFacingErrorRate,
        totalErrors: this.errorMetrics.totalErrors,
      },
    };

    this.metricsHistory.push(snapshot);

    // Keep only last 1000 snapshots
    if (this.metricsHistory.length > 1000) {
      this.metricsHistory.shift();
    }
  }

  // =============================================
  // Reset
  // =============================================

  reset(): void {
    this.dataConsistencyMetrics = {
      cacheHitRate: 1.0,
      cacheStalenessDuration: 0,
      syncFailureRate: 0,
      dataInconsistencyCount: 0,
      webhookProcessingLatency: 0,
      lastSyncTime: null,
    };

    this.apiPerformanceMetrics = {
      responseTimeByEndpoint: new Map(),
      rateLimitHitRate: 0,
      tokenRefreshFrequency: 0,
      circuitBreakerStateChanges: 0,
      requestQueueDepth: 0,
      totalRequests: 0,
      failedRequests: 0,
    };

    this.bookingFlowMetrics = {
      quoteCreationRate: 0,
      quoteToReservationConversionRate: 0,
      paymentSuccessRate: 0,
      bookingConflictRate: 0,
      couponApplicationRate: 0,
      averageBookingTime: 0,
    };

    this.errorMetrics = {
      apiErrorRateByEndpoint: new Map(),
      errorTypeDistribution: new Map(),
      errorRecoveryRate: 1.0,
      userFacingErrorRate: 0,
      totalErrors: 0,
    };

    this.alerts = [];
    this.metricsHistory = [];

    logger.info('Guesty monitoring service reset');
  }
}

// Singleton instance
export const guestyMonitoringService = new GuestyMonitoringService();

// Periodic snapshot every 5 minutes
setInterval(() => {
  guestyMonitoringService.takeSnapshot();
}, 5 * 60 * 1000);
