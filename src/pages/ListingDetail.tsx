import { useEffect, useState, useCallback, memo } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BedDouble, Users, MapPin, ChevronLeft, ChevronRight, Bath, Wifi, Waves, Wind, Car, Tv, Coffee, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/shared/PageShell";
import { SubPageHeader } from "@/components/shared/SubPageHeader";
import { ListingDetailSkeleton } from "@/components/skeletons";
import { EmptyState } from "@/components/shared/EmptyState";
import { supabase } from "@/integrations/supabase/client";
import { searchPexels } from "@/lib/ai-agent";
import { useCmsContent } from "@/hooks/use-cms-content";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Listing { guestyListingId: string; nickname: string; title: string | null; thumbnailUrl: string | null; image_urls: string[]; description: string | null; city: string | null; country: string | null; bedrooms: number | null; bathrooms: number | null; accommodates: number | null; basePrice: string | null; currency: string; amenities: string[]; minNights: number; tags: string[] }
interface BlockedRange { start_date: string; end_date: string }
interface CmsLabels { check_in_label: string; check_out_label: string; guests_label: string; book_cta: string; enquire_cta: string; per_night_label: string; availability_title: string; amenities_title: string; description_title: string; calendar_legend_booked: string; calendar_legend_available: string; min_nights_note: string }

const CMS_DEF: CmsLabels = { check_in_label: "Check-in", check_out_label: "Check-out", guests_label: "Guests", book_cta: "Request to book", enquire_cta: "Send enquiry", per_night_label: "/ night", availability_title: "Availability", amenities_title: "Amenities", description_title: "About this property", calendar_legend_booked: "Booked", calendar_legend_available: "Available", min_nights_note: "night minimum stay" };

// ─── Amenity icons ─────────────────────────────────────────────────────────────
const AMENITY_ICONS: Record<string, React.ElementType> = { wifi: Wifi, pool: Waves, "air conditioning": Wind, parking: Car, tv: Tv, coffee: Coffee, bath: Bath };
const amenityIcon = (name: string): React.ElementType => AMENITY_ICONS[name.toLowerCase()] ?? Star;

