/**
 * @fileoverview MCP HTTP Client — Lightweight production client for Ω⁷ Puck Builder MCP.
 * Communicates via HTTP transport without heavy SDK dependencies.
 * @module lib/mcp-client
 * @version 8.0.0
 */

// ═══════════════════════════════════════════════════════════════════════════════
// ENVIRONMENT TYPES — Safe Node.js type declarations
// ═══════════════════════════════════════════════════════════════════════════════

declare const process: {
  env: Record<string, string | undefined>;
} | undefined;

interface EnvVars {
  readonly MCP_BASE_URL?: string;
  readonly MCP_API_KEY?: string;
  readonly MCP_TIMEOUT_MS?: number;
  readonly MCP_MAX_RETRIES?: number;
  readonly NODE_ENV?: string;
}

const env: EnvVars = typeof process !== 'undefined' && process?.env ? process.env as unknown as EnvVars : {};

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES — Surgical type definitions for all MCP operations
// ═══════════════════════════════════════════════════════════════════════════════

export interface McpToolResult<T = unknown> {
  readonly success: boolean;
  readonly data: T | null;
  readonly error: McpError | null;
  readonly meta: {
    readonly toolName: string;
    readonly durationMs: number;
    readonly timestamp: string;
  };
}

export interface McpError {
  readonly code: string;
  readonly message: string;
  readonly details?: Readonly<Record<string, unknown>>;
  readonly recoverable: boolean;
}

export interface PuckBlock {
  readonly type: string;
  readonly props: Readonly<Record<string, unknown> & { id: string }>;
}

export interface PuckPageData {
  readonly content: readonly PuckBlock[];
  readonly root: {
    readonly props?: Readonly<Record<string, unknown>>;
  };
  readonly zones?: Readonly<Record<string, readonly PuckBlock[]>>;
}

export interface PageSummary {
  readonly slug: string;
  readonly title: string;
  readonly blockCount: number;
  readonly blockTypes: Readonly<Record<string, number>>;
}

export interface ComponentInfo {
  readonly type: string;
  readonly category: string;
  readonly fieldCount: number;
  readonly fields: ReadonlyArray<{
    readonly field: string;
    readonly zodType: string;
    readonly optional: boolean;
  }>;
}

export interface AuditIssue {
  readonly severity: 'error' | 'warning' | 'info';
  readonly category: 'structure' | 'content' | 'seo' | 'accessibility' | 'performance' | 'brand';
  readonly blockIndex?: number;
  readonly blockType?: string;
  readonly message: string;
  readonly recommendation: string;
  readonly autoFixable: boolean;
}

export interface PageAuditResult {
  readonly valid: boolean;
  readonly score: number;
  readonly issues: readonly AuditIssue[];
  readonly summary: {
    readonly totalBlocks: number;
    readonly blockTypeCounts: Readonly<Record<string, number>>;
    readonly hasHero: boolean;
    readonly hasCTA: boolean;
    readonly hasFooter: boolean;
    readonly hasContact: boolean;
  };
  readonly recommendations: readonly string[];
}

export interface CritiqueResult {
  readonly blockId: string;
  readonly blockType: string;
  readonly overallScore: number;
  readonly dimensions: {
    readonly contentQuality: number;
    readonly designAlignment: number;
    readonly brandCompliance: number;
    readonly accessibility: number;
    readonly seo: number;
  };
  readonly feedback: ReadonlyArray<{
    readonly aspect: string;
    readonly rating: number;
    readonly comment: string;
    readonly suggestion: string;
  }>;
  readonly improvements: readonly string[];
  readonly rewriteSuggestion?: string;
}

