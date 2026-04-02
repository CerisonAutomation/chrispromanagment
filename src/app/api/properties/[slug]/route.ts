import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

function parseJsonField<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const property = await db.property.findUnique({
      where: { slug },
    });

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    const formatted = {
      ...property,
      amenities: parseJsonField<string[]>(property.amenities, []),
      images: parseJsonField<string[]>(property.images, []),
    };

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("[properties/[slug] GET]", error);
    return NextResponse.json({ error: "Failed to fetch property" }, { status: 500 });
  }
}
