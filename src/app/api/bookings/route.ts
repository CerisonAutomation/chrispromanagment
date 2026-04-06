import {db} from "@/lib/db";
import {NextRequest, NextResponse} from "next/server";
import {Prisma} from "@prisma/client";
import {createApiError, createRequestLogger, ErrorCodes} from "@/lib/error";

// ============================================================
// Helper functions
// ============================================================

function generateConfirmationCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "CPM-";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function calculateNights(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffMs = end.getTime() - start.getTime();
  return Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));
}

// ============================================================
// GET handler
// ============================================================

export async function GET(request: NextRequest) {
  const log = createRequestLogger(`bookings-get-${Date.now()}`);

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const propertyId = searchParams.get("propertyId");
    const search = searchParams.get("search");

    const where: Prisma.BookingWhereInput = {};

    if (status) {
      const validStatuses = ["pending", "confirmed", "cancelled", "completed"];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
            createApiError(`Invalid status. Must be one of: ${validStatuses.join(", ")}`, ErrorCodes.VALIDATION_ERROR),
            {status: 400}
        );
      }
      where.status = status;
    }

    if (propertyId) {
      where.propertyId = propertyId;
    }

    if (search) {
      where.OR = [
        { guestName: { contains: search } },
        { guestEmail: { contains: search } },
        { confirmationCode: { contains: search } },
      ];
    }

    const bookings = await db.booking.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    log.info("Bookings fetched", {count: bookings.length});
    return NextResponse.json({ bookings, count: bookings.length });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    log.error("Failed to fetch bookings", err);
    return NextResponse.json(
        createApiError("Failed to fetch bookings", ErrorCodes.DATABASE_ERROR),
        {status: 500}
    );
  }
}

// ============================================================
// POST handler
// ============================================================

export async function POST(request: NextRequest) {
  const log = createRequestLogger(`bookings-post-${Date.now()}`);

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
      propertyId,
      guestName,
      guestEmail,
      guestPhone,
      guestAddress,
      guestCity,
      guestCountry,
      checkIn,
      checkOut,
      guests,
      source,
      specialRequests,
      notes,
    } = body;

    // Validate required fields
    const missingFields: string[] = [];
    if (!guestName) missingFields.push("guestName");
    if (!guestEmail) missingFields.push("guestEmail");
    if (!checkIn) missingFields.push("checkIn");
    if (!checkOut) missingFields.push("checkOut");
    if (!guests) missingFields.push("guests");

    if (missingFields.length > 0) {
      return NextResponse.json(
          createApiError(
              `Missing required fields: ${missingFields.join(", ")}`,
              ErrorCodes.VALIDATION_ERROR,
              {missingFields}
          ),
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(guestEmail as string)) {
      return NextResponse.json(
          createApiError("Invalid email format", ErrorCodes.VALIDATION_ERROR),
          {status: 400}
      );
    }

    // Validate dates
    const checkInDate = new Date(checkIn as string);
    const checkOutDate = new Date(checkOut as string);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return NextResponse.json(
          createApiError("Invalid date format", ErrorCodes.VALIDATION_ERROR),
          {status: 400}
      );
    }

    if (checkOutDate <= checkInDate) {
      return NextResponse.json(
          createApiError("checkOut date must be after checkIn date", ErrorCodes.VALIDATION_ERROR),
        { status: 400 }
      );
    }

    // Validate guests
    const numGuests = parseInt(guests as string, 10);
    if (isNaN(numGuests) || numGuests < 1) {
      return NextResponse.json(
          createApiError("guests must be a positive number", ErrorCodes.VALIDATION_ERROR),
          {status: 400}
      );
    }

    // Fetch property (optional)
    const property = propertyId
        ? await db.property.findUnique({where: {id: propertyId as string}})
      : null;

    if (propertyId && !property) {
      return NextResponse.json(
          createApiError("Property not found", ErrorCodes.NOT_FOUND),
          {status: 404}
      );
    }

    if (property && !property.active) {
      return NextResponse.json(
          createApiError("Property is not available", ErrorCodes.VALIDATION_ERROR),
          {status: 400}
      );
    }

    if (property && numGuests > property.maxGuests) {
      return NextResponse.json(
          createApiError(`Maximum ${property.maxGuests} guests allowed for this property`, ErrorCodes.VALIDATION_ERROR),
        { status: 400 }
      );
    }

    const nights = calculateNights(checkIn as string, checkOut as string);

    if (property && nights < property.minStay) {
      return NextResponse.json(
          createApiError(`Minimum stay is ${property.minStay} nights`, ErrorCodes.VALIDATION_ERROR),
        { status: 400 }
      );
    }

    if (property && nights > property.maxStay) {
      return NextResponse.json(
          createApiError(`Maximum stay is ${property.maxStay} nights`, ErrorCodes.VALIDATION_ERROR),
        { status: 400 }
      );
    }

    // Check availability
    if (property) {
      const overlappingBookings = await db.booking.count({
        where: {
          propertyId: propertyId as string,
          status: { in: ["pending", "confirmed"] },
          checkIn: { lt: checkOut as string },
          checkOut: { gt: checkIn as string },
        },
      });

      if (overlappingBookings > 0) {
        return NextResponse.json(
            createApiError("Property is not available for the selected dates", ErrorCodes.CONFLICT),
          { status: 409 }
        );
      }
    }

    // Calculate pricing
    const basePrice = property ? nights * property.basePrice : 0;
    const cleaningFee = property ? property.cleaningFee : 0;
    const serviceFee = Math.round((basePrice + cleaningFee) * 0.12 * 100) / 100;
    const totalPrice = Math.round((basePrice + cleaningFee + serviceFee) * 100) / 100;

    // Generate confirmation code with retry
    let confirmationCode = generateConfirmationCode();
    let attempts = 0;
    while (await db.booking.findUnique({ where: { confirmationCode } })) {
      confirmationCode = generateConfirmationCode();
      attempts++;
      if (attempts > 10) {
        return NextResponse.json(
            createApiError("Failed to generate confirmation code", ErrorCodes.INTERNAL_ERROR),
          { status: 500 }
        );
      }
    }

    // Create booking
    const booking = await db.booking.create({
      data: {
        confirmationCode,
        propertyId: propertyId as string || "",
        propertyName: property ? property.name : "General Inquiry",
        guestName: guestName as string,
        guestEmail: guestEmail as string,
        guestPhone: (guestPhone as string) || "",
        guestAddress: (guestAddress as string) || "",
        guestCity: (guestCity as string) || "",
        guestCountry: (guestCountry as string) || "",
        checkIn: checkIn as string,
        checkOut: checkOut as string,
        nights,
        guests: numGuests,
        basePrice,
        cleaningFee,
        serviceFee,
        totalPrice,
        currency: property?.currency || "EUR",
        status: "pending",
        source: (source as string) || "direct",
        specialRequests: (specialRequests as string) || "",
        notes: (notes as string) || "",
      },
    });

    log.info("Booking created", {confirmationCode, propertyId});

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    log.error("Failed to create booking", err);
    return NextResponse.json(
        createApiError("Failed to create booking", ErrorCodes.DATABASE_ERROR),
        {status: 500}
    );
  }
}
