'use client';
/**
 * GuestyPropertySearch — Full production Puck block.
 * A hero-style search form: destination, check-in, check-out, guests.
 * On submit, navigates to ctaBaseUrl with query params.
 */
import React, { useState, useTransition, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface GuestyPropertySearchProps {
  heading: string;
  subheading: string;
  ctaBaseUrl: string;
  ctaLabel: string;
  placeholder: string;
  layout: 'horizontal' | 'vertical' | 'card';
  showGuests: boolean;
  showDates: boolean;
  backgroundImage: string;
  overlayOpacity: number;
}

export function GuestyPropertySearch({
  heading,
  subheading,
  ctaBaseUrl,
  ctaLabel,
  placeholder,
  layout,
  showGuests,
  showDates,
  backgroundImage,
  overlayOpacity,
}: GuestyPropertySearchProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (destination) params.set('q', destination);
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    if (guests > 1) params.set('guests', String(guests));
    startTransition(() => {
      router.push(`${ctaBaseUrl}?${params}`);
    });
  };

  const today = new Date().toISOString().split('T')[0];

  const inputClass = 'rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400 w-full';

  const form = (
    <form onSubmit={handleSubmit}
      className={cn(
        'flex gap-3',
        layout === 'horizontal' ? 'flex-row flex-wrap items-end' : 'flex-col'
      )}
    >
      <div className={cn('flex-1 min-w-[180px]', layout === 'vertical' && 'w-full')}>
        <label className="mb-1 block text-xs font-medium text-gray-600">Destination</label>
        <input
          type="text"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder={placeholder}
          className={inputClass}
        />
      </div>
      {showDates && (
        <>
          <div className={cn(layout === 'horizontal' ? 'w-36' : 'w-full')}>
            <label className="mb-1 block text-xs font-medium text-gray-600">Check-in</label>
            <input type="date" value={checkIn} min={today} onChange={(e) => setCheckIn(e.target.value)} className={inputClass} />
          </div>
          <div className={cn(layout === 'horizontal' ? 'w-36' : 'w-full')}>
            <label className="mb-1 block text-xs font-medium text-gray-600">Check-out</label>
            <input type="date" value={checkOut} min={checkIn || today} onChange={(e) => setCheckOut(e.target.value)} className={inputClass} />
          </div>
        </>
      )}
      {showGuests && (
        <div className={cn(layout === 'horizontal' ? 'w-28' : 'w-full')}>
          <label className="mb-1 block text-xs font-medium text-gray-600">Guests</label>
          <select value={guests} onChange={(e) => setGuests(Number(e.target.value))} className={inputClass}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <option key={n} value={n}>{n} {n === 1 ? 'guest' : 'guests'}</option>
            ))}
          </select>
        </div>
      )}
      <div className={layout === 'horizontal' ? 'shrink-0' : ''}>
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-xl bg-amber-600 px-6 py-3 font-semibold text-white transition-all hover:bg-amber-700 hover:shadow-lg disabled:opacity-60 sm:w-auto"
        >
          {isPending ? 'Searching…' : ctaLabel}
        </button>
      </div>
    </form>
  );

  if (layout === 'card') {
    return (
      <section className="relative overflow-hidden" style={{ minHeight: '500px' }}>
        {backgroundImage && (
          <>
            <div className="absolute inset-0" style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
            <div className="absolute inset-0 bg-black" style={{ opacity: overlayOpacity / 100 }} />
          </>
        )}
        <div className="relative z-10 flex min-h-[500px] flex-col items-center justify-center px-4 py-16 text-center">
          {heading && <h1 className="mb-3 text-4xl font-bold text-white drop-shadow sm:text-5xl">{heading}</h1>}
          {subheading && <p className="mb-8 text-lg text-white/80">{subheading}</p>}
          <div className="w-full max-w-3xl rounded-2xl bg-white p-5 shadow-2xl">{form}</div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 px-4">
      <div className="mx-auto max-w-4xl">
        {heading && <h2 className="mb-2 text-3xl font-bold">{heading}</h2>}
        {subheading && <p className="mb-6 text-gray-500">{subheading}</p>}
        <div className={cn(layout === 'vertical' ? 'rounded-2xl border border-gray-200 bg-white p-6 shadow-sm' : '')}>{form}</div>
      </div>
    </section>
  );
}

export const GuestyPropertySearchBlock = {
  label: 'Guesty Property Search',
  fields: {
    heading: { type: 'text' as const, label: 'Heading' },
    subheading: { type: 'text' as const, label: 'Subheading' },
    ctaBaseUrl: { type: 'text' as const, label: 'Results Page URL' },
    ctaLabel: { type: 'text' as const, label: 'Search Button Label' },
    placeholder: { type: 'text' as const, label: 'Destination Placeholder' },
    layout: {
      type: 'select' as const, label: 'Layout',
      options: [{ label: 'Horizontal', value: 'horizontal' }, { label: 'Vertical', value: 'vertical' }, { label: 'Hero Card', value: 'card' }],
    },
    showGuests: { type: 'radio' as const, label: 'Show Guests', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
    showDates: { type: 'radio' as const, label: 'Show Dates', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
    backgroundImage: { type: 'text' as const, label: 'Background Image URL (card mode)' },
    overlayOpacity: { type: 'number' as const, label: 'Overlay Opacity % (card mode)' },
  },
  defaultProps: {
    heading: 'Find Your Perfect Stay',
    subheading: 'Discover luxury properties in Malta',
    ctaBaseUrl: '/properties',
    ctaLabel: 'Search',
    placeholder: 'Valletta, Sliema, Gozo…',
    layout: 'card' as const,
    showGuests: true,
    showDates: true,
    backgroundImage: '',
    overlayOpacity: 40,
  },
  render: (props: GuestyPropertySearchProps) => <GuestyPropertySearch {...props} />,
};

export default GuestyPropertySearchBlock;
