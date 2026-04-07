/**
 * @fileoverview GET /api/pages/[slug] — single page by slug.
 * PATCH /api/pages/[slug] — partial update.
 * DELETE /api/pages/[slug] — permanent delete.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { getPageBySlug, upsertPage, deletePage, publishPage, unpublishPage } from '@/lib/supabase';

export const runtime = 'nodejs';
export const revalidate = 0;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  if (!page) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(page);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { action, ...rest } = body;
  if (action === 'publish') {
    await publishPage(slug);
    return NextResponse.json({ ok: true, published: true });
  }
  if (action === 'unpublish') {
    await unpublishPage(slug);
    return NextResponse.json({ ok: true, published: false });
  }

  const ok = await upsertPage(slug, rest as Parameters<typeof upsertPage>[1]);
  return NextResponse.json({ ok });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const ok = await deletePage(slug);
  if (!ok) return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
