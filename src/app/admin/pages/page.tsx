/**
 * @fileoverview Admin pages list — CMS pages table with publish/unpublish actions.
 */
import Link from 'next/link';
import { getAllPages } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Pages' };
export const revalidate = 0;

export default async function AdminPagesListPage() {
  const pages = await getAllPages();

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Pages</h1>
        <Button asChild>
          <Link href="/puck/new">+ New Page</Link>
        </Button>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left p-4 font-medium">Title</th>
              <th className="text-left p-4 font-medium">Slug</th>
              <th className="text-left p-4 font-medium">Status</th>
              <th className="text-left p-4 font-medium">Updated</th>
              <th className="p-4" />
            </tr>
          </thead>
          <tbody>
            {pages.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  No pages yet. Create your first page.
                </td>
              </tr>
            )}
            {pages.map((page) => (
              <tr key={page.slug} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="p-4 font-medium">{page.title}</td>
                <td className="p-4 text-muted-foreground">/{page.slug}</td>
                <td className="p-4">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    page.published
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {page.published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="p-4 text-muted-foreground">
                  {new Date(page.updated_at).toLocaleDateString('en-MT', {
                    day: '2-digit', month: 'short', year: 'numeric'
                  })}
                </td>
                <td className="p-4 text-right">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/puck/${page.slug}`}>Edit</Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
