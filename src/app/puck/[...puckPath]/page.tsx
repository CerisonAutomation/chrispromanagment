'use client';
/**
 * @fileoverview Puck visual editor — /puck/[slug]
 * Admin-only. Loads page data, renders Puck editor, saves on publish.
 */
import '@measured/puck/puck.css';
import { Puck, type Data } from '@measured/puck';
import { useCallback, useEffect, useRef, useState } from 'react';
import config from '@/puck.config';

const EMPTY: Data = { content: [], root: { props: {} } };

function resolveSlug(path: string[]): string {
  return (path ?? []).filter(Boolean).join('/') || 'home';
}

export default function PuckEditor({ params }: { params: Promise<{ puckPath: string[] }> }) {
  const [slug, setSlug] = useState('home');
  const [data, setData] = useState<Data>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const alive = useRef(true);

  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);

  useEffect(() => {
    params.then(({ puckPath }) => {
      const s = resolveSlug(puckPath);
      if (alive.current) setSlug(s);
      fetch(`/api/puck/${s}`, { cache: 'no-store' })
        .then(async (r) => {
          const json = await r.json();
          if (alive.current) setData({
            content: Array.isArray(json?.content) ? json.content : [],
            root: json?.root ?? { props: {} },
          });
        })
        .catch(() => { if (alive.current) setData(EMPTY); })
        .finally(() => { if (alive.current) setLoading(false); });
    });
  }, [params]);

  const onPublish = useCallback(async (published: Data) => {
    setSaving(true);
    try {
      await fetch(`/api/puck/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(published),
      });
      if (alive.current) setLastSaved(new Date());
    } catch (e) {
      alert(`Save failed: ${(e as Error).message}`);
    } finally {
      if (alive.current) setSaving(false);
    }
  }, [slug]);

  if (loading) return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#0e0f11', color: '#c8a96a', fontSize: 14 }}>
      Loading editor…
    </div>
  );

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0e0f11' }}>
      <header style={{ height: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', background: '#0a0b0d', borderBottom: '1px solid #1e2025', flexShrink: 0 }}>
        <span style={{ color: '#c8a96a', fontWeight: 700, fontSize: 14 }}>✦ CMS / <code style={{ opacity: 0.6, fontWeight: 400 }}>/{slug}</code></span>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {saving && <span style={{ fontSize: 12, color: '#c8a96a' }}>Saving…</span>}
          {!saving && lastSaved && <span style={{ fontSize: 11, color: '#e8e4dc30' }}>Saved {lastSaved.toLocaleTimeString()}</span>}
          <a href={`/${slug === 'home' ? '' : slug}`} target="_blank" style={{ fontSize: 12, padding: '4px 10px', border: '1px solid #2a2b30', borderRadius: 4, color: '#e8e4dc' }}>Preview ↗</a>
          <a href="/admin/pages" style={{ fontSize: 12, padding: '4px 10px', border: '1px solid #c8a96a40', borderRadius: 4, color: '#c8a96a' }}>← Pages</a>
        </div>
      </header>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <Puck config={config} data={data} onPublish={onPublish} />
      </div>
    </div>
  );
}
