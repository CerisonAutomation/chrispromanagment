// =============================================================================
// Enterprise Audit Logging Service
// =============================================================================

import {db} from '@/lib/db';
import type {AuditAction} from './types';

export interface AuditLogData {
  action: AuditAction;
  pageId?: string;
  userId?: string;
  userName?: string;
  details?: Record<string, any>;
  resourceType?: string;
  resourceId?: string;
  previousState?: any;
  newState?: any;
  severity?: 'info' | 'warning' | 'error' | 'critical';
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Create an audit log entry
 */
export async function createAuditLog(data: AuditLogData): Promise<string> {
  const auditLog = await db.auditLog.create({
    data: {
      action: data.action,
      pageId: data.pageId,
      userId: data.userId,
      userName: data.userName,
      details: data.details ? JSON.stringify(data.details) : null,
      resourceType: data.resourceType,
      resourceId: data.resourceId,
      previousState: data.previousState ? JSON.stringify(data.previousState) : null,
      newState: data.newState ? JSON.stringify(data.newState) : null,
      severity: data.severity || 'info',
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    },
  });
  return auditLog.id;
}

/**
 * Get audit logs with filtering
 */
export async function getAuditLogs(options: {
  pageId?: string;
  userId?: string;
  action?: AuditAction;
  severity?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}) {
  const where: any = {};
  
  if (options.pageId) where.pageId = options.pageId;
  if (options.userId) where.userId = options.userId;
  if (options.action) where.action = options.action;
  if (options.severity) where.severity = options.severity;
  
  if (options.startDate || options.endDate) {
    where.createdAt = {};
    if (options.startDate) where.createdAt.gte = options.startDate;
    if (options.endDate) where.createdAt.lte = options.endDate;
  }
  
  const [logs, total] = await Promise.all([
    db.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: options.limit || 50,
      skip: options.offset || 0,
    }),
    db.auditLog.count({ where }),
  ]);
  
  return {
    logs: logs.map(log => ({
      ...log,
      details: log.details ? JSON.parse(log.details) : null,
      previousState: log.previousState ? JSON.parse(log.previousState) : null,
      newState: log.newState ? JSON.parse(log.newState) : null,
    })),
    total,
    hasMore: (options.offset || 0) + logs.length < total,
  };
}

/**
 * Get recent activity for dashboard
 */
export async function getRecentActivity(limit: number = 10) {
  const logs = await db.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
  
  return logs.map(log => ({
    ...log,
    details: log.details ? JSON.parse(log.details) : null,
  }));
}

/**
 * Get activity statistics
 */
export async function getAuditStats(startDate: Date, endDate: Date) {
  const [total, byAction, byUser, bySeverity] = await Promise.all([
    db.auditLog.count({
      where: {
        createdAt: { gte: startDate, lte: endDate },
      },
    }),
    db.auditLog.groupBy({
      by: ['action'],
      where: {
        createdAt: { gte: startDate, lte: endDate },
      },
      _count: { action: true },
    }),
    db.auditLog.groupBy({
      by: ['userName'],
      where: {
        createdAt: { gte: startDate, lte: endDate },
      },
      _count: { userName: true },
    }),
    db.auditLog.groupBy({
      by: ['severity'],
      where: {
        createdAt: { gte: startDate, lte: endDate },
      },
      _count: { severity: true },
    }),
  ]);
  
  return {
    total,
    byAction: byAction.map(a => ({ action: a.action, count: a._count.action })),
    byUser: byUser.map(u => ({ userName: u.userName || 'Unknown', count: u._count.userName })),
    bySeverity: bySeverity.map(s => ({ severity: s.severity, count: s._count.severity })),
  };
}

/**
 * Log page lifecycle events
 */
export async function logPageEvent(
  pageId: string,
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'PUBLISH' | 'UNPUBLISH' | 'SCHEDULE',
  userId?: string,
  userName?: string,
  details?: Record<string, any>
) {
  return createAuditLog({
    action,
    pageId,
    userId,
    userName,
    details,
    resourceType: 'page',
    resourceId: pageId,
    severity: action === 'DELETE' ? 'warning' : 'info',
  });
}

/**
 * Log user events
 */
export async function logUserEvent(
  action: 'LOGIN' | 'LOGOUT' | 'PERMISSION_CHANGE',
  userId: string,
  userName: string,
  details?: Record<string, any>,
  ipAddress?: string,
  userAgent?: string
) {
  return createAuditLog({
    action,
    userId,
    userName,
    details,
    resourceType: 'user',
    resourceId: userId,
    severity: action === 'LOGIN' ? 'info' : 'warning',
    ipAddress,
    userAgent,
  });
}
