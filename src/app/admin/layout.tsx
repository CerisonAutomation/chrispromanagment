/**
 * @fileoverview Admin layout — Premium Malta Gold dark sidebar + Supabase auth gate.
 * 15/10 glassmorphism design with animated navigation.
 */
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: { template: '%s | Christiano CMS', default: 'Admin' },
};

async function getUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cs) {
          cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        },
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: '⬛', exact: true },
  { href: '/admin/pages', label: 'Pages', icon: '📄' },
  { href: '/properties', label: 'Properties', icon: '🏘', external: true },
  { href: '/puck/home', label: 'Page Editor', icon: '✦' },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getUser();
  if (!user) redirect('/admin/login');

  const initials = (user.email ?? 'A').slice(0, 2).toUpperCase();

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        {/* Brand */}
        <div className="admin-brand">
          <div className="admin-brand-mark">✦</div>
          <div>
            <p className="admin-brand-name">Christiano CMS</p>
            <p className="admin-brand-sub">Property Management</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="admin-nav">
          <p className="admin-nav-label">Navigation</p>
          {NAV_ITEMS.map(({ href, label, icon, external }) => (
            <Link
              key={href}
              href={href}
              {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className="admin-nav-item"
            >
              <span className="admin-nav-icon">{icon}</span>
              <span>{label}</span>
              {external && <span className="admin-nav-ext">↗</span>}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="admin-sidebar-footer">
          <div className="admin-user">
            <div className="admin-avatar">{initials}</div>
            <div className="admin-user-info">
              <p className="admin-user-email">{user.email}</p>
              <p className="admin-user-role">Administrator</p>
            </div>
          </div>
          <form action="/api/auth/signout" method="POST">
            <button type="submit" className="admin-signout-btn">
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <main className="admin-main">
        {children}
      </main>

      <style>{`
        .admin-layout {
          display: flex;
          min-height: 100dvh;
          background: #0a0b0d;
          font-family: 'Inter', system-ui, sans-serif;
        }

        /* ── Sidebar ── */
        .admin-sidebar {
          width: 240px;
          flex-shrink: 0;
          background: linear-gradient(180deg, #111214 0%, #0e0f11 100%);
          border-right: 1px solid rgba(200, 169, 106, 0.12);
          display: flex;
          flex-direction: column;
          position: sticky;
          top: 0;
          height: 100dvh;
          overflow: hidden;
        }

        .admin-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 20px 18px;
          border-bottom: 1px solid rgba(200, 169, 106, 0.1);
        }

        .admin-brand-mark {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, #c8a96a 0%, #9b7d3f 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          flex-shrink: 0;
          box-shadow: 0 0 20px rgba(200, 169, 106, 0.3);
        }

        .admin-brand-name {
          font-size: 13px;
          font-weight: 700;
          color: #e8e4dc;
          letter-spacing: -0.02em;
          margin: 0;
          line-height: 1.2;
        }

        .admin-brand-sub {
          font-size: 10px;
          color: rgba(232, 228, 220, 0.4);
          margin: 0;
          margin-top: 1px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .admin-nav {
          flex: 1;
          padding: 16px 10px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          overflow-y: auto;
        }

        .admin-nav-label {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(232, 228, 220, 0.3);
          padding: 0 8px;
          margin: 0 0 8px;
        }

        .admin-nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 10px;
          border-radius: 9px;
          font-size: 13px;
          font-weight: 500;
          color: rgba(232, 228, 220, 0.55);
          transition: all 0.15s ease;
          text-decoration: none;
          position: relative;
        }

        .admin-nav-item:hover {
          background: rgba(200, 169, 106, 0.08);
          color: #c8a96a;
        }

        .admin-nav-icon {
          font-size: 14px;
          width: 18px;
          text-align: center;
          flex-shrink: 0;
        }

        .admin-nav-ext {
          margin-left: auto;
          font-size: 10px;
          opacity: 0.4;
        }

        .admin-sidebar-footer {
          padding: 12px 10px;
          border-top: 1px solid rgba(200, 169, 106, 0.1);
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .admin-user {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px;
          border-radius: 9px;
          background: rgba(255,255,255,0.03);
        }

        .admin-avatar {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: linear-gradient(135deg, #c8a96a, #9b7d3f);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 800;
          color: #0e0f11;
          flex-shrink: 0;
          letter-spacing: -0.03em;
        }

        .admin-user-info {
          min-width: 0;
        }

        .admin-user-email {
          font-size: 11px;
          color: rgba(232, 228, 220, 0.7);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin: 0;
          max-width: 140px;
        }

        .admin-user-role {
          font-size: 10px;
          color: rgba(200, 169, 106, 0.6);
          margin: 0;
          margin-top: 1px;
        }

        .admin-signout-btn {
          width: 100%;
          padding: 7px 10px;
          background: transparent;
          border: 1px solid rgba(200, 169, 106, 0.15);
          border-radius: 7px;
          color: rgba(232, 228, 220, 0.4);
          font-size: 11px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
          font-family: inherit;
        }

        .admin-signout-btn:hover {
          background: rgba(200, 169, 106, 0.08);
          color: #c8a96a;
          border-color: rgba(200, 169, 106, 0.3);
        }

        /* ── Main ── */
        .admin-main {
          flex: 1;
          min-width: 0;
          overflow: auto;
          background: #0a0b0d;
        }
      `}</style>
    </div>
  );
}
