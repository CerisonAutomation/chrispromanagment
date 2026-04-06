// =============================================================================
// Enterprise CMS Types
// =============================================================================

export type UserRole = 'ADMIN' | 'EDITOR' | 'VIEWER';
export type WorkflowState = 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'PUBLISHED';
export type PageStatus = 'DRAFT' | 'REVIEW' | 'APPROVED' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED';
export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'PUBLISH' | 'UNPUBLISH' | 'SCHEDULE' | 'APPROVE' | 'REJECT' | 'LOGIN' | 'LOGOUT' | 'PERMISSION_CHANGE' | 'WEBHOOK_TRIGGERED' | 'AB_TEST_START' | 'AB_TEST_END' | 'AB_TEST_WINNER' | 'ASSET_UPLOAD' | 'ASSET_DELETE' | 'VERSION_RESTORE' | 'LOCALE_CHANGE';
export type ABTestStatus = 'DRAFT' | 'RUNNING' | 'PAUSED' | 'COMPLETED';
export type WebhookEvent = 'PAGE_PUBLISHED' | 'PAGE_UPDATED' | 'PAGE_DELETED' | 'PAGE_SCHEDULED' | 'ASSET_UPLOADED' | 'USER_CREATED' | 'USER_UPDATED' | 'AB_TEST_STARTED' | 'AB_TEST_COMPLETED' | 'CONTENT_REVIEW_REQUESTED' | 'CONTENT_APPROVED';

// =============================================================================
// Permission System
// =============================================================================

