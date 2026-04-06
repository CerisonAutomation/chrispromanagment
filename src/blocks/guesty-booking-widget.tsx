import React from "react";
import { toast } from "sonner";

export const GuestyBookingWidget = {
  label: "Guesty · Booking Widget",
  fields: {
    defaultSlug: { type: "text" as const, label: "Default Property Slug" },
    title: { type: "text" as const },
  },
  defaultProps: {
    defaultSlug: "valletta-apartment-1",
    title: "Complete Your Booking",
  },
  Component: (props: Record<string, unknown>) => {
    const p = props as { defaultSlug: string; title: string };
    type MappedProp = { id: string; slug: string; title: string; rates: { baseRate: number }; maxGuests: number; images: { url: string }[] };
    type MappedQuote = { id: string; externalId: string; status: string; listingId: string; checkIn: string; checkOut: string; guest: { firstName: string; lastName: string; email: string; phone: string; adults: number }; money: { rentalAmount: number; cleaningFee: number; serviceFee: number; totalAmount: number; currency: string }; sourceSystem: string; notes: string; createdAt: string };

    const [slug, setSlug] = React.useState(p.defaultSlug);
    const [step, setStep] = React.useState(1);
    const [loading, setLoading] = React.useState(false);
    const [submitting, setSubmitting] = React.useState(false);
    const [property, setProperty] = React.useState<MappedProp | null>(null);
    const [propLoading, setPropLoading] = React.useState(true);
    const [bookingResult, setBookingResult] = React.useState<MappedQuote | null>(null);
    const [formErrors, setFormErrors] = React.useState<Record<string, string>>({});

    const [dates, setDates] = React.useState({ checkIn: "", checkOut: "", guests: "2" });
    const [guestInfo, setGuestInfo] = React.useState({ firstName: "", lastName: "", email: "", phone: "", notes: "" });

    const fetchProperty = React.useCallback(async (s: string) => {
      setPropLoading(true);
      try {
        const res = await fetch(`/api/guesty/listings/${s}`);
        if (res.ok) { const data = await res.json(); setProperty(data.listing || data); }
      } catch { /* silent */ }
      finally { setPropLoading(false); }
    }, []);

    React.useEffect(() => { fetchProperty(slug); }, [slug, fetchProperty]);

    React.useEffect(() => {
      const handler = (e: Event) => {
        const detail = (e as CustomEvent).detail;
        if (detail?.slug) {
          setSlug(detail.slug);
          setStep(1);
          setDates({ checkIn: "", checkOut: "", guests: "2" });
          setGuestInfo({ firstName: "", lastName: "", email: "", phone: "", notes: "" });
          setBookingResult(null);
          setFormErrors({});
        }
      };
      window.addEventListener("guesty-select", handler);
      return () => window.removeEventListener("guesty-select", handler);
    }, []);

    const nights = dates.checkIn && dates.checkOut ? Math.max(1, Math.round((new Date(dates.checkOut).getTime() - new Date(dates.checkIn).getTime()) / 86400000)) : 0;
    const basePrice = (property?.rates.baseRate || 0) * nights;
    const cleaningFee = Math.round(property?.rates.baseRate ? Math.max(50, property.rates.baseRate * 0.3) : 0);
    const serviceFee = Math.round(basePrice * 0.12 * 100) / 100;
    const totalPrice = Math.round((basePrice + cleaningFee + serviceFee) * 100) / 100;

    const validateStep1 = () => {
      const errs: Record<string, string> = {};
      if (!dates.checkIn) errs.checkIn = "Check-in date is required";
      if (!dates.checkOut) errs.checkOut = "Check-out date is required";
      if (dates.checkIn && dates.checkOut && new Date(dates.checkOut) <= new Date(dates.checkIn)) errs.checkOut = "Check-out must be after check-in";
      setFormErrors(errs);
      return Object.keys(errs).length === 0;
    };

    const validateStep2 = () => {
      const errs: Record<string, string> = {};
      if (!guestInfo.firstName.trim()) errs.firstName = "First name is required";
      if (!guestInfo.lastName.trim()) errs.lastName = "Last name is required";
      if (!guestInfo.email.trim()) errs.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestInfo.email)) errs.email = "Invalid email format";
      setFormErrors(errs);
      return Object.keys(errs).length === 0;
    };

    const submitBooking = async () => {
      if (!property || !validateStep2()) return;
      setSubmitting(true);
      setFormErrors({});
      try {
        const res = await fetch("/api/guesty/quotes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            listingId: property.slug || property.id,
            checkIn: dates.checkIn,
            checkOut: dates.checkOut,
            guest: {
              firstName: guestInfo.firstName.trim(),
              lastName: guestInfo.lastName.trim(),
              email: guestInfo.email.trim(),
              phone: guestInfo.phone.trim() || undefined,
              adults: parseInt(dates.guests) || 1,
            },
            source: "direct",
            notes: guestInfo.notes.trim() || undefined,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          const quote = data.quote || data;
          setBookingResult(quote);
          setStep(3);
          window.dispatchEvent(new CustomEvent("guesty-booking-confirmed", { detail: { quoteId: quote.id || quote.externalId, listingId: property.slug, title: property.title, checkIn: quote.checkIn || dates.checkIn, checkOut: quote.checkOut || dates.checkOut, guests: parseInt(dates.guests), money: quote.money || { totalAmount: totalPrice }, guest: quote.guest, sourceSystem: quote.sourceSystem } }));
          toast.success("Booking confirmed!");
        } else {
          setFormErrors({ submit: data.error || "Booking failed. Please try again." });
          toast.error(data.error || "Booking failed");
        }
      } catch {
        setFormErrors({ submit: "Network error. Please check your connection." });
        toast.error("Network error");
      } finally { setSubmitting(false); }
    };

    const inputCls = "w-full rounded-xl border border-cpm-border bg-cpm-bg-primary px-4 py-3 text-sm text-cpm-text-primary outline-none transition-all duration-300 focus:border-cpm-accent/50 focus:shadow-[0_0_0_3px_rgba(200,169,106,0.1)] placeholder-cpm-text-tertiary";
    const errorInputCls = "w-full rounded-xl border border-cpm-error/50 bg-cpm-bg-primary px-4 py-3 text-sm text-cpm-text-primary outline-none transition-all duration-300 focus:border-cpm-error focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)] placeholder-cpm-text-tertiary";

    return (
      <>
        <section data-booking-widget className="bg-cpm-bg-secondary px-4 py-20 sm:px-8 lg:py-32">
          <div className="mx-auto max-w-3xl">
            <div className="mb-10 text-center" style={{ animation: "fadeInUp 0.6s ease-out" }}>
              <h2 className="font-[family-name:var(--font-heading)] text-3xl font-light tracking-tight text-cpm-text-primary sm:text-4xl">{p.title}</h2>
              <div className="mx-auto mt-4 h-[2px] w-16 bg-gradient-to-r from-transparent via-cpm-accent to-transparent" />
            </div>

            <div className="rounded-2xl border border-cpm-accent/10 p-6 sm:p-8 backdrop-blur-xl" style={{ background: "linear-gradient(135deg, rgba(21,23,27,0.95), rgba(14,15,17,0.9))" }}>
              {/* Progress Indicator */}
              <div className="mb-8 flex items-center justify-center gap-2">
                {[1, 2, 3].map((s) => (
                  <React.Fragment key={s}>
                    <div className={`flex items-center gap-2 ${s <= step ? "text-cpm-accent" : "text-cpm-text-tertiary"}`}>
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300 ${s < step ? "bg-cpm-accent text-cpm-bg-primary" : s === step ? "border-2 border-cpm-accent text-cpm-accent" : "border-2 border-cpm-border-hover text-cpm-text-tertiary"}`}>
                        {s < step ? <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg> : s}
                      </div>
                      <span className="hidden text-xs font-medium sm:inline">{s === 1 ? "Dates" : s === 2 ? "Details" : "Confirm"}</span>
                    </div>
                    {s < 3 && <div className={`h-[1px] w-8 sm:w-16 ${s < step ? "bg-cpm-accent" : "bg-cpm-border-hover"}`} />}
                  </React.Fragment>
                ))}
              </div>

              {/* Step 1: Dates */}
              {step === 1 && (
                <div className="space-y-5" style={{ animation: "fadeInUp 0.3s ease-out" }}>
                  <div className="mb-6 rounded-xl bg-cpm-bg-primary p-4">
                    <p className="text-sm font-medium text-cpm-text-primary">{propLoading ? "Loading property..." : property?.title || "Select a property"}</p>
                    <p className="text-xs text-cpm-text-tertiary">€{property?.rates.baseRate || "..."} / night · Up to {property?.maxGuests || "..."} guests</p>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-cpm-text-primary">Check-in <span className="text-cpm-accent">*</span></label>
                      <input type="date" value={dates.checkIn} onChange={(e) => { setDates({ ...dates, checkIn: e.target.value }); setFormErrors({ ...formErrors, checkIn: "" }); }} className={formErrors.checkIn ? errorInputCls : inputCls} />
                      {formErrors.checkIn && <p className="mt-1 text-xs text-cpm-error">{formErrors.checkIn}</p>}
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-cpm-text-primary">Check-out <span className="text-cpm-accent">*</span></label>
                      <input type="date" value={dates.checkOut} onChange={(e) => { setDates({ ...dates, checkOut: e.target.value }); setFormErrors({ ...formErrors, checkOut: "" }); }} className={formErrors.checkOut ? errorInputCls : inputCls} />
                      {formErrors.checkOut && <p className="mt-1 text-xs text-cpm-error">{formErrors.checkOut}</p>}
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-cpm-text-primary">Guests</label>
                      <select value={dates.guests} onChange={(e) => setDates({ ...dates, guests: e.target.value })} className={inputCls}>
                        {[1,2,3,4,5,6,7,8,9,10].map((n) => (<option key={n} value={n}>{n} {n === 1 ? "Guest" : "Guests"}</option>))}
                      </select>
                    </div>
                  </div>
                  <button onClick={() => { if (validateStep1()) setStep(2); }} className="w-full rounded-xl px-8 py-3.5 text-sm font-semibold text-cpm-bg-primary transition-all duration-300 hover:shadow-[0_0_30px_rgba(200,169,106,0.25)] active:scale-[0.98]" style={{ background: "linear-gradient(135deg, var(--cpm-accent), var(--cpm-accent-hover))" }}>
                    Continue
                  </button>
                </div>
              )}

              {/* Step 2: Guest Info */}
              {step === 2 && (
                <div className="space-y-4" style={{ animation: "fadeInUp 0.3s ease-out" }}>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-cpm-text-primary">First Name <span className="text-cpm-accent">*</span></label>
                      <input type="text" value={guestInfo.firstName} onChange={(e) => { setGuestInfo({ ...guestInfo, firstName: e.target.value }); setFormErrors({ ...formErrors, firstName: "" }); }} className={formErrors.firstName ? errorInputCls : inputCls} placeholder="First name" />
                      {formErrors.firstName && <p className="mt-1 text-xs text-cpm-error">{formErrors.firstName}</p>}
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-cpm-text-primary">Last Name <span className="text-cpm-accent">*</span></label>
                      <input type="text" value={guestInfo.lastName} onChange={(e) => { setGuestInfo({ ...guestInfo, lastName: e.target.value }); setFormErrors({ ...formErrors, lastName: "" }); }} className={formErrors.lastName ? errorInputCls : inputCls} placeholder="Last name" />
                      {formErrors.lastName && <p className="mt-1 text-xs text-cpm-error">{formErrors.lastName}</p>}
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-cpm-text-primary">Email <span className="text-cpm-accent">*</span></label>
                      <input type="email" value={guestInfo.email} onChange={(e) => { setGuestInfo({ ...guestInfo, email: e.target.value }); setFormErrors({ ...formErrors, email: "" }); }} className={formErrors.email ? errorInputCls : inputCls} placeholder="you@email.com" />
                      {formErrors.email && <p className="mt-1 text-xs text-cpm-error">{formErrors.email}</p>}
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-cpm-text-primary">Phone</label>
                      <input type="tel" value={guestInfo.phone} onChange={(e) => setGuestInfo({ ...guestInfo, phone: e.target.value })} className={inputCls} placeholder="+356 XXXXXXXX" />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-cpm-text-primary">Special Requests</label>
                    <textarea rows={3} value={guestInfo.notes} onChange={(e) => setGuestInfo({ ...guestInfo, notes: e.target.value })} className={`${inputCls} resize-none`} placeholder="Any special requests..." />
                  </div>
                  {formErrors.submit && <p className="text-sm text-cpm-error">{formErrors.submit}</p>}
                  <div className="flex gap-3">
                    <button onClick={() => { setStep(1); setFormErrors({}); }} className="flex-1 rounded-xl border border-cpm-border px-6 py-3.5 text-sm font-medium text-cpm-text-secondary transition-all duration-300 hover:border-cpm-accent/30 hover:text-cpm-text-primary">Back</button>
                    <button onClick={() => { if (validateStep2()) setStep(3); }} className="flex-[2] rounded-xl px-8 py-3.5 text-sm font-semibold text-cpm-bg-primary transition-all duration-300 hover:shadow-[0_0_30px_rgba(200,169,106,0.25)] active:scale-[0.98]" style={{ background: "linear-gradient(135deg, var(--cpm-accent), var(--cpm-accent-hover))" }}>Review Booking</button>
                  </div>
                </div>
              )}

              {/* Step 3: Review & Confirm */}
              {step === 3 && !bookingResult && (
                <div className="space-y-5" style={{ animation: "fadeInUp 0.3s ease-out" }}>
                  <div className="rounded-xl bg-cpm-bg-primary p-4 space-y-3">
                    <div className="flex items-center gap-4">
                      <img src={property?.images?.[0]?.url || "/placeholder.jpg"} alt={property?.title || "Property"} className="h-20 w-20 rounded-lg object-cover" />
                      <div><p className="font-medium text-cpm-text-primary">{property?.title}</p><p className="text-xs text-cpm-text-secondary">{dates.checkIn} → {dates.checkOut} · {dates.guests} guest{parseInt(dates.guests) > 1 ? "s" : ""}</p></div>
                    </div>
                  </div>
                  <div className="rounded-xl bg-cpm-bg-primary p-4 space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-cpm-text-secondary">€{property?.rates.baseRate || 0} × {nights} night{nights > 1 ? "s" : ""}</span><span className="text-cpm-text-primary">€{basePrice.toFixed(2)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-cpm-text-secondary">Cleaning fee</span><span className="text-cpm-text-primary">€{cleaningFee.toFixed(2)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-cpm-text-secondary">Service fee (12%)</span><span className="text-cpm-text-primary">€{serviceFee.toFixed(2)}</span></div>
                    <div className="border-t border-cpm-border pt-2 flex justify-between"><span className="font-medium text-cpm-text-primary">Total</span><span className="text-lg font-semibold text-cpm-accent">€{totalPrice.toFixed(2)}</span></div>
                  </div>
                  {formErrors.submit && <p className="text-sm text-cpm-error">{formErrors.submit}</p>}
                  <div className="flex gap-3">
                    <button onClick={() => { setStep(2); setFormErrors({}); }} className="flex-1 rounded-xl border border-cpm-border px-6 py-3.5 text-sm font-medium text-cpm-text-secondary transition-all duration-300 hover:border-cpm-accent/30 hover:text-cpm-text-primary">Back</button>
                    <button onClick={submitBooking} disabled={submitting} className="flex-[2] rounded-xl px-8 py-3.5 text-sm font-semibold text-cpm-bg-primary transition-all duration-300 hover:shadow-[0_0_30px_rgba(200,169,106,0.25)] active:scale-[0.98] disabled:opacity-50" style={{ background: "linear-gradient(135deg, var(--cpm-accent), var(--cpm-accent-hover))" }}>
                      {submitting ? "Confirming..." : `Confirm Booking — €${totalPrice.toFixed(2)}`}
                    </button>
                  </div>
                </div>
              )}

              {/* Confirmation */}
              {step === 3 && bookingResult && (
                <div className="py-8 text-center" style={{ animation: "scaleIn 0.4s ease-out" }}>
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cpm-success/10">
                    <svg className="h-8 w-8 text-cpm-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                  </div>
                  <h3 className="text-xl font-medium text-cpm-text-primary">Booking Confirmed!</h3>
                  <p className="mt-1 text-sm text-cpm-text-tertiary">Reference: <span className="font-mono text-cpm-accent">{bookingResult.id || bookingResult.externalId}</span></p>
                </div>
              )}
            </div>
          </div>
        </section>
      </>
    );
  },
  ai: { instructions: "Direct booking interface with date selection, guest count, pricing breakdown. Clean, trustworthy design." },
};