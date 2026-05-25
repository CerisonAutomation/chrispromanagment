import { renderHook, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useAuth, signOut } from '../use-auth';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      signOut: vi.fn(),
    },
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockResolvedValue({ data: [], error: null }),
  },
}));

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with loading state', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.isLoading).toBe(true);
  });

  it('returns session and user when logged in', async () => {
    const mockSession = { user: { id: 'user-1' } };
    const mockSupabase = require('@/integrations/supabase/client').supabase;

    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: mockSession } });
    mockSupabase.from.mockReturnValue({
      select: () => ({
        eq: () => Promise.resolve({ data: [{ role: 'admin' }], error: null }),
      }),
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.session).toEqual(mockSession);
    expect(result.current.user).toEqual(mockSession.user);
    expect(result.current.isAdmin).toBe(true);
  });

  it('signOut calls supabase.auth.signOut', async () => {
    const mockSupabase = require('@/integrations/supabase/client').supabase;
    mockSupabase.auth.signOut.mockResolvedValue({});

    await signOut();

    expect(mockSupabase.auth.signOut).toHaveBeenCalled();
  });
});
