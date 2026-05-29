/**
 * @fileoverview PropertyPagination — cursor-based next/prev for property listings.
 * Server Component — renders anchor links only (no JS required).
 */
import Link from 'next/link';

interface PropertyPaginationProps {
  nextCursor?: string;
  currentFilters: {
    bedrooms?: string;
    minPrice?: string;
    maxPrice?: string;
    cursor?: string;
  };
}

function buildUrl(filters: PropertyPaginationProps['currentFilters'], cursor?: string): string {
  const sp = new URLSearchParams();
  if (filters.bedrooms) sp.set('bedrooms', filters.bedrooms);
  if (filters.minPrice) sp.set('minPrice', filters.minPrice);
  if (filters.maxPrice) sp.set('maxPrice', filters.maxPrice);
  if (cursor) sp.set('cursor', cursor);
  const qs = sp.toString();
  return `/properties${qs ? `?${qs}` : ''}`;
}

export function PropertyPagination({ nextCursor, currentFilters }: PropertyPaginationProps) {
  const hasPrev = !!currentFilters.cursor;
  const hasNext = !!nextCursor;

  if (!hasPrev && !hasNext) return null;

  return (
    <nav
      className="flex items-center justify-between pt-4"
      aria-label="Property listing pagination"
    >
      {/* Previous */}
      {hasPrev ? (
        <Link
          href={buildUrl({ ...currentFilters, cursor: undefined })}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl border border-border/60 text-[rgba(232,228,220,0.7)] hover:border-[rgba(200,169,106,0.4)] hover:text-[#c8a96a] transition-colors"
        >
          ← Previous
        </Link>
      ) : (
        <div />
      )}

      {/* Next */}
      {hasNext && (
        <Link
          href={buildUrl(currentFilters, nextCursor)}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl bg-gradient-to-r from-[#c8a96a] to-[#9b7d3f] text-[#0e0f11] hover:opacity-90 transition-opacity"
        >
          Next →
        </Link>
      )}
    </nav>
  );
}
