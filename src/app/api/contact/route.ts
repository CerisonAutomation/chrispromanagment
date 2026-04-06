import {db} from "@/lib/db";
import {NextResponse} from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "name, email, and message are required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    const submission = await db.contactSubmission.create({
      data: { name, email, message },
    });

    return NextResponse.json(submission, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to submit contact form" }, { status: 500 });
  }
}
