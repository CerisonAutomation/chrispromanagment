/**
 * @fileoverview QuoteSummary — price breakdown component for the booking widget.
 */
import { formatCurrency } from '@/lib/utils';
import type { GuestyQuoteResult } from '@/types/guesty';

interface QuoteSummaryProps {
  quote: GuestyQuoteResult;
}

export function QuoteSummary({ quote }: QuoteSummaryProps) {
  const { money } = quote;
  if (!money) return null;

  const lines: { label: string; value: number }[] = [
    money.fareAccommodationDiscount !== undefined && money.fareAccommodationDiscount !== 0
      ? { label: 'Accommodation (discounted)', value: money.fareAccommodationDiscount }
      : money.fareAccommodation !== undefined
      ? { label: 'Accommodation', value: money.fareAccommodation }
      : null,
    money.fareCleaning ? { label: 'Cleaning fee', value: money.fareCleaning } : null,
    money.totalTaxes ? { label: 'Taxes', value: money.totalTaxes } : null,
  ].filter((l): l is { label: string; value: number } => l !== null && l.value > 0);

  return (
    <div className="space-y-2 text-sm">
      {lines.map(({ label, value }) => (
        <div key={label} className="flex justify-between">
          <span className="text-muted-foreground">{label}</span>
          <span>{formatCurrency(value)}</span>
        </div>
      ))}
      {money.hostPayout !== undefined && (
        <div className="flex justify-between font-semibold pt-2 border-t border-border">
          <span>Total</span>
          <span>{formatCurrency(money.hostPayout)}</span>
        </div>
      )}
    </div>
  );
}
