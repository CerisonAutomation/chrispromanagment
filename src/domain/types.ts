/**
 * Domain types for API result handling
 * Stub file to resolve build errors
 */

export class DomainError {
  code: string;
  message: string;
  statusCode?: number;
  cause?: unknown;
  context?: Record<string, unknown>;

  constructor({ code, message, statusCode, cause, context }: { code: string; message: string; statusCode?: number; cause?: unknown; context?: Record<string, unknown> }) {
    this.code = code;
    this.message = message;
    this.statusCode = statusCode;
    this.cause = cause;
    this.context = context;
  }
}

export interface Result<T, E = DomainError> {
  success: boolean;
  data?: T;
  error?: E;
}

export function ok<T>(data: T): Result<T> {
  return { success: true, data };
}

export function err<E = DomainError>(error: E): Result<never, E> {
  return { success: false, error };
}

export const Errors = {
  ValidationFailed: (operation: string, message: string) => new DomainError({
    code: 'VALIDATION_FAILED',
    message: `${operation}: ${message}`,
    statusCode: 400,
  }),
  NotFound: (resource: string, id?: string) => new DomainError({
    code: 'NOT_FOUND',
    message: id ? `${resource} with id '${id}' not found` : `${resource} not found`,
    statusCode: 404,
  }),
  Unauthorized: (message = 'Unauthorized') => new DomainError({
    code: 'UNAUTHORIZED',
    message,
    statusCode: 401,
  }),
  Forbidden: (message = 'Forbidden') => new DomainError({
    code: 'FORBIDDEN',
    message,
    statusCode: 403,
  }),
};
