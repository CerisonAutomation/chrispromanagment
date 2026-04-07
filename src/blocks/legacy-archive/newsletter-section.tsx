import React from "react";
import {toast} from "sonner";

export const NewsletterSection = {
  label: "Newsletter Section",
  fields: {
    heading: { type: "text" as const },
    description: { type: "textarea" as const },
    buttonText: { type: "text" as const, label: "Subscribe Button Text" },
    successMessage: { type: "textarea" as const, label: "Success Message" },
  },
  defaultProps: {
    heading: "Stay in the Loop",
    description: "Subscribe to our newsletter for the latest property listings, exclusive deals, and local Malta tips.",
    buttonText: "Subscribe",
    successMessage: "Thank you for subscribing! We'll be in touch soon.",
  },
  render: (props: Record<string, unknown>) => {
    const p = props as { heading: string; description: string; buttonText: string; successMessage: string };
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [email, setEmail] = React.useState("");
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [subscribed, setSubscribed] = React.useState(false);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [loading, setLoading] = React.useState(false);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast.error("Please enter a valid email address.");
        return;
      }
      setLoading(true);
      // Simulate subscription
      setTimeout(() => {
        setLoading(false);
        setSubscribed(true);
        toast.success(p.successMessage || "Successfully subscribed!");
      }, 800);
    };

    return (
      <>
        <section className="relative bg-cpm-bg-primary px-4 py-20 sm:px-8 overflow-hidden">
          {/* Background decorative gradient */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{ background: "radial-gradient(ellipse at center, var(--cpm-accent), transparent 70%)" }} />
          <div className="mx-auto max-w-2xl" style={{ animation: "scaleIn 0.6s ease-out" }}>
            {/* Glassmorphism card */}
            <div
              className="relative rounded-2xl p-10 text-center backdrop-blur-xl overflow-hidden sm:p-12"
              style={{ background: "linear-gradient(135deg, rgba(200,169,106,0.08), rgba(200,169,106,0.03))", border: "1px solid rgba(200,169,106,0.15)" }}
            >
              {/* Top gradient accent line */}
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, transparent, var(--cpm-accent), transparent)" }} />
              {/* Corner accent decorations */}
              <div className="absolute top-0 left-0 h-6 w-[2px] bg-gradient-to-b from-cpm-accent/60 to-transparent" />
              <div className="absolute top-0 left-0 h-[2px] w-6 bg-gradient-to-r from-cpm-accent/60 to-transparent" />
              <div className="absolute top-0 right-0 h-6 w-[2px] bg-gradient-to-b from-cpm-accent/60 to-transparent" />
              <div className="absolute top-0 right-0 h-[2px] w-6 bg-gradient-to-l from-cpm-accent/60 to-transparent" />
              <div className="absolute bottom-0 left-0 h-6 w-[2px] bg-gradient-to-t from-cpm-accent/60 to-transparent" />
              <div className="absolute bottom-0 left-0 h-[2px] w-6 bg-gradient-to-r from-cpm-accent/60 to-transparent" />
              <div className="absolute bottom-0 right-0 h-6 w-[2px] bg-gradient-to-t from-cpm-accent/60 to-transparent" />
              <div className="absolute bottom-0 right-0 h-[2px] w-6 bg-gradient-to-l from-cpm-accent/60 to-transparent" />

              <div className="relative z-10">
                {!subscribed ? (
                  <>
                    {/* Envelope icon */}
                    <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-cpm-accent/10">
                      <svg className="h-7 w-7 text-cpm-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                      </svg>
                    </div>
                    <h2 className="mb-3 font-[family-name:var(--font-heading)] text-3xl font-light tracking-tight text-cpm-text-primary sm:text-4xl">{p.heading}</h2>
                    <p className="mb-8 text-base text-cpm-text-secondary">{p.description}</p>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="flex-1 rounded-xl border border-cpm-border bg-cpm-bg-primary px-5 py-3.5 text-sm text-cpm-text-primary placeholder-cpm-text-tertiary outline-none transition-all duration-300 focus:border-cpm-accent/50"
                        required
                      />
                      <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center justify-center gap-2 rounded-xl px-8 py-3.5 text-sm font-semibold text-cpm-bg-primary transition-all duration-300 hover:shadow-[0_0_30px_rgba(200,169,106,0.3)] active:scale-[0.98] disabled:opacity-50"
                        style={{ background: "linear-gradient(135deg, var(--cpm-accent), var(--cpm-accent-hover))" }}
                      >
                        {loading ? (
                          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        ) : (
                          <>
                            {p.buttonText}
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                            </svg>
                          </>
                        )}
                      </button>
                    </form>
                  </>
                ) : (
                  <div style={{ animation: "scaleIn 0.5s ease-out" }}>
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border-2 border-cpm-success/30 bg-cpm-success/10" style={{ animation: "glowPulse 2s ease-in-out infinite" }}>
                      <svg className="h-8 w-8 text-cpm-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                    <h3 className="mb-2 font-[family-name:var(--font-heading)] text-2xl font-light text-cpm-text-primary">You're Subscribed!</h3>
                    <p className="text-sm text-cpm-text-secondary">{p.successMessage}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </>
    );
  },
  ai: { instructions: "Email subscription section. Encourage sign-ups with value proposition about Malta deals and tips." },
};