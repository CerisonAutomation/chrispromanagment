/**
 * @fileoverview GET /api/health — liveness + readiness check.
 * Used by Vercel, uptime monitors, and CI smoke tests.
 */
import { NextResponse } from 'next/server';
import { cmsPage } from '@/lib/db';

export const runtime = 'nodejs';
export const revalidate = 0;

export async function GET() {
  const start = Date.now();
  let dbOk = false;
  let dbLatencyMs = 0;

  try {
    const t = Date.now();
    // Check database connection using cmsPage helper
    await cmsPage.findMany();
    dbLatencyMs = Date.now() - t;
    dbOk = true;
  } catch {
    dbOk = false;
  }

  const status = dbOk ? 200 : 503;
  return NextResponse.json(
    {
      status: dbOk ? 'ok' : 'degraded',
      db: { ok: dbOk, latencyMs: dbLatencyMs },
      uptime: process.uptime(),
      ts: new Date().toISOString(),
      totalMs: Date.now() - start,
    },
    { status }
  );
}
