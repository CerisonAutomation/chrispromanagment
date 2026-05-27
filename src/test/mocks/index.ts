/**
 * External Dependencies Mocking Strategy
 * 
 * Provides comprehensive mocks for all external services and dependencies.
 * Uses MSW (Mock Service Worker) for API mocking and Vi for function mocking.
 */

import { vi, beforeEach, afterEach } from 'vitest';

// ==================== SUPABASE MOCK ====================

export const createMockSupabaseClient = () => {
  const mockData: Record<string, any[]> = {
    reservations_cache: [],
    guesty_properties_cache: [],
    users: [],
    bookings: [],
  };

  return {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { user: { id: 'user_123' } } },
        error: null,
      }),
      signInWithPassword: vi.fn().mockResolvedValue({
        data: { 
          user: { id: 'user_123', email: 'test@example.com' },
          session: { access_token: 'token_123' }
        },
        error: null,
      }),
      signUp: vi.fn().mockResolvedValue({
        data: { 
          user: { id: 'user_123', email: 'test@example.com' },
          session: { access_token: 'token_123' }
        },
        error: null,
      }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }),
    },
    from: (table: string) => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      gt: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      lt: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      like: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: mockData[table]?.[0] || null,
        error: null,
      }),
      then: vi.fn().mockImplementation((resolve) => 
        resolve({
          data: mockData[table] || [],
          error: null,
          count: mockData[table]?.length || 0,
        })
      ),
    }),
    channel: vi.fn().mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockResolvedValue({}),
    }),
    removeChannel: vi.fn(),
    realtime: {
      connect: vi.fn(),
      disconnect: vi.fn(),
    },
  };
};

export const mockSupabaseClient = createMockSupabaseClient();

// ==================== GUESTY API MOCK ====================

export const createMockGuestyClient = () => {
  return {
    listings: vi.fn().mockResolvedValue({
      results: [],
      pagination: { total: 0, limit: 10, offset: 0 },
    }),
    reservations: vi.fn().mockResolvedValue({
      results: [],
      pagination: { total: 0, limit: 10, offset: 0 },
    }),
    createReservation: vi.fn().mockResolvedValue({
      id: 'res_123',
      status: 'confirmed',
      money: 500,
    }),
    updateReservation: vi.fn().mockResolvedValue({
      id: 'res_123',
      status: 'cancelled',
    }),
    getProperty: vi.fn().mockResolvedValue({
      id: 'prop_123',
      title: 'Test Property',
      base_price: 200,
    }),
  };
};

export const mockGuestyClient = createMockGuestyClient();

// ==================== STRIPE MOCK ====================

export const createMockStripe = () => {
  return {
    elements: vi.fn().mockReturnValue({
      create: vi.fn().mockReturnValue({
        mount: vi.fn(),
        unmount: vi.fn(),
        destroy: vi.fn(),
      }),
    }),
    confirmPayment: vi.fn().mockResolvedValue({
      paymentIntent: {
        id: 'pi_123',
        status: 'succeeded',
        amount: 10000,
      },
      error: null,
    }),
    createPaymentMethod: vi.fn().mockResolvedValue({
      paymentMethod: {
        id: 'pm_123',
        type: 'card',
      },
    }),
    createPaymentIntent: vi.fn().mockResolvedValue({
      id: 'pi_123',
      amount: 10000,
      currency: 'usd',
      status: 'requires_payment_method',
    }),
  };
};

export const mockStripe = createMockStripe();

// ==================== WEBSOCKET MOCK ====================

export const createMockWebSocket = () => {
  const callbacks: Record<string, ((...args: unknown[]) => void)[]> = {
    connect: [],
    message: [],
    error: [],
    close: [],
  };

  return {
    connect: vi.fn().mockImplementation(() => {
      callbacks.connect.forEach(cb => cb());
    }),
    disconnect: vi.fn(),
    send: vi.fn(),
    on: vi.fn().mockImplementation((event: string, callback: (...args: unknown[]) => void) => {
      if (!callbacks[event]) {
callbacks[event] = [];
}
      callbacks[event].push(callback);
    }),
    emit: vi.fn(),
    trigger: (event: string, data?: any) => {
      if (callbacks[event]) {
        callbacks[event].forEach(cb => cb(data));
      }
    },
    getCallbacks: () => callbacks,
  };
};

