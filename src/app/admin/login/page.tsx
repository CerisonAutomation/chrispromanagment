/**
 * @fileoverview Admin login — Supabase Magic Link (OTP email) flow.
 */
'use client';
import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') ?? '/admin';

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}${redirectTo}`,
      },
    });
    setLoading(false);
    if (authError) {
      setError(authError.message);
    } else {
      setSent(true);
    }
  }

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-3 max-w-sm p-8">
          <div className="text-5xl">📬</div>
          <h1 className="text-xl font-bold">Check your email</h1>
          <p className="text-muted-foreground text-sm">
            We sent a magic link to <strong>{email}</strong>. Click the link to sign in.
          </p>
          <Button variant="ghost" onClick={() => setSent(false)}>Use different email</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-5 p-8 rounded-2xl border border-border shadow-lg bg-card"
      >
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Admin Sign In</h1>
          <p className="text-sm text-muted-foreground">Enter your email to receive a magic link.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
        {error && (
          <p className="text-sm text-destructive" role="alert">{error}</p>
        )}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Sending…' : 'Send magic link'}
        </Button>
      </form>
    </div>
  );
}
