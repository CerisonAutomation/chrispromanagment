// =============================================================================
// PROXY - Catch-all /edit URL rewriting for Puck Editor
// Migrated from middleware (deprecated in Next.js 16+)
// Follows puck-main next-ai recipe pattern
// =============================================================================

import type {NextRequest} from "next/server";
import {NextResponse} from "next/server";

// Default export required by Next.js 16 proxy convention
export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if URL ends with /edit
  if (pathname.endsWith("/edit")) {
    // Remove /edit from the path and rewrite to /puck/[path]
    const pathWithoutEdit = pathname.slice(0, -5); // Remove '/edit'
    const url = request.nextUrl.clone();
    url.pathname = `/puck${pathWithoutEdit}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except static files and API routes
    "/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};