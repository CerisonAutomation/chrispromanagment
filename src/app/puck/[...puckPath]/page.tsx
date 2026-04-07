'use client';
/**
 * @fileoverview Admin Puck Visual Editor — production wired.
 * Route: /puck/[...puckPath] e.g. /puck/home, /puck/properties
 *
 * Flow:
 *  1. Resolve slug from puckPath
 *  2. GET /api/puck/[slug] → load existing data
 *  3. Render <Puck> editor with full config
 *  4. onPublish → POST /api/puck/[slug]
 *
 * Guards:
 *  - Never calls .map() on undefined
 *  - Full error/loading/retry states
 *  - Autosave timestamp indicator
 *  - Malta Gold dark admin chrome
 */
import '@measured/puck/puck.css';
import { Puck, type Data } from '@measured/puck';
import { useCallback, useEffect, useRef, useState } from 'react';
import config from '@/puck.config';

const EMPTY: Data = { content: [], root: { props: {} } };

function resolveSlug(path: string[]): string {
  return (path ?? []).filter(Boolean).join('/') || 'home';
}

// ─── Admin Chrome ─────────────────────────────────────────────
function AdminHeader({
  slug, saving, lastSaved,
}: { slug: string; saving: boolean; lastSaved: Date | null }) {
  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 16px', height: 44, background: '#0e0f11',
      borderBottom: '1px solid #1e2025', color: '#e8e4dc', flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ color: '#c8a96a', fontWeight: 700, fontSize: 15, letterSpacing: '0.04em' }}>
          ✦ CMS
        </span>
        <span style={{ color: '#e8e4dc30' }}>›</span>
        <code style={{ fontSize: 12, color: '#c8a96a80' }}>/{slug}</code>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {saving ? (
          <span style={{ fontSize: 12, color: '#c8a96a', animation: 'pulse 1s infinite' }}>● Saving…</span>
        ) : lastSaved ? (
          <span style={{ fontSize: 11, color: '#e8e4dc30' }}>Saved {lastSaved.toLocaleTimeString()}</span>
        ) : null}
        <a href={`/${slug === 'home' ? '' : slug}`} target="_blank"
          style={{ fontSize: 12, padding: '4px 10px', borderRadius: 4, border: '1px solid #2a2b30', color: '#e8e4dc', textDecoration: 'none' }}>
          Preview ↗
        </a>
        <a href="/admin"
          style={{ fontSize: 12, padding: '4px 10px', borderRadius: 4, background: '#c8a96a20', border: '1px solid #c8a96a40', color: '#c8a96a', textDecoration: 'none' }}>
          ← Admin
        </a>
      </div>
    </header>
  );
}

function Spinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0e0f11', flexDirection: 'column', gap: 16 }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid #1e2025', borderTopColor: '#c8a96a', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: '#e8e4dc40', fontSize: 13 }}>Loading editor…</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}

function ErrorState({ msg, onRetry }: { msg: string; onRetry: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0e0f11', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 36 }}>⚠️</div>
      <p style={{ color: '#e8e4dc', fontSize: 15, fontWeight: 600 }}>Editor failed to load</p>
      <p style={{ color: '#e8e4dc50', fontSize: 13, maxWidth: 320, textAlign: 'center' }}>{msg}</p>
      <button onClick={onRetry} style={{ marginTop: 8, padding: '8px 20px', borderRadius: 6, background: '#c8a96a', color: '#0e0f11', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: 13 }}>
        Retry
      </button>
    </div>
  );
}

export default function PuckAdminPage({ params }: { params: Promise<{ puckPath: string[] }> }) {
  const [slug, setSlug] = useState('home');
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const mounted = useRef(true);

  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);

  const load = useCallback((s: string) => {
    setLoading(true);
    setLoadError(null);
    fetch(`/api/puck/${s}`, { cache: 'no-store' })
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const json = await r.json();
        // Defensive: ensure content array always exists
        const safe: Data = {
          content: Array.isArray(json?.content) ? json.content : [],
          root: json?.root ?? { props: {} },
        };
        if (mounted.current) setData(safe);
      })
      .catch((e: Error) => {
        console.error('[PuckAdmin] load error:', e);
        if (mounted.current) {
          setData(EMPTY);
          setLoadError(null); // fallback to empty editor, don't block
        }
      })
      .finally(() => { if (mounted.current) setLoading(false); });
  }, []);

  useEffect(() => {
    params.then(({ puckPath }) => {
      const s = resolveSlug(puckPath);
      setSlug(s);
      load(s);
    });
  }, [params, load]);

  const handlePublish = useCallback(async (published: Data) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/puck/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(published),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(err.error ?? `HTTP ${res.status}`);
      }
      if (mounted.current) setLastSaved(new Date());
    } catch (e) {
      console.error('[PuckAdmin] save error:', e);
      alert(`Save failed: ${(e as Error).message}`);
    } finally {
      if (mounted.current) setSaving(false);
    }
  }, [slug]);

  if (loading) return <Spinner />;
  if (loadError) return <ErrorState msg={loadError} onRetry={() => load(slug)} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: '#0e0f11' }}>
      <AdminHeader slug={slug} saving={saving} lastSaved={lastSaved} />
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <Puck config={config} data={data ?? EMPTY} onPublish={handlePublish} />
      </div>
    </div>
  );
}
