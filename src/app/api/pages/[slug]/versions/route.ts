import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// =============================================================================
// GET /api/pages/[slug]/versions - Get page version history
// =============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Get page
    const page = await db.cmsPage.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!page) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      );
    }

    // Get versions
    const versions = await db.pageVersion.findMany({
      where: { pageId: page.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        data: true,
        message: true,
        authorName: true,
        createdAt: true,
        blocksAdded: true,
        blocksRemoved: true,
        blocksModified: true,
      },
      take: 50, // Limit to last 50 versions
    });

    return NextResponse.json(versions);
  } catch (error) {
    console.error('[Versions API] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch versions' },
      { status: 500 }
    );
  }
}
