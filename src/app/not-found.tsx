import { Home, Search } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Page Not Found',
  description: 'The page you&apos;re looking for doesn&apos;t exist.',
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-b from-background to-secondary">
      <div className="w-full max-w-md">
        <div className="text-center">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 mb-6">
            <Search className="h-10 w-10 text-amber-600" />
          </div>
          
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">
            404
          </h1>
          
          <p className="text-xl font-semibold text-foreground mb-2">
            Page Not Found
          </p>
          
          <p className="text-muted-foreground mb-8">
            The page you&apos;re looking for doesn&apos;t exist. It may have been moved or deleted.
          </p>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            <Home className="h-4 w-4" />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
