import {revalidatePath} from "next/cache";
import {db} from "@/lib/db";
import {cmsPages, pageVersions} from "@/lib/db/schema";
import {NextResponse} from "next/server";
import type {Data} from "@puckeditor/core";
import {createApiError, createRequestLogger, ErrorCodes} from "@/lib/error";
import {eq, asc} from "drizzle-orm";

// ============================================================
// GET handler
// ============================================================

export async function GET() {
  const log = createRequestLogger(`pages-get-${Date.now()}`);

  try {
    const pages = await db.query.cmsPages.findMany({
      columns: { id: true, slug: true, title: true, status: true, updatedAt: true },
      orderBy: asc(cmsPages.createdAt),
    });

    log.info("Pages fetched", {count: pages.length});
    return NextResponse.json(pages);
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    log.error("Failed to fetch pages", err);
    return NextResponse.json(
        createApiError("Failed to fetch pages", ErrorCodes.DATABASE_ERROR),
        {status: 500}
    );
  }
}

// ============================================================
// POST handler
// ============================================================

export async function POST(request: Request) {
  const log = createRequestLogger(`pages-post-${Date.now()}`);

  try {
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
          createApiError("Invalid JSON in request body", ErrorCodes.VALIDATION_ERROR),
          {status: 400}
      );
    }

    const {slug, path, title, data, status, publish = false} = body as {
      slug?: string;
      path?: string;
      title?: string;
      data?: Data;
      status?: string;
      publish?: boolean;
    };

    const pageSlug = slug || path;
    if (!pageSlug || !data) {
      return NextResponse.json(
          createApiError("slug/path and data are required", ErrorCodes.VALIDATION_ERROR, {
            hasSlug: !!pageSlug,
            hasData: !!data,
          }),
          {status: 400}
      );
    }

    const pageTitle = title || data?.root?.props?.title || "Untitled Page";
    const dataString = JSON.stringify(data);

    // Check if page exists
    const existingPage = await db.query.cmsPages.findFirst({
      where: eq(cmsPages.slug, pageSlug),
    });

    let pageId: string;
    const now = new Date();

    if (existingPage) {
      // Update existing page
      await db.update(cmsPages).set({
        title: pageTitle,
        draftData: dataString,
        ...(publish && {
          publishedData: dataString,
          status: "PUBLISHED",
          publishedAt: now,
        }),
        updatedAt: now,
      }).where(eq(cmsPages.slug, pageSlug));
      pageId = existingPage.id;
    } else {
      // Create new page
      const id = crypto.randomUUID();
      await db.insert(cmsPages).values({
        id,
        slug: pageSlug,
        title: pageTitle,
        draftData: dataString,
        publishedData: publish ? dataString : null,
        status: publish ? "PUBLISHED" : "DRAFT",
        ...(publish && { publishedAt: now }),
        createdAt: now,
        updatedAt: now,
      });
      pageId = id;
    }

    const page = await db.query.cmsPages.findFirst({
      where: eq(cmsPages.id, pageId),
    });

    if (!page) {
      throw new Error("Failed to create/update page");
    }

    // Create version snapshot
    await db.insert(pageVersions).values({
      id: crypto.randomUUID(),
      pageId: page.id,
      data: dataString,
      message: publish ? "Published" : "Draft saved",
      blocksAdded: 0,
      blocksRemoved: 0,
      blocksModified: data?.content?.length || 0,
      createdAt: new Date(),
    });

    // Purge Next.js cache
    revalidatePath(pageSlug);

    log.info("Page saved", {pageId: page.id, slug: page.slug, publish});

    return NextResponse.json({
      success: true,
      pageId: page.id,
      slug: page.slug,
      title: page.title,
      pageStatus: page.status,
      updatedAt: page.updatedAt?.toISOString?.() || new Date().toISOString(),
    });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    log.error("Failed to save page", err);
    return NextResponse.json(
        createApiError("Failed to save page", ErrorCodes.DATABASE_ERROR),
        {status: 500}
    );
  }
}
