/**
 * Guesty Error Boundary
 * 
 * Catches errors in Guesty-related components
 * Implements graceful degradation
 * Provides user-friendly error messages
 * Logs errors for monitoring
 * 
 * Features:
 * - Guesty-specific error classification
 * - Automatic retry logic
 * - Fallback UI components
 * - Error reporting with context
 * - Circuit breaker integration
 * 
 * @author Development Team
 * @version 1.0.0
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '@/lib/logger';
import { guestyAuthMiddleware } from '@/middleware/guesty-auth-middleware';

// =============================================
// Error Types
// =============================================

export enum GuestyErrorType {
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NETWORK = 'NETWORK',
  RATE_LIMIT = 'RATE_LIMIT',
  VALIDATION = 'VALIDATION',
  SERVER_ERROR = 'SERVER_ERROR',
  TIMEOUT = 'TIMEOUT',
  UNKNOWN = 'UNKNOWN',
}

export interface GuestyErrorContext {
  errorType: GuestyErrorType;
  route?: string;
  endpoint?: string;
  timestamp: Date;
  userAgent: string;
  userId?: string;
  sessionId?: string;
}

// =============================================
// Error Classification
// =============================================

function classifyError(error: Error): GuestyErrorType {
  const message = error.message.toLowerCase();

  if (message.includes('authentication') || message.includes('token')) {
    return GuestyErrorType.AUTHENTICATION;
  }
  if (message.includes('authorization') || message.includes('forbidden') || message.includes('unauthorized')) {
    return GuestyErrorType.AUTHORIZATION;
  }
  if (message.includes('network') || message.includes('fetch')) {
    return GuestyErrorType.NETWORK;
  }
  if (message.includes('rate limit') || message.includes('too many requests')) {
    return GuestyErrorType.RATE_LIMIT;
  }
  if (message.includes('validation') || message.includes('invalid')) {
    return GuestyErrorType.VALIDATION;
  }
  if (message.includes('timeout') || message.includes('aborted')) {
    return GuestyErrorType.TIMEOUT;
  }
  if (message.includes('500') || message.includes('502') || message.includes('503')) {
    return GuestyErrorType.SERVER_ERROR;
  }

  return GuestyErrorType.UNKNOWN;
}

// =============================================
// Error Messages
// =============================================

const ERROR_MESSAGES: Record<GuestyErrorType, { title: string; message: string; showRetry: boolean }> = {
  [GuestyErrorType.AUTHENTICATION]: {
    title: 'Authentication Error',
    message: 'We encountered an issue verifying your access. Please try again.',
    showRetry: true,
  },
  [GuestyErrorType.AUTHORIZATION]: {
    title: 'Access Denied',
    message: 'You do not have permission to access this resource.',
    showRetry: false,
  },
  [GuestyErrorType.NETWORK]: {
    title: 'Network Error',
    message: 'Unable to connect to our services. Please check your internet connection.',
    showRetry: true,
  },
  [GuestyErrorType.RATE_LIMIT]: {
    title: 'Too Many Requests',
    message: 'You have made too many requests. Please wait a moment and try again.',
    showRetry: true,
  },
  [GuestyErrorType.VALIDATION]: {
    title: 'Data Validation Error',
    message: 'There was an issue with the data provided. Please try again.',
    showRetry: true,
  },
  [GuestyErrorType.SERVER_ERROR]: {
    title: 'Server Error',
    message: 'Our services are currently unavailable. Please try again later.',
    showRetry: true,
  },
  [GuestyErrorType.TIMEOUT]: {
    title: 'Request Timeout',
    message: 'The request took too long to complete. Please try again.',
    showRetry: true,
  },
  [GuestyErrorType.UNKNOWN]: {
    title: 'Unexpected Error',
    message: 'An unexpected error occurred. Please try again.',
    showRetry: true,
  },
};

// =============================================
// Fallback UI Components
// =============================================

interface FallbackProps {
  errorType: GuestyErrorType;
  error: Error;
  onRetry: () => void;
  onDismiss?: () => void;
  customMessage?: string;
}

function DefaultFallback({ errorType, error, onRetry, onDismiss, customMessage }: FallbackProps) {
  const { title, message, showRetry } = ERROR_MESSAGES[errorType];

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600 mb-6">{customMessage || message}</p>

        {showRetry && (
          <div className="flex gap-3 justify-center">
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Dismiss
              </button>
            )}
          </div>
        )}

        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              Error Details
            </summary>
            <pre className="mt-2 text-xs text-gray-600 bg-gray-100 p-3 rounded overflow-auto">
              {error.stack || error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

// =============================================
// Error Boundary Component
// =============================================

interface GuestyErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<FallbackProps>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  route?: string;
  endpoint?: string;
  maxRetries?: number;
  retryDelay?: number;
}

interface GuestyErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorType: GuestyErrorType;
  retryCount: number;
}

export class GuestyErrorBoundary extends Component<GuestyErrorBoundaryProps, GuestyErrorBoundaryState> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: GuestyErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorType: GuestyErrorType.UNKNOWN,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<GuestyErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorType: classifyError(error),
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const context: GuestyErrorContext = {
      errorType: this.state.errorType,
      route: this.props.route,
      endpoint: this.props.endpoint,
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      userId: this.getUserId(),
      sessionId: this.getSessionId(),
    };

    // Log the error
    logger.error('Guesty error boundary caught an error', {
      error: error.message,
      errorType: this.state.errorType,
      context,
      errorInfo: {
        componentStack: errorInfo.componentStack,
      },
    });

    // Check circuit breaker status for auth errors
    if (this.state.errorType === GuestyErrorType.AUTHENTICATION) {
      const cbStatus = guestyAuthMiddleware.getCircuitBreakerStatus();
      logger.warn('Circuit breaker status after auth error', cbStatus);
    }

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private getUserId(): string | undefined {
    // Get user ID from auth store or localStorage
    try {
      const userId = localStorage.getItem('user-id');
      return userId || undefined;
    } catch {
      return undefined;
    }
  }

  private getSessionId(): string | undefined {
    // Get session ID from auth store or localStorage
    try {
      const sessionId = localStorage.getItem('session-id');
      return sessionId || undefined;
    } catch {
      return undefined;
    }
  }

  handleRetry = () => {
    const { maxRetries = 3, retryDelay = 1000 } = this.props;

    if (this.state.retryCount >= maxRetries) {
      logger.error('Max retries reached for Guesty error boundary', {
        errorType: this.state.errorType,
        retryCount: this.state.retryCount,
      });
      return;
    }

    this.setState({ retryCount: this.state.retryCount + 1 });

    // Clear existing timeout
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }

    // Exponential backoff
    const delay = retryDelay * Math.pow(2, this.state.retryCount);
    this.retryTimeoutId = setTimeout(() => {
      logger.info('Retrying after error', {
        errorType: this.state.errorType,
        retryCount: this.state.retryCount,
        delay,
      });
      this.setState({
        hasError: false,
        error: null,
        errorType: GuestyErrorType.UNKNOWN,
      });
    }, delay);
  };

  handleDismiss = () => {
    this.setState({
      hasError: false,
      error: null,
      errorType: GuestyErrorType.UNKNOWN,
      retryCount: 0,
    });
  };

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultFallback;

      return (
        <FallbackComponent
          errorType={this.state.errorType}
          error={this.state.error || new Error('Unknown error')}
          onRetry={this.handleRetry}
          onDismiss={this.handleDismiss}
        />
      );
    }

    return this.props.children;
  }
}

// =============================================
// Higher-Order Component
// =============================================

export function withGuestyErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<GuestyErrorBoundaryProps, 'children'> = {}
) {
  return function WrappedComponent(props: P) {
    return (
      <GuestyErrorBoundary {...options}>
        <Component {...props} />
      </GuestyErrorBoundary>
    );
  };
}

// =============================================
// Hook for Functional Components
// =============================================

export function useGuestyErrorHandler() {
  const handleError = React.useCallback((error: Error, context?: Partial<GuestyErrorContext>) => {
    const errorType = classifyError(error);
    
    logger.error('Guesty error handled via hook', {
      error: error.message,
      errorType,
      context: {
        ...context,
        timestamp: new Date(),
        userAgent: navigator.userAgent,
      },
    });

    return { errorType, shouldRetry: errorType !== GuestyErrorType.AUTHORIZATION };
  }, []);

  return { handleError };
}
