import { Logo } from "./Logo";
import { Facebook, Instagram, MapPin, Mail, Phone } from "lucide-react";
import { siteBlueprint } from "@/lib/site-blueprint";

const { footer, brand } = siteBlueprint;

export default function Footer() {
  return (
    <footer className="py-10 sm:py-14 border-t border-border">
      <div className="section-container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <Logo size="sm" />
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed max-w-xs">
              {footer.brandTagline}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3">Quick Links</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              {footer.links.map((l) => (
                <a key={l.id} href={l.href} className="hover:text-foreground transition-colors">{l.label}</a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3">Contact</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <a href={`mailto:${brand.email}`} className="flex items-center gap-2 hover:text-foreground transition-colors">
                <Mail size={13} className="text-primary" /> {brand.email}
              </a>
              <a href={`tel:${brand.phone}`} className="flex items-center gap-2 hover:text-foreground transition-colors">
                <Phone size={13} className="text-primary" /> {brand.phone}
              </a>
              <div className="flex items-start gap-2">
                <MapPin size={13} className="text-primary mt-0.5 flex-shrink-0" />
                <span>{brand.location}</span>
              </div>
            </div>
            <div className="flex items-center gap-2.5 mt-3">
              {footer.socialLinks.map((s) => {
                const Icon = s.platform === "Facebook" ? Facebook : Instagram;
                return (
                  <a
                    key={s.platform}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full border border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors"
                    aria-label={s.ariaLabel}
                  >
                    <Icon size={15} />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-border/50 text-center">
          <p className="text-xs text-muted-foreground">{footer.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
