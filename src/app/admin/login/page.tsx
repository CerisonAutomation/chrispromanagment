/**
 * @fileoverview Admin login — Supabase Magic Link (OTP email) flow.
 * Premium Malta Gold glassmorphism design — full-screen centered card.
 */
'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useSearchParams } from 'next/navigation';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
      options: { emailRedirectTo: `${window.location.origin}${redirectTo}` },
    });
    setLoading(false);
    if (authError) {
      setError(authError.message);
    } else {
      setSent(true);
    }
  }

  return (
    <div className="login-bg">
      {/* Background orbs */}
      <div className="login-orb login-orb-1" />
      <div className="login-orb login-orb-2" />

      <div className="login-card">
        {/* Brand */}
        <div className="login-brand">
          <div className="login-logo">✦</div>
          <div>
            <p className="login-brand-name">Christiano CMS</p>
            <p className="login-brand-tagline">Property Management</p>
          </div>
        </div>

        {sent ? (
          /* Success state */
          <div className="login-sent">
            <div className="login-sent-icon">📬</div>
            <h1 className="login-sent-title">Check your email</h1>
            <p className="login-sent-body">
              We sent a magic link to <strong>{email}</strong>. Click it to sign in.
            </p>
            <button
              className="login-link-btn"
              onClick={() => setSent(false)}
            >
              ← Use a different email
            </button>
          </div>
        ) : (
          /* Login form */
          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-heading">
              <h1 className="login-title">Welcome back</h1>
              <p className="login-subtitle">Enter your email — we'll send a magic link.</p>
            </div>

            {error && (
              <div className="login-error" role="alert">
                <span>⚠</span> {error}
              </div>
            )}

            <div className="login-field">
              <label className="login-label" htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@christiano.com"
                className="login-input"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="login-submit"
            >
              {loading ? (
                <>
                  <span className="login-spinner" /> Sending magic link…
                </>
              ) : (
                'Send magic link →'
              )}
            </button>

            <p className="login-footer-note">
              Secure sign-in via Supabase Auth. No password required.
            </p>
          </form>
        )}
      </div>

      <style>{`
        * { box-sizing: border-box; }

        .login-bg {
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0a0b0d;
          position: relative;
          overflow: hidden;
          font-family: 'Inter', system-ui, sans-serif;
          padding: 24px;
        }

        .login-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
        }

        .login-orb-1 {
          width: 400px;
          height: 400px;
          background: rgba(200, 169, 106, 0.1);
          top: -100px;
          right: -100px;
        }

        .login-orb-2 {
          width: 300px;
          height: 300px;
          background: rgba(167, 139, 250, 0.07);
          bottom: -80px;
          left: -80px;
        }

        .login-card {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 420px;
          background: #111214;
          border: 1px solid rgba(200, 169, 106, 0.15);
          border-radius: 20px;
          padding: 36px;
          box-shadow: 0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03) inset;
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        /* Brand */
        .login-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .login-logo {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: linear-gradient(135deg, #c8a96a 0%, #9b7d3f 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          box-shadow: 0 0 24px rgba(200, 169, 106, 0.35);
          flex-shrink: 0;
        }

        .login-brand-name {
          font-size: 14px;
          font-weight: 800;
          color: #e8e4dc;
          margin: 0;
          letter-spacing: -0.02em;
        }

        .login-brand-tagline {
          font-size: 10px;
          color: rgba(232, 228, 220, 0.35);
          margin: 2px 0 0;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        /* Form */
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .login-heading {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .login-title {
          font-size: 22px;
          font-weight: 800;
          color: #e8e4dc;
          margin: 0;
          letter-spacing: -0.03em;
        }

        .login-subtitle {
          font-size: 13px;
          color: rgba(232, 228, 220, 0.4);
          margin: 0;
        }

        .login-error {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 11px 14px;
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 10px;
          color: #ef4444;
          font-size: 13px;
        }

        .login-field {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .login-label {
          font-size: 11px;
          font-weight: 700;
          color: rgba(232, 228, 220, 0.5);
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .login-input {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 12px 14px;
          font-size: 14px;
          color: #e8e4dc;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
          font-family: inherit;
          width: 100%;
        }
        .login-input:focus {
          border-color: rgba(200, 169, 106, 0.4);
          box-shadow: 0 0 0 3px rgba(200, 169, 106, 0.08);
        }
        .login-input::placeholder { color: rgba(232, 228, 220, 0.2); }

        .login-submit {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 13px;
          background: linear-gradient(135deg, #c8a96a 0%, #9b7d3f 100%);
          color: #0e0f11;
          border: none;
          border-radius: 11px;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          transition: opacity 0.15s, transform 0.12s;
          box-shadow: 0 0 30px rgba(200, 169, 106, 0.3);
          font-family: inherit;
          letter-spacing: -0.01em;
        }
        .login-submit:hover:not(:disabled) {
          opacity: 0.88;
          transform: translateY(-1px);
        }
        .login-submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @keyframes spin { to { transform: rotate(360deg); } }
        .login-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(0,0,0,0.2);
          border-top-color: #0e0f11;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          display: inline-block;
        }

        .login-footer-note {
          font-size: 11px;
          color: rgba(232, 228, 220, 0.2);
          text-align: center;
          margin: 0;
        }

        /* Sent state */
        .login-sent {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 12px;
        }

        .login-sent-icon {
          font-size: 48px;
          line-height: 1;
        }

        .login-sent-title {
          font-size: 20px;
          font-weight: 800;
          color: #e8e4dc;
          margin: 0;
          letter-spacing: -0.03em;
        }

        .login-sent-body {
          font-size: 14px;
          color: rgba(232, 228, 220, 0.5);
          margin: 0;
          max-width: 300px;
        }

        .login-sent-body strong { color: #c8a96a; font-weight: 700; }

        .login-link-btn {
          background: transparent;
          border: none;
          color: rgba(200, 169, 106, 0.6);
          font-size: 12px;
          cursor: pointer;
          padding: 4px 0;
          transition: color 0.12s;
          font-family: inherit;
          margin-top: 4px;
        }
        .login-link-btn:hover { color: #c8a96a; }
      `}</style>
    </div>
  );
}
