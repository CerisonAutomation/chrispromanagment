import { http, HttpResponse } from 'msw';

export const handlers = [
  // Mock Supabase Auth
  http.post('*/auth/v1/token', () => {
    return HttpResponse.json({
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      user: createMockUser(),
    });
  }),

  // Mock Supabase Database
  http.get('*/rest/v1/listings*', () => {
    return HttpResponse.json([createMockListing()]);
  }),

  // Mock Guesty API
  http.get('*/guesty/api/v1/listings', () => {
    return HttpResponse.json({ results: [createMockListing()] });
  }),

  // Mock Stripe Checkout
  http.post('*/stripe/v1/checkout/sessions', () => {
    return HttpResponse.json({ id: 'mock-session-id', url: 'https://checkout.stripe.com/mock' });
  }),
];

function createMockUser() {
  return {
    id: 'mock-user-id',
    email: 'test@example.com',
    role: 'authenticated',
  };
}

function createMockListing() {
  return {
    id: 'mock-listing-id',
    title: 'Mock Luxury Villa',
    price: 250,
    location: 'Malta',
    bedrooms: 3,
    bathrooms: 2,
  };
}
