/**
 * @fileoverview Site footer — Server Component, SEO links, contact info.
 */
import Link from 'next/link';

const FOOTER_LINKS = [
  {
    heading: 'Properties',
    links: [
      { href: '/properties', label: 'All Properties' },
      { href: '/properties?type=apartment', label: 'Apartments' },
      { href: '/properties?type=villa', label: 'Villas' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { href: '/about', label: 'About Us' },
      { href: '/contact', label: 'Contact' },
      { href: '/admin', label: 'Owner Portal' },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="bg-[#0a0b0d] border-t border-border mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div className="text-gold font-bold text-xl mb-3">✦ Christo PM</div>
            <p className="text-foreground/50 text-sm leading-relaxed max-w-xs">
              Premium property management and luxury holiday rentals across Malta.
            </p>
            <p className="text-foreground/30 text-xs mt-4">📍 Malta, Mediterranean</p>
          </div>
          {/* Links */}
          {FOOTER_LINKS.map(col => (
            <div key={col.heading}>
              <h3 className="text-gold text-sm font-semibold mb-4 tracking-wider uppercase">{col.heading}</h3>
              <ul className="space-y-2">
                {col.links.map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href} className="text-foreground/50 text-sm hover:text-gold transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-8 border-t border-border/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-foreground/30 text-xs">
            © {new Date().getFullYear()} Christo Property Management. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/privacy" className="text-foreground/30 text-xs hover:text-gold transition-colors">Privacy</Link>
            <Link href="/terms" className="text-foreground/30 text-xs hover:text-gold transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
