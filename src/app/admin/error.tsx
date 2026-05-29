/**
 * Admin error boundary — catches errors in admin routes.
 * Malta Gold glassmorphism design.
 */
'use client';

import { useEffect } from 'react';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[AdminError]', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-[#111214] border border-[rgba(239,68,68,0.2)] rounded-2xl p-8 text-center space-y-6">
        {/* Error icon */}
        <div className="w-16 h-16 mx-auto rounded-xl bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] flex items-center justify-center text-3xl">
          ⚠️
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-[#e8e4dc]">
            Admin Error
          </h2>
          <p className="text-sm text-[rgba(232,228,220,0.5)]">
            {process.env.NODE_ENV === 'development' 
              ? error.message 
              : 'Something went wrong in the admin panel.'}
          </p>
        </div>

        {error.digest && (
          <p className="text-xs text-[rgba(232,228,220,0.3)] font-mono">
            ID: {error.digest}
          </p>
        )}

        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-4 py-2 bg-gradient-to-r from-[#c8a96a] to-[#9b7d3f] text-[#0e0f11] font-medium rounded-lg hover:opacity-90 transition-opacity"
          >
            Try again
          </button>
          <a
            href="/admin"
            className="px-4 py-2 border border-[rgba(200,169,106,0.3)] text-[#c8a96a] font-medium rounded-lg hover:bg-[rgba(200,169,106,0.1)] transition-colors"
          >
            Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
