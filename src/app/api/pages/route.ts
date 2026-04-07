/**
 * @fileoverview GET /api/pages — list all CMS pages (server-only).
 * POST /api/pages — create/upsert a page.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { getAllPages, upsertPage } from '@/lib/supabase';
import { z } from 'zod';

export const runtime = 'nodejs';
export const revalidate = 0;

export async function GET() {
  const pages = await getAllPages();
  return NextResponse.json(pages);
}

const UpsertPageSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-/]+$/, 'Slug must be URL-safe'),
  title: z.string().min(1).max(200),
  content: z.unknown().optional(),
  published: z.boolean().optional(),
  meta_title: z.string().max(70).optional(),
  meta_description: z.string().max(160).optional(),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = UpsertPageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { slug, ...rest } = parsed.data;
  const ok = await upsertPage(slug, rest as Parameters<typeof upsertPage>[1]);
  if (!ok) return NextResponse.json({ error: 'DB write failed' }, { status: 500 });
  return NextResponse.json({ slug, ok: true }, { status: 201 });
}
