/**
 * Comprehensive Error Handling and Recovery System for Guesty Integration
 * 
 * Provides error classification, retry strategies, and automatic recovery mechanisms
 * for Guesty API operations.
 * 
 * Features:
 * - Error classification (transient, permanent, business logic)
 * - Automatic retry with exponential backoff
 * - Circuit breaker integration
 * - Fallback strategies
 * - Dead letter queue for unrecoverable errors
 * - Error aggregation and reporting
 * 
 * @version 1.0.0
 */

import { logger } from '@/lib/logger';

// Error types
export enum ErrorType {
  TRANSIENT = 'transient',           // Temporary failures (network, rate limits)
  PERMANENT = 'permanent',           // Permanent failures (invalid data, auth)
  BUSINESS_LOGIC = 'business_logic', // Business logic errors (no availability)
  SYSTEM = 'system',                 // System errors (configuration, environment)
  UNKNOWN = 'unknown',               // Unclassified errors
}

// Error severity
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Recovery strategies
export enum RecoveryStrategy {
  RETRY = 'retry',                   // Retry with exponential backoff
  CIRCUIT_BREAKER = 'circuit_breaker', // Open circuit breaker
  FALLBACK = 'fallback',             // Use fallback mechanism
  DEAD_LETTER = 'dead_letter',       // Send to dead letter queue
  IGNORE = 'ignore',                 // Ignore error (non-critical)
  MANUAL = 'manual',                 // Require manual intervention
}

export interface ErrorContext {
  operation: string;
  correlationId: string;
  timestamp: string;
  params?: Record<string, unknown>;
  userId?: string;
  requestId?: string;
}

export interface ClassifiedError {
  originalError: Error;
  type: ErrorType;
  severity: ErrorSeverity;
  strategy: RecoveryStrategy;
  context: ErrorContext;
  retryable: boolean;
  maxRetries: number;
  canRecover: boolean;
  message: string;
}

export interface RecoveryResult {
  success: boolean;
  recovered: boolean;
  strategy?: RecoveryStrategy;
  attempts: number;
  finalError?: Error;
  data?: unknown;
}

/**
 * Error Classifier - determines error type and appropriate recovery strategy
 */
export class ErrorClassifier {
  private static readonly TRANSIENT_PATTERNS = [
    /timeout/i,
    /network/i,
    /connection/i,
    /ECONNRESET/i,
    /ETIMEDOUT/i,
    /rate limit/i,
    /429/i,
    /502/i,
    /503/i,
    /504/i,
    /too many requests/i,
    /service unavailable/i,
  ];

  private static readonly PERMANENT_PATTERNS = [
    /unauthorized/i,
    /401/i,
    /403/i,
    /404/i,
    /invalid/i,
    /not found/i,
    /authentication/i,
    /forbidden/i,
  ];

  private static readonly BUSINESS_LOGIC_PATTERNS = [
    /availability/i,
    /fully booked/i,
    /no availability/i,
    /invalid dates/i,
    /minimum stay/i,
    /maximum stay/i,
  ];

  static classify(error: Error, context: ErrorContext): ClassifiedError {
    const message = error.message.toLowerCase();
    
    // Check for transient errors
    if (this.TRANSIENT_PATTERNS.some(pattern => pattern.test(message))) {
      return {
        originalError: error,
        type: ErrorType.TRANSIENT,
        severity: ErrorSeverity.MEDIUM,
        strategy: RecoveryStrategy.RETRY,
        context,
        retryable: true,
        maxRetries: 5,
        canRecover: true,
        message: error.message,
      };
    }

    // Check for permanent errors
    if (this.PERMANENT_PATTERNS.some(pattern => pattern.test(message))) {
      return {
        originalError: error,
        type: ErrorType.PERMANENT,
        severity: ErrorSeverity.HIGH,
        strategy: RecoveryStrategy.MANUAL,
        context,
        retryable: false,
        maxRetries: 0,
        canRecover: false,
        message: error.message,
      };
    }

    // Check for business logic errors
    if (this.BUSINESS_LOGIC_PATTERNS.some(pattern => pattern.test(message))) {
      return {
        originalError: error,
        type: ErrorType.BUSINESS_LOGIC,
        severity: ErrorSeverity.LOW,
        strategy: RecoveryStrategy.IGNORE,
        context,
        retryable: false,
        maxRetries: 0,
        canRecover: false,
        message: error.message,
      };
    }

    // Default to unknown
    return {
      originalError: error,
      type: ErrorType.UNKNOWN,
      severity: ErrorSeverity.MEDIUM,
      strategy: RecoveryStrategy.RETRY,
      context,
      retryable: true,
      maxRetries: 3,
      canRecover: true,
      message: error.message,
    };
  }
}

