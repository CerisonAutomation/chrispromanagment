/**
 * @fileoverview Canonical TanStack Query key factory.
 * Tree-shakeable. Import as: import { queryKeys } from '@/lib/query-keys'
 *
 * All query keys in the application must be defined here.
 * Keys follow the hierarchical pattern: [domain, id?, sub-resource?, params?]
 */

export const queryKeys = {
  // ─── CMS Pages ────────────────────────────────────────────────────────────
  pages: ['pages'] as const,
  page: (slug: string) => ['pages', slug] as const,
  pageVersions: (slug: string) => ['pages', slug, 'versions'] as const,

  // ─── Properties / Guesty Listings ─────────────────────────────────────────
  listings: ['listings'] as const,
  listing: (id: string) => ['listings', id] as const,
  listingCalendar: (id: string, from: string, to: string) =>
    ['listings', id, 'calendar', from, to] as const,
  listingQuote: (id: string, checkIn: string, checkOut: string, guests: number) =>
    ['listings', id, 'quote', checkIn, checkOut, guests] as const,

  // ─── Bookings ─────────────────────────────────────────────────────────────
  bookings: ['bookings'] as const,
  booking: (id: string) => ['bookings', id] as const,
  userBookings: (userId: string) => ['bookings', 'user', userId] as const,

  // ─── Media ────────────────────────────────────────────────────────────────
  media: ['media'] as const,
  mediaItem: (id: string) => ['media', id] as const,

  // ─── Auth / User ──────────────────────────────────────────────────────────
  user: ['user'] as const,
  userSession: ['user', 'session'] as const,

  // ─── Health ───────────────────────────────────────────────────────────────
  health: ['health'] as const,
} as const;
