import { useState, useEffect, useCallback } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "./Logo";
import { siteBlueprint } from "@/lib/site-blueprint";

interface NavbarProps {
  onOpenWizard: () => void;
}

export default function Navbar({ onOpenWizard }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navLinks = siteBlueprint.navItems;

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 40);
  }, []);

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const handleDrawerClick = useCallback(() => {
    closeDrawer();
    onOpenWizard();
  }, [closeDrawer, onOpenWizard]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded">
        Skip to content
      </a>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "glass-surface shadow-md" : "bg-transparent"
        }`}
        style={{ height: "var(--header-height)" }}
      >
        <nav className="section-container flex items-center justify-between h-full">
          <Logo size="sm" />
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
            <button
              onClick={onOpenWizard}
              className="px-5 py-2.5 text-sm font-semibold bg-primary text-primary-foreground rounded hover:bg-gold-light transition-colors duration-200"
            >
              Get Started
            </button>
          </div>
          <button
            className="md:hidden p-2 text-foreground"
            onClick={openDrawer}
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>
        </nav>
      </header>

      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
              onClick={closeDrawer}
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-72 glass-surface border-l border-border flex flex-col"
              role="dialog"
              aria-label="Navigation menu"
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <span className="font-serif text-lg text-foreground">Menu</span>
                <button onClick={closeDrawer} aria-label="Close menu" className="p-1 text-muted-foreground hover:text-foreground">
                  <X size={20} />
                </button>
              </div>
              <div className="flex flex-col p-6 gap-6">
                {navLinks.map((link) => (
                  <a
                    key={`mobile-${link.id}`}
                    href={link.href}
                    onClick={closeDrawer}
                    className="text-lg font-medium text-foreground hover:text-primary transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                ))}
                <button
                  onClick={handleDrawerClick}
                  className="mt-4 w-full py-3 text-sm font-semibold bg-primary text-primary-foreground rounded hover:bg-gold-light transition-colors duration-200"
                >
                  Get Started
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
