/**
 * @fileoverview POST /api/contact — handles contact form submissions.
 * In production wire up to Resend / SendGrid / similar.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export const runtime = 'nodejs';

const schema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(200),
  subject: z.string().min(1).max(200),
  message: z.string().min(10).max(5000),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  const { name, email, subject, message } = parsed.data;

  // Log to console (server-side only) — replace with email provider in production
  console.info('[contact]', { name, email, subject, messageLength: message.length });

  // TODO: wire up email provider (Resend, SendGrid, etc.)
  // await resend.emails.send({ from: 'no-reply@christiano-pm.com', to: 'hello@christiano-pm.com', ... })

  return NextResponse.json({ ok: true });
}
