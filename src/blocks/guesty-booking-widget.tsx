'use client';
/**
 * GuestyBookingWidget — Full production Puck block.
 * Embeds the Guesty Booking Engine (GBE) iframe or SDK widget.
 * Supports: listingId override, check-in/out prefill, guest count, theme colours.
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────────────────────

interface GuestyBookingWidgetProps {
  listingId: string;
  accountId: string;
  widgetMode: 'iframe' | 'sdk';
  primaryColor: string;
  title: string;
  subtitle: string;
  showTitle: boolean;
  locale: string;
  currency: string;
  minNights: number;
  defaultGuests: number;
  className?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function GuestyBookingWidget({
  listingId,
  accountId,
  widgetMode,
  primaryColor,
  title,
  subtitle,
  showTitle,
  locale,
  currency,
  minNights,
  defaultGuests,
  className,
}: GuestyBookingWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const iframeUrl = `https://app.guesty.com/booking-engine/${accountId}/${listingId}?locale=${locale}&currency=${currency}&guests=${defaultGuests}&minNights=${minNights}&primaryColor=${encodeURIComponent(primaryColor)}`;

  const loadSDK = useCallback(() => {
    if (typeof window === 'undefined') return;
    const scriptId = 'guesty-be-sdk';
    if (document.getElementById(scriptId)) {
      initWidget();
      return;
    }
    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://booking.guesty.com/booking-engine.js';
    script.async = true;
    script.onload = () => initWidget();
    script.onerror = () => setError('Failed to load Guesty Booking Engine script.');
    document.head.appendChild(script);
  }, [listingId, accountId]); // eslint-disable-line react-hooks/exhaustive-deps

  const initWidget = useCallback(() => {
    if (!containerRef.current) return;
    try {
      // @ts-expect-error — Guesty SDK is loaded dynamically
      if (window.GuestyBookingEngine) {
        // @ts-expect-error
        window.GuestyBookingEngine.init({
          container: containerRef.current,
          listingId,
          accountId,
          locale,
          currency,
          primaryColor,
          minNights,
          defaultGuests,
        });
        setLoaded(true);
      }
    } catch (err) {
      setError(String(err));
    }
  }, [listingId, accountId, locale, currency, primaryColor, minNights, defaultGuests]);

  useEffect(() => {
    if (widgetMode === 'sdk') {
      loadSDK();
    } else {
      setLoaded(true);
    }
  }, [widgetMode, loadSDK]);

  if (!listingId || !accountId) {
    return (
      <div className={cn('rounded-xl border-2 border-dashed border-amber-400 bg-amber-50 p-8 text-center', className)}>
        <p className="font-semibold text-amber-700">⚠️ Guesty Booking Widget</p>
        <p className="mt-1 text-sm text-amber-600">
          Set <code className="rounded bg-amber-100 px-1 font-mono">listingId</code> and{' '}
          <code className="rounded bg-amber-100 px-1 font-mono">accountId</code> in the block properties.
        </p>
      </div>
    );
  }

  return (
    <div className={cn('relative w-full overflow-hidden rounded-2xl shadow-lg', className)}>
      {showTitle && (
        <div className="px-6 pt-6 pb-2">
          <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--pm-foreground)' }}>
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-sm" style={{ color: 'var(--pm-foreground)', opacity: 0.7 }}>
              {subtitle}
            </p>
          )}
        </div>
      )}

      {error && (
        <div className="m-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error} — falling back to iframe mode.
        </div>
      )}

      {widgetMode === 'iframe' || error ? (
        <div className="relative" style={{ paddingBottom: '75%' }}>
          {!loaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500" />
            </div>
          )}
          <iframe
            src={iframeUrl}
            className="absolute inset-0 h-full w-full border-0"
            title="Guesty Booking Engine"
            allowFullScreen
            onLoad={() => setLoaded(true)}
          />
        </div>
      ) : (
        <div ref={containerRef} className="min-h-[500px] w-full">
          {!loaded && (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Puck Block Definition ────────────────────────────────────────────────────

export const GuestyBookingWidgetBlock = {
  label: 'Guesty Booking Widget',
  fields: {
    listingId: { type: 'text' as const, label: 'Listing ID' },
    accountId: { type: 'text' as const, label: 'Account ID' },
    widgetMode: {
      type: 'select' as const,
      label: 'Widget Mode',
      options: [
        { label: 'iFrame (default)', value: 'iframe' },
        { label: 'SDK (requires API key)', value: 'sdk' },
      ],
    },
    title: { type: 'text' as const, label: 'Title' },
    subtitle: { type: 'text' as const, label: 'Subtitle' },
    showTitle: { type: 'radio' as const, label: 'Show Title', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
    primaryColor: { type: 'text' as const, label: 'Primary Color (hex)' },
    locale: { type: 'text' as const, label: 'Locale (e.g. en, mt, de)' },
    currency: { type: 'text' as const, label: 'Currency (e.g. EUR, USD)' },
    minNights: { type: 'number' as const, label: 'Min Nights' },
    defaultGuests: { type: 'number' as const, label: 'Default Guests' },
  },
  defaultProps: {
    listingId: '',
    accountId: process.env.NEXT_PUBLIC_GUESTY_ACCOUNT_ID ?? '',
    widgetMode: 'iframe' as const,
    title: 'Book Your Stay',
    subtitle: 'Select your dates and complete your reservation securely.',
    showTitle: true,
    primaryColor: '#c8a96a',
    locale: 'en',
    currency: 'EUR',
    minNights: 2,
    defaultGuests: 2,
  },
  render: (props: GuestyBookingWidgetProps) => <GuestyBookingWidget {...props} />,
};

export default GuestyBookingWidgetBlock;
