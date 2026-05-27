// @ts-nocheck
import { http, HttpResponse } from 'msw';
import {
  reservationFixtures,
  propertyFixtures,
  userFixtures,
  bookingFixtures,
  supabaseApiFixtures,
  guestyApiFixtures,
  stripeApiFixtures,
} from '../fixtures';

export const handlers = [
  // ==================== SUPABASE AUTH ====================
  
  http.post('*/auth/v1/token', () => {
    return HttpResponse.json({
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      user: userFixtures.admin,
    });
  }),

  http.post('*/auth/v1/signup', () => {
    return HttpResponse.json({
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      user: userFixtures.guest,
    });
  }),

  http.post('*/auth/v1/logout', () => {
    return HttpResponse.json({ success: true });
  }),

  // ==================== SUPABASE DATABASE ====================

  http.get('*/rest/v1/reservations_cache', ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    
    let reservations = Object.values(reservationFixtures);
    if (status) {
      reservations = reservations.filter(r => r.status === status);
    }
    
    return HttpResponse.json(reservations, {
      headers: {
        'content-range': `0-${reservations.length - 1}/${reservations.length}`,
      },
    });
  }),

  http.post('*/rest/v1/reservations_cache', () => {
    return HttpResponse.json(reservationFixtures.confirmed);
  }),

  http.patch('*/rest/v1/reservations_cache*', () => {
    return HttpResponse.json({ ...reservationFixtures.confirmed, status: 'cancelled' });
  }),

  http.get('*/rest/v1/guesty_properties_cache', () => {
    return HttpResponse.json(Object.values(propertyFixtures), {
      headers: {
        'content-range': `0-${Object.values(propertyFixtures).length - 1}/${Object.values(propertyFixtures).length}`,
      },
    });
  }),

  http.get('*/rest/v1/users', () => {
    return HttpResponse.json(Object.values(userFixtures));
  }),

  http.get('*/rest/v1/bookings', () => {
    return HttpResponse.json(Object.values(bookingFixtures));
  }),

  // ==================== GUESTY API ====================

  http.get('*/functions/v1/guesty-beapi*', ({ request }) => {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');
    
    if (action === 'listings') {
      return HttpResponse.json(guestyApiFixtures.listingsResponse);
    }
    
    if (action === 'reservations') {
      return HttpResponse.json(guestyApiFixtures.reservationsResponse);
    }
    
    return HttpResponse.json({ results: [], pagination: { total: 0 } });
  }),

  http.post('*/functions/v1/guesty-beapi*', () => {
    return HttpResponse.json(guestyApiFixtures.createReservationResponse);
  }),

  // ==================== STRIPE ====================

  http.post('*/payment_intents', () => {
    return HttpResponse.json(stripeApiFixtures.paymentIntentSuccess);
  }),

  http.post('*/checkout/sessions', () => {
    return HttpResponse.json({
      id: 'mock-session-id',
      url: 'https://checkout.stripe.com/mock',
    });
  }),

  http.get('*/customers/*', () => {
    return HttpResponse.json(stripeApiFixtures.customerResponse);
  }),

  // ==================== CONCIERGE AI ====================

  http.post('*/functions/v1/concierge-ai', () => {
    return HttpResponse.json({
      message: 'I can help you with your booking inquiry. What would you like to know?',
      role: 'assistant',
    });
  }),

  // ==================== PRICING ENGINE ====================

  http.post('*/functions/v1/pricing-engine', () => {
    return HttpResponse.json({
      predicted_price: 350,
      occupancy_probability: 0.85,
      confidence: 0.9,
    });
  }),

  // ==================== WEBSOCKET ====================

  // WebSocket connections are typically handled differently,
  // but we can mock WebSocket upgrade requests if needed
  http.get('*/socket.io/*', () => {
    return HttpResponse.json({ success: true });
  }),

  // ==================== FALLBACK ====================

  http.all('*', () => {
    console.warn('[MSW] Unhandled request:', {
      method: 'ALL',
      url: '*',
    });
    return HttpResponse.json(
      { error: 'Mock not implemented for this endpoint' },
      { status: 404 }
    );
  }),
];
