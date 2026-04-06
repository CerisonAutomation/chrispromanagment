// =============================================================================
// Enterprise Workflow Service
// =============================================================================

import {db} from '@/lib/db';
import {createAuditLog} from './audit';
import type {UserRole, WorkflowState} from './types';

export interface WorkflowTransitionResult {
  success: boolean;
  newState?: WorkflowState;
  message?: string;
}

export interface TransitionParams {
  pageId: string;
  fromState: WorkflowState;
  toState: WorkflowState;
  userId: string;
  userName: string;
  notes?: string;
}

/**
 * Transition a page's workflow state
 */
export async function transitionWorkflow(params: TransitionParams): Promise<WorkflowTransitionResult> {
  const { pageId, fromState, toState, userId, userName, notes } = params;
  
  // Validate transition
  const validTransitions: Record<string, WorkflowState[]> = {
    'DRAFT': ['IN_REVIEW'],
    'IN_REVIEW': ['DRAFT', 'APPROVED'],
    'APPROVED': ['DRAFT', 'PUBLISHED'],
    'PUBLISHED': ['DRAFT'],
  };
  
  const allowedStates = validTransitions[fromState] || [];
  if (!allowedStates.includes(toState)) {
    return {
      success: false,
      message: `Invalid transition from ${fromState} to ${toState}`,
    };
  }
  
  try {
    // Update page
    const updateData: any = {
      workflowState: toState,
      updatedAt: new Date(),
    };
    
    // Set additional fields based on transition
    if (toState === 'IN_REVIEW') {
      updateData.assignedTo = userId;
    } else if (toState === 'APPROVED') {
      updateData.reviewedBy = userId;
      updateData.reviewedAt = new Date();
      updateData.reviewNotes = notes || null;
    } else if (toState === 'PUBLISHED') {
      updateData.status = 'PUBLISHED';
      updateData.publishedAt = new Date();
    } else if (toState === 'DRAFT' && fromState === 'PUBLISHED') {
      updateData.status = 'DRAFT';
    }
    
    const page = await db.cmsPage.update({
      where: { id: pageId },
      data: updateData,
    });
    
    // Create audit log
    await createAuditLog({
      action: 'UPDATE',
      pageId,
      userId,
      userName,
      details: {
        workflowTransition: true,
        fromState,
        toState,
        notes,
      },
      previousState: fromState,
      newState: toState,
      resourceType: 'page',
      resourceId: pageId,
    });
    
    return {
      success: true,
      newState: toState as WorkflowState,
      message: `Page moved from ${fromState} to ${toState}`,
    };
  } catch (error) {
    console.error('Workflow transition error:', error);
    return {
      success: false,
      message: 'Failed to transition workflow state',
    };
  }
}

/**
 * Get workflow history for a page
 */
export async function getWorkflowHistory(pageId: string) {
  const logs = await db.auditLog.findMany({
    where: {
      pageId,
      resourceType: 'page',
      details: {
        contains: 'workflowTransition',
      },
    },
    orderBy: { createdAt: 'desc' },
  });
  
  return logs.map(log => {
    const details = log.details ? JSON.parse(log.details) : {};
    return {
      id: log.id,
      fromState: details.fromState,
      toState: details.toState,
      userName: log.userName,
      notes: details.notes,
      timestamp: log.createdAt,
    };
  });
}

/**
 * Get pages pending review
 */
export async function getPagesPendingReview() {
  const pages = await db.cmsPage.findMany({
    where: { workflowState: 'IN_REVIEW' },
    orderBy: { updatedAt: 'desc' },
  });
  
  return pages;
}

/**
 * Get workflow statistics
 */
export async function getWorkflowStats() {
  const [draft, inReview, approved, published] = await Promise.all([
    db.cmsPage.count({ where: { workflowState: 'DRAFT' } }),
    db.cmsPage.count({ where: { workflowState: 'IN_REVIEW' } }),
    db.cmsPage.count({ where: { workflowState: 'APPROVED' } }),
    db.cmsPage.count({ where: { workflowState: 'PUBLISHED' } }),
  ]);
  
  return {
    draft,
    inReview,
    approved,
    published,
    total: draft + inReview + approved + published,
  };
}

/**
 * Check if user can perform a specific workflow action
 */
export function canPerformWorkflowAction(
  role: UserRole,
  action: string
): boolean {
  const rolePermissions: Record<string, string[]> = {
    'ADMIN': ['submit_for_review', 'approve', 'reject', 'publish', 'unpublish', 'request_changes'],
    'EDITOR': ['submit_for_review'],
    'VIEWER': [],
  };
  
  return rolePermissions[role]?.includes(action) || false;
}

/**
 * Get available workflow actions for a state and role
 */
export function getAvailableWorkflowActions(role: UserRole, state: WorkflowState): string[] {
  const actionsByState: Record<string, { action: string; roles: UserRole[] }[]> = {
    'DRAFT': [
      { action: 'edit', roles: ['ADMIN', 'EDITOR'] },
      { action: 'submit_for_review', roles: ['ADMIN', 'EDITOR'] },
      { action: 'delete', roles: ['ADMIN'] },
    ],
    'IN_REVIEW': [
      { action: 'approve', roles: ['ADMIN'] },
      { action: 'request_changes', roles: ['ADMIN'] },
    ],
    'APPROVED': [
      { action: 'publish', roles: ['ADMIN'] },
      { action: 'unapprove', roles: ['ADMIN'] },
    ],
    'PUBLISHED': [
      { action: 'unpublish', roles: ['ADMIN'] },
      { action: 'create_schedule', roles: ['ADMIN'] },
    ],
  };
  
  const actions = actionsByState[state] || [];
  return actions
    .filter(a => a.roles.includes(role))
    .map(a => a.action);
}
