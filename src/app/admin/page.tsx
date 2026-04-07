/**
 * @fileoverview Admin dashboard — shows CMS page stats + quick actions.
 */
import Link from 'next/link';
import { getAllPages } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { formatDateRange } from '@/lib/utils';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Dashboard' };
export const revalidate = 0;

export default async function AdminDashboard() {
  const pages = await getAllPages();
  const published = pages.filter((p) => p.published);
  const drafts = pages.filter((p) => !p.published);
  const recentPages = [...pages].sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  ).slice(0, 5);

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button asChild>
          <Link href="/admin/pages/new">+ New Page</Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Pages', value: pages.length },
          { label: 'Published', value: published.length },
          { label: 'Drafts', value: drafts.length },
          { label: 'Properties', value: '—' },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-border bg-card p-5 space-y-1">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      {/* Recent pages */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Recent Pages</h2>
        <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
          {recentPages.length === 0 && (
            <p className="p-5 text-sm text-muted-foreground">No pages yet.</p>
          )}
          {recentPages.map((page) => (
            <div key={page.slug} className="flex items-center justify-between p-4 bg-card hover:bg-muted/50 transition-colors">
              <div className="space-y-0.5">
                <p className="font-medium text-sm">{page.title}</p>
                <p className="text-xs text-muted-foreground">/{page.slug}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  page.published
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                }`}>
                  {page.published ? 'Published' : 'Draft'}
                </span>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/admin/pages/${page.slug}`}>Edit</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
