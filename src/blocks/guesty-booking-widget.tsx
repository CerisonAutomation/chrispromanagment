'use client';
/**
 * @fileoverview GuestyBookingWidget — canonical Puck block.
 *
 * FIXES APPLIED:
 *   - iframe URL: https://booking.guesty.com/{accountId}/{listingId} (was app.guesty.com — wrong)
 *   - SDK global: window.GBE (GBE v2) — was window.GuestyBookingEngine (deprecated)
 *   - SDK script: https://booking.guesty.com/widget.js (was booking-engine.js)
 *   - Proper TypeScript declaration for window.GBE (no @ts-expect-error)
 *   - sandbox attribute on iframe for security
 *   - Skeleton loading (no raw spinner)
 *   - Sanitized listingId / accountId inputs (ID regex guard)
 *   - initialized ref prevents re-init on every render
 */
import React, { useEffect, useRef, useState, useCallback, useId } from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

// ─── GBE v2 global type declaration ──────────────────────────────────────────
declare global {
  interface Window {
    GBE?: {
      init: (options: {
        containerId: string;
        listingId: string;
        accountId: string;
        locale: string;
        currency: string;
        primaryColor: string;
        minNights: number;
        defaultGuests: number;
      }) => void;
      destroy: (containerId: string) => void;
    };
  }
}

/** Validates Guesty IDs — alphanumeric, hyphens, underscores, 6–64 chars */
const GUESTY_ID_RE = /^[a-zA-Z0-9_-]{6,64}$/;
function sanitizeGuestyId(id: string): string {
  return GUESTY_ID_RE.test(id) ? id : '';
}

// ─── Props ────────────────────────────────────────────────────────────────────
export interface GuestyBookingWidgetProps {
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

// ─── Component ────────────────────────────────────────────────────────────────
export function GuestyBookingWidget({
  listingId: rawListingId,
  accountId: rawAccountId,
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
}: GuestyBookingWidgetProps): React.JSX.Element {
  const containerId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listingId = sanitizeGuestyId(rawListingId);
  const accountId = sanitizeGuestyId(rawAccountId);

  /**
   * CORRECTED iframe URL.
   * Format: https://booking.guesty.com/{accountId}/{listingId}?...
   * Previous (WRONG): https://app.guesty.com/booking-engine/{accountId}/{listingId}
   */
  const iframeUrl =
    listingId && accountId
      ? `https://booking.guesty.com/${encodeURIComponent(accountId)}/${encodeURIComponent(listingId)}` +
        `?locale=${encodeURIComponent(locale)}` +
        `&currency=${encodeURIComponent(currency)}` +
        `&guests=${defaultGuests}` +
        `&minNights=${minNights}` +
        `&primaryColor=${encodeURIComponent(primaryColor)}`
      : null;

  const initSDK = useCallback((): void => {
    if (initializedRef.current || !containerRef.current || !listingId || !accountId) return;
    if (!window.GBE) {
      setError('Guesty Booking Engine SDK (GBE v2) failed to initialize.');
      return;
    }
    try {
      window.GBE.init({
        containerId,
        listingId,
        accountId,
        locale,
        currency,
        primaryColor,
        minNights,
        defaultGuests,
      });
      initializedRef.current = true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'GBE SDK init error');
    }
  }, [containerId, listingId, accountId, locale, currency, primaryColor, minNights, defaultGuests]);