export const mockWebSocket = createMockWebSocket();

// ==================== WEB3 MOCK ====================

export const createMockWeb3 = () => {
  return {
    connect: vi.fn().mockResolvedValue({
      address: '0x1234567890abcdef1234567890abcdef12345678',
      chainId: 1,
    }),
    disconnect: vi.fn().mockResolvedValue(undefined),
    getBalance: vi.fn().mockResolvedValue('1000000000000000000'),
    sendTransaction: vi.fn().mockResolvedValue({
      hash: '0xabcdef1234567890',
    }),
    signMessage: vi.fn().mockResolvedValue('0xsignedmessage'),
    getTokenBalance: vi.fn().mockResolvedValue('100000000'),
  };
};

export const mockWeb3 = createMockWeb3();

// ==================== OPENAI MOCK ====================

export const createMockOpenAI = () => {
  return {
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [
            {
              message: {
                role: 'assistant',
                content: 'This is a mock AI response',
              },
            },
          ],
        }),
      },
    },
  };
};

export const mockOpenAI = createMockOpenAI();

// ==================== CONCIERGE AI MOCK ====================

export const createMockConciergeAI = () => {
  return {
    getResponse: vi.fn().mockResolvedValue({
      role: 'assistant',
      content: 'I can help you with that!',
    }),
    generateResponse: vi.fn().mockImplementation(async (messages) => {
      const lastMessage = messages[messages.length - 1];
      return {
        role: 'assistant',
        content: `Response to: ${lastMessage.content}`,
      };
    }),
  };
};

export const mockConciergeAI = createMockConciergeAI();

// ==================== TENSORFLOW MOCK ====================

export const createMockTensorFlow = () => {
  return {
    sequential: vi.fn().mockReturnValue({
      add: vi.fn().mockReturnThis(),
      compile: vi.fn().mockReturnThis(),
      fit: vi.fn().mockResolvedValue({}),
      predict: vi.fn().mockReturnValue({
        data: vi.fn().mockResolvedValue(new Float32Array([250])),
      }),
    }),
    tensor2d: vi.fn(),
    layers: {
      dense: vi.fn(),
    },
  };
};

export const mockTensorFlow = createMockTensorFlow();

// ==================== REACT ROUTER MOCK ====================

export const createMockRouter = () => {
  const navigate = vi.fn();
  const location = {
    pathname: '/',
    search: '',
    hash: '',
    state: null,
  };

  return {
    navigate,
    location,
    params: {},
    push: navigate,
    replace: navigate,
    goBack: vi.fn(),
    goForward: vi.fn(),
  };
};

export const mockRouter = createMockRouter();

// ==================== LOCAL STORAGE MOCK ====================

