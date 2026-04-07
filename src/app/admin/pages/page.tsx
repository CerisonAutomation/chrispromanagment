'use client';
/**
 * @fileoverview Admin Pages Manager — lists all CMS pages from Supabase.
 * Route: /admin/pages
 *
 * Defensive: pages always defaults to [] — never .map() crashes.
 * Features: list, create new, open in editor, toggle published, delete.
 */
import { useEffect, useState, useCallback } from 'react';

interface Page {
  id: string;
  slug: string;
  title: string;
  published: boolean;
  theme: string;
  updated_at: string;
}

export default function AdminPagesManager() {
  const [pages, setPages] = useState<Page[]>([]); // ← never undefined
  const [loading, setLoading] = useState(true);
  const [newSlug, setNewSlug] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchPages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/pages', { cache: 'no-store' });
      const json = await res.json() as { pages?: Page[] };
      // Defensive: always array
      setPages(Array.isArray(json?.pages) ? json.pages : []);
    } catch (e) {
      console.error('[AdminPages] fetch error:', e);
      setPages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchPages(); }, [fetchPages]);

  const createPage = async () => {
    const s = newSlug.trim().toLowerCase().replace(/[^a-z0-9-/]/g, '-');
    if (!s) return;
    setCreating(true);
    await fetch(`/api/puck/${s}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: [], root: { props: { title: s, theme: 'malta-gold' } } }),
    });
    setNewSlug('');
    setCreating(false);
    void fetchPages();
  };

  const togglePublish = async (p: Page) => {
    await fetch(`/api/puck/${p.slug}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !p.published }),
    });
    void fetchPages();
  };

  const deletePage = async (p: Page) => {
    if (!confirm(`Delete "${p.title}"? This cannot be undone.`)) return;
    await fetch(`/api/puck/${p.slug}`, { method: 'DELETE' });
    void fetchPages();
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0e0f11', color: '#e8e4dc', padding: 32 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#c8a96a', marginBottom: 24 }}>✦ Pages</h1>

      {/* Create new page */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
        <input
          value={newSlug}
          onChange={(e) => setNewSlug(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && createPage()}
          placeholder="new-page-slug"
          style={{ flex: 1, padding: '8px 12px', borderRadius: 6, background: '#1a1b1f', border: '1px solid #2a2b30', color: '#e8e4dc', fontSize: 13 }}
        />
        <button
          onClick={createPage}
          disabled={creating || !newSlug.trim()}
          style={{ padding: '8px 18px', borderRadius: 6, background: '#c8a96a', color: '#0e0f11', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: 13, opacity: creating ? 0.6 : 1 }}
        >
          {creating ? 'Creating…' : '+ Create Page'}
        </button>
      </div>

      {/* Pages list */}
      {loading ? (
        <p style={{ color: '#e8e4dc40', fontSize: 13 }}>Loading pages…</p>
      ) : pages.length === 0 ? (
        <p style={{ color: '#e8e4dc40', fontSize: 13 }}>No pages yet. Create one above.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {pages.map((page) => ( // ← safe: pages always []
            <div key={page.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 16px', borderRadius: 8, background: '#1a1b1f', border: '1px solid #2a2b30',
            }}>
              <div>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{page.title}</span>
                <span style={{ marginLeft: 10, fontSize: 12, color: '#e8e4dc40' }}>/{page.slug}</span>
                <span style={{
                  marginLeft: 10, fontSize: 11, padding: '2px 7px', borderRadius: 99,
                  background: page.published ? '#16a34a20' : '#71717a20',
                  color: page.published ? '#4ade80' : '#71717a',
                }}>
                  {page.published ? 'Published' : 'Draft'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <a href={`/puck/${page.slug}`}
                  style={{ fontSize: 12, padding: '5px 12px', borderRadius: 5, border: '1px solid #c8a96a40', color: '#c8a96a', textDecoration: 'none' }}>
                  Edit
                </a>
                <button onClick={() => togglePublish(page)}
                  style={{ fontSize: 12, padding: '5px 12px', borderRadius: 5, border: '1px solid #2a2b30', background: 'transparent', color: '#e8e4dc', cursor: 'pointer' }}>
                  {page.published ? 'Unpublish' : 'Publish'}
                </button>
                <button onClick={() => deletePage(page)}
                  style={{ fontSize: 12, padding: '5px 12px', borderRadius: 5, border: '1px solid #ef444430', background: 'transparent', color: '#ef4444', cursor: 'pointer' }}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
