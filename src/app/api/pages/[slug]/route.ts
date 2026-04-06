import {db} from "@/lib/db";
import {NextRequest, NextResponse} from "next/server";
import type {Data, ComponentData} from "@puckeditor/core";

// =============================================================================
// GET /api/pages/[slug] - Fetch page (draft or published based on query)
// =============================================================================

export async function GET(
    request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const {searchParams} = new URL(request.url);
    const status = searchParams.get("status") || "draft";

    const page = await db.cmsPage.findUnique({
      where: {slug},
      include: {
        versions: {
          orderBy: {createdAt: "desc"},
          take: 10,
        },
      },
    });

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    // Return appropriate data based on requested status
    const responseData = {
      id: page.id,
      slug: page.slug,
      title: page.title,
      status: page.status,
      // Return draft data for editing, published for viewing
      draftData: page.draftData ? JSON.parse(page.draftData) : {content: [], root: {props: {}}},
      publishedData: page.publishedData ? JSON.parse(page.publishedData) : null,
      // SEO metadata
      metaTitle: page.metaTitle,
      metaDescription: page.metaDescription,
      metaKeywords: page.metaKeywords,
      ogTitle: page.ogTitle,
      ogDescription: page.ogDescription,
      ogImage: page.ogImage,
      canonicalUrl: page.canonicalUrl,
      noIndex: page.noIndex,
      structuredData: page.structuredData,
      // Timestamps
      publishedAt: page.publishedAt?.toISOString() || null,
      updatedAt: page.updatedAt.toISOString(),
      // Versions
      versions: page.versions.map((v) => ({
        id: v.id,
        message: v.message,
        authorName: v.authorName,
        createdAt: v.createdAt.toISOString(),
        blocksAdded: v.blocksAdded,
        blocksRemoved: v.blocksRemoved,
        blocksModified: v.blocksModified,
      })),
    };

    // Log audit for view (only for published requests)
    if (status === "published") {
      await db.auditLog.create({
        data: {
          pageId: page.id,
          action: "VIEW",
          details: JSON.stringify({source: "public", status}),
        },
      });
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("[Page API] GET error:", error);
    return NextResponse.json({ error: "Failed to fetch page" }, { status: 500 });
  }
}

// =============================================================================
// PUT /api/pages/[slug] - Save page (draft or published)
// =============================================================================

export async function PUT(
    request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const {title, data, saveAsDraft = true, meta} = body;

    // Calculate changes for version tracking
    const existingPage = await db.cmsPage.findUnique({
      where: {slug},
    });

    let changes = {added: 0, removed: 0, modified: 0};
    if (existingPage?.draftData) {
      const oldData = JSON.parse(existingPage.draftData) as Data;
      const newData = data as Data;
      changes = calculateChanges(oldData, newData);
    }

    // Update page with proper separation
    const updateData: Record<string, unknown> = {
      title,
      updatedAt: new Date(),
    };

    if (saveAsDraft) {
      // Save to draft workspace only
      updateData.draftData = JSON.stringify(data);
      updateData.status = "DRAFT";
    } else {
      // Save to both draft and published
      updateData.draftData = JSON.stringify(data);
      updateData.publishedData = JSON.stringify(data);
      updateData.status = "PUBLISHED";
      updateData.publishedAt = new Date();
    }

    // Update SEO metadata if provided
    if (meta) {
      updateData.metaTitle = meta.title;
      updateData.metaDescription = meta.description;
      updateData.metaKeywords = JSON.stringify(meta.keywords || []);
      updateData.ogTitle = meta.ogTitle;
      updateData.ogDescription = meta.ogDescription;
      updateData.ogImage = meta.ogImage;
      updateData.canonicalUrl = meta.canonicalUrl;
      updateData.noIndex = meta.noIndex || false;
      updateData.structuredData = meta.structuredData ? JSON.stringify(meta.structuredData) : null;
    }

    const page = await db.cmsPage.update({
      where: { slug },
      data: updateData,
    });

    // Create version snapshot
    await db.pageVersion.create({
      data: {
        pageId: page.id,
        data: JSON.stringify(data),
        message: saveAsDraft ? "Draft saved" : "Published",
        blocksAdded: changes.added,
        blocksRemoved: changes.removed,
        blocksModified: changes.modified,
      },
    });

    // Log audit
    await db.auditLog.create({
      data: {
        pageId: page.id,
        action: saveAsDraft ? "UPDATE" : "PUBLISH",
        details: JSON.stringify({changes}),
      },
    });

    return NextResponse.json({
      id: page.id,
      slug: page.slug,
      title: page.title,
      status: page.status,
      updatedAt: page.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("[Page API] PUT error:", error);
    return NextResponse.json({error: "Failed to save page"}, {status: 500});
  }
}

// =============================================================================
// DELETE /api/pages/[slug] - Delete page
// =============================================================================

export async function DELETE(
    _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const page = await db.cmsPage.delete({
      where: {slug},
    });

    // Log audit
    await db.auditLog.create({
      data: {
        pageId: page.id,
        action: "DELETE",
        details: JSON.stringify({slug, deletedAt: new Date().toISOString()}),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Page API] DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete page" }, { status: 500 });
  }
}

// =============================================================================
// HELPERS - Change detection for version tracking
// =============================================================================

function calculateChanges(oldData: Data, newData: Data) {
  const oldContent = oldData.content || [];
  const newContent = newData.content || [];

  const oldIds = new Set(oldContent.map((c: ComponentData) => c.props.id));
  const newIds = new Set(newContent.map((c: ComponentData) => c.props.id));

  const added = newContent.filter((c: ComponentData) => !oldIds.has(c.props.id)).length;
  const removed = oldContent.filter((c: ComponentData) => !newIds.has(c.props.id)).length;

  // Modified = same ID but different props
  const modified = newContent.filter((newBlock: ComponentData) => {
    const oldBlock = oldContent.find((o: ComponentData) => o.props.id === newBlock.props.id);
    if (!oldBlock) return false;
    return JSON.stringify(oldBlock.props) !== JSON.stringify(newBlock.props);
  }).length;

  return {added, removed, modified};
}
