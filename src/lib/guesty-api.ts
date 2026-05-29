/**
 * @deprecated This file has been consolidated.
 * Use import from '@/lib/guesty' instead.
 * 
 * This file exists ONLY for backwards compatibility.
 * All implementations now live in src/lib/guesty/index.ts
 */

export {
  getListings,
  getListing,
  getListingCalendar,
  getBookingQuote,
  getListingsLegacy,
  getListingLegacy,
  getListingCalendarLegacy,
  _clearTokenCache,
} from './guesty/index';

export type { Result } from './guesty/index';

export type {
  GuestyListing,
  GuestyListingsResponse,
  GuestyCalendarDay
} from './guesty/types.ts';
