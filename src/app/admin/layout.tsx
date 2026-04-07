/**
 * @fileoverview Admin shell layout — nav sidebar + content area.
 */
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Admin — Christo PM' };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0e0f11', color: '#e8e4dc', fontFamily: 'inherit' }}>
      {/* Sidebar */}
      <nav style={{ width: 220, background: '#0a0b0d', borderRight: '1px solid #1e2025', display: 'flex', flexDirection: 'column', padding: '24px 0', flexShrink: 0 }}>
        <div style={{ padding: '0 20px 24px', borderBottom: '1px solid #1e2025', marginBottom: 16 }}>
          <span style={{ color: '#c8a96a', fontWeight: 700, fontSize: 15, letterSpacing: '0.04em' }}>✦ Admin</span>
        </div>
        {([
          { href: '/admin', label: '⌂ Dashboard' },
          { href: '/admin/pages', label: '📄 Pages' },
          { href: '/admin/properties', label: '🏠 Properties' },
          { href: '/admin/bookings', label: '📅 Bookings' },
        ] as const).map(link => (
          <a key={link.href} href={link.href}
            style={{ padding: '10px 20px', fontSize: 13, color: '#e8e4dc90', textDecoration: 'none', transition: 'color 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#c8a96a')}
            onMouseLeave={e => (e.currentTarget.style.color = '#e8e4dc90')}>
            {link.label}
          </a>
        ))}
        <div style={{ flex: 1 }} />
        <a href="/" style={{ padding: '10px 20px', fontSize: 12, color: '#e8e4dc30' }}>← View Site</a>
      </nav>
      {/* Content */}
      <main style={{ flex: 1, overflow: 'auto' }}>{children}</main>
    </div>
  );
}
