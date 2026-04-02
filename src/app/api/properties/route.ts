import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

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

export async function GET(request: NextRequest) {
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
      const VALID_TYPES = ['apartment', 'villa', 'event_space'];
      if (!VALID_TYPES.includes(type)) {
        return NextResponse.json({ error: "Invalid property type" }, { status: 400 });
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

    // Availability filter: exclude properties with overlapping bookings
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

    return NextResponse.json({ properties: formatted, count: formatted.length });
  } catch (error) {
    console.error("[properties GET]", error);
    return NextResponse.json({ error: "Failed to fetch properties" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
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

    const VALID_TYPES = ['apartment', 'villa', 'event_space'];
    if (type && !VALID_TYPES.includes(type)) {
      return NextResponse.json({ error: "Invalid property type" }, { status: 400 });
    }

    if (!name || !slug) {
      return NextResponse.json(
        { error: "name and slug are required" },
        { status: 400 }
      );
    }

    const existingProperty = await db.property.findUnique({ where: { slug } });
    if (existingProperty) {
      return NextResponse.json(
        { error: "A property with this slug already exists" },
        { status: 409 }
      );
    }

    const property = await db.property.create({
      data: {
        name,
        slug,
        type: type || "apartment",
        description: description || "",
        location: location || "",
        city: city || "Valletta",
        address: address || "",
        latitude: latitude || "35.8992",
        longitude: longitude || "14.5140",
        bedrooms: (() => { const v = parseInt(bedrooms, 10); return isNaN(v) ? 2 : v; })(),
        bathrooms: (() => { const v = parseInt(bathrooms, 10); return isNaN(v) ? 2 : v; })(),
        maxGuests: (() => { const v = parseInt(maxGuests, 10); return isNaN(v) ? 4 : v; })(),
        basePrice: (() => { const v = parseFloat(basePrice); return isNaN(v) ? 150 : v; })(),
        currency: currency || "EUR",
        cleaningFee: (() => { const v = parseFloat(cleaningFee); return isNaN(v) ? 50 : v; })(),
        minStay: (() => { const v = parseInt(minStay, 10); return isNaN(v) ? 2 : v; })(),
        maxStay: (() => { const v = parseInt(maxStay, 10); return isNaN(v) ? 30 : v; })(),
        checkInTime: checkInTime || "15:00",
        checkOutTime: checkOutTime || "11:00",
        amenities: JSON.stringify(amenities || []),
        images: JSON.stringify(images || []),
        rating: (() => { const v = parseFloat(rating); return isNaN(v) ? 4.9 : v; })(),
        reviewCount: (() => { const v = parseInt(reviewCount, 10); return isNaN(v) ? 0 : v; })(),
        featured: featured === true,
        active: active !== false,
      },
    });

    const formatted = formatProperty(property as unknown as Record<string, unknown>);

    return NextResponse.json(formatted, { status: 201 });
  } catch (error) {
    console.error("[properties POST]", error);
    return NextResponse.json({ error: "Failed to create property" }, { status: 500 });
  }
}
