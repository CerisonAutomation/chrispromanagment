// =============================================================================
// ERROR HANDLING - React Error Boundary Components
// =============================================================================

"use client";

import React, {Component, ReactNode, useCallback, useState} from "react";
import {AlertTriangle, Bug, ChevronDown, ChevronUp, Home, RefreshCw} from "lucide-react";

/**
 * Props for ErrorBoundary
 */
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showErrorDetails?: boolean;
  level?: "page" | "section" | "component";
}

/**
 * State for ErrorBoundary
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  isExpanded: boolean;
}

/**
 * Global error boundary class component for catching React errors
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      isExpanded: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({ errorInfo });
    
    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("[ErrorBoundary] Caught error:", error, errorInfo);
    }
    
    // Call onError callback if provided
    this.props.onError?.(error, errorInfo);
  }

  resetError = (): void => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      isExpanded: false,
    });
  };

  toggleExpanded = (): void => {
    this.setState((prev) => ({ isExpanded: !prev.isExpanded }));
  };

  render(): ReactNode {
    const { hasError, error, errorInfo, isExpanded } = this.state;
    const { children, fallback, showErrorDetails = process.env.NODE_ENV === "development", level = "section" } = this.props;

    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback) {
        if (typeof fallback === "function") {
          return <>{fallback(error, this.resetError)}</>;
        }
        return fallback;
      }

      // Default fallback UI
      return (
        <ErrorFallback
          error={error}
          errorInfo={errorInfo}
          onReset={this.resetError}
          showDetails={showErrorDetails}
          isExpanded={isExpanded}
          onToggleExpand={this.toggleExpanded}
          level={level}
        />
      );
    }

    return children;
  }
}

/**
 * Props for ErrorFallback component
 */
interface ErrorFallbackProps {
  error: Error;
  errorInfo: React.ErrorInfo | null;
  onReset: () => void;
  showDetails: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  level: "page" | "section" | "component";
}

/**
 * Default error fallback UI
 */
function ErrorFallback({
  error,
  errorInfo,
  onReset,
  showDetails,
  isExpanded,
  onToggleExpand,
  level,
}: ErrorFallbackProps): React.ReactElement {
  const title = level === "page" 
    ? "Something went wrong" 
    : level === "section" 
      ? "This section encountered an error"
      : "Component error";

  const containerClass = level === "page"
    ? "min-h-[50vh] flex items-center justify-center p-8"
    : level === "section"
      ? "p-6 bg-red-50 border border-red-200 rounded-lg"
      : "p-4 bg-red-50 border border-red-200 rounded";

  return (
    <div className={containerClass}>
      <div className="max-w-md w-full">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-red-800 mb-1">{title}</h3>
            <p className="text-sm text-red-600 mb-4">
              {level === "page" 
                ? "We're sorry, something unexpected happened. Please try again."
                : "This content couldn't be loaded."}
            </p>
            
            <div className="flex gap-2">
              <button
                onClick={onReset}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Try again
              </button>
              
              {level !== "component" && (
                <a
                  href="/"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-700 bg-white border border-red-200 rounded-md hover:bg-red-50 transition-colors"
                >
                  <Home className="h-4 w-4" />
                  Go home
                </a>
              )}
            </div>

            {showDetails && (
              <div className="mt-4">
                <button
                  onClick={onToggleExpand}
                  className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
                >
                  {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  {isExpanded ? "Hide" : "Show"} error details
                </button>

                {isExpanded && (
                  <div className="mt-2 p-3 bg-white rounded border border-red-100 text-xs font-mono">
                    <p className="font-semibold text-red-800">{error.name}: {error.message}</p>
                    {error.stack && (
                      <pre className="mt-2 text-red-600 whitespace-pre-wrap break-all max-h-40 overflow-auto">
                        {error.stack}
                      </pre>
                    )}
                    {errorInfo && (
                      <p className="mt-2 text-red-500">
                        Component stack: {errorInfo.componentStack}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Props for AsyncBoundary
 */
interface AsyncBoundaryProps {
  children: ReactNode;
  loading?: ReactNode;
  errorFallback?: ReactNode | ((error: Error, retry: () => void) => ReactNode);
  onRetry?: () => void;
  skeleton?: ReactNode;
}

/**
 * Loading state for async operations
 */
export function LoadingFallback({ 
  className = "animate-pulse bg-gray-200 rounded" 
}: { className?: string }): React.ReactElement {
  return <div className={`h-4 w-full ${className}`} />;
}

/**
 * Skeleton loaders for common content types
 */
export const Skeletons = {
  Card: () => (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="animate-pulse space-y-3">
        <div className="h-40 bg-gray-200 rounded" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
  ),
  
  Text: ({ lines = 3 }: { lines?: number }) => (
    <div className="animate-pulse space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div 
          key={i} 
          className="h-4 bg-gray-200 rounded" 
          style={{ width: `${100 - i * 15}%` }} 
        />
      ))}
    </div>
  ),
  
  List: ({ items = 5 }: { items?: number }) => (
    <div className="space-y-2">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse" />
          <div className="flex-1 space-y-1">
            <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse" />
            <div className="h-2 bg-gray-200 rounded w-1/2 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  ),
};

/**
 * AsyncBoundary component for handling async operation states
 */
export function AsyncBoundary({
  children,
  loading,
  errorFallback,
  onRetry,
  skeleton,
}: AsyncBoundaryProps): React.ReactElement {
  const [error, setError] = useState<Error | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = useCallback(() => {
    setError(null);
    setIsRetrying(true);
    onRetry?.();
    // Reset retrying state after a short delay (parent should handle actual retry)
    setTimeout(() => setIsRetrying(false), 100);
  }, [onRetry]);

  // If there's an error, show error fallback
  if (error) {
    if (errorFallback) {
      if (typeof errorFallback === "function") {
        return <>{errorFallback(error, handleRetry)}</>;
      }
      return <>{errorFallback}</>;
    }

    // Default async error UI
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-start gap-3">
          <Bug className="h-5 w-5 text-red-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">Failed to load content</p>
            <p className="text-xs text-red-600 mt-1">{error.message}</p>
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50"
            >
              <RefreshCw className={`h-3 w-3 ${isRetrying ? "animate-spin" : ""}`} />
              {isRetrying ? "Retrying..." : "Try again"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render loading state or skeleton
  if (loading || skeleton) {
    return (
      <>
        {loading || skeleton}
        {/* Hidden children that will throw error if they fail */}
        <div className="hidden">
          {React.Children.map(children, (child) => (
            <ErrorBoundary
              fallback={(err) => {
                setError(err);
                return null;
              }}
              level="component"
            >
              {child}
            </ErrorBoundary>
          ))}
        </div>
      </>
    );
  }

  return <>{children}</>;
}

/**
 * Hook to trigger error boundary reset from child components
 */
export function useErrorBoundary(): (error: Error) => void {
  const [error, setError] = useState<Error | null>(null);
  
  if (error) {
    throw error;
  }
  
  return setError;
}

/**
 * Wrapper for Suspense + Error handling
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, "children">
): React.FC<P> {
  const WithErrorBoundary: React.FC<P> = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );
  
  WithErrorBoundary.displayName = `WithErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name || "Component"})`;
  
  return WithErrorBoundary;
}
