import React from "react";

export const FaqSection = {
  label: "FAQ Section",
  fields: {
    title: { type: "text" as const },
    items: {
      type: "array" as const,
      label: "FAQ Items",
      defaultItemProps: { question: "Question?", answer: "Answer." },
      getItemSummary: (item: Record<string, unknown>) => (item as { question?: string }).question || "FAQ",
      arrayFields: {
        question: { type: "text" as const },
        answer: { type: "textarea" as const },
      },
    },
  },
  defaultProps: {
    title: "Your Questions, Answered",
    items: [
      { question: "What types of properties do you manage?", answer: "We manage luxury apartments in Valletta, villas in Bahar ic-Caghaq, and unique event spaces in Madliena. We focus on properties that meet our high quality standards." },
      { question: "How do you handle guest communication?", answer: "We provide 24/7 guest communication across all major booking platforms. We respond within minutes, not hours." },
      { question: "What is included in your management services?", answer: "Multi-channel listing, dynamic pricing, guest communication, check-in/out, professional cleaning, maintenance, payment processing, reviews management, and monthly reports." },
      { question: "How do you ensure property quality?", answer: "Thorough assessments, regular maintenance, professional cleaning between stays, and immediate issue resolution. Quarterly property reviews ensure excellence." },
      { question: "How do you set rental prices?", answer: "Advanced dynamic pricing considering seasonal demand, local events, competitor analysis, and historical data to maximise occupancy and revenue." },
      { question: "What are your fees?", answer: "Essentials: 15% of net room revenue. Complete: 18%. No hidden fees or markups. Transparent pricing aligned with your success." },
      { question: "How often will I receive updates?", answer: "Essentials: monthly reports. Complete: monthly reports + quarterly reviews. Plus owner dashboard for real-time insights." },
      { question: "How do I get started?", answer: "Contact us for a free property assessment. We'll visit, discuss goals, and provide a personalised proposal. Smooth onboarding, we handle all setup." },
    ],
  },
  Component: (props: Record<string, unknown>) => {
    const p = props as { title: string; items: { question: string; answer: string }[] };
    const [search, setSearch] = React.useState("");
    const [allOpen, setAllOpen] = React.useState(false);
    const allItems = React.useRef<HTMLDetailsElement[]>([]);
    
    const filtered = (p.items || []).filter(
      (item) => !search || item.question.toLowerCase().includes(search.toLowerCase()) || item.answer.toLowerCase().includes(search.toLowerCase())
    );

    React.useEffect(() => {
      allItems.current.forEach((el) => { if (el) el.open = allOpen; });
    }, [allOpen]);

    return (
      <>
        <section className="bg-cpm-bg-primary px-4 py-20 sm:px-8 lg:py-32">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <h2 className="font-[family-name:var(--font-heading)] text-3xl font-light tracking-tight text-cpm-text-primary sm:text-4xl">{p.title}</h2>
              <div className="mx-auto mt-4 h-[2px] w-16 bg-gradient-to-r from-transparent via-cpm-accent to-transparent" />
            </div>
            {/* Search */}
            <div className="mx-auto mb-6 max-w-md">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cpm-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search questions..." className="w-full rounded-xl border border-cpm-border bg-cpm-bg-secondary py-3 pl-10 pr-4 text-sm text-cpm-text-primary outline-none transition-all focus:border-cpm-accent/50 placeholder-cpm-text-tertiary" />
              </div>
            </div>
            {/* Controls */}
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-cpm-text-tertiary">{filtered.length} of {(p.items || []).length} questions</p>
              <button onClick={() => setAllOpen(!allOpen)} className="text-xs font-medium text-cpm-accent transition-colors hover:text-cpm-accent-hover">{allOpen ? "Collapse All" : "Expand All"}</button>
            </div>
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {filtered.length === 0 ? (
                <div className="col-span-2 py-12 text-center text-cpm-text-tertiary">No questions match your search.</div>
              ) : filtered.map((item, i) => (
                <details
                  key={i}
                  ref={(el) => { if (el) allItems.current[i] = el; }}
                  open={allOpen}
                  className="group rounded-xl border border-cpm-border bg-cpm-bg-secondary transition-all duration-300 hover:border-cpm-accent/20"
                >
                  <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 text-sm font-medium text-cpm-text-primary list-none select-none">
                    <span>{item.question}</span>
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-cpm-accent/30 text-cpm-accent transition-all duration-300 group-open:border-cpm-accent group-open:bg-cpm-accent/10">
                      <svg className="h-3.5 w-3.5 transition-transform duration-300 group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </summary>
                  <div className="px-5 pb-4 pt-0">
                    <div className="border-l-2 border-cpm-accent/40 pl-4 pt-1">
                      <p className="text-sm leading-[1.8] text-cpm-text-secondary">{item.answer}</p>
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      </>
    );
  },
  ai: { instructions: "4-12 common questions from guests and owners. Answers 2-4 sentences. Cover booking, check-in, cancellation, amenities." },
};