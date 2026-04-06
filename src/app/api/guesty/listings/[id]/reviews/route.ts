import {NextRequest, NextResponse} from "next/server";
import {getGuestyAPI} from "@/lib/guesty-api";

/**
 * GET /api/guesty/listings/[id]/reviews
 *
 * Get reviews for a specific listing.
 *
 * Query params:
 *   page  — pagination page number (default 1)
 *   limit — items per page (default 10)
 *
 * Returns paginated review data with average rating.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Listing ID is required" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page")
      ? parseInt(searchParams.get("page")!, 10)
      : 1;
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!, 10)
      : 10;

    const api = getGuestyAPI();
    const result = await api.getReviews(id, { page, limit });

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch reviews";

    if (message === "Property not found") {
      return NextResponse.json({ error: message }, { status: 404 });
    }

    console.error("[guesty/listings/[id]/reviews GET]", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
