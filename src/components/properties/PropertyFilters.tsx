/**
 * @fileoverview PropertyFilters — URL-driven filter bar for the properties listing.
 * Client Component that updates search params on submit.
 */
'use client';
import { useRouter } from 'next/navigation';
import { type FormEvent, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PropertyFiltersProps {
  currentFilters: {
    bedrooms?: string;
    minPrice?: string;
    maxPrice?: string;
  };
}

const BEDROOM_OPTIONS = [
  { value: '', label: 'Any bedrooms' },
  { value: '1', label: '1 bedroom' },
  { value: '2', label: '2 bedrooms' },
  { value: '3', label: '3 bedrooms' },
  { value: '4', label: '4+ bedrooms' },
] as const;

const MIN_PRICE_OPTIONS = [
  { value: '', label: 'No min' },
  { value: '50', label: '€50 / night' },
  { value: '100', label: '€100 / night' },
  { value: '200', label: '€200 / night' },
  { value: '500', label: '€500 / night' },
] as const;

const MAX_PRICE_OPTIONS = [
  { value: '', label: 'No max' },
  { value: '150', label: '€150 / night' },
  { value: '300', label: '€300 / night' },
  { value: '600', label: '€600 / night' },
  { value: '1200', label: '€1 200 / night' },
] as const;

export function PropertyFilters({ currentFilters }: PropertyFiltersProps) {
  const router = useRouter();
  const bedroomsRef = useRef<string>(currentFilters.bedrooms ?? '');
  const minPriceRef = useRef<string>(currentFilters.minPrice ?? '');
  const maxPriceRef = useRef<string>(currentFilters.maxPrice ?? '');

  function apply() {
    const sp = new URLSearchParams();
    if (bedroomsRef.current) sp.set('bedrooms', bedroomsRef.current);
    if (minPriceRef.current) sp.set('minPrice', minPriceRef.current);
    if (maxPriceRef.current) sp.set('maxPrice', maxPriceRef.current);
    // Drop cursor on filter change to start from the first page
    const qs = sp.toString();
    router.push(`/properties${qs ? `?${qs}` : ''}`);
  }

  function reset(e: FormEvent) {
    e.preventDefault();
    bedroomsRef.current = '';
    minPriceRef.current = '';
    maxPriceRef.current = '';
    router.push('/properties');
  }

  const hasFilters = !!(currentFilters.bedrooms || currentFilters.minPrice || currentFilters.maxPrice);

  return (
    <div className="flex flex-wrap items-end gap-4 py-4 px-5 rounded-xl border border-border/50 bg-[#111214]">
      {/* Bedrooms */}
      <div className="space-y-1 min-w-[160px]">
        <Label className="text-xs text-[rgba(232,228,220,0.5)]">Bedrooms</Label>
        <Select
          defaultValue={currentFilters.bedrooms ?? ''}
          onValueChange={(v) => {
            bedroomsRef.current = v;
            apply();
          }}
        >
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder="Any bedrooms" />
          </SelectTrigger>
          <SelectContent>
            {BEDROOM_OPTIONS.map(({ value, label }) => (
              <SelectItem key={value || 'any'} value={value}>
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
          defaultValue={currentFilters.minPrice ?? ''}
          onValueChange={(v) => {
            minPriceRef.current = v;
            apply();
          }}
        >
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder="No min" />
          </SelectTrigger>
          <SelectContent>
            {MIN_PRICE_OPTIONS.map(({ value, label }) => (
              <SelectItem key={value || 'nomin'} value={value}>
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
          defaultValue={currentFilters.maxPrice ?? ''}
          onValueChange={(v) => {
            maxPriceRef.current = v;
            apply();
          }}
        >
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder="No max" />
          </SelectTrigger>
          <SelectContent>
            {MAX_PRICE_OPTIONS.map(({ value, label }) => (
              <SelectItem key={value || 'nomax'} value={value}>
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
          onClick={reset}
          className="text-xs text-[rgba(232,228,220,0.4)] hover:text-[#c8a96a] self-end"
        >
          Clear filters ✕
        </Button>
      )}
    </div>
  );
}
