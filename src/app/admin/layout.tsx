/**
 * @fileoverview Admin layout — sidebar navigation + auth session check.
 */
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Button } from '@/components/ui/button';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: { template: '%s | Admin', default: 'Admin' } };

async function getUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cs) { cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); },
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

const NAV_ITEMS = [
  { href: '/admin', label: '🏠 Dashboard' },
  { href: '/admin/pages', label: '📄 Pages' },
  { href: '/properties', label: '🏘 Properties', external: true },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  if (!user) redirect('/admin/login');

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 border-r border-border bg-card flex flex-col">
        <div className="p-5 border-b border-border">
          <p className="font-bold text-sm">Christiano CMS</p>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-muted transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-border">
          <form action="/api/auth/signout" method="POST">
            <Button variant="ghost" size="sm" type="submit" className="w-full justify-start text-muted-foreground">
              Sign out
            </Button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 overflow-auto">
        {children}
      </main>
    </div>
  );
}