export interface McpClientConfig {
  readonly baseUrl: string;
  readonly timeoutMs?: number;
  readonly maxRetries?: number;
  readonly retryDelayMs?: number;
  readonly apiKey?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ERROR HANDLING — Enterprise-grade error classification
// ═══════════════════════════════════════════════════════════════════════════════

const ERROR_REGISTRY: Readonly<Record<string, { readonly recoverable: boolean; readonly retryable: boolean }>> = {
  CONNECTION_FAILED: { recoverable: true, retryable: true },
  TIMEOUT: { recoverable: true, retryable: true },
  PARSE_ERROR: { recoverable: false, retryable: false },
  TOOL_NOT_FOUND: { recoverable: false, retryable: false },
  VALIDATION_FAILED: { recoverable: true, retryable: false },
  PAGE_NOT_FOUND: { recoverable: true, retryable: false },
  BLOCK_TYPE_INVALID: { recoverable: true, retryable: false },
  INDEX_OUT_OF_RANGE: { recoverable: true, retryable: false },
  INTERNAL_ERROR: { recoverable: true, retryable: true },
  UNAUTHORIZED: { recoverable: true, retryable: false },
  RATE_LIMITED: { recoverable: true, retryable: true },
} as const;

function classifyError(code: string): { recoverable: boolean; retryable: boolean } {
  return ERROR_REGISTRY[code] ?? { recoverable: false, retryable: false };
}

function createMcpError(code: string, message: string, details?: Record<string, unknown>): McpError {
  const classification = classifyError(code);
  return {
    code,
    message,
    details,
    recoverable: classification.recoverable,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// TELEMETRY — Observability for production monitoring
// ═══════════════════════════════════════════════════════════════════════════════

interface TelemetryEvent {
  readonly toolName: string;
  readonly durationMs: number;
  readonly success: boolean;
  readonly errorCode?: string;
  readonly timestamp: string;
}

class McpTelemetry {
  private events: TelemetryEvent[] = [];
  private readonly maxEvents = 1000;

  record(event: TelemetryEvent): void {
    this.events.push(event);
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }
  }

  getStats(): {
    readonly totalCalls: number;
    readonly successRate: number;
    readonly avgDurationMs: number;
    readonly topErrors: ReadonlyArray<{ readonly code: string; readonly count: number }>;
  } {
    const total = this.events.length;
    if (total === 0) {
      return { totalCalls: 0, successRate: 0, avgDurationMs: 0, topErrors: [] };
    }

    const successful = this.events.filter((e) => e.success).length;
    const totalDuration = this.events.reduce((sum, e) => sum + e.durationMs, 0);

    const errorCounts = new Map<string, number>();
    this.events.filter((e) => !e.success && e.errorCode).forEach((e) => {
      errorCounts.set(e.errorCode!, (errorCounts.get(e.errorCode!) ?? 0) + 1);
    });

    const topErrors = Array.from(errorCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([code, count]) => ({ code, count }));

    return {
      totalCalls: total,
      successRate: successful / total,
      avgDurationMs: totalDuration / total,
      topErrors,
    };
  }

  snapshot(): readonly TelemetryEvent[] {
    return [...this.events];
  }
}

export const telemetry = new McpTelemetry();

// ═══════════════════════════════════════════════════════════════════════════════
// CIRCUIT BREAKER — Resilience pattern for MCP failures
// ═══════════════════════════════════════════════════════════════════════════════

interface CircuitBreakerState {
  failures: number;
  lastFailureTime: number | null;
  state: 'closed' | 'open' | 'half-open';
}

let globalCircuitBreakerInstance: CircuitBreaker | null = null;

class CircuitBreaker {
  private state: CircuitBreakerState = {
    failures: 0,
    lastFailureTime: null,
    state: 'closed',
  };

  private readonly threshold = 5;
  private readonly resetTimeoutMs = 30000;

  static getInstance(): CircuitBreaker {
    if (!globalCircuitBreakerInstance) {
      globalCircuitBreakerInstance = new CircuitBreaker();
    }
    return globalCircuitBreakerInstance;
  }

  canExecute(): boolean {
    if (this.state.state === 'closed') return true;
    if (this.state.state === 'open') {
      if (this.state.lastFailureTime && Date.now() - this.state.lastFailureTime > this.resetTimeoutMs) {
        this.state.state = 'half-open';
        return true;
      }
      return false;
    }
    return true;
  }

  recordSuccess(): void {
    this.state = { failures: 0, lastFailureTime: null, state: 'closed' };
  }

  recordFailure(): void {
    this.state.failures++;
    this.state.lastFailureTime = Date.now();
    if (this.state.failures >= this.threshold) {
      this.state.state = 'open';
    }
  }

  getState(): CircuitBreakerState['state'] {
    return this.state.state;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// HTTP CLIENT — Production-grade fetch wrapper
// ═══════════════════════════════════════════════════════════════════════════════

class McpHttpClient {
  private config: Required<McpClientConfig>;
  private circuitBreaker = CircuitBreaker.getInstance();
  private requestDeduplicationCache = new Map<string, Promise<McpToolResult<unknown>>>();

  constructor(config: McpClientConfig) {
    this.config = {
      timeoutMs: 30000,
      maxRetries: 3,
      retryDelayMs: 1000,
      apiKey: '',
      ...config,
    };
  }

  private async fetchWithTimeout(
    endpoint: string,
    options: RequestInit
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeoutMs);

    const generateIdempotencyKey = (): string => {
      return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
    };

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Correlation-ID': crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
        ...(this.config.apiKey ? { 'X-API-Key': this.config.apiKey } : {}),
        ...(options.method === 'POST' ? { 'Idempotency-Key': generateIdempotencyKey() } : {}),
      };

      const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
        ...options,
        headers: { ...headers, ...(options.headers as Record<string, string> || {}) },
        signal: controller.signal,
      });

      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async post<T>(endpoint: string, body: unknown, toolName: string): Promise<McpToolResult<T>> {
    const cacheKey = `POST:${endpoint}:${JSON.stringify(body)}`;
    
    if (this.requestDeduplicationCache.has(cacheKey)) {
      return this.requestDeduplicationCache.get(cacheKey) as Promise<McpToolResult<T>>;
    }
    const startTime = Date.now();

    if (!this.circuitBreaker.canExecute()) {
      return {
        success: false,
        data: null,
        error: createMcpError('CIRCUIT_OPEN', 'MCP client circuit breaker is open'),
        meta: { toolName, durationMs: 0, timestamp: new Date().toISOString() },
      };
    }

    for (let attempt = 0; attempt < this.config.maxRetries; attempt++) {
      try {
        const response = await this.fetchWithTimeout(endpoint, {
          method: 'POST',
          body: JSON.stringify(body),
        });

        const duration = Date.now() - startTime;

        if (!response.ok) {
          const errorCode = response.status === 429 ? 'RATE_LIMITED' :
            response.status === 401 ? 'UNAUTHORIZED' :
            response.status >= 500 ? 'INTERNAL_ERROR' : 'CONNECTION_FAILED';

          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json() as T;

        this.circuitBreaker.recordSuccess();
        telemetry.record({
          toolName,
          durationMs: duration,
          success: true,
          timestamp: new Date().toISOString(),
        });

        const result = {
          success: true,
          data,
          error: null,
          meta: { toolName, durationMs: duration, timestamp: new Date().toISOString() },
        } as McpToolResult<T>;
        
        this.requestDeduplicationCache.delete(cacheKey);
        return result;
      } catch (error) {
        const isLastAttempt = attempt === this.config.maxRetries - 1;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        if (isLastAttempt) {
          this.circuitBreaker.recordFailure();
          const duration = Date.now() - startTime;
          const errorCode = errorMessage.includes('abort') ? 'TIMEOUT' : 'CONNECTION_FAILED';

          telemetry.record({
            toolName,
            durationMs: duration,
            success: false,
            errorCode,
            timestamp: new Date().toISOString(),
          });

          const result = {
            success: false,
            data: null,
            error: createMcpError(errorCode, errorMessage),
            meta: { toolName, durationMs: duration, timestamp: new Date().toISOString() },
          } as McpToolResult<T>;
          
          this.requestDeduplicationCache.delete(cacheKey);
          return result;
        }

        await new Promise((resolve) => setTimeout(resolve, this.config.retryDelayMs * (attempt + 1)));
      }
    }

    // Should never reach here
    return {
      success: false,
      data: null,
      error: createMcpError('UNKNOWN', 'Unexpected execution path'),
      meta: { toolName, durationMs: Date.now() - startTime, timestamp: new Date().toISOString() },
    };
  }

  async get<T>(endpoint: string, toolName: string): Promise<McpToolResult<T>> {
    const startTime = Date.now();

    if (!this.circuitBreaker.canExecute()) {
      return {
        success: false,
        data: null,
        error: createMcpError('CIRCUIT_OPEN', 'MCP client circuit breaker is open'),
        meta: { toolName, durationMs: 0, timestamp: new Date().toISOString() },
      };
    }

    for (let attempt = 0; attempt < this.config.maxRetries; attempt++) {
      try {
        const response = await this.fetchWithTimeout(endpoint, { method: 'GET' });
        const duration = Date.now() - startTime;

        if (!response.ok) {
          const errorCode = response.status === 429 ? 'RATE_LIMITED' :
            response.status === 401 ? 'UNAUTHORIZED' :
            response.status >= 500 ? 'INTERNAL_ERROR' : 'CONNECTION_FAILED';

          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json() as T;

        this.circuitBreaker.recordSuccess();
        telemetry.record({
          toolName,
          durationMs: duration,
          success: true,
          timestamp: new Date().toISOString(),
        });

        return {
          success: true,
          data,
          error: null,
          meta: { toolName, durationMs: duration, timestamp: new Date().toISOString() },
        };
      } catch (error) {
        const isLastAttempt = attempt === this.config.maxRetries - 1;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        if (isLastAttempt) {
          this.circuitBreaker.recordFailure();
          const duration = Date.now() - startTime;
          const errorCode = errorMessage.includes('abort') ? 'TIMEOUT' : 'CONNECTION_FAILED';

          telemetry.record({
            toolName,
            durationMs: duration,
            success: false,
            errorCode,
            timestamp: new Date().toISOString(),
          });

          return {
            success: false,
            data: null,
            error: createMcpError(errorCode, errorMessage),
            meta: { toolName, durationMs: duration, timestamp: new Date().toISOString() },
          };
        }

        await new Promise((resolve) => setTimeout(resolve, this.config.retryDelayMs * (attempt + 1)));
      }
    }

    return {
      success: false,
      data: null,
      error: createMcpError('UNKNOWN', 'Unexpected execution path'),
      meta: { toolName, durationMs: Date.now() - startTime, timestamp: new Date().toISOString() },
    };
  }

  getCircuitState(): string {
    return this.circuitBreaker.getState();
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MCP SERVICE — High-level API for all MCP operations
// ═══════════════════════════════════════════════════════════════════════════════

export class McpClientService {
  private http: McpHttpClient;

  constructor(config: McpClientConfig) {
    this.http = new McpHttpClient(config);
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // TOOL CALLS — Typed wrappers for MCP tool operations
  // ═══════════════════════════════════════════════════════════════════════════════

  async listComponents(category?: string): Promise<McpToolResult<{
    readonly version: string;
    readonly totalBlocks: number;
    readonly components: readonly ComponentInfo[];
  }>> {
    return this.http.post('/api/mcp/tools/list_puck_components', category ? { category } : {}, 'list_puck_components');
  }

  async generateBlock(type: string, props?: Record<string, unknown>): Promise<McpToolResult<PuckBlock>> {
    return this.http.post('/api/mcp/tools/generate_block', { type, props: props ?? {} }, 'generate_block');
  }

  async generatePage(
    slug: string,
    preset: 'landing' | 'property' | 'malta' | 'pricing' | 'about' | 'blank',
    title?: string,
    overrides?: ReadonlyArray<{ readonly index: number; readonly props: Readonly<Record<string, unknown>> }>
  ): Promise<McpToolResult<{
    readonly slug: string;
    readonly preset: string;
    readonly title: string;
    readonly blockCount: number;
    readonly data: PuckPageData;
  }>> {
    return this.http.post('/api/mcp/tools/generate_page', {
      slug,
      preset,
      title: title ?? 'New Page',
      overrides: overrides ?? [],
    }, 'generate_page');
  }

  async addBlockToPage(
    slug: string,
    type: string,
    props?: Record<string, unknown>,
    index?: number
  ): Promise<McpToolResult<{
    readonly slug: string;
    readonly insertedAt: number;
    readonly block: PuckBlock;
    readonly totalBlocks: number;
  }>> {
    const body: Record<string, unknown> = { slug, type, props: props ?? {} };
    if (index !== undefined) body.index = index;
    return this.http.post('/api/mcp/tools/add_block_to_page', body, 'add_block_to_page');
  }

  async validatePageData(data: PuckPageData): Promise<McpToolResult<{
    readonly valid: boolean;
    readonly blockCount?: number;
    readonly errorCount?: number;
    readonly errors?: ReadonlyArray<{ readonly path: string; readonly message: string; readonly code: string }>;
  }>> {
    return this.http.post('/api/mcp/tools/validate_page_data', { data }, 'validate_page_data');
  }

  async getPage(slug: string): Promise<McpToolResult<{
    readonly slug: string;
    readonly blockCount: number;
    readonly data: PuckPageData;
  }>> {
    return this.http.post('/api/mcp/tools/get_page', { slug }, 'get_page');
  }

  async listPresets(): Promise<McpToolResult<{
    readonly availablePresets: number;
    readonly presets: ReadonlyArray<{ readonly preset: string; readonly blockCount: number; readonly blocks: readonly string[] }>;
  }>> {
    return this.http.post('/api/mcp/tools/list_presets', {}, 'list_presets');
  }

  async listPages(): Promise<McpToolResult<{
    readonly totalPages: number;
    readonly pages: readonly PageSummary[];
  }>> {
    return this.http.post('/api/mcp/tools/list_pages', {}, 'list_pages');
  }

  async deletePage(slug: string): Promise<McpToolResult<{
    readonly deleted: boolean;
    readonly slug: string;
    readonly remainingPages: number;
  }>> {
    return this.http.post('/api/mcp/tools/delete_page', { slug }, 'delete_page');
  }

  async clonePage(
    sourceSlug: string,
    targetSlug: string,
    newTitle?: string
  ): Promise<McpToolResult<{
    readonly cloned: boolean;
    readonly sourceSlug: string;
    readonly targetSlug: string;
    readonly blockCount: number;
  }>> {
    return this.http.post('/api/mcp/tools/clone_page', { sourceSlug, targetSlug, newTitle }, 'clone_page');
  }

  async patchBlock(
    slug: string,
    props: Record<string, unknown>,
    blockId?: string,
    index?: number
  ): Promise<McpToolResult<{
    readonly patched: boolean;
    readonly slug: string;
    readonly index: number;
    readonly blockId: string;
    readonly updatedBlock: PuckBlock;
  }>> {
    const body: Record<string, unknown> = { slug, props };
    if (blockId) body.blockId = blockId;
    if (index !== undefined) body.index = index;
    return this.http.post('/api/mcp/tools/patch_block', body, 'patch_block');
  }

  async reorderBlocks(slug: string, fromIndex: number, toIndex: number): Promise<McpToolResult<{
    readonly reordered: boolean;
    readonly slug: string;
    readonly fromIndex: number;
    readonly toIndex: number;
    readonly totalBlocks: number;
  }>> {
    return this.http.post('/api/mcp/tools/reorder_blocks', { slug, fromIndex, toIndex }, 'reorder_blocks');
  }

  async exportAllPages(): Promise<McpToolResult<{
    readonly exportedAt: string;
    readonly totalPages: number;
    readonly totalBlocks: number;
    readonly pages: Readonly<Record<string, PuckPageData>>;
  }>> {
    return this.http.post('/api/mcp/tools/export_all_pages', {}, 'export_all_pages');
  }

  async healthCheck(): Promise<McpToolResult<{
    readonly status: string;
    readonly version: string;
    readonly store: {
      readonly totalPages: number;
      readonly totalBlocks: number;
      readonly persistencePath: string | null;
      readonly persisted: boolean;
    };
    readonly recentAudit: ReadonlyArray<{
      readonly ts: number;
      readonly action: string;
      readonly slug: string;
      readonly detail?: string;
    }>;
  }>> {
    return this.http.post('/api/mcp/tools/health_check', {}, 'health_check');
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // AI-POWERED OPERATIONS — High-level AI features
  // ═══════════════════════════════════════════════════════════════════════════════

  async auditPage(slug: string): Promise<McpToolResult<PageAuditResult>> {
    return this.http.post('/api/mcp/tools/audit_page', { slug }, 'audit_page');
  }

  async critiqueBlock(
    pageSlug: string,
    blockId: string,
    focus?: readonly ('content' | 'design' | 'accessibility' | 'seo')[]
  ): Promise<McpToolResult<CritiqueResult>> {
    return this.http.post('/api/mcp/tools/critique_block', { pageSlug, blockId, focus: focus ?? ['content', 'design'] }, 'critique_block');
  }

  async optimizePage(slug: string, focus?: readonly ('seo' | 'accessibility' | 'performance' | 'content')[]): Promise<McpToolResult<{
    readonly optimized: boolean;
    readonly slug: string;
    readonly changes: ReadonlyArray<{
      readonly type: string;
      readonly blockIndex: number;
      readonly description: string;
    }>;
    readonly score: {
      readonly before: number;
      readonly after: number;
    };
  }>> {
    return this.http.post('/api/mcp/tools/optimize_page', { slug, focus: focus ?? ['seo', 'accessibility'] }, 'optimize_page');
  }

  async generateCustomBlock(
    name: string,
    description: string,
    fields: ReadonlyArray<{
      readonly name: string;
      readonly type: 'text' | 'textarea' | 'select' | 'array' | 'number' | 'boolean';
      readonly label?: string;
      readonly required?: boolean;
    }>,
    renderHint?: string
  ): Promise<McpToolResult<{
    readonly blockType: string;
    readonly schema: Record<string, unknown>;
    readonly generatedCode: string;
    readonly filePath: string;
  }>> {
    return this.http.post('/api/mcp/tools/generate_custom_block', {
      name,
      description,
      fields,
      renderHint,
    }, 'generate_custom_block');
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // RESOURCE FETCHING — Static knowledge endpoints
  // ═══════════════════════════════════════════════════════════════════════════════

  async getBlockSchemas(): Promise<McpToolResult<{
    readonly version: string;
    readonly totalBlocks: number;
    readonly schemas: Readonly<Record<string, unknown>>;
  }>> {
    return this.http.get('/api/mcp/resources/block-schemas', 'get_block_schemas');
  }

  async getBlockCategories(): Promise<McpToolResult<{
    readonly categories: Readonly<Record<string, readonly string[]>>;
    readonly totalBlocks: number;
  }>> {
    return this.http.get('/api/mcp/resources/block-categories', 'get_block_categories');
  }

  async getQuickstartGuide(): Promise<McpToolResult<{ readonly content: string }>> {
    return this.http.get('/api/mcp/resources/quickstart', 'get_quickstart_guide');
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // UTILITY
  // ═══════════════════════════════════════════════════════════════════════════════

  getHealth(): { readonly circuitState: string; readonly telemetry: ReturnType<McpTelemetry['getStats']> } {
    return {
      circuitState: this.http.getCircuitState(),
      telemetry: telemetry.getStats(),
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON INSTANCE — Default production client
// ═══════════════════════════════════════════════════════════════════════════════

let globalClient: McpClientService | null = null;

export function getMcpClient(config?: Partial<McpClientConfig>): McpClientService {
  if (!globalClient) {
    globalClient = new McpClientService({
      baseUrl: env.MCP_BASE_URL ?? 'http://localhost:3001',
      apiKey: env.MCP_API_KEY,
      timeoutMs: env.MCP_TIMEOUT_MS ?? 30000,
      maxRetries: env.MCP_MAX_RETRIES ?? 3,
      ...config,
    });
  }
  return globalClient;
}

export function resetMcpClient(): void {
  globalClient = null;
}

export { createMcpError, classifyError };