/**
 * Retry Configuration
 */
export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  jitter: boolean;
}

/**
 * Error Recovery Handler - executes recovery strategies
 */
export class ErrorRecoveryHandler {
  private static readonly DEFAULT_RETRY_CONFIG: RetryConfig = {
    maxRetries: 5,
    baseDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2,
    jitter: true,
  };

  /**
   * Attempt to recover from an error using the classified strategy
   */
  async recover(
    classifiedError: ClassifiedError,
    retryFn?: () => Promise<unknown>,
    fallbackFn?: () => Promise<unknown>
  ): Promise<RecoveryResult> {
    const { strategy, retryable, maxRetries, context } = classifiedError;

    logger.info('Error recovery initiated', {
      strategy,
      retryable,
      maxRetries,
      operation: context.operation,
      correlationId: context.correlationId,
    });

    switch (strategy) {
      case RecoveryStrategy.RETRY:
        if (!retryFn) {
          return {
            success: false,
            recovered: false,
            strategy,
            attempts: 0,
            finalError: new Error('Retry function not provided'),
          };
        }
        return this.retryWithBackoff(retryFn, maxRetries, context);

      case RecoveryStrategy.FALLBACK:
        if (!fallbackFn) {
          return {
            success: false,
            recovered: false,
            strategy,
            attempts: 0,
            finalError: new Error('Fallback function not provided'),
          };
        }
        return this.executeFallback(fallbackFn, context);

      case RecoveryStrategy.CIRCUIT_BREAKER:
        return this.handleCircuitBreaker(classifiedError);

      case RecoveryStrategy.DEAD_LETTER:
        return this.sendToDeadLetter(classifiedError);

      case RecoveryStrategy.IGNORE:
        return {
          success: true,
          recovered: true,
          strategy,
          attempts: 0,
        };

      case RecoveryStrategy.MANUAL:
        return this.requestManualIntervention(classifiedError);

      default:
        return {
          success: false,
          recovered: false,
          attempts: 0,
          finalError: new Error('Unknown recovery strategy'),
        };
    }
  }

  /**
   * Retry with exponential backoff
   */
  private async retryWithBackoff(
    fn: () => Promise<unknown>,
    maxRetries: number,
    context: ErrorContext
  ): Promise<RecoveryResult> {
    const config = this.DEFAULT_RETRY_CONFIG;
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.info('Retry attempt', {
          attempt,
          maxRetries,
          operation: context.operation,
          correlationId: context.correlationId,
        });

        const result = await fn();

        logger.info('Retry successful', {
          attempt,
          operation: context.operation,
          correlationId: context.correlationId,
        });

        return {
          success: true,
          recovered: true,
          strategy: RecoveryStrategy.RETRY,
          attempts: attempt,
          data: result,
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        logger.warn('Retry attempt failed', {
          attempt,
          maxRetries,
          error: lastError.message,
          operation: context.operation,
          correlationId: context.correlationId,
        });

        if (attempt < maxRetries) {
          const delay = this.calculateBackoff(attempt, config);
          logger.info('Waiting before retry', {
            delay,
            attempt,
            operation: context.operation,
          });
          await this.sleep(delay);
        }
      }
    }

