import { NextRequest, NextResponse } from "next/server";
import { getGuestyAPI } from "@/lib/guesty-api";

/**
 * GET /api/guesty/listings
 *
 * List all listings with optional filters. Uses Guesty API when configured,
 * otherwise falls back to the local SQLite Property database.
 *
 * Query params:
 *   location    — city / area search string
 *   minPrice    — minimum nightly price
 *   maxPrice    — maximum nightly price
 *   checkIn     — ISO date string for check-in
 *   checkOut    — ISO date string for check-out
 *   guests      — minimum number of guests
 *   page        — pagination page number (default 1)
 *   limit       — items per page (default 20)
 *   propertyType — apartment | villa | house | room | condo | guest_suite
 *   bedrooms    — minimum number of bedrooms
 *   amenities   — comma-separated list of amenity names
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const query = {
      location: searchParams.get("location") ?? undefined,
      minPrice: searchParams.get("minPrice")
        ? parseFloat(searchParams.get("minPrice")!)
        : undefined,
      maxPrice: searchParams.get("maxPrice")
        ? parseFloat(searchParams.get("maxPrice")!)
        : undefined,
      checkIn: searchParams.get("checkIn") ?? undefined,
      checkOut: searchParams.get("checkOut") ?? undefined,
      guests: searchParams.get("guests")
        ? parseInt(searchParams.get("guests")!, 10)
        : undefined,
      page: searchParams.get("page")
        ? parseInt(searchParams.get("page")!, 10)
        : 1,
      limit: searchParams.get("limit")
        ? parseInt(searchParams.get("limit")!, 10)
        : 20,
      propertyType: searchParams.get("propertyType") ?? undefined,
      bedrooms: searchParams.get("bedrooms")
        ? parseInt(searchParams.get("bedrooms")!, 10)
        : undefined,
      amenities: searchParams.get("amenities")
        ? searchParams.get("amenities")!.split(",").map((a) => a.trim())
        : undefined,
    };

    // Basic validation
    if (query.page < 1) {
      return NextResponse.json(
        { error: "page must be >= 1" },
        { status: 400 }
      );
    }
    if (query.limit < 1 || query.limit > 100) {
      return NextResponse.json(
        { error: "limit must be between 1 and 100" },
        { status: 400 }
      );
    }

    const api = getGuestyAPI();
    const result = await api.getListings(query);

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch listings";
    console.error("[guesty/listings GET]", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
