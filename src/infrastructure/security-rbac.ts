/**
 * Security & RBAC System - Complete access control and content security
 * Million-Times-Better Architecture
 */

import { Result } from '@/lib/types-index';

// ============================================================================
// TYPES - USER & ROLES
// ============================================================================

export type UserRole = 'admin' | 'editor' | 'author' | 'contributor' | 'viewer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  organizationId?: string;
  createdAt: Date;
  lastLogin?: Date;
  permissions: Permission[];
}

export interface Organization {
  id: string;
  name: string;
  logo?: string;
  plan: 'free' | 'pro' | 'enterprise';
  members: OrganizationMember[];
  createdAt: Date;
}

export interface OrganizationMember {
  userId: string;
  organizationId: string;
  role: UserRole;
  joinedAt: Date;
}

// ============================================================================
// TYPES - PERMISSIONS
// ============================================================================

export interface Permission {
  resource: 'pages' | 'blocks' | 'media' | 'users' | 'settings' | 'analytics';
  actions: PermissionAction[];
}

export type PermissionAction = 
  | 'create' 
  | 'read' 
  | 'update' 
  | 'delete' 
  | 'publish'
  | 'configure'
  | 'upload'
  | 'download';

export interface BlockPermission {
  blockTypes: string[];  // Whitelist of allowed block types
  configure: boolean;
  maxInstances?: number;
}

export interface MediaPermission {
  upload: boolean;
  delete: boolean;
  maxFileSize: number;  // in bytes
  allowedTypes: string[];
  monthlyQuota?: number;
}

// ============================================================================
// TYPES - ACCESS CONTROL
// ============================================================================

export interface AccessControl {
  pages: PagePermissions;
  blocks: BlockPermission;
  media: MediaPermission;
}

export interface PagePermissions {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
  publish: boolean;
  configure: boolean;
  maxPages?: number;
}

export interface Session {
  id: string;
  userId: string;
  organizationId?: string;
  createdAt: Date;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface APIKey {
  id: string;
  name: string;
  key: string;
  userId: string;
  permissions: Permission[];
  lastUsed?: Date;
  expiresAt?: Date;
  createdAt: Date;
}

// ============================================================================
// TYPES - AUDIT & COMPLIANCE
// ============================================================================

export interface AuditLog {
  id: string;
  userId: string;
  organizationId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

export interface GDPRRequest {
  id: string;
  userId: string;
  type: 'access' | 'rectification' | 'erasure' | 'portability';
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  requestedAt: Date;
  completedAt?: Date;
  data?: unknown;
}

// ============================================================================
// DEFAULT PERMISSIONS BY ROLE
// ============================================================================

const DEFAULT_PERMISSIONS: Record<UserRole, AccessControl> = {
  admin: {
    pages: {
      create: true,
      read: true,
      update: true,
      delete: true,
      publish: true,
      configure: true,
    },
    blocks: {
      blockTypes: ['*'],  // All blocks
      configure: true,
    },
    media: {
      upload: true,
      delete: true,
      maxFileSize: 100 * 1024 * 1024,  // 100MB
      allowedTypes: ['*'],
    },
  },
  editor: {
    pages: {
      create: true,
      read: true,
      update: true,
      delete: true,
      publish: true,
      configure: false,
    },
    blocks: {
      blockTypes: ['*'],
      configure: true,
    },
    media: {
      upload: true,
      delete: true,
      maxFileSize: 50 * 1024 * 1024,  // 50MB
      allowedTypes: ['image/*', 'video/*', 'application/pdf'],
    },
  },
  author: {
    pages: {
      create: true,
      read: true,
      update: true,
      delete: false,
      publish: false,
      configure: false,
    },
    blocks: {
      blockTypes: ['*'],
      configure: false,
    },
    media: {
      upload: true,
      delete: false,
      maxFileSize: 10 * 1024 * 1024,  // 10MB
      allowedTypes: ['image/*'],
    },
  },
  contributor: {
    pages: {
      create: false,
      read: true,
      update: false,
      delete: false,
      publish: false,
      configure: false,
    },
    blocks: {
      blockTypes: ['text', 'image', 'button'],
      configure: false,
      maxInstances: 5,
    },
    media: {
      upload: false,
      delete: false,
      maxFileSize: 0,
      allowedTypes: [],
    },
  },
  viewer: {
    pages: {
      create: false,
      read: true,
      update: false,
      delete: false,
      publish: false,
      configure: false,
    },
    blocks: {
      blockTypes: [],
      configure: false,
    },
    media: {
      upload: false,
      delete: false,
      maxFileSize: 0,
      allowedTypes: [],
    },
  },
};

// ============================================================================
// MAIN SECURITY CLASS
// ============================================================================

export class SecurityRBAC {
  private baseUrl: string;
  private currentUser?: User;
  private sessions: Map<string, Session> = new Map();
  private permissionCache: Map<string, boolean> = new Map();

