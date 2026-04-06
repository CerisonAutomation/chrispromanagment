/**
 * AI Workflow Engine - Extensible AI pipeline for content automation
 * Million-Times-Better Architecture
 */

import { Result } from '@/lib/types-index';

// ============================================================================
// TYPES
// ============================================================================

export type AIModel = 'gpt-4o' | 'gpt-4o-mini' | 'claude-3-5-sonnet' | 'claude-3-5-haiku' | 'gemini-1.5-pro';

export interface AIContext {
  pageId?: string;
  blockId?: string;
  content?: string;
  language?: string;
  pageData?: unknown;
}

export interface AITrigger {
  type: 'onBlockAdd' | 'onContentChange' | 'onSchedule' | 'manual';
  blockTypes?: string[];
  schedule?: string; // cron expression
}

export interface AIAction {
  id: string;
  name: string;
  description: string;
  trigger: AITrigger;
  prompt: string;
  model: AIModel;
  temperature: number;
  maxTokens: number;
  enabled: boolean;
}

export interface AIWorkflow {
  id: string;
  name: string;
  description: string;
  actions: AIAction[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AICompletionRequest {
  prompt: string;
  context: AIContext;
  model: AIModel;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export interface AICompletionResponse {
  id: string;
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason: 'stop' | 'length' | 'content_filter' | 'error';
  createdAt: Date;
}

export interface AIGenerateContentRequest {
  type: 'title' | 'description' | 'seo' | 'altText' | 'summary';
  context?: AIContext;
  options?: {
    length?: 'short' | 'medium' | 'long';
    tone?: 'professional' | 'casual' | 'friendly' | 'formal';
    keywords?: string[];
  };
}

export interface AIOptimizeSEORequest {
  content: string;
  title: string;
  keywords: string[];
  targetUrl?: string;
}

export interface AITranslateRequest {
  content: string;
  targetLanguage: string;
  sourceLanguage?: string;
  preserveFormatting?: boolean;
}

export interface AIProofreadRequest {
  content: string;
  style?: 'professional' | 'academic' | 'casual' | 'creative';
  fixGrammar?: boolean;
  fixSpelling?: boolean;
  fixPunctuation?: boolean;
}

export interface AIRecommendation {
  id: string;
  type: 'content' | 'layout' | 'image' | 'seo' | 'accessibility';
  confidence: number;
  content: string;
  reasoning: string;
  action?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_MODELS: Record<AIModel, { provider: string; contextWindow: number; maxOutput: number }> = {
  'gpt-4o': { provider: 'openai', contextWindow: 128000, maxOutput: 16384 },
  'gpt-4o-mini': { provider: 'openai', contextWindow: 128000, maxOutput: 16384 },
  'claude-3-5-sonnet': { provider: 'anthropic', contextWindow: 200000, maxOutput: 8192 },
  'claude-3-5-haiku': { provider: 'anthropic', contextWindow: 200000, maxOutput: 8192 },
  'gemini-1.5-pro': { provider: 'google', contextWindow: 1000000, maxOutput: 8192 },
};

const DEFAULT_PROMPT = `You are an expert content editor for a website CMS.
Your role is to help create, optimize, and improve website content.
Always provide practical, actionable suggestions.
Be concise but thorough.`;

// ============================================================================
// MAIN ENGINE CLASS
// ============================================================================

export class AIWorkflowEngine {
  private baseUrl: string;
  private apiKey: string;
  private workflows: Map<string, AIWorkflow> = new Map();
  private defaultModel: AIModel;
  private fallbackModel: AIModel;
  private queue: Map<string, Promise<AICompletionResponse>> = new Map();

  constructor(options?: {
    baseUrl?: string;
    apiKey?: string;
    defaultModel?: AIModel;
    fallbackModel?: AIModel;
  }) {
    this.baseUrl = options?.baseUrl || '/api/ai';
    this.apiKey = options?.apiKey || '';
    this.defaultModel = options?.defaultModel || 'gpt-4o-mini';
    this.fallbackModel = options?.fallbackModel || 'claude-3-5-haiku';
  }

  // ========================================================================
  // CORE COMPLETION
  // ========================================================================

  /**
   * Create completion with automatic fallback
   */
  async complete(request: AICompletionRequest): Promise<Result<AICompletionResponse, Error>> {
    const model = request.model || this.defaultModel;
    const cacheKey = this.getCacheKey(request);

    // Check if already processing this request
    if (this.queue.has(cacheKey)) {
      try {
        const result = await this.queue.get(cacheKey);
        if (result) return Result.ok(await result);
      } catch {
        // Will try fallback
      }
    }

    try {
      const response = await this.executeCompletion(request);
      return Result.ok(response);
    } catch (error) {
      // Try fallback model
      if (model !== this.fallbackModel) {
        try {
          const fallbackResult = await this.executeCompletion({
            ...request,
            model: this.fallbackModel,
          });
          return Result.ok(fallbackResult);
        } catch {
          // Both failed
        }
      }
      return Result.err(error instanceof Error ? error : new Error('AI completion failed'));
    }
  }

  private async executeCompletion(
    request: AICompletionRequest
  ): Promise<AICompletionResponse> {
    const response = await fetch(`${this.baseUrl}/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      id: data.id,
      content: data.choices?.[0]?.text || data.content,
      model: data.model,
      usage: data.usage,
      finishReason: data.choices?.[0]?.finish_reason || 'stop',
      createdAt: new Date(),
    };
  }

  private getCacheKey(request: AICompletionRequest): string {
    return `${request.model}:${JSON.stringify(request)}`;
  }

  // ========================================================================
  // CONTENT GENERATION
  // ========================================================================

  /**
   * Generate content based on type
   */
  async generateContent(
    request: AIGenerateContentRequest
  ): Promise<Result<string, Error>> {
    const prompts: Record<string, string> = {
      title: `Generate a compelling, SEO-friendly title for the following content. 
Keep it under 60 characters. Be specific and engaging.
Context: {context}`,
      description: `Generate a meta description (150-160 characters) for SEO.
Context: {context}`,
      seo: `Generate SEO-optimized content including:
- Meta title (under 60 chars)
- Meta description (150-160 chars)
- Keywords to target
- Schema.org structured data
Context: {context}`,
      altText: `Generate descriptive alt text for an image.
Be concise (under 125 characters) but descriptive.
Include relevant keywords naturally.
Context: {context}`,
      summary: `Generate a brief summary of the following content.
2-3 sentences, capturing the main points.
Context: {context}`,
    };

    const prompt = prompts[request.type];
    if (!prompt) {
      return Result.err(new Error(`Unknown content type: ${request.type}`));
    }

    const result = await this.complete({
      prompt,
      context: request.context,
      model: this.defaultModel,
    });

    if (result.isErr()) {
      return Result.err(result.err);
    }

    return Result.ok(result.ok.content);
  }

  /**
   * Batch generate multiple content pieces
   */
  async batchGenerate(
    requests: AIGenerateContentRequest[]
  ): Promise<Result<string[], Error>> {
    const results = await Promise.allSettled(
      requests.map(req => this.generateContent(req))
    );

    const contents: string[] = [];
    const errors: Error[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.isOk()) {
        contents.push(result.value.ok());
      } else {
        errors.push(new Error(`Failed to generate content ${index}`));
      }
    });

    if (errors.length > 0 && contents.length === 0) {
      return Result.err(errors[0]);
    }

    return Result.ok(contents);
  }

  // ========================================================================
  // SEO OPTIMIZATION
  // ========================================================================

  /**
   * Optimize content for SEO
   */
  async optimizeSEO(
    request: AIOptimizeSEORequest
  ): Promise<Result<{
    optimizedContent: string;
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    suggestions: string[];
  }, Error>> {
    const prompt = `Optimize the following content for SEO:

Title: ${request.title}
Keywords: ${request.keywords.join(', ')}

Content:
${request.content}

Provide:
1. Optimized content with keywords naturally integrated
2. Meta title (under 60 characters)
3. Meta description (150-160 characters)
4. Additional keywords to target
5. Suggestions for improvement`;

    const result = await this.complete({
      prompt,
      model: this.defaultModel,
      maxTokens: 4000,
    });

    if (result.isErr()) {
      return Result.err(result.err);
    }

    // Parse the response
    const content = result.ok.content;
    const parsed = this.parseSEOResponse(content);

    return Result.ok(parsed);
  }

  private parseSEOResponse(response: string): {
    optimizedContent: string;
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    suggestions: string[];
  } {
    // Simple parsing - in production, use structured output
    const lines = response.split('\n').filter(Boolean);
    
    return {
      optimizedContent: response,
      metaTitle: lines[0] || '',
      metaDescription: lines[1] || '',
      keywords: [],
      suggestions: lines.slice(2),
    };
  }

  /**
   * Analyze SEO score
   */
  async analyzeSEOScore(
    content: string,
    title: string,
    targetUrl?: string
  ): Promise<Result<{
    score: number;
    issues: { type: string; message: string; severity: 'error' | 'warning' | 'info' }[];
    suggestions: string[];
  }, Error>> {
    const prompt = `Analyze the following content for SEO score (0-100):

Title: ${title}
Content: ${content}
${targetUrl ? `Target URL: ${targetUrl}` : ''}

Provide a JSON object with:
{
  "score": number,
  "issues": [{ "type": string, "message": string, "severity": "error" | "warning" | "info" }],
  "suggestions": string[]
}`;

    const result = await this.complete({
      prompt,
      model: this.defaultModel,
      maxTokens: 2000,
      systemPrompt: 'Respond with only valid JSON. No markdown.',
    });

    if (result.isErr()) {
      return Result.err(result.err);
    }

    try {
      const data = JSON.parse(result.ok.content);
      return Result.ok(data);
    } catch {
      return Result.err(new Error('Failed to parse SEO analysis'));
    }
  }

  // ========================================================================
  // TRANSLATION
  // ========================================================================

  /**
   * Translate content
   */
  async translate(
    request: AITranslateRequest
  ): Promise<Result<string, Error>> {
    let prompt = `Translate the following content to ${request.targetLanguage}`;

    if (request.preserveFormatting) {
      prompt += '. Preserve all HTML markup and formatting.';
    }

    if (request.sourceLanguage) {
      prompt += ` Source language: ${request.sourceLanguage}`;
    }

    prompt += `\n\nContent:\n${request.content}`;

    const result = await this.complete({
      prompt,
      model: this.defaultModel,
      maxTokens: 10000,
    });

    if (result.isErr()) {
      return Result.err(result.err);
    }

    return Result.ok(result.ok.content);
  }

  /**
   * Batch translate
   */
  async batchTranslate(
    contents: string[],
    targetLanguage: string
  ): Promise<Result<string[], Error>> {
    const results = await Promise.allSettled(
      contents.map(content =>
        this.translate({ content, targetLanguage })
      )
    );

    const translated: string[] = [];
    const errors: Error[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.isOk()) {
        translated.push(result.value.ok());
      } else {
        errors.push(new Error(`Failed to translate ${index}`));
      }
    });

    if (errors.length > 0 && translated.length === 0) {
      return Result.err(errors[0]);
    }

    return Result.ok(translated);
  }

  // ========================================================================
  // PROOFREADING
  // ========================================================================

  /**
   * Proofread content
   */
  async proofread(
    request: AIProofreadRequest
  ): Promise<Result<{
    corrected: string;
    changes: { type: string; original: string; corrected: string; position: number }[];
  }, Error>> {
    let prompt = `Proofread and correct the following content`;

    if (request.style) {
      prompt += ` in a ${request.style} style`;
    }

    prompt += ':\n\n' + request.content;

    const corrections: string[] = [];
    if (request.fixGrammar !== false) corrections.push('grammar');
    if (request.fixSpelling !== false) corrections.push('spelling');
    if (request.fixPunctuation !== false) corrections.push('punctuation');

    if (corrections.length > 0) {
      prompt += `\n\nFix: ${corrections.join(', ')}`;
    }

    const result = await this.complete({
      prompt,
      model: this.defaultModel,
      maxTokens: 10000,
    });

    if (result.isErr()) {
      return Result.err(result.err);
    }

    return Result.ok({
      corrected: result.ok.content,
      changes: [], // Would parse diff in production
    });
  }

  // ========================================================================
  // SMART RECOMMENDATIONS
  // ========================================================================

  /**
   * Get layout suggestions
   */
  async suggestLayout(
    pageType: string,
    content: string
  ): Promise<Result<AIRecommendation[], Error>> {
    const prompt = `Suggest optimal block layout for a ${pageType} page with this content:
${content}

Provide 3-5 recommendations as JSON:
[{
  "id": "1",
  "type": "layout",
  "confidence": 0.9,
  "content": "Hero → Feature Grid → CTA",
  "reasoning": "..."
}]`;

    const result = await this.complete({
      prompt,
      model: this.defaultModel,
      maxTokens: 2000,
      systemPrompt: 'Respond with only valid JSON array. No markdown.',
    });

    if (result.isErr()) {
      return Result.err(result.err);
    }

    try {
      const recommendations = JSON.parse(result.ok.content);
      return Result.ok(recommendations);
    } catch {
      return Result.err(new Error('Failed to parse recommendations'));
    }
  }

  /**
   * Get image suggestions
   */
  async suggestImages(
    content: string,
    count: number = 3
  ): Promise<Result<string[], Error>> {
    const prompt = `Suggest ${count} image concepts for this content:
${content}

Provide image descriptions that would enhance the content.
Return as JSON array of descriptions.`;

    const result = await this.complete({
      prompt,
      model: this.defaultModel,
      maxTokens: 1000,
      systemPrompt: 'Respond with only valid JSON array. No markdown.',
    });

    if (result.isErr()) {
      return Result.err(result.err);
    }

    try {
      const images = JSON.parse(result.ok.content);
      return Result.ok(images);
    } catch {
      return Result.err(new Error('Failed to parse image suggestions'));
    }
  }

  // ========================================================================
  // WORKFLOW MANAGEMENT
  // ========================================================================

  /**
   * Create workflow
   */
  async createWorkflow(workflow: Omit<AIWorkflow, 'id' | 'createdAt' | 'updatedAt'>): Promise<Result<AIWorkflow, Error>> {
    const newWorkflow: AIWorkflow = {
      ...workflow,
      id: `wf_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.workflows.set(newWorkflow.id, newWorkflow);
    return Result.ok(newWorkflow);
  }

  /**
   * Get workflow
   */
  async getWorkflow(workflowId: string): Promise<Result<AIWorkflow, Error>> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      return Result.err(new Error('Workflow not found'));
    }
    return Result.ok(workflow);
  }

  /**
   * List workflows
   */
  async listWorkflows(): Promise<Result<AIWorkflow[], Error>> {
    return Result.ok(Array.from(this.workflows.values()));
  }

  /**
   * Update workflow
   */
  async updateWorkflow(
    workflowId: string,
    updates: Partial<AIWorkflow>
  ): Promise<Result<AIWorkflow, Error>> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      return Result.err(new Error('Workflow not found'));
    }

    const updated = {
      ...workflow,
      ...updates,
      updatedAt: new Date(),
    };

    this.workflows.set(workflowId, updated);
    return Result.ok(updated);
  }

  /**
   * Delete workflow
   */
  async deleteWorkflow(workflowId: string): Promise<Result<void, Error>> {
    if (!this.workflows.has(workflowId)) {
      return Result.err(new Error('Workflow not found'));
    }

    this.workflows.delete(workflowId);
    return Result.ok(undefined);
  }

  /**
   * Execute workflow
   */
  async executeWorkflow(
    workflowId: string,
    context: AIContext
  ): Promise<Result<AICompletionResponse[], Error>> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      return Result.err(new Error('Workflow not found'));
    }

