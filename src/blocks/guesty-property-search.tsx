import React from "react";
import {toast} from "sonner";

export const GuestyPropertySearch = {
  label: "Guesty · Property Search",
  fields: {
    title: { type: "text" as const },
    subtitle: { type: "textarea" as const },
    buttonText: { type: "text" as const, label: "Search Button Text" },
  },
  defaultProps: {
    title: "Find Your Perfect Stay",
    subtitle: "Search our curated collection of luxury properties across Malta",
    buttonText: "Search Properties",
  },
  render: (props: Record<string, unknown>) => {
    const p = props as { title: string; subtitle: string; buttonText: string };
    const [location, setLocation] = React.useState("");
    const [checkIn, setCheckIn] = React.useState("");
    const [checkOut, setCheckOut] = React.useState("");
    const [guests, setGuests] = React.useState("2");
    const [minPrice, setMinPrice] = React.useState("");
    const [maxPrice, setMaxPrice] = React.useState("");
    const [showAdvanced, setShowAdvanced] = React.useState(false);
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => { setMounted(true); }, []);

    const handleSearch = () => {
      if (!location && !checkIn && !checkOut) {
        toast.error("Please enter at least a location or dates");
        return;
      }
      if (checkIn && checkOut && new Date(checkOut) <= new Date(checkIn)) {
        toast.error("Check-out must be after check-in");
        return;
      }
      const detail: Record<string, string | number> = {};
      if (location) detail.location = location;
      if (checkIn) detail.checkIn = checkIn;
      if (checkOut) detail.checkOut = checkOut;
      detail.guests = parseInt(guests) || 2;
      if (minPrice) detail.minPrice = parseInt(minPrice);
      if (maxPrice) detail.maxPrice = parseInt(maxPrice);
      window.dispatchEvent(new CustomEvent("guesty-search", { detail }));
      toast.success("Searching properties...");
    };

    if (!mounted) {
      return (
        <section className="bg-cpm-bg-primary px-4 py-20 sm:px-8 lg:py-32">
          <div className="mx-auto max-w-4xl animate-pulse">
            <div className="mb-4 h-8 w-64 rounded bg-cpm-border" />
            <div className="mb-8 h-4 w-96 rounded bg-cpm-border" />
            <div className="h-32 rounded-2xl bg-cpm-bg-secondary" />
          </div>
        </section>
      );
    }

    const inputCls = "w-full rounded-xl border border-cpm-border bg-cpm-bg-primary py-3 pl-10 pr-4 text-sm text-cpm-text-primary placeholder-cpm-text-tertiary outline-none transition-all duration-300 focus:border-cpm-accent/50 focus:shadow-[0_0_0_3px_rgba(200,169,106,0.1)]";
    const inputNoIconCls = "w-full rounded-xl border border-cpm-border bg-cpm-bg-primary py-3 px-4 text-sm text-cpm-text-primary placeholder-cpm-text-tertiary outline-none transition-all duration-300 focus:border-cpm-accent/50 focus:shadow-[0_0_0_3px_rgba(200,169,106,0.1)]";

    return (
      <>
        <section className="relative bg-cpm-bg-primary px-4 py-20 sm:px-8 lg:py-32 overflow-hidden">
          <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, var(--cpm-accent) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
          <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-cpm-accent/5 blur-3xl" style={{ animation: "float 6s ease-in-out infinite" }} />

          <div className="relative mx-auto max-w-4xl" style={{ animation: "fadeInUp 0.6s ease-out" }}>
            <div className="mb-12 text-center">
              <h2 className="font-[family-name:var(--font-heading)] text-3xl font-light tracking-tight text-cpm-text-primary sm:text-4xl">{p.title}</h2>
              <div className="mx-auto mt-4 h-[2px] w-16 bg-gradient-to-r from-transparent via-cpm-accent to-transparent" />
              <p className="mx-auto mt-4 max-w-2xl text-base text-cpm-text-secondary">{p.subtitle}</p>
            </div>

            <div className="rounded-2xl border border-cpm-accent/10 p-6 sm:p-8 backdrop-blur-xl" style={{ background: "linear-gradient(135deg, rgba(21,23,27,0.95), rgba(14,15,17,0.9))" }}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="lg:col-span-1">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-cpm-text-tertiary">Where</label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cpm-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>
                    <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City or location" className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-cpm-text-tertiary">Check-in</label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cpm-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg>
                    <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-cpm-text-tertiary">Check-out</label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cpm-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg>
                    <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-cpm-text-tertiary">Guests</label>
                  <select value={guests} onChange={(e) => setGuests(e.target.value)} className={inputNoIconCls}>
                    {[1,2,3,4,5,6,7,8,9,10].map((n) => (<option key={n} value={n}>{n} {n === 1 ? "Guest" : "Guests"}</option>))}
                  </select>
                </div>
              </div>

              {/* Quick location select */}
              <div className="mt-4 flex flex-wrap gap-2">
                {["Valletta", "Sliema", "St. Julian's", "Gzira", "Mdina"].map((loc) => (
                  <button key={loc} type="button" onClick={() => setLocation(loc)} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${location === loc ? "bg-cpm-accent text-cpm-bg-primary" : "bg-cpm-bg-primary text-cpm-text-secondary border border-cpm-border hover:border-cpm-accent/30 hover:text-cpm-text-primary"}`}>
                    {loc}
                  </button>
                ))}
              </div>

              {/* Advanced filters toggle */}
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="mt-4 flex items-center gap-1.5 text-xs font-medium text-cpm-text-secondary transition-colors hover:text-cpm-accent">
                <svg className={`h-3.5 w-3.5 transition-transform duration-300 ${showAdvanced ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                Price range
              </button>

              {showAdvanced && (
                <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-2" style={{ animation: "fadeInUp 0.2s ease-out" }}>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-cpm-text-tertiary">Min Price / night</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-cpm-text-tertiary">€</span>
                      <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="0" min="0" className={inputNoIconCls} style={{ paddingLeft: "1.75rem" }} />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-cpm-text-tertiary">Max Price / night</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-cpm-text-tertiary">€</span>
                      <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="999" min="0" className={inputNoIconCls} style={{ paddingLeft: "1.75rem" }} />
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6">
                <button onClick={handleSearch} className="inline-flex w-full items-center justify-center gap-2.5 rounded-xl px-8 py-3.5 text-sm font-semibold text-cpm-bg-primary transition-all duration-300 hover:shadow-[0_0_30px_rgba(200,169,106,0.25)] active:scale-[0.98]" style={{ background: "linear-gradient(135deg, var(--cpm-accent), var(--cpm-accent-hover))" }}>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
                  {p.buttonText}
                </button>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  },
  ai: { instructions: "Property search interface with clear call-to-action. Emphasize luxury Malta vacation rentals." },
};