# Guesty API Canonical Integration Guide

This project uses **Guesty Booking Engine API** for guest-facing search, availability, pricing, and booking. Open API is preserved as uploaded reference only and must not be used as a fallback for Booking Engine traffic.

## Canonical production decision

- **Guest booking source of truth:** Booking Engine API.
- **Token endpoint:** `https://booking.guesty.com/oauth2/token`.
- **API base:** `https://booking.guesty.com/api`.
- **OAuth grant:** `client_credentials`.
- **OAuth scope:** `booking_engine:api`.
- **Authorization header:** `Authorization: Bearer <access_token>`.
- **Hard rule:** never call `open-api.guesty.com` from the guest booking path and never retry Booking Engine failures against Open API.

## Token management implemented

The edge functions implement the supplied production pattern with Lovable Cloud storage instead of local files:

1. Check memory cache first.
2. Check `guesty_token_vault` second.
3. Treat the stored expiry as a **safe expiry**: 5 minutes before Guesty's real expiry.
4. Use a single in-flight token refresh promise to avoid thundering herd refreshes.
5. Log refresh success/error to `guesty_token_refresh_log`.
6. Respect `Retry-After` on token 429s and open a short circuit breaker before retrying.

## Traffic management implemented

- Paces upstream Booking Engine calls with a small in-process queue.
- Retries 429 responses with exponential backoff + jitter.
- Honors `Retry-After` when Guesty returns it.
- Refreshes token once on 401/403, then retries the original request once.
- Proxies upstream status codes to the frontend with JSON-safe error handling.

## Booking Engine endpoints from uploaded Postman collection

| Method | Canonical path | App action |
|---|---|---|
| GET | `/listings/:listingId` | `listing` |
| GET | `/listings/:listingId/calendar` | `calendar` |
| GET | `/listings` | `listings` |
| GET | `/listings/availability` | `search with checkIn/checkOut` |
| GET | `/listings/cities` | `cities` |
| POST | `/reservations` | `create-reservation` |
| GET | `/reservations/money` | `reservation-money` |


## Uploaded n8n eco-tax automation critique

Uploaded workflow: `Guesty – Daily Check-in Eco-Tax Automation`.

Nodes detected: Gmail Trigger, Code in JavaScript, Guesty – Get OAuth Token, Guesty – Fetch Reservation, Already Processed?, Compute Eco-Tax, Guesty – Send Guest Message, Guesty – Mark Eco-Tax Processed, Gmail – Label as Processed.

Production critique:

- The Gmail trigger/search concept is useful for reconciliation, but app logic should not depend on email parsing when Booking Engine APIs can provide canonical booking data.
- The workflow uses `open-api.guesty.com/oauth2/token` and Open API reservation endpoints. That is **not valid for this app's selected Booking Engine-only architecture**.
- Eco-tax logic can be rebuilt later against Booking Engine reservation data and Gmail send/read functions already connected in this app.

## Open API reference status

Open API collection uploaded: `GUESTY OPEN API` with 162 endpoints.

Open API is intentionally **inactive** because the owner selected “Booking Engine only”. Keep it as a reference for a future owner/admin integration only if separate Open API credentials are provided later.

Sample Open API reference endpoints, not active in runtime:

