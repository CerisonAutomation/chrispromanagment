// =============================================================================
// ERROR HANDLING - Type Definitions
// =============================================================================

/**
 * Standardized error codes for API responses
 */
export const ErrorCodes = {
  // Validation errors (4xx)
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INVALID_REQUEST: "INVALID_REQUEST",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",

  // Server errors (5xx)
  INTERNAL_ERROR: "INTERNAL_ERROR",
  DATABASE_ERROR: "DATABASE_ERROR",
  EXTERNAL_SERVICE_ERROR: "EXTERNAL_SERVICE_ERROR",

  // AI-specific errors
  AI_TIMEOUT: "AI_TIMEOUT",
  AI_FAILURE: "AI_FAILURE",
  AI_PARSE_ERROR: "AI_PARSE_ERROR",
  AI_NOT_CONFIGURED: "AI_NOT_CONFIGURED",

  // Generic
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

/**
 * Structured error response for APIs
 */
export interface ApiError {
  success: false;
  error: string;
  code: ErrorCode;
  details?: Record<string, unknown>;
  timestamp: string;
}

/**
 * Create a standardized API error response
 */
export function createApiError(
  error: string,
  code: ErrorCode,
  details?: Record<string, unknown>
): ApiError {
  return {
    success: false,
    error,
    code,
    details,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Error severity levels for logging
 */
export enum ErrorSeverity {
  DEBUG = "debug",
  INFO = "info",
  WARNING = "warning",
  ERROR = "error",
  CRITICAL = "critical",
}

/**
 * Log entry structure
 */
export interface LogEntry {
  level: ErrorSeverity;
  message: string;
  context?: Record<string, unknown>;
  error?: Error;
  timestamp: string;
  requestId?: string;
}

/**
 * Result type for operations that can fail
 */
export type Result<T, E = ApiError> = 
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Check if a value is a Result type and if it succeeded
 */
export function isSuccess<T, E>(result: Result<T, E>): result is { success: true; data: T } {
  return result.success === true;
}

/**
 * Wrap an async operation with error handling
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  errorHandler?: (error: Error) => Promise<T>
): Promise<Result<T>> {
  try {
    const data = await operation();
    return { success: true, data };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    
    if (errorHandler) {
      try {
        const recovered = await errorHandler(err);
        return { success: true, data: recovered };
      } catch {
        return { 
          success: false, 
          error: createApiError(err.message, ErrorCodes.UNKNOWN_ERROR) 
        };
      }
    }
    
    const code = classifyError(err);
    return { 
      success: false, 
      error: createApiError(err.message, code) 
    };
  }
}

/**
 * Classify an error based on its characteristics
 */
export function classifyError(error: Error): ErrorCode {
  const message = error.message.toLowerCase();
  
  if (message.includes("timeout") || message.includes("timed out")) {
    return ErrorCodes.AI_TIMEOUT;
  }
  if (message.includes("parse") || message.includes("json")) {
    return ErrorCodes.AI_PARSE_ERROR;
  }
  if (message.includes("not configured") || message.includes("api key")) {
    return ErrorCodes.AI_NOT_CONFIGURED;
  }
  if (message.includes("database") || message.includes("prisma") || message.includes("sql")) {
    return ErrorCodes.DATABASE_ERROR;
  }
  if (message.includes("fetch") || message.includes("network") || message.includes("connection")) {
    return ErrorCodes.EXTERNAL_SERVICE_ERROR;
  }
  
  return ErrorCodes.INTERNAL_ERROR;
}

/**
 * Safe JSON parse with fallback
 */
export function safeJsonParse<T>(json: string, fallback: T): Result<T> {
  try {
    const parsed = JSON.parse(json) as T;
    return { success: true, data: parsed };
  } catch {
    return { 
      success: false, 
      error: createApiError("Invalid JSON", ErrorCodes.VALIDATION_ERROR) 
    };
  }
}

/**
 * Validate required fields in an object
 */
export function validateRequired<T extends Record<string, unknown>>(
  obj: T,
  fields: (keyof T)[]
): { valid: boolean; missing: (keyof T)[] } {
  const missing = fields.filter((field) => {
    const value = obj[field];
    return value === undefined || value === null || value === "";
  });
  
  return {
    valid: missing.length === 0,
    missing,
  };
}
