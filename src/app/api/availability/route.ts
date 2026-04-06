import {db} from "@/lib/db";
import {NextRequest, NextResponse} from "next/server";
import {createApiError, createRequestLogger, ErrorCodes} from "@/lib/error";

export async function GET(request: NextRequest) {
  const log = createRequestLogger(`availability-${Date.now()}`);

  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get("propertyId");
    const checkIn = searchParams.get("checkIn");
    const checkOut = searchParams.get("checkOut");

    // Validate required params
    if (!propertyId || !checkIn || !checkOut) {
      return NextResponse.json(
          createApiError(
              "propertyId, checkIn, and checkOut are required",
              ErrorCodes.VALIDATION_ERROR,
              {
                missingParams: [!propertyId, !checkIn, !checkOut].map((m, i) =>
                    ["propertyId", "checkIn", "checkOut"][i]
                ).filter((_, i) => [!propertyId, !checkIn, !checkOut][i])
              }
          ),
        { status: 400 }
      );
    }

    // Validate dates
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

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

    // Check property exists
    const property = await db.property.findUnique({where: {id: propertyId}});

    if (!property) {
      return NextResponse.json(
          createApiError("Property not found", ErrorCodes.NOT_FOUND),
          {status: 404}
      );
    }

    // Find overlapping bookings
    const overlappingBookings = await db.booking.findMany({
      where: {
        propertyId,
        status: { in: ["pending", "confirmed"] },
        checkIn: { lt: checkOut },
        checkOut: { gt: checkIn },
      },
      select: {checkIn: true, checkOut: true},
    });

    // Build booked dates list
    const bookedDates: string[] = [];
    for (const booking of overlappingBookings) {
      const start = new Date(booking.checkIn);
      const end = new Date(booking.checkOut);
      const current = new Date(start);
      while (current < end) {
        bookedDates.push(current.toISOString().split("T")[0]);
        current.setDate(current.getDate() + 1);
      }
    }

    log.info("Availability check completed", {
      propertyId,
      bookedDays: bookedDates.length,
      available: overlappingBookings.length === 0,
    });

    return NextResponse.json({
      available: overlappingBookings.length === 0,
      bookedDates: [...new Set(bookedDates)].sort(),
    });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    log.error("Availability check failed", err);

    return NextResponse.json(
        createApiError("Failed to check availability", ErrorCodes.DATABASE_ERROR),
        {status: 500}
    );
  }
}
