/**
 * @fileoverview PropertyFilters — URL-driven filter bar for the properties listing.
 * Reads from and writes to URLSearchParams. State is always the URL — no drift.
 */
'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const BEDROOM_OPTIONS = [
  { value: '__any', label: 'Any bedrooms' },
  { value: '1', label: '1 bedroom' },
  { value: '2', label: '2 bedrooms' },
  { value: '3', label: '3 bedrooms' },
  { value: '4', label: '4+ bedrooms' },
] as const;

const MIN_PRICE_OPTIONS = [
  { value: '__any', label: 'No min' },
  { value: '50', label: '€50 / night' },
  { value: '100', label: '€100 / night' },
  { value: '200', label: '€200 / night' },
  { value: '500', label: '€500 / night' },
] as const;

const MAX_PRICE_OPTIONS = [
  { value: '__any', label: 'No max' },
  { value: '150', label: '€150 / night' },
  { value: '300', label: '€300 / night' },
  { value: '600', label: '€600 / night' },
  { value: '1200', label: '€1 200 / night' },
] as const;

export function PropertyFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const bedrooms = searchParams.get('bedrooms') ?? '';
  const minPrice = searchParams.get('minPrice') ?? '';
  const maxPrice = searchParams.get('maxPrice') ?? '';
  const hasFilters = !!(bedrooms || minPrice || maxPrice);

  const applyFilter = useCallback(
    (key: string, value: string) => {
      const sp = new URLSearchParams(searchParams.toString());
      // Drop cursor so we always start at page 1 after a filter change
      sp.delete('cursor');
      if (value && value !== '__any') {
        sp.set(key, value);
      } else {
        sp.delete(key);
      }
      router.push(`/properties${sp.toString() ? `?${sp.toString()}` : ''}`);
    },
    [router, searchParams],
  );

  function clearFilters() {
    router.push('/properties');
  }

  return (
    <div className="flex flex-wrap items-end gap-4 py-4 px-5 rounded-xl border border-border/50 bg-[#111214]">
      {/* Bedrooms */}
      <div className="space-y-1 min-w-[160px]">
        <Label className="text-xs text-[rgba(232,228,220,0.5)]">Bedrooms</Label>
        <Select
          value={bedrooms || '__any'}
          onValueChange={(v) => applyFilter('bedrooms', v)}
        >
          <SelectTrigger className="h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {BEDROOM_OPTIONS.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Min price */}
      <div className="space-y-1 min-w-[160px]">
        <Label className="text-xs text-[rgba(232,228,220,0.5)]">Min price</Label>
        <Select
          value={minPrice || '__any'}
          onValueChange={(v) => applyFilter('minPrice', v)}
        >
          <SelectTrigger className="h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MIN_PRICE_OPTIONS.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Max price */}
      <div className="space-y-1 min-w-[160px]">
        <Label className="text-xs text-[rgba(232,228,220,0.5)]">Max price</Label>
        <Select
          value={maxPrice || '__any'}
          onValueChange={(v) => applyFilter('maxPrice', v)}
        >
          <SelectTrigger className="h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MAX_PRICE_OPTIONS.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Clear */}
      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="text-xs text-[rgba(232,228,220,0.4)] hover:text-[#c8a96a] self-end"
        >
          Clear filters ✕
        </Button>
      )}
    </div>
  );
}
