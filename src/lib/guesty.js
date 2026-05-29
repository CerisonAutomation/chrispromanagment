// src/lib/guesty.js — canonical Guesty Booking Engine client
// Calls the `guesty-beapi` edge function with an action-based protocol.
// Ported from the TS reference, cache subscriptions removed (no cache table).

import { supabase } from "@/integrations/supabase/client";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const BEAPI_URL = `${SUPABASE_URL}/functions/v1/guesty-beapi`;

export async function guestyFetch(action, getParams = {}, postBody = null) {
  const qs = new URLSearchParams({ action });
  for (const [k, v] of Object.entries(getParams)) {
    if (v != null && v !== "" && v !== false) qs.set(k, String(v));
  }
  const { data: { session } } = await supabase.auth.getSession();
  const bearer = session?.access_token || ANON_KEY;
  const init = {
    method: postBody ? "POST" : "GET",
    headers: {
      apikey: ANON_KEY,
      Authorization: `Bearer ${bearer}`,
      Accept: "application/json",
      ...(postBody ? { "Content-Type": "application/json" } : {}),
    },
    ...(postBody ? { body: JSON.stringify(postBody) } : {}),
  };
  const res = await fetch(`${BEAPI_URL}?${qs}`, init);
  if (!res.ok) {
    let msg = `Guesty error ${res.status}`;
    try { const j = await res.json(); msg = j.error || msg; } catch { /* noop */ }
    throw new Error(msg);
  }
  return res.json();
}

export const guesty = {
  listings:        (p = {}) => guestyFetch("listings", p),
  search:          (p = {}) => guestyFetch("search", p),
  listing:         (id) => guestyFetch("listing", { id }),
  calendar:        (id, from, to) => guestyFetch("calendar", { id, from, to }),
  cities:          (p = {}) => guestyFetch("cities", p),
  reservationMoney:(listingId, checkIn, checkOut, guestsCount, coupon) =>
    guestyFetch("reservation-money", { listingId, checkIn, checkOut, guestsCount, ...(coupon ? { coupon } : {}) }),
  paymentProvider: (id) => guestyFetch("payment-provider", { id }),
  createQuote:     (body) => guestyFetch("create-quote", {}, body),
  getQuote:        (id) => guestyFetch("get-quote", { id }),
  applyCoupon:     (id, couponCode) => guestyFetch("apply-coupon", { id }, { couponCode }),
  instantCharge:   (id, body) => guestyFetch("instant-charge", { id }, body),
  reservation:     (id) => guestyFetch("reservation", { id }),
  createReservation:(body) => guestyFetch("create-reservation", {}, body),
  pingToken:       () => guestyFetch("ping-token"),
  tokenStatus:     () => guestyFetch("token-status"),
  bootstrap:       () => guestyFetch("bootstrap"),
};

export { buildBreakdown, formatMoney, describeCancellationPolicy } from "./guestyPricing.js";
