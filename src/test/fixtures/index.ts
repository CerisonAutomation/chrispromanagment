/**
 * Test Fixtures
 * 
 * Provides pre-configured test data and states for common test scenarios.
 * Fixtures are used to set up reliable, repeatable test environments.
 */

import {
  createReservation,
  createProperty,
  createUser,
  createBooking,
  createMessage,
  createPricingInput,
  createBlock,
  createTheme,
} from '../factories';

// ==================== DATABASE FIXTURES ====================

/**
 * Database fixture with sample reservations
 */
export const reservationFixtures = {
  confirmed: createReservation({ status: 'confirmed' }),
  cancelled: createReservation({ status: 'cancelled' }),
  inquiry: createReservation({ status: 'inquiry' }),
  reserved: createReservation({ status: 'reserved' }),
  closed: createReservation({ status: 'closed' }),
  recent: createReservation({
    check_in: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    check_out: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
  }),
  past: createReservation({
    check_in: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    check_out: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000),
    status: 'closed',
  }),
  highValue: createReservation({ money: 5000, currency: 'USD' }),
  lowValue: createReservation({ money: 150, currency: 'USD' }),
};

/**
 * Database fixture with sample properties
 */
export const propertyFixtures = {
  luxury: createProperty({
    title: 'Luxury Villa',
    base_price: 500,
    bedrooms: 5,
    bathrooms: 4,
    max_guests: 10,
  }),
  budget: createProperty({
    title: 'Budget Apartment',
    base_price: 50,
    bedrooms: 1,
    bathrooms: 1,
    max_guests: 2,
  }),
  family: createProperty({
    title: 'Family Home',
    base_price: 200,
    bedrooms: 3,
    bathrooms: 2,
    max_guests: 6,
  }),
  studio: createProperty({
    title: 'Cozy Studio',
    base_price: 80,
    bedrooms: 1,
    bathrooms: 1,
    max_guests: 2,
  }),
  active: createProperty({ status: 'active' }),
  inactive: createProperty({ status: 'inactive' }),
};

/**
 * Database fixture with sample users
 */
export const userFixtures = {
  admin: createUser({
    email: 'admin@example.com',
    full_name: 'Admin User',
    role: 'admin',
  }),
  host: createUser({
    email: 'host@example.com',
    full_name: 'Host User',
    role: 'host',
  }),
  guest: createUser({
    email: 'guest@example.com',
    full_name: 'Guest User',
    role: 'guest',
  }),
};

/**
 * Database fixture with sample bookings
 */
export const bookingFixtures = {
  pending: createBooking({ status: 'pending', payment_status: 'pending' }),
  confirmed: createBooking({ status: 'confirmed', payment_status: 'paid' }),
  cancelled: createBooking({ status: 'cancelled', payment_status: 'refunded' }),
  completed: createBooking({ status: 'completed', payment_status: 'paid' }),
  future: createBooking({
    check_in: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    check_out: new Date(Date.now() + 37 * 24 * 60 * 60 * 1000),
  }),
  current: createBooking({
    check_in: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    check_out: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
  }),
};

/**
 * Database fixture with sample messages
 */
export const messageFixtures = {
  userMessage: createMessage({ role: 'user', content: 'Hello, I need help' }),
  assistantMessage: createMessage({ 
    role: 'assistant', 
    content: 'How can I help you today?' 
  }),
  bookingInquiry: createMessage({
    role: 'user',
    content: 'I want to book a property',
    property_id: 'prop_123',
  }),
  pricingQuestion: createMessage({
    role: 'user',
    content: 'What are the prices for next month?',
  }),
};

/**
 * Database fixture with pricing inputs
 */
export const pricingInputFixtures = {
  lowSeason: createPricingInput({
    season: 'low',
    occupancy_rate: 0.3,
  }),
  mediumSeason: createPricingInput({
    season: 'medium',
    occupancy_rate: 0.6,
  }),
  highSeason: createPricingInput({
    season: 'high',
    occupancy_rate: 0.9,
  }),
  weekend: createPricingInput({
    day_of_week: 'weekend',
    occupancy_rate: 0.8,
  }),
  weekday: createPricingInput({
    day_of_week: 'weekday',
    occupancy_rate: 0.5,
  }),
};

/**
 * Database fixture with blocks
 */
