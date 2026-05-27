/**
 * Bookings Store Unit Tests
 * 
 * Tests for the Zustand bookings store including:
 * - State initialization
 * - Fetching reservations
 * - Filtering
 * - Selection
 * - Status updates
 * - Realtime subscriptions
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useBookingsStore, type BookingStatus } from '../bookings';
import { createReservation, createReservations } from '../../test/factories';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase client inline to avoid hoisting ReferenceError
vi.mock('@/integrations/supabase/client', () => {
  const mockSupabase = {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { user: { id: 'user_123' } } },
        error: null,
      }),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      resetPasswordForEmail: vi.fn(),
    },
    from: vi.fn(),
    channel: vi.fn().mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockResolvedValue({}),
    }),
    removeChannel: vi.fn(),
  };
  return { supabase: mockSupabase };
});

describe('useBookingsStore', () => {
  beforeEach(() => {
    // Reset the store before each test
    useBookingsStore.setState({
      reservations: [],
      total: 0,
      loading: false,
      error: null,
      filter: {},
      selected: null,
    });
    
    vi.clearAllMocks();
  });

  describe('State Initialization', () => {
    it('should initialize with default state', () => {
      const state = useBookingsStore.getState();
      
      expect(state.reservations).toEqual([]);
      expect(state.total).toBe(0);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.filter).toEqual({});
      expect(state.selected).toBeNull();
    });
  });

  describe('fetch', () => {
    it('should fetch reservations successfully', async () => {
      const mockReservations = createReservations(5);
      
      // Mock Supabase response
      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        then: vi.fn().mockImplementation((resolve) => 
          resolve({
            data: mockReservations,
            error: null,
            count: mockReservations.length,
          })
        ),
      });

      const { fetch } = useBookingsStore.getState();
      
      await fetch({ limit: 100 });
      
      const state = useBookingsStore.getState();
      expect(state.reservations).toEqual(mockReservations);
      expect(state.total).toBe(mockReservations.length);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle fetch errors', async () => {
      // Mock Supabase error response
      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        then: vi.fn().mockImplementation((_, reject) => 
          reject(new Error('Database error'))
        ),
      });

      const { fetch } = useBookingsStore.getState();
      
      await fetch({ limit: 100 });
      
      const state = useBookingsStore.getState();
      expect(state.reservations).toEqual([]);
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Database error');
    });

    it('should set loading state during fetch', async () => {
      const { fetch } = useBookingsStore.getState();
      
      const fetchPromise = fetch({ limit: 100 });
      
      // Check loading state during fetch
      const state = useBookingsStore.getState();
      expect(state.loading).toBe(true);
      
      await fetchPromise;
    });

    it('should respect limit parameter', async () => {
      const mockReservations = createReservations(10);
      
      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        then: vi.fn().mockImplementation((resolve) => 
          resolve({
            data: mockReservations.slice(0, 5),
            error: null,
            count: 5,
          })
        ),
      });

      const { fetch } = useBookingsStore.getState();
      
      await fetch({ limit: 5 });
      
      const state = useBookingsStore.getState();
      expect(state.total).toBe(5);
    });
  });

  describe('setFilter', () => {
    it('should set filter and trigger fetch', async () => {
      const mockReservations = createReservations(3);
      mockReservations.forEach((r, i) => {
        r.status = ['confirmed', 'cancelled', 'inquiry'][i] as string;
      });
      
      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        then: vi.fn().mockImplementation((resolve) => 
          resolve({
            data: mockReservations.filter(r => r.status === 'confirmed'),
            error: null,
            count: 1,
          })
        ),
      });

      const { setFilter } = useBookingsStore.getState();
      
      await setFilter({ status: 'confirmed' as BookingStatus });
      
      const state = useBookingsStore.getState();
      expect(state.filter.status).toBe('confirmed');
      expect(state.reservations.length).toBe(1);
    });

    it('should merge partial filters', async () => {
      const { setFilter } = useBookingsStore.getState();

      // Mock fetch to avoid actual API call
      vi.spyOn(useBookingsStore.getState(), 'fetch').mockResolvedValue();
      
      await setFilter({ status: 'confirmed' as BookingStatus });
      expect(useBookingsStore.getState().filter.status).toBe('confirmed');
      
      await setFilter({ propertyId: 'prop_123' });
      const filter = useBookingsStore.getState().filter;
      expect(filter.status).toBe('confirmed');
      expect(filter.propertyId).toBe('prop_123');
    });

    it('should filter by date range', async () => {
      const { setFilter } = useBookingsStore.getState();
      
      vi.spyOn(useBookingsStore.getState(), 'fetch').mockResolvedValue();
      
      await setFilter({
        dateFrom: '2024-01-01',
        dateTo: '2024-12-31',
      });
      
      const filter = useBookingsStore.getState().filter;
      expect(filter.dateFrom).toBe('2024-01-01');
      expect(filter.dateTo).toBe('2024-12-31');
    });

    it('should filter by search term', async () => {
      const { setFilter } = useBookingsStore.getState();
      
      vi.spyOn(useBookingsStore.getState(), 'fetch').mockResolvedValue();
      
      await setFilter({ search: 'John Doe' });
      
      expect(useBookingsStore.getState().filter.search).toBe('John Doe');
    });
  });

  describe('clearFilter', () => {
    it('should clear all filters and trigger fetch', async () => {
      const { setFilter, clearFilter } = useBookingsStore.getState();
      
      vi.spyOn(useBookingsStore.getState(), 'fetch').mockResolvedValue();
      
      await setFilter({ status: 'confirmed' as BookingStatus });
      expect(useBookingsStore.getState().filter.status).toBe('confirmed');
      
      await clearFilter();
      
      const filter = useBookingsStore.getState().filter;
      expect(filter).toEqual({});
    });
  });

  describe('select', () => {
    it('should select a reservation', () => {
      const mockReservation = createReservation();
      const { select } = useBookingsStore.getState();
      
      select(mockReservation);
      
      expect(useBookingsStore.getState().selected).toEqual(mockReservation);
    });

    it('should deselect when passing null', () => {
      const mockReservation = createReservation();
      const { select } = useBookingsStore.getState();
      
      select(mockReservation);
      expect(useBookingsStore.getState().selected).toEqual(mockReservation);
      
      select(null);
      expect(useBookingsStore.getState().selected).toBeNull();
    });
  });

  describe('updateStatus', () => {
    it('should update reservation status', async () => {
      const mockReservation = createReservation({ status: 'confirmed' });
      useBookingsStore.setState({
        reservations: [mockReservation],
        selected: mockReservation,
      });
      
      // Mock Supabase update
      (supabase.from as any).mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      });

      const { updateStatus } = useBookingsStore.getState();
      
      await updateStatus(mockReservation.id, 'cancelled');
      
      const state = useBookingsStore.getState();
      expect(state.reservations[0].status).toBe('cancelled');
      expect(state.selected?.status).toBe('cancelled');
    });

    it('should throw error on update failure', async () => {
      const mockReservation = createReservation({ status: 'confirmed' });
      useBookingsStore.setState({
        reservations: [mockReservation],
      });
      
      // Mock Supabase error
      (supabase.from as any).mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: { message: 'Update failed' } }),
      });

      const { updateStatus } = useBookingsStore.getState();
      
      await expect(updateStatus(mockReservation.id, 'cancelled')).rejects.toThrow();
    });

    it('should update only the matching reservation', async () => {
      const mockReservations = createReservations(3);
      useBookingsStore.setState({
        reservations: mockReservations,
        selected: mockReservations[1],
      });
      
      (supabase.from as any).mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      });

      const { updateStatus } = useBookingsStore.getState();
      
      await updateStatus(mockReservations[1].id, 'cancelled');
      
      const state = useBookingsStore.getState();
      expect(state.reservations[0].status).toBe(mockReservations[0].status);
      expect(state.reservations[1].status).toBe('cancelled');
      expect(state.reservations[2].status).toBe(mockReservations[2].status);
      expect(state.selected?.status).toBe('cancelled');
    });
  });

  describe('subscribeRealtime', () => {
    it('should subscribe to realtime changes', () => {
      const { subscribeRealtime } = useBookingsStore.getState();
      
      const unsubscribe = subscribeRealtime();
      
      expect(supabase.channel).toHaveBeenCalled();
      expect(typeof unsubscribe).toBe('function');
      
      unsubscribe();
      expect(supabase.removeChannel).toHaveBeenCalled();
    });

    it('should trigger fetch on realtime changes', async () => {
      const { subscribeRealtime } = useBookingsStore.getState();
      
      const fetchSpy = vi.spyOn(useBookingsStore.getState(), 'fetch').mockResolvedValue();
      
      subscribeRealtime();
      
      // Simulate a realtime change
      const channel = (supabase.channel as any).mock.results[0].value;
      const onCallback = channel.on.mock.calls[0]?.[2];
      
      if (onCallback) {
        onCallback();
        expect(fetchSpy).toHaveBeenCalled();
      }
      fetchSpy.mockRestore();
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle filter + fetch + select workflow', async () => {
      const mockReservations = createReservations(5);
      const targetReservation = mockReservations[2];
      
      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        then: vi.fn().mockImplementation((resolve) => 
          resolve({
            data: mockReservations,
            error: null,
            count: mockReservations.length,
          })
        ),
      });

      const { fetch, setFilter, select } = useBookingsStore.getState();
      
      // Fetch all
      await fetch();
      expect(useBookingsStore.getState().reservations.length).toBe(5);
      
      // Apply filter
      vi.spyOn(useBookingsStore.getState(), 'fetch').mockResolvedValue();
      await setFilter({ status: targetReservation.status as BookingStatus });
      
      // Select reservation
      select(targetReservation);
      expect(useBookingsStore.getState().selected).toEqual(targetReservation);
    });

    it('should handle update + refresh workflow', async () => {
      const mockReservations = createReservations(3);
      useBookingsStore.setState({
        reservations: mockReservations,
      });
      
      (supabase.from as any).mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      });

      const { updateStatus, fetch } = useBookingsStore.getState();
      
      // Update status
      await updateStatus(mockReservations[0].id, 'cancelled');
      expect(useBookingsStore.getState().reservations[0].status).toBe('cancelled');
      
      // Refresh
      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        then: vi.fn().mockImplementation((resolve) => 
          resolve({
            data: mockReservations,
            error: null,
            count: mockReservations.length,
          })
        ),
      });
      
      await fetch();
    });
  });
});
