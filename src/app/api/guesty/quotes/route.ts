import { NextRequest, NextResponse } from "next/server";
import { getGuestyAPI } from "@/lib/guesty-api";

/**
 * POST /api/guesty/quotes
 *
 * Create a new quote / booking request.
 *
 * Request body:
 *   listingId  — (required) ID or slug of the listing
 *   checkIn    — (required) ISO date string for check-in
 *   checkOut   — (required) ISO date string for check-out
 *   guest      — (required) guest info object:
 *     firstName — (required)
 *     lastName  — (required)
 *     email     — (required)
 *     phone     — optional
 *     adults    — default 1
 *     children  — default 0
 *     infants   — default 0
 *   source      — optional, e.g. "direct" | "airbnb" | "booking.com"
 *   notes       — optional special requests
 *
 * Returns a MappedQuote with pricing breakdown.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const { listingId, checkIn, checkOut, guest } = body;

    if (!listingId) {
      return NextResponse.json(
        { error: "listingId is required" },
        { status: 400 }
      );
    }
    if (!checkIn) {
      return NextResponse.json(
        { error: "checkIn is required" },
        { status: 400 }
      );
    }
    if (!checkOut) {
      return NextResponse.json(
        { error: "checkOut is required" },
        { status: 400 }
      );
    }
    if (!guest || !guest.firstName || !guest.lastName || !guest.email) {
      return NextResponse.json(
        { error: "guest.firstName, guest.lastName, and guest.email are required" },
        { status: 400 }
      );
    }

    // Validate date format
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format — use ISO 8601" },
        { status: 400 }
      );
    }
    if (checkOutDate <= checkInDate) {
      return NextResponse.json(
        { error: "checkOut date must be after checkIn date" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(guest.email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const api = getGuestyAPI();
    const result = await api.createQuote({
      listingId,
      checkIn,
      checkOut,
      guest: {
        firstName: guest.firstName,
        lastName: guest.lastName,
        email: guest.email,
        phone: guest.phone,
        adults: guest.adults,
        children: guest.children,
        infants: guest.infants,
      },
      source: body.source,
      notes: body.notes,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create quote";

    // Map known error cases
    let status = 500;
    if (
      message.includes("not available") ||
      message.includes("overlapping")
    ) {
      status = 409;
    } else if (message.includes("not found")) {
      status = 404;
    } else if (message.includes("Minimum stay") || message.includes("Maximum stay") || message.includes("Maximum")) {
      status = 400;
    }

    console.error("[guesty/quotes POST]", error);
    return NextResponse.json({ error: message }, { status });
  }
}
