/**
 * Analytics & Monitoring System - Editor and page performance tracking
 * Million-Times-Better Architecture
 */

import { Result } from '@/lib/types-index';

// ============================================================================
// TYPES - EDITOR ANALYTICS
// ============================================================================

export interface EditorSession {
  id: string;
  userId: string;
  pageId: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  actions: EditorAction[];
  blocksAdded: string[];
  blocksRemoved: string[];
  blocksModified: string[];
  undoCount: number;
  redoCount: number;
  autoSaveCount: number;
}

export interface EditorAction {
  id: string;
  type: 'add' | 'remove' | 'move' | 'modify' | 'copy' | 'paste' | 'undo' | 'redo';
  blockId?: string;
  blockType?: string;
  timestamp: Date;
  details?: Record<string, unknown>;
}

export interface BlockUsageStats {
  blockType: string;
  addCount: number;
  removeCount: number;
  totalActive: number;
  lastUsed: Date;
}

export interface UndoRedoPattern {
  userId: string;
  pageId: string;
  undos: number;
  redos: number;
  netChange: number;
  sessionCount: number;
}

// ============================================================================
// TYPES - PAGE PERFORMANCE
// ============================================================================

export interface PagePerformance {
  pageId: string;
  url: string;
  coreWebVitals: CoreWebVitals;
  loadTime: LoadTimeDistribution;
  requests: RequestMetrics;
  timestamp: Date;
}

export interface CoreWebVitals {
  lcp: number; // Largest Contentful Paint (ms)
  fid: number; // First Input Delay (ms)
  cls: number; // Cumulative Layout Shift
  fcp: number; // First Contentful Paint
  ttfb: number; // Time to First Byte
}

export interface LoadTimeDistribution {
  mean: number;
  p50: number;
  p75: number;
  p90: number;
  p95: number;
  p99: number;
  samples: number;
}

export interface RequestMetrics {
  total: number;
  success: number;
  failed: number;
  cacheHitRate: number;
  avgResponseTime: number;
  totalTransferSize: number;
}

export interface RealUserMetric {
  pageId: string;
  country: string;
  device: 'desktop' | 'tablet' | 'mobile';
  browser: string;
  os: string;
  connectionType?: string;
  coreWebVitals: CoreWebVitals;
  timestamp: Date;
}

// ============================================================================
// TYPES - BUSINESS INTELLIGENCE
// ============================================================================

export interface ContentVelocity {
  pageId: string;
  date: Date;
  pagesCreated: number;
  pagesModified: number;
  pagesPublished: number;
  blocksAdded: number;
}

export interface PublishFrequency {
  pageId: string;
  daily: number;
  weekly: number;
  monthly: number;
  lastPublished?: Date;
}

export interface ContentROI {
  pageId: string;
  pageTitle: string;
  views: number;
  conversions: number;
  bounceRate: number;
  avgTimeOnPage: number;
  goalCompletions: number;
  revenue?: number;
}

// ============================================================================
// TYPES - ERROR TRACKING
// ============================================================================

export interface ErrorEvent {
  id: string;
  error: Error;
  context: Record<string, unknown>;
  userId?: string;
  pageId?: string;
  timestamp: Date;
  stack?: string;
  handled: boolean;
}

export interface ErrorSummary {
  errorType: string;
  count: number;
  firstSeen: Date;
  lastSeen: Date;
  affectedUsers: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

// ============================================================================
// MAIN ANALYTICS CLASS
// ============================================================================

export class AnalyticsMonitor {
  private baseUrl: string;
  private userId: string;
  private sessionId: string;
  private currentSession?: EditorSession;
  private eventQueue: AnalyticsEvent[] = [];
  private flushInterval?: NodeJS.Timeout;

