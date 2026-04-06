import React from "react";
import { CONTACT } from "@/lib/constants";

export const GuestyBookingConfirmation = {
  label: "Guesty · Booking Confirmation",
  fields: {
    title: { type: "text" as const },
    subtitle: { type: "textarea" as const },
  },
  defaultProps: {
    title: "Booking Confirmed!",
    subtitle: "Your reservation has been successfully placed. Check your email for confirmation details.",
  },
  Component: (props: Record<string, unknown>) => {
    const p = props as { title: string; subtitle: string };
    const [booking, setBooking] = React.useState<Record<string, unknown> | null>(null);

    React.useEffect(() => {
      const handler = (e: Event) => {
        const detail = (e as CustomEvent).detail;
        if (detail) setBooking(detail);
      };
      window.addEventListener("guesty-booking-confirmed", handler);
      return () => window.removeEventListener("guesty-booking-confirmed", handler);
    }, []);

    if (!booking) return null;

    const nights = (() => {
      const ci = booking.checkIn as string;
      const co = booking.checkOut as string;
      if (ci && co) return Math.max(1, Math.round((new Date(co).getTime() - new Date(ci).getTime()) / 86400000));
      return 0;
    })();
    const money = booking.money as Record<string, number> | undefined;
    const total = money?.totalAmount || 0;
    const guest = booking.guest as Record<string, string> | undefined;
    const guestName = guest ? `${guest.firstName || ""} ${guest.lastName || ""}`.trim() : "N/A";

    return (
      <>
        <section className="bg-cpm-bg-primary px-4 py-20 sm:px-8 lg:py-32">
          <div className="mx-auto max-w-2xl" style={{ animation: "scaleIn 0.5s ease-out" }}>
            <div className="rounded-2xl border border-cpm-success/20 p-8 sm:p-10 backdrop-blur-xl text-center" style={{ background: "linear-gradient(135deg, rgba(21,23,27,0.95), rgba(14,15,17,0.9))" }}>
              {/* Animated checkmark */}
              <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-cpm-success/10" style={{ animation: "pulseRing 2s cubic-bezier(0,0,0.2,1) infinite" }} />
                <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-cpm-success/30 bg-cpm-success/10">
                  <svg className="h-10 w-10 text-cpm-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                </div>
              </div>

              <h2 className="mb-2 font-[family-name:var(--font-heading)] text-2xl font-light tracking-tight text-cpm-text-primary sm:text-3xl">{p.title}</h2>
              <p className="mb-8 text-sm text-cpm-text-secondary">{p.subtitle}</p>

              {/* Booking details */}
              <div className="mb-8 rounded-xl bg-cpm-bg-primary p-5 text-left space-y-3">
                {[
                  { label: "Confirmation Code", value: (booking.quoteId || booking.id || "N/A") as string, highlight: true },
                  { label: "Property", value: (booking.title || "N/A") as string },
                  { label: "Guest", value: guestName },
                  { label: "Check-in", value: (booking.checkIn || "N/A") as string },
                  { label: "Check-out", value: (booking.checkOut || "N/A") as string },
                  { label: "Nights", value: String(nights || "N/A") },
                  { label: "Guests", value: String(booking.guests || "N/A") },
                  { label: "Total", value: `€${Number(total || 0).toFixed(2)}`, highlight: true },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-sm text-cpm-text-tertiary">{item.label}</span>
                    <span className={`text-sm font-medium ${item.highlight ? "font-mono text-cpm-accent" : "text-cpm-text-primary"}`}>{item.value}</span>
                  </div>
                ))}
              </div>

              {/* Contact info */}
              <div className="mb-8 rounded-xl bg-cpm-bg-primary p-5 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-cpm-text-tertiary">Need help?</p>
                <a href={`mailto:${CONTACT.email}`} className="mt-1 text-sm text-cpm-accent hover:text-cpm-accent-hover transition-colors">{CONTACT.email}</a>
                <span className="mx-2 text-cpm-border-hover">|</span>
                <a href={`tel:${CONTACT.phone}`} className="text-sm text-cpm-accent hover:text-cpm-accent-hover transition-colors">{CONTACT.phone}</a>
              </div>

              <button onClick={() => { setBooking(null); window.dispatchEvent(new CustomEvent("guesty-search", { detail: {} })); }} className="w-full rounded-xl px-8 py-3.5 text-sm font-semibold text-cpm-bg-primary transition-all duration-300 hover:shadow-[0_0_30px_rgba(200,169,106,0.25)] active:scale-[0.98]" style={{ background: "linear-gradient(135deg, var(--cpm-accent), var(--cpm-accent-hover))" }}>
                Book Another Stay
              </button>
            </div>
          </div>
        </section>
      </>
    );
  },
  ai: { instructions: "Booking success confirmation with reservation details and next steps. Celebratory but professional tone." },
};