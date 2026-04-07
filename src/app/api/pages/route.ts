/**
 * @fileoverview Pages list API — for admin page manager.
 * GET /api/pages — returns all cms_pages rows (id, slug, title, published, theme, updated_at)
 * Always returns { pages: [] } — never undefined, never crashes .map()
 */
import { NextResponse } from 'next/server';
import { getAllPages } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  const pages = await getAllPages(); // safe — returns [] on error
  return NextResponse.json({ pages });
}