export interface Permission {
  canEdit: boolean;
  canPublish: boolean;
  canDelete: boolean;
  canManageUsers: boolean;
  canViewAnalytics: boolean;
  canApprove: boolean;
  canSchedule: boolean;
  canCreateABTests: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission> = {
  ADMIN: {
    canEdit: true,
    canPublish: true,
    canDelete: true,
    canManageUsers: true,
    canViewAnalytics: true,
    canApprove: true,
    canSchedule: true,
    canCreateABTests: true,
  },
  EDITOR: {
    canEdit: true,
    canPublish: true,
    canDelete: false,
    canManageUsers: false,
    canViewAnalytics: true,
    canApprove: false,
    canSchedule: true,
    canCreateABTests: false,
  },
  VIEWER: {
    canEdit: false,
    canPublish: false,
    canDelete: false,
    canManageUsers: false,
    canViewAnalytics: false,
    canApprove: false,
    canSchedule: false,
    canCreateABTests: false,
  },
};

// =============================================================================
// User Types
// =============================================================================

export interface EnterpriseUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  isActive: boolean;
  lastLoginAt?: string;
  permissions: Permission;
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// Workflow Types
// =============================================================================

export interface WorkflowTransition {
  from: WorkflowState;
  to: WorkflowState;
  action: string;
  requiredRole: UserRole;
}

export const WORKFLOW_TRANSITIONS: WorkflowTransition[] = [
  { from: 'DRAFT', to: 'IN_REVIEW', action: 'submit_for_review', requiredRole: 'EDITOR' },
  { from: 'IN_REVIEW', to: 'DRAFT', action: 'request_changes', requiredRole: 'ADMIN' },
  { from: 'IN_REVIEW', to: 'APPROVED', action: 'approve', requiredRole: 'ADMIN' },
  { from: 'APPROVED', to: 'DRAFT', action: 'unapprove', requiredRole: 'ADMIN' },
  { from: 'APPROVED', to: 'PUBLISHED', action: 'publish', requiredRole: 'ADMIN' },
  { from: 'PUBLISHED', to: 'DRAFT', action: 'unpublish', requiredRole: 'ADMIN' },
];

// =============================================================================
// Audit Log Types
// =============================================================================

export interface AuditLogEntry {
  id: string;
  pageId?: string;
  action: AuditAction;
  details?: Record<string, any>;
  userId?: string;
  userName?: string;
  ipAddress?: string;
  userAgent?: string;
  resourceType?: string;
  resourceId?: string;
  previousState?: string;
  newState?: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  createdAt: string;
}

// =============================================================================
// A/B Test Types
// =============================================================================

export interface ABTest {
  id: string;
  pageId: string;
  name: string;
  description?: string;
  variantAData: any;
  variantBData: any;
  trafficSplit: number;
  primaryGoal: string;
  status: ABTestStatus;
  variantAConversions: number;
  variantBConversions: number;
  variantAVisitors: number;
  variantBVisitors: number;
  confidenceLevel: number;
  winner: 'A' | 'B' | 'NONE';
  startedAt?: string;
  endedAt?: string;
  createdAt: string;
}

export interface ABTestResult {
  variant: 'A' | 'B';
  visitors: number;
  conversions: number;
  conversionRate: number;
  improvement: number; // percentage improvement over control
}

// =============================================================================
// Webhook Types
// =============================================================================

export interface Webhook {
  id: string;
  name: string;
  url: string;
  secret?: string;
  events: WebhookEvent[];
  isActive: boolean;
  headers?: Record<string, string>;
  retryCount: number;
  retryDelay: number;
  successCount: number;
  failureCount: number;
  lastTriggered?: string;
  createdAt: string;
}

export interface WebhookPayload {
  event: WebhookEvent;
  timestamp: string;
  data: any;
}

// =============================================================================
// Content Calendar Types
// =============================================================================

export interface CalendarEvent {
  id: string;
  pageId?: string;
  title: string;
  description?: string;
  eventType: 'PUBLISH' | 'REVIEW' | 'MEETING' | 'CAMPAIGN' | 'SEASONAL' | 'CUSTOM';
  startDate: string;
  endDate?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  recurrence?: {
    pattern: string;
    days?: string[];
  };
  reminders: string[];
  assignedTo?: string;
  createdAt: string;
}

// =============================================================================
// CDN Types
// =============================================================================

export interface CDNConfig {
  provider: 'cloudflare' | 'vercel' | 'aws' | 'custom';
  isActive: boolean;
  config: Record<string, any>;
  customDomain?: string;
  cdnZone?: string;
  cacheTTL: number;
  purgeOnUpdate: boolean;
}

export interface CDNStats {
  hitCount: number;
  missCount: number;
  bandwidth: number;
  hitRate: number;
}

// =============================================================================
// Preview Types
// =============================================================================

export interface PreviewLink {
  id: string;
  pageSlug: string;
  token: string;
  isActive: boolean;
  maxViews?: number;
  viewCount: number;
  expiresAt?: string;
  createdBy?: string;
  createdAt: string;
  lastAccessed?: string;
}

// =============================================================================
// Localization Types
// =============================================================================

export interface Translation {
  locale: string;
  content: Record<string, any>;
  isComplete: boolean;
  lastUpdated: string;
}

export const SUPPORTED_LOCALES = [
  { code: 'en', name: 'English', nativeName: 'English', isDefault: true },
  { code: 'mt', name: 'Maltese', nativeName: 'Malti', isDefault: false },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', isDefault: false },
  { code: 'de', name: 'German', nativeName: 'Deutsch', isDefault: false },
  { code: 'fr', name: 'French', nativeName: 'Français', isDefault: false },
] as const;

export type LocaleCode = typeof SUPPORTED_LOCALES[number]['code'];

// =============================================================================
// Version/Diff Types
// =============================================================================

export interface PageVersion {
  id: string;
  pageId: string;
  data: any;
  diffFrom?: string;
  baseVersion?: string;
  message?: string;
  authorId?: string;
  authorName?: string;
  blocksAdded: number;
  blocksRemoved: number;
  blocksModified: number;
  diffData?: string;
  createdAt: string;
}

export interface VersionDiff {
  added: any[];
  removed: any[];
  modified: {
    id: string;
    before: any;
    after: any;
  }[];
}
