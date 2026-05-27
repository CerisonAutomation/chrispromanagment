/**
 * @fileoverview Next.js Middleware — Supabase session refresh + /admin route guard
 *
 * Protected routes: /admin/*
 * Auth provider: Supabase (cookie-based sessions)
 * Admin check: Verifies user has admin role/email
 * Proxy: /edit URLs rewritten to /puck
 */
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Support both new publishable key and legacy anon key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY 
  || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Admin emails from environment variable
const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim().toLowerCase()) || [];

/**
 * Check if user has admin privileges
 */
function checkIsAdmin(email: string | undefined): boolean {
  if (!email) return false;
  
  // Check against admin emails list
  if (adminEmails.includes(email.toLowerCase())) return true;
  
  // Check if email domain matches (optional)
  const adminDomain = process.env.ADMIN_EMAIL_DOMAIN;
  if (adminDomain && email.toLowerCase().endsWith(`@${adminDomain.toLowerCase()}`)) return true;
  
  return false;
}

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

  const supabase = createServerClient(supabaseUrl, supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Refresh session — required on every request for SSR session access
  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    // Session error - treat as unauthenticated
    user = null;
  }

  // Redirect /admin/login to /admin if already logged in as admin
  if (pathname === '/admin/login' || pathname.startsWith('/admin/login/')) {
    if (user && checkIsAdmin(user.email)) {
      const dashboardUrl = request.nextUrl.clone();
      dashboardUrl.pathname = '/admin';
      return NextResponse.redirect(dashboardUrl);
    }
    // Not logged in or not admin - redirect to /login (outside admin layout)
    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/login';
      return NextResponse.redirect(loginUrl);
    }
  }

  // Guard /admin routes — redirect to /admin/login if unauthenticated or not admin
  if (pathname.startsWith('/admin')) {
    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/admin/login';
      loginUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    // Check admin privileges
    if (!checkIsAdmin(user.email)) {
      const forbiddenUrl = request.nextUrl.clone();
      forbiddenUrl.pathname = '/forbidden';
      return NextResponse.redirect(forbiddenUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    // Match all except static files and _next
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