  constructor(options?: { baseUrl?: string; userId?: string }) {
    this.baseUrl = options?.baseUrl || '/api/analytics';
    this.userId = options?.userId || 'anonymous';
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // ========================================================================
  // EDITOR ANALYTICS - SESSION TRACKING
  // ========================================================================

  /**
   * Start editor session
   */
  async startSession(pageId: string): Promise<void> {
    this.currentSession = {
      id: this.sessionId,
      userId: this.userId,
      pageId,
      startTime: new Date(),
      duration: 0,
      actions: [],
      blocksAdded: [],
      blocksRemoved: [],
      blocksModified: [],
      undoCount: 0,
      redoCount: 0,
      autoSaveCount: 0,
    };

    await this.track('session_start', { pageId });
  }

  /**
   * End editor session
   */
  async endSession(): Promise<void> {
    if (!this.currentSession) return;

    this.currentSession.endTime = new Date();
    this.currentSession.duration = 
      this.currentSession.endTime.getTime() - this.currentSession.startTime.getTime();

    await this.track('session_end', {
      duration: this.currentSession.duration,
      actions: this.currentSession.actions.length,
    });

    // Save session
    await this.saveSession(this.currentSession);
    this.currentSession = undefined;
  }

  /**
   * Track editor action
   */
  async trackAction(
    type: EditorAction['type'],
    details?: { blockId?: string; blockType?: string }
  ): Promise<void> {
    if (!this.currentSession) return;

    const action: EditorAction = {
      id: `action_${Date.now()}`,
      type,
      blockId: details?.blockId,
      blockType: details?.blockType,
      timestamp: new Date(),
      details,
    };

    this.currentSession.actions.push(action);

    // Update stats
    switch (type) {
      case 'add':
        if (details?.blockId) {
          this.currentSession.blocksAdded.push(details.blockId);
        }
        break;
      case 'remove':
        if (details?.blockId) {
          this.currentSession.blocksRemoved.push(details.blockId);
        }
        break;
      case 'modify':
        if (details?.blockId) {
          this.currentSession.blocksModified.push(details.blockId);
        }
        break;
      case 'undo':
        this.currentSession.undoCount++;
        break;
      case 'redo':
        this.currentSession.redoCount++;
        break;
    }

    await this.track('editor_action', action);
  }

  /**
   * Track auto-save
   */
  async trackAutoSave(): Promise<void> {
    if (!this.currentSession) return;
    this.currentSession.autoSaveCount++;
    await this.track('autosave', { count: this.currentSession.autoSaveCount });
  }

  private async saveSession(session: EditorSession): Promise<Result<void, Error>> {
    try {
      const response = await fetch(`${this.baseUrl}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(session),
      });

      if (!response.ok) {
        return Result.err(new Error('Failed to save session'));
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error('Failed to save session'));
    }
  }

  // ========================================================================
  // BLOCK USAGE STATS
  // ========================================================================

  /**
   * Get block usage statistics
   */
  async getBlockUsageStats(
    timeRange?: { from: Date; to: Date }
  ): Promise<Result<BlockUsageStats[], Error>> {
    try {
      const params = new URLSearchParams();
      if (timeRange) {
        params.set('from', timeRange.from.toISOString());
        params.set('to', timeRange.to.toISOString());
      }

      const response = await fetch(`${this.baseUrl}/blocks/usage?${params}`);

      if (!response.ok) {
        return Result.err(new Error('Failed to fetch block usage'));
      }

      const data = await response.json();
      return Result.ok(data);
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error('Failed to fetch block usage'));
    }
  }

  /**
   * Get most used blocks
   */
  async getMostUsedBlocks(limit = 10): Promise<Result<BlockUsageStats[], Error>> {
    const result = await this.getBlockUsageStats();
    if (result.isErr()) {
      return Result.err(result.err);
    }

    const sorted = result.ok
      .sort((a, b) => b.addCount - a.addCount)
      .slice(0, limit);

    return Result.ok(sorted);
  }

  // ========================================================================
  // UNDO/REDO PATTERNS
  // ========================================================================

  /**
   * Get undo/redo patterns
   */
  async getUndoRedoPatterns(
    userId?: string
  ): Promise<Result<UndoRedoPattern[], Error>> {
    try {
      const params = new URLSearchParams();
      if (userId) params.set('userId', userId);

      const response = await fetch(`${this.baseUrl}/patterns/undo-redo?${params}`);

      if (!response.ok) {
        return Result.err(new Error('Failed to fetch patterns'));
      }

      const data = await response.json();
      return Result.ok(data);
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error('Failed to fetch patterns'));
    }
  }

  // ========================================================================
  // PAGE PERFORMANCE - CORE WEB VITALS
  // ========================================================================

  /**
   * Track Core Web Vitals (for RUM)
   */
  async trackCoreWebVitals(vitals: CoreWebVitals, pageId: string): Promise<void> {
    await this.track('web_vitals', { ...vitals, pageId });

    // Also send to Sentry if available
    if (typeof window !== 'undefined') {
      // Would integrate with Sentry in production
    }
  }

  /**
   * Get page performance
   */
  async getPagePerformance(
    pageId: string,
    timeRange?: { from: Date; to: Date }
  ): Promise<Result<PagePerformance[], Error>> {
    try {
      const params = new URLSearchParams({ pageId });
      if (timeRange) {
        params.set('from', timeRange.from.toISOString());
        params.set('to', timeRange.to.toISOString());
      }

      const response = await fetch(`${this.baseUrl}/performance?${params}`);

      if (!response.ok) {
        return Result.err(new Error('Failed to fetch performance'));
      }

      const data = await response.json();
      return Result.ok(data);
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error('Failed to fetch performance'));
    }
  }

  /**
   * Get aggregated performance
   */
  async getAggregatedPerformance(
    pageIds: string[]
  ): Promise<Result<LoadTimeDistribution, Error>> {
    try {
      const response = await fetch(`${this.baseUrl}/performance/aggregated`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageIds }),
      });

      if (!response.ok) {
        return Result.err(new Error('Failed to fetch aggregated performance'));
      }

      const data = await response.json();
      return Result.ok(data);
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error('Failed to fetch'));
    }
  }

  // ========================================================================
  // REAL USER MONITORING (RUM)
  // ========================================================================

  /**
   * Record RUM metric
   */
  async recordRUMMetric(metric: RealUserMetric): Promise<Result<void, Error>> {
    try {
      await fetch(`${this.baseUrl}/rum`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metric),
      });

      return Result.ok(undefined);
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error('Failed to record RUM'));
    }
  }

  /**
   * Get RUM data
   */
  async getRUMData(
    timeRange: { from: Date; to: Date }
  ): Promise<Result<RealUserMetric[], Error>> {
    try {
      const params = new URLSearchParams({
        from: timeRange.from.toISOString(),
        to: timeRange.to.toISOString(),
      });

      const response = await fetch(`${this.baseUrl}/rum?${params}`);

      if (!response.ok) {
        return Result.err(new Error('Failed to fetch RUM data'));
      }

      const data = await response.json();
      return Result.ok(data);
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error('Failed to fetch'));
    }
  }

  // ========================================================================
  // BUSINESS INTELLIGENCE
  // ========================================================================

  /**
   * Get content velocity
   */
  async getContentVelocity(
    pageId: string,
    timeRange: { from: Date; to: Date }
  ): Promise<Result<ContentVelocity[], Error>> {
    try {
      const params = new URLSearchParams({
        pageId,
        from: timeRange.from.toISOString(),
        to: timeRange.to.toISOString(),
      });

      const response = await fetch(`${this.baseUrl}/bi/velocity?${params}`);

      if (!response.ok) {
        return Result.err(new Error('Failed to fetch velocity'));
      }

      const data = await response.json();
      return Result.ok(data);
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error('Failed to fetch'));
    }
  }

  /**
   * Get publish frequency
   */
  async getPublishFrequency(
    pageId: string
  ): Promise<Result<PublishFrequency, Error>> {
    try {
      const response = await fetch(`${this.baseUrl}/bi/publish-frequency/${pageId}`);

      if (!response.ok) {
        return Result.err(new Error('Failed to fetch publish frequency'));
      }

      const data = await response.json();
      return Result.ok(data);
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error('Failed to fetch'));
    }
  }

  /**
   * Get content ROI
   */
  async getContentROI(
    pageIds: string[]
  ): Promise<Result<ContentROI[], Error>> {
    try {
      const response = await fetch(`${this.baseUrl}/bi/roi`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageIds }),
      });

      if (!response.ok) {
        return Result.err(new Error('Failed to fetch ROI'));
      }

      const data = await response.json();
      return Result.ok(data);
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error('Failed to fetch'));
    }
  }

  // ========================================================================
  // ERROR TRACKING
  // ========================================================================

  /**
   * Track error
   */
  async trackError(error: Error, context?: Record<string, unknown>): Promise<void> {
    const errorEvent: ErrorEvent = {
      id: `error_${Date.now()}`,
      error,
      context: context || {},
      userId: this.userId,
      timestamp: new Date(),
      stack: error.stack,
      handled: false,
    };

    await this.track('error', errorEvent);

    // Fire and forget to error tracking service
    if (typeof window !== 'undefined') {
      // Would send to Sentry
    }
  }

  /**
   * Get error summary
   */
  async getErrorSummary(
    timeRange?: { from: Date; to: Date }
  ): Promise<Result<ErrorSummary[], Error>> {
    try {
      const params = new URLSearchParams();
      if (timeRange) {
        params.set('from', timeRange.from.toISOString());
        params.set('to', timeRange.to.toISOString());
      }

      const response = await fetch(`${this.baseUrl}/errors/summary?${params}`);

      if (!response.ok) {
        return Result.err(new Error('Failed to fetch error summary'));
      }

      const data = await response.json();
      return Result.ok(data);
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error('Failed to fetch'));
    }
  }

  /**
   * Get recent errors
   */
  async getRecentErrors(limit = 50): Promise<Result<ErrorEvent[], Error>> {
    try {
      const response = await fetch(`${this.baseUrl}/errors/recent?limit=${limit}`);

      if (!response.ok) {
        return Result.err(new Error('Failed to fetch errors'));
      }

      const data = await response.json();
      return Result.ok(data);
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error('Failed to fetch'));
    }
  }

  // ========================================================================
  // CORE TRACKING INFRASTRUCTURE
  // ========================================================================

  /**
   * Track event
   */
  private async track(
    eventType: string,
    payload: Record<string, unknown>
  ): Promise<void> {
    const event: AnalyticsEvent = {
      id: `evt_${Date.now()}`,
      type: eventType,
      payload,
      timestamp: new Date(),
      sessionId: this.sessionId,
      userId: this.userId,
    };

    this.eventQueue.push(event);

    // Flush if queue gets too large
    if (this.eventQueue.length >= 10) {
      await this.flush();
    }
  }

  /**
   * Flush events to server
   */
  async flush(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      await fetch(`${this.baseUrl}/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(events),
      });
    } catch {
      // Re-queue on failure
      this.eventQueue.push(...events);
    }
  }

