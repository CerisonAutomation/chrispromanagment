import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

function generateConfirmationCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // No I, O, 0, 1 to avoid confusion
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const propertyId = searchParams.get("propertyId");
    const search = searchParams.get("search");

    const where: Prisma.BookingWhereInput = {};

    if (status) {
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

    return NextResponse.json({ bookings, count: bookings.length });
  } catch (error) {
    console.error("[bookings GET]", error);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
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
    if (!guestName || !guestEmail || !checkIn || !checkOut || !guests) {
      return NextResponse.json(
        {
          error: "guestName, guestEmail, checkIn, checkOut, and guests are required",
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(guestEmail)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    // Validate dates
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
    }
    if (checkOutDate <= checkInDate) {
      return NextResponse.json(
        { error: "checkOut date must be after checkIn date" },
        { status: 400 }
      );
    }

    // Validate guests
    const numGuests = parseInt(guests, 10);
    if (isNaN(numGuests) || numGuests < 1) {
      return NextResponse.json({ error: "guests must be a positive number" }, { status: 400 });
    }

    // Fetch property (optional — if no propertyId, create a general inquiry)
    const property = propertyId
      ? await db.property.findUnique({ where: { id: propertyId } })
      : null;

    if (propertyId && !property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    if (property && !property.active) {
      return NextResponse.json({ error: "Property is not available" }, { status: 400 });
    }

    if (property && numGuests > property.maxGuests) {
      return NextResponse.json(
        { error: `Maximum ${property.maxGuests} guests allowed for this property` },
        { status: 400 }
      );
    }

    // Check minimum stay (only if property selected)
    const nights = calculateNights(checkIn, checkOut);
    if (property && nights < property.minStay) {
      return NextResponse.json(
        { error: `Minimum stay is ${property.minStay} nights` },
        { status: 400 }
      );
    }

    if (property && nights > property.maxStay) {
      return NextResponse.json(
        { error: `Maximum stay is ${property.maxStay} nights` },
        { status: 400 }
      );
    }

    // Check availability (no overlapping confirmed/pending bookings)
    if (property) {
      const overlappingBookings = await db.booking.count({
        where: {
          propertyId,
          status: { in: ["pending", "confirmed"] },
          checkIn: { lt: checkOut },
          checkOut: { gt: checkIn },
        },
      });

      if (overlappingBookings > 0) {
        return NextResponse.json(
          { error: "Property is not available for the selected dates" },
          { status: 409 }
        );
      }
    }

    // Calculate pricing
    const basePrice = property ? nights * property.basePrice : 0;
    const cleaningFee = property ? property.cleaningFee : 0;
    const serviceFee = Math.round((basePrice + cleaningFee) * 0.12 * 100) / 100;
    const totalPrice = Math.round((basePrice + cleaningFee + serviceFee) * 100) / 100;

    // Generate unique confirmation code
    let confirmationCode = generateConfirmationCode();
    let attempts = 0;
    while (await db.booking.findUnique({ where: { confirmationCode } })) {
      confirmationCode = generateConfirmationCode();
      attempts++;
      if (attempts > 10) {
        return NextResponse.json(
          { error: "Failed to generate confirmation code" },
          { status: 500 }
        );
      }
    }

    // Create booking
    const booking = await db.booking.create({
      data: {
        confirmationCode,
        propertyId: propertyId || "",
        propertyName: property ? property.name : "General Inquiry",
        guestName,
        guestEmail,
        guestPhone: guestPhone || "",
        guestAddress: guestAddress || "",
        guestCity: guestCity || "",
        guestCountry: guestCountry || "",
        checkIn,
        checkOut,
        nights,
        guests: numGuests,
        basePrice,
        cleaningFee,
        serviceFee,
        totalPrice,
        currency: property.currency,
        status: "pending",
        source: source || "direct",
        specialRequests: specialRequests || "",
        notes: notes || "",
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error("[bookings POST]", error);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}
