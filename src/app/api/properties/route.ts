import {db} from "@/lib/db";
import {properties, bookings} from "@/lib/db/schema";
import {NextRequest, NextResponse} from "next/server";
import {createApiError, createRequestLogger, ErrorCodes} from "@/lib/error";
import {eq, and, gte, lte, like, or, desc, notInArray} from "drizzle-orm";

// ============================================================
// Helper functions
// ============================================================

function parseJsonField<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function formatProperty(property: Record<string, unknown>) {
  return {
    ...property,
    amenities: parseJsonField<string[]>(property.amenities as string, []),
    images: parseJsonField<string[]>(property.images as string, []),
  };
}

const VALID_TYPES = ['apartment', 'villa', 'event_space'];

// ============================================================
// GET handler
// ============================================================

export async function GET(request: NextRequest) {
  const log = createRequestLogger(`properties-get-${Date.now()}`);

  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city");
    const minGuests = searchParams.get("minGuests");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const type = searchParams.get("type");
    const bedrooms = searchParams.get("bedrooms");
    const checkIn = searchParams.get("checkIn");
    const checkOut = searchParams.get("checkOut");
    const featured = searchParams.get("featured");
    const search = searchParams.get("search");

    // Build conditions array for Drizzle
    const conditions = [eq(properties.active, true)];

    if (city) {
      conditions.push(eq(properties.city, city));
    }

    if (minGuests) {
      const parsed = parseInt(minGuests, 10);
      if (!isNaN(parsed)) {
        conditions.push(gte(properties.maxGuests, parsed));
      }
    }

    if (minPrice) {
      const parsed = parseFloat(minPrice);
      if (!isNaN(parsed)) {
        conditions.push(gte(properties.basePrice, parsed));
      }
    }

    if (maxPrice) {
      const parsed = parseFloat(maxPrice);
      if (!isNaN(parsed)) {
        conditions.push(lte(properties.basePrice, parsed));
      }
    }

    if (type) {
      if (!VALID_TYPES.includes(type)) {
        return NextResponse.json(
            createApiError("Invalid property type", ErrorCodes.VALIDATION_ERROR, {validTypes: VALID_TYPES}),
            {status: 400}
        );
      }
      conditions.push(eq(properties.type, type));
    }

    if (bedrooms) {
      const parsed = parseInt(bedrooms, 10);
      if (!isNaN(parsed)) {
        conditions.push(gte(properties.bedrooms, parsed));
      }
    }

    if (featured === "true") {
      conditions.push(eq(properties.featured, true));
    }

    if (search) {
      conditions.push(or(
        like(properties.name, `%${search}%`),
        like(properties.location, `%${search}%`),
        like(properties.city, `%${search}%`),
        like(properties.description, `%${search}%`)
      ) as ReturnType<typeof eq>);
    }

    // Availability filter
    let excludePropertyIds: string[] = [];
    if (checkIn && checkOut) {
      const overlappingBookings = await db.query.bookings.findMany({
        where: and(
          or(eq(bookings.status, "pending"), eq(bookings.status, "confirmed")),
          eq(bookings.checkIn, checkOut),
          eq(bookings.checkOut, checkIn)
        ),
        columns: { propertyId: true },
      });

      excludePropertyIds = [...new Set(overlappingBookings.map((b) => b.propertyId))];
    }

    const allProperties = await db.query.properties.findMany({
      where: and(...conditions),
      orderBy: desc(properties.createdAt),
    });

    // Filter out booked properties
    const filteredProperties = excludePropertyIds.length > 0
      ? allProperties.filter(p => !excludePropertyIds.includes(p.id))
      : allProperties;

    log.info("Properties fetched", {count: formatted.length});
    return NextResponse.json({ properties: formatted, count: formatted.length });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    log.error("Failed to fetch properties", err);
    return NextResponse.json(
        createApiError("Failed to fetch properties", ErrorCodes.DATABASE_ERROR),
        {status: 500}
    );
  }
}

// ============================================================
// POST handler
// ============================================================

export async function POST(request: NextRequest) {
  const log = createRequestLogger(`properties-post-${Date.now()}`);

  try {
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
          createApiError("Invalid JSON in request body", ErrorCodes.VALIDATION_ERROR),
          {status: 400}
      );
    }

    const {
      name,
      slug,
      type,
      description,
      location,
      city,
      address,
      latitude,
      longitude,
      bedrooms,
      bathrooms,
      maxGuests,
      basePrice,
      currency,
      cleaningFee,
      minStay,
      maxStay,
      checkInTime,
      checkOutTime,
      amenities,
      images,
      rating,
      reviewCount,
      featured,
      active,
    } = body;

    // Validate type
    if (type && !VALID_TYPES.includes(type as string)) {
      return NextResponse.json(
          createApiError("Invalid property type", ErrorCodes.VALIDATION_ERROR, {validTypes: VALID_TYPES}),
          {status: 400}
      );
    }

    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json(
          createApiError("name and slug are required", ErrorCodes.VALIDATION_ERROR, {missingFields: !name && !slug ? ["name", "slug"] : [!name ? "name" : "", !slug ? "slug" : ""].filter(Boolean)}),
        { status: 400 }
      );
    }

    // Check for existing slug
    const existingProperty = await db.property.findUnique({where: {slug: slug as string}});
    if (existingProperty) {
      return NextResponse.json(
          createApiError("A property with this slug already exists", ErrorCodes.CONFLICT),
        { status: 409 }
      );
    }

    // Parse and validate numeric fields
    const parseIntOr = (val: unknown, fallback: number) => {
      if (val === undefined || val === null) return fallback;
      const parsed = parseInt(String(val), 10);
      return isNaN(parsed) ? fallback : parsed;
    };

    const parseFloatOr = (val: unknown, fallback: number) => {
      if (val === undefined || val === null) return fallback;
      const parsed = parseFloat(String(val));
      return isNaN(parsed) ? fallback : parsed;
    };

    const property = await db.property.create({
      data: {
        name: name as string,
        slug: slug as string,
        type: (type as string) || "apartment",
        description: (description as string) || "",
        location: (location as string) || "",
        city: (city as string) || "Valletta",
        address: (address as string) || "",
        latitude: (latitude as string) || "35.8992",
        longitude: (longitude as string) || "14.5140",
        bedrooms: parseIntOr(bedrooms, 2),
        bathrooms: parseIntOr(bathrooms, 2),
        maxGuests: parseIntOr(maxGuests, 4),
        basePrice: parseFloatOr(basePrice, 150),
        currency: (currency as string) || "EUR",
        cleaningFee: parseFloatOr(cleaningFee, 50),
        minStay: parseIntOr(minStay, 2),
        maxStay: parseIntOr(maxStay, 30),
        checkInTime: (checkInTime as string) || "15:00",
        checkOutTime: (checkOutTime as string) || "11:00",
        amenities: JSON.stringify(amenities || []),
        images: JSON.stringify(images || []),
        rating: parseFloatOr(rating, 4.9),
        reviewCount: parseIntOr(reviewCount, 0),
        featured: featured === true,
        active: active !== false,
      },
    });

    log.info("Property created", {id: property.id, slug: property.slug});

    const formatted = formatProperty(property as unknown as Record<string, unknown>);
    return NextResponse.json(formatted, { status: 201 });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    log.error("Failed to create property", err);
    return NextResponse.json(
        createApiError("Failed to create property", ErrorCodes.DATABASE_ERROR),
        {status: 500}
    );
  }
}
