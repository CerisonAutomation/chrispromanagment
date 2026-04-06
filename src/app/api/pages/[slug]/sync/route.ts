import {NextRequest, NextResponse} from "next/server";
import {db} from "@/lib/db";

// =============================================================================
// BLOCK AUTOSYNC API - Real-time block synchronization
// =============================================================================

interface SyncChange {
  id: string;
  type: string;
  props: Record<string, unknown>;
  syncStatus?: string;
  lastModified?: number;
  version?: number;
}

interface SyncRequest {
  changes: SyncChange[];
  lastSyncAt: number;
  version: number;
}

interface SyncResponse {
  success: boolean;
  conflicts: string[];
  data?: {
    content: SyncChange[];
    meta: {
      updatedAt: string;
      version: number;
      lastModifiedBy: string;
    };
  };
  error?: string;
}

// POST /api/pages/[slug]/sync - Sync block changes
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body: SyncRequest = await req.json();
    const { changes, lastSyncAt, version } = body;

    // Get current page data
    const page = await db.cmsPage.findUnique({
      where: { slug },
    });

    if (!page) {
      return NextResponse.json<SyncResponse>({
        success: false,
        conflicts: [],
        error: "Page not found",
      }, { status: 404 });
    }

    // Parse current page data
    const currentData = page.data ? JSON.parse(page.data) : { content: [], root: { props: {} } };
    const currentContent: SyncChange[] = currentData.content || [];

    // Detect conflicts (blocks modified since last sync)
    const conflicts: string[] = [];
    const contentMap = new Map(currentContent.map((b) => [b.id, b]));

    for (const change of changes) {
      const existing = contentMap.get(change.id);
      if (existing && existing.lastModified && existing.lastModified > lastSyncAt) {
        // Conflict detected - this block was modified by someone else
        conflicts.push(change.id);
      }
    }

    // Apply non-conflicting changes
    const updatedContent = [...currentContent];
    const updatedMap = new Map(updatedContent.map((b) => [b.id, b]));

    for (const change of changes) {
      if (conflicts.includes(change.id)) continue; // Skip conflicts

      if (change.type === "__DELETE__") {
        // Remove block
        const idx = updatedContent.findIndex((b) => b.id === change.id);
        if (idx !== -1) updatedContent.splice(idx, 1);
        updatedMap.delete(change.id);
      } else {
        // Add or update block
        const idx = updatedContent.findIndex((b) => b.id === change.id);
        const blockWithMeta: SyncChange = {
          ...change,
          syncStatus: "synced",
          lastModified: Date.now(),
          version: (change.version || 0) + 1,
        };

        if (idx !== -1) {
          updatedContent[idx] = blockWithMeta;
        } else {
          updatedContent.push(blockWithMeta);
        }
        updatedMap.set(change.id, blockWithMeta);
      }
    }

    // Update page in database
    const newVersion = version + 1;
    const updatedData = {
      ...currentData,
      content: updatedContent,
      root: {
        ...currentData.root,
        updatedAt: new Date().toISOString(),
      },
      meta: {
        updatedAt: new Date().toISOString(),
        version: newVersion,
        lastModifiedBy: "admin",
      },
    };

    await db.cmsPage.update({
      where: { slug },
      data: {
        data: JSON.stringify(updatedData),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json<SyncResponse>({
      success: true,
      conflicts,
      data: {
        content: updatedContent,
        meta: updatedData.meta,
      },
    });
  } catch (error) {
    console.error("[sync] Error:", error);
    return NextResponse.json<SyncResponse>({
      success: false,
      conflicts: [],
      error: "Sync failed",
    }, { status: 500 });
  }
}

// GET /api/pages/[slug]/sync - Get sync status and current data
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const page = await db.cmsPage.findUnique({
      where: { slug },
    });

    if (!page) {
      return NextResponse.json<SyncResponse>({
        success: false,
        conflicts: [],
        error: "Page not found",
      }, { status: 404 });
    }

    const data = page.data ? JSON.parse(page.data) : { content: [], root: { props: {} } };

    return NextResponse.json<SyncResponse>({
      success: true,
      conflicts: [],
      data: {
        content: data.content || [],
        meta: data.meta || {
          updatedAt: page.updatedAt.toISOString(),
          version: 1,
          lastModifiedBy: "admin",
        },
      },
    });
  } catch (error) {
    console.error("[sync] Error:", error);
    return NextResponse.json<SyncResponse>({
      success: false,
      conflicts: [],
      error: "Failed to get sync status",
    }, { status: 500 });
  }
}
