import { NextRequest, NextResponse } from "next/server";
import { getGuestyAPI } from "@/lib/guesty-api";

/**
 * GET /api/guesty/listings/[id]
 *
 * Get full details for a single listing. The `id` param can be:
 *   - A Guesty listing ID (when Guesty API is configured)
 *   - A local Property ID or slug (when falling back to local DB)
 *
 * Returns a MappedProperty in a consistent shape regardless of data source.
 */
export async function GET(
  _request: NextRequest,
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

    const api = getGuestyAPI();
    const listing = await api.getListing(id);

    return NextResponse.json(listing);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch listing";

    if (message === "Property not found") {
      return NextResponse.json({ error: message }, { status: 404 });
    }

    console.error("[guesty/listings/[id] GET]", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
