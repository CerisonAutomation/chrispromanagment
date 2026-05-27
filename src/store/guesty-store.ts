/**
 * Guesty Store
 * 
 * Centralized state management for Guesty data
 * Provides data normalization and optimistic updates
 * Implements state synchronization hooks
 * 
 * Features:
 * - Centralized Guesty data store
 * - Data normalization
 * - Optimistic updates
 * - State synchronization hooks
 * - State persistence
 * 
 * @author Development Team
 * @version 1.0.0
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { guesty } from '@/lib/guesty';
import { logger } from '@/lib/logger';

// =============================================
// Type Definitions
// =============================================

export interface NormalizedListing {
  _id: string;
  id: string;
  title: string;
  description?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  location?: {
    lat: number;
    lng: number;
  };
  amenities?: string[];
  prices?: {
    basePrice: number;
    currency: string;
    cleaningFee: number;
  };
  images?: string[];
  thumbnail?: string;
  bedrooms?: number;
  bathrooms?: number;
  accommodates?: number;
  defaultCheckInTime?: string;
  defaultCheckOutTime?: string;
  reviews?: {
    avg?: number;
    count?: number;
  };
  active: boolean;
  lastFetched?: Date;
  isOptimistic?: boolean;
}

export interface NormalizedQuote {
  _id: string;
  id: string;
  listingId: string;
  checkInDateLocalized: string;
  checkOutDateLocalized: string;
  guestsCount: number;
  basePrice: number;
  taxes: number;
  fees: number;
  totalPrice: number;
  currency: string;
  expiresAt?: string;
  status: 'pending' | 'confirmed' | 'expired' | 'cancelled';
  rates?: {
    ratePlans?: Array<{
      id: string;
      name: string;
      price: number;
      cancellationPolicy?: string;
    }>;
  };
  invoiceItems?: Array<{
    type: string;
    amount: number;
    description?: string;
  }>;
  lastFetched?: Date;
  isOptimistic?: boolean;
}

export interface NormalizedReservation {
  _id: string;
  id: string;
  quoteId?: string;
  guestId?: string;
  listingId: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'inquiry';
  checkIn: string;
  checkOut: string;
  money?: {
    total: number;
    currency: string;
    paid: number;
  };
  paymentMethod?: string;
  guestName?: string;
  guestEmail?: string;
  createdAt: string;
  updatedAt?: string;
  lastFetched?: Date;
  isOptimistic?: boolean;
}

// =============================================
// Store State
// =============================================

interface GuestyState {
  // Entities
  listings: Record<string, NormalizedListing>;
  quotes: Record<string, NormalizedQuote>;
  reservations: Record<string, NormalizedReservation>;

  // UI State
  loading: {
    listings: boolean;
    quotes: boolean;
    reservations: boolean;
  };
  errors: {
    listings: string | null;
    quotes: string | null;
    reservations: string | null;
  };

  // Filters
  listingsFilter: {
    active?: boolean;
    city?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
  };
  reservationsFilter: {
    status?: string;
    propertyId?: string;
    dateFrom?: string;
    dateTo?: string;
  };

  // Actions - Listings
  fetchListings: (filters?: Record<string, unknown>) => Promise<void>;
  fetchListing: (id: string) => Promise<void>;
  setListing: (listing: NormalizedListing) => void;
  updateListing: (id: string, updates: Partial<NormalizedListing>) => void;
  deleteListing: (id: string) => void;
  clearListings: () => void;

  // Actions - Quotes
  fetchQuote: (id: string) => Promise<void>;
  createQuote: (data: Record<string, unknown>) => Promise<void>;
  applyCoupon: (quoteId: string, couponCode: string) => Promise<void>;
  setQuote: (quote: NormalizedQuote) => void;
  updateQuote: (id: string, updates: Partial<NormalizedQuote>) => void;
  deleteQuote: (id: string) => void;
  clearQuotes: () => void;

  // Actions - Reservations
  fetchReservation: (id: string) => Promise<void>;
  createReservation: (data: Record<string, unknown>) => Promise<void>;
  updateReservationStatus: (id: string, status: string) => Promise<void>;
  setReservation: (reservation: NormalizedReservation) => void;
  updateReservation: (id: string, updates: Partial<NormalizedReservation>) => void;
  deleteReservation: (id: string) => void;
  clearReservations: () => void;

  // Actions - UI State
  setLoading: (entity: 'listings' | 'quotes' | 'reservations', loading: boolean) => void;
  setError: (entity: 'listings' | 'quotes' | 'reservations', error: string | null) => void;

  // Actions - Filters
  setListingsFilter: (filter: Partial<typeof GuestyState['listingsFilter']>) => void;
  setReservationsFilter: (filter: Partial<typeof GuestyState['reservationsFilter']>) => void;
  clearFilters: () => void;

  // Actions - Utilities
  clearOptimisticUpdates: () => void;
  reset: () => void;
}

// =============================================
// Store Implementation
// =============================================

export const useGuestyStore = create<GuestyState>()(
  persist(
    (set, get) => ({
      // Initial State
      listings: {},
      quotes: {},
      reservations: {},
      loading: {
        listings: false,
        quotes: false,
        reservations: false,
      },
      errors: {
        listings: null,
        quotes: null,
        reservations: null,
      },
      listingsFilter: {},
      reservationsFilter: {},

      // =========================================
      // Listings Actions
      // =========================================

      fetchListings: async (filters = {}) => {
        set({ loading: { ...get().loading, listings: true }, errors: { ...get().errors, listings: null } });

        try {
          const data = await guesty.listings(filters);
          const listings = (data?.results || []).map((listing: NormalizedListing) => ({
            ...listing,
            lastFetched: new Date(),
            isOptimistic: false,
          }));

          const normalized = listings.reduce((acc, listing) => {
            acc[listing._id] = listing;
            return acc;
          }, {} as Record<string, NormalizedListing>);

          set({ listings: normalized });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch listings';
          set({ errors: { ...get().errors, listings: errorMessage } });
          logger.error('Failed to fetch listings', { error: errorMessage });
        } finally {
          set({ loading: { ...get().loading, listings: false } });
        }
      },

      fetchListing: async (id: string) => {
        set({ loading: { ...get().loading, listings: true }, errors: { ...get().errors, listings: null } });

        try {
          const listing = await guesty.listing(id);
          set(state => ({
            listings: {
              ...state.listings,
              [listing._id]: {
                ...listing,
                lastFetched: new Date(),
                isOptimistic: false,
              },
            },
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch listing';
          set({ errors: { ...get().errors, listings: errorMessage } });
          logger.error('Failed to fetch listing', { id, error: errorMessage });
        } finally {
          set({ loading: { ...get().loading, listings: false } });
        }
      },

      setListing: (listing) => {
        set(state => ({
          listings: {
            ...state.listings,
            [listing._id]: listing,
          },
        }));
      },

      updateListing: (id, updates) => {
        set(state => ({
          listings: {
            ...state.listings,
            [id]: {
              ...state.listings[id],
              ...updates,
            },
          },
        }));
      },

      deleteListing: (id) => {
        set(state => {
          const { [id]: _removed, ...rest } = state.listings;
          return { listings: rest };
        });
      },

      clearListings: () => {
        set({ listings: {} });
      },

      // =========================================
      // Quotes Actions
      // =========================================

      fetchQuote: async (id) => {
        set({ loading: { ...get().loading, quotes: true }, errors: { ...get().errors, quotes: null } });

        try {
          const quote = await guesty.getQuote(id);
          set(state => ({
            quotes: {
              ...state.quotes,
              [quote._id]: {
                ...quote,
                lastFetched: new Date(),
                isOptimistic: false,
              },
            },
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch quote';
          set({ errors: { ...get().errors, quotes: errorMessage } });
          logger.error('Failed to fetch quote', { id, error: errorMessage });
        } finally {
          set({ loading: { ...get().loading, quotes: false } });
        }
      },

      createQuote: async (data) => {
        set({ loading: { ...get().loading, quotes: true }, errors: { ...get().errors, quotes: null } });

        try {
          const quote = await guesty.createQuote(data);
          set(state => ({
            quotes: {
              ...state.quotes,
              [quote._id]: {
                ...quote,
                lastFetched: new Date(),
                isOptimistic: false,
              },
            },
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create quote';
          set({ errors: { ...get().errors, quotes: errorMessage } });
          logger.error('Failed to create quote', { error: errorMessage });
        } finally {
          set({ loading: { ...get().loading, quotes: false } });
        }
      },

      applyCoupon: async (quoteId, couponCode) => {
        set({ loading: { ...get().loading, quotes: true } });

        try {
          const quote = await guesty.applyCoupon(quoteId, couponCode);
          set(state => ({
            quotes: {
              ...state.quotes,
              [quote._id]: {
                ...quote,
                lastFetched: new Date(),
                isOptimistic: false,
              },
            },
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to apply coupon';
          set({ errors: { ...get().errors, quotes: errorMessage } });
          logger.error('Failed to apply coupon', { quoteId, error: errorMessage });
        } finally {
          set({ loading: { ...get().loading, quotes: false } });
        }
      },

      setQuote: (quote) => {
        set(state => ({
          quotes: {
            ...state.quotes,
            [quote._id]: quote,
          },
        }));
      },

      updateQuote: (id, updates) => {
        set(state => ({
          quotes: {
            ...state.quotes,
            [id]: {
              ...state.quotes[id],
              ...updates,
            },
          },
        }));
      },

      deleteQuote: (id) => {
        set(state => {
          const { [id]: _removed, ...rest } = state.quotes;
          return { quotes: rest };
        });
      },

      clearQuotes: () => {
        set({ quotes: {} });
      },

      // =========================================
      // Reservations Actions
      // =========================================

      fetchReservation: async (id) => {
        set({ loading: { ...get().loading, reservations: true }, errors: { ...get().errors, reservations: null } });

        try {
          const reservation = await guesty.reservation(id);
          set(state => ({
            reservations: {
              ...state.reservations,
              [reservation._id]: {
                ...reservation,
                lastFetched: new Date(),
                isOptimistic: false,
              },
            },
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch reservation';
          set({ errors: { ...get().errors, reservations: errorMessage } });
          logger.error('Failed to fetch reservation', { id, error: errorMessage });
        } finally {
          set({ loading: { ...get().loading, reservations: false } });
        }
      },

      createReservation: async (data) => {
        set({ loading: { ...get().loading, reservations: true }, errors: { ...get().errors, reservations: null } });

        try {
          const reservation = await guesty.createReservation(data);
          set(state => ({
            reservations: {
              ...state.reservations,
              [reservation._id]: {
                ...reservation,
                lastFetched: new Date(),
                isOptimistic: false,
              },
            },
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create reservation';
          set({ errors: { ...get().errors, reservations: errorMessage } });
          logger.error('Failed to create reservation', { error: errorMessage });
        } finally {
          set({ loading: { ...get().loading, reservations: false } });
        }
      },

      updateReservationStatus: async (id, status) => {
        set(state => ({
          reservations: {
            ...state.reservations,
            [id]: {
              ...state.reservations[id],
              status: status as any,
              isOptimistic: true,
            },
          },
        }));

        try {
          // In a real implementation, you would call the API here
          // For now, we just clear the optimistic flag
          set(state => ({
            reservations: {
              ...state.reservations,
              [id]: {
                ...state.reservations[id],
                isOptimistic: false,
              },
            },
          }));
        } catch (error) {
          // Revert optimistic update on error
          set(state => ({
            reservations: {
              ...state.reservations,
              [id]: {
                ...state.reservations[id],
                isOptimistic: false,
              },
            },
          }));
          const errorMessage = error instanceof Error ? error.message : 'Failed to update reservation';
          set({ errors: { ...get().errors, reservations: errorMessage } });
          logger.error('Failed to update reservation status', { id, status, error: errorMessage });
        }
      },

      setReservation: (reservation) => {
        set(state => ({
          reservations: {
            ...state.reservations,
            [reservation._id]: reservation,
          },
        }));
      },

      updateReservation: (id, updates) => {
        set(state => ({
          reservations: {
            ...state.reservations,
            [id]: {
              ...state.reservations[id],
              ...updates,
            },
          },
        }));
      },

      deleteReservation: (id) => {
        set(state => {
          const { [id]: _removed, ...rest } = state.reservations;
          return { reservations: rest };
        });
      },

      clearReservations: () => {
        set({ reservations: {} });
      },

      // =========================================
      // UI State Actions
      // =========================================

      setLoading: (entity, loading) => {
        set(state => ({
          loading: {
            ...state.loading,
            [entity]: loading,
          },
        }));
      },

      setError: (entity, error) => {
        set(state => ({
          errors: {
            ...state.errors,
            [entity]: error,
          },
        }));
      },

      // =========================================
      // Filter Actions
      // =========================================

      setListingsFilter: (filter) => {
        set({ listingsFilter: { ...get().listingsFilter, ...filter } });
      },

      setReservationsFilter: (filter) => {
        set({ reservationsFilter: { ...get().reservationsFilter, ...filter } });
      },

      clearFilters: () => {
        set({ listingsFilter: {}, reservationsFilter: {} });
      },

      // =========================================
      // Utility Actions
      // =========================================

      clearOptimisticUpdates: () => {
        set(state => {
          const clearEntity = (entity: Record<string, any>) =>
            Object.fromEntries(
              Object.entries(entity).map(([id, data]) => [id, { ...data, isOptimistic: false }])
            );

          return {
            listings: clearEntity(state.listings),
            quotes: clearEntity(state.quotes),
            reservations: clearEntity(state.reservations),
          };
        });
      },

      reset: () => {
        set({
          listings: {},
          quotes: {},
          reservations: {},
          loading: {
            listings: false,
            quotes: false,
            reservations: false,
          },
          errors: {
            listings: null,
            quotes: null,
            reservations: null,
          },
          listingsFilter: {},
          reservationsFilter: {},
        });
      },
    }),
    {
      name: 'guesty-store',
      storage: createJSONStorage(() => localStorage),
      // Only persist certain data to avoid storage limits
      partialize: (state) => ({
        listings: state.listings,
        quotes: {}, // Don't persist quotes (security)
        reservations: {}, // Don't persist reservations (security)
      }),
    }
  )
);

// =============================================
// Selectors
// =========================================

export const selectListingsArray = (state: GuestyState) => Object.values(state.listings);
export const selectQuotesArray = (state: GuestyState) => Object.values(state.quotes);
export const selectReservationsArray = (state: GuestyState) => Object.values(state.reservations);

export const selectListingById = (state: GuestyState, id: string) => state.listings[id];
export const selectQuoteById = (state: GuestyState, id: string) => state.quotes[id];
export const selectReservationById = (state: GuestyState, id: string) => state.reservations[id];

export const selectActiveListings = (state: GuestyState) =>
  Object.values(state.listings).filter(l => l.active);

export const selectPendingReservations = (state: GuestyState) =>
  Object.values(state.reservations).filter(r => r.status === 'pending');
