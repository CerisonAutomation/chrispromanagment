import React from "react";
import { toast } from "sonner";

function GuestySkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-cpm-border bg-cpm-bg-secondary">
      <div className="h-48 w-full bg-cpm-border" style={{ backgroundImage: "linear-gradient(90deg, var(--cpm-border) 25%, #252830 50%, var(--cpm-border) 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
      <div className="p-4 space-y-3"><div className="h-4 w-3/4 rounded bg-cpm-border" /><div className="h-3 w-1/2 rounded bg-cpm-border" /><div className="h-5 w-1/3 rounded bg-cpm-border" /></div>
    </div>
  );
}

export const GuestyPropertyGrid = {
  label: "Guesty · Property Grid",
  fields: {
    title: { type: "text" as const },
    itemsPerPage: {
      type: "select" as const,
      options: [{ label: "6 per page", value: "6" }, { label: "9 per page", value: "9" }, { label: "12 per page", value: "12" }],
    },
    showFilters: {
      type: "select" as const,
      options: [{ label: "Show Filters", value: "true" }, { label: "Hide Filters", value: "false" }],
    },
  },
  defaultProps: {
    title: "Available Properties",
    itemsPerPage: "6",
    showFilters: "true",
  },
  Component: (props: Record<string, unknown>) => {
    const p = props as { title: string; itemsPerPage: string; showFilters: string };
    type MappedProp = {
      id: string; slug: string; title: string; propertyType: string;
      location: { city: string; country: string; address: string };
      images: { url: string; caption?: string }[];
      rates: { baseRate: number; currency: string };
      reviews: { score: number; total: number; count: number }[];
      amenities: string[];
      maxGuests: number; bedrooms: number; bathrooms: number;
      summary: string; status: string; source: string;
    };
    const [properties, setProperties] = React.useState<MappedProp[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [sort, setSort] = React.useState("default");
    const [mounted, setMounted] = React.useState(false);
    const [searchParams, setSearchParams] = React.useState<Record<string, string | number> | null>(null);

    const abortRef = React.useRef<AbortController | null>(null);

    const fetchProperties = React.useCallback(async (params?: Record<string, string | number>) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);
      setError(null);
      try {
        const sp = new URLSearchParams();
        if (params) {
          Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== "") sp.set(k, String(v)); });
        }
        sp.set("limit", p.itemsPerPage || "6");
        const res = await fetch(`/api/guesty/listings?${sp.toString()}`, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        let items: MappedProp[] = data.listings || [];
        if (sort === "price-asc") items.sort((a, b) => a.rates.baseRate - b.rates.baseRate);
        else if (sort === "price-desc") items.sort((a, b) => b.rates.baseRate - a.rates.baseRate);
        else if (sort === "rating") items.sort((a, b) => (b.reviews[0]?.score || 0) - (a.reviews[0]?.score || 0));
        setProperties(items);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError((err as Error).message || "Failed to load properties");
          toast.error("Failed to load properties");
        }
      } finally { setLoading(false); }
    }, [sort, p.itemsPerPage]);

    React.useEffect(() => { setMounted(true); }, []);
    React.useEffect(() => { if (mounted) fetchProperties(searchParams || undefined); return () => abortRef.current?.abort(); }, [mounted, fetchProperties]);

    React.useEffect(() => {
      const handler = (e: Event) => {
        const detail = (e as CustomEvent).detail as Record<string, string | number> | undefined;
        if (detail) { setSearchParams(detail); fetchProperties(detail); }
      };
      window.addEventListener("guesty-search", handler);
      return () => window.removeEventListener("guesty-search", handler);
    }, [fetchProperties]);

    const handleRetry = () => { fetchProperties(searchParams || undefined); };
    const filterCls = "rounded-xl border border-cpm-border bg-cpm-bg-primary px-4 py-2.5 text-sm text-cpm-text-primary outline-none transition-all focus:border-cpm-accent/50";

    return (
      <>
        <section className="bg-cpm-bg-secondary px-4 py-20 sm:px-8 lg:py-32">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10" style={{ animation: "fadeInUp 0.6s ease-out" }}>
              <h2 className="font-[family-name:var(--font-heading)] text-3xl font-light tracking-tight text-cpm-text-primary sm:text-4xl">{p.title}</h2>
              <div className="mt-1 text-sm text-cpm-text-tertiary">{loading ? "Loading..." : error ? "Error" : `${properties.length} propert${properties.length === 1 ? "y" : "ies"} found`}</div>
              <div className="mt-4 h-[2px] w-16 bg-gradient-to-r from-transparent via-cpm-accent to-transparent" />
            </div>

            {p.showFilters === "true" && (
              <div className="mb-8 flex flex-wrap items-center gap-3" style={{ animation: "fadeInUp 0.7s ease-out" }}>
                <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort properties" className={filterCls}>
                  <option value="default">Sort: Default</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>
            )}

            {loading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: parseInt(p.itemsPerPage) || 6 }).map((_, i) => <GuestySkeletonCard key={i} />)}</div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <svg className="mb-4 h-16 w-16 text-cpm-error/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
                <h3 className="text-lg font-medium text-cpm-text-primary">Failed to load properties</h3>
                <p className="mt-2 text-sm text-cpm-text-secondary">{error}</p>
                <button onClick={handleRetry} className="mt-4 rounded-xl border border-cpm-accent/20 bg-cpm-accent/5 px-6 py-2.5 text-sm font-medium text-cpm-accent transition-all duration-300 hover:bg-cpm-accent hover:text-cpm-bg-primary">Try Again</button>
              </div>
            ) : properties.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <svg className="mb-4 h-16 w-16 text-cpm-border-hover" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
                <h3 className="text-lg font-medium text-cpm-text-primary">No properties found</h3>
                <p className="mt-2 text-sm text-cpm-text-secondary">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {properties.slice(0, parseInt(p.itemsPerPage) || 6).map((prop, i) => {
                  const img = prop.images?.[0]?.url || "/placeholder.jpg";
                  const rating = prop.reviews?.[0]?.score || 0;
                  const reviewCount = prop.reviews?.[0]?.count || 0;
                  const amenities = (prop.amenities || []).slice(0, 3);
                  return (
                    <div key={prop.id || i} className="group overflow-hidden rounded-2xl border border-cpm-border bg-cpm-bg-secondary transition-all duration-500 hover:-translate-y-1 hover:border-cpm-accent/20 hover:shadow-[0_8px_30px_rgba(200,169,106,0.06)]" style={{ animation: `scaleIn 0.5s ease-out ${i * 0.06}s both` }}>
                      <div className="relative h-48 overflow-hidden">
                        <img src={img} alt={prop.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                        <div className="absolute inset-0 bg-gradient-to-t from-cpm-bg-secondary via-transparent to-transparent opacity-60" />
                        <div className="absolute right-3 top-3 rounded-full bg-cpm-accent/90 px-2.5 py-0.5 text-xs font-semibold text-cpm-bg-primary">{prop.propertyType}</div>
                        {rating > 0 && (
                          <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-cpm-bg-primary/80 px-2.5 py-0.5 text-xs font-medium text-cpm-text-primary backdrop-blur-sm">
                            <svg className="h-3.5 w-3.5 text-cpm-accent" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                            {rating.toFixed(1)} <span className="text-cpm-text-tertiary">({reviewCount})</span>
                          </div>
                        )}
                        {/* Wishlist heart button */}
                        <button onClick={(e) => { e.stopPropagation(); /* wishlist toggle */ }} className="absolute bottom-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-cpm-bg-primary/70 text-cpm-text-primary/60 backdrop-blur-sm transition-all hover:text-cpm-error hover:scale-110" aria-label="Save to wishlist">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" /></svg>
                        </button>
                      </div>
                      <div className="p-4">
                        <h3 className="mb-1 text-base font-medium text-cpm-text-primary">{prop.title}</h3>
                        <p className="mb-3 flex items-center gap-1 text-sm text-cpm-text-secondary">
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>
                          {prop.location?.city || "Malta"}{prop.location?.address ? `, ${prop.location.address}` : ""}
                        </p>
                        <div className="mb-3 flex items-center gap-4 text-xs text-cpm-text-secondary">
                          <span className="flex items-center gap-1"><svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>{prop.bedrooms} Bed</span>
                          <span className="flex items-center gap-1"><svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>{prop.bathrooms} Bath</span>
                          <span className="flex items-center gap-1"><svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg>{prop.maxGuests}</span>
                        </div>
                        {amenities.length > 0 && (
                          <div className="mb-3 flex flex-wrap gap-1.5">
                            {amenities.map((a) => (
                              <span key={a} className="rounded-full bg-cpm-bg-primary px-2 py-0.5 text-[10px] font-medium text-cpm-text-secondary">{a}</span>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-lg font-semibold text-cpm-accent">€{prop.rates.baseRate}</span>
                            <span className="text-xs text-cpm-text-tertiary"> / night</span>
                          </div>
                        </div>
                        <button onClick={() => window.dispatchEvent(new CustomEvent("guesty-select", { detail: { slug: prop.slug, id: prop.id } }))} className="mt-3 w-full rounded-xl border border-cpm-accent/20 bg-cpm-accent/5 px-4 py-2 text-xs font-medium text-cpm-accent transition-all duration-300 hover:bg-cpm-accent hover:text-cpm-bg-primary active:scale-[0.98]">View Details</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </>
    );
  },
};