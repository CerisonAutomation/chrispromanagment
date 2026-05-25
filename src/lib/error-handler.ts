export interface AppError {
  message: string;
  code?: string;
  details?: unknown;
}

export function handleError(error: unknown): AppError {
  if (error instanceof Error) {
    return { message: error.message, code: 'ERR_UNKNOWN' };
  }
  if (typeof error === 'string') {
    return { message: error, code: 'ERR_STRING' };
  }
  return { message: 'An unknown error occurred', code: 'ERR_UNKNOWN' };
}
