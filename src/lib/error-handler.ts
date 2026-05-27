import { logger } from './logger';

export interface AppError {
  message: string;
  code?: string;
  details?: unknown;
  isSecurityRelated?: boolean;
  statusCode?: number;
}

/**
 * Error types for classification
 */
enum ErrorType {
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  VALIDATION = 'VALIDATION',
  DATABASE = 'DATABASE',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Safe error messages for users (no sensitive information)
 */
const SAFE_ERROR_MESSAGES: Record<ErrorType, string> = {
  [ErrorType.NETWORK]: 'A network error occurred. Please check your connection and try again.',
  [ErrorType.AUTHENTICATION]: 'Authentication failed. Please sign in again.',
  [ErrorType.AUTHORIZATION]: 'You do not have permission to perform this action.',
  [ErrorType.VALIDATION]: 'Invalid input. Please check your data and try again.',
  [ErrorType.DATABASE]: 'A data error occurred. Please try again.',
  [ErrorType.UNKNOWN]: 'An error occurred. Please try again.',
};

/**
 * Classify error type based on error characteristics
 */
function classifyError(error: Error): ErrorType {
  const message = error.message.toLowerCase();

  if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
    return ErrorType.NETWORK;
  }

  if (message.includes('jwt') || message.includes('token') || message.includes('unauthorized') || message.includes('auth')) {
    return ErrorType.AUTHENTICATION;
  }

  if (message.includes('permission') || message.includes('forbidden') || message.includes('access denied')) {
    return ErrorType.AUTHORIZATION;
  }

  if (message.includes('validation') || message.includes('invalid') || message.includes('required')) {
    return ErrorType.VALIDATION;
  }

  if (message.includes('database') || message.includes('supabase') || message.includes('sql')) {
    return ErrorType.DATABASE;
  }

  return ErrorType.UNKNOWN;
}

/**
 * Sanitize error message to remove sensitive information
 */
function sanitizeErrorMessage(message: string): string {
  // Remove potential sensitive data patterns
  return message
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED_EMAIL]')
    .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[REDACTED_PHONE]')
    .replace(/Bearer\s+[A-Za-z0-9\-._~+/]+=*/g, '[REDACTED_TOKEN]')
    .replace(/password["\s:=]+[^\s"']+/gi, 'password=[REDACTED]')
    .replace(/secret["\s:=]+[^\s"']+/gi, 'secret=[REDACTED]')
    .replace(/key["\s:=]+[^\s"']+/gi, 'key=[REDACTED]')
    .substring(0, 500); // Limit length
}

/**
 * Check if error is security-related
 */
function isSecurityRelated(error: Error): boolean {
  const message = error.message.toLowerCase();
  const securityKeywords = [
    'jwt', 'token', 'unauthorized', 'forbidden', 'permission denied',
    'csrf', 'xss', 'injection', 'authentication', 'authorization',
  ];

  return securityKeywords.some(keyword => message.includes(keyword));
}

/**
 * Handle error safely without exposing sensitive information
 */
export function handleError(error: unknown): AppError {
  // Log full error for debugging (with proper sanitization)
  logger.error('Error handled', {
    error: error instanceof Error ? {
      message: sanitizeErrorMessage(error.message),
      name: error.name,
      stack: 'STACK_TRACE_HIDDEN', // Never expose stack traces to clients
    } : error,
  });

  // Handle Error instances
  if (error instanceof Error) {
    const errorType = classifyError(error);
    const isSecurity = isSecurityRelated(error);

    return {
      message: SAFE_ERROR_MESSAGES[errorType],
      code: `ERR_${errorType}`,
      details: isSecurity ? undefined : {}, // No details for security errors
      isSecurityRelated: isSecurity,
      statusCode: getStatusCode(errorType),
    };
  }

  // Handle string errors
  if (typeof error === 'string') {
    const sanitized = sanitizeErrorMessage(error);
    return {
      message: SAFE_ERROR_MESSAGES[ErrorType.UNKNOWN],
      code: 'ERR_STRING',
      details: { originalError: sanitized.substring(0, 100) },
      isSecurityRelated: false,
    };
  }

  // Handle unknown errors
  return {
    message: SAFE_ERROR_MESSAGES[ErrorType.UNKNOWN],
    code: 'ERR_UNKNOWN',
    isSecurityRelated: false,
  };
}

/**
 * Get appropriate HTTP status code for error type
 */
function getStatusCode(errorType: ErrorType): number {
  switch (errorType) {
    case ErrorType.AUTHENTICATION:
      return 401;
    case ErrorType.AUTHORIZATION:
      return 403;
    case ErrorType.VALIDATION:
      return 400;
    case ErrorType.NETWORK:
      return 503;
    case ErrorType.DATABASE:
      return 500;
    default:
      return 500;
  }
}

/**
 * Create a user-friendly error message
 */
export function getUserFriendlyMessage(error: unknown): string {
  const appError = handleError(error);
  return appError.message;
}

/**
 * Check if error should be reported to monitoring
 */
export function shouldReportToMonitoring(error: unknown): boolean {
  const appError = handleError(error);
  
  // Always report security-related errors
  if (appError.isSecurityRelated) {
    return true;
  }

  // Always report authentication/authorization errors
  if (appError.code?.includes('AUTHENTICATION') || appError.code?.includes('AUTHORIZATION')) {
    return true;
  }

  // Report database errors
  if (appError.code?.includes('DATABASE')) {
    return true;
  }

  // Otherwise, only report in production
  return import.meta?.env?.PROD === true;
}

/**
 * Sanitize error for API responses
 */
export function sanitizeForApi(error: unknown): {
  error: string;
  code: string;
  statusCode: number;
} {
  const appError = handleError(error);

  return {
    error: appError.message,
    code: appError.code || 'ERR_UNKNOWN',
    statusCode: appError.statusCode || 500,
  };
}
