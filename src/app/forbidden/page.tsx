/**
 * @fileoverview Forbidden Page — Shown when authenticated user lacks admin privileges
 * Premium Malta Gold design consistent with admin theme
 */
import Link from 'next/link';

export default function ForbiddenPage() {
  return (
    <div className="forbidden-page">
      <div className="forbidden-card">
        <div className="forbidden-icon">🔒</div>
        <h1 className="forbidden-title">Access Forbidden</h1>
        <p className="forbidden-message">
          You don't have permission to access the admin area.
          <br />
          Please contact an administrator if you believe this is an error.
        </p>
        <div className="forbidden-actions">
          <Link href="/" className="forbidden-btn home">
            ← Back to Home
          </Link>
          <form action="/api/auth/signout" method="POST" className="forbidden-form">
            <button type="submit" className="forbidden-btn signout">
              Sign out
            </button>
          </form>
        </div>
      </div>

      <style>{`
        * { box-sizing: border-box; }

        .forbidden-page {
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0a0b0d;
          font-family: 'Inter', system-ui, sans-serif;
          padding: 24px;
        }

        .forbidden-card {
          width: 100%;
          max-width: 420px;
          background: #111214;
          border: 1px solid rgba(200, 169, 106, 0.15);
          border-radius: 20px;
          padding: 48px 36px;
          text-align: center;
          box-shadow: 0 24px 80px rgba(0,0,0,0.5);
        }

        .forbidden-icon {
          font-size: 64px;
          line-height: 1;
          margin-bottom: 24px;
        }

        .forbidden-title {
          font-size: 28px;
          font-weight: 800;
          color: #e8e4dc;
          margin: 0 0 16px;
          letter-spacing: -0.03em;
        }

        .forbidden-message {
          font-size: 14px;
          color: rgba(232, 228, 220, 0.5);
          line-height: 1.6;
          margin: 0 0 32px;
        }

        .forbidden-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
        }

        .forbidden-btn {
          padding: 11px 20px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.15s ease;
          font-family: inherit;
          cursor: pointer;
        }

        .forbidden-btn.home {
          background: linear-gradient(135deg, #c8a96a 0%, #9b7d3f 100%);
          color: #0e0f11;
          border: none;
          box-shadow: 0 0 30px rgba(200, 169, 106, 0.3);
        }

        .forbidden-btn.home:hover {
          opacity: 0.88;
          transform: translateY(-1px);
        }

        .forbidden-btn.signout {
          background: transparent;
          border: 1px solid rgba(200, 169, 106, 0.2);
          color: rgba(232, 228, 220, 0.5);
        }

        .forbidden-btn.signout:hover {
          background: rgba(200, 169, 106, 0.08);
          color: #c8a96a;
          border-color: rgba(200, 169, 106, 0.3);
        }

        .forbidden-form {
          margin: 0;
        }
      `}</style>
    </div>
  );
}