| Method | URL | Name |
|---|---|---|
| GET | `{{baseUrl}}/accounts/me` | accounts / me / Get account details of current user |
| PUT | `{{baseUrl}}/listings/:id/availability-settings` | listings / {id} / availability-settings / Update listings availability settings |
| GET | `{{baseUrl}}/listings/:id/custom-fields/:field_id` | listings / {id} / custom-fields / {field_id} / Get custom field-Listings |
| GET | `{{baseUrl}}/listings/:id/custom-fields` | listings / {id} / custom-fields / Get all listing's custom fields |
| PUT | `{{baseUrl}}/listings/:id/custom-fields` | listings / {id} / custom-fields / Update listing's Custom Fields |
| GET | `{{baseUrl}}/listings/:id?fields=<string>` | listings / {id} / Retrieve a listing |
| PUT | `{{baseUrl}}/listings/:id` | listings / {id} / Update a listing |
| DELETE | `{{baseUrl}}/listings/:id` | listings / {id} / Delete a listing |
| GET | `{{baseUrl}}/listings/cities` | listings / cities / List all cities |
| GET | `{{baseUrl}}/listings/tags` | listings / tags / List all tags |
| GET | `{{baseUrl}}/listings/{{id}}?fields=paymentProviderId&fields=<string>` | listings / {id}?fields=paymentProviderId / Retrieve a listing's paymentProviderId |
| DELETE | `{{baseUrl}}/listings/:listing_id/custom-fields/:field_id` | listings / {listing_id} / custom-fields / {field_id} / Delete listing's custom fields |
| GET | `{{baseUrl}}/listings?ids=<string>&nids=<string>&viewId=&q=&city=&active=true&pmsActive=true&integrationId=&listed=true&checkIn=<string>&checkOut=<string>&minOccupancy=<number>&ignoreFlexibleBlocks=false&tags=&fields=&sort=title&limit=25&skip=0` | listings / Retrieve all listings |
| POST | `{{baseUrl}}/listings` | listings / Create a listing |
| POST | `{{baseUrl}}/listings.csv` | listings.csv / Export as CSV |
| POST | `{{baseUrl}}/listings.email` | listings.email / Send results in email |
| POST | `{{baseUrl}}/reservations/:id/payments/:paymentId/refund` | reservations / {id} / payments / {paymentId} / refund / Refund an existing payment |
| PUT | `{{baseUrl}}/reservations/:id/payments/:paymentId` | reservations / {id} / payments / {paymentId} / Update or cancel a payment for reservation |
| POST | `{{baseUrl}}/reservations/:id/payments` | reservations / {id} / payments / Add a payment to reservation |
| POST | `{{baseUrl}}/reservations/:id/invoiceItems` | reservations / {id} / invoiceItems / Create new Invoice item |
| POST | `{{baseUrl}}/reservations/:id/approve` | reservations / {id} / approve / Approve a pending booking request |
| POST | `{{baseUrl}}/reservations/:id/decline` | reservations / {id} / decline / Decline a pending booking request |
| GET | `{{baseUrl}}/reservations/:id/custom-fields/:field_id` | reservations / {id} / custom-fields / {field_id} / Get custom field - Reservations |
| GET | `{{baseUrl}}/reservations/:id/custom-fields` | reservations / {id} / custom-fields / Retrieve all populated custom fields on an existing reservation. |
| PUT | `{{baseUrl}}/reservations/:id/custom-fields` | reservations / {id} / custom-fields / Update reservation's Custom Fields |
| GET | `{{baseUrl}}/reservations/:id?fields=<string>` | reservations / {id} / Retrieve a reservation |
| PUT | `{{baseUrl}}/reservations/:id` | reservations / {id} / Update a reservation |
| DELETE | `{{baseUrl}}/reservations/:reservation_id/custom-fields/:field_id` | reservations / {reservation_id} / custom-fields / {field_id} / Delete reservation's custom fields |
| GET | `{{baseUrl}}/reservations?viewId=<string>&filters=[object Object]&filters=[object Object]&fields=<string>&sort=<string>&limit=<integer>&skip=<integer>` | reservations / Search reservations |
| POST | `{{baseUrl}}/reservations` | reservations / Create a reservation |
| POST | `{{baseUrl}}/reservations.csv?filters=[object Object]&filters=[object Object]&fields=<string>&sort=<string>&limit=<integer>&skip=<integer>` | reservations.csv / Export as CSV |
| POST | `{{baseUrl}}/reservations.email?filters=[object Object]&filters=[object Object]&fields=<string>&sort=<string>&limit=<integer>&skip=<integer>` | reservations.email / Send results in email |
| GET | `{{baseUrl}}/availability-pricing/api/calendar/listings/:id?startDate=<string>&endDate=<string>&includeAllotment=<boolean>` | availability-pricing / api / calendar / listings / {id} / Retrieve the calendar for a single listing |
| PUT | `{{baseUrl}}/availability-pricing/api/calendar/listings/:id` | availability-pricing / api / calendar / listings / {id} / Update the calendar for a single listing |
| GET | `{{baseUrl}}/availability-pricing/api/calendar/listings?listingIds=<string>&startDate=<string>&endDate=<string>` | availability-pricing / api / calendar / listings / Retrieve calendars for multiple listings |


## Current runtime files

- `supabase/functions/guesty-beapi/index.ts` — Booking Engine BFF for the web app.
- `supabase/functions/guesty-token-refresh/index.ts` — proactive token cache warmer.
- `src/lib/guesty.js` — frontend client wrapper.
- `docs/guesty/reference/booking_engine_token_example.mjs` — canonical Node reference: token cache + 5-minute safety window + `withRetry` (exponential backoff + `Retry-After`) + `scheduleRequest` per-second pacing queue. The edge functions implement the same pattern server-side, backed by `guesty_token_vault` instead of a local file.

## Audit conclusion

Previous gaps were endpoint drift, missing action implementations, weak pacing, and ambiguous API-family boundaries. The upgraded implementation now follows the Booking Engine-only contract, preserves the uploaded references, and adds production retry/token behavior.
