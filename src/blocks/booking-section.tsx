// =============================================================================
// CANONICAL PUCK BOOKING SECTION BLOCK — Guesty Booking Engine API
// Flow: listings → availability calendar → quote → Stripe SCA → instant reservation
// BASE: https://booking.guesty.com  (NOT open-api.guesty.com — not webhooks)
// Docs: https://booking-api-docs.guesty.com
// =============================================================================

"use client";

import React from "react";
import { toast } from "sonner";

// ─── Puck Block Definition ────────────────────────────────────────────────────

export const BookingSection = {
  label: "Booking Section",
  fields: {
    title: { type: "text" as const },
    subtitle: { type: "textarea" as const },
    showPricingBreakdown: { type: "radio" as const, options: [{ label: "Yes", value: "true" }, { label: "No", value: "false" }] },
    instantBookOnly: { type: "radio" as const, options: [{ label: "Instant Book Only", value: "true" }, { label: "Allow Inquiry too", value: "false" }] },
  },
  defaultProps: {
    title: "Book Your Stay",
    subtitle: "Check availability and book instantly — secure payment powered by Stripe.",
    showPricingBreakdown: "true",
    instantBookOnly: "true",
  },
  render: (props: Record<string, unknown>) => {
    const { title, subtitle, showPricingBreakdown, instantBookOnly } = props as {
      title: string;
      subtitle: string;
      showPricingBreakdown: string;
      instantBookOnly: string;
    };
    return (
      <BookingComponent
        title={title}
        subtitle={subtitle}
        showPricingBreakdown={showPricingBreakdown !== "false"}
        instantBookOnly={instantBookOnly !== "false"}
      />
    );
  },
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BookingSectionProps {
  title: string;
  subtitle: string;
  showPricingBreakdown?: boolean;
  instantBookOnly?: boolean;
}

interface GuestyListing {
  _id: string;
  title?: string;
  nickname?: string;
  bedrooms?: number;
  occupancy?: number;
  prices?: { basePrice?: number; currency?: string };
  pictures?: { thumbnail?: string; regular?: string }[];
  address?: { city?: string; neighborhood?: string };
}

interface QuoteRatePlan {
  ratePlan: { _id: string; name: string; cancellationPolicy?: string[] };
  money?: {
    farePaid?: number;
    invoiceItems?: { type: string; title?: string; amount: number; currency?: string }[];
    totalTaxes?: number;
    totalFees?: number;
    subTotal?: number;
  };
}

interface GuestyQuote {
  _id: string;
  expiresAt: string;
  rates: { ratePlans: QuoteRatePlan[] };
  coupons?: { code: string; adjustment: number }[];
}

interface InstantReservation {
  _id: string;
  status: string;
  confirmationCode: string;
  createdAt: string;
}

// ─── Step Definitions ─────────────────────────────────────────────────────────
// Step 1: Select property + dates + guests
// Step 2: Pricing quote (farePaid from GBE) + guest details
// Step 3: Payment (Stripe SCA pm_ token) + confirmation

const STEP_LABELS = ["Dates & Property", "Your Details & Pricing", "Payment & Confirm"];

// ─── Component ────────────────────────────────────────────────────────────────

const BookingComponent: React.FC<BookingSectionProps> = React.memo(
  ({ title, subtitle, showPricingBreakdown = true, instantBookOnly = true }) => {
    const [step, setStep] = React.useState(1);
    const [submitting, setSubmitting] = React.useState(false);
    const [confirmed, setConfirmed] = React.useState<InstantReservation | null>(null);

    // Step 1 state
    const [listings, setListings] = React.useState<GuestyListing[]>([]);
    const [listingsLoading, setListingsLoading] = React.useState(true);
    const [selectedListingId, setSelectedListingId] = React.useState("");
    const [checkIn, setCheckIn] = React.useState("");
    const [checkOut, setCheckOut] = React.useState("");
    const [guestsCount, setGuestsCount] = React.useState(2);
    const [couponCode, setCouponCode] = React.useState("");
    const [unavailableDates, setUnavailableDates] = React.useState<Set<string>>(new Set());
    const [calendarLoading, setCalendarLoading] = React.useState(false);

    // Step 2 state — quote
    const [quote, setQuote] = React.useState<GuestyQuote | null>(null);
    const [quoteLoading, setQuoteLoading] = React.useState(false);
    const [selectedRatePlanId, setSelectedRatePlanId] = React.useState("");

    // Step 2 state — guest info
    const [firstName, setFirstName] = React.useState("");
    const [lastName, setLastName] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [phone, setPhone] = React.useState("");

    // Step 3 state — payment (Stripe pm_ token)
    const [ccToken, setCcToken] = React.useState("");

    // ── Derived ──────────────────────────────────────────────────────────────

    const nights = React.useMemo(() => {
      if (!checkIn || !checkOut) return 0;
      return Math.max(
        0,
        Math.round(
          (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86_400_000
        )
      );
    }, [checkIn, checkOut]);

    const selectedListing = React.useMemo(
      () => listings.find((l) => l._id === selectedListingId) ?? null,
      [listings, selectedListingId]
    );

    const bestRatePlan: QuoteRatePlan | undefined = React.useMemo(() => {
      if (!quote) return undefined;
      return quote.rates.ratePlans.find((rp) => rp.ratePlan._id === selectedRatePlanId)
        ?? quote.rates.ratePlans[0];
    }, [quote, selectedRatePlanId]);

    const farePaid = bestRatePlan?.money?.farePaid;

    // ── Load listings on mount ────────────────────────────────────────────────

    React.useEffect(() => {
      let cancelled = false;
      setListingsLoading(true);
      fetch("/api/guesty/listings?limit=50&fields=_id,title,nickname,bedrooms,occupancy,prices,pictures,address")
        .then((r) => r.ok ? r.json() : Promise.reject(r))
        .then((data: { results?: GuestyListing[] }) => {
          if (!cancelled) setListings(data.results ?? []);
        })
        .catch(() => {
          if (!cancelled) toast.error("Could not load properties. Please refresh.");
        })
        .finally(() => {
          if (!cancelled) setListingsLoading(false);
        });
      return () => { cancelled = true; };
    }, []);

    // ── Load calendar when listing + date range chosen ────────────────────────

    React.useEffect(() => {
      if (!selectedListingId || !checkIn || !checkOut) {
        setUnavailableDates(new Set());
        return;
      }
      let cancelled = false;
      setCalendarLoading(true);
      const fromD = checkIn;
      const toD = checkOut;
      fetch(`/api/guesty/calendar?listingId=${encodeURIComponent(selectedListingId)}&from=${fromD}&to=${toD}`)
        .then((r) => r.ok ? r.json() : Promise.reject(r))
        .then((days: { date: string; status: string }[]) => {
          if (!cancelled) {
            const blocked = new Set(
              days
                .filter((d) => d.status !== "available")
                .map((d) => d.date)
            );
            setUnavailableDates(blocked);
          }
        })
        .catch(() => {
          // non-blocking — just clear
          if (!cancelled) setUnavailableDates(new Set());
        })
        .finally(() => {
          if (!cancelled) setCalendarLoading(false);
        });
      return () => { cancelled = true; };
    }, [selectedListingId, checkIn, checkOut]);

    // ── Step validation ───────────────────────────────────────────────────────

    const step1Valid = Boolean(selectedListingId && checkIn && checkOut && nights > 0);
    const checkInBlocked = unavailableDates.has(checkIn);
    const hasBlockedNights = React.useMemo(() => {
      if (!checkIn || !checkOut) return false;
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
        const key = d.toISOString().slice(0, 10);
        if (unavailableDates.has(key)) return true;
      }
      return false;
    }, [checkIn, checkOut, unavailableDates]);

    const step2Valid = Boolean(
      quote &&
      selectedRatePlanId &&
      firstName.trim() &&
      lastName.trim() &&
      email.trim() &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    );

    const step3Valid = Boolean(ccToken.trim().startsWith("pm_"));

    // ── Fetch quote (step 1 → 2) ──────────────────────────────────────────────

    const fetchQuote = React.useCallback(async () => {
      if (!step1Valid) return;
      if (checkInBlocked || hasBlockedNights) {
        toast.error("Selected dates include unavailable nights. Please choose different dates.");
        return;
      }
      setQuoteLoading(true);
      try {
        const res = await fetch("/api/guesty/quotes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            listingId: selectedListingId,
            checkInDateLocalized: checkIn,
            checkOutDateLocalized: checkOut,
            guestsCount,
            ...(couponCode.trim() ? { coupons: couponCode.trim() } : {}),
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error?.formErrors?.[0] ?? data.error ?? "Could not get pricing. Check dates.");
          return;
        }
        const q = data as GuestyQuote;
        setQuote(q);
        if (q.rates.ratePlans[0]) {
          setSelectedRatePlanId(q.rates.ratePlans[0].ratePlan._id);
        }
        setStep(2);
      } catch {
        toast.error("Network error fetching quote. Please retry.");
      } finally {
        setQuoteLoading(false);
      }
    }, [step1Valid, selectedListingId, checkIn, checkOut, guestsCount, couponCode, checkInBlocked, hasBlockedNights]);

    // ── Create instant reservation (step 3 submit) ────────────────────────────

    const handleConfirm = async () => {
      if (!quote || !step3Valid) return;
      setSubmitting(true);
      try {
        const endpoint = instantBookOnly
          ? `/api/guesty/reservations/instant`
          : `/api/guesty/reservations/inquiry`;

        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quoteId: quote._id,
            ratePlanId: selectedRatePlanId,
            ccToken,
            guest: {
              firstName: firstName.trim(),
              lastName: lastName.trim(),
              email: email.trim(),
              ...(phone.trim() ? { phone: phone.trim() } : {}),
            },
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error ?? "Booking failed. Please check payment details.");
          return;
        }
        setConfirmed(data as InstantReservation);
        toast.success("Booking confirmed! Check your email for details.");
      } catch {
        toast.error("Network error. Please retry.");
      } finally {
        setSubmitting(false);
      }
    };

    // ── Shared CSS ────────────────────────────────────────────────────────────

    const inputCls =
      "w-full rounded-xl border border-cpm-border bg-cpm-bg-secondary px-4 py-3 text-sm text-cpm-text-primary outline-none transition-all duration-300 focus:border-cpm-accent/50 focus:shadow-[0_0_0_3px_rgba(200,169,106,0.1)] disabled:opacity-50";
    const labelCls = "mb-1.5 block text-sm font-medium text-cpm-text-primary";
    const req = <span className="text-cpm-accent">*</span>;

    // ── Confirmed screen ──────────────────────────────────────────────────────

    if (confirmed) {
      return (
        <section className="bg-cpm-bg-secondary px-4 py-20 sm:px-8 lg:py-32">
          <div className="mx-auto max-w-lg text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 border-cpm-success/30 bg-cpm-success/10">
              <svg className="h-10 w-10 text-cpm-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h2 className="mb-3 font-[family-name:var(--font-heading)] text-2xl font-light text-cpm-text-primary">
              {instantBookOnly ? "Booking Confirmed!" : "Request Submitted!"}
            </h2>
            <p className="mb-2 text-sm text-cpm-text-secondary">
              Confirmation code:{" "}
              <span className="font-mono font-bold text-cpm-accent">{confirmed.confirmationCode}</span>
            </p>
            <p className="mb-8 text-sm text-cpm-text-secondary">
              A confirmation email has been sent to{" "}
              <span className="font-medium text-cpm-text-primary">{email}</span>.
            </p>
            <button
              onClick={() => {
                setConfirmed(null);
                setStep(1);
                setQuote(null);
                setCheckIn("");
                setCheckOut("");
                setSelectedListingId("");
                setFirstName("");
                setLastName("");
                setEmail("");
                setPhone("");
                setCcToken("");
                setCouponCode("");
              }}
              className="rounded-xl border border-cpm-accent/30 bg-cpm-accent/5 px-6 py-3 text-sm font-medium text-cpm-accent transition-all hover:bg-cpm-accent hover:text-cpm-bg-primary"
            >
              Make Another Booking
            </button>
          </div>
        </section>
      );
    }

    // ── Step indicator ────────────────────────────────────────────────────────

    const StepDot = ({ n }: { n: number }) => (
      <div className={`flex items-center gap-2 ${step >= n ? "text-cpm-accent" : "text-cpm-text-tertiary"}`}>
        <div
          className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300 ${
            step > n
              ? "bg-cpm-accent text-cpm-bg-primary"
              : step === n
              ? "border-2 border-cpm-accent text-cpm-accent"
              : "border-2 border-cpm-border-hover text-cpm-text-tertiary"
          }`}
        >
          {step > n ? (
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          ) : (
            n
          )}
        </div>
        <span className="hidden text-xs font-medium sm:inline">{STEP_LABELS[n - 1]}</span>
      </div>
    );

    const Divider = ({ active }: { active: boolean }) => (
      <div className={`h-[1px] w-8 sm:w-12 transition-all duration-300 ${active ? "bg-cpm-accent" : "bg-cpm-border-hover"}`} />
    );

    // ── Price Breakdown ───────────────────────────────────────────────────────

    const PriceBreakdown = ({ rp }: { rp: QuoteRatePlan }) => {
      const items = rp.money?.invoiceItems ?? [];
      const currency = items[0]?.currency ?? selectedListing?.prices?.currency ?? "EUR";
      const fmt = (n: number) =>
        new Intl.NumberFormat("en-MT", { style: "currency", currency }).format(n);

      return (
        <div className="mt-4 rounded-xl bg-cpm-bg-primary p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-cpm-accent">Price Breakdown</p>
          <div className="space-y-1">
            {items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-cpm-text-secondary">{item.title ?? item.type.replace(/_/g, " ")}</span>
                <span className="text-cpm-text-primary">{fmt(item.amount)}</span>
              </div>
            ))}
            {typeof rp.money?.farePaid === "number" && (
              <div className="flex justify-between border-t border-cpm-border pt-2 text-sm font-semibold">
                <span className="text-cpm-text-primary">Total</span>
                <span className="text-cpm-accent">{fmt(rp.money.farePaid)}</span>
              </div>
            )}
          </div>
          {rp.ratePlan.cancellationPolicy && rp.ratePlan.cancellationPolicy.length > 0 && (
            <p className="mt-2 text-xs text-cpm-text-tertiary">
              Cancellation: {rp.ratePlan.cancellationPolicy.join(", ")}
            </p>
          )}
          <p className="mt-2 text-xs text-cpm-text-tertiary">
            Quote expires:{" "}
            <span className="text-cpm-text-secondary">
              {quote ? new Date(quote.expiresAt).toLocaleString() : ""}
            </span>
          </p>
        </div>
      );
    };

    // ── Main render ───────────────────────────────────────────────────────────

    return (
      <section className="bg-cpm-bg-secondary px-4 py-20 sm:px-8 lg:py-32">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-12 text-center">
            <h2 className="font-[family-name:var(--font-heading)] text-3xl font-light tracking-tight text-cpm-text-primary sm:text-4xl">
              {title}
            </h2>
            <div className="mx-auto mt-4 h-[2px] w-16 bg-gradient-to-r from-transparent via-cpm-accent to-transparent" />
            <p className="mx-auto mt-4 max-w-2xl text-base text-cpm-text-secondary">{subtitle}</p>
          </div>

          {/* Card */}
          <div
            className="relative rounded-2xl p-[1px]"
            style={{ background: "linear-gradient(135deg, rgba(200,169,106,0.3), rgba(200,169,106,0.05), rgba(200,169,106,0.3))" }}
          >
            <div className="rounded-2xl bg-cpm-bg-secondary p-6 sm:p-8">

              {/* Step indicator */}
              <div className="mb-8 flex items-center justify-center gap-3">
                <StepDot n={1} />
                <Divider active={step > 1} />
                <StepDot n={2} />
                <Divider active={step > 2} />
                <StepDot n={3} />
              </div>

              {/* ─── STEP 1: Property, dates, guests ─── */}
              {step === 1 && (
                <div className="space-y-5">
                  {/* Property select */}
                  <div>
                    <label className={labelCls}>Property {req}</label>
                    {listingsLoading ? (
                      <div className="flex items-center gap-2 rounded-xl border border-cpm-border bg-cpm-bg-secondary px-4 py-3 text-sm text-cpm-text-tertiary">
                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Loading properties…
                      </div>
                    ) : (
                      <select
                        value={selectedListingId}
                        onChange={(e) => { setSelectedListingId(e.target.value); setCheckIn(""); setCheckOut(""); }}
                        className={inputCls}
                      >
                        <option value="">Select a property…</option>
                        {listings.map((l) => (
                          <option key={l._id} value={l._id}>
                            {l.nickname ?? l.title ?? l._id}
                            {l.bedrooms ? ` · ${l.bedrooms} bed` : ""}
                            {l.occupancy ? ` · up to ${l.occupancy} guests` : ""}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Dates + guests */}
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                    <div>
                      <label className={labelCls}>Check-in {req}</label>
                      <input
                        type="date"
                        value={checkIn}
                        min={new Date().toISOString().slice(0, 10)}
                        onChange={(e) => setCheckIn(e.target.value)}
                        disabled={!selectedListingId}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Check-out {req}</label>
                      <input
                        type="date"
                        value={checkOut}
                        min={checkIn || new Date().toISOString().slice(0, 10)}
                        onChange={(e) => setCheckOut(e.target.value)}
                        disabled={!selectedListingId || !checkIn}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Guests</label>
                      <select
                        value={guestsCount}
                        onChange={(e) => setGuestsCount(Number(e.target.value))}
                        className={inputCls}
                      >
                        {Array.from({ length: selectedListing?.occupancy ?? 10 }, (_, i) => i + 1).map((n) => (
                          <option key={n} value={n}>{n} {n === 1 ? "Guest" : "Guests"}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Coupon */}
                  <div>
                    <label className={labelCls}>Coupon Code (optional)</label>
                    <input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="SUMMER2025"
                      className={inputCls}
                    />
                  </div>

                  {/* Availability warning */}
                  {calendarLoading && (
                    <p className="text-xs text-cpm-text-tertiary">Checking availability…</p>
                  )}
                  {!calendarLoading && hasBlockedNights && (
                    <p className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
                      ⚠ Some nights in your selected range are unavailable. Please adjust your dates.
                    </p>
                  )}

                  {nights > 0 && !hasBlockedNights && (
                    <p className="text-sm text-cpm-text-secondary">
                      <span className="font-medium text-cpm-accent">{nights}</span> night{nights !== 1 ? "s" : ""} selected
                    </p>
                  )}

                  <button
                    onClick={fetchQuote}
                    disabled={!step1Valid || quoteLoading || hasBlockedNights || calendarLoading}
                    className="w-full rounded-xl px-8 py-3.5 text-sm font-semibold text-cpm-bg-primary transition-all duration-300 hover:shadow-[0_0_30px_rgba(200,169,106,0.25)] active:scale-[0.98] disabled:opacity-50"
                    style={{ background: "linear-gradient(135deg, var(--cpm-accent), var(--cpm-accent-hover))" }}
                  >
                    {quoteLoading ? (
                      <span className="inline-flex items-center gap-2">
                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Getting Pricing…
                      </span>
                    ) : (
                      "Continue — Get Pricing"
                    )}
                  </button>
                </div>
              )}

              {/* ─── STEP 2: Pricing + guest details ─── */}
              {step === 2 && quote && (
                <div className="space-y-5">
                  {/* Rate plan selector (if multiple) */}
                  {quote.rates.ratePlans.length > 1 && (
                    <div>
                      <label className={labelCls}>Rate Plan {req}</label>
                      <select
                        value={selectedRatePlanId}
                        onChange={(e) => setSelectedRatePlanId(e.target.value)}
                        className={inputCls}
                      >
                        {quote.rates.ratePlans.map((rp) => (
                          <option key={rp.ratePlan._id} value={rp.ratePlan._id}>
                            {rp.ratePlan.name}
                            {typeof rp.money?.farePaid === "number"
                              ? ` — ${new Intl.NumberFormat("en-MT", { style: "currency", currency: rp.money.invoiceItems?.[0]?.currency ?? "EUR" }).format(rp.money.farePaid)}`
                              : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Price breakdown */}
                  {showPricingBreakdown && bestRatePlan && <PriceBreakdown rp={bestRatePlan} />}

                  {/* No breakdown — just total */}
                  {!showPricingBreakdown && typeof farePaid === "number" && (
                    <div className="rounded-xl bg-cpm-bg-primary px-4 py-3 text-sm">
                      <span className="text-cpm-text-secondary">Total: </span>
                      <span className="font-semibold text-cpm-accent">
                        {new Intl.NumberFormat("en-MT", { style: "currency", currency: "EUR" }).format(farePaid)}
                      </span>
                    </div>
                  )}

                  {/* Guest details */}
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label className={labelCls}>First Name {req}</label>
                      <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputCls} placeholder="Jane" />
                    </div>
                    <div>
                      <label className={labelCls}>Last Name {req}</label>
                      <input value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputCls} placeholder="Doe" />
                    </div>
                    <div>
                      <label className={labelCls}>Email {req}</label>
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="jane@example.com" />
                    </div>
                    <div>
                      <label className={labelCls}>Phone</label>
                      <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} placeholder="+356 XXXXXXXX" />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setStep(1)}
                      className="flex-1 rounded-xl border border-cpm-border px-6 py-3.5 text-sm font-medium text-cpm-text-secondary transition-all hover:border-cpm-accent/30 hover:text-cpm-text-primary"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setStep(3)}
                      disabled={!step2Valid}
                      className="flex-[2] rounded-xl px-8 py-3.5 text-sm font-semibold text-cpm-bg-primary transition-all duration-300 hover:shadow-[0_0_30px_rgba(200,169,106,0.25)] active:scale-[0.98] disabled:opacity-50"
                      style={{ background: "linear-gradient(135deg, var(--cpm-accent), var(--cpm-accent-hover))" }}
                    >
                      Continue to Payment
                    </button>
                  </div>
                </div>
              )}

              {/* ─── STEP 3: Payment (Stripe pm_ token) ─── */}
              {step === 3 && quote && (
                <div className="space-y-5">
                  {/* Booking summary */}
                  <div className="rounded-xl bg-cpm-bg-primary p-5">
                    <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-cpm-accent">Booking Summary</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><span className="text-cpm-text-tertiary">Guest: </span><span className="text-cpm-text-primary">{firstName} {lastName}</span></div>
                      <div><span className="text-cpm-text-tertiary">Email: </span><span className="text-cpm-text-primary">{email}</span></div>
                      <div><span className="text-cpm-text-tertiary">Property: </span><span className="text-cpm-text-primary">{selectedListing?.nickname ?? selectedListing?.title ?? selectedListingId}</span></div>
                      <div><span className="text-cpm-text-tertiary">Guests: </span><span className="text-cpm-text-primary">{guestsCount}</span></div>
                      <div><span className="text-cpm-text-tertiary">Check-in: </span><span className="text-cpm-text-primary">{checkIn}</span></div>
                      <div><span className="text-cpm-text-tertiary">Check-out: </span><span className="text-cpm-text-primary">{checkOut}</span></div>
                      {nights > 0 && <div><span className="text-cpm-text-tertiary">Nights: </span><span className="text-cpm-accent font-medium">{nights}</span></div>}
                      {typeof farePaid === "number" && (
                        <div><span className="text-cpm-text-tertiary">Total: </span>
                          <span className="font-bold text-cpm-accent">
                            {new Intl.NumberFormat("en-MT", { style: "currency", currency: bestRatePlan?.money?.invoiceItems?.[0]?.currency ?? "EUR" }).format(farePaid)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stripe SCA payment method token */}
                  <div>
                    <label className={labelCls}>
                      Stripe Payment Method Token {req}
                      <span className="ml-2 text-xs font-normal text-cpm-text-tertiary">(starts with pm_…)</span>
                    </label>
                    <input
                      value={ccToken}
                      onChange={(e) => setCcToken(e.target.value.trim())}
                      className={inputCls}
                      placeholder="pm_1OxxxxxxxxxxxxxxxxxxxxSTRIPE"
                      autoComplete="off"
                      spellCheck={false}
                    />
                    <p className="mt-1.5 text-xs text-cpm-text-tertiary">
                      Obtain this token via <code className="rounded bg-cpm-bg-primary px-1">stripe.createPaymentMethod()</code> using the
                      publishable key from <code className="rounded bg-cpm-bg-primary px-1">/api/guesty/listings/[id]/payment-provider</code>.
                      Only <code className="rounded bg-cpm-bg-primary px-1">pm_…</code> tokens are accepted — not legacy <code className="rounded bg-cpm-bg-primary px-1">tok_…</code>.
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setStep(2)}
                      className="flex-1 rounded-xl border border-cpm-border px-6 py-3.5 text-sm font-medium text-cpm-text-secondary transition-all hover:border-cpm-accent/30 hover:text-cpm-text-primary"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleConfirm}
                      disabled={!step3Valid || submitting}
                      className="flex-[2] rounded-xl px-8 py-3.5 text-sm font-semibold text-cpm-bg-primary transition-all duration-300 hover:shadow-[0_0_30px_rgba(200,169,106,0.25)] active:scale-[0.98] disabled:opacity-50"
                      style={{ background: "linear-gradient(135deg, var(--cpm-accent), var(--cpm-accent-hover))" }}
                    >
                      {submitting ? (
                        <span className="inline-flex items-center gap-2">
                          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          {instantBookOnly ? "Confirming Booking…" : "Sending Request…"}
                        </span>
                      ) : (
                        instantBookOnly ? "Confirm & Book Instantly" : "Submit Booking Request"
                      )}
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </section>
    );
  }
);

BookingComponent.displayName = "BookingComponent";
