/**
 * @fileoverview 404 page — elegant, on-brand.
 */
import Link from 'next/link';

export default function NotFound() {
  return (
    <main style={{ background: '#0e0f11', color: '#e8e4dc', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, textAlign: 'center', padding: 24 }}>
      <div style={{ fontSize: 72, fontWeight: 800, color: '#c8a96a', opacity: 0.3, lineHeight: 1 }}>404</div>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginTop: -8 }}>Page not found</h1>
      <p style={{ color: '#e8e4dc60', fontSize: 15, maxWidth: 360, lineHeight: 1.6 }}>
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link href="/"
        style={{ marginTop: 8, padding: '10px 28px', borderRadius: 8, background: '#c8a96a', color: '#0e0f11', fontWeight: 700, fontSize: 14 }}>
        ← Home
      </Link>
    </main>
  );
}
