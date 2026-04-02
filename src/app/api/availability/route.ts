import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get("propertyId");
    const checkIn = searchParams.get("checkIn");
    const checkOut = searchParams.get("checkOut");

    if (!propertyId || !checkIn || !checkOut) {
      return NextResponse.json(
        { error: "propertyId, checkIn, and checkOut are required" },
        { status: 400 }
      );
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

    // Check property exists
    const property = await db.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    // Find all bookings that overlap with the requested dates
    const overlappingBookings = await db.booking.findMany({
      where: {
        propertyId,
        status: { in: ["pending", "confirmed"] },
        checkIn: { lt: checkOut },
        checkOut: { gt: checkIn },
      },
      select: {
        checkIn: true,
        checkOut: true,
      },
    });

    // Build the list of booked dates
    const bookedDates: string[] = [];
    for (const booking of overlappingBookings) {
      const start = new Date(booking.checkIn);
      const end = new Date(booking.checkOut);
      // Go from checkIn to day before checkOut (each night)
      const current = new Date(start);
      while (current < end) {
        bookedDates.push(current.toISOString().split("T")[0]);
        current.setDate(current.getDate() + 1);
      }
    }

    const available = overlappingBookings.length === 0;

    return NextResponse.json({
      available,
      bookedDates: [...new Set(bookedDates)].sort(),
    });
  } catch (error) {
    console.error("[availability GET]", error);
    return NextResponse.json({ error: "Failed to check availability" }, { status: 500 });
  }
}