export const blockFixtures = {
  hero: createBlock({
    type: 'hero',
    content: { title: 'Welcome', subtitle: 'Find your perfect stay' },
  }),
  text: createBlock({
    type: 'text',
    content: { text: 'Lorem ipsum dolor sit amet' },
  }),
  image: createBlock({
    type: 'image',
    content: { url: 'https://example.com/image.jpg', alt: 'Sample image' },
  }),
  carousel: createBlock({
    type: 'carousel',
    content: { images: ['img1.jpg', 'img2.jpg', 'img3.jpg'] },
  }),
  form: createBlock({
    type: 'form',
    content: { fields: ['name', 'email', 'message'] },
  }),
  map: createBlock({
    type: 'map',
    content: { location: { lat: 35.9375, lng: 14.3754 } },
  }),
};

/**
 * Database fixture with themes
 */
export const themeFixtures = {
  light: createTheme({
    name: 'Light Theme',
    primary_color: '#3b82f6',
    background_color: '#ffffff',
    text_color: '#1f2937',
  }),
  dark: createTheme({
    name: 'Dark Theme',
    primary_color: '#60a5fa',
    background_color: '#1f2937',
    text_color: '#f9fafb',
  }),
  ocean: createTheme({
    name: 'Ocean Theme',
    primary_color: '#0ea5e9',
    secondary_color: '#0369a1',
    accent_color: '#38bdf8',
    background_color: '#f0f9ff',
    text_color: '#0c4a6e',
  }),
  sunset: createTheme({
    name: 'Sunset Theme',
    primary_color: '#f97316',
    secondary_color: '#c2410c',
    accent_color: '#fb923c',
    background_color: '#fff7ed',
    text_color: '#7c2d12',
  }),
};

// ==================== COMPONENT FIXTURES ====================

/**
 * Component fixture for booking form state
 */
export const bookingFormFixture = {
  initial: {
    checkIn: null,
    checkOut: null,
    guests: 2,
    propertyId: null,
    guestName: '',
    guestEmail: '',
    totalPrice: 0,
  },
  partial: {
    checkIn: '2024-01-01',
    checkOut: null,
    guests: 2,
    propertyId: 'prop_123',
    guestName: '',
    guestEmail: '',
    totalPrice: 0,
  },
  complete: {
    checkIn: '2024-01-01',
    checkOut: '2024-01-07',
    guests: 4,
    propertyId: 'prop_123',
    guestName: 'John Doe',
    guestEmail: 'john@example.com',
    totalPrice: 1000,
  },
};

/**
 * Component fixture for search widget state
 */
export const searchWidgetFixture = {
  initial: {
    location: '',
    checkIn: null,
    checkOut: null,
    guests: 1,
    priceRange: [0, 1000],
    amenities: [],
  },
  withFilters: {
    location: 'Malta',
    checkIn: '2024-01-01',
    checkOut: '2024-01-07',
    guests: 4,
    priceRange: [100, 500],
    amenities: ['WiFi', 'Pool', 'Air Conditioning'],
  },
};

/**
 * Component fixture for admin panel state
 */
export const adminPanelFixture = {
  dashboard: {
    activeTab: 'dashboard',
    selectedProperty: null,
    dateRange: { start: null, end: null },
  },
  listings: {
    activeTab: 'listings',
    selectedProperty: 'prop_123',
    filters: { status: 'active' },
  },
  bookings: {
    activeTab: 'bookings',
    filters: { status: 'confirmed' },
    dateRange: { start: '2024-01-01', end: '2024-12-31' },
  },
};

/**
 * Component fixture for CMS editor state
 */
export const cmsEditorFixture = {
  initial: {
    pageId: null,
    blocks: [],
    selectedBlock: null,
    isPreview: false,
  },
  withBlocks: {
    pageId: 'page_123',
    blocks: [blockFixtures.hero, blockFixtures.text, blockFixtures.image],
    selectedBlock: null,
    isPreview: false,
  },
  previewMode: {
    pageId: 'page_123',
    blocks: [blockFixtures.hero, blockFixtures.text],
    selectedBlock: null,
    isPreview: true,
  },
};

/**
 * Component fixture for chat state
 */
export const chatFixture = {
  initial: {
    messages: [],
    isTyping: false,
    propertyId: null,
    bookingContext: null,
  },
  withMessages: {
    messages: [messageFixtures.userMessage, messageFixtures.assistantMessage],
    isTyping: false,
    propertyId: 'prop_123',
    bookingContext: null,
  },
  typing: {
    messages: [messageFixtures.userMessage],
    isTyping: true,
    propertyId: 'prop_123',
    bookingContext: null,
  },
};