    return {
      success: false,
      recovered: false,
      strategy: RecoveryStrategy.RETRY,
      attempts: maxRetries,
      finalError: lastError,
    };
  }

  /**
   * Calculate exponential backoff delay with jitter
   */
  private calculateBackoff(attempt: number, config: RetryConfig): number {
    const exponentialDelay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1);
    const jitter = config.jitter ? Math.random() * config.baseDelay : 0;
    return Math.min(exponentialDelay + jitter, config.maxDelay);
  }

  /**
   * Execute fallback function
   */
  private async executeFallback(
    fallbackFn: () => Promise<unknown>,
    context: ErrorContext
  ): Promise<RecoveryResult> {
    try {
      logger.info('Executing fallback', {
        operation: context.operation,
        correlationId: context.correlationId,
      });

      const result = await fallbackFn();

      logger.info('Fallback successful', {
        operation: context.operation,
        correlationId: context.correlationId,
      });

      return {
        success: true,
        recovered: true,
        strategy: RecoveryStrategy.FALLBACK,
        attempts: 1,
        data: result,
      };
    } catch (error) {
      logger.error('Fallback failed', {
        operation: context.operation,
        correlationId: context.correlationId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      return {
        success: false,
        recovered: false,
        strategy: RecoveryStrategy.FALLBACK,
        attempts: 1,
        finalError: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Handle circuit breaker scenario
   */
  private async handleCircuitBreaker(error: ClassifiedError): Promise<RecoveryResult> {
    logger.error('Circuit breaker triggered', {
      operation: error.context.operation,
      correlationId: error.context.correlationId,
      error: error.message,
    });

    // Send alert or notification
    await this.sendAlert(error);

    return {
      success: false,
      recovered: false,
      strategy: RecoveryStrategy.CIRCUIT_BREAKER,
      attempts: 0,
      finalError: error.originalError,
    };
  }

  /**
   * Send error to dead letter queue
   */
  private async sendToDeadLetter(error: ClassifiedError): Promise<RecoveryResult> {
    logger.error('Sending to dead letter queue', {
      operation: error.context.operation,
      correlationId: error.context.correlationId,
      error: error.message,
    });

    // Store in dead letter queue table
    // This would require a database table for dead letter queue
    // For now, just log the error

    return {
      success: false,
      recovered: false,
      strategy: RecoveryStrategy.DEAD_LETTER,
      attempts: 0,
      finalError: error.originalError,
    };
  }

  /**
   * Request manual intervention
   */
  private async requestManualIntervention(error: ClassifiedError): Promise<RecoveryResult> {
    logger.error('Manual intervention required', {
      operation: error.context.operation,
      correlationId: error.context.correlationId,
      error: error.message,
      severity: error.severity,
    });

    // Send notification to operations team
    await this.sendAlert(error);

    return {
      success: false,
      recovered: false,
      strategy: RecoveryStrategy.MANUAL,
      attempts: 0,
      finalError: error.originalError,
    };
  }

  /**
   * Send alert for critical errors
   */
  private async sendAlert(error: ClassifiedError): Promise<void> {
    // This would integrate with an alerting system
    // For now, just log at error level
    logger.error('CRITICAL ERROR ALERT', {
      operation: error.context.operation,
      correlationId: error.context.correlationId,
      error: error.message,
      severity: error.severity,
      type: error.type,
      timestamp: error.context.timestamp,
    });
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Error Handler Wrapper - provides automatic error classification and recovery
 */
export class ErrorHandler {
  private recoveryHandler: ErrorRecoveryHandler;

  constructor() {
    this.recoveryHandler = new ErrorRecoveryHandler();
  }

  /**
   * Execute operation with automatic error handling and recovery
   */
  async executeWithErrorHandling<T>(
    operation: string,
    fn: () => Promise<T>,
    context: Partial<ErrorContext> = {},
    options: {
      retryFn?: () => Promise<T>;
      fallbackFn?: () => Promise<T>;
      skipRecovery?: boolean;
    } = {}
  ): Promise<T> {
    const fullContext: ErrorContext = {
      operation,
      correlationId: context.correlationId || crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      params: context.params,
      userId: context.userId,
      requestId: context.requestId,
    };

    try {
      logger.info('Executing operation', {
        operation,
        correlationId: fullContext.correlationId,
      });

      const result = await fn();

      logger.info('Operation completed successfully', {
        operation,
        correlationId: fullContext.correlationId,
      });

      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));

      logger.error('Operation failed', {
        operation,
        correlationId: fullContext.correlationId,
        error: err.message,
      });

      if (options.skipRecovery) {
        throw err;
      }

      // Classify the error
      const classifiedError = ErrorClassifier.classify(err, fullContext);

      // Attempt recovery
      const recoveryResult = await this.recoveryHandler.recover(
        classifiedError,
        options.retryFn,
        options.fallbackFn
      );

      if (recoveryResult.recovered) {
        logger.info('Error recovered successfully', {
          operation,
          correlationId: fullContext.correlationId,
          strategy: recoveryResult.strategy,
          attempts: recoveryResult.attempts,
        });

        return recoveryResult.data as T;
      }

      logger.error('Error recovery failed', {
        operation,
        correlationId: fullContext.correlationId,
        strategy: recoveryResult.strategy,
        attempts: recoveryResult.attempts,
        finalError: recoveryResult.finalError?.message,
      });

      throw recoveryResult.finalError || err;
    }
  }
}

// Singleton instance
export const errorHandler = new ErrorHandler();

// Decorator for automatic error handling
export function withErrorHandling(options: {
  retryFn?: string;
  fallbackFn?: string;
  skipRecovery?: boolean;
} = {}) {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      return errorHandler.executeWithErrorHandling(
        propertyKey,
        () => originalMethod.apply(this, args),
        {},
        options
      );
    };

    return descriptor;
  };
}
