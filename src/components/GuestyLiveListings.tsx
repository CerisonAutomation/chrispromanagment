import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Bed, Users, Loader2, Search, AlertCircle } from "lucide-react";
import { useGuestyListings, type GuestyListing } from "@/hooks/use-guesty";

function imageOf(l: GuestyListing): string | undefined {
  return l.picture?.regular || l.picture?.large || l.picture?.thumbnail || l.pictures?.[0]?.original;
}

export default function GuestyLiveListings() {
  const [city, setCity] = useState("");
  const [query, setQuery] = useState("");
  const { listings, loading, error } = useGuestyListings({ city: query || undefined });

  // Build city autocomplete from currently-fetched listings
  const cities = useMemo(() => {
    const s = new Set<string>();
    listings.forEach((l) => {
      const c = l.address?.city?.trim();
      if (c) s.add(c);
    });
    return Array.from(s).sort();
  }, [listings]);

  const filteredCities = useMemo(
    () => cities.filter((c) => c.toLowerCase().includes(city.toLowerCase())).slice(0, 6),
    [cities, city]
  );

  return (
    <section className="min-h-[100dvh] flex flex-col justify-center py-10 sm:py-14 border-t border-border">
      <div className="section-container">
        <div className="text-center mb-6">
          <p className="micro-type text-primary mb-2">LIVE INVENTORY</p>
          <h2 className="font-serif font-semibold text-foreground">
            Available <span className="gold-text">right now</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
            Real-time data from our booking engine — every listing is bookable today.
          </p>
        </div>

        {/* City autocomplete */}
        <div className="max-w-md mx-auto mb-8 relative">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && setQuery(city)}
              placeholder="Search by city (Valletta, Sliema, St Julian's…)"
              className="w-full pl-9 pr-24 py-2.5 text-sm bg-card/60 backdrop-blur-sm border border-border rounded-md focus:outline-none focus:border-primary/50"
            />
            <button
              onClick={() => setQuery(city)}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded hover:bg-primary/90 transition"
            >
              Search
            </button>
          </div>
          {city && filteredCities.length > 0 && city !== query && (
            <div className="absolute top-full mt-1 left-0 right-0 z-20 bg-card border border-border rounded-md shadow-lg overflow-hidden">
              {filteredCities.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setCity(c);
                    setQuery(c);
                  }}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-secondary flex items-center gap-2"
                >
                  <MapPin size={11} className="text-primary" /> {c}
                </button>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="max-w-md mx-auto mb-4 p-3 rounded-md border border-destructive/40 bg-destructive/10 flex items-start gap-2 text-xs text-destructive">
            <AlertCircle size={13} className="shrink-0 mt-0.5" />
            <span>Couldn't reach booking engine: {error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={24} className="animate-spin text-primary" />
          </div>
        ) : listings.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-12">No listings found.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {listings.slice(0, 9).map((l, i) => {
              const img = imageOf(l);
              const title = l.title || l.nickname || "Property";
              return (
                <motion.article
                  key={l._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-surface rounded-xl overflow-hidden border border-border hover:border-primary/40 transition-all"
                >
                  <div className="relative h-48 bg-secondary overflow-hidden">
                    {img ? (
                      <img src={img} alt={title} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No image</div>
                    )}
                    {l.prices?.basePrice && (
                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-primary/90 backdrop-blur-sm text-primary-foreground text-xs font-semibold">
                        {l.prices.currency || "€"}
                        {l.prices.basePrice}/night
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-serif font-semibold text-foreground text-base mb-1 line-clamp-1">{title}</h3>
                    {l.address?.city && (
                      <p className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                        <MapPin size={11} className="text-primary" />
                        {l.address.city}
                        {l.address.country && `, ${l.address.country}`}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {l.accommodates && (
                        <span className="flex items-center gap-1">
                          <Users size={11} /> {l.accommodates}
                        </span>
                      )}
                      {l.bedrooms != null && (
                        <span className="flex items-center gap-1">
                          <Bed size={11} /> {l.bedrooms} bed
                        </span>
                      )}
                      {l.propertyType && <span className="text-primary/70 ml-auto">{l.propertyType}</span>}
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
