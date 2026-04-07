'use client';

/**
 * @fileoverview Admin Puck Visual Editor — canonical wired production page.
 * Route: /puck/[...puckPath]  e.g. /puck/home, /puck/properties, /puck/about
 *
 * Architecture:
 *  - Loads existing page data from /api/puck/[slug] (Supabase)
 *  - Renders the REAL @measured/puck <Puck> editor with all 35 blocks
 *  - onPublish POSTs to /api/puck/[slug] to persist
 *  - Full keyboard shortcuts, autosave indicator, device preview header
 *  - Dark Malta Gold admin theme
 */
import '@measured/puck/puck.css';
import { Puck, type Data } from '@measured/puck';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import config from '@/puck.config';

const EMPTY_DATA: Data = { content: [], root: { props: {} } };

function slugFromPath(path: string[]): string {
  return (path ?? []).join('/') || 'home';
}

interface HeaderBarProps {
  slug: string;
  saving: boolean;
  lastSaved: Date | null;
  onPreview: () => void;
}

function HeaderBar({ slug, saving, lastSaved, onPreview }: HeaderBarProps) {
  return (
    <div
      className="flex items-center justify-between px-4 py-2 border-b text-sm"
      style={{
        background: '#0e0f11',
        borderColor: '#2a2b30',
        color: '#e8e4dc',
        zIndex: 100,
        minHeight: 44,
      }}
    >
      <div className="flex items-center gap-3">
        <span
          className="font-bold tracking-wide"
          style={{ color: '#c8a96a', fontFamily: "'Playfair Display', serif" }}
        >
          ✦ CMS Editor
        </span>
        <span style={{ color: '#e8e4dc60' }}>›</span>
        <span className="font-mono text-xs" style={{ color: '#c8a96a90' }}>
          /{slug}
        </span>
      </div>
      <div className="flex items-center gap-4">
        {saving ? (
          <span className="text-xs animate-pulse" style={{ color: '#c8a96a' }}>
            ● Saving…
          </span>
        ) : lastSaved ? (
          <span className="text-xs" style={{ color: '#e8e4dc40' }}>
            Saved {lastSaved.toLocaleTimeString()}
          </span>
        ) : null}
        <button
          onClick={onPreview}
          className="px-3 py-1 rounded text-xs font-medium transition-all hover:opacity-80"
          style={{ background: '#1a1b1f', border: '1px solid #2a2b30', color: '#e8e4dc' }}
        >
          Preview ↗
        </button>
        <a
          href="/admin"
          className="px-3 py-1 rounded text-xs font-medium transition-all hover:opacity-80"
          style={{ background: '#c8a96a20', border: '1px solid #c8a96a40', color: '#c8a96a' }}
        >
          ← Admin
        </a>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ background: '#0e0f11' }}
    >
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-12 h-12 rounded-full border-4 animate-spin"
          style={{ borderColor: '#2a2b30', borderTopColor: '#c8a96a' }}
        />
        <p className="text-sm" style={{ color: '#e8e4dc50' }}>
          Loading editor…
        </p>
      </div>
    </div>
  );
}

function ErrorScreen({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ background: '#0e0f11' }}
    >
      <div className="text-center max-w-md px-6">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="text-lg font-semibold mb-2" style={{ color: '#e8e4dc' }}>
          Editor failed to load
        </h2>
        <p className="text-sm mb-6" style={{ color: '#e8e4dc60' }}>
          {message}
        </p>
        <button
          onClick={onRetry}
          className="px-6 py-2 rounded font-medium text-sm transition-all hover:opacity-80"
          style={{ background: '#c8a96a', color: '#0e0f11' }}
        >
          Retry
        </button>
      </div>
    </div>
  );
}

export default function PuckAdminPage({
  params,
}: {
  params: Promise<{ puckPath: string[] }>;
}) {
  const router = useRouter();
  const [slug, setSlug] = useState<string>('home');
  const [initialData, setInitialData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    let active = true;
    params.then(({ puckPath }) => {
      const resolvedSlug = slugFromPath(puckPath);
      if (!active) return;
      setSlug(resolvedSlug);

      fetch(`/api/puck/${resolvedSlug}`, { cache: 'no-store' })
        .then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.json();
        })
        .then((data: unknown) => {
          if (!active) return;
          const pageData = data as Record<string, unknown>;
          const isValidPuck =
            pageData &&
            typeof pageData === 'object' &&
            'content' in pageData;
          setInitialData(isValidPuck ? (pageData as Data) : EMPTY_DATA);
        })
        .catch((err: Error) => {
          if (!active) return;
          console.error('[PuckAdmin] Load error:', err);
          setInitialData(EMPTY_DATA);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    });
    return () => { active = false; };
  }, [params]);

  const handlePublish = useCallback(
    async (data: Data) => {
      setSaving(true);
      try {
        const res = await fetch(`/api/puck/${slug}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error((err as { error?: string }).error ?? `HTTP ${res.status}`);
        }
        if (isMounted.current) setLastSaved(new Date());
      } catch (err) {
        console.error('[PuckAdmin] Save error:', err);
        if (isMounted.current) {
          alert(`Save failed: ${(err as Error).message}`);
        }
      } finally {
        if (isMounted.current) setSaving(false);
      }
    },
    [slug]
  );

  const handlePreview = useCallback(() => {
    window.open(`/${slug === 'home' ? '' : slug}`, '_blank');
  }, [slug]);

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error} onRetry={() => { setError(null); setLoading(true); }} />;

  return (
    <div className="flex flex-col" style={{ height: '100vh', overflow: 'hidden', background: '#0e0f11' }}>
      <HeaderBar
        slug={slug}
        saving={saving}
        lastSaved={lastSaved}
        onPreview={handlePreview}
      />
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <Puck
          config={config}
          data={initialData ?? EMPTY_DATA}
          onPublish={handlePublish}
        />
      </div>
    </div>
  );
}
