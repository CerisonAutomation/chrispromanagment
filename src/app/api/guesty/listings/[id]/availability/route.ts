import {NextRequest, NextResponse} from "next/server";
import {getGuestyAPI} from "@/lib/guesty-api";

/**
 * GET /api/guesty/listings/[id]/availability
 *
 * Get calendar / availability for a listing within an optional date range.
 *
 * Query params:
 *   from  — start date (ISO string, default: today)
 *   to    — end date (ISO string, default: today + 90 days)
 *
 * Returns a day-by-day breakdown of availability status:
 *   "available" | "booked" | "blocked" | "unavailable"
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
    const from = searchParams.get("from") ?? undefined;
    const to = searchParams.get("to") ?? undefined;

    const api = getGuestyAPI();
    const availability = await api.getAvailability(id, { from, to });

    return NextResponse.json(availability);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch availability";

    if (message === "Property not found") {
      return NextResponse.json({ error: message }, { status: 404 });
    }

    console.error("[guesty/listings/[id]/availability GET]", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
