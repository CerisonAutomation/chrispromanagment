/**
 * GET    /api/pages/:slug  — fetch single CMS page
 * PUT    /api/pages/:slug  — update CMS page
 * DELETE /api/pages/:slug  — delete CMS page
 */
import { NextRequest, NextResponse } from 'next/server';
import { cmsPage } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse> {
  try {
    const { slug } = await params;
    const page = await cmsPage.findUnique({ where: { slug } });
    if (!page) return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    return NextResponse.json(page);
  } catch (error) {
    console.error('[GET /api/pages/[slug]]', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse> {
  try {
    const { slug } = await params;
    const body = await req.json() as {
      title?: string;
      data?: unknown;
      theme?: string;
      published?: boolean;
    };

    const existing = await cmsPage.findUnique({ where: { slug } });
    if (!existing) return NextResponse.json({ error: 'Page not found' }, { status: 404 });

    const updated = await cmsPage.upsert({
      slug,
      title: body.title ?? (existing as { title: string }).title,
      data: body.data !== undefined
        ? (typeof body.data === 'string' ? body.data : JSON.stringify(body.data))
        : (existing as { data: string }).data,
      theme: body.theme ?? (existing as { theme: string }).theme,
      published: body.published ?? (existing as { published: boolean }).published,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[PUT /api/pages/[slug]]', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse> {
  try {
    const { slug } = await params;
    await cmsPage.delete({ where: { slug } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/pages/[slug]]', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
