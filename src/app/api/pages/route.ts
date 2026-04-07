/**
 * @fileoverview Pages list API — returns all CMS pages.
 * GET /api/pages → { pages: CmsPage[] } — always array, never undefined.
 */
import { NextResponse } from 'next/server';
import { getAllPages } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  const pages = await getAllPages();
  return NextResponse.json({ pages });
}