export const createMockLocalStorage = () => {
  const store: Record<string, string> = {};

  return {
    getItem: vi.fn().mockImplementation((key: string) => store[key] || null),
    setItem: vi.fn().mockImplementation((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn().mockImplementation((key: string) => {
      delete store[key];
    }),
    clear: vi.fn().mockImplementation(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
    getStore: () => store,
  };
};

export const mockLocalStorage = createMockLocalStorage();

// ==================== SESSION STORAGE MOCK ====================

export const createMockSessionStorage = () => {
  const store: Record<string, string> = {};

  return {
    getItem: vi.fn().mockImplementation((key: string) => store[key] || null),
    setItem: vi.fn().mockImplementation((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn().mockImplementation((key: string) => {
      delete store[key];
    }),
    clear: vi.fn().mockImplementation(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
    getStore: () => store,
  };
};

export const mockSessionStorage = createMockSessionStorage();

// ==================== MSW HANDLERS ====================

import { http, HttpResponse } from 'msw';

export const supabaseHandlers = [
  // Mock Supabase auth
  http.post('https://test.supabase.co/auth/v1/token', () => {
    return HttpResponse.json({
      access_token: 'mock-token',
      user: { id: 'user_123', email: 'test@example.com' },
    });
  }),

  // Mock Supabase database queries
  http.get('https://test.supabase.co/rest/v1/reservations_cache', () => {
    return HttpResponse.json([], {
      headers: {
        'content-range': '0-0/0',
      },
    });
  }),

  http.get('https://test.supabase.co/rest/v1/guesty_properties_cache', () => {
    return HttpResponse.json([], {
      headers: {
        'content-range': '0-0/0',
      },
    });
  }),
];

export const guestyHandlers = [
  // Mock Guesty listings
  http.get('*/functions/v1/guesty-beapi*', () => {
    return HttpResponse.json({
      results: [],
      pagination: { total: 0, limit: 10, offset: 0 },
    });
  }),

  // Mock Guesty reservations
  http.post('*/functions/v1/guesty-beapi*', () => {
    return HttpResponse.json({
      id: 'res_123',
      status: 'confirmed',
    });
  }),
];

export const stripeHandlers = [
  // Mock Stripe payment intent
  http.post('*/payment_intents', () => {
    return HttpResponse.json({
      id: 'pi_123',
      status: 'requires_payment_method',
      amount: 10000,
      currency: 'usd',
    });
  }),
];

export const conciergeHandlers = [
  // Mock concierge AI function
  http.post('*/functions/v1/concierge-ai', () => {
    return HttpResponse.json({
      message: 'This is a mock AI response',
    });
  }),
];

export const allHandlers = [
  ...supabaseHandlers,
  ...guestyHandlers,
  ...stripeHandlers,
  ...conciergeHandlers,
];

// ==================== MOCK SETUP HELPERS ====================

/**
 * Setup all mocks for tests
 */
export const setupMocks = () => {
  // Setup environment variables
  vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co');
  vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', 'anon-test-key');
  vi.stubEnv('VITE_GUESTY_API_KEY', 'test-key');
  vi.stubEnv('VITE_STRIPE_PUBLISHABLE_KEY', 'pk_test_key');

  // Setup localStorage and sessionStorage
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
  });
  Object.defineProperty(window, 'sessionStorage', {
    value: mockSessionStorage,
  });
};

/**
 * Reset all mocks after tests
 */
export const resetMocks = () => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
};

/**
 * Setup Supabase mock specifically
 */
export const mockSupabaseModule = () => {
  vi.mock('@/integrations/supabase/client', () => ({
    supabase: mockSupabaseClient,
  }));
};

/**
 * Setup Guesty mock specifically
 */
export const mockGuestyModule = () => {
  vi.mock('@/lib/guesty', () => ({
    guesty: mockGuestyClient,
  }));
};

/**
 * Setup Stripe mock specifically
 */
export const mockStripeModule = () => {
  vi.mock('@stripe/react-stripe-js', () => ({
    useStripe: () => mockStripe,
    useElements: () => ({
      getElement: vi.fn(),
    }),
    Elements: ({ children }: { children: unknown }) => children,
    CardElement: () => null,
  }));
};

// ==================== BEFORE/AFTER EACH HOOKS ====================

beforeEach(() => {
  setupMocks();
});

afterEach(() => {
  resetMocks();
});

// ==================== EXPORT ALL MOCKS ====================

export default {
  supabase: mockSupabaseClient,
  guesty: mockGuestyClient,
  stripe: mockStripe,
  websocket: mockWebSocket,
  web3: mockWeb3,
  openai: mockOpenAI,
  conciergeAI: mockConciergeAI,
  tensorflow: mockTensorFlow,
  router: mockRouter,
  localStorage: mockLocalStorage,
  sessionStorage: mockSessionStorage,
  handlers: allHandlers,
  setup: setupMocks,
  reset: resetMocks,
};