    const results: AICompletionResponse[] = [];

    for (const action of workflow.actions) {
      if (!action.enabled) continue;

      const result = await this.complete({
        prompt: action.prompt,
        context,
        model: action.model,
        temperature: action.temperature,
        maxTokens: action.maxTokens,
      });

      if (result.isErr()) {
        return Result.err(result.err);
      }

      results.push(result.ok);
    }

    return Result.ok(results);
  }

  // ========================================================================
  // TRIGGER HANDLING
  // ========================================================================

  /**
   * Handle block add trigger
   */
  async onBlockAdd(blockType: string, blockData: unknown): Promise<Result<AIRecommendation[], Error>> {
    const workflows = Array.from(this.workflows.values()).filter(
      wf => wf.isActive && wf.actions.some(a => 
        a.trigger.type === 'onBlockAdd' && 
        (!a.trigger.blockTypes?.length || a.trigger.blockTypes.includes(blockType))
      )
    );

    const recommendations: AIRecommendation[] = [];

    for (const workflow of workflows) {
      for (const action of workflow.actions) {
        if (!action.enabled || action.trigger.type !== 'onBlockAdd') continue;

        const result = await this.complete({
          prompt: action.prompt,
          context: { blockId: '', content: JSON.stringify(blockData) },
          model: action.model,
        });

        if (result.isOk()) {
          recommendations.push({
            id: action.id,
            type: 'content',
            confidence: 0.7,
            content: result.ok.content,
            reasoning: 'AI suggestion based on block content',
          });
        }
      }
    }

    return Result.ok(recommendations);
  }

  /**
   * Handle content change trigger
   */
  async onContentChange(
    pageId: string,
    changes: { blockId: string; before: unknown; after: unknown }[]
  ): Promise<Result<AIRecommendation[], Error>> {
    // Debounce - in production, use a proper queue
    const prompt = `Analyze these content changes and suggest improvements:
${JSON.stringify(changes, null, 2)}`;

    const result = await this.complete({
      prompt,
      context: { pageId },
      model: this.defaultModel,
    });

    if (result.isErr()) {
      return Result.err(result.err);
    }

    return Result.ok([{
      id: 'content-change',
      type: 'content',
      confidence: 0.6,
      content: result.ok.content,
      reasoning: 'Based on content changes',
    }]);
  }

  // ========================================================================
  // UTILITY METHODS
  // ========================================================================

  /**
   * Stream completion (for real-time)
   */
  async *streamComplete(
    request: AICompletionRequest
  ): AsyncGenerator<string, void, unknown> {
    const response = await fetch(`${this.baseUrl}/completions/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Stream error: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) return;

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;
          try {
            const parsed = JSON.parse(data);
            yield parsed.choices?.[0]?.delta?.content || '';
          } catch {
            // Skip invalid
          }
        }
      }
    }
  }

  /**
   * Get available models
   */
  getModels(): { id: AIModel; name: string; provider: string }[] {
    return Object.entries(DEFAULT_MODELS).map(([id, config]) => ({
      id: id as AIModel,
      name: id,
      provider: config.provider,
    }));
  }

  /**
   * Estimate tokens
   */
  estimateTokens(text: string): number {
    // Rough estimate: 1 token  4 characters
    return Math.ceil(text.length / 4);
  }

  /**
   * Check rate limit
   */
  getRateLimitStatus(): { remaining: number; resetAt: Date } {
    return {
      remaining: 500, // Would come from API
      resetAt: new Date(Date.now() + 60000),
    };
  }
}

// ============================================================================
// SINGLETON
// ============================================================================

let aiEngineInstance: AIWorkflowEngine | null = null;

export function getAIEngine(): AIWorkflowEngine {
  if (!aiEngineInstance) {
    aiEngineInstance = new AIWorkflowEngine();
  }
  return aiEngineInstance;
}

// ============================================================================
// EXPORTS
// ============================================================================

export const AIWorkflowConfig = {
  DEFAULT_MODELS,
  DEFAULT_PROMPT,
};

export default AIWorkflowEngine;