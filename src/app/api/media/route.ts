import { NextRequest, NextResponse } from "next/server";
import manifest from "@/lib/media-manifest";

export async function GET() {
  try {
    const files = await manifest.list();
    return NextResponse.json(files);
  } catch (err) {
    console.error("Media list error:", err);
    return NextResponse.json([], { status: 200 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    if (!url) {
      return NextResponse.json({ error: "Missing ?url parameter" }, { status: 400 });
    }

    await manifest.remove(url);

    // Attempt to delete the file from disk
    const fs = await import("fs/promises");
    const path = await import("path");
    const filePath = path.join(process.cwd(), "public", url);
    try {
      await fs.unlink(filePath);
    } catch {
      // File may already be gone — that's fine
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Media delete error:", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
