-- ============================================================
-- Migration: CMS seed rows + listing availability calendar
-- ============================================================

-- ── listing_availability ─────────────────────────────────────
-- Blocked/booked date ranges per listing.
-- The Guesty sync job (or webhook) upserts rows here so
-- the frontend calendar can render without calling Guesty live.
CREATE TABLE IF NOT EXISTS listing_availability (
  id               BIGSERIAL PRIMARY KEY,
  "guestyListingId" TEXT NOT NULL REFERENCES guesty_listings("guestyListingId") ON DELETE CASCADE,
  start_date       DATE NOT NULL,
  end_date         DATE NOT NULL,
  status           TEXT NOT NULL DEFAULT 'booked'   -- 'booked' | 'blocked' | 'owner_block'
                     CHECK (status IN ('booked','blocked','owner_block')),
  reservation_id   TEXT,   -- optional link back to guesty_reservations
  note             TEXT,
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE ("guestyListingId", start_date)
);

CREATE INDEX IF NOT EXISTS idx_avail_listing   ON listing_availability("guestyListingId");
CREATE INDEX IF NOT EXISTS idx_avail_dates      ON listing_availability(start_date, end_date);

ALTER TABLE listing_availability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read availability" ON listing_availability FOR SELECT USING (true);

-- ── guesty_listings: add image_urls + description columns ────
ALTER TABLE guesty_listings
  ADD COLUMN IF NOT EXISTS image_urls    TEXT[]  DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS description   TEXT,
  ADD COLUMN IF NOT EXISTS "minNights"   INTEGER DEFAULT 2,
  ADD COLUMN IF NOT EXISTS tags          TEXT[]  DEFAULT '{}';

-- ── cms_content seed rows ────────────────────────────────────
-- Strategy: INSERT … ON CONFLICT DO NOTHING so re-running is safe.
-- section_key naming:  {page}__{block}
-- content is JSONB – shape is documented inline.

INSERT INTO cms_content (section_key, section_label, sort_order, is_visible, content)
VALUES

-- ── LANDING ──────────────────────────────────────────────────
(
  'landing__hero',
  'Landing – Hero',
  10,
  true,
  '{
    "badge":    "Now booking summer 2026 in Malta",
    "headline": "Luxury stays,",
    "headline_accent": "effortlessly managed.",
    "body":     "Boutique short-let properties across Malta, run by humans who care. Direct booking, real concierge, owners who actually sleep at night.",
    "cta_primary":   "Browse stays",
    "cta_secondary": "List your property"
  }'::jsonb
),
(
  'landing__features',
  'Landing – Feature Cards',
  20,
  true,
  '{
    "items": [
      { "icon": "Building2", "label": "Curated portfolio", "value": "Hand-picked villas" },
      { "icon": "MapPin",    "label": "Local team",        "value": "Based in Valletta" },
      { "icon": "ShieldCheck","label": "Real concierge",   "value": "Available 24/7"   }
    ]
  }'::jsonb
),
(
  'landing__testimonials',
  'Landing – Testimonials',
  30,
  true,
  '{
    "headline": "Guests love staying with us",
    "items": [
      {
        "quote": "Spotless apartment, great location, and the team sorted everything before we even asked. Best Malta trip we''ve had.",
        "author": "Sarah T.",
        "origin": "London"
      },
      {
        "quote": "Christiano''s team handled check-in at midnight with zero fuss. Would not stay anywhere else in Malta.",
        "author": "Marco B.",
        "origin": "Milan"
      },
      {
        "quote": "Beautiful penthouse, stunning views. The concierge even booked us a boat tour. Absolute 10/10.",
        "author": "Anna K.",
        "origin": "Berlin"
      }
    ]
  }'::jsonb
),
(
  'landing__stats',
  'Landing – Stats Bar',
  25,
  true,
  '{
    "items": [
      { "value": "50+",   "label": "Properties managed" },
      { "value": "98%",   "label": "Guest satisfaction" },
      { "value": "€2M+",  "label": "Owner payouts" },
      { "value": "4 yrs", "label": "In the market"    }
    ]
  }'::jsonb
),

-- ── BOOKING ───────────────────────────────────────────────────
(
  'booking__header',
  'Booking – Page Header',
  10,
  true,
  '{
    "headline":    "Find your stay",
    "subheadline": "Live availability from our managed Guesty portfolio.",
    "filter_label": "Filter by location"
  }'::jsonb
),
(
  'booking__trust_strip',
  'Booking – Trust Strip',
  20,
  true,
  '{
    "items": [
      "Direct booking – no platform fees",
      "Free cancellation up to 14 days",
      "Personal concierge included",
      "IBAN bank transfer or card"
    ]
  }'::jsonb
),
(
  'booking__empty_state',
  'Booking – Empty / Error State',
  30,
  true,
  '{
    "empty_title":  "No properties available right now",
    "empty_body":   "Our portfolio is fully booked for those dates. Try a different window or contact us directly.",
    "error_title":  "Live properties unavailable",
    "error_body":   "Make sure the Guesty edge function is deployed and credentials are configured."
  }'::jsonb
),

-- ── OWNERS ────────────────────────────────────────────────────
(
  'owners__hero',
  'Owners – Hero',
  10,
  true,
  '{
    "headline":        "List your property.",
    "headline_accent": "Keep your sanity.",
    "body":            "We handle Guesty sync, pricing, guest comms, cleaning, maintenance, owner statements — all of it. You get a real person on WhatsApp and monthly statements that actually balance."
  }'::jsonb
),
(
  'owners__bullets',
  'Owners – Value Proposition Bullets',
  20,
  true,
  '{
    "items": [
      "Multi-channel listing across Airbnb, Booking.com, direct",
      "Dynamic pricing with real Malta market data",
      "24/7 guest concierge in EN / MT / IT",
      "Transparent monthly statements + tax-ready exports"
    ]
  }'::jsonb
),
(
  'owners__form_header',
  'Owners – Callback Form Header',
  30,
  true,
  '{
    "title":       "Request a callback",
    "description": "Tell us about your property. No spam, ever.",
    "submit_cta":  "Send enquiry"
  }'::jsonb
),
(
  'owners__why_us',
  'Owners – Why Us Section',
  40,
  true,
  '{
    "headline": "Why owners choose Christiano",
    "items": [
      {
        "title": "You keep control",
        "body":  "Block dates, set minimum stays, review guest profiles — all from a clean owner dashboard."
      },
      {
        "title": "Transparent financials",
        "body":  "Monthly PDF statements, real-time payout tracker, and VAT-ready exports. No surprises."
      },
      {
        "title": "Full-service management",
        "body":  "Linen, cleaning, maintenance, key-hand, concierge — we cover the whole guest lifecycle."
      }
    ]
  }'::jsonb
),

-- ── LISTING DETAIL (shared across all /listing/:id pages) ─────
(
  'listing__detail_defaults',
  'Listing Detail – Default Copy',
  10,
  true,
  '{
    "check_in_label":   "Check-in",
    "check_out_label":  "Check-out",
    "guests_label":     "Guests",
    "book_cta":         "Request to book",
    "enquire_cta":      "Send enquiry",
    "per_night_label":  "/ night",
    "availability_title": "Availability",
    "amenities_title":    "Amenities",
    "description_title":  "About this property",
    "location_title":     "Location",
    "calendar_legend_booked":  "Booked",
    "calendar_legend_available": "Available",
    "min_nights_note":    "night minimum stay"
  }'::jsonb
)

ON CONFLICT (section_key) DO NOTHING;

-- ── RLS: public read on listing_availability already set above ─
-- Service-role writes are handled via the backend sync job (bypasses RLS).
