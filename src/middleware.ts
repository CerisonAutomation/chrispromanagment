/**
 * @fileoverview Next.js middleware — admin auth guard + security headers.
 * /admin/* routes are protected. All routes get security headers.
 */
import { NextRequest, NextResponse } from 'next/server';

const ADMIN_PATHS = ['/admin', '/puck'];

export function middleware(req: NextRequest): NextResponse {
  const { pathname } = req.nextUrl;
  const res = NextResponse.next();

  // ─── Security headers ──────────────────────────────────────────────────
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-Frame-Options', 'SAMEORIGIN');
  res.headers.set('X-XSS-Protection', '1; mode=block');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // ─── Admin auth guard ─────────────────────────────────────────────────
  const isAdminPath = ADMIN_PATHS.some((p) => pathname.startsWith(p));
  if (isAdminPath) {
    const adminKey = req.cookies.get('admin_key')?.value;
    const expectedKey = process.env.ADMIN_SECRET_KEY;
    // Skip auth check if no secret set (dev mode) or key matches
    if (expectedKey && adminKey !== expectedKey) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = '/admin/login';
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return res;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};