// ─── Calendar helpers ──────────────────────────────────────────────────────────
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"] as const;
const DAY_LABELS  = ["Su","Mo","Tu","We","Th","Fr","Sa"] as const;
const toDateStr   = (y: number, m: number, d: number) => `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
const isBlocked   = (ds: string, ranges: BlockedRange[]) => ranges.some((r) => ds >= r.start_date && ds <= r.end_date);

// ─── Calendar month ───────────────────────────────────────────────────────────
interface CalMonthProps { year: number; month: number; blocked: BlockedRange[]; onPrev: () => void; onNext: () => void; legend: { booked: string; available: string } }
const CalMonth = memo(function CalMonth({ year, month, blocked, onPrev, onNext, legend }: CalMonthProps) {
  const totalDays = new Date(year, month + 1, 0).getDate();
  const startDay  = new Date(year, month, 1).getDay();
  const today     = new Date(); today.setHours(0,0,0,0);
  const cells: (number | null)[] = [...Array(startDay).fill(null), ...Array.from({ length: totalDays }, (_, i) => i + 1)];

  return (
    <div className="glass rounded-xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <button onClick={onPrev} className="rounded-lg p-1.5 hover:bg-muted transition-colors" aria-label="Previous month"><ChevronLeft className="h-4 w-4" /></button>
        <span className="font-display text-sm font-medium">{MONTH_NAMES[month]} {year}</span>
        <button onClick={onNext} className="rounded-lg p-1.5 hover:bg-muted transition-colors" aria-label="Next month"><ChevronRight className="h-4 w-4" /></button>
      </div>
      <div className="mb-2 grid grid-cols-7 gap-0.5 text-center text-[10px] uppercase tracking-wider text-muted-foreground">
        {DAY_LABELS.map((d) => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, idx) => {
          if (!day) return <div key={`e-${idx}`} />;
          const ds      = toDateStr(year, month, day);
          const date    = new Date(year, month, day);
          const isPast  = date < today;
          const isToday = date.getTime() === today.getTime();
          const bkd     = !isPast && isBlocked(ds, blocked);
          return (
            <div key={ds} title={bkd ? legend.booked : isPast ? "" : legend.available}
              className={cn("flex h-8 w-full items-center justify-center rounded-md text-xs transition-colors",
                isPast  && "text-muted-foreground/25 cursor-default",
                !isPast && !bkd && "bg-emerald-500/10 text-emerald-400 cursor-default",
                bkd     && "bg-destructive/20 text-destructive/60 line-through cursor-default",
                isToday && "ring-1 ring-gold"
              )}>
              {day}
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-500/30" />{legend.available}</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-destructive/30" />{legend.booked}</span>
      </div>
    </div>
  );
});

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ListingDetail() {
  const { id }                          = useParams<{ id: string }>();
  const [listing, setListing]           = useState<Listing | null>(null);
  const [blocked, setBlocked]           = useState<BlockedRange[]>([]);
  const [loading, setLoading]           = useState(true);
  const [activeImg, setActiveImg]       = useState(0);
  const now                             = new Date();
  const [calYear, setCalYear]           = useState(now.getFullYear());
  const [calMonth, setCalMonth]         = useState(now.getMonth());
  const { get }                         = useCmsContent();
  const cms                             = get<CmsLabels>("listing__detail_defaults", CMS_DEF);

  const prevMonth = useCallback(() => setCalMonth((m) => { if (m === 0) { setCalYear((y) => y-1); return 11; } return m-1; }), []);
  const nextMonth = useCallback(() => setCalMonth((m) => { if (m === 11) { setCalYear((y) => y+1); return 0;  } return m+1; }), []);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    void (async () => {
      const [{ data: l, error: lErr }, { data: a }] = await Promise.all([
        supabase.from("guesty_listings").select("*").eq("guestyListingId", id).single(),
        supabase.from("listing_availability").select("start_date,end_date").eq("guestyListingId", id).gte("end_date", new Date().toISOString().split("T")[0]).order("start_date"),
      ]);
      if (lErr) { toast.error("Property not found"); setLoading(false); return; }
      if (l) {
        const listingData = {
          guestyListingId: l.guestyListingId, nickname: l.nickname, title: l.title,
          thumbnailUrl: l.thumbnailUrl, image_urls: (l as Record<string,unknown>)["image_urls"] as string[] ?? [],
          description: (l as Record<string,unknown>)["description"] as string ?? null,
          city: l.city, country: l.country, bedrooms: l.bedrooms,
          bathrooms: (l as Record<string,unknown>)["bathrooms"] as number ?? null,
          accommodates: l.accommodates, basePrice: l.basePrice as string | null,
          currency: l.currency ?? "EUR", amenities: l.amenities ?? [],
          minNights: (l as Record<string,unknown>)["minNights"] as number ?? 2,
          tags: (l as Record<string,unknown>)["tags"] as string[] ?? [],
        };
        // Pexels fallback when Guesty provides no images
        if (!listingData.thumbnailUrl && listingData.image_urls.length === 0) {
          const query = [listingData.city ?? "Malta", "villa", "property"].filter(Boolean).join(" ");
          const photos = await searchPexels(query, 4, "landscape");
          if (photos.length > 0) {
            listingData.thumbnailUrl = photos[0]?.src.large ?? null;
            listingData.image_urls   = photos.slice(1).map((p) => p.src.large).filter(Boolean);
          }
        }
        setListing(listingData);
      }
      if (a) setBlocked(a as BlockedRange[]);
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <PageShell nav={false}><div className="pt-0"><SubPageHeader backTo="/booking" backLabel="All stays" title="" /></div><ListingDetailSkeleton /></PageShell>;
  if (!listing) return <PageShell nav={false}><SubPageHeader backTo="/booking" backLabel="All stays" title="Not found" /><div className="container py-12"><EmptyState title="Property not found" action={{ label: "Back to listings", to: "/booking" }} /></div></PageShell>;

  const gallery = [...(listing.thumbnailUrl ? [listing.thumbnailUrl] : []), ...listing.image_urls.filter((u) => u !== listing.thumbnailUrl)].filter(Boolean);
  const price   = listing.basePrice ? Math.round(Number(listing.basePrice)) : null;
  const next    = { year: calMonth === 11 ? calYear+1 : calYear, month: calMonth === 11 ? 0 : calMonth+1 };

  return (
    <PageShell nav={false}>
      <SubPageHeader backTo="/booking" backLabel="All stays" title={listing.nickname || listing.title || ""} />

      <div className="container pb-24">
        {/* Gallery */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-10">
          <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-muted">
            {gallery.length > 0
              ? <img src={gallery[activeImg]} alt={listing.title ?? listing.nickname} className="h-full w-full object-cover transition-all duration-500" loading="eager" decoding="async" />
              : <div className="grid h-full w-full place-items-center text-muted-foreground/50">No images</div>
            }
            {gallery.length > 1 && (
              <>
                <button onClick={() => setActiveImg((i) => (i-1+gallery.length)%gallery.length)} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white backdrop-blur hover:bg-black/70 transition-colors" aria-label="Previous"><ChevronLeft className="h-5 w-5" /></button>
                <button onClick={() => setActiveImg((i) => (i+1)%gallery.length)}                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white backdrop-blur hover:bg-black/70 transition-colors" aria-label="Next"><ChevronRight className="h-5 w-5" /></button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {gallery.map((_, i) => <button key={i} onClick={() => setActiveImg(i)} className={cn("h-1.5 rounded-full transition-all", i===activeImg ? "w-6 bg-white" : "w-1.5 bg-white/50")} aria-label={`Image ${i+1}`} />)}
                </div>
              </>
            )}
          </div>
          {gallery.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {gallery.map((src, i) => (
                <button key={i} onClick={() => setActiveImg(i)} className={cn("h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-all", i===activeImg ? "border-gold" : "border-transparent opacity-60 hover:opacity-100")}>
                  <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
          {/* Left */}
          <div className="space-y-10">
            {/* Title block */}
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-2">
                <MapPin className="h-3.5 w-3.5" />
                {[listing.city, listing.country].filter(Boolean).join(", ") || "Malta"}
                {listing.tags.map((tag) => <span key={tag} className="rounded-full border border-border/60 bg-card/60 px-2 py-0.5">{tag}</span>)}
              </div>
              <h1 className="text-3xl md:text-4xl">{listing.nickname || listing.title}</h1>
              <div className="mt-4 flex flex-wrap gap-5 text-sm text-muted-foreground">
                {listing.bedrooms    != null && <span className="flex items-center gap-1.5"><BedDouble className="h-4 w-4 text-gold" />{listing.bedrooms} bed{listing.bedrooms !== 1 ? "s" : ""}</span>}
                {listing.bathrooms   != null && <span className="flex items-center gap-1.5"><Bath className="h-4 w-4 text-gold" />{listing.bathrooms} bath{listing.bathrooms !== 1 ? "s" : ""}</span>}
                {listing.accommodates != null && <span className="flex items-center gap-1.5"><Users className="h-4 w-4 text-gold" />Up to {listing.accommodates} guests</span>}
                {listing.minNights   > 1      && <span className="text-xs">{listing.minNights} {cms.min_nights_note}</span>}
              </div>
            </div>

            {listing.description && (
              <div>
                <h2 className="mb-3 text-xl">{cms.description_title}</h2>
                <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap text-pretty">{listing.description}</p>
              </div>
            )}

            {listing.amenities.length > 0 && (
              <div>
                <h2 className="mb-4 text-xl">{cms.amenities_title}</h2>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {listing.amenities.map((a) => { const Icon = amenityIcon(a); return <div key={a} className="flex items-center gap-2 rounded-lg border border-border/50 bg-card/30 px-3 py-2 text-sm"><Icon className="h-4 w-4 shrink-0 text-gold" aria-hidden /><span className="truncate capitalize">{a}</span></div>; })}
                </div>
              </div>
            )}

            <div>
              <h2 className="mb-4 text-xl">{cms.availability_title}</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <CalMonth year={calYear}    month={calMonth}    blocked={blocked} onPrev={prevMonth} onNext={nextMonth} legend={{ booked: cms.calendar_legend_booked, available: cms.calendar_legend_available }} />
                <CalMonth year={next.year}  month={next.month}  blocked={blocked} onPrev={prevMonth} onNext={nextMonth} legend={{ booked: cms.calendar_legend_booked, available: cms.calendar_legend_available }} />
              </div>
            </div>
          </div>

          {/* Sticky booking card */}
          <div>
            <div className="sticky top-8 glass rounded-2xl p-6 shadow-elegant">
              {price != null
                ? <div className="mb-6 flex items-baseline gap-1.5"><span className="font-display text-3xl text-gold">{listing.currency} {price}</span><span className="text-sm text-muted-foreground">{cms.per_night_label}</span></div>
                : <div className="mb-6 text-sm text-muted-foreground">Contact us for pricing</div>
              }
              <div className="mb-4 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border/60">
                {[{ label: cms.check_in_label }, { label: cms.check_out_label }].map(({ label }) => (
                  <div key={label} className="bg-muted/40 px-4 py-3">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
                    <div className="mt-1 text-sm text-muted-foreground">Select date</div>
                  </div>
                ))}
                <div className="col-span-2 bg-muted/40 px-4 py-3">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{cms.guests_label}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{listing.accommodates ?? 2} max</div>
                </div>
              </div>
              <Button variant="gold" className="w-full" size="lg" onClick={() => toast.info("Contact us to book: hello@christiano.mt")}>{cms.book_cta}</Button>
              <Button variant="outline" className="mt-3 w-full" size="lg" onClick={() => toast.info("Enquiry form coming soon")}>{cms.enquire_cta}</Button>
              <p className="mt-4 text-center text-[11px] text-muted-foreground">Direct booking — no service fee</p>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
