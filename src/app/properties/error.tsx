/**
 * Properties error boundary
 */
'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function PropertiesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[PropertiesError]', error);
  }, [error]);

  return (
    <main className="min-h-screen bg-[#0a0b0d] pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center py-20 space-y-6">
          <div className="text-6xl">🏘️</div>
          <h1 className="text-2xl font-semibold text-[#e8e4dc]">
            Failed to load properties
          </h1>
          <p className="text-[rgba(232,228,220,0.5)] max-w-md mx-auto">
            {process.env.NODE_ENV === 'development' 
              ? error.message 
              : 'We couldn\'t load the properties. Please try again.'}
          </p>
          <div className="flex gap-3 justify-center pt-4">
            <button
              onClick={reset}
              className="px-6 py-3 bg-gradient-to-r from-[#c8a96a] to-[#9b7d3f] text-[#0e0f11] font-semibold rounded-xl hover:opacity-90 transition-opacity"
            >
              Try again
            </button>
            <Link
              href="/"
              className="px-6 py-3 border border-[rgba(200,169,106,0.3)] text-[#c8a96a] font-semibold rounded-xl hover:bg-[rgba(200,169,106,0.1)] transition-colors"
            >
              Go home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