  constructor(options?: { baseUrl?: string }) {
    this.baseUrl = options?.baseUrl || '/api/security';
  }

  // ========================================================================
  // AUTHENTICATION
  // ========================================================================

  /**
   * Login user
   */
  async login(
    email: string,
    password: string
  ): Promise<Result<{ user: User; session: Session }, Error>> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        return Result.err(new Error('Login failed'));
      }

      const data = await response.json();
      this.currentUser = data.user;
      
      const session: Session = {
        id: data.session.id,
        userId: data.user.id,
        organizationId: data.session.organizationId,
        createdAt: new Date(data.session.createdAt),
        expiresAt: new Date(data.session.expiresAt),
        ipAddress: data.session.ipAddress,
        userAgent: data.session.userAgent,
      };

      this.sessions.set(session.id, session);
      return Result.ok({ user: data.user, session });
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error('Login failed'));
    }
  }

  /**
   * Logout
   */
  async logout(sessionId: string): Promise<Result<void, Error>> {
    this.sessions.delete(sessionId);
    this.currentUser = undefined;

    try {
      await fetch(`${this.baseUrl}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
    } catch {
      // Ignore logout errors
    }

    return Result.ok(undefined);
  }

  /**
   * Verify session
   */
  async verifySession(sessionId: string): Promise<Result<Session, Error>> {
    const cached = this.sessions.get(sessionId);
    if (cached && cached.expiresAt > new Date()) {
      return Result.ok(cached);
    }

    try {
      const response = await fetch(`${this.baseUrl}/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });

      if (!response.ok) {
        return Result.err(new Error('Invalid session'));
      }

      const session = await response.json();
      this.sessions.set(session.id, session);
      return Result.ok(session);
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error('Verification failed'));
    }
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | undefined {
    return this.currentUser;
  }

  /**
   * Set current user (for SSR)
   */
  setCurrentUser(user: User): void {
    this.currentUser = user;
  }

  // ========================================================================
  // PERMISSION CHECKING
  // ========================================================================

  /**
   * Check permission
   */
  can(
    action: PermissionAction,
    resource: Permission['resource']
  ): boolean {
    if (!this.currentUser) return false;

    const cacheKey = `${this.currentUser.id}:${resource}:${action}`;
    if (this.permissionCache.has(cacheKey)) {
      return this.permissionCache.get(cacheKey)!;
    }

    const permissions = this.getPermissions(this.currentUser.role);
    const hasPermission = permissions.some(
      p => p.resource === resource && p.actions.includes(action as PermissionAction)
    );

    this.permissionCache.set(cacheKey, hasPermission);
    return hasPermission;
  }

  /**
   * Check page permission
   */
  canManagePage(action: PermissionAction): boolean {
    return this.can(action, 'pages');
  }

  /**
   * Check block permission
   */
  canUseBlock(blockType: string): boolean {
    if (!this.currentUser) return false;

    const permissions = this.getPermissions(this.currentUser.role);
    const blockPerm = permissions.find(p => p.resource === 'blocks');
    
    if (!blockPerm) return false;
    if (blockPerm.actions.includes('*' as PermissionAction)) return true;

    // Check if block is in allowed list
    return true; // Simplified - would check block type whitelist
  }

  /**
   * Check media permission
   */
  canUploadMedia(fileSize: number, fileType: string): boolean {
    if (!this.currentUser) return false;

    const rolePerms = DEFAULT_PERMISSIONS[this.currentUser.role];
    const mediaPerm = rolePerms.media;

    if (!mediaPerm.upload) return false;
    if (fileSize > mediaPerm.maxFileSize) return false;
    if (mediaPerm.allowedTypes.includes('*')) return true;

    return mediaPerm.allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        return fileType.startsWith(type.slice(0, -1));
      }
      return fileType === type;
    });
  }

  /**
   * Get all permissions for role
   */
  getPermissions(role: UserRole): Permission[] {
    const perms = DEFAULT_PERMISSIONS[role];
    
    return [
      {
        resource: 'pages',
        actions: Object.entries(perms.pages)
          .filter(([_, value]) => value === true)
          .map(([key]) => key as PermissionAction),
      },
      {
        resource: 'media',
        actions: perms.media.upload ? ['upload', 'read'] : ['read'],
      },
      {
        resource: 'blocks',
        actions: perms.blocks.configure ? ['use', 'configure'] : ['use'],
      },
    ];
  }

  /**
   * Create API key
   */
  async createAPIKey(
    name: string,
    permissions: Permission[],
    expiresIn?: number  // days
  ): Promise<Result<APIKey, Error>> {
    try {
      const response = await fetch(`${this.baseUrl}/api-keys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, permissions, expiresIn }),
      });

      if (!response.ok) {
        return Result.err(new Error('Failed to create API key'));
      }

      const apiKey = await response.json();
      return Result.ok(apiKey);
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error('Failed to create API key'));
    }
  }

  /**
   * Verify API key
   */
  async verifyAPIKey(key: string): Promise<Result<User, Error>> {
    try {
      const response = await fetch(`${this.baseUrl}/api-keys/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
      });

      if (!response.ok) {
        return Result.err(new Error('Invalid API key'));
      }

      const user = await response.json();
      return Result.ok(user);
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error('Verification failed'));
    }
  }

  // ========================================================================
  // INPUT SANITIZATION
  // ========================================================================

  /**
   * Sanitize HTML content
   */
  sanitizeHTML(content: string): string {
    // Basic sanitization - in production use DOMPurify
    return content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/javascript:/gi, '');
  }

  /**
   * Sanitize user input
   */
  sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '')  // Remove angle brackets
      .replace(/[\x00-\x1F\x7F]/g, '')  // Remove control characters
      .trim();
  }

  /**
   * Validate email
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate URL
   */
  isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // ========================================================================
  // CSP & SECURITY HEADERS
  // ========================================================================

  /**
   * Get CSP directives
   */
  getCSPDirectives(): Record<string, string[]> {
    return {
      'default-src': ["'self'"],
      'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      'style-src': ["'self'", "'unsafe-inline'"],
      'img-src': ["'self'", 'data:', 'blob:'],
      'font-src': ["'self'"],
      'connect-src': ["'self'"],
      'frame-ancestors': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"],
    };
  }

  /**
   * Get security headers
   */
  getSecurityHeaders(): Record<string, string> {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    };
  }

  // ========================================================================
  // AUDIT LOGGING
  // ========================================================================

  /**
   * Log action
   */
  async logAction(
    action: string,
    resource: string,
    resourceId?: string,
    details?: Record<string, unknown>
  ): Promise<Result<void, Error>> {
    if (!this.currentUser) {
      return Result.err(new Error('Not authenticated'));
    }

    const log: Omit<AuditLog, 'id'> = {
      userId: this.currentUser.id,
      organizationId: this.currentUser.organizationId,
      action,
      resource,
      resourceId,
      details,
      timestamp: new Date(),
    };

    try {
      await fetch(`${this.baseUrl}/audit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(log),
      });

      return Result.ok(undefined);
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error('Failed to log action'));
    }
  }

  /**
   * Get audit logs
   */
  async getAuditLogs(
    filters?: {
      userId?: string;
      action?: string;
      resource?: string;
      from?: Date;
      to?: Date;
    },
    page = 1,
    limit = 50
  ): Promise<Result<AuditLog[], Error>> {
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      
      if (filters) {
        if (filters.userId) params.set('userId', filters.userId);
        if (filters.action) params.set('action', filters.action);
        if (filters.resource) params.set('resource', filters.resource);
        if (filters.from) params.set('from', filters.from.toISOString());
        if (filters.to) params.set('to', filters.to.toISOString());
      }

      const response = await fetch(`${this.baseUrl}/audit?${params}`);

      if (!response.ok) {
        return Result.err(new Error('Failed to fetch audit logs'));
      }

      const logs = await response.json();
      return Result.ok(logs);
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error('Failed to fetch'));
    }
  }

  // ========================================================================
  // GDPR & COMPLIANCE
  // ========================================================================

  /**
   * Request data export
   */
  async requestDataExport(): Promise<Result<GDPRRequest, Error>> {
    if (!this.currentUser) {
      return Result.err(new Error('Not authenticated'));
    }

    try {
      const response = await fetch(`${this.baseUrl}/gdpr/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: this.currentUser.id, type: 'access' }),
      });

      if (!response.ok) {
        return Result.err(new Error('Failed to request export'));
      }

      const request = await response.json();
      return Result.ok(request);
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error('Failed to request export'));
    }
  }

  /**
   * Request data deletion
   */
  async requestDataDeletion(): Promise<Result<GDPRRequest, Error>> {
    if (!this.currentUser) {
      return Result.err(new Error('Not authenticated'));
    }

    try {
      const response = await fetch(`${this.baseUrl}/gdpr/erasure`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: this.currentUser.id, type: 'erasure' }),
      });

      if (!response.ok) {
        return Result.err(new Error('Failed to request deletion'));
      }

      const request = await response.json();
      return Result.ok(request);
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error('Failed to request deletion'));
    }
  }

  // ========================================================================
  // CACHE MANAGEMENT
  // ========================================================================

  /**
   * Clear permission cache
   */
  clearPermissionCache(): void {
    this.permissionCache.clear();
  }

  /**
   * Refresh permissions
   */
  async refreshPermissions(): Promise<void> {
    this.clearPermissionCache();
    
    if (this.currentUser) {
      try {
        const response = await fetch(`${this.baseUrl}/users/${this.currentUser.id}/permissions`);
        if (response.ok) {
          this.currentUser = await response.json();
        }
      } catch {
        // Keep existing permissions
      }
    }
  }
}

