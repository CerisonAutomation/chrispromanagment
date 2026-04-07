/**
 * @fileoverview Admin auth API — validates admin key, sets httpOnly cookie.
 * POST /api/admin/auth { key: string }
 */
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { key } = await req.json() as { key?: string };
    const expected = process.env.ADMIN_SECRET_KEY;

    // If no secret set (dev mode), allow any key
    if (!expected || key === expected) {
      const res = NextResponse.json({ ok: true });
      res.cookies.set('admin_key', key ?? '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
      return res;
    }
    return NextResponse.json({ error: 'Invalid key' }, { status: 401 });
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
}
