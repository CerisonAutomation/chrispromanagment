// =============================================================================
// ERROR HANDLING - Types
// =============================================================================

export enum ErrorSeverity {
  DEBUG = 'debug',
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

export interface LogEntry {
  level: ErrorSeverity;
  message: string;
  context?: Record<string, unknown>;
  error?: Error;
  timestamp: string;
  requestId?: string;
}