  /**
   * Start auto-flush
   */
  startAutoFlush(intervalMs = 5000): void {
    this.flushInterval = setInterval(() => this.flush(), intervalMs);
  }

  /**
   * Stop auto-flush
   */
  stopAutoFlush(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = undefined;
    }
  }

  // ========================================================================
  // DASHBOARD DATA
  // ========================================================================

  /**
   * Get dashboard summary
   */
  async getDashboardSummary(): Promise<Result<{
    sessions: number;
    activeUsers: number;
    pagesEdited: number;
    avgSessionDuration: number;
    totalErrors: number;
    avgLoadTime: number;
  }, Error>> {
    try {
      const response = await fetch(`${this.baseUrl}/dashboard/summary`);

      if (!response.ok) {
        return Result.err(new Error('Failed to fetch dashboard'));
      }

      const data = await response.json();
      return Result.ok(data);
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error('Failed to fetch'));
    }
  }

  /**
   * Get activity feed
   */
  async getActivityFeed(limit = 20): Promise<Result<{
    type: string;
    description: string;
    userId: string;
    timestamp: Date;
  }[], Error>> {
    try {
      const response = await fetch(`${this.baseUrl}/activity?limit=${limit}`);

      if (!response.ok) {
        return Result.err(new Error('Failed to fetch activity'));
      }

      const data = await response.json();
      return Result.ok(data);
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error('Failed to fetch'));
    }
  }
}

