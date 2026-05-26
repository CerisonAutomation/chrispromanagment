/**
 * Centralized logging utility
 * Replaces console.log/warn/error with structured logging
 * In production, this would integrate with services like Sentry, Datadog, or LogRocket
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  timestamp: string;
}

class Logger {
  private minLevel: LogLevel = LogLevel.INFO;

  constructor() {
    // Set log level based on environment
    if (import.meta.env.DEV) {
      this.minLevel = LogLevel.DEBUG;
    } else {
      this.minLevel = LogLevel.WARN;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.minLevel;
  }

  private formatMessage(entry: LogEntry): string {
    const levelNames = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
    const levelName = levelNames[entry.level];
    const contextStr = entry.context ? ` ${JSON.stringify(entry.context)}` : '';
    return `[${entry.timestamp}] [${levelName}] ${entry.message}${contextStr}`;
  }

  private log(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) {
      return;
    }

    const formatted = this.formatMessage(entry);

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(formatted);
        break;
      case LogLevel.INFO:
        console.info(formatted);
        break;
      case LogLevel.WARN:
        console.warn(formatted);
        break;
      case LogLevel.ERROR:
        console.error(formatted);
        // In production, send to error tracking service
        if (!import.meta.env.DEV) {
          this.sendToErrorTracking(entry);
        }
        break;
    }
  }

  private sendToErrorTracking(entry: LogEntry): void {
    // Integration with error tracking services would go here
    // Example: Sentry.captureException(entry.context?.error);
    // For now, this is a placeholder
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log({
      level: LogLevel.DEBUG,
      message,
      context,
      timestamp: new Date().toISOString(),
    });
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log({
      level: LogLevel.INFO,
      message,
      context,
      timestamp: new Date().toISOString(),
    });
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log({
      level: LogLevel.WARN,
      message,
      context,
      timestamp: new Date().toISOString(),
    });
  }

  error(message: string, context?: Record<string, unknown>): void {
    this.log({
      level: LogLevel.ERROR,
      message,
      context,
      timestamp: new Date().toISOString(),
    });
  }
}

export const logger = new Logger();
