// =============================================================================
// Role-Based Access Control Service
// =============================================================================

import type {Permission, UserRole} from './types';
import {ROLE_PERMISSIONS} from './types';

/**
 * Get permissions for a given role
 */
export function getRolePermissions(role: UserRole): Permission {
  return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.VIEWER;
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(role: UserRole, permission: keyof Permission): boolean {
  return getRolePermissions(role)[permission];
}

/**
 * Check if user can perform an action on a page
 */
export function canEditPage(role: UserRole): boolean {
  return hasPermission(role, 'canEdit');
}

export function canPublishPage(role: UserRole): boolean {
  return hasPermission(role, 'canPublish');
}

export function canDeletePage(role: UserRole): boolean {
  return hasPermission(role, 'canDelete');
}

export function canApproveContent(role: UserRole): boolean {
  return hasPermission(role, 'canApprove');
}

export function canManageUsers(role: UserRole): boolean {
  return hasPermission(role, 'canManageUsers');
}

export function canScheduleContent(role: UserRole): boolean {
  return hasPermission(role, 'canSchedule');
}

/**
 * Check workflow transition permissions
 */
export function canTransitionWorkflow(
  role: UserRole,
  fromState: string,
  toState: string
): boolean {
  // Define workflow transitions and their required roles
  const transitions: Record<string, { to: string; requiredRole: UserRole }[]> = {
    'DRAFT': [
      { to: 'IN_REVIEW', requiredRole: 'EDITOR' },
    ],
    'IN_REVIEW': [
      { to: 'DRAFT', requiredRole: 'ADMIN' },
      { to: 'APPROVED', requiredRole: 'ADMIN' },
    ],
    'APPROVED': [
      { to: 'DRAFT', requiredRole: 'ADMIN' },
      { to: 'PUBLISHED', requiredRole: 'ADMIN' },
    ],
    'PUBLISHED': [
      { to: 'DRAFT', requiredRole: 'ADMIN' },
    ],
  };

  const allowedTransitions = transitions[fromState] || [];
  const transition = allowedTransitions.find(t => t.to === toState);
  
  if (!transition) return false;
  
  // Admin can do everything
  if (role === 'ADMIN') return true;
  
  // Otherwise check if role matches required role
  return role === transition.requiredRole;
}

/**
 * Get all possible actions for a user's current role and page state
 */
export function getAvailableActions(
  role: UserRole,
  workflowState: string,
  pageStatus: string
): string[] {
  const actions: string[] = [];
  
  // View always available
  actions.push('view');
  
  // Edit based on role and state
  if (canEditPage(role) && workflowState !== 'PUBLISHED') {
    actions.push('edit');
  }
  
  // Workflow transitions
  if (canTransitionWorkflow(role, workflowState, 'IN_REVIEW')) {
    actions.push('submit_for_review');
  }
  if (canTransitionWorkflow(role, workflowState, 'APPROVED')) {
    actions.push('approve');
  }
  if (canTransitionWorkflow(role, workflowState, 'DRAFT')) {
    actions.push('request_changes');
  }
  if (canTransitionWorkflow(role, workflowState, 'PUBLISHED')) {
    actions.push('publish');
  }
  
  // Delete
  if (canDeletePage(role)) {
    actions.push('delete');
  }
  
  // Schedule
  if (canScheduleContent(role) && pageStatus !== 'PUBLISHED') {
    actions.push('schedule');
  }
  
  // Version history
  actions.push('view_history');
  
  // Preview
  actions.push('create_preview');
  
  // A/B tests (admin only)
  if (hasPermission(role, 'canCreateABTests')) {
    actions.push('create_ab_test');
  }
  
  return actions;
}

/**
 * Filter sensitive data based on role
 */
export function filterDataByRole<T extends Record<string, any>>(
  data: T,
  role: UserRole
): Partial<T> {
  const filtered = { ...data };
  
  // Remove sensitive fields for viewers
  if (role === 'VIEWER') {
    delete (filtered as any).passwordHash;
    delete (filtered as any).secretKey;
  }
  
  return filtered;
}
