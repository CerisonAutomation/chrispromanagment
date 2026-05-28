import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, BedDouble, Users, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Property = {
  id: string;
  title: string;
  nickname?: string;
  picture?: string;
  bedrooms?: number;
  accommodates?: number;
  address?: { city?: string; country?: string; full?: string };
  pricePerNight?: number;
  currency?: string;
};

export default function Booking() {
  const [props, setProps] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("guesty-listings", { body: {} });
        if (error) throw error;
        setProps(data?.properties ?? []);
      } catch (e: any) {
        setError(e.message ?? "Failed to load properties");
        toast.error("Could not load live properties");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="container flex items-center justify-between py-6">
        <Button asChild variant="ghost" size="sm">
          <Link to="/"><ArrowLeft className="h-4 w-4" /> Home</Link>
        </Button>
        <div className="font-display text-lg">Stays in Malta</div>
        <div className="w-20" />
      </header>

      <section className="container py-10">
        <div className="mb-10 max-w-2xl">
          <h1 className="font-display text-4xl md:text-5xl">Find your stay</h1>
          <p className="mt-3 text-muted-foreground">Live availability from our managed Guesty portfolio.</p>
        </div>

        {loading && (
          <div className="grid place-items-center py-24 text-muted-foreground">
            <Loader2 className="mb-3 h-8 w-8 animate-spin text-gold" />
            Loading properties…
          </div>
        )}

        {error && !loading && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-6 text-sm">
            <div className="font-medium text-destructive-foreground">Live properties unavailable</div>
            <div className="mt-1 text-muted-foreground">{error}</div>
            <div className="mt-3 text-xs text-muted-foreground">
              Make sure the Guesty edge function is deployed and credentials are configured.
            </div>
          </div>
        )}

        {!loading && !error && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {props.length === 0 && <div className="text-muted-foreground">No properties yet.</div>}
            {props.map((p, i) => (
              <motion.article
                key={p.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group overflow-hidden rounded-xl border border-border/60 bg-card shadow-elegant"
              >
                <div className="aspect-[4/3] overflow-hidden bg-muted">
                  {p.picture ? (
                    <img
                      src={p.picture}
                      alt={p.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-muted-foreground">No image</div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    {p.address?.city ?? p.address?.full ?? "Malta"}
                  </div>
                  <h3 className="mt-1.5 font-display text-lg leading-tight">{p.nickname || p.title}</h3>
                  <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                    {p.bedrooms != null && <span className="inline-flex items-center gap-1"><BedDouble className="h-3.5 w-3.5" />{p.bedrooms} bed</span>}
                    {p.accommodates != null && <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" />{p.accommodates}</span>}
                  </div>
                  {p.pricePerNight != null && (
                    <div className="mt-4 flex items-baseline gap-1.5">
                      <span className="font-display text-xl text-gold">
                        {p.currency ?? "EUR"} {Math.round(p.pricePerNight)}
                      </span>
                      <span className="text-xs text-muted-foreground">/ night</span>
                    </div>
                  )}
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
