-- Guesty sync tables
-- Run: supabase db push OR apply via Supabase MCP

-- Listings cache
CREATE TABLE IF NOT EXISTS guesty_listings (
  id                  BIGSERIAL PRIMARY KEY,
  "guestyListingId"   TEXT NOT NULL UNIQUE,
  nickname            TEXT NOT NULL DEFAULT '',
  title               TEXT,
  active              BOOLEAN NOT NULL DEFAULT true,
  city                TEXT,
  country             TEXT,
  bedrooms            INTEGER,
  bathrooms           NUMERIC(4,1),
  accommodates        INTEGER,
  "basePrice"         NUMERIC(10,2),
  currency            TEXT DEFAULT 'EUR',
  "thumbnailUrl"      TEXT,
  amenities           TEXT[] DEFAULT '{}',
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Reservations cache
CREATE TABLE IF NOT EXISTS guesty_reservations (
  id                      BIGSERIAL PRIMARY KEY,
  "guestyReservationId"   TEXT NOT NULL UNIQUE,
  "guestyListingId"       TEXT NOT NULL,
  "guestName"             TEXT,
  "guestEmail"            TEXT,
  "checkIn"               TIMESTAMPTZ NOT NULL,
  "checkOut"              TIMESTAMPTZ NOT NULL,
  "nightsBooked"          INTEGER NOT NULL DEFAULT 1,
  "staysBooked"           INTEGER NOT NULL DEFAULT 1,
  "bookingDate"           TIMESTAMPTZ,
  status                  TEXT NOT NULL DEFAULT 'confirmed',
  "payoutAmount"          NUMERIC(10,2) NOT NULL DEFAULT 0,
  "ownerPayoutAmount"     NUMERIC(10,2),
  source                  TEXT,
  "confirmationCode"      TEXT,
  "rawPayload"            JSONB,
  updated_at              TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY ("guestyListingId") REFERENCES guesty_listings("guestyListingId") ON DELETE SET NULL
);

-- Webhook events log
CREATE TABLE IF NOT EXISTS guesty_webhook_events (
  id              BIGSERIAL PRIMARY KEY,
  event           TEXT NOT NULL,
  reservation_id  TEXT,
  listing_id      TEXT,
  status          TEXT,
  payload         JSONB,
  received_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_guesty_reservations_listing   ON guesty_reservations("guestyListingId");
CREATE INDEX IF NOT EXISTS idx_guesty_reservations_checkin   ON guesty_reservations("checkIn");
CREATE INDEX IF NOT EXISTS idx_guesty_reservations_status    ON guesty_reservations(status);
CREATE INDEX IF NOT EXISTS idx_guesty_webhook_event          ON guesty_webhook_events(event);
CREATE INDEX IF NOT EXISTS idx_guesty_webhook_received       ON guesty_webhook_events(received_at DESC);

-- RLS: listings are public read; reservations are private
ALTER TABLE guesty_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE guesty_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE guesty_webhook_events ENABLE ROW LEVEL SECURITY;

-- Public can read listings
CREATE POLICY "Public read listings" ON guesty_listings FOR SELECT USING (true);

-- Service role can do everything (bypasses RLS)
-- Authenticated users can only read their own reservations
CREATE POLICY "Auth read own reservations" ON guesty_reservations
  FOR SELECT USING ("guestEmail" = auth.jwt()->>'email');
