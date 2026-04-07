/**
 * @fileoverview Puck CMS REST API — Supabase backend.
 * GET    /api/puck/[slug] — load page data
 * POST   /api/puck/[slug] — save & publish
 * PATCH  /api/puck/[slug] — toggle published
 * DELETE /api/puck/[slug] — delete page
 */
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, EMPTY_DATA } from '@/lib/supabase';

type Ctx = { params: Promise<{ all: string[] }> };

function slug(all: string[]): string {
  return (all ?? []).filter(Boolean).join('/') || 'home';
}

function jsonErr(msg: string, status = 400): NextResponse {
  return NextResponse.json({ error: msg }, { status });
}

export async function GET(_req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  try {
    const s = slug((await params).all);
    const { data, error } = await supabaseAdmin
      .from('cms_pages').select('data').eq('slug', s).maybeSingle();
    if (error) console.error(`[CMS GET /${s}]`, error.message);
    const d = data?.data;
    const safe = d && typeof d === 'object' && Array.isArray((d as Record<string,unknown>).content)
      ? d : EMPTY_DATA;
    return NextResponse.json(safe, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    console.error('[CMS GET]', e);
    return NextResponse.json(EMPTY_DATA);
  }
}

export async function POST(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  try {
    const s = slug((await params).all);
    const body = await req.json().catch(() => null) as Record<string, unknown> | null;
    if (!body || typeof body !== 'object') return jsonErr('Invalid body');
    const title = String(
      (body?.root as Record<string,unknown>)?.props &&
      (body.root as Record<string,unknown>)?.props
        ? ((body.root as Record<string,unknown>).props as Record<string,unknown>).title ?? s
        : s
    );
    const theme = String(
      ((body?.root as Record<string,unknown>)?.props as Record<string,unknown>)?.theme ?? 'malta-gold'
    );
    const { error } = await supabaseAdmin.from('cms_pages').upsert(
      { slug: s, title, data: body, theme, published: true, updated_at: new Date().toISOString() },
      { onConflict: 'slug' }
    );
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, slug: s, title });
  } catch (e) {
    console.error('[CMS POST]', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  try {
    const s = slug((await params).all);
    const body = await req.json().catch(() => ({})) as { published?: boolean };
    const { error } = await supabaseAdmin
      .from('cms_pages')
      .update({ published: Boolean(body.published), updated_at: new Date().toISOString() })
      .eq('slug', s);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, slug: s, published: body.published });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  try {
    const s = slug((await params).all);
    const { error } = await supabaseAdmin.from('cms_pages').delete().eq('slug', s);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, slug: s });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
