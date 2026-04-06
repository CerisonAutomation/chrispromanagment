import {NextRequest, NextResponse} from "next/server";
import {getGuestyAPI} from "@/lib/guesty-api";
import {createApiError, createRequestLogger, ErrorCodes} from "@/lib/error";

/**
 * GET /api/guesty/listings
 *
 * List all listings with optional filters. Uses Guesty API when configured,
 * otherwise falls back to the local SQLite Property database.
 */
export async function GET(request: NextRequest) {
  const log = createRequestLogger(`guesty-listings-${Date.now()}`);

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

    // Validate pagination
    if (query.page < 1) {
      return NextResponse.json(
          createApiError("page must be >= 1", ErrorCodes.VALIDATION_ERROR),
        { status: 400 }
      );
    }
    if (query.limit < 1 || query.limit > 100) {
      return NextResponse.json(
          createApiError("limit must be between 1 and 100", ErrorCodes.VALIDATION_ERROR),
        { status: 400 }
      );
    }

    log.info("Fetching listings", {query});

    const api = getGuestyAPI();
    const result = await api.getListings(query);

    log.info("Listings fetched", {
      count: result.listings?.length || 0,
      total: result.count,
    });

    return NextResponse.json(result);
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    log.error("Failed to fetch listings", err);

    return NextResponse.json(
        createApiError(err.message || "Failed to fetch listings", ErrorCodes.EXTERNAL_SERVICE_ERROR),
        {status: 500}
    );
  }
}
