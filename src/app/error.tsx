'use client';
/**
 * @fileoverview Global error boundary — catches all unhandled client errors.
 */
import { useEffect } from 'react';

export default function GlobalError({
  error, reset,
}: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[GlobalError]', error);
  }, [error]);

  return (
    <html>
      <body style={{ background: '#0e0f11', color: '#e8e4dc', fontFamily: 'sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', margin: 0, flexDirection: 'column', gap: 16, textAlign: 'center', padding: 24 }}>
        <div style={{ fontSize: 48 }}>⚠️</div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#c8a96a' }}>Something went wrong</h1>
        <p style={{ color: '#e8e4dc60', fontSize: 14, maxWidth: 400 }}>
          {error?.message ?? 'An unexpected error occurred.'}
          {error?.digest && <><br /><code style={{ fontSize: 12, opacity: 0.5 }}>Digest: {error.digest}</code></>}
        </p>
        <button
          onClick={reset}
          style={{ padding: '10px 24px', borderRadius: 8, background: '#c8a96a', color: '#0e0f11', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: 14 }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
