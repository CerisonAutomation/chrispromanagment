/**
 * Application initialization and configuration
 * Run this on app startup to set up global state
 */

import { configureLogger, logger } from '@/lib/error/logger';
import { ErrorSeverity } from '@/lib/error/types';

/**
 * Initialize the application
 */
export function initializeApp() {
  // Configure logger based on environment
  const logLevel = process.env.LOG_LEVEL as ErrorSeverity | undefined;
  const enableRemoteLogging = process.env.ENABLE_REMOTE_LOGGING === 'true';

  configureLogger({
    minLevel: logLevel || (process.env.NODE_ENV === 'production' 
      ? ErrorSeverity.ERROR 
      : ErrorSeverity.DEBUG),
    enableConsole: true,
    enableRemote: enableRemoteLogging,
    remoteUrl: process.env.REMOTE_LOGGING_URL,
    environment: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
  });

  // Log startup
  logger.info('Application initialized', {
    environment: process.env.NODE_ENV,
    nodeVersion: process.version,
    timestamp: new Date().toISOString(),
  });

  // Setup global error handlers
  setupGlobalErrorHandlers();

  // Setup process handlers
  setupProcessHandlers();
}

/**
 * Setup global error handlers for unhandled errors
 */
function setupGlobalErrorHandlers() {
  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
    const error = reason instanceof Error 
      ? reason 
      : new Error(String(reason));

    logger.critical(
      'Unhandled promise rejection',
      error,
      {
        promise: String(promise),
      }
    );
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (error: Error) => {
    logger.critical(
      'Uncaught exception',
      error,
      {
        fatal: true,
      }
    );

    // Exit process in production on uncaught exception
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  });
}

/**
 * Setup graceful shutdown handlers
 */
function setupProcessHandlers() {
  // Handle SIGTERM for graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    process.exit(0);
  });

  // Handle SIGINT for graceful shutdown
  process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    process.exit(0);
  });

  // Log memory usage periodically in development
  if (process.env.NODE_ENV === 'development') {
    setInterval(() => {
      const memUsage = process.memoryUsage();
      logger.debug('Memory usage', {
        heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
        rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
      });
    }, 30000); // Every 30 seconds
  }
}

/**
 * Cleanup and shutdown
 */
export async function shutdownApp() {
  logger.info('Shutting down application');

  // Add any cleanup logic here
  // - Close database connections
  // - Close open sockets
  // - Flush logs
  // etc.

  logger.info('Application shutdown complete');
}
