import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const pages = await db.cmsPage.findMany({
      select: { id: true, slug: true, title: true, status: true, updatedAt: true },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(pages);
  } catch {
    return NextResponse.json({ error: "Failed to fetch pages" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { slug, title, data, status } = body;

    if (!slug || !title || !data) {
      return NextResponse.json({ error: "slug, title, and data are required" }, { status: 400 });
    }

    const page = await db.cmsPage.upsert({
      where: { slug },
      update: { title, data: JSON.stringify(data), status: status || "draft" },
      create: { slug, title, data: JSON.stringify(data), status: status || "draft" },
    });

    return NextResponse.json(page);
  } catch {
    return NextResponse.json({ error: "Failed to save page" }, { status: 500 });
  }
}
