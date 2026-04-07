'use client';
/**
 * GuestyBookingConfirmation — Full production Puck block.
 * Reads reservationId from URL params, polls /api/guesty/reservations/:id
 * and renders a confirmation, pending, or error state.
 */
import React, { useEffect, useState } from 'react';

interface GuestyReservation {
  _id: string;
  status: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  listing: { nickname?: string; title: string; pictures?: Array<{ thumbnail: string }> };
  money: { totalPaid: number; currency: string };
  guests: { adults: number; children: number };
  confirmationCode?: string;
}

interface GuestyBookingConfirmationProps {
  heading: string;
  pendingMessage: string;
  errorMessage: string;
  showSummary: boolean;
  ctaLabel: string;
  ctaUrl: string;
}

export function GuestyBookingConfirmation({
  heading,
  pendingMessage,
  errorMessage,
  showSummary,
  ctaLabel,
  ctaUrl,
}: GuestyBookingConfirmationProps) {
  const [reservation, setReservation] = useState<GuestyReservation | null>(null);
  const [status, setStatus] = useState<'loading' | 'confirmed' | 'pending' | 'error'>('loading');

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('reservation');
    if (!id) { setStatus('error'); return; }
    const poll = async () => {
      try {
        const res = await fetch(`/api/guesty/reservations/${id}`);
        if (!res.ok) { setStatus('error'); return; }
        const data: GuestyReservation = await res.json();
        setReservation(data);
        if (['confirmed', 'inquiry', 'reserved'].includes(data.status)) setStatus('confirmed');
        else if (['pending', 'awaiting_payment'].includes(data.status)) setStatus('pending');
        else setStatus('error');
      } catch { setStatus('error'); }
    };
    poll();
    const t = setInterval(poll, 5000);
    return () => clearInterval(t);
  }, []);

  if (status === 'loading') return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-amber-500" />
      <p className="text-gray-500">Loading your booking details…</p>
    </div>
  );

  if (status === 'pending') return (
    <div className="mx-auto max-w-xl py-16 px-4 text-center">
      <div className="mb-4 text-5xl">⏳</div>
      <h2 className="text-2xl font-bold text-amber-700">Payment Pending</h2>
      <p className="mt-2 text-gray-600">{pendingMessage}</p>
    </div>
  );

  if (status === 'error' || !reservation) return (
    <div className="mx-auto max-w-xl py-16 px-4 text-center">
      <div className="mb-4 text-5xl">❌</div>
      <h2 className="text-2xl font-bold text-red-700">Something went wrong</h2>
      <p className="mt-2 text-gray-600">{errorMessage}</p>
    </div>
  );

  const checkIn = new Date(reservation.checkIn).toLocaleDateString('en-MT', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' });
  const checkOut = new Date(reservation.checkOut).toLocaleDateString('en-MT', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' });
  const total = new Intl.NumberFormat('en-MT', { style: 'currency', currency: reservation.money?.currency ?? 'EUR' }).format(reservation.money?.totalPaid ?? 0);

  return (
    <div className="mx-auto max-w-2xl py-12 px-4">
      <div className="mb-8 text-center">
        <div className="mb-4 text-6xl">🎉</div>
        <h1 className="text-3xl font-bold text-green-700">{heading}</h1>
        {reservation.confirmationCode && (
          <p className="mt-2 text-sm text-gray-500">Confirmation code: <strong>{reservation.confirmationCode}</strong></p>
        )}
      </div>

      {showSummary && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-start gap-4">
            {reservation.listing.pictures?.[0] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={reservation.listing.pictures[0].thumbnail} alt={reservation.listing.title}
                className="h-20 w-28 rounded-xl object-cover shrink-0" />
            )}
            <div>
              <h2 className="font-semibold">{reservation.listing.nickname ?? reservation.listing.title}</h2>
              <p className="text-sm text-gray-500">Guest: {reservation.guestName}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><p className="text-gray-500">Check-in</p><p className="font-medium">{checkIn}</p></div>
            <div><p className="text-gray-500">Check-out</p><p className="font-medium">{checkOut}</p></div>
            <div><p className="text-gray-500">Guests</p><p className="font-medium">{(reservation.guests?.adults ?? 0) + (reservation.guests?.children ?? 0)} total</p></div>
            <div><p className="text-gray-500">Total Paid</p><p className="font-semibold text-green-700">{total}</p></div>
          </div>
        </div>
      )}

      <div className="mt-8 text-center">
        <a href={ctaUrl} className="inline-flex rounded-xl bg-amber-600 px-8 py-3 font-semibold text-white hover:bg-amber-700 transition-all">
          {ctaLabel}
        </a>
      </div>
    </div>
  );
}

export const GuestyBookingConfirmationBlock = {
  label: 'Guesty Booking Confirmation',
  fields: {
    heading: { type: 'text' as const, label: 'Success Heading' },
    pendingMessage: { type: 'text' as const, label: 'Pending Message' },
    errorMessage: { type: 'text' as const, label: 'Error Message' },
    showSummary: { type: 'radio' as const, label: 'Show Summary', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
    ctaLabel: { type: 'text' as const, label: 'CTA Label' },
    ctaUrl: { type: 'text' as const, label: 'CTA URL' },
  },
  defaultProps: {
    heading: 'Your Booking is Confirmed!',
    pendingMessage: 'Your booking is being processed. You will receive a confirmation email shortly.',
    errorMessage: 'We could not find your reservation. Please contact us for assistance.',
    showSummary: true,
    ctaLabel: 'Browse More Properties',
    ctaUrl: '/properties',
  },
  render: (props: GuestyBookingConfirmationProps) => <GuestyBookingConfirmation {...props} />,
};

export default GuestyBookingConfirmationBlock;
