/**
 * @fileoverview Next.js Middleware — Supabase session refresh + /admin route guard + /edit proxy.
 *
 * Protected routes: /admin/*
 * Auth provider: Supabase (cookie-based sessions)
 * Proxy: /edit URLs rewritten to /puck
 */
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Proxy: /edit URL rewriting for Puck Editor ──────────────────────────────
  if (pathname.endsWith('/edit')) {
    const pathWithoutEdit = pathname.slice(0, -5); // Remove '/edit'
    const url = request.nextUrl.clone();
    url.pathname = `/puck${pathWithoutEdit}`;
    return NextResponse.rewrite(url);
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — required on every request for SSR session access
  const { data: { user } } = await supabase.auth.getUser();

  // Guard /admin routes — redirect to /admin/login if unauthenticated
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/admin/login';
      loginUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect authenticated users away from login page
  if (pathname === '/admin/login' && user) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = '/admin';
    return NextResponse.redirect(dashboardUrl);
  }

  return response;
}

export const config = {
  matcher: [
    // Match all except static files and _next
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
