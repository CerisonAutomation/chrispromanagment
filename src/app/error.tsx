'use client';

import {useEffect} from 'react';
import {AlertTriangle, Home, RefreshCw} from 'lucide-react';
import {logger} from '@/lib/error/logger';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error for monitoring
    logger.error('Global error boundary triggered', error, {
      digest: error.digest,
      message: error.message,
    });
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-b from-background to-secondary">
      <div className="w-full max-w-md">
        <div className="text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-6">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
            Oops! Something went wrong
          </h1>
          
          <p className="text-muted-foreground mb-8">
            We encountered an unexpected error. Our team has been notified and is looking into it.
          </p>

          <div className="space-y-3">
            <button
              onClick={reset}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
            
            <a
              href="/"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 border border-input bg-background rounded-lg font-semibold hover:bg-accent transition-colors"
            >
              <Home className="h-4 w-4" />
              Go Home
            </a>
          </div>

          {process.env.NODE_ENV === 'development' && error.message && (
            <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
              <p className="text-sm font-mono text-red-800 break-words">
                {error.message}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
