import { Link } from "react-router-dom";
import { Sparkles, ArrowRight, Building2, MapPin, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Nav */}
      <header className="container flex items-center justify-between py-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-gold text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="font-display text-lg font-semibold tracking-tight">Christiano</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <Link to="/booking" className="hover:text-foreground transition-colors">Stay</Link>
          <Link to="/owners" className="hover:text-foreground transition-colors">Owners</Link>
          <Link to="/admin" className="hover:text-foreground transition-colors">Admin</Link>
        </nav>
        <Button asChild variant="gold" size="sm">
          <Link to="/auth">Sign in</Link>
        </Button>
      </header>

      {/* Hero */}
      <section className="container grid min-h-[calc(100vh-6rem)] items-center py-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-3xl"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/50 px-4 py-1.5 text-xs text-muted-foreground backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
            Now booking summer 2026 in Malta
          </div>
          <h1 className="font-display text-5xl leading-[1.05] tracking-tight md:text-7xl">
            Luxury stays,<br />
            <span className="bg-gradient-gold bg-clip-text text-transparent">effortlessly managed.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Boutique short-let properties across Malta, run by humans who care. Direct booking, real concierge,
            owners who actually sleep at night.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Button asChild size="lg" variant="gold">
              <Link to="/booking">
                Browse stays <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/owners">List your property</Link>
            </Button>
          </div>

          <div className="mt-16 grid max-w-2xl gap-6 sm:grid-cols-3">
            {[
              { icon: Building2, label: "Curated portfolio", value: "Hand-picked villas" },
              { icon: MapPin, label: "Local team", value: "Based in Valletta" },
              { icon: ShieldCheck, label: "Real concierge", value: "Available 24/7" },
            ].map((f) => (
              <div key={f.label} className="rounded-xl border border-border/60 bg-card/40 p-4 backdrop-blur">
                <f.icon className="mb-3 h-5 w-5 text-gold" />
                <div className="text-xs uppercase tracking-wider text-muted-foreground">{f.label}</div>
                <div className="mt-1 text-sm font-medium">{f.value}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  );
}
