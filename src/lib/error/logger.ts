// =============================================================================
// ERROR HANDLING - Logger Utility
// =============================================================================

import {ErrorSeverity, type LogEntry} from "./types";

/**
 * Logger configuration
 */
interface LoggerConfig {
  minLevel: ErrorSeverity;
  enableConsole: boolean;
  enableRemote: boolean;
  remoteUrl?: string;
  environment: "development" | "production" | "test";
}

const config: LoggerConfig = {
  minLevel: process.env.NODE_ENV === "production" ? ErrorSeverity.ERROR : ErrorSeverity.DEBUG,
  enableConsole: true,
  enableRemote: false,
  environment: (process.env.NODE_ENV as "development" | "production" | "test") || "development",
};

/**
 * Set logger configuration
 */
export function configureLogger(newConfig: Partial<LoggerConfig>): void {
  Object.assign(config, newConfig);
}

/**
 * Level priority for comparison
 */
const levelPriority: Record<ErrorSeverity, number> = {
  [ErrorSeverity.DEBUG]: 0,
  [ErrorSeverity.INFO]: 1,
  [ErrorSeverity.WARNING]: 2,
  [ErrorSeverity.ERROR]: 3,
  [ErrorSeverity.CRITICAL]: 4,
};

/**
 * Check if a level should be logged based on minLevel
 */
function shouldLog(level: ErrorSeverity): boolean {
  return levelPriority[level] >= levelPriority[config.minLevel];
}

/**
 * Create a structured log entry
 */
function createLogEntry(
  level: ErrorSeverity,
  message: string,
  context?: Record<string, unknown>,
  error?: Error
): LogEntry {
  return {
    level,
    message,
    context,
    error,
    timestamp: new Date().toISOString(),
    requestId: typeof globalThis !== "undefined" 
      ? (globalThis as Record<string, unknown>).__requestId as string | undefined
      : undefined,
  };
}

/**
 * Format log entry for console output
 */
function formatLogEntry(entry: LogEntry): string {
  const { level, message, timestamp, requestId, context, error } = entry;
  
  const parts: string[] = [];
  
  // Timestamp
  const time = new Date(timestamp).toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  parts.push(`[${time}]`);
  
  // Level badge
  const levelColors: Record<ErrorSeverity, string> = {
    [ErrorSeverity.DEBUG]: "\x1b[36m",
    [ErrorSeverity.INFO]: "\x1b[34m",
    [ErrorSeverity.WARNING]: "\x1b[33m",
    [ErrorSeverity.ERROR]: "\x1b[31m",
    [ErrorSeverity.CRITICAL]: "\x1b[35m",
  };
  const reset = "\x1b[0m";
  parts.push(`${levelColors[level]}${level.padEnd(8)}${reset}`);
  
  // Request ID if present
  if (requestId) {
    parts.push(`[${requestId}]`);
  }
  
  // Message
  parts.push(message);
  
  // Context if present
  if (context && Object.keys(context).length > 0) {
    parts.push(`\n  Context: ${JSON.stringify(context, null, 2)}`);
  }
  
  // Error stack if present
  if (error) {
    parts.push(`\n  Error: ${error.name}: ${error.message}`);
    if (config.environment !== "production" && error.stack) {
      parts.push(`\n${error.stack}`);
    }
  }
  
  return parts.join(" ");
}

/**
 * Send log to remote endpoint if configured
 */
async function sendToRemote(entry: LogEntry): Promise<void> {
  if (!config.enableRemote || !config.remoteUrl) return;
  
  try {
    await fetch(config.remoteUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
      // Don't await this - fire and forget
    }).catch(() => {}); // Suppress network errors
  } catch {
    // Silently fail remote logging
  }
}

/**
 * Core logging function
 */
function log(level: ErrorSeverity, message: string, context?: Record<string, unknown>, error?: Error): void {
  if (!shouldLog(level)) return;
  
  const entry = createLogEntry(level, message, context, error);
  
  // Console output
  if (config.enableConsole) {
    const formatted = formatLogEntry(entry);
    switch (level) {
      case ErrorSeverity.DEBUG:
        console.debug(formatted);
        break;
      case ErrorSeverity.INFO:
        console.info(formatted);
        break;
      case ErrorSeverity.WARNING:
        console.warn(formatted);
        break;
      case ErrorSeverity.ERROR:
      case ErrorSeverity.CRITICAL:
        console.error(formatted);
        break;
    }
  }
  
  // Remote logging (async, non-blocking)
  sendToRemote(entry);
}

/**
 * Public logger API
 */
export const logger = {
  debug: (message: string, context?: Record<string, unknown>) => 
    log(ErrorSeverity.DEBUG, message, context),
  
  info: (message: string, context?: Record<string, unknown>) => 
    log(ErrorSeverity.INFO, message, context),
  
  warn: (message: string, context?: Record<string, unknown>) => 
    log(ErrorSeverity.WARNING, message, context),
  
  error: (message: string, error?: Error | unknown, context?: Record<string, unknown>) => {
    const err = error instanceof Error ? error : error ? new Error(String(error)) : undefined;
    log(ErrorSeverity.ERROR, message, context, err);
  },
  
  critical: (message: string, error?: Error | unknown, context?: Record<string, unknown>) => {
    const err = error instanceof Error ? error : error ? new Error(String(error)) : undefined;
    log(ErrorSeverity.CRITICAL, message, context, err);
  },
};

/**
 * Create a request-scoped logger with request ID
 */
export function createRequestLogger(requestId: string) {
  if (typeof globalThis !== "undefined") {
    (globalThis as Record<string, unknown>).__requestId = requestId;
  }
  
  return {
    debug: (message: string, context?: Record<string, unknown>) => 
      log(ErrorSeverity.DEBUG, message, { ...context, requestId }),
    
    info: (message: string, context?: Record<string, unknown>) => 
      log(ErrorSeverity.INFO, message, { ...context, requestId }),
    
    warn: (message: string, context?: Record<string, unknown>) => 
      log(ErrorSeverity.WARNING, message, { ...context, requestId }),
    
    error: (message: string, error?: Error | unknown, context?: Record<string, unknown>) => {
      const err = error instanceof Error ? error : error ? new Error(String(error)) : undefined;
      log(ErrorSeverity.ERROR, message, { ...context, requestId }, err);
    },
    
    critical: (message: string, error?: Error | unknown, context?: Record<string, unknown>) => {
      const err = error instanceof Error ? error : error ? new Error(String(error)) : undefined;
      log(ErrorSeverity.CRITICAL, message, { ...context, requestId }, err);
    },
    
    requestId,
  };
}

/**
 * Async wrapper with automatic error logging
 */
export async function withLogging<T>(
  operation: () => Promise<T>,
  operationName: string,
  logLevel?: ErrorSeverity
): Promise<T> {
  const level = logLevel || ErrorSeverity.INFO;
  
  try {
    const startTime = Date.now();
    const result = await operation();
    const duration = Date.now() - startTime;
    
    log(level, `${operationName} completed`, { duration });
    
    return result;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    log(ErrorSeverity.ERROR, `${operationName} failed`, { 
      error: err.message,
      stack: err.stack 
    });
    throw error;
  }
}

export { ErrorSeverity };
