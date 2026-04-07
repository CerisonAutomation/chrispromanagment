// =============================================================================
// CANONICAL PUCK API ROOT
// Health check endpoint
// =============================================================================

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "christiano-property-management-api",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
}