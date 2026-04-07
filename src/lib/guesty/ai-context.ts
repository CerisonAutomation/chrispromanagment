/**
 * @fileoverview Guesty Booking Engine API — complete AI context for Puck editor.
 * Inject GUESTY_AI_CONTEXT into PuckAIPanel system prompt so the AI can
 * generate GBE blocks with correct fields, endpoints, and data shapes.
 *
 * Source: https://booking-api-docs.guesty.com
 */

export const GUESTY_AI_CONTEXT = `
╔══════════════════════════════════════════════════════════════════╗
║  GUESTY BOOKING ENGINE (GBE) API — COMPLETE AI KNOWLEDGE BASE   ║
╚══════════════════════════════════════════════════════════════════╝

BASE URL : https://booking.guesty.com  ← ONLY correct base (NOT open-api.guesty.com)
AUTH     : Bearer token via OAuth2 client_credentials
TOKEN    : Cached in Upstash Redis under key 'guesty:be_api:access_token' (TTL = expires_in - 60s)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ALL ENDPOINTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. GET /api/listings
   List all booking engine listings. All params are optional.
   Params:
     limit (1–100, default 20), cursor (next page token)
     checkIn / checkOut (YYYY-MM-DD)     — filters to available listings only
     city, country, state, neighborhood
     numberOfBedrooms, numberOfBathrooms
     minOccupancy                        — minimum max guests
     propertyType: APARTMENT|HOUSE|VILLA|LOFT|CHALET|CONDOMINIUM|STUDIO|CABIN|BUNGALOW
     listingType: SINGLE | MTL
     roomType: PRIVATE_ROOM | ENTIRE_HOME_APT | SHARED_ROOM
     minPrice / maxPrice + currency (EUR/USD/GBP...)
     includeAmenities / excludeAmenities (comma-separated, e.g. PETS_ALLOWED,POOL,WIFI)
     petsAllowed, smokingAllowed, suitableForChildren, suitableForInfants (boolean)
     minLng, maxLng, minLat, maxLat      — geo bounding box
     tags[]                              — filter by listing tags
     kingBed, queenBed, doubleBed, singleBed, sofaBed, bunkBed, crib  (min quantity)
     fields (space-separated, add 'bedArrangements' for bed layout)
   Response: { results: Listing[], cursor?: string, count?: number }

2. GET /api/listings/{listingId}
   Single listing. Returns full Listing object.

3. GET /api/listings/{listingId}/calendar?from=YYYY-MM-DD&to=YYYY-MM-DD
   Day-by-day availability array.
   Per day: { date, minNights, isBaseMinNights, status, cta, ctd }
   status: 'available' | 'unavailable' | 'reserved' | 'booked'
   cta = closed to arrival | ctd = closed to departure

4. GET /api/listings/{listingId}/payment-provider
   Returns { publishableKey: string } — Stripe publishable key for this listing.
   REQUIRED before calling Stripe.js to tokenize a card.
   Card token MUST be pm_... (SCA) — tok_... (pre-SCA) is NOT supported.

5. GET /api/listings/{listingId}/payouts-schedule
   Payout schedule for the listing.

6. POST /api/reservations/quotes
   Create a price quote (MANDATORY before any reservation).
   Body: { listingId, checkInDateLocalized: 'YYYY-MM-DD', checkOutDateLocalized: 'YYYY-MM-DD', guestsCount: number, coupons?: string }
   Response: {
     _id (quoteId),
     createdAt, expiresAt,          ← must book before expiresAt
     rates: {
       ratePlans: [{
         ratePlan: { _id, name, cancellationPolicy[] },
         money: {
           farePaid: number,         ← GUEST-FACING TOTAL — use this for display
           hostPayout: number,       ← HOST PAYOUT — NEVER show to guests
           totalTaxes, totalFees, subTotal,
           invoiceItems: [{ type, title, amount, currency }]
         }
       }]
     }
   }

7. GET /api/reservations/quotes/{quoteId}
   Retrieve quote. Check expiresAt before booking.

8. POST /api/reservations/quotes/{quoteId}/instant
   Create INSTANT confirmed reservation.
   Body: {
     ratePlanId: string,   ← MUST be from quote.rates.ratePlans[n].ratePlan._id
     ccToken: 'pm_...',   ← Stripe SCA token ONLY (pm_... prefix)
     guest: { firstName, lastName, email, phone? }
   }
   Response: { _id, status: 'confirmed', platform: 'direct', confirmationCode, createdAt, guestId }

9. POST /api/reservations/quotes/{quoteId}/inquiry
   Create inquiry (non-instant, host must accept).
   Same body as instant endpoint.

10. POST /api/reservations/quotes/{quoteId}/instant-charge
    Instant reservation with payment charge verification step.

11. POST /api/reservations/quotes/{quoteId}/verify-charge
    Verify 3DS/SCA payment after instant-charge.

12. POST /api/reservations/quotes/{quoteId}/coupons
    Apply coupon: Body: { code: string }
    Returns updated quote with adjusted pricing.

13. GET /api/reviews?listingId={listingId}
    Guest reviews for a listing.

14. GET /api/cities
    All cities across all booking engine listings. Use for search dropdowns.

15. GET /api/upsell (Pilot)
    Upsell fees for inquiryId from quote.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 BOOKING FLOW (3 STEPS)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Step 1: POST /api/reservations/quotes
  → Get quoteId + ratePlans[0]._id + farePaid price + expiresAt

Step 2: GET /api/listings/{listingId}/payment-provider
  → Get Stripe publishableKey
  → Use Stripe.js: stripe.createPaymentMethod() → pm_... token

Step 3: POST /api/reservations/quotes/{quoteId}/instant
  → Body: { ratePlanId, ccToken: 'pm_...', guest }
  → Returns confirmationCode → redirect to /booking/confirmation?code=...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 PUCK BLOCK FIELD SCHEMAS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GuestyPropertySearch
  Required: none
  Fields: placeholder(text), showFilters(radio yes|no), maxResults(number 1–100)
  → API: GET /api/listings with user-entered search params
  → Also GET /api/cities for city dropdown

GuestyPropertyGrid
  Required: none (uses defaults)
  Fields:
    title(text), subtitle(text)
    columns(select: 2|3|4)
    showPrices(radio yes|no), showRatings(radio yes|no)
    limit(number 6–24)
    checkIn(text YYYY-MM-DD), checkOut(text YYYY-MM-DD)
    city(text), petsAllowed(radio yes|no)
  → API: GET /api/listings?limit=&city=&checkIn=&checkOut=&petsAllowed=

GuestyPropertyDetail
  Required: listingId
  Fields:
    listingId(text) ← REQUIRED
    showGallery(radio yes|no)
    showAmenities(radio yes|no)
    showCalendar(radio yes|no)
    showReviews(radio yes|no)
    calendarMonths(number 1–6)
  → API: GET /api/listings/{listingId}
  → API: GET /api/listings/{listingId}/calendar?from=&to=
  → API: GET /api/reviews?listingId=

GuestyBookingWidget
  Required: listingId, accountId
  Fields:
    listingId(text) ← REQUIRED — Guesty listing _id
    accountId(text) ← REQUIRED — Guesty account ID (use NEXT_PUBLIC_GUESTY_ACCOUNT_ID)
    widgetMode(select: iframe|sdk)
    primaryColor(text hex e.g. #c8a96a)
    locale(text: en|mt|de|fr|es|it)
    currency(select: EUR|USD|GBP|CAD|AUD)
    minNights(number 1–30)
    defaultGuests(number 1–20)
    title(text), subtitle(text), showTitle(radio yes|no)
  iframe URL: https://booking.guesty.com/{accountId}/{listingId}?locale=&currency=&guests=&minNights=&primaryColor=
  SDK: window.GBE.init({ containerId, listingId, accountId, locale, currency, primaryColor, minNights, defaultGuests })
  SDK script: https://booking.guesty.com/widget.js
  NOTE: window.GBE is GBE v2 global. window.GuestyBookingEngine is DEPRECATED — do not use.

GuestyBookingConfirmation
  Required: none
  Fields: title(text), showBreakdown(radio yes|no), showGuestDetails(radio yes|no)
  → Reads confirmationCode from URL search params
  → API: GET /api/reservations/quotes/{quoteId}

GuestyBookingDashboard
  Required: guest authentication
  Fields: title(text), showUpcoming(radio yes|no), showPast(radio yes|no), itemsPerPage(number)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 CRITICAL PRICE RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ DISPLAY TO GUESTS  : rates.ratePlans[0].money.farePaid
✅ NIGHTLY BREAKDOWN  : rates.ratePlans[0].money.invoiceItems (type=ACCOMMODATION_FARE)
✅ TAXES              : rates.ratePlans[0].money.totalTaxes
✅ FEES               : rates.ratePlans[0].money.totalFees
❌ NEVER SHOW GUESTS  : money.hostPayout (host revenue — internal only)
❌ NEVER SHOW GUESTS  : money.netAmount (net before fees)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 UPSTASH REDIS TOKEN PATTERN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Store : await redis.set('guesty:be_api:access_token', token, { ex: expires_in - 60 })
Read  : const token = await redis.get<string>('guesty:be_api:access_token')
Delete: await redis.del('guesty:be_api:access_token')  ← call on 401 before retry
Never : store tokens in process.env, module scope, or in-memory (serverless = stateless)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ENV VARS REQUIRED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GUESTY_CLIENT_ID               — Booking Engine API client ID
GUESTY_CLIENT_SECRET           — Booking Engine API client secret
NEXT_PUBLIC_GUESTY_ACCOUNT_ID  — Your Guesty account ID (public, for iframe URLs)
UPSTASH_REDIS_REST_URL         — Upstash Redis REST URL
UPSTASH_REDIS_REST_TOKEN       — Upstash Redis REST token
`;

/**
 * Returns the system prompt fragment to inject into PuckAIPanel.
 * Prepend this to your existing system prompt.
 */
export function buildGuestyAISystemPrompt(existingPrompt: string): string {
  return `${GUESTY_AI_CONTEXT}\n\n${existingPrompt}`;
}
