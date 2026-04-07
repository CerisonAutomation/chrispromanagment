/**
 * @fileoverview 404 page — shown for all unmatched routes.
 */
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata = { title: '404 — Page Not Found' };

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background text-foreground p-8">
      <div className="text-center space-y-3">
        <p className="text-8xl font-black text-primary">404</p>
        <h1 className="text-3xl font-bold">Page not found</h1>
        <p className="text-muted-foreground max-w-sm">
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>
      <div className="flex gap-3">
        <Button asChild><Link href="/">Go home</Link></Button>
        <Button variant="outline" asChild><Link href="/properties">Browse properties</Link></Button>
      </div>
    </main>
  );
}
