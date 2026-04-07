/**
 * @fileoverview BookingWidget — date picker + guest count + quote display + CTA.
 * Fully typed, accessible, mobile-responsive.
 */
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useBookingQuote } from '@/hooks/useBookingQuote';
import { QuoteSummary } from './QuoteSummary';
import { formatCurrency } from '@/lib/utils';

interface BookingWidgetProps {
  listingId: string;
  className?: string;
}

/**
 * Inline booking widget — shown on property detail pages.
 * Fetches live quote from Guesty on date/guest change.
 */
export function BookingWidget({ listingId, className }: BookingWidgetProps) {
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86_400_000).toISOString().split('T')[0];

  const { data, isLoading, isError, error } = useBookingQuote({
    listingId,
    checkIn: checkIn || undefined,
    checkOut: checkOut || undefined,
    guestsCount: guests,
  });

  const isDateValid =
    checkIn && checkOut && new Date(checkOut) > new Date(checkIn);

  return (
    <div className={`rounded-2xl border border-border bg-card shadow-lg p-6 space-y-5 ${className ?? ''}`}>
      <h2 className="text-lg font-semibold">Book this property</h2>

      {/* Check-in */}
      <div className="space-y-1.5">
        <Label htmlFor="checkin">Check-in</Label>
        <Input
          id="checkin"
          type="date"
          min={today}
          value={checkIn}
          onChange={(e) => setCheckIn(e.target.value)}
          aria-label="Check-in date"
        />
      </div>

      {/* Check-out */}
      <div className="space-y-1.5">
        <Label htmlFor="checkout">Check-out</Label>
        <Input
          id="checkout"
          type="date"
          min={checkIn || tomorrow}
          value={checkOut}
          onChange={(e) => setCheckOut(e.target.value)}
          aria-label="Check-out date"
        />
      </div>

      {/* Guests */}
      <div className="space-y-1.5">
        <Label htmlFor="guests">Guests</Label>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setGuests((g) => Math.max(1, g - 1))}
            aria-label="Decrease guests"
          >
            −
          </Button>
          <span className="w-8 text-center font-medium tabular-nums" id="guests">
            {guests}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setGuests((g) => Math.min(20, g + 1))}
            aria-label="Increase guests"
          >
            +
          </Button>
        </div>
      </div>

      {/* Quote */}
      {isDateValid && (
        <div className="border-t border-border pt-4">
          {isLoading && (
            <p className="text-sm text-muted-foreground animate-pulse">Calculating price…</p>
          )}
          {isError && (
            <p className="text-sm text-destructive" role="alert">
              {error instanceof Error ? error.message : 'Unable to fetch quote'}
            </p>
          )}
          {data && <QuoteSummary quote={data} />}
        </div>
      )}

      {/* CTA */}
      <Button
        className="w-full"
        size="lg"
        disabled={!isDateValid || isLoading}
        onClick={() => {
          if (!isDateValid) return;
          const params = new URLSearchParams({
            checkIn,
            checkOut,
            guests: String(guests),
          });
          window.open(
            `https://app.guesty.com/reservations/new?listingId=${listingId}&${params}`,
            '_blank',
            'noopener,noreferrer'
          );
        }}
      >
        {isLoading ? 'Loading…' : data ? `Book for ${formatCurrency(data.money?.hostPayout ?? 0)}` : 'Check availability'}
      </Button>
    </div>
  );
}
