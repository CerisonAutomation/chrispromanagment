'use client';
/**
 * @fileoverview Admin — Pages Manager. /admin/pages
 * Lists all CMS pages. Create, edit, publish/unpublish, delete.
 */
import { useCallback, useEffect, useState } from 'react';
import type { CmsPage } from '@/types';

export default function AdminPagesManager() {
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSlug, setNewSlug] = useState('');
  const [creating, setCreating] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/pages', { cache: 'no-store' });
      const j = await r.json() as { pages?: CmsPage[] };
      setPages(Array.isArray(j?.pages) ? j.pages : []);
    } catch { setPages([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const create = async () => {
    const s = newSlug.trim().toLowerCase().replace(/[^a-z0-9\-/]/g, '-');
    if (!s) return;
    setCreating(true);
    await fetch(`/api/puck/${s}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: [], root: { props: { title: s, theme: 'malta-gold' } } }),
    });
    setNewSlug(''); setCreating(false); void refresh();
  };

  const toggle = async (p: CmsPage) => {
    await fetch(`/api/puck/${p.slug}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !p.published }),
    });
    void refresh();
  };

  const remove = async (p: CmsPage) => {
    if (!confirm(`Delete "${p.title}"?`)) return;
    await fetch(`/api/puck/${p.slug}`, { method: 'DELETE' });
    void refresh();
  };

  const s = { bg: '#0e0f11', surface: '#1a1b1f', border: '1px solid #2a2b30', gold: '#c8a96a', text: '#e8e4dc' };

  return (
    <div style={{ minHeight: '100vh', background: s.bg, color: s.text, padding: 32, fontFamily: 'inherit' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: s.gold, marginBottom: 8 }}>✦ Pages</h1>
        <p style={{ color: '#e8e4dc50', fontSize: 13, marginBottom: 28 }}>
          {pages.length} page{pages.length !== 1 ? 's' : ''}
        </p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
          <input value={newSlug} onChange={e => setNewSlug(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && create()}
            placeholder="new-page-slug"
            style={{ flex: 1, padding: '9px 14px', borderRadius: 6, background: s.surface, border: s.border, color: s.text, fontSize: 13, outline: 'none' }} />
          <button onClick={create} disabled={creating || !newSlug.trim()}
            style={{ padding: '9px 20px', borderRadius: 6, background: s.gold, color: '#0e0f11', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: 13, opacity: creating ? 0.6 : 1 }}>
            {creating ? 'Creating…' : '+ New Page'}
          </button>
        </div>
        {loading ? (
          <p style={{ color: '#e8e4dc30', fontSize: 13 }}>Loading…</p>
        ) : pages.length === 0 ? (
          <p style={{ color: '#e8e4dc30', fontSize: 13 }}>No pages yet. Create one above.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {pages.map(p => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 8, background: s.surface, border: s.border }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{p.title}</span>
                  <code style={{ fontSize: 12, color: '#e8e4dc40' }}>/{p.slug}</code>
                  <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 99, background: p.published ? '#16a34a20' : '#71717a20', color: p.published ? '#4ade80' : '#71717a' }}>
                    {p.published ? 'Published' : 'Draft'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <a href={`/puck/${p.slug}`} style={{ fontSize: 12, padding: '5px 12px', borderRadius: 5, border: `1px solid ${s.gold}40`, color: s.gold }}>Edit</a>
                  <button onClick={() => toggle(p)} style={{ fontSize: 12, padding: '5px 12px', borderRadius: 5, border: s.border, background: 'transparent', color: s.text, cursor: 'pointer' }}>
                    {p.published ? 'Unpublish' : 'Publish'}
                  </button>
                  <a href={`/${p.slug === 'home' ? '' : p.slug}`} target="_blank" style={{ fontSize: 12, padding: '5px 12px', borderRadius: 5, border: s.border, color: '#e8e4dc80' }}>View ↗</a>
                  <button onClick={() => remove(p)} style={{ fontSize: 12, padding: '5px 12px', borderRadius: 5, border: '1px solid #ef444430', background: 'transparent', color: '#ef4444', cursor: 'pointer' }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
