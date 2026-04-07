/**
 * GET  /api/pages          — list all CMS pages
 * POST /api/pages          — create or upsert a CMS page
 */
import { NextRequest, NextResponse } from 'next/server';
import { cmsPage } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  try {
    const pages = await cmsPage.findMany();
    return NextResponse.json(pages);
  } catch (error) {
    console.error('[GET /api/pages]', error);
    return NextResponse.json({ error: 'Failed to fetch pages', details: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json() as {
      slug: string;
      title: string;
      data: unknown;
      theme?: string;
      published?: boolean;
    };

    if (!body.slug || !body.title) {
      return NextResponse.json({ error: 'slug and title are required' }, { status: 400 });
    }

    const page = await cmsPage.upsert({
      slug: body.slug,
      title: body.title,
      data: typeof body.data === 'string' ? body.data : JSON.stringify(body.data),
      theme: body.theme,
      published: body.published,
    });

    return NextResponse.json(page, { status: 201 });
  } catch (error) {
    console.error('[POST /api/pages]', error);
    return NextResponse.json({ error: 'Failed to save page', details: String(error) }, { status: 500 });
  }
}
