'use client';
/**
 * @fileoverview Site navigation — responsive, accessible, Malta Gold branded.
 */
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/properties', label: 'Properties' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
] as const;

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled ? 'bg-[rgba(14,15,17,0.95)] backdrop-blur-md border-b border-[rgba(42,43,48,0.8)]' : 'bg-transparent'
      )}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-gold font-bold text-xl tracking-tight group-hover:text-gold-light transition-colors">
            ✦ Christo
          </span>
          <span className="text-foreground/50 text-sm font-light hidden sm:block">Property Management</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href} href={href}
              className="px-4 py-2 text-sm text-foreground/70 hover:text-gold rounded-md transition-colors hover:bg-surface"
            >
              {label}
            </Link>
          ))}
          <Link
            href="/properties"
            className="ml-2 px-5 py-2 text-sm font-semibold bg-gold text-[#0e0f11] rounded-lg hover:bg-gold-light transition-colors"
          >
            Book Now
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2 rounded-md hover:bg-surface transition-colors"
          onClick={() => setOpen(o => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          <span className={cn('block w-5 h-0.5 bg-foreground transition-all', open && 'rotate-45 translate-y-2')} />
          <span className={cn('block w-5 h-0.5 bg-foreground transition-all', open && 'opacity-0')} />
          <span className={cn('block w-5 h-0.5 bg-foreground transition-all', open && '-rotate-45 -translate-y-2')} />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-[rgba(14,15,17,0.98)] border-t border-border px-6 py-4 flex flex-col gap-1 animate-fade-in">
          {NAV_LINKS.map(({ href, label }) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}
              className="py-3 text-sm text-foreground/70 hover:text-gold border-b border-border/40 transition-colors">
              {label}
            </Link>
          ))}
          <Link href="/properties" onClick={() => setOpen(false)}
            className="mt-3 py-3 px-4 text-sm font-semibold bg-gold text-[#0e0f11] rounded-lg text-center">
            Book Now
          </Link>
        </div>
      )}
    </header>
  );
}
