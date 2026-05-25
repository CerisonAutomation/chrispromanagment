import { vi, describe, it, expect, beforeEach } from 'vitest';
import { guestyFetch, guesty } from '../guesty';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
    },
  },
}));

vi.mock('import.meta.env', () => ({
  VITE_SUPABASE_URL: 'https://mock-supabase.co',
  VITE_SUPABASE_PUBLISHABLE_KEY: 'mock-anon-key',
}));

describe('guestyFetch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('constructs correct URL with action and params', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });

    await guestyFetch('listings', { limit: 10 });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('action=listings'),
      expect.any(Object)
    );
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('limit=10'),
      expect.any(Object)
    );
  });

  it('uses anon key when no session exists', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });

    await guestyFetch('listings');

    const callArgs = global.fetch.mock.calls[0];
    expect(callArgs[1].headers.Authorization).toBe('Bearer mock-anon-key');
  });

  it('throws error on non-ok response', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ error: 'Not found' }),
    });

    await expect(guestyFetch('listing', { id: '123' })).rejects.toThrow('Not found');
  });
});

describe('guesty client object', () => {
  it('listings calls guestyFetch with correct action', async () => {
    const mockFetch = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });

    await guesty.listings({ limit: 5 });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('action=listings'),
      expect.any(Object)
    );
  });
});
