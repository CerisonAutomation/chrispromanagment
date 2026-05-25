export const createMockUser = (overrides = {}) => ({
  id: 'mock-user-id',
  email: 'test@example.com',
  ...overrides,
});

export const createMockListing = (overrides = {}) => ({
  id: 'mock-listing-id',
  title: 'Mock Luxury Villa',
  price: 250,
  location: 'Malta',
  bedrooms: 3,
  bathrooms: 2,
  ...overrides,
});

export const createMockBooking = (overrides = {}) => ({
  id: 'mock-booking-id',
  listingId: 'mock-listing-id',
  userId: 'mock-user-id',
  checkIn: '2026-06-01',
  checkOut: '2026-06-07',
  guests: 4,
  total: 1500,
  ...overrides,
});
