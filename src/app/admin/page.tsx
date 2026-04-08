/**
 * @fileoverview Admin dashboard — Premium CMS overview with animated stat cards,
 * recent pages table, and quick actions.
 */
import Link from 'next/link';
import { getAllPages } from '@/lib/supabase';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Dashboard' };
export const revalidate = 0;

export default async function AdminDashboard() {
  const pages = await getAllPages();
  const published = pages.filter((p) => p.published);
  const drafts = pages.filter((p) => !p.published);
  const recentPages = [...pages]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 6);

  const stats = [
    { label: 'Total Pages', value: pages.length, icon: '📄', color: '#c8a96a' },
    { label: 'Published', value: published.length, icon: '✅', color: '#4ade80' },
    { label: 'Drafts', value: drafts.length, icon: '📝', color: '#f59e0b' },
    { label: 'Blocks Available', value: '50+', icon: '✦', color: '#a78bfa' },
  ];

  return (
    <div className="dash">
      {/* Header */}
      <header className="dash-header">
        <div>
          <h1 className="dash-title">Dashboard</h1>
          <p className="dash-sub">Welcome back — your CMS overview</p>
        </div>
        <Link href="/admin/pages/new" className="dash-cta">
          <span>✦</span> New Page
        </Link>
      </header>

      {/* Stats */}
      <section className="dash-stats">
        {stats.map(({ label, value, icon, color }) => (
          <div className="stat-card" key={label} style={{ '--accent': color } as React.CSSProperties}>
            <div className="stat-icon">{icon}</div>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
            <div className="stat-glow" />
          </div>
        ))}
      </section>

      {/* Quick Actions */}
      <section className="dash-section">
        <h2 className="section-title">Quick Actions</h2>
        <div className="actions-grid">
          <Link href="/admin/pages/new" className="action-card">
            <span className="action-icon">✦</span>
            <span className="action-label">Create New Page</span>
            <span className="action-arrow">→</span>
          </Link>
          <Link href="/admin/pages" className="action-card">
            <span className="action-icon">📄</span>
            <span className="action-label">Manage Pages</span>
            <span className="action-arrow">→</span>
          </Link>
          <Link href="/puck/home" className="action-card">
            <span className="action-icon">🎨</span>
            <span className="action-label">Edit Homepage</span>
            <span className="action-arrow">→</span>
          </Link>
          <Link href="/properties" className="action-card" target="_blank">
            <span className="action-icon">🏘</span>
            <span className="action-label">View Properties</span>
            <span className="action-arrow">↗</span>
          </Link>
        </div>
      </section>

      {/* Recent Pages */}
      <section className="dash-section">
        <div className="section-header">
          <h2 className="section-title">Recent Pages</h2>
          <Link href="/admin/pages" className="section-link">View all →</Link>
        </div>
        <div className="pages-table">
          {recentPages.length === 0 ? (
            <div className="pages-empty">
              <p>No pages yet.</p>
              <Link href="/admin/pages/new" className="dash-cta" style={{ marginTop: 12, display: 'inline-flex' }}>
                Create your first page →
              </Link>
            </div>
          ) : (
            recentPages.map((page) => (
              <div key={page.slug} className="page-row">
                <div className="page-info">
                  <p className="page-title">{page.title}</p>
                  <p className="page-slug">/{page.slug}</p>
                </div>
                <div className="page-meta">
                  <span className={`page-badge ${page.published ? 'badge-live' : 'badge-draft'}`}>
                    {page.published ? '● Live' : '○ Draft'}
                  </span>
                  <span className="page-date">
                    {new Date(page.updated_at).toLocaleDateString('en-MT', {
                      day: '2-digit', month: 'short', year: 'numeric',
                    })}
                  </span>
                  <Link href={`/puck/${page.slug}`} className="page-edit-btn">
                    Edit
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <style>{`
        .dash {
          padding: 32px;
          max-width: 1100px;
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        /* Header */
        .dash-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }

        .dash-title {
          font-size: 28px;
          font-weight: 800;
          color: #e8e4dc;
          margin: 0;
          letter-spacing: -0.03em;
        }

        .dash-sub {
          font-size: 13px;
          color: rgba(232, 228, 220, 0.4);
          margin: 4px 0 0;
        }

        .dash-cta {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 9px 18px;
          background: linear-gradient(135deg, #c8a96a 0%, #9b7d3f 100%);
          color: #0e0f11;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
          transition: opacity 0.15s;
          box-shadow: 0 0 20px rgba(200, 169, 106, 0.25);
        }
        .dash-cta:hover { opacity: 0.88; }

        /* Stats */
        .dash-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        @media (max-width: 800px) { .dash-stats { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 480px) { .dash-stats { grid-template-columns: 1fr; } }

        .stat-card {
          position: relative;
          background: #111214;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 20px;
          overflow: hidden;
          transition: border-color 0.2s, transform 0.2s;
        }
        .stat-card:hover {
          border-color: rgba(200, 169, 106, 0.25);
          transform: translateY(-2px);
        }

        .stat-glow {
          position: absolute;
          top: -30px;
          right: -30px;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: var(--accent, #c8a96a);
          opacity: 0.07;
          filter: blur(24px);
          pointer-events: none;
        }

        .stat-icon {
          font-size: 20px;
          margin-bottom: 12px;
        }

        .stat-value {
          font-size: 36px;
          font-weight: 800;
          color: var(--accent, #c8a96a);
          letter-spacing: -0.04em;
          line-height: 1;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 12px;
          color: rgba(232, 228, 220, 0.45);
          font-weight: 500;
        }

        /* Sections */
        .dash-section {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .section-title {
          font-size: 15px;
          font-weight: 700;
          color: rgba(232, 228, 220, 0.7);
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          font-size: 11px;
        }

        .section-link {
          font-size: 12px;
          color: #c8a96a;
          text-decoration: none;
          opacity: 0.7;
          transition: opacity 0.15s;
        }
        .section-link:hover { opacity: 1; }

        /* Actions Grid */
        .actions-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }

        @media (max-width: 800px) { .actions-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 480px) { .actions-grid { grid-template-columns: 1fr; } }

        .action-card {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 16px;
          background: #111214;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          color: rgba(232, 228, 220, 0.7);
          text-decoration: none;
          transition: all 0.15s ease;
        }
        .action-card:hover {
          background: rgba(200, 169, 106, 0.07);
          border-color: rgba(200, 169, 106, 0.25);
          color: #c8a96a;
          transform: translateY(-1px);
        }

        .action-icon { font-size: 16px; }
        .action-label { flex: 1; }
        .action-arrow { opacity: 0.4; font-size: 14px; }

        /* Pages Table */
        .pages-table {
          background: #111214;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          overflow: hidden;
        }

        .pages-empty {
          padding: 40px;
          text-align: center;
          color: rgba(232, 228, 220, 0.3);
          font-size: 14px;
        }

        .page-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          gap: 16px;
          transition: background 0.12s;
        }
        .page-row:last-child { border-bottom: none; }
        .page-row:hover { background: rgba(200, 169, 106, 0.04); }

        .page-info { min-width: 0; flex: 1; }

        .page-title {
          font-size: 14px;
          font-weight: 600;
          color: #e8e4dc;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .page-slug {
          font-size: 11px;
          color: rgba(232, 228, 220, 0.35);
          margin: 2px 0 0;
          font-family: monospace;
        }

        .page-meta {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }

        .page-badge {
          font-size: 10px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 999px;
          letter-spacing: 0.03em;
        }

        .badge-live {
          background: rgba(74, 222, 128, 0.12);
          color: #4ade80;
          border: 1px solid rgba(74, 222, 128, 0.2);
        }

        .badge-draft {
          background: rgba(245, 158, 11, 0.1);
          color: #f59e0b;
          border: 1px solid rgba(245, 158, 11, 0.2);
        }

        .page-date {
          font-size: 11px;
          color: rgba(232, 228, 220, 0.3);
          white-space: nowrap;
        }

        .page-edit-btn {
          font-size: 12px;
          font-weight: 600;
          color: #c8a96a;
          text-decoration: none;
          padding: 5px 12px;
          border: 1px solid rgba(200, 169, 106, 0.25);
          border-radius: 7px;
          transition: all 0.12s;
        }
        .page-edit-btn:hover {
          background: rgba(200, 169, 106, 0.1);
        }
      `}</style>
    </div>
  );
}
