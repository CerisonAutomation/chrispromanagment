/**
 * @fileoverview Puck CMS REST API — Supabase backend.
 * GET    /api/puck/[slug] — load page data for editor / renderer
 * POST   /api/puck/[slug] — save & publish page from Puck onPublish
 * PATCH  /api/puck/[slug] — toggle published flag
 * DELETE /api/puck/[slug] — delete page
 *
 * All handlers are defensively coded:
 *  - Never throws — always returns JSON
 *  - Supabase errors → logged + HTTP 500
 *  - Missing table / null data → returns EMPTY_DATA (never undefined)
 */
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

type RouteParams = { params: Promise<{ all: string[] }> };

const EMPTY_DATA = { content: [], root: { props: {} } };

function slug(all: string[]): string {
  return (all ?? []).filter(Boolean).join('/') || 'home';
}

export async function GET(_req: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  try {
    const s = slug((await params).all);
    const { data, error } = await supabaseAdmin
      .from('cms_pages')
      .select('data, title, theme, published, updated_at')
      .eq('slug', s)
      .maybeSingle();
    if (error) console.error(`[Puck GET /${s}]`, error.message);
    const pageData = data?.data;
    const safe =
      pageData && typeof pageData === 'object' && 'content' in pageData
        ? pageData
        : EMPTY_DATA;
    return NextResponse.json(safe, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    console.error('[Puck GET] unexpected:', e);
    return NextResponse.json(EMPTY_DATA);
  }
}

export async function POST(req: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  try {
    const s = slug((await params).all);
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
    }
    const title =
      (body as Record<string, unknown>)?.root?.props?.title ??
      s.split('/').pop()?.replace(/-/g, ' ')?.replace(/\b\w/g, (c: string) => c.toUpperCase()) ??
      'Untitled';
    const theme = (body as Record<string, unknown>)?.root?.props?.theme ?? 'malta-gold';
    const { error } = await supabaseAdmin.from('cms_pages').upsert(
      { slug: s, title, data: body, theme, published: true, updated_at: new Date().toISOString() },
      { onConflict: 'slug' }
    );
    if (error) {
      console.error(`[Puck POST /${s}]`, error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, slug: s, title });
  } catch (e) {
    console.error('[Puck POST] unexpected:', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  try {
    const s = slug((await params).all);
    const { published } = await req.json().catch(() => ({ published: false }));
    const { error } = await supabaseAdmin
      .from('cms_pages')
      .update({ published: Boolean(published), updated_at: new Date().toISOString() })
      .eq('slug', s);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, slug: s, published });
  } catch (e) {
    console.error('[Puck PATCH] unexpected:', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  try {
    const s = slug((await params).all);
    const { error } = await supabaseAdmin.from('cms_pages').delete().eq('slug', s);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, slug: s });
  } catch (e) {
    console.error('[Puck DELETE] unexpected:', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
