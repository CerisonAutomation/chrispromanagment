/**
 * @fileoverview Health check endpoint — /api/health
 * Returns 200 + runtime info. Used by Vercel, uptime monitors.
 */
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    version: process.env.npm_package_version ?? 'unknown',
  });
}
