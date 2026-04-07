/**
 * @fileoverview Admin dashboard — /admin
 */
import { getAllPages } from '@/lib/supabase';

export default async function AdminDashboard() {
  const pages = await getAllPages();
  const published = pages.filter(p => p.published).length;
  const drafts = pages.length - published;

  const s = { gold: '#c8a96a', text: '#e8e4dc', dim: '#e8e4dc50', surface: '#1a1b1f', border: '1px solid #2a2b30' };

  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: s.gold, marginBottom: 4 }}>Dashboard</h1>
      <p style={{ color: s.dim, fontSize: 13, marginBottom: 32 }}>Christo Property Management</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
        {([
          { label: 'Total Pages', value: pages.length, icon: '📄' },
          { label: 'Published', value: published, icon: '✅' },
          { label: 'Drafts', value: drafts, icon: '📝' },
        ]).map(card => (
          <div key={card.label} style={{ background: s.surface, border: s.border, borderRadius: 10, padding: 20 }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{card.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.gold }}>{card.value}</div>
            <div style={{ fontSize: 13, color: s.dim, marginTop: 4 }}>{card.label}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <a href="/admin/pages" style={{ display: 'block', padding: 16, background: s.surface, border: s.border, borderRadius: 10, color: s.text, textDecoration: 'none' }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>📄 Manage Pages</div>
          <div style={{ fontSize: 13, color: s.dim }}>Create and edit CMS pages</div>
        </a>
        <a href="/puck/home" style={{ display: 'block', padding: 16, background: s.surface, border: s.border, borderRadius: 10, color: s.text, textDecoration: 'none' }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>✦ Edit Homepage</div>
          <div style={{ fontSize: 13, color: s.dim }}>Open Puck visual editor</div>
        </a>
      </div>
    </div>
  );
}
