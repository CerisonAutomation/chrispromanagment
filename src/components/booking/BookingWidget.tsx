'use client';
/**
 * @fileoverview BookingWidget — inline date picker + guest selector + quote fetcher.
 * Used on property detail pages. Handles quote loading, error states.
 */
import { useState } from 'react';
import { cn, formatCurrency } from '@/lib/utils';
import type { BookingQuote } from '@/types';

interface BookingWidgetProps {
  listingId: string;
  basePrice: number;
  currency?: string;
  className?: string;
}

export function BookingWidget({ listingId, basePrice, currency = 'EUR', className }: BookingWidgetProps) {
  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(tomorrow);
  const [guests, setGuests] = useState(2);
  const [quote, setQuote] = useState<BookingQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nights = Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000));

  const fetchQuote = async () => {
    setLoading(true); setError(null); setQuote(null);
    try {
      const r = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, checkIn, checkOut, guests }),
      });
      const j = await r.json() as BookingQuote & { error?: string };
      if (j.error) throw new Error(j.error);
      setQuote(j);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full px-3 py-2.5 bg-surface-2 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-gold/50 transition-colors';
  const labelCls = 'block text-xs text-foreground/50 mb-1.5 font-medium uppercase tracking-wide';

  return (
    <div className={cn('bg-surface border border-border rounded-2xl p-6 shadow-lg', className)}>
      <div className="text-center mb-6">
        <span className="text-2xl font-bold text-gold">{formatCurrency(basePrice, currency)}</span>
        <span className="text-foreground/40 text-sm"> / night</span>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="checkin" className={labelCls}>Check-in</label>
            <input id="checkin" type="date" value={checkIn} min={today}
              onChange={e => setCheckIn(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label htmlFor="checkout" className={labelCls}>Check-out</label>
            <input id="checkout" type="date" value={checkOut} min={checkIn}
              onChange={e => setCheckOut(e.target.value)} className={inputCls} />
          </div>
        </div>

        <div>
          <label htmlFor="guests" className={labelCls}>Guests</label>
          <select id="guests" value={guests} onChange={e => setGuests(Number(e.target.value))} className={inputCls}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
              <option key={n} value={n}>{n} guest{n > 1 ? 's' : ''}</option>
            ))}
          </select>
        </div>

        <button
          onClick={fetchQuote}
          disabled={loading || !checkIn || !checkOut}
          className="w-full py-3 bg-gold text-[#0e0f11] font-bold text-sm rounded-xl hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Checking availability…' : 'Check Availability'}
        </button>
      </div>

      {/* Quote breakdown */}
      {quote && (
        <div className="mt-6 pt-5 border-t border-border space-y-2 animate-fade-in">
          <div className="flex justify-between text-sm text-foreground/70">
            <span>{formatCurrency(basePrice, currency)} × {nights} nights</span>
            <span>{formatCurrency(quote.basePrice, currency)}</span>
          </div>
          {quote.cleaningFee > 0 && (
            <div className="flex justify-between text-sm text-foreground/70">
              <span>Cleaning fee</span>
              <span>{formatCurrency(quote.cleaningFee, currency)}</span>
            </div>
          )}
          {quote.taxes > 0 && (
            <div className="flex justify-between text-sm text-foreground/70">
              <span>Taxes</span>
              <span>{formatCurrency(quote.taxes, currency)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-foreground pt-2 border-t border-border">
            <span>Total</span>
            <span className="text-gold">{formatCurrency(quote.total, currency)}</span>
          </div>
          <a
            href={`mailto:info@christopm.com?subject=Booking Enquiry&body=Property: ${listingId}%0ACheck-in: ${checkIn}%0ACheck-out: ${checkOut}%0AGuests: ${guests}`}
            className="mt-4 block w-full py-3 text-center bg-[#0e0f11] border border-gold/40 text-gold font-semibold text-sm rounded-xl hover:bg-surface-2 transition-colors"
          >
            Request to Book
          </a>
        </div>
      )}

      {error && (
        <p className="mt-4 text-xs text-red-400 text-center">{error}</p>
      )}
    </div>
  );
}