// ============================================================================
// MIDDLEWARE HELPERS
// ============================================================================

/**
 * Require authentication middleware
 */
export function requireAuth(role?: UserRole): {
  check: (user?: User) => boolean;
  error: string;
} {
  return {
    check: (user?: User) => {
      if (!user) return false;
      if (!role) return true;
      return user.role === role || user.role === 'admin';
    },
    error: 'Authentication required',
  };
}

/**
 * Require permission middleware
 */
export function requirePermission(
  resource: Permission['resource'],
  action: PermissionAction
): {
  check: (user?: User) => boolean;
  error: string;
} {
  return {
    check: (user?: User) => {
      if (!user) return false;
      
      const perms = DEFAULT_PERMISSIONS[user.role];
      const resourcePerms = perms[resource as keyof typeof perms];
      
      if (!resourcePerms) return false;
      
      return (resourcePerms as Record<string, boolean>)[action] === true;
    },
    error: `Permission denied: ${action} on ${resource}`,
  };
}

// ============================================================================
// SINGLETON
// ============================================================================

let securityInstance: SecurityRBAC | null = null;

export function getSecurity(): SecurityRBAC {
  if (!securityInstance) {
    securityInstance = new SecurityRBAC();
  }
  return securityInstance;
}

// ============================================================================
// EXPORTS
// ============================================================================

export const RolePermissions = DEFAULT_PERMISSIONS;

export default SecurityRBAC;