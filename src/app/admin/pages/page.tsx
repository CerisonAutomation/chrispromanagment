/**
 * @fileoverview Admin pages list — Full CMS page manager.
 * Premium table with server actions for publish/unpublish/delete.
 */
import Link from 'next/link';
import { getAllPages } from '@/lib/supabase';
import { togglePublish, deletePage } from '@/lib/actions/pages';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Pages' };
export const revalidate = 0;

export default async function AdminPagesListPage() {
  const pages = await getAllPages();
  const published = pages.filter((p) => p.published).length;

  return (
    <div className="pages-shell">
      {/* Header */}
      <header className="pages-header">
        <div>
          <h1 className="pages-title">Pages</h1>
          <p className="pages-sub">
            {pages.length} total · {published} live · {pages.length - published} drafts
          </p>
        </div>
        <Link href="/admin/pages/new" className="pages-cta">
          <span>✦</span> New Page
        </Link>
      </header>

      {/* Table */}
      <div className="pages-card">
        {/* Table Head */}
        <div className="pages-thead">
          <span>Title</span>
          <span>Slug</span>
          <span>Status</span>
          <span>Updated</span>
          <span className="pages-th-actions">Actions</span>
        </div>

        {/* Rows */}
        {pages.length === 0 ? (
          <div className="pages-empty">
            <p>No pages yet.</p>
            <Link href="/admin/pages/new" className="pages-cta" style={{ marginTop: 12 }}>
              Create your first page →
            </Link>
          </div>
        ) : (
          pages.map((page) => (
            <div key={page.slug} className="prow">
              {/* Title */}
              <div className="prow-title-col">
                <p className="prow-title">{page.title}</p>
              </div>

              {/* Slug */}
              <div className="prow-slug-col">
                <code className="prow-slug">/{page.slug}</code>
              </div>

              {/* Status */}
              <div>
                <span className={`prow-badge ${page.published ? 'badge-live' : 'badge-draft'}`}>
                  {page.published ? '● Live' : '○ Draft'}
                </span>
              </div>

              {/* Date */}
              <div className="prow-date">
                {new Date(page.updated_at).toLocaleDateString('en-MT', {
                  day: '2-digit', month: 'short', year: 'numeric',
                })}
              </div>

              {/* Actions */}
              <div className="prow-actions">
                {/* View live (only if published) */}
                {page.published && (
                  <a
                    href={`/${page.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="prow-btn prow-btn-ghost"
                    title="View live"
                  >
                    ↗
                  </a>
                )}

                {/* Open in editor */}
                <Link href={`/puck/${page.slug}`} className="prow-btn prow-btn-edit">
                  Edit
                </Link>

                {/* Toggle publish */}
                <form
                  action={async () => {
                    'use server';
                    await togglePublish(page.slug, !page.published);
                  }}
                >
                  <button
                    type="submit"
                    className={`prow-btn ${page.published ? 'prow-btn-unpublish' : 'prow-btn-publish'}`}
                  >
                    {page.published ? 'Unpublish' : 'Publish'}
                  </button>
                </form>

                {/* Delete */}
                <form
                  action={async () => {
                    'use server';
                    await deletePage(page.slug);
                  }}
                >
                  <button
                    type="submit"
                    className="prow-btn prow-btn-delete"
                    onClick={(e) => {
                      if (!confirm(`Delete "${page.title}"? This cannot be undone.`)) {
                        e.preventDefault();
                      }
                    }}
                    title="Delete page"
                  >
                    ✕
                  </button>
                </form>
              </div>
            </div>
          ))
        )}
      </div>

      <style>{`
        .pages-shell {
          padding: 32px;
          max-width: 1100px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          font-family: 'Inter', system-ui, sans-serif;
        }

        .pages-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }

        .pages-title {
          font-size: 28px;
          font-weight: 800;
          color: #e8e4dc;
          margin: 0;
          letter-spacing: -0.03em;
        }

        .pages-sub {
          font-size: 13px;
          color: rgba(232, 228, 220, 0.4);
          margin: 4px 0 0;
        }

        .pages-cta {
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
          box-shadow: 0 0 20px rgba(200, 169, 106, 0.2);
        }
        .pages-cta:hover { opacity: 0.88; }

        .pages-card {
          background: #111214;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          overflow: hidden;
        }

        /* Table head */
        .pages-thead {
          display: grid;
          grid-template-columns: 2fr 1.5fr 100px 110px 220px;
          padding: 11px 20px;
          background: rgba(255,255,255,0.025);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(232, 228, 220, 0.3);
          gap: 16px;
          align-items: center;
        }

        .pages-th-actions { text-align: right; }

        /* Row */
        .prow {
          display: grid;
          grid-template-columns: 2fr 1.5fr 100px 110px 220px;
          padding: 14px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          gap: 16px;
          align-items: center;
          transition: background 0.12s;
        }
        .prow:last-child { border-bottom: none; }
        .prow:hover { background: rgba(200, 169, 106, 0.035); }

        .prow-title-col { min-width: 0; }

        .prow-title {
          font-size: 14px;
          font-weight: 600;
          color: #e8e4dc;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .prow-slug-col { min-width: 0; }

        .prow-slug {
          font-size: 11px;
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          color: rgba(200, 169, 106, 0.55);
          background: rgba(200, 169, 106, 0.08);
          padding: 2px 7px;
          border-radius: 5px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          display: block;
        }

        .prow-badge {
          font-size: 10px;
          font-weight: 700;
          padding: 3px 9px;
          border-radius: 999px;
          letter-spacing: 0.03em;
          white-space: nowrap;
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

        .prow-date {
          font-size: 11px;
          color: rgba(232, 228, 220, 0.3);
          white-space: nowrap;
        }

        .prow-actions {
          display: flex;
          align-items: center;
          gap: 6px;
          justify-content: flex-end;
        }

        .prow-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 5px 11px;
          border-radius: 7px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.12s;
          border: 1px solid transparent;
          font-family: inherit;
          white-space: nowrap;
          background: transparent;
        }

        .prow-btn-ghost {
          color: rgba(232, 228, 220, 0.4);
          border-color: rgba(255,255,255,0.08);
        }
        .prow-btn-ghost:hover {
          color: #e8e4dc;
          background: rgba(255,255,255,0.06);
        }

        .prow-btn-edit {
          color: #c8a96a;
          border-color: rgba(200, 169, 106, 0.25);
        }
        .prow-btn-edit:hover {
          background: rgba(200, 169, 106, 0.1);
        }

        .prow-btn-publish {
          color: #4ade80;
          border-color: rgba(74, 222, 128, 0.25);
        }
        .prow-btn-publish:hover {
          background: rgba(74, 222, 128, 0.1);
        }

        .prow-btn-unpublish {
          color: #f59e0b;
          border-color: rgba(245, 158, 11, 0.25);
        }
        .prow-btn-unpublish:hover {
          background: rgba(245, 158, 11, 0.1);
        }

        .prow-btn-delete {
          color: rgba(239, 68, 68, 0.6);
          border-color: rgba(239, 68, 68, 0.15);
          padding: 5px 9px;
        }
        .prow-btn-delete:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border-color: rgba(239, 68, 68, 0.3);
        }

        .pages-empty {
          padding: 48px;
          text-align: center;
          color: rgba(232, 228, 220, 0.3);
          font-size: 14px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        @media (max-width: 900px) {
          .pages-thead,
          .prow {
            grid-template-columns: 1fr 120px 100px;
          }
          .prow-slug-col,
          .prow-date,
          .pages-thead span:nth-child(2),
          .pages-thead span:nth-child(4) {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
