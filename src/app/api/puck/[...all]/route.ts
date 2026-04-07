/**
 * @fileoverview Puck CMS persistence API — Supabase backend.
 * GET  /api/puck/[slug] → load page data for Puck editor / frontend renderer
 * POST /api/puck/[slug] → save/upsert page data from Puck onPublish
 * PATCH /api/puck/[slug] → toggle published flag
 * DELETE /api/puck/[slug] → delete page
 */
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

type RouteParams = { params: Promise<{ all: string[] }> };

const EMPTY_PAGE_DATA = { content: [], root: { props: {} } };

function resolveSlug(all: string[]): string {
  return (all ?? []).join('/') || 'home';
}

/** GET /api/puck/[...slug] — load page data */
export async function GET(
  _req: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { all } = await params;
    const slug = resolveSlug(all);

    const { data, error } = await supabaseAdmin
      .from('cms_pages')
      .select('data, title, theme, published, updated_at')
      .eq('slug', slug)
      .maybeSingle();

    if (error) {
      console.error(`[Puck API] GET /${slug} error:`, error.message);
      return NextResponse.json(EMPTY_PAGE_DATA);
    }

    return NextResponse.json(data?.data ?? EMPTY_PAGE_DATA, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (err) {
    console.error('[Puck API] GET unexpected error:', err);
    return NextResponse.json(EMPTY_PAGE_DATA);
  }
}

/** POST /api/puck/[...slug] — upsert page data from Puck onPublish */
export async function POST(
  req: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { all } = await params;
    const slug = resolveSlug(all);
    const body = await req.json();

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
    }

    const title =
      body?.root?.props?.title ??
      body?.root?.title ??
      slug
        .split('/')
        .pop()
        ?.replace(/-/g, ' ')
        ?.replace(/\b\w/g, (c: string) => c.toUpperCase()) ??
      'Untitled';

    const theme = body?.root?.props?.theme ?? 'malta-gold';

    const { error } = await supabaseAdmin.from('cms_pages').upsert(
      {
        slug,
        title,
        data: body,
        theme,
        published: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'slug' }
    );

    if (error) {
      console.error(`[Puck API] POST /${slug} error:`, error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, slug, title });
  } catch (err) {
    console.error('[Puck API] POST unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/** PATCH /api/puck/[...slug] — toggle published status */
export async function PATCH(
  req: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { all } = await params;
    const slug = resolveSlug(all);
    const { published } = await req.json();

    const { error } = await supabaseAdmin
      .from('cms_pages')
      .update({
        published: Boolean(published),
        updated_at: new Date().toISOString(),
      })
      .eq('slug', slug);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, slug, published });
  } catch (err) {
    console.error('[Puck API] PATCH unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/** DELETE /api/puck/[...slug] — delete a page */
export async function DELETE(
  _req: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { all } = await params;
    const slug = resolveSlug(all);

    const { error } = await supabaseAdmin
      .from('cms_pages')
      .delete()
      .eq('slug', slug);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, slug });
  } catch (err) {
    console.error('[Puck API] DELETE unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
