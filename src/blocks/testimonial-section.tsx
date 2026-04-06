import React from "react";

export const TestimonialSection = {
  label: "Testimonials",
  fields: {
    title: { type: "text" as const },
    testimonials: {
      type: "array" as const,
      label: "Testimonials",
      defaultItemProps: { name: "Guest", date: "", rating: "5", quote: "Great stay!" },
      getItemSummary: (item: Record<string, unknown>) => (item as { name?: string }).name || "Testimonial",
      arrayFields: {
        name: { type: "text" as const },
        date: { type: "text" as const },
        rating: { type: "select" as const, options: [{ label: "1 Star", value: "1" }, { label: "2 Stars", value: "2" }, { label: "3 Stars", value: "3" }, { label: "4 Stars", value: "4" }, { label: "5 Stars", value: "5" }] },
        quote: { type: "textarea" as const },
      },
    },
  },
  defaultProps: {
    title: "What Our Guests Say",
    testimonials: [
      { name: "Katie", date: "October 2024", rating: "5", quote: "Christiano was an amazing host and the apartment was flawless. Every detail was thoughtfully considered, from the welcome hamper to the spotless cleanliness. The location in Valletta was perfect for exploring Malta." },
      { name: "John", date: "September 2024", rating: "5", quote: "Communication was excellent from the moment I booked. The check-in process was seamless, and the apartment exceeded all expectations. The attention to detail really sets Christiano apart." },
      { name: "Sarah & Mark", date: "August 2024", rating: "5", quote: "From the beautifully appointed apartment to the comprehensive local guide, everything was perfect. Christiano's responsiveness and genuine care made this a five-star experience." },
      { name: "Eric", date: "October 2024", rating: "5", quote: "Exceptional service from start to finish. The property was immaculate, well-equipped, and perfectly located. Felt like staying at a luxury hotel with the comfort of a home." },
    ],
  },
  Component: (props: Record<string, unknown>) => {
    const p = props as { title: string; testimonials: { name: string; date: string; rating: string; quote: string }[] };
    const [active, setActive] = React.useState(0);
    const [paused, setPaused] = React.useState(false);
    const items = p.testimonials || [];

    React.useEffect(() => {
      if (paused || items.length <= 2) return;
      const timer = setInterval(() => { setActive((a) => (a + 1) % Math.ceil(items.length / 2)); }, 6000);
      return () => clearInterval(timer);
    }, [paused, items.length]);

    const perPage = 2;
    const maxIndex = Math.max(0, Math.ceil(items.length / perPage) - 1);
    const visible = items.slice(active * perPage, active * perPage + perPage);

    const avatarColors = [
      "from-cpm-accent to-cpm-gold-dark",
      "from-cpm-accent-hover to-cpm-accent",
      "from-[#b8944f] to-[#8a6e30]",
      "from-[#e0c88a] to-cpm-accent",
    ];

    const prev = () => setActive((a) => (a > 0 ? a - 1 : maxIndex));
    const next = () => setActive((a) => (a < maxIndex ? a + 1 : 0));

    return (
      <>
        <section className="relative bg-cpm-bg-secondary px-4 py-20 sm:px-8 lg:py-32 overflow-hidden"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}>
          <div className="pointer-events-none absolute top-12 right-12 text-[200px] leading-none font-serif opacity-[0.03] text-cpm-accent select-none hidden lg:block">&ldquo;</div>
          <div className="relative mx-auto max-w-6xl">
            <div className="mb-14 text-center">
              <h2 className="font-[family-name:var(--font-heading)] text-3xl font-light tracking-tight text-cpm-text-primary sm:text-4xl">{p.title}</h2>
              <div className="mx-auto mt-4 h-[2px] w-16 bg-gradient-to-r from-transparent via-cpm-accent to-transparent" />
            </div>
            <div className="relative">
              {/* Nav arrows */}
              {maxIndex > 0 && (
                <>
                  <button onClick={prev} className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 hidden lg:flex h-10 w-10 items-center justify-center rounded-full border border-cpm-border bg-cpm-bg-secondary text-cpm-text-secondary transition-all hover:border-cpm-accent/30 hover:text-cpm-accent" aria-label="Previous">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
                  </button>
                  <button onClick={next} className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 hidden lg:flex h-10 w-10 items-center justify-center rounded-full border border-cpm-border bg-cpm-bg-secondary text-cpm-text-secondary transition-all hover:border-cpm-accent/30 hover:text-cpm-accent" aria-label="Next">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
                  </button>
                </>
              )}
              <div className="grid gap-6 sm:grid-cols-2" style={{ animation: "carouselSlide 0.4s ease-out" }} key={active}>
                {visible.map((t, i) => {
                  const rating = parseInt(t.rating) || 5;
                  const globalIdx = active * perPage + i;
                  return (
                    <div key={globalIdx} className="group rounded-2xl border border-cpm-border bg-cpm-bg-primary p-6 transition-all duration-500 hover:-translate-y-1 hover:border-cpm-accent/30 hover:shadow-[0_8px_30px_rgba(200,169,106,0.06)]">
                      <div className="mb-4 flex gap-1">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <svg key={j} className={`h-4 w-4 transition-transform duration-200 hover:scale-125 ${j < rating ? "text-cpm-accent" : "text-cpm-text-tertiary"}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                        ))}
                      </div>
                      <p className="mb-5 text-sm leading-[1.8] text-cpm-text-secondary italic">&ldquo;{t.quote}&rdquo;</p>
                      <div className="flex items-center gap-3">
                        <div className={`flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br ${avatarColors[globalIdx % avatarColors.length]}`}>
                          <span className="text-sm font-bold text-cpm-bg-primary">{(t.name || "?")[0]}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-cpm-text-primary">{t.name}</p>
                          <p className="text-xs text-cpm-text-tertiary">{t.date}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Dots */}
              {maxIndex > 0 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  {Array.from({ length: maxIndex + 1 }).map((_, i) => (
                    <button key={i} onClick={() => setActive(i)} className={`h-2 rounded-full transition-all duration-300 ${i === active ? "w-6 bg-cpm-accent" : "w-2 bg-cpm-border-hover hover:bg-cpm-text-tertiary"}`} aria-label={`Go to slide ${i + 1}`} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </>
    );
  },
  ai: { instructions: "2-6 authentic guest testimonials. Quotes must mention specific CPM strengths: cleanliness, location, responsiveness. Ratings 4-5 stars." },
};