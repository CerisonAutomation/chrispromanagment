import {db} from "@/lib/db";
import {NextRequest, NextResponse} from "next/server";
import {Prisma} from "@prisma/client";
import {createApiError, createRequestLogger, ErrorCodes} from "@/lib/error";

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

    const where: Prisma.PropertyWhereInput = { active: true };

    if (city) {
      where.city = { equals: city };
    }

    if (minGuests) {
      const parsed = parseInt(minGuests, 10);
      if (!isNaN(parsed)) {
        where.maxGuests = { gte: parsed };
      }
    }

    if (minPrice) {
      const parsed = parseFloat(minPrice);
      if (!isNaN(parsed)) {
        where.basePrice = { ...((where.basePrice as Prisma.FloatNullableFilter) || {}), gte: parsed };
      }
    }

    if (maxPrice) {
      const parsed = parseFloat(maxPrice);
      if (!isNaN(parsed)) {
        where.basePrice = { ...((where.basePrice as Prisma.FloatNullableFilter) || {}), lte: parsed };
      }
    }

    if (type) {
      if (!VALID_TYPES.includes(type)) {
        return NextResponse.json(
            createApiError("Invalid property type", ErrorCodes.VALIDATION_ERROR, {validTypes: VALID_TYPES}),
            {status: 400}
        );
      }
      where.type = { equals: type };
    }

    if (bedrooms) {
      const parsed = parseInt(bedrooms, 10);
      if (!isNaN(parsed)) {
        where.bedrooms = { gte: parsed };
      }
    }

    if (featured === "true") {
      where.featured = true;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { location: { contains: search } },
        { city: { contains: search } },
        { description: { contains: search } },
      ];
    }

    // Availability filter
    if (checkIn && checkOut) {
      const overlappingBookings = await db.booking.findMany({
        where: {
          status: { in: ["pending", "confirmed"] },
          checkIn: { lt: checkOut },
          checkOut: { gt: checkIn },
        },
        select: { propertyId: true },
      });

      const bookedPropertyIds = [...new Set(overlappingBookings.map((b) => b.propertyId))];
      if (bookedPropertyIds.length > 0) {
        where.id = { notIn: bookedPropertyIds };
      }
    }

    const properties = await db.property.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    const formatted = properties.map((p) => formatProperty(p as unknown as Record<string, unknown>));

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
