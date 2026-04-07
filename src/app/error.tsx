/**
 * @fileoverview Root error boundary — catches unhandled errors in the React tree.
 * Displays a user-friendly recovery UI.
 */
'use client';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error tracking in production
    if (process.env.NODE_ENV === 'production') {
      console.error('[GlobalError]', error.message, error.digest);
    }
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background text-foreground p-8">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-6xl">⚠️</div>
          <h1 className="text-2xl font-bold">Something went wrong</h1>
          <p className="text-muted-foreground text-sm">
            {process.env.NODE_ENV === 'development'
              ? error.message
              : 'An unexpected error occurred. Our team has been notified.'}
          </p>
          {error.digest && (
            <p className="text-xs text-muted-foreground/60">Error ID: {error.digest}</p>
          )}
        </div>
        <div className="flex gap-3">
          <Button onClick={reset} variant="default">Try again</Button>
          <Button onClick={() => window.location.href = '/'} variant="outline">Go home</Button>
        </div>
      </body>
    </html>
  );
}
