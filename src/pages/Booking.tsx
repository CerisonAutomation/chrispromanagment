import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BedDouble, Users, MapPin, ShieldCheck, CreditCard, HeadphonesIcon, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/shared/PageShell";
import { SubPageHeader } from "@/components/shared/SubPageHeader";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { BookingGridSkeleton } from "@/components/skeletons";
import { supabase } from "@/integrations/supabase/client";
import { useCmsContent } from "@/hooks/use-cms-content";
import { toast } from "sonner";

interface Property { id: string; title: string; nickname?: string; picture?: string; bedrooms?: number; accommodates?: number; city?: string; pricePerNight?: number; currency?: string }

interface HeaderCms  { headline: string; subheadline: string }
interface TrustCms   { items: string[] }
interface EmptyCms   { empty_title: string; empty_body: string; error_title: string; error_body: string }

const HEADER_DEF: HeaderCms = { headline: "Find your stay", subheadline: "Live availability from our managed Guesty portfolio." };
const TRUST_DEF:  TrustCms  = { items: ["Direct booking – no platform fees", "Free cancellation up to 14 days", "Personal concierge included", "IBAN bank transfer or card"] };
const EMPTY_DEF:  EmptyCms  = { empty_title: "No properties available", empty_body: "Our portfolio is fully booked for those dates. Contact us directly.", error_title: "Live properties unavailable", error_body: "Make sure the Guesty edge function is deployed." };

const TRUST_ICONS = [ShieldCheck, CheckCircle2, HeadphonesIcon, CreditCard];

async function fetchProperties(): Promise<Property[]> {
  // Guesty is the source of truth — fetch via edge function (cached server-side)
  const { data: fn, error: fnErr } = await supabase.functions.invoke("guesty-listings", { body: {} });
  if (fnErr) throw fnErr;
  return (fn?.properties ?? []).map((p: { id?: string; _id?: string; title?: string; nickname?: string; picture?: { thumbnail?: string }; bedrooms?: number; accommodates?: number; address?: { city?: string }; pricePerNight?: number; currency?: string }) => ({ id: p.id ?? p._id ?? "", title: p.title ?? p.nickname ?? "Property", nickname: p.nickname, picture: p.picture?.thumbnail ?? undefined, bedrooms: p.bedrooms, accommodates: p.accommodates, city: p.address?.city, pricePerNight: p.pricePerNight ?? undefined, currency: p.currency ?? "EUR" }));
}

export default function Booking() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading]        = useState(true);
  const [error, setError]            = useState<string | null>(null);
  const { get }                      = useCmsContent();
  const header = get<HeaderCms>("booking__header", HEADER_DEF);
  const trust  = get<TrustCms>("booking__trust_strip", TRUST_DEF);
  const empty  = get<EmptyCms>("booking__empty_state", EMPTY_DEF);

  useEffect(() => {
    fetchProperties()
      .then(setProperties)
      .catch((e: unknown) => {
        const msg = e instanceof Error ? e.message : "Failed to load";
        setError(msg);
        toast.error("Could not load properties");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageShell nav={false}>
      <SubPageHeader backTo="/" backLabel="Home" title="Stays in Malta" />

      {/* Trust strip */}
      <div className="border-b border-border/30 bg-card/20 backdrop-blur">
        <div className="container flex flex-wrap items-center justify-center gap-6 py-3">
          {trust.items.map((item, i) => {
            const Icon = TRUST_ICONS[i % TRUST_ICONS.length]!;
            return (
              <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Icon className="h-3.5 w-3.5 text-gold" />
                {item}
              </div>
            );
          })}
        </div>
      </div>

      <section className="container py-10">
        <div className="mb-10 max-w-2xl">
          <h1 className="text-4xl md:text-5xl">{header.headline}</h1>
          <p className="mt-3 text-muted-foreground">{header.subheadline}</p>
        </div>

        {loading && <BookingGridSkeleton />}
        {error && !loading && <ErrorState title={empty.error_title} message={error} hint={empty.error_body} />}
        {!loading && !error && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {properties.length === 0 && <EmptyState title={empty.empty_title} body={empty.empty_body} />}
            {properties.map((p, i) => (
              <motion.article
                key={p.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group overflow-hidden rounded-xl border border-border/60 bg-card shadow-elegant hover:border-border transition-colors"
              >
                <div className="aspect-[4/3] overflow-hidden bg-muted">
                  {p.picture
                    ? <img src={p.picture} alt={p.title} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    : <div className="grid h-full w-full place-items-center text-xs text-muted-foreground/50">No photo</div>
                  }
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />{p.city ?? "Malta"}
                  </div>
                  <h3 className="mt-1.5 font-display text-lg leading-tight">{p.nickname || p.title}</h3>
                  <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                    {p.bedrooms    != null && <span className="flex items-center gap-1"><BedDouble className="h-3.5 w-3.5" />{p.bedrooms} bed</span>}
                    {p.accommodates != null && <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{p.accommodates}</span>}
                  </div>
                  {p.pricePerNight != null && (
                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="font-display text-xl text-gold">{p.currency} {Math.round(p.pricePerNight)}</span>
                      <span className="text-xs text-muted-foreground">/ night</span>
                    </div>
                  )}
                  <Button asChild size="sm" variant="gold" className="mt-4 w-full">
                    <Link to={`/listing/${p.id}`}>View details</Link>
                  </Button>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}
