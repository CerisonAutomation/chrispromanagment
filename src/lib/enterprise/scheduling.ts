// =============================================================================
// Scheduled Publishing Service
// =============================================================================

import {db} from '@/lib/db';
import {createAuditLog} from './audit';
import {triggerWebhooks} from './webhooks';

export interface ScheduledPublish {
  pageId: string;
  slug: string;
  scheduledFor: Date;
}

/**
 * Schedule a page for future publishing
 */
export async function schedulePublish(
  pageId: string,
  scheduledFor: Date,
  userId?: string,
  userName?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const page = await db.cmsPage.findUnique({
      where: { id: pageId },
    });
    
    if (!page) {
      return { success: false, message: 'Page not found' };
    }
    
    if (page.workflowState !== 'APPROVED') {
      return { success: false, message: 'Page must be approved before scheduling' };
    }
    
    await db.cmsPage.update({
      where: { id: pageId },
      data: {
        scheduledFor,
        status: 'SCHEDULED',
      },
    });
    
    await createAuditLog({
      action: 'SCHEDULE',
      pageId,
      userId,
      userName,
      details: {
        scheduledFor: scheduledFor.toISOString(),
        action: 'schedule_publish',
      },
      resourceType: 'page',
      resourceId: pageId,
    });
    
    return { success: true, message: 'Page scheduled for publishing' };
  } catch (error) {
    console.error('Schedule publish error:', error);
    return { success: false, message: 'Failed to schedule publishing' };
  }
}

/**
 * Cancel a scheduled publish
 */
export async function cancelScheduledPublish(
  pageId: string,
  userId?: string,
  userName?: string
): Promise<{ success: boolean; message: string }> {
  try {
    await db.cmsPage.update({
      where: { id: pageId },
      data: {
        scheduledFor: null,
        status: 'APPROVED',
      },
    });
    
    await createAuditLog({
      action: 'UPDATE',
      pageId,
      userId,
      userName,
      details: {
        action: 'cancel_scheduled_publish',
      },
      resourceType: 'page',
      resourceId: pageId,
    });
    
    return { success: true, message: 'Scheduled publish cancelled' };
  } catch (error) {
    console.error('Cancel scheduled publish error:', error);
    return { success: false, message: 'Failed to cancel scheduled publish' };
  }
}

/**
 * Process scheduled publishes (called by cron or scheduler)
 */
export async function processScheduledPublishes(): Promise<{
  processed: number;
  failed: number;
  errors: string[];
}> {
  const now = new Date();
  const results = { processed: 0, failed: 0, errors: [] as string[] };
  
  try {
    const scheduledPages = await db.cmsPage.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledFor: {
          lte: now,
        },
      },
    });
    
    for (const page of scheduledPages) {
      try {
        // Publish the page
        await db.cmsPage.update({
          where: { id: page.id },
          data: {
            publishedData: page.draftData,
            status: 'PUBLISHED',
            publishedAt: now,
            scheduledFor: null,
          },
        });
        
        // Create audit log
        await createAuditLog({
          action: 'PUBLISH',
          pageId: page.id,
          details: {
            automaticPublish: true,
            scheduledFor: page.scheduledFor?.toISOString(),
          },
          resourceType: 'page',
          resourceId: page.id,
        });
        
        // Trigger webhooks
        await triggerWebhooks('PAGE_PUBLISHED', {
          pageId: page.id,
          slug: page.slug,
          title: page.title,
        });
        
        results.processed++;
      } catch (error) {
        results.failed++;
        results.errors.push(`Failed to publish ${page.slug}: ${error}`);
      }
    }
    
    return results;
  } catch (error) {
    console.error('Process scheduled publishes error:', error);
    return { processed: 0, failed: 0, errors: [`Fatal error: ${error}`] };
  }
}

/**
 * Get all scheduled pages
 */
export async function getScheduledPages() {
  const pages = await db.cmsPage.findMany({
    where: { status: 'SCHEDULED' },
    orderBy: { scheduledFor: 'asc' },
    select: {
      id: true,
      slug: true,
      title: true,
      scheduledFor: true,
      updatedAt: true,
    },
  });
  
  return pages;
}

/**
 * Get upcoming publishes for calendar view
 */
export async function getUpcomingPublishes(days: number = 7) {
  const now = new Date();
  const future = new Date();
  future.setDate(future.getDate() + days);
  
  const pages = await db.cmsPage.findMany({
    where: {
      scheduledFor: {
        gte: now,
        lte: future,
      },
    },
    orderBy: { scheduledFor: 'asc' },
  });
  
  return pages;
}
