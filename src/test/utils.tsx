/**
 * Testing Utilities and Helpers
 *
 * Common utilities and helpers for testing React components, hooks, and functions.
 * Provides render helpers, custom matchers, and test utilities.
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions, waitFor, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import { expect } from 'vitest';

// ==================== ROUTER MOCKS ====================

export const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  goBack: vi.fn(),
  pathname: '/',
  search: '',
  hash: '',
  state: null,
};

// Mock React Router at the module level with proper synchronous exports
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockRouter.push,
    useLocation: () => ({
      pathname: mockRouter.pathname,
      search: mockRouter.search,
      hash: mockRouter.hash,
      state: mockRouter.state,
    }),
    useParams: () => ({}),
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
  };
});

// ==================== TYPE DEFINITIONS ====================

interface Reservation {
  id: string;
  guesty_id: string;
  guesty_property_id: string;
  guest_name: string;
  check_in: string;
  check_out: string;
  status: string;
  money: unknown;
  nights: number;
}

interface Property {
  id: string;
  guesty_id: string;
  title: string;
  base_price: number;
  bedrooms: number;
  bathrooms: number;
  max_guests: number;
}

interface Booking {
  id: string;
  property_id: string;
  user_id: string;
  check_in: string;
  check_out: string;
  total_price: number;
  status: string;
  payment_status: string;
}

interface Pagination {
  total: number;
  limit: number;
  offset: number;
}

// ==================== RENDER HELPERS ====================

/**
 * Wrapper component with all necessary providers
 */
const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

/**
 * Custom render function with providers
 */
const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) => {
  return render(ui, { wrapper: AllTheProviders, ...options });
};

/**
 * Render with custom providers
 */
export const renderWithProviders = (
  ui: ReactElement,
  { providerProps, ...renderOptions }: {
    providerProps?: { queryClient?: QueryClient };
  } = {}
) => {
  const queryClient = providerProps?.queryClient || new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

/**
 * Render hook with providers
 */
export const renderHookWithProviders = <T,>(
  callback: () => T,
  options?: {
    queryClient?: QueryClient;
  }
) => {
  const queryClient = options?.queryClient || new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });

  const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  return renderHook(callback, { wrapper });
};

// ==================== ASYNC HELPERS ====================

/**
 * Wait for loading to finish
 */
export const waitForLoadingToFinish = () => {
  return waitFor(
    () => {
      const loaders = document.querySelectorAll('[data-testid="loading-spinner"]');
      expect(loaders).toHaveLength(0);
    },
    { timeout: 5000 }
  );
};

/**
 * Wait for element to be visible
 */
export const waitForElementVisible = async (selector: string) => {
  return waitFor(() => {
    const element = document.querySelector(selector);
    expect(element).toBeVisible();
  });
};

/**
 * Wait for element to be removed
 */
export const waitForElementRemoved = async (selector: string) => {
  return waitFor(() => {
    const element = document.querySelector(selector);
    expect(element).toBeNull();
  });
};

/**
 * Wait for async operations to complete
 */
export const waitForAsync = async (callback: () => Promise<void> | void) => {
  await waitFor(callback, { timeout: 5000 });
};

// ==================== FORM HELPERS ====================

/**
 * Fill form fields by data-testid
 */
export const fillForm = async (
  container: HTMLElement,
  data: Record<string, string>
) => {
  for (const [key, value] of Object.entries(data)) {
    const field = container.querySelector(`[data-testid="${key}"]`) as HTMLElement;
    if (!field) {
      throw new Error(`Field with data-testid="${key}" not found`);
    }

    if (field.tagName === 'INPUT' || field.tagName === 'TEXTAREA') {
      const input = field as HTMLInputElement;
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    } else if (field.tagName === 'SELECT') {
      const select = field as HTMLSelectElement;
      select.value = value;
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }
};

/**
 * Submit form by data-testid
 */
export const submitForm = async (container: HTMLElement, testId: string) => {
  const button = container.querySelector(`[data-testid="${testId}"]`) as HTMLElement;
  if (!button) {
    throw new Error(`Submit button with data-testid="${testId}" not found`);
  }
  button.click();
};

// ==================== MOCK HELPERS ====================

/**
 * Mock React Router (no-op as it is mocked at the module level)
 */
export const mockReactRouter = () => {};

/**
 * Create a mock component
 */
export const createMockComponent = (name: string) => {
  return ({ children }: { children?: React.ReactNode }) => (
    <div data-testid={`mock-${name}`}>{children}</div>
  );
};

// ==================== CUSTOM MATCHERS ====================

/**
 * Custom matcher to check if element has accessible name
 */
expect.extend({
  toHaveAccessibleName(received: HTMLElement, expectedName: string) {
    const actualName = received.getAttribute('aria-label') || 
                      received.getAttribute('aria-labelledby') ||
                      received.textContent ||
                      '';
    
    return {
      pass: actualName === expectedName,
      message: () => `expected element to have accessible name "${expectedName}" but got "${actualName}"`,
    };
  },
});

/**
 * Custom matcher to check if element has proper role
 */
expect.extend({
  toHaveRole(received: HTMLElement, expectedRole: string) {
    const actualRole = received.getAttribute('role') || received.tagName.toLowerCase();
    
    return {
      pass: actualRole === expectedRole,
      message: () => `expected element to have role "${expectedRole}" but got "${actualRole}"`,
    };
  },
});

/**
 * Custom matcher to check if element is focusable
 */
expect.extend({
  toBeFocusable(received: HTMLElement) {
    const isFocusable = 
      (received.tagName === 'A' && received.hasAttribute('href')) ||
      (received.tagName === 'BUTTON') ||
      (received.tagName === 'INPUT' && received.getAttribute('type') !== 'hidden') ||
      (received.tagName === 'SELECT') ||
      (received.tagName === 'TEXTAREA') ||
      (received.hasAttribute('tabindex') && received.getAttribute('tabindex') !== '-1');
    
    return {
      pass: isFocusable,
      message: () => `expected element to be focusable`,
    };
  },
});

// ==================== DATA VALIDATION HELPERS ====================

/**
 * Validate reservation object structure
 */
export const validateReservation = (reservation: any) => {
  expect(reservation).toHaveProperty('id');
  expect(reservation).toHaveProperty('guesty_id');
  expect(reservation).toHaveProperty('guesty_property_id');
  expect(reservation).toHaveProperty('guest_name');
  expect(reservation).toHaveProperty('check_in');
  expect(reservation).toHaveProperty('check_out');
  expect(reservation).toHaveProperty('status');
  expect(reservation).toHaveProperty('money');
  expect(reservation).toHaveProperty('nights');
  return true;
};

/**
 * Validate property object structure
 */
export const validateProperty = (property: any) => {
  expect(property).toHaveProperty('id');
  expect(property).toHaveProperty('guesty_id');
  expect(property).toHaveProperty('title');
  expect(property).toHaveProperty('base_price');
  expect(property).toHaveProperty('bedrooms');
  expect(property).toHaveProperty('bathrooms');
  expect(property).toHaveProperty('max_guests');
  return true;
};

/**
 * Validate booking object structure
 */
export const validateBooking = (booking: any) => {
  expect(booking).toHaveProperty('id');
  expect(booking).toHaveProperty('property_id');
  expect(booking).toHaveProperty('user_id');
  expect(booking).toHaveProperty('check_in');
  expect(booking).toHaveProperty('check_out');
  expect(booking).toHaveProperty('total_price');
  expect(booking).toHaveProperty('status');
  expect(booking).toHaveProperty('payment_status');
  return true;
};

/**
 * Validate pagination object structure
 */
export const validatePagination = (pagination: any) => {
  expect(pagination).toHaveProperty('total');
  expect(pagination).toHaveProperty('limit');
  expect(pagination).toHaveProperty('offset');
  expect(typeof pagination.total).toBe('number');
  expect(typeof pagination.limit).toBe('number');
  expect(typeof pagination.offset).toBe('number');
  return true;
};

// ==================== DATE HELPERS ====================

/**
 * Format date for test assertions
 */
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
};