// ==================== API FIXTURES ====================

/**
 * API fixture for Supabase responses
 */
export const supabaseApiFixtures = {
  successResponse: {
    data: { id: '123', name: 'Test' },
    error: null,
  },
  errorResponse: {
    data: null,
    error: { message: 'Database error', code: 'PGRST116' },
  },
  authSuccess: {
    data: {
      user: { id: 'user_123', email: 'test@example.com' },
      session: { access_token: 'token_123' },
    },
    error: null,
  },
  authError: {
    data: { user: null, session: null },
    error: { message: 'Invalid credentials' },
  },
};

/**
 * API fixture for Guesty responses
 */
export const guestyApiFixtures = {
  listingsResponse: {
    results: [propertyFixtures.luxury, propertyFixtures.budget],
    pagination: { total: 2, limit: 10, offset: 0 },
  },
  reservationsResponse: {
    results: [reservationFixtures.confirmed, reservationFixtures.pending],
    pagination: { total: 2, limit: 10, offset: 0 },
  },
  createReservationResponse: {
    id: 'res_123',
    status: 'confirmed',
    money: 500,
  },
  errorResponse: {
    error: 'Rate limit exceeded',
    status: 429,
  },
};

/**
 * API fixture for Stripe responses
 */
export const stripeApiFixtures = {
  paymentIntentSuccess: {
    id: 'pi_123',
    status: 'succeeded',
    amount: 10000,
    currency: 'usd',
  },
  paymentIntentPending: {
    id: 'pi_123',
    status: 'processing',
    amount: 10000,
    currency: 'usd',
  },
  paymentIntentFailed: {
    id: 'pi_123',
    status: 'requires_payment_method',
    amount: 10000,
    currency: 'usd',
  },
  customerResponse: {
    id: 'cus_123',
    email: 'customer@example.com',
    name: 'John Doe',
  },
};

// ==================== COMBINED FIXTURES ====================

/**
 * Complete booking flow fixture
 */
export const bookingFlowFixture = {
  property: propertyFixtures.luxury,
  user: userFixtures.guest,
  booking: bookingFixtures.confirmed,
  reservation: reservationFixtures.confirmed,
  payment: stripeApiFixtures.paymentIntentSuccess,
};

/**
 * Complete authentication flow fixture
 */
export const authFlowFixture = {
  user: userFixtures.admin,
  session: supabaseApiFixtures.authSuccess,
  token: 'jwt_token_123',
};

/**
 * Complete AI generation flow fixture
 */
export const aiFlowFixture = {
  messages: [messageFixtures.userMessage],
  pricingInput: pricingInputFixtures.highSeason,
  aiResponse: messageFixtures.assistantMessage,
  prediction: {
    price: 350,
    occupancy_probability: 0.85,
  },
};

/**
 * Complete page builder flow fixture
 */
export const pageBuilderFixture = {
  page: {
    id: 'page_123',
    title: 'Welcome Page',
    slug: 'welcome',
    blocks: [blockFixtures.hero, blockFixtures.text, blockFixtures.carousel],
    theme: themeFixtures.light,
  },
  editorState: cmsEditorFixture.withBlocks,
  savedBlock: blockFixtures.hero,
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Get all fixtures of a specific type
 */
export const getAllReservations = () => Object.values(reservationFixtures);
export const getAllProperties = () => Object.values(propertyFixtures);
export const getAllUsers = () => Object.values(userFixtures);
export const getAllBookings = () => Object.values(bookingFixtures);
export const getAllMessages = () => Object.values(messageFixtures);
export const getAllPricingInputs = () => Object.values(pricingInputFixtures);
export const getAllBlocks = () => Object.values(blockFixtures);
export const getAllThemes = () => Object.values(themeFixtures);

/**
 * Create a custom fixture set
 */
export const createCustomFixture = <T extends Record<string, any>>(
  baseFixture: T,
  overrides: Partial<T>
) => {
  return { ...baseFixture, ...overrides };
};

/**
 * Reset all fixtures to their initial state
 */
export const resetFixtures = () => {
  // Fixtures are static, but this function can be used
  // to reset any dynamic fixture state in the future
};
