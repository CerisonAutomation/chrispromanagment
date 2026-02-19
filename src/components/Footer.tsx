import { Logo } from "./Logo";
import { Facebook, Instagram, MapPin, Mail, Phone, Home, Users } from "lucide-react";
import { useSectionContent } from "@/hooks/use-section-content";

interface FooterContent {
  brandName: string;
  brandTagline: string;
  links: Array<{ id: string; label: string; href: string }>;
  socialLinks: Array<{ platform: string; href: string; ariaLabel: string }>;
  copyright: string;
}

interface BrandContent {
  email: string;
  phone: string;
  location: string;
}

export default function Footer() {
  const { data: footer } = useSectionContent<FooterContent>("footer");
  const { data: brand } = useSectionContent<BrandContent>("brand");

  if (!footer || !brand) return null;

  return (
    <footer className="py-10 sm:py-14 border-t border-border">
      <div className="section-container">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-1">
            <Logo size="sm" />
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed max-w-xs">{footer.brandTagline}</p>
            <div className="flex items-center gap-2.5 mt-4">
              {footer.socialLinks.map((s) => {
                const Icon = s.platform === "Facebook" ? Facebook : Instagram;
                return (
                  <a key={s.platform} href={s.href} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full border border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors" aria-label={s.ariaLabel}>
                    <Icon size={14} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3">Quick Links</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              {footer.links.map((l) => (
                <a key={l.id} href={l.href} className="hover:text-foreground transition-colors">{l.label}</a>
              ))}
            </div>
          </div>

          {/* Pages */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3">Our Pages</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <a href="/" className="flex items-center gap-2 hover:text-foreground transition-colors">
                <Home size={12} className="text-primary" /> Home
              </a>
              <a href="/booking" className="flex items-center gap-2 hover:text-foreground transition-colors">
                <Home size={12} className="text-primary" /> Browse Stays
              </a>
              <a href="/owners" className="flex items-center gap-2 hover:text-foreground transition-colors">
                <Users size={12} className="text-primary" /> Property Owners
              </a>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3">Contact</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <a href={`mailto:${brand.email}`} className="flex items-center gap-2 hover:text-foreground transition-colors">
                <Mail size={12} className="text-primary flex-shrink-0" /> {brand.email}
              </a>
              <a href={`tel:${brand.phone}`} className="flex items-center gap-2 hover:text-foreground transition-colors">
                <Phone size={12} className="text-primary flex-shrink-0" /> {brand.phone}
              </a>
              <div className="flex items-start gap-2">
                <MapPin size={12} className="text-primary mt-0.5 flex-shrink-0" />
                <span className="leading-snug">{brand.location}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">{footer.copyright}</p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <a href="/booking" className="hover:text-primary transition-colors">Guest Booking</a>
            <span className="text-border">·</span>
            <a href="/owners" className="hover:text-primary transition-colors">Owner Portal</a>
            <span className="text-border">·</span>
            <a href="/admin" className="hover:text-primary transition-colors">Admin</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

