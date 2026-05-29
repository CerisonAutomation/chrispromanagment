import { Link, useLocation } from "react-router-dom";
import { Sparkles, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { to: "/booking", label: "Stay"   },
  { to: "/owners",  label: "Owners" },
];

export function SiteNav() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  return (
    // position:relative so the mobile drawer positions against this element
    <header className="relative container flex items-center justify-between py-5">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2.5 shrink-0" aria-label="Christiano — Home">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-gold text-primary-foreground shadow-glow" aria-hidden>
          <Sparkles className="h-4 w-4" />
        </div>
        <span className="font-display text-lg font-semibold tracking-tight">Christiano</span>
      </Link>

      {/* Desktop nav */}
      <nav aria-label="Site navigation" className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
        {NAV_LINKS.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className={cn(
              "transition-colors hover:text-foreground",
              pathname.startsWith(to) && "text-foreground font-medium"
            )}
            aria-current={pathname.startsWith(to) ? "page" : undefined}
          >
            {label}
          </Link>
        ))}
      </nav>

      <div className="hidden items-center gap-2 md:flex">
        <Button asChild variant="gold" size="sm">
          <Link to="/auth">Sign in</Link>
        </Button>
      </div>

      {/* Mobile hamburger */}
      <button
        className="rounded-md p-2 text-muted-foreground hover:text-foreground md:hidden"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-nav"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile drawer — absolute to the relative header, not the viewport */}
      {open && (
        <div
          id="mobile-nav"
          className="absolute inset-x-0 top-full z-50 rounded-b-2xl border border-border/50 bg-background/95 backdrop-blur px-6 py-5 shadow-elegant md:hidden"
        >
          <nav className="flex flex-col gap-4 text-sm" aria-label="Mobile navigation">
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-current={pathname.startsWith(to) ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                {label}
              </Link>
            ))}
            <Button asChild variant="gold" size="sm" className="w-full mt-1">
              <Link to="/auth" onClick={() => setOpen(false)}>Sign in</Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
