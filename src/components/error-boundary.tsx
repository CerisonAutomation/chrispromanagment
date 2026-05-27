import { Component } from 'react';
import type { ErrorInfo } from 'react';
import { cn } from '@/lib/utils';
import { handleError } from '@/lib/error-handler';
import { apiFetch } from '@/lib/api-client';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * ErrorBoundary - Top-level error boundary that logs errors and displays friendly UI
 * @param props - Component props
 * @returns React component
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/client-errors`;
      apiFetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          message: String(error?.message || error),
          stack: String(error?.stack || ""),
          componentStack: String(info?.componentStack || ""),
          url: typeof window !== "undefined" ? window.location.href : "",
          ua: typeof navigator !== "undefined" ? navigator.userAgent : "",
        }),
        keepalive: true,
      }).catch(() => {});
    } catch (catchError) {
      const appError = handleError(catchError);
      
    }
  }

  reset = () => this.setState({ error: null });

  render() {
    if (!this.state.error) {
return this.props.children;
}
    return (
      <div 
        className={cn("min-h-screen flex items-center justify-center bg-background-dark text-text-primary p-6")}
        aria-label="Error boundary"
      >
        <div className="max-w-md text-center space-y-4">
          <p className="text-xs uppercase tracking-widest text-luxury-gold">Something went wrong</p>
          <h1 className="text-2xl font-serif">We hit an unexpected error.</h1>
          <p className="text-sm text-text-secondary">
            The team has been notified. Try reloading — your work is safe.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => window.location.reload()}
              className={cn("px-4 py-2 bg-luxury-gold text-background-dark text-sm font-medium hover:bg-gold-light")}
              aria-label="Reload page"
            >
              Reload page
            </button>
            <button
              onClick={this.reset}
              className={cn("px-4 py-2 border border-white/15 text-sm hover:bg-white/5")}
              aria-label="Try again"
            >
              Try again
            </button>
          </div>
          {import.meta.env.DEV && (
            <pre className="text-left text-[10px] text-text-muted mt-4 overflow-auto max-h-48 p-3 bg-black/40 rounded">
              {String(this.state.error?.stack || this.state.error)}
            </pre>
          )}
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
