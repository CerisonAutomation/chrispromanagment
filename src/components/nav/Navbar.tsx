/**
 * @fileoverview Navbar — responsive top navigation with mobile drawer.
 * Server component (no interactivity) — inner MobileMenu is client.
 */
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MobileMenu } from './MobileMenu';

const NAV_LINKS = [
  { href: '/properties', label: 'Properties' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="font-bold text-xl font-playfair tracking-tight">
          Christiano Properties
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              {label}
            </Link>
          ))}
          <Button size="sm" asChild className="ml-2">
            <Link href="/properties">Book now</Link>
          </Button>
        </nav>

        {/* Mobile */}
        <MobileMenu links={NAV_LINKS} />
      </div>
    </header>
  );
}