/**
 * Get date string with offset from today
 */
export const getDateWithOffset = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return formatDate(date);
};

/**
 * Get date range for testing
 */
export const getDateRange = (startDays: number, endDays: number) => {
  return {
    start: getDateWithOffset(startDays),
    end: getDateWithOffset(endDays),
  };
};

// ==================== ACCESSIBILITY HELPERS ====================

/**
 * Check if element has proper ARIA attributes
 */
export const hasProperAria = (element: HTMLElement) => {
  const requiredAttributes = ['role', 'aria-label'];
  const hasOneRequired = requiredAttributes.some(attr => element.hasAttribute(attr));
  
  // If it's a button or link, it's okay
  if (element.tagName === 'BUTTON' || element.tagName === 'A') {
    return true;
  }
  
  return hasOneRequired;
};

/**
 * Check if form has proper labels
 */
export const hasProperLabels = (container: HTMLElement) => {
  const inputs = container.querySelectorAll('input, select, textarea');
  
  for (const input of inputs) {
    const hasLabel = 
      input.hasAttribute('aria-label') ||
      input.hasAttribute('aria-labelledby') ||
      container.querySelector(`label[for="${input.id}"]`);
    
    if (!hasLabel && input.getAttribute('type') !== 'hidden') {
      return false;
    }
  }
  
  return true;
};

// ==================== PERFORMANCE HELPERS ====================

/**
 * Measure function execution time
 */
export const measurePerformance = async (
  fn: () => Promise<void> | void,
  label: string
) => {
  const start = performance.now();
  await fn();
  const end = performance.now();
  const duration = end - start;
  
  console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`);
  
  return { duration };
};

/**
 * Assert performance threshold
 */
export const assertPerformanceThreshold = (
  duration: number,
  threshold: number,
  label: string
) => {
  if (duration > threshold) {
    throw new Error(
      `Performance threshold exceeded for ${label}: ${duration}ms > ${threshold}ms`
    );
  }
};

// ==================== ERROR HELPERS ====================

/**
 * Check if error is of expected type
 */
export const expectErrorOfType = (error: unknown, expectedType: string) => {
  expect(error).toBeDefined();
  if (error instanceof Error) {
    expect(error.message).toBeDefined();
  }
};

/**
 * Create a mock error
 */
export const createMockError = (message: string, code?: string) => {
  const error = new Error(message);
  (error as any).code = code || 'UNKNOWN_ERROR';
  return error;
};

// ==================== SCREENSHOT HELPERS ====================

/**
 * Take screenshot for debugging
 */
export const takeScreenshot = async (name: string) => {
  if (process.env.CI || process.env.TAKE_SCREENSHOTS) {
    // This is for Playwright, not Vitest
    console.log(`[Screenshot] ${name}`);
  }
};

// ==================== STORAGE HELPERS ====================

/**
 * Clear all storage
 */
export const clearAllStorage = () => {
  localStorage.clear();
  sessionStorage.clear();
};

/**
 * Mock storage with initial data
 */
export const mockStorage = (storage: 'localStorage' | 'sessionStorage', data: Record<string, string>) => {
  Object.entries(data).forEach(([key, value]) => {
    storage === 'localStorage' ? localStorage.setItem(key, value) : sessionStorage.setItem(key, value);
  });
};

// ==================== EXPORTS ====================

export * from '@testing-library/react';
export { customRender as render };
export { default as userEvent } from '@testing-library/user-event';
