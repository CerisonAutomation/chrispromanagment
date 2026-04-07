/**
 * @fileoverview GET /api/health — liveness + readiness check.
 * Used by Vercel, uptime monitors, and CI smoke tests.
 */
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';
export const revalidate = 0;

export async function GET() {
  const start = Date.now();
  let dbOk = false;
  let dbLatencyMs = 0;

  try {
    const t = Date.now();
    const { error } = await supabaseAdmin
      .from('cms_pages')
      .select('id')
      .limit(1)
      .single();
    dbLatencyMs = Date.now() - t;
    dbOk = !error || error.code === 'PGRST116'; // PGRST116 = no rows, DB is fine
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
