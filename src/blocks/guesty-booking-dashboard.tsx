'use client';
/**
 * GuestyBookingDashboard — Full production Puck block.
 * Guest-facing dashboard showing upcoming and past reservations.
 * Reads guest email from session/URL param and fetches from /api/guesty/reservations.
 */
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface GuestyReservation {
  _id: string;
  status: string;
  checkIn: string;
  checkOut: string;
  listing: { nickname?: string; title: string; address?: { city: string }; pictures?: Array<{ thumbnail: string }> };
  money: { totalPaid: number; currency: string };
  confirmationCode?: string;
  nights?: number;
}

interface GuestyBookingDashboardProps {
  heading: string;
  emptyUpcomingMessage: string;
  emptyPastMessage: string;
  showCancelButton: boolean;
  cancelCtaUrl: string;
  supportEmail: string;
}

function ReservationCard({ res, isPast }: { res: GuestyReservation; isPast: boolean }) {
  const img = res.listing.pictures?.[0]?.thumbnail;
  const checkIn = new Date(res.checkIn).toLocaleDateString('en-MT', { month: 'short', day: 'numeric', year: 'numeric' });
  const checkOut = new Date(res.checkOut).toLocaleDateString('en-MT', { month: 'short', day: 'numeric', year: 'numeric' });
  const total = new Intl.NumberFormat('en-MT', { style: 'currency', currency: res.money?.currency ?? 'EUR' }).format(res.money?.totalPaid ?? 0);
  const statusColor: Record<string, string> = {
    confirmed: 'bg-green-100 text-green-700',
    reserved: 'bg-blue-100 text-blue-700',
    pending: 'bg-amber-100 text-amber-700',
    cancelled: 'bg-red-100 text-red-700',
    inquiry: 'bg-purple-100 text-purple-700',
  };

  return (
    <div className={cn('flex gap-4 rounded-2xl border bg-white p-4 shadow-sm transition-all hover:shadow-md', isPast && 'opacity-70')}>
      <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl">
        {img ? (
          <Image src={img} alt={res.listing.title} fill className="object-cover" sizes="112px" />
        ) : (
          <div className="flex h-full items-center justify-center bg-gray-100 text-2xl">🏠</div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900 line-clamp-1">{res.listing.nickname ?? res.listing.title}</h3>
          <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-xs font-medium capitalize', statusColor[res.status] ?? 'bg-gray-100 text-gray-600')}>
            {res.status}
          </span>
        </div>
        <p className="text-sm text-gray-500">{res.listing.address?.city}</p>
        <div className="mt-1 flex gap-3 text-xs text-gray-500">
          <span>📅 {checkIn} → {checkOut}</span>
          {res.nights && <span>{res.nights} nights</span>}
        </div>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-sm font-medium">{total}</span>
          {res.confirmationCode && <span className="text-xs text-gray-400">#{res.confirmationCode}</span>}
        </div>
      </div>
    </div>
  );
}

export function GuestyBookingDashboard({
  heading,
  emptyUpcomingMessage,
  emptyPastMessage,
  supportEmail,
}: GuestyBookingDashboardProps) {
  const [reservations, setReservations] = useState<GuestyReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    fetch('/api/guesty/reservations')
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((data: { results: GuestyReservation[] }) => setReservations(data.results ?? []))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const upcoming = reservations.filter((r) => new Date(r.checkOut) >= now && !['cancelled'].includes(r.status));
  const past = reservations.filter((r) => new Date(r.checkOut) < now || r.status === 'cancelled');
  const active = activeTab === 'upcoming' ? upcoming : past;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold">{heading}</h1>

      <div className="mb-6 flex gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1">
        {(['upcoming', 'past'] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={cn('flex-1 rounded-lg py-2 text-sm font-medium capitalize transition-all',
              activeTab === tab ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700')}
          >
            {tab} {tab === 'upcoming' ? `(${upcoming.length})` : `(${past.length})`}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Could not load reservations: {error}
          {supportEmail && <> — <a href={`mailto:${supportEmail}`} className="underline">Contact support</a></>}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
      ) : active.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 py-16 text-center text-gray-400">
          {activeTab === 'upcoming' ? emptyUpcomingMessage : emptyPastMessage}
        </div>
      ) : (
        <div className="space-y-3">
          {active.map((res) => (
            <ReservationCard key={res._id} res={res} isPast={activeTab === 'past'} />
          ))}
        </div>
      )}
    </div>
  );
}

export const GuestyBookingDashboardBlock = {
  label: 'Guesty Booking Dashboard',
  fields: {
    heading: { type: 'text' as const, label: 'Dashboard Heading' },
    emptyUpcomingMessage: { type: 'text' as const, label: 'Empty Upcoming Message' },
    emptyPastMessage: { type: 'text' as const, label: 'Empty Past Message' },
    showCancelButton: { type: 'radio' as const, label: 'Show Cancel Button', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
    cancelCtaUrl: { type: 'text' as const, label: 'Cancel Policy URL' },
    supportEmail: { type: 'text' as const, label: 'Support Email' },
  },
  defaultProps: {
    heading: 'My Bookings',
    emptyUpcomingMessage: 'You have no upcoming reservations. Ready to plan your next stay?',
    emptyPastMessage: 'No past reservations found.',
    showCancelButton: false,
    cancelCtaUrl: '/cancellation-policy',
    supportEmail: '',
  },
  render: (props: GuestyBookingDashboardProps) => <GuestyBookingDashboard {...props} />,
};

export default GuestyBookingDashboardBlock;
