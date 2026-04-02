// =============================================================================
// Guesty Booking Engine API — Integration Layer
//
// Handles communication with Guesty's Booking Engine API with:
// - Configurable API key from GUESTY_API_KEY env var
// - Response caching with configurable TTL
// - Automatic retry with exponential backoff
// - Seamless fallback to local SQLite database when Guesty is not configured
// - Mapping between Guesty data shapes and our local Property/Booking models
// =============================================================================

import { db } from "@/lib/db";
import type {
  GuestyListing,
  GuestyListingsResponse,
  GuestyCalendarResponse,
  GuestyCalendarDay,
  GuestyQuote,
  GuestyQuoteCreated,
  GuestyCreateQuoteBody,
  GuestyAcceptQuoteResponse,
  GuestyPaymentGatewaysResponse,
  GuestyReviewsResponse,
  GuestyListingsQuery,
  GuestyAvailabilityQuery,
  GuestyReviewsQuery,
  GuestyPropertyType,
  MappedProperty,
  MappedQuote,
  MappedAvailability,
  MappedReview,
  GuestyListingsResult,
  GuestyQuoteResult,
} from "@/lib/guesty-types";

// ---------------------------------------------------------------------------
// Simple in-memory cache
// ---------------------------------------------------------------------------

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class ResponseCache {
  private store = new Map<string, CacheEntry<unknown>>();
  private defaultTtlMs: number;

  constructor(defaultTtlMs = 60_000) {
    this.defaultTtlMs = defaultTtlMs;
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.data as T;
  }

  set<T>(key: string, data: T, ttlMs?: number): void {
    this.store.set(key, {
      data,
      expiresAt: Date.now() + (ttlMs ?? this.defaultTtlMs),
    });
  }

  invalidate(pattern?: string): void {
    if (!pattern) {
      this.store.clear();
      return;
    }
    for (const key of this.store.keys()) {
      if (key.startsWith(pattern)) {
        this.store.delete(key);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// GuestyAPI Class
// ---------------------------------------------------------------------------

export class GuestyAPI {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly maxRetries: number;
  private readonly cache: ResponseCache;
  private configured: boolean;

  constructor(options?: {
    apiKey?: string;
    baseUrl?: string;
    timeoutMs?: number;
    maxRetries?: number;
    cacheTtlMs?: number;
  }) {
    this.apiKey = options?.apiKey ?? process.env.GUESTY_API_KEY ?? "";
    this.baseUrl =
      options?.baseUrl ?? process.env.GUESTY_BASE_URL ?? "https://booking-api.guesty.com";
    this.timeoutMs = options?.timeoutMs ?? 15_000;
    this.maxRetries = options?.maxRetries ?? 3;
    this.cache = new ResponseCache(options?.cacheTtlMs ?? 60_000);
    this.configured = this.apiKey.length > 0;
  }

  // -------------------------------------------------------------------------
  // Public: Check if Guesty API is configured
  // -------------------------------------------------------------------------

  get isConfigured(): boolean {
    return this.configured;
  }

  // -------------------------------------------------------------------------
  // Public: Get Listings
  // -------------------------------------------------------------------------

  async getListings(query: GuestyListingsQuery = {}): Promise<GuestyListingsResult> {
    if (this.configured) {
      return this.getGuestyListings(query);
    }
    return this.getLocalListings(query);
  }

  // -------------------------------------------------------------------------
  // Public: Get Single Listing
  // -------------------------------------------------------------------------

  async getListing(id: string): Promise<MappedProperty> {
    if (this.configured) {
      return this.getGuestyListing(id);
    }
    return this.getLocalListing(id);
  }

  // -------------------------------------------------------------------------
  // Public: Get Availability / Calendar
  // -------------------------------------------------------------------------

  async getAvailability(
    listingId: string,
    query: GuestyAvailabilityQuery = {}
  ): Promise<MappedAvailability> {
    if (this.configured) {
      return this.getGuestyAvailability(listingId, query);
    }
    return this.getLocalAvailability(listingId, query);
  }

  // -------------------------------------------------------------------------
  // Public: Create Quote
  // -------------------------------------------------------------------------

  async createQuote(body: GuestyCreateQuoteBody): Promise<GuestyQuoteResult> {
    if (this.configured) {
      return this.createGuestyQuote(body);
    }
    return this.createLocalQuote(body);
  }

  // -------------------------------------------------------------------------
  // Public: Get Quote
  // -------------------------------------------------------------------------

  async getQuote(id: string): Promise<GuestyQuoteResult> {
    if (this.configured) {
      return this.getGuestyQuote(id);
    }
    return this.getLocalQuote(id);
  }

  // -------------------------------------------------------------------------
  // Public: Accept Quote
  // -------------------------------------------------------------------------

  async acceptQuote(id: string): Promise<GuestyQuoteResult> {
    if (this.configured) {
      return this.acceptGuestyQuote(id);
    }
    return this.acceptLocalQuote(id);
  }

  // -------------------------------------------------------------------------
  // Public: Get Payment Gateways
  // -------------------------------------------------------------------------

  async getPaymentGateways(): Promise<GuestyPaymentGatewaysResponse> {
    if (this.configured) {
      const data = await this.fetchWithRetry<GuestyPaymentGatewaysResponse>(
        "/application/payment-gateways",
        { ttlMs: 300_000 } // 5 min cache
      );
      return data;
    }
    // Local fallback — return a mock / placeholder
    return {
      gateways: [
        {
          id: "local-stripe",
          type: "stripe",
          name: "Credit / Debit Card",
          isActive: true,
          currencies: ["EUR"],
        },
        {
          id: "local-bank",
          type: "bank_transfer",
          name: "Bank Transfer",
          isActive: true,
          currencies: ["EUR"],
        },
      ],
    };
  }

  // -------------------------------------------------------------------------
  // Public: Get Reviews
  // -------------------------------------------------------------------------

  async getReviews(
    listingId: string,
    query: GuestyReviewsQuery = {}
  ): Promise<{ results: MappedReview[]; count: number; average: number; page: number; limit: number; totalPages: number; source: "guesty" | "local" }> {
    if (this.configured) {
      return this.getGuestyReviews(listingId, query);
    }
    return this.getLocalReviews(listingId, query);
  }

  // =========================================================================
  // PRIVATE — Guesty API Calls
  // =========================================================================

  private async fetchWithRetry<T>(
    path: string,
    options?: {
      method?: string;
      body?: unknown;
      ttlMs?: number;
      noCache?: boolean;
    }
  ): Promise<T> {
    const { method = "GET", body, ttlMs, noCache = false } = options ?? {};

    // Check cache first for GET requests
    const cacheKey = `${method}:${path}:${body ? JSON.stringify(body) : ""}`;
    if (method === "GET" && !noCache) {
      const cached = this.cache.get<T>(cacheKey);
      if (cached) return cached;
    }

    const url = `${this.baseUrl}${path}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const fetchOptions: RequestInit = {
          method,
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          signal: controller.signal,
        };

        if (body && method !== "GET") {
          fetchOptions.body = JSON.stringify(body);
        }

        const response = await fetch(url, fetchOptions);

        if (!response.ok) {
          const errorBody = await response.text().catch(() => "");
          const error = new Error(
            `Guesty API error ${response.status}: ${errorBody || response.statusText}`
          );
          (error as Error & { status: number }).status = response.status;

          // Don't retry on 4xx client errors (except 429)
          if (response.status >= 400 && response.status < 500 && response.status !== 429) {
            throw error;
          }

          lastError = error;

          // Exponential backoff: 1s, 2s, 4s
          if (attempt < this.maxRetries) {
            await this.sleep(1000 * Math.pow(2, attempt));
            continue;
          }

          throw error;
        }

        const data: T = await response.json();

        // Cache successful GET responses
        if (method === "GET" && !noCache) {
          this.cache.set(cacheKey, data, ttlMs);
        }

        return data;
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          lastError = new Error(`Guesty API request timed out after ${this.timeoutMs}ms`);
        } else {
          lastError = error as Error;
        }

        if (attempt < this.maxRetries) {
          await this.sleep(1000 * Math.pow(2, attempt));
        }
      }
    }

    throw lastError ?? new Error("Guesty API request failed after retries");
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // --- Guesty Listings ---

  private async getGuestyListings(query: GuestyListingsQuery): Promise<GuestyListingsResult> {
    const params = new URLSearchParams();
    if (query.location) params.set("location", query.location);
    if (query.minPrice !== undefined) params.set("minPrice", String(query.minPrice));
    if (query.maxPrice !== undefined) params.set("maxPrice", String(query.maxPrice));
    if (query.checkIn) params.set("checkIn", query.checkIn);
    if (query.checkOut) params.set("checkOut", query.checkOut);
    if (query.guests !== undefined) params.set("guests", String(query.guests));
    if (query.page !== undefined) params.set("page", String(query.page));
    if (query.limit !== undefined) params.set("limit", String(query.limit));
    if (query.propertyType) params.set("propertyType", query.propertyType);
    if (query.bedrooms !== undefined) params.set("bedrooms", String(query.bedrooms));
    if (query.amenities?.length) params.set("amenities", query.amenities.join(","));

    const qs = params.toString();
    const path = `/application/listings${qs ? `?${qs}` : ""}`;

    const data = await this.fetchWithRetry<GuestyListingsResponse>(path, {
      ttlMs: 30_000,
    });

    return {
      listings: data.results.map(mapGuestyListingToProperty),
      count: data.count,
      page: data.page,
      limit: data.limit,
      totalPages: data.totalPages,
      source: "guesty",
    };
  }

  private async getGuestyListing(id: string): Promise<MappedProperty> {
    const data = await this.fetchWithRetry<GuestyListing>(
      `/application/listings/${id}`,
      { ttlMs: 60_000 }
    );
    return mapGuestyListingToProperty(data);
  }

  // --- Guesty Availability ---

  private async getGuestyAvailability(
    listingId: string,
    query: GuestyAvailabilityQuery
  ): Promise<MappedAvailability> {
    const params = new URLSearchParams();
    if (query.from) params.set("from", query.from);
    if (query.to) params.set("to", query.to);

    const qs = params.toString();
    const path = `/application/listings/${listingId}/calendar${qs ? `?${qs}` : ""}`;

    const data = await this.fetchWithRetry<GuestyCalendarResponse>(path, {
      ttlMs: 10_000,
    });

    return {
      listingId: data.listingId,
      days: data.days.map((d: GuestyCalendarDay) => ({
        date: d.date,
        status: d.status,
        note: d.note,
      })),
      range: data.range,
      source: "guesty",
    };
  }

  // --- Guesty Quotes ---

  private async createGuestyQuote(body: GuestyCreateQuoteBody): Promise<GuestyQuoteResult> {
    const data = await this.fetchWithRetry<GuestyQuoteCreated>(
      `/application/listings/${body.listingId}/quotes`,
      {
        method: "POST",
        body,
        noCache: true,
      }
    );

    return {
      quote: mapGuestyQuote(data),
      paymentUrl: data.paymentUrl,
      source: "guesty",
    };
  }

  private async getGuestyQuote(id: string): Promise<GuestyQuoteResult> {
    const data = await this.fetchWithRetry<GuestyQuote>(
      `/application/listings/quotes/${id}`,
      { ttlMs: 5_000 }
    );
    return {
      quote: mapGuestyQuote(data),
      source: "guesty",
    };
  }

  private async acceptGuestyQuote(id: string): Promise<GuestyQuoteResult> {
    const data = await this.fetchWithRetry<GuestyAcceptQuoteResponse>(
      `/application/listings/quotes/${id}/accept`,
      {
        method: "POST",
        noCache: true,
      }
    );
    return {
      quote: mapGuestyQuote(data.quote),
      paymentUrl: data.paymentUrl,
      source: "guesty",
    };
  }

  // --- Guesty Reviews ---

  private async getGuestyReviews(
    listingId: string,
    query: GuestyReviewsQuery
  ): Promise<{ results: MappedReview[]; count: number; average: number; page: number; limit: number; totalPages: number; source: "guesty" | "local" }> {
    const params = new URLSearchParams();
    if (query.page !== undefined) params.set("page", String(query.page));
    if (query.limit !== undefined) params.set("limit", String(query.limit));

    const qs = params.toString();
    const path = `/application/listings/${listingId}/reviews${qs ? `?${qs}` : ""}`;

    const data = await this.fetchWithRetry<GuestyReviewsResponse>(path, {
      ttlMs: 60_000,
    });

    return {
      results: data.results.map(mapGuestyReview),
      count: data.count,
      average: data.average,
      page: data.page,
      limit: data.limit,
      totalPages: data.totalPages,
      source: "guesty",
    };
  }

  // =========================================================================
  // PRIVATE — Local Database Fallback
  // =========================================================================

  // --- Local Listings ---

  private async getLocalListings(query: GuestyListingsQuery): Promise<GuestyListingsResult> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: Record<string, unknown> = { active: true };

    if (query.location) {
      where.OR = [
        { city: { contains: query.location } },
        { location: { contains: query.location } },
        { address: { contains: query.location } },
      ];
    }
    if (query.guests !== undefined) {
      where.maxGuests = { gte: query.guests };
    }
    if (query.minPrice !== undefined) {
      where.basePrice = { ...(where.basePrice as Record<string, unknown> ?? {}), gte: query.minPrice };
    }
    if (query.maxPrice !== undefined) {
      where.basePrice = { ...(where.basePrice as Record<string, unknown> ?? {}), lte: query.maxPrice };
    }
    if (query.bedrooms !== undefined) {
      where.bedrooms = { gte: query.bedrooms };
    }

    const [properties, totalCount] = await Promise.all([
      db.property.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.property.count({ where }),
    ]);

    // Availability filter for date ranges
    let filtered = properties;
    if (query.checkIn && query.checkOut) {
      const overlappingBookings = await db.booking.findMany({
        where: {
          status: { in: ["pending", "confirmed"] },
          checkIn: { lt: query.checkOut },
          checkOut: { gt: query.checkIn },
        },
        select: { propertyId: true },
      });
      const bookedIds = [...new Set(overlappingBookings.map((b) => b.propertyId))];
      filtered = properties.filter((p) => !bookedIds.includes(p.id));
    }

    return {
      listings: filtered.map(mapLocalProperty),
      count: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      source: "local",
    };
  }

  private async getLocalListing(id: string): Promise<MappedProperty> {
    // Try by id first, then by slug
    let property = await db.property.findUnique({ where: { id } });
    if (!property) {
      property = await db.property.findUnique({ where: { slug: id } });
    }
    if (!property) {
      throw new Error("Property not found");
    }
    return mapLocalProperty(property);
  }

  // --- Local Availability ---

  private async getLocalAvailability(
    listingId: string,
    query: GuestyAvailabilityQuery
  ): Promise<MappedAvailability> {
    // Resolve property
    let property = await db.property.findUnique({ where: { id: listingId } });
    if (!property) {
      property = await db.property.findUnique({ where: { slug: listingId } });
    }
    if (!property) {
      throw new Error("Property not found");
    }

    // Default range: 90 days from today
    const from = query.from ? new Date(query.from) : new Date();
    const to = query.to ? new Date(query.to) : new Date(from.getTime() + 90 * 24 * 60 * 60 * 1000);

    // Get overlapping bookings
    const bookings = await db.booking.findMany({
      where: {
        propertyId: property.id,
        status: { in: ["pending", "confirmed"] },
        checkIn: { lt: to.toISOString() },
        checkOut: { gt: from.toISOString() },
      },
      select: { checkIn: true, checkOut: true },
    });

    // Build booked dates set
    const bookedDates = new Set<string>();
    for (const booking of bookings) {
      const start = new Date(booking.checkIn);
      const end = new Date(booking.checkOut);
      const current = new Date(start);
      while (current < end) {
        bookedDates.add(current.toISOString().split("T")[0]);
        current.setDate(current.getDate() + 1);
      }
    }

    // Build day-by-day calendar
    const days: MappedAvailability["days"] = [];
    const current = new Date(from);
    while (current < to) {
      const dateStr = current.toISOString().split("T")[0];
      const isBooked = bookedDates.has(dateStr);
      // Mark past dates as unavailable
      const isPast = current < new Date(new Date().toDateString());
      days.push({
        date: dateStr,
        status: isPast ? "unavailable" : isBooked ? "booked" : "available",
      });
      current.setDate(current.getDate() + 1);
    }

    return {
      listingId: property.id,
      days,
      range: {
        from: from.toISOString().split("T")[0],
        to: to.toISOString().split("T")[0],
      },
      source: "local",
    };
  }

  // --- Local Quotes ---

  private async createLocalQuote(body: GuestyCreateQuoteBody): Promise<GuestyQuoteResult> {
    const { listingId, checkIn, checkOut, guest } = body;

    // Resolve property
    let property = await db.property.findUnique({ where: { id: listingId } });
    if (!property) {
      property = await db.property.findUnique({ where: { slug: listingId } });
    }
    if (!property) {
      throw new Error("Property not found");
    }

    // Validate dates
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    if (checkOutDate <= checkInDate) {
      throw new Error("checkOut must be after checkIn");
    }

    const nights = Math.max(
      1,
      Math.round(
        (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
      )
    );

    if (nights < property.minStay) {
      throw new Error(`Minimum stay is ${property.minStay} nights`);
    }
    if (nights > property.maxStay) {
      throw new Error(`Maximum stay is ${property.maxStay} nights`);
    }

    const totalGuests =
      (guest.adults ?? 1) + (guest.children ?? 0) + (guest.infants ?? 0);
    if (totalGuests > property.maxGuests) {
      throw new Error(`Maximum ${property.maxGuests} guests allowed`);
    }

    // Check availability
    const overlapping = await db.booking.count({
      where: {
        propertyId: property.id,
        status: { in: ["pending", "confirmed"] },
        checkIn: { lt: checkOut },
        checkOut: { gt: checkIn },
      },
    });
    if (overlapping > 0) {
      throw new Error("Property is not available for the selected dates");
    }

    // Calculate pricing
    const rentalAmount = Math.round(nights * property.basePrice * 100) / 100;
    const cleaningFee = property.cleaningFee;
    const serviceFee = Math.round((rentalAmount + cleaningFee) * 0.12 * 100) / 100;
    const totalAmount = Math.round((rentalAmount + cleaningFee + serviceFee) * 100) / 100;

    // Generate unique confirmation code
    const confirmationCode = generateConfirmationCode();

    // Create booking record
    const booking = await db.booking.create({
      data: {
        confirmationCode,
        propertyId: property.id,
        propertyName: property.name,
        guestName: `${guest.firstName} ${guest.lastName}`.trim(),
        guestEmail: guest.email,
        guestPhone: guest.phone ?? "",
        checkIn,
        checkOut,
        nights,
        guests: guest.adults ?? 1,
        basePrice: rentalAmount,
        cleaningFee,
        serviceFee,
        totalPrice: totalAmount,
        currency: property.currency,
        status: "pending",
        source: body.source ?? "direct",
        specialRequests: body.notes ?? "",
      },
    });

    return {
      quote: {
        id: booking.id,
        externalId: booking.confirmationCode,
        status: "pending",
        listingId: property.id,
        checkIn,
        checkOut,
        guest: {
          firstName: guest.firstName,
          lastName: guest.lastName,
          email: guest.email,
          phone: guest.phone ?? "",
          adults: guest.adults ?? 1,
          children: guest.children ?? 0,
          infants: guest.infants ?? 0,
        },
        money: {
          rentalAmount,
          cleaningFee,
          serviceFee,
          hostPayout: Math.round((rentalAmount + cleaningFee) * 100) / 100,
          totalAmount,
          currency: property.currency,
        },
        source: body.source ?? "direct",
        notes: body.notes ?? "",
        createdAt: booking.createdAt.toISOString(),
        updatedAt: booking.updatedAt.toISOString(),
        sourceSystem: "local",
      },
      source: "local",
    };
  }

  private async getLocalQuote(id: string): Promise<GuestyQuoteResult> {
    let booking = await db.booking.findUnique({ where: { id } });
    if (!booking) {
      // Try by confirmation code
      booking = await db.booking.findUnique({ where: { confirmationCode: id } });
    }
    if (!booking) {
      throw new Error("Quote not found");
    }
    return {
      quote: mapLocalBookingToQuote(booking),
      source: "local",
    };
  }

  private async acceptLocalQuote(id: string): Promise<GuestyQuoteResult> {
    let booking = await db.booking.findUnique({ where: { id } });
    if (!booking) {
      booking = await db.booking.findUnique({ where: { confirmationCode: id } });
    }
    if (!booking) {
      throw new Error("Quote not found");
    }

    if (booking.status !== "pending") {
      throw new Error(`Quote cannot be accepted — current status: ${booking.status}`);
    }

    const updated = await db.booking.update({
      where: { id: booking.id },
      data: { status: "confirmed" },
    });

    return {
      quote: mapLocalBookingToQuote(updated),
      source: "local",
    };
  }

  // --- Local Reviews ---

  private async getLocalReviews(
    listingId: string,
    query: GuestyReviewsQuery
  ): Promise<{ results: MappedReview[]; count: number; average: number; page: number; limit: number; totalPages: number; source: "guesty" | "local" }> {
    let property = await db.property.findUnique({ where: { id: listingId } });
    if (!property) {
      property = await db.property.findUnique({ where: { slug: listingId } });
    }
    if (!property) {
      throw new Error("Property not found");
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    // Local DB has no separate reviews table, so we return a summary-based mock
    // This allows the frontend to work even without the Guesty API
    const results: MappedReview[] = [];

    // If the property has a rating, create a synthetic review
    if (property.rating > 0 && property.reviewCount > 0) {
      results.push({
        id: `${property.id}-summary`,
        listingId: property.id,
        author: { name: "Verified Guest" },
        rating: property.rating,
        title: "Excellent stay",
        content: `Based on ${property.reviewCount} verified reviews with an average rating of ${property.rating}/5.`,
        date: property.updatedAt.toISOString(),
        source: "local",
        sourceSystem: "local",
      });
    }

    return {
      results: results.slice((page - 1) * limit, page * limit),
      count: property.reviewCount,
      average: property.rating,
      page,
      limit,
      totalPages: 1,
      source: "local",
    };
  }
}

// =========================================================================
// Mapping Functions
// =========================================================================

function mapGuestyListingToProperty(listing: GuestyListing): MappedProperty {
  return {
    id: listing._id,
    externalId: listing.listingId,
    slug: slugify(listing.nickname || listing.title),
    title: listing.title,
    nickname: listing.nickname,
    description: listing.description,
    summary: listing.summary,
    propertyType: listing.propertyType,
    location: {
      city: listing.location.city,
      country: listing.location.country,
      address: listing.location.address,
      coordinates: listing.location.coordinates,
    },
    amenities: listing.amenities ?? [],
    images: (listing.images ?? []).map((img, index) => ({
      url: img.url,
      caption: img.caption,
      type: img.type,
      order: img.order ?? index,
    })),
    rates: {
      baseRate: listing.rates?.baseRate ?? 0,
      currency: listing.rates?.currency ?? "EUR",
      minimumStay: listing.rates?.minimumStay ?? { value: 2, type: "NIGHTS" },
      ratesPlan: listing.rates?.ratesPlan ?? [],
    },
    reviews: listing.reviews ?? [],
    houseRules: listing.houseRules ?? [],
    maxGuests: listing.maxGuests ?? 4,
    bedrooms: listing.bedrooms ?? 1,
    bathrooms: listing.bathrooms ?? 1,
    calendars: listing.calendars ?? [],
    status: listing.status,
    source: "guesty",
  };
}

function mapGuestyQuote(quote: GuestyQuote | GuestyQuoteCreated): MappedQuote {
  return {
    id: quote._id,
    externalId: quote.quoteId,
    status: quote.status,
    listingId: quote.listingId,
    checkIn: quote.checkIn,
    checkOut: quote.checkOut,
    guest: {
      firstName: quote.guest.firstName,
      lastName: quote.guest.lastName,
      email: quote.guest.email,
      phone: quote.guest.phone,
      adults: quote.guest.adults,
      children: quote.guest.children,
      infants: quote.guest.infants,
    },
    money: quote.money,
    source: quote.source,
    notes: quote.notes,
    createdAt: quote.createdAt,
    updatedAt: quote.updatedAt,
    sourceSystem: "guesty",
  };
}

function mapGuestyReview(review: GuestyReviewsResponse["results"][number]): MappedReview {
  return {
    id: review.id,
    listingId: review.listingId,
    author: review.author,
    rating: review.rating,
    title: review.title,
    content: review.content,
    date: review.date,
    response: review.response,
    source: review.source,
    sourceSystem: "guesty",
  };
}

// ---------------------------------------------------------------------------
// Local → Mapped Property
// ---------------------------------------------------------------------------

function parseJsonField<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function mapLocalProperty(property: {
  id: string;
  slug: string;
  name: string;
  type: string;
  description: string;
  location: string;
  city: string;
  address: string;
  latitude: string;
  longitude: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  basePrice: number;
  currency: string;
  cleaningFee: number;
  minStay: number;
  maxStay: number;
  checkInTime: string;
  checkOutTime: string;
  amenities: string;
  images: string;
  rating: number;
  reviewCount: number;
  featured: boolean;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}): MappedProperty {
  const rawAmenities = parseJsonField<string[]>(property.amenities, []);
  const rawImages = parseJsonField<string[]>(property.images, []);

  // Normalize property type to Guesty enum
  const normalizedType = normalizePropertyType(property.type);

  return {
    id: property.id,
    externalId: property.slug,
    slug: property.slug,
    title: property.name,
    nickname: property.name,
    description: property.description,
    summary: property.description.slice(0, 200),
    propertyType: normalizedType,
    location: {
      city: property.city,
      country: "Malta",
      address: property.address,
      coordinates: {
        lat: parseFloat(property.latitude) || 35.8992,
        lng: parseFloat(property.longitude) || 14.514,
      },
    },
    amenities: rawAmenities,
    images: rawImages.map((url, index) => ({
      url,
      type: "photo",
      order: index,
    })),
    rates: {
      baseRate: property.basePrice,
      currency: property.currency,
      minimumStay: { value: property.minStay, type: "NIGHTS" },
      ratesPlan: [],
    },
    reviews: [
      {
        score: property.rating,
        total: property.rating * property.reviewCount,
        count: property.reviewCount,
      },
    ],
    houseRules: [
      `Check-in from ${property.checkInTime}`,
      `Check-out by ${property.checkOutTime}`,
      "No smoking",
      "No parties or events",
    ],
    maxGuests: property.maxGuests,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    calendars: [
      {
        calendarId: property.id,
        source: "local",
        listingCalendarId: property.id,
        status: property.active ? "active" : "inactive",
      },
    ],
    status: property.active ? "active" : "inactive",
    source: "local",
  };
}

function mapLocalBookingToQuote(booking: {
  id: string;
  confirmationCode: string;
  propertyId: string;
  propertyName: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  basePrice: number;
  cleaningFee: number;
  serviceFee: number;
  totalPrice: number;
  currency: string;
  status: string;
  source: string;
  specialRequests: string;
  createdAt: Date;
  updatedAt: Date;
}): MappedQuote {
  // Parse guest name into first/last
  const nameParts = booking.guestName.trim().split(/\s+/);
  const firstName = nameParts[0] ?? "";
  const lastName = nameParts.slice(1).join(" ");

  return {
    id: booking.id,
    externalId: booking.confirmationCode,
    status: booking.status,
    listingId: booking.propertyId,
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    guest: {
      firstName,
      lastName,
      email: booking.guestEmail,
      phone: booking.guestPhone,
      adults: booking.guests,
      children: 0,
      infants: 0,
    },
    money: {
      rentalAmount: booking.basePrice,
      cleaningFee: booking.cleaningFee,
      serviceFee: booking.serviceFee,
      hostPayout: Math.round(
        (booking.basePrice + booking.cleaningFee) * 100
      ) / 100,
      totalAmount: booking.totalPrice,
      currency: booking.currency,
    },
    source: booking.source,
    notes: booking.specialRequests,
    createdAt: booking.createdAt.toISOString(),
    updatedAt: booking.updatedAt.toISOString(),
    sourceSystem: "local",
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function normalizePropertyType(type: string): GuestyPropertyType {
  const normalized = type.toLowerCase().replace(/[\s_-]+/g, "");
  const map: Record<string, GuestyPropertyType> = {
    apartment: "apartment",
    flat: "apartment",
    villa: "villa",
    house: "house",
    room: "room",
    bedroom: "room",
    condo: "condo",
    condominium: "condo",
    guestsuite: "guest_suite",
    suite: "guest_suite",
    eventspace: "house",
  };
  return map[normalized] ?? "apartment";
}

function generateConfirmationCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "CPM-";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

// ---------------------------------------------------------------------------
// Singleton Export
// ---------------------------------------------------------------------------

// Re-export singleton for use across server-side code
let _instance: GuestyAPI | null = null;

export function getGuestyAPI(): GuestyAPI {
  if (!_instance) {
    _instance = new GuestyAPI();
  }
  return _instance;
}

export default GuestyAPI;