  useEffect((): (() => void) | undefined => {
    if (widgetMode !== 'sdk' || !listingId || !accountId) return undefined;

    const scriptId = 'guesty-gbe-v2-sdk';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      /** CORRECTED script URL for GBE v2 */
      script.src = 'https://booking.guesty.com/widget.js';
      script.async = true;
      script.onload = initSDK;
      script.onerror = (): void => setError('Failed to load GBE v2 SDK from booking.guesty.com/widget.js');
      document.head.appendChild(script);
    } else {
      initSDK();
    }

    return (): void => {
      if (initializedRef.current && window.GBE) {
        window.GBE.destroy(containerId);
        initializedRef.current = false;
      }
    };
  }, [widgetMode, initSDK, listingId, accountId, containerId]);

  if (!listingId || !accountId) {
    return (
      <div
        role="alert"
        className={cn(
          'rounded-xl border-2 border-dashed border-amber-400 bg-amber-50 dark:bg-amber-950/20 p-8 text-center',
          className,
        )}
      >
        <AlertCircle className="mx-auto mb-2 h-6 w-6 text-amber-600" aria-hidden />
        <p className="font-semibold text-amber-700 dark:text-amber-400">Guesty Booking Widget</p>
        <p className="mt-1 text-sm text-amber-600 dark:text-amber-500">
          Set{' '}
          <code className="rounded bg-amber-100 dark:bg-amber-900 px-1 font-mono">listingId</code>
          {' '}and{' '}
          <code className="rounded bg-amber-100 dark:bg-amber-900 px-1 font-mono">accountId</code>
          {' '}in block properties.
        </p>
      </div>
    );
  }

  return (
    <section
      aria-label="Booking widget"
      className={cn('relative w-full overflow-hidden rounded-2xl shadow-lg bg-card', className)}
    >
      {showTitle && (
        <header className="px-6 pt-6 pb-3">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">{title}</h2>
          {subtitle && (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          )}
        </header>
      )}

      {error && (
        <div
          role="alert"
          className="mx-4 mb-2 flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>{error} — falling back to iframe.</span>
        </div>
      )}

      {(widgetMode === 'iframe' || Boolean(error)) && iframeUrl ? (
        <div className="relative" style={{ paddingBottom: '75%', minHeight: 400 }}>
          {!iframeLoaded && (
            <div className="absolute inset-0 flex flex-col gap-3 p-6 bg-muted/30">
              <div className="h-10 w-3/4 rounded-md bg-muted animate-pulse" />
              <div className="h-48 w-full rounded-md bg-muted animate-pulse" />
              <div className="h-10 w-1/2 rounded-md bg-muted animate-pulse" />
            </div>
          )}
          <iframe
            src={iframeUrl}
            id={`gbe-iframe-${listingId}`}
            title="Book your stay — Guesty Booking Engine"
            className="absolute inset-0 h-full w-full border-0"
            /**
             * sandbox: minimum required permissions for GBE iframe.
             * allow-popups-to-escape-sandbox: required for Guesty payment redirects.
             */
            sandbox="allow-scripts allow-forms allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            loading="lazy"
            onLoad={(): void => setIframeLoaded(true)}
          />
        </div>
      ) : (
        <div
          id={containerId}
          ref={containerRef}
          className="min-h-[500px] w-full"
          aria-live="polite"
        >
          {!initializedRef.current && (
            <div className="flex flex-col gap-3 p-6">
              <div className="h-10 w-3/4 rounded-md bg-muted animate-pulse" />
              <div className="h-48 w-full rounded-md bg-muted animate-pulse" />
              <div className="h-12 w-full rounded-md bg-muted animate-pulse" />
            </div>
          )}
        </div>
      )}
    </section>
  );
}

// ─── Puck Block Definition ────────────────────────────────────────────────────
export const GuestyBookingWidgetBlock = {
  label: 'Guesty Booking Widget',
  fields: {
    listingId: { type: 'text' as const, label: 'Listing ID (Guesty _id)' },
    accountId: { type: 'text' as const, label: 'Account ID (Guesty)' },
    widgetMode: {
      type: 'select' as const,
      label: 'Widget Mode',
      options: [
        { label: 'iFrame (recommended)', value: 'iframe' },
        { label: 'SDK — GBE v2 (window.GBE)', value: 'sdk' },
      ],
    },
    title: { type: 'text' as const, label: 'Section Title' },
    subtitle: { type: 'text' as const, label: 'Subtitle' },
    showTitle: {
      type: 'radio' as const,
      label: 'Show Title',
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false },
      ],
    },
    primaryColor: { type: 'text' as const, label: 'Brand Color (hex e.g. #c8a96a)' },
    locale: { type: 'text' as const, label: 'Locale (en / mt / de / fr / es)' },
    currency: {
      type: 'select' as const,
      label: 'Currency',
      options: [
        { label: 'EUR', value: 'EUR' },
        { label: 'USD', value: 'USD' },
        { label: 'GBP', value: 'GBP' },
        { label: 'CAD', value: 'CAD' },
        { label: 'AUD', value: 'AUD' },
      ],
    },
    minNights: { type: 'number' as const, label: 'Minimum Nights', min: 1, max: 30 },
    defaultGuests: { type: 'number' as const, label: 'Default Guest Count', min: 1, max: 20 },
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
    currency: 'EUR' as const,
    minNights: 2,
    defaultGuests: 2,
  },
  render: (props: GuestyBookingWidgetProps): React.JSX.Element => (
    <GuestyBookingWidget {...props} />
  ),
};

export default GuestyBookingWidgetBlock;
