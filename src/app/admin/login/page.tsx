'use client';
/**
 * @fileoverview Admin login page — /admin/login
 * Simple cookie-based auth for the admin key.
 */
import { useCallback, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') ?? '/admin';

  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const r = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
      });
      if (r.ok) {
        router.push(from);
      } else {
        setError('Invalid admin key. Try again.');
      }
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }, [key, from, router]);

  return (
    <form onSubmit={submit} className="w-full max-w-sm">
      <div className="text-center mb-8">
        <div className="text-4xl mb-3">✦</div>
        <h1 className="text-xl font-bold text-gold">Admin Access</h1>
        <p className="text-foreground/40 text-sm mt-1">Christo Property Management</p>
      </div>
      <div className="mb-4">
        <label htmlFor="key" className="block text-xs text-foreground/50 mb-2 uppercase tracking-wide">Admin Key</label>
        <input
          id="key" type="password" value={key} onChange={e => setKey(e.target.value)}
          autoFocus autoComplete="current-password" required
          className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-gold/50"
          placeholder="Enter admin key"
        />
      </div>
      {error && <p className="text-red-400 text-xs mb-4 text-center">{error}</p>}
      <button
        type="submit" disabled={loading || !key.trim()}
        className="w-full py-3 bg-gold text-[#0e0f11] font-bold rounded-xl text-sm hover:bg-gold-light transition-colors disabled:opacity-50"
      >
        {loading ? 'Signing in…' : 'Sign In'}
      </button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[#0e0f11] flex items-center justify-center px-6">
      <Suspense fallback={<div className="text-gold">Loading…</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
