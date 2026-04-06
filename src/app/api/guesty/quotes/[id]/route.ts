import {NextRequest, NextResponse} from "next/server";
import {getGuestyAPI} from "@/lib/guesty-api";

/**
 * GET /api/guesty/quotes/[id]
 *
 * Get details for a specific quote / booking request.
 * The `id` can be a Guesty quote ID, local booking ID, or confirmation code.
 *
 * Returns a MappedQuote with full pricing and guest details.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Quote ID is required" },
        { status: 400 }
      );
    }

    const api = getGuestyAPI();
    const result = await api.getQuote(id);

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch quote";

    if (message === "Quote not found") {
      return NextResponse.json({ error: message }, { status: 404 });
    }

    console.error("[guesty/quotes/[id] GET]", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/guesty/quotes/[id]/accept
 *
 * Accept a pending quote. Only quotes in "pending" status can be accepted.
 *
 * Returns the updated quote with "accepted" / "confirmed" status.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Quote ID is required" },
        { status: 400 }
      );
    }

    const api = getGuestyAPI();
    const result = await api.acceptQuote(id);

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to accept quote";

    if (message === "Quote not found") {
      return NextResponse.json({ error: message }, { status: 404 });
    }
    if (message.includes("cannot be accepted")) {
      return NextResponse.json({ error: message }, { status: 409 });
    }

    console.error("[guesty/quotes/[id] POST]", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
