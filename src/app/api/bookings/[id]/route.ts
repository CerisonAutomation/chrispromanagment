import {db} from "@/lib/db";
import {NextRequest, NextResponse} from "next/server";

const VALID_ACTIONS = ["confirm", "cancel", "complete"] as const;
const STATUS_MAP: Record<string, string> = {
  confirm: "confirmed",
  cancel: "cancelled",
  complete: "completed",
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const booking = await db.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error("[bookings/[id] GET]", error);
    return NextResponse.json({ error: "Failed to fetch booking" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    if (!action || !VALID_ACTIONS.includes(action as (typeof VALID_ACTIONS)[number])) {
      return NextResponse.json(
        {
          error: `Invalid action. Use one of: ${VALID_ACTIONS.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const booking = await db.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const newStatus = STATUS_MAP[action];

    // Prevent re-processing
    if (booking.status === newStatus) {
      return NextResponse.json(
        { error: `Booking is already ${newStatus}` },
        { status: 400 }
      );
    }

    // Prevent actions on completed/cancelled bookings
    if (booking.status === "cancelled" && action !== "cancel") {
      return NextResponse.json(
        { error: "Cannot modify a cancelled booking" },
        { status: 400 }
      );
    }
    if (booking.status === "completed" && action !== "complete") {
      return NextResponse.json(
        { error: "Cannot modify a completed booking" },
        { status: 400 }
      );
    }

    const updatedBooking = await db.booking.update({
      where: { id },
      data: { status: newStatus },
    });

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error("[bookings/[id] PATCH]", error);
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const booking = await db.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    await db.booking.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Booking deleted" });
  } catch (error) {
    console.error("[bookings/[id] DELETE]", error);
    return NextResponse.json({ error: "Failed to delete booking" }, { status: 500 });
  }
}
