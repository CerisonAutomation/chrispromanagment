// TODO: Fix eslint issues and remove this blanket disable
import { renderHook, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useAuth, signOut } from '../use-auth';

vi.mock('../use-auth', () => ({
  useAuth: vi.fn(),
  signOut: vi.fn(),
}));

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with loading state', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.isLoading).toBe(true);
  });
});