// ============================================================================
// CLIENT-SIDE RUM TRACKING
// ============================================================================

export function initRUMTracking(): void {
  if (typeof window === 'undefined') return;

  // Core Web Vitals tracking
  if ('PerformanceObserver' in window) {
    // LCP
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as PerformanceEntry & { renderTime?: number };
      const lcp = lastEntry.renderTime || 0;
      
      // Track via analytics
    }).observe({ type: 'largest-contentful-paint', buffered: true });

    // CLS
    new PerformanceObserver((list) => {
      let cls = 0;
      for (const entry of list.getEntries()) {
        const layoutShift = entry as PerformanceEntry & { value?: number };
        if (!layoutShift.hadRecentInput) {
          cls += layoutShift.value || 0;
        }
      }
    }).observe({ type: 'layout-shift', buffered: true });

    // FID
    new PerformanceObserver((list) => {
      const firstEntry = list.getEntries()[0] as PerformanceEntry & { processingStart?: number; startTime?: number };
      const fid = (firstEntry.processingStart || 0) - (firstEntry.startTime || 0);
    }).observe({ type: 'first-input', buffered: true });
  }

  // Page load timing
  window.addEventListener('load', () => {
    const timing = performance.timing;
    const ttfb = timing.responseStart - timing.navigationStart;
    const loadTime = timing.loadEventEnd - timing.navigationStart;
  });
}

// ============================================================================
// SINGLETON
// ============================================================================

let analyticsInstance: AnalyticsMonitor | null = null;

export function getAnalytics(): AnalyticsMonitor {
  if (!analyticsInstance) {
    analyticsInstance = new AnalyticsMonitor();
  }
  return analyticsInstance;
}

// ============================================================================
// EXPORTS
// ============================================================================

interface AnalyticsEvent {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  timestamp: Date;
  sessionId: string;
  userId: string;
}

export default AnalyticsMonitor;