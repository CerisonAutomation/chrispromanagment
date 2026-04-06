import React from "react";
import { toast } from "sonner";

function GuestyRenderStars(rating: number) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(<svg key={i} className={`h-3.5 w-3.5 ${i <= Math.round(rating) ? "text-cpm-accent" : "text-cpm-border-hover"}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>);
  }
  return <span className="flex items-center gap-0.5">{stars}</span>;
}

function GuestyAmenityIcon({ name }: { name: string }) {
  const icons: Record<string, string> = {
    wifi: "M9.348 14.652a3.75 3.75 0 010-5.304m5.304 0a3.75 3.75 0 010 5.304m-7.425 2.121a6.75 6.75 0 010-9.546m9.546 0a6.75 6.75 0 010 9.546M5.106 18.894c-3.808-3.807-3.808-9.98 0-13.788m13.788 0c3.808 3.807 3.808 9.98 0 13.788",
    parking: "M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0H21M3.375 14.25V3.375c0-.621.504-1.125 1.125-1.125h9.75c.621 0 1.125.504 1.125 1.125v10.875",
    pool: "M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z",
    ac: "M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636",
    kitchen: "M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z",
    tv: "M6 20.25h12m-7.5-3v3m3-3v3m-10.125-3h17.25c.621 0 1.125-.504 1.125-1.125V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125z",
    default: "M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z",
  };
  return (
    <svg className="h-5 w-5 text-cpm-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d={icons[name.toLowerCase()] || icons.default} />
    </svg>
  );
}

export const GuestyPropertyDetail = {
  label: "Guesty · Property Detail",
  fields: {
    defaultSlug: { type: "text" as const, label: "Default Property Slug" },
  },
  defaultProps: {
    defaultSlug: "valletta-apartment-1",
  },
  Component: (props: Record<string, unknown>) => {
    const p = props as { defaultSlug: string };
    type MappedProp = {
      id: string; slug: string; title: string; nickname: string; description: string; summary: string;
      propertyType: string; location: { city: string; country: string; address: string; coordinates: { lat: number; lng: number } };
      amenities: string[]; images: { url: string; caption?: string }[];
      rates: { baseRate: number; currency: string; minimumStay: { value: number; type: string } };
      reviews: { score: number; total: number; count: number }[];
      houseRules: string[]; maxGuests: number; bedrooms: number; bathrooms: number;
      status: string; source: string;
    };
    const [slug, setSlug] = React.useState(p.defaultSlug);
    const [property, setProperty] = React.useState<MappedProp | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [activeImage, setActiveImage] = React.useState(0);
    const [lightboxOpen, setLightboxOpen] = React.useState(false);

    const abortRef = React.useRef<AbortController | null>(null);

    const fetchProperty = React.useCallback(async (s: string) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);
      setError(null);
      setActiveImage(0);
      try {
        const res = await fetch(`/api/guesty/listings/${s}`, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setProperty(data.listing || data);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError((err as Error).message || "Failed to load property");
          setProperty(null);
          toast.error("Failed to load property");
        }
      } finally { setLoading(false); }
    }, []);

    React.useEffect(() => { fetchProperty(slug); return () => abortRef.current?.abort(); }, [slug, fetchProperty]);

    React.useEffect(() => {
      const handler = (e: Event) => {
        const detail = (e as CustomEvent).detail;
        if (detail?.slug) { setSlug(detail.slug); window.scrollTo({ top: 0, behavior: "smooth" }); }
      };
      window.addEventListener("guesty-select", handler);
      return () => window.removeEventListener("guesty-select", handler);
    }, []);

    const images = (property?.images || []).map((img) => img.url);
    const rating = property?.reviews?.[0]?.score || 0;
    const reviewCount = property?.reviews?.[0]?.count || 0;

    if (loading) {
      return (
        <section className="bg-cpm-bg-primary px-4 py-20 sm:px-8 lg:py-32">
          <div className="mx-auto max-w-6xl animate-pulse space-y-6">
            <div className="h-[400px] rounded-2xl bg-cpm-bg-secondary" style={{ backgroundImage: "linear-gradient(90deg, var(--cpm-bg-secondary) 25%, #1e2025 50%, var(--cpm-bg-secondary) 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
            <div className="grid gap-6 lg:grid-cols-3"><div className="lg:col-span-2 space-y-4"><div className="h-8 w-3/4 rounded bg-cpm-bg-secondary" /><div className="h-4 w-full rounded bg-cpm-bg-secondary" /><div className="h-4 w-2/3 rounded bg-cpm-bg-secondary" /></div><div className="h-48 rounded-2xl bg-cpm-bg-secondary" /></div>
          </div>
        </section>
      );
    }

    if (error || !property) {
      return (
        <section className="bg-cpm-bg-primary px-4 py-20 sm:px-8 lg:py-32">
          <div className="mx-auto flex max-w-4xl flex-col items-center justify-center py-20 text-center">
            <svg className="mb-4 h-16 w-16 text-cpm-border-hover" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>
            <h3 className="mb-2 text-lg font-medium text-cpm-text-primary">{error ? "Error loading property" : "Select a Property"}</h3>
            <p className="mb-4 text-sm text-cpm-text-secondary">{error || "Browse our properties above and click \"View Details\" to see more information."}</p>
            {error && <button onClick={() => fetchProperty(slug)} className="rounded-xl border border-cpm-accent/20 bg-cpm-accent/5 px-6 py-2.5 text-sm font-medium text-cpm-accent transition-all duration-300 hover:bg-cpm-accent hover:text-cpm-bg-primary">Try Again</button>}
          </div>
        </section>
      );
    }

    return (
      <>
        <section className="bg-cpm-bg-primary px-4 py-20 sm:px-8 lg:py-32">
          <div className="mx-auto max-w-6xl" style={{ animation: "fadeInUp 0.5s ease-out" }}>
            <button onClick={() => window.dispatchEvent(new CustomEvent("guesty-search", { detail: {} }))} className="mb-8 inline-flex items-center gap-2 text-sm text-cpm-text-secondary transition-colors hover:text-cpm-accent">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" /></svg>
              Back to Properties
            </button>

            {/* Image Gallery */}
            <div className="mb-8 overflow-hidden rounded-2xl border border-cpm-border">
              <div className="relative h-64 sm:h-96 lg:h-[500px]">
                <img src={images[activeImage] || "/placeholder.jpg"} alt={property.title} className="h-full w-full object-cover transition-all duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-cpm-bg-primary/60 via-transparent to-transparent" />
                {images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 overflow-x-auto px-4 pb-2">
                    {images.map((img, idx) => (
                      <button key={idx} onClick={() => setActiveImage(idx)} className={`h-16 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-300 ${idx === activeImage ? "border-cpm-accent opacity-100" : "border-transparent opacity-60 hover:opacity-80"}`}>
                        <img src={img} alt={`${property.title} — Photo ${idx + 1}`} className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
                <button onClick={() => setLightboxOpen(true)} className="absolute right-4 top-4 rounded-full bg-cpm-bg-primary/70 px-3 py-1.5 text-xs font-medium text-cpm-text-primary backdrop-blur-sm transition-all hover:bg-cpm-bg-primary/90">
                  <svg className="mr-1 inline h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM10.5 7.5v6m3-3h-6" /></svg>
                  {images.length} Photos
                </button>
              </div>
            </div>

            {/* Lightbox */}
            {lightboxOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-cpm-bg-primary/95 backdrop-blur-sm" onClick={() => setLightboxOpen(false)}>
                <button className="absolute right-6 top-6 text-cpm-text-primary hover:text-cpm-accent" onClick={() => setLightboxOpen(false)}>
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                </button>
                <div className="relative max-h-[85vh] max-w-[85vw]" onClick={(e) => e.stopPropagation()}>
                  <img src={images[activeImage] || "/placeholder.jpg"} alt="" className="max-h-[80vh] rounded-2xl object-contain" />
                  <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-3">
                    <button onClick={() => setActiveImage(Math.max(0, activeImage - 1))} className="rounded-full bg-cpm-bg-secondary px-3 py-2 text-cpm-text-primary hover:bg-cpm-border" disabled={activeImage === 0}>
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
                    </button>
                    <span className="flex items-center text-sm text-cpm-text-secondary">{activeImage + 1} / {images.length}</span>
                    <button onClick={() => setActiveImage(Math.min(images.length - 1, activeImage + 1))} className="rounded-full bg-cpm-bg-secondary px-3 py-2 text-cpm-text-primary hover:bg-cpm-border" disabled={activeImage === images.length - 1}>
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-8">
                {/* Property Info */}
                <div className="rounded-2xl border border-cpm-border bg-cpm-bg-secondary p-6 sm:p-8">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h1 className="font-[family-name:var(--font-heading)] text-2xl font-light tracking-tight text-cpm-text-primary sm:text-3xl">{property.title}</h1>
                      <p className="mt-1 flex items-center gap-1 text-cpm-text-secondary">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>
                        {property.location?.address || ""}, {property.location?.city || "Malta"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="rounded-full border border-cpm-accent/30 bg-cpm-accent/10 px-3 py-1 text-xs font-semibold text-cpm-accent uppercase">{property.propertyType}</span>
                      {rating > 0 && (
                        <span className="flex items-center gap-1">{GuestyRenderStars(rating)}<span className="text-sm font-medium text-cpm-text-primary">{rating.toFixed(1)}</span><span className="text-xs text-cpm-text-tertiary">({reviewCount})</span></span>
                      )}
                    </div>
                  </div>
                  <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                    {[
                      { label: "Bedrooms", value: String(property.bedrooms), icon: "M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" },
                      { label: "Bathrooms", value: String(property.bathrooms), icon: "M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" },
                      { label: "Max Guests", value: String(property.maxGuests), icon: "M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" },
                      { label: "Min Stay", value: `${property.rates.minimumStay?.value || 1} night${(property.rates.minimumStay?.value || 1) > 1 ? "s" : ""}`, icon: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" },
                      { label: "Location", value: property.location?.city || "Malta", icon: "M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" },
                    ].map((item, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-2 rounded-xl bg-cpm-bg-primary p-3 text-center">
                        <svg className="h-5 w-5 text-cpm-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d={item.icon} /></svg>
                        <span className="text-xs text-cpm-text-tertiary">{item.label}</span>
                        <span className="text-sm font-medium text-cpm-text-primary">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Description */}
                {(property.description || property.summary) && (
                  <div className="rounded-2xl border border-cpm-border bg-cpm-bg-secondary p-6 sm:p-8">
                    <h3 className="mb-4 text-lg font-medium text-cpm-text-primary">About this property</h3>
                    <p className="whitespace-pre-line text-sm leading-[1.8] text-cpm-text-secondary">{property.description || property.summary}</p>
                  </div>
                )}

                {/* Amenities */}
                {property.amenities && property.amenities.length > 0 && (
                  <div className="rounded-2xl border border-cpm-border bg-cpm-bg-secondary p-6 sm:p-8">
                    <h3 className="mb-6 text-lg font-medium text-cpm-text-primary">Amenities</h3>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {property.amenities.map((amenity, idx) => (
                        <div key={idx} className="flex items-center gap-3 rounded-xl bg-cpm-bg-primary p-3">
                          <GuestyAmenityIcon name={amenity} />
                          <span className="text-sm text-cpm-text-primary">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* House Rules */}
                {property.houseRules && property.houseRules.length > 0 && (
                  <div className="rounded-2xl border border-cpm-border bg-cpm-bg-secondary p-6 sm:p-8">
                    <h3 className="mb-6 text-lg font-medium text-cpm-text-primary">House Rules</h3>
                    <ul className="space-y-3">
                      {property.houseRules.map((rule, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm text-cpm-text-secondary">
                          <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-cpm-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                          {rule}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Map placeholder */}
                <div className="rounded-2xl border border-cpm-border bg-cpm-bg-secondary p-6 sm:p-8">
                  <h3 className="mb-4 text-lg font-medium text-cpm-text-primary">Location</h3>
                  <div className="flex h-48 items-center justify-center rounded-xl bg-cpm-bg-primary">
                    <div className="text-center">
                      <svg className="mx-auto mb-2 h-8 w-8 text-cpm-border-hover" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" /></svg>
                      <p className="text-sm text-cpm-text-tertiary">Map integration coming soon</p>
                      <p className="text-xs text-cpm-border-hover">{property.location?.address}, {property.location?.city}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar - Price card */}
              <div>
                <div className="sticky top-24 rounded-2xl border border-cpm-accent/10 p-6 backdrop-blur-xl" style={{ background: "linear-gradient(135deg, rgba(21,23,27,0.95), rgba(14,15,17,0.9))" }}>
                  <div className="mb-4">
                    <span className="text-3xl font-light text-cpm-accent">€{property.rates.baseRate}</span>
                    <span className="text-sm text-cpm-text-tertiary"> / night</span>
                  </div>
                  <button onClick={() => window.dispatchEvent(new CustomEvent("guesty-select", { detail: { slug: property.slug, id: property.id, action: "book" } }))} className="w-full rounded-xl px-6 py-3.5 text-sm font-semibold text-cpm-bg-primary transition-all duration-300 hover:shadow-[0_0_30px_rgba(200,169,106,0.25)] active:scale-[0.98]" style={{ background: "linear-gradient(135deg, var(--cpm-accent), var(--cpm-accent-hover))" }}>Book Now</button>
                  <p className="mt-3 text-center text-xs text-cpm-text-tertiary">You won&apos;t be charged yet</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  },
  ai: { instructions: "Detailed property view with amenities, photo gallery, location map, reviews, and booking widget." },
};