/**
 * @fileoverview MobileMenu — hamburger + slide-down drawer for mobile nav.
 */
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface MobileMenuProps {
  links: { href: string; label: string }[];
}

export function MobileMenu({ links }: MobileMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? 'Close menu' : 'Open menu'}
        className="px-2"
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round" />
          </svg>
        )}
      </Button>

      {open && (
        <div
          id="mobile-menu"
          className="absolute top-16 left-0 right-0 bg-background border-b border-border shadow-lg py-3 px-4 flex flex-col gap-1"
          role="navigation"
          aria-label="Mobile navigation"
        >
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="block py-2.5 px-3 rounded-lg text-sm hover:bg-muted transition-colors"
            >
              {label}
            </Link>
          ))}
          <Button asChild className="mt-2 w-full">
            <Link href="/properties" onClick={() => setOpen(false)}>Book now</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
