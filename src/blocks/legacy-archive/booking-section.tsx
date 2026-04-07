"use client";

import React from "react";
import {toast} from "sonner";

export const BookingSection = {
  label: "Booking Section",
  fields: {
    title: { type: "text" as const },
    subtitle: { type: "textarea" as const },
  },
  defaultProps: {
    title: "Book Your Stay",
    subtitle: "Fill in your details and we'll get back to you within 24 hours.",
  },
  render: (props: Record<string, unknown>) => {
    const { title, subtitle } = props as { title: string; subtitle: string };
    return <BookingComponent title={title} subtitle={subtitle} />;
  },
};

export interface BookingSectionProps {
  title: string;
  subtitle: string;
}

const BookingComponent: React.FC<BookingSectionProps> = React.memo(({ title, subtitle }) => {
  const [step, setStep] = React.useState(1);
  const [submitting, setSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [dates, setDates] = React.useState({ checkIn: "", checkOut: "", guests: "2" });
  const [personal, setPersonal] = React.useState({ name: "", email: "", phone: "", propertyId: "" });
  const [message, setMessage] = React.useState("");

  const nights = dates.checkIn && dates.checkOut ? Math.max(1, Math.round((new Date(dates.checkOut).getTime() - new Date(dates.checkIn).getTime()) / 86400000)) : 0;

  const handleSubmit = async () => {
    if (step < 3) { setStep(step + 1); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName: personal.name,
          guestEmail: personal.email,
          guestPhone: personal.phone,
          checkIn: dates.checkIn,
          checkOut: dates.checkOut,
          guests: parseInt(dates.guests),
          propertyId: personal.propertyId || undefined,
          specialRequests: message || undefined,
        }),
      });
      if (res.ok) {
        toast.success("Booking request submitted! We'll be in touch soon.");
        setSubmitted(true);
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Something went wrong.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally { setSubmitting(false); }
  };

  if (submitted) {
    return (
      <section className="bg-cpm-bg-secondary px-4 py-20 sm:px-8 lg:py-32">
        <div className="mx-auto max-w-lg text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 border-cpm-success/30 bg-cpm-success/10">
            <svg className="h-10 w-10 text-cpm-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
          </div>
          <h2 className="mb-3 font-[family-name:var(--font-heading)] text-2xl font-light text-cpm-text-primary">Request Submitted!</h2>
          <p className="mb-8 text-sm text-cpm-text-secondary">We will review your booking request and get back to you within 24 hours.</p>
          <button onClick={() => { setSubmitted(false); setStep(1); setDates({ checkIn: "", checkOut: "", guests: "2" }); setPersonal({ name: "", email: "", phone: "", propertyId: "" }); setMessage(""); }} className="rounded-xl border border-cpm-accent/30 bg-cpm-accent/5 px-6 py-3 text-sm font-medium text-cpm-accent transition-all hover:bg-cpm-accent hover:text-cpm-bg-primary">Submit Another Request</button>
        </div>
      </section>
    );
  }

  const inputCls = "w-full rounded-xl border border-cpm-border bg-cpm-bg-secondary px-4 py-3 text-sm text-cpm-text-primary outline-none transition-all duration-300 focus:border-cpm-accent/50 focus:shadow-[0_0_0_3px_rgba(200,169,106,0.1)]";
  const labelCls = "mb-1.5 block text-sm font-medium text-cpm-text-primary";
  const reqSpan = <span className="text-cpm-accent">*</span>;

  const stepLabel = (n: number, label: string) => (
    <div className={`flex items-center gap-2 ${step >= n ? "text-cpm-accent" : "text-cpm-text-tertiary"}`}>
      <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300 ${step > n ? "bg-cpm-accent text-cpm-bg-primary" : step === n ? "border-2 border-cpm-accent text-cpm-accent" : "border-2 border-cpm-border-hover text-cpm-text-tertiary"}`}>
        {step > n ? <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg> : n}
      </div>
      <span className="hidden text-xs font-medium sm:inline">{label}</span>
    </div>
  );

  return (
    <section className="bg-cpm-bg-secondary px-4 py-20 sm:px-8 lg:py-32">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <h2 className="font-[family-name:var(--font-heading)] text-3xl font-light tracking-tight text-cpm-text-primary sm:text-4xl">{title}</h2>
          <div className="mx-auto mt-4 h-[2px] w-16 bg-gradient-to-r from-transparent via-cpm-accent to-transparent" />
          <p className="mx-auto mt-4 max-w-2xl text-base text-cpm-text-secondary">{subtitle}</p>
        </div>
        <div className="relative rounded-2xl p-[1px]" style={{ background: "linear-gradient(135deg, rgba(200,169,106,0.3), rgba(200,169,106,0.05), rgba(200,169,106,0.3))" }}>
          <div className="rounded-2xl bg-cpm-bg-secondary p-6 sm:p-8">
            <div className="mb-8 flex items-center justify-center gap-3">
              {stepLabel(1, "Dates")}
              <div className={`h-[1px] w-8 sm:w-12 transition-all duration-300 ${step > 1 ? "bg-cpm-accent" : "bg-cpm-border-hover"}`} />
              {stepLabel(2, "Details")}
              <div className={`h-[1px] w-8 sm:w-12 transition-all duration-300 ${step > 2 ? "bg-cpm-accent" : "bg-cpm-border-hover"}`} />
              {stepLabel(3, "Review")}
            </div>
            <div className="space-y-5">
              {step === 1 && (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                  <div><label className={labelCls}>Check-in {reqSpan}</label><input type="date" value={dates.checkIn} onChange={(e) => setDates({ ...dates, checkIn: e.target.value })} className={inputCls} /></div>
                  <div><label className={labelCls}>Check-out {reqSpan}</label><input type="date" value={dates.checkOut} onChange={(e) => setDates({ ...dates, checkOut: e.target.value })} className={inputCls} /></div>
                  <div><label className={labelCls}>Guests</label><select value={dates.guests} onChange={(e) => setDates({ ...dates, guests: e.target.value })} className={inputCls}>{[1,2,3,4,5,6,7,8,9,10].map((n) => (<option key={n} value={n}>{n} {n === 1 ? "Guest" : "Guests"}</option>))}</select></div>
                </div>
              )}
              {step === 2 && (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div><label className={labelCls}>Full Name {reqSpan}</label><input value={personal.name} onChange={(e) => setPersonal({ ...personal, name: e.target.value })} className={inputCls} placeholder="Your full name" /></div>
                  <div><label className={labelCls}>Email {reqSpan}</label><input type="email" value={personal.email} onChange={(e) => setPersonal({ ...personal, email: e.target.value })} className={inputCls} placeholder="you@email.com" /></div>
                  <div><label className={labelCls}>Phone</label><input value={personal.phone} onChange={(e) => setPersonal({ ...personal, phone: e.target.value })} className={inputCls} placeholder="+356 XXXXXXXX" /></div>
                  <div><label className={labelCls}>Property</label><select value={personal.propertyId} onChange={(e) => setPersonal({ ...personal, propertyId: e.target.value })} className={inputCls}><option value="">Any property</option><option value="valletta-1">Valletta Apartment 1</option><option value="valletta-2">Valletta Apartment 2</option><option value="bahar-ic-caghaq">Bahar ic-Caghaq Villa</option><option value="madliena">Madliena Event Space</option><option value="pieta">Pieta Apartment</option><option value="gzira">Gzira Apartment</option></select></div>
                  <div className="sm:col-span-2"><label className={labelCls}>Special Requests</label><textarea rows={3} value={message} onChange={(e) => setMessage(e.target.value)} className={`${inputCls} resize-none`} placeholder="Any special requests..." /></div>
                </div>
              )}
              {step === 3 && (
                <div className="space-y-4 rounded-xl bg-cpm-bg-primary p-5">
                  <h3 className="text-sm font-semibold text-cpm-accent uppercase tracking-wider">Review Your Request</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-cpm-text-tertiary">Name:</span> <span className="text-cpm-text-primary">{personal.name || "-"}</span></div>
                    <div><span className="text-cpm-text-tertiary">Email:</span> <span className="text-cpm-text-primary">{personal.email || "-"}</span></div>
                    <div><span className="text-cpm-text-tertiary">Check-in:</span> <span className="text-cpm-text-primary">{dates.checkIn || "-"}</span></div>
                    <div><span className="text-cpm-text-tertiary">Check-out:</span> <span className="text-cpm-text-primary">{dates.checkOut || "-"}</span></div>
                    <div><span className="text-cpm-text-tertiary">Guests:</span> <span className="text-cpm-text-primary">{dates.guests}</span></div>
                    {nights > 0 && <div><span className="text-cpm-text-tertiary">Duration:</span> <span className="text-cpm-accent font-medium">{nights} night{nights > 1 ? "s" : ""}</span></div>}
                  </div>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                {step > 1 && <button onClick={() => setStep(step - 1)} className="flex-1 rounded-xl border border-cpm-border px-6 py-3.5 text-sm font-medium text-cpm-text-secondary transition-all duration-300 hover:border-cpm-accent/30 hover:text-cpm-text-primary">Back</button>}
                <button onClick={handleSubmit} disabled={step === 3 && submitting} className="flex-[2] rounded-xl px-8 py-3.5 text-sm font-semibold text-cpm-bg-primary transition-all duration-300 hover:shadow-[0_0_30px_rgba(200,169,106,0.25)] active:scale-[0.98] disabled:opacity-50" style={{ background: "linear-gradient(135deg, var(--cpm-accent), var(--cpm-accent-hover))" }}>{submitting ? <span className="inline-flex items-center gap-2"><svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Submitting...</span> : step === 3 ? "Submit Booking Request" : "Continue"}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

BookingComponent.displayName = "BookingComponent";
