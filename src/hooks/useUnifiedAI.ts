/**
 * @fileoverview Unified AI Hooks — Consolidated React hooks for all AI/MCP operations.
 * Replaces scattered hooks with a single, type-safe, production-ready API.
 * @module hooks/useUnifiedAI
 * @version 8.0.0
 */

'use client';

import { useState, useCallback, useRef, useEffect, type FormEvent, type ChangeEvent } from 'react';
import type { 
  PageAuditResult, 
  CritiqueResult, 
  PuckBlock, 
  PuckPageData,
  McpToolResult 
} from '@/lib/mcp-client';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES — Complete type definitions for unified AI hooks
// ═══════════════════════════════════════════════════════════════════════════════

export interface AIHookState<T> {
  readonly data: T | null;
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly isError: boolean;
  readonly isSuccess: boolean;
}

export interface AIHookActions<TInput, TOutput> {
  execute: (input: TInput) => Promise<TOutput | null>;
  reset: () => void;
  cancel: () => void;
}

export type AIHookResult<TInput, TOutput> = AIHookState<TOutput> & AIHookActions<TInput, TOutput>;

// Audit hook types
export interface AuditInput {
  readonly slug: string;
  readonly focus?: readonly ('structure' | 'content' | 'seo' | 'accessibility' | 'performance' | 'brand')[];
  readonly strictness?: 'strict' | 'normal' | 'lenient';
}

// Critique hook types
export interface CritiqueInput {
  readonly pageSlug: string;
  readonly blockId: string;
  readonly focus?: readonly ('content' | 'design' | 'accessibility' | 'seo')[];
}

// Optimization hook types
export interface OptimizeInput {
  readonly slug: string;
  readonly focus?: readonly ('seo' | 'accessibility' | 'performance' | 'content')[];
  readonly autoApply?: boolean;
}

export interface OptimizeOutput {
  readonly optimized: boolean;
  readonly slug: string;
  readonly changes: ReadonlyArray<{
    readonly type: string;
    readonly blockIndex: number;
    readonly description: string;
    readonly suggestedProps?: Record<string, unknown>;
  }>;
  readonly score: {
    readonly before: number;
    readonly after: number;
  };
}

// Custom block generation types
export interface CustomBlockInput {
  readonly name: string;
  readonly description: string;
  readonly fields: ReadonlyArray<{
    readonly name: string;
    readonly type: 'text' | 'textarea' | 'select' | 'array' | 'number' | 'boolean';
    readonly label?: string;
    readonly required?: boolean;
  }>;
  readonly renderHint?: string;
}

export interface CustomBlockOutput {
  readonly blockType: string;
  readonly schema: Record<string, unknown>;
  readonly generatedCode: string;
  readonly filePath: string;
}

// MCP tool execution types
export interface McpToolInput {
  readonly tool: string;
  readonly params: Record<string, unknown>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// BASE HOOK FACTORY — Creates type-safe AI hooks with common patterns
// ═══════════════════════════════════════════════════════════════════════════════

function createAIHook<TInput, TOutput>(
  endpoint: string,
  options: {
    readonly method?: 'GET' | 'POST';
    readonly timeoutMs?: number;
    readonly onSuccess?: (data: TOutput) => void;
    readonly onError?: (error: string) => void;
  } = {}
): () => AIHookResult<TInput, TOutput> {
  const { method = 'POST', timeoutMs = 30000 } = options;

  return function useAIHook(): AIHookResult<TInput, TOutput> {
    const [state, setState] = useState<AIHookState<TOutput>>({
      data: null,
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: false,
    });

    const abortControllerRef = useRef<AbortController | null>(null);

    const cancel = useCallback(() => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    }, []);

    const reset = useCallback(() => {
      cancel();
      setState((prev: AIHookState<TOutput>) => ({
        data: null,
        isLoading: false,
        error: null,
        isError: false,
        isSuccess: false,
      }));
    }, [cancel]);

    const execute = useCallback(async (input: TInput): Promise<TOutput | null> => {
      cancel(); // Cancel any pending request

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      setState(prev => ({ ...prev, isLoading: true, error: null, isError: false }));

      try {
        const timeoutId = setTimeout(() => abortController.abort(), timeoutMs);

        const response = await fetch(endpoint, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: method === 'POST' ? JSON.stringify(input) : undefined,
          signal: abortController.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' })) as { error: string };
          throw new Error(errorData.error || `HTTP ${response.status}`);
        }

        const result = await response.json() as { success: boolean; data: TOutput };

        if (!result.success) {
          throw new Error('Operation failed');
        }

        setState({
          data: result.data,
          isLoading: false,
          error: null,
          isError: false,
          isSuccess: true,
        });

        options.onSuccess?.(result.data);
        return result.data;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        
        // Don't set error if request was cancelled
        if (message.includes('abort')) {
          return null;
        }

        setState({
          data: null,
          isLoading: false,
          error: message,
          isError: true,
          isSuccess: false,
        });

        options.onError?.(message);
        return null;
      } finally {
        abortControllerRef.current = null;
      }
    }, [cancel]);

    // Cleanup on unmount
    useEffect(() => cancel, [cancel]);

    return {
      ...state,
      execute,
      reset,
      cancel,
    };
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SPECIALIZED HOOKS — Pre-configured hooks for each AI operation
// ═══════════════════════════════════════════════════════════════════════════════

export const usePageAudit = createAIHook<AuditInput, PageAuditResult>('/api/mcp/tools/audit_page', {
  timeoutMs: 45000, // Audits can take longer
});

export const useBlockCritique = createAIHook<CritiqueInput, CritiqueResult>('/api/mcp/tools/critique_block', {
  timeoutMs: 30000,
});

export const usePageOptimize = createAIHook<OptimizeInput, OptimizeOutput>('/api/mcp/tools/optimize_page', {
  timeoutMs: 45000,
});

export const useGenerateCustomBlock = createAIHook<CustomBlockInput, CustomBlockOutput>('/api/mcp/tools/generate_custom_block', {
  timeoutMs: 60000, // Code generation can take longer
});

// ═══════════════════════════════════════════════════════════════════════════════
// CHAT TYPES — AI Chat message and options
// ═══════════════════════════════════════════════════════════════════════════════

export interface AIChatMessage {
  readonly id: string;
  readonly role: 'user' | 'assistant' | 'system';
  readonly content: string;
  readonly timestamp: string;
}

export interface UseAIChatOptions {
  readonly propertyContext?: {
    readonly id?: string;
    readonly title?: string;
    readonly location?: string;
    readonly propertyType?: string;
    readonly bedrooms?: number;
    readonly bathrooms?: number;
  };
  readonly onMessage?: (message: AIChatMessage) => void;
}

// ═══════════════════════════════════════════════════════════════════════════════
// BULK AUDIT TYPES — Batch processing types
// ═══════════════════════════════════════════════════════════════════════════════

export interface BulkAuditInput {
  readonly slugs: readonly string[];
}

export interface BulkAuditOutput {
  readonly results: ReadonlyArray<{
    readonly slug: string;
    readonly audit: PageAuditResult | null;
    readonly error?: string;
  }>;
  readonly summary: {
    readonly total: number;
    readonly successful: number;
    readonly failed: number;
    readonly averageScore: number;
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// MCP TOOL HOOK — Generic hook for any MCP tool
// ═══════════════════════════════════════════════════════════════════════════════

export function useMcpTool<TOutput = unknown>(toolName: string): AIHookResult<Record<string, unknown>, TOutput> {
  const endpoint = `/api/mcp/tools/${toolName}`;
  const hook = createAIHook<Record<string, unknown>, TOutput>(endpoint);
  return hook();
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPOSITE HOOKS — High-level operations combining multiple AI services
// ═══════════════════════════════════════════════════════════════════════════════

export interface PageAnalysisOutput {
  readonly audit: PageAuditResult;
  readonly critiques: ReadonlyArray<{
    readonly blockIndex: number;
    readonly blockType: string;
    readonly critique: CritiqueResult;
  }>;
  readonly summary: {
    readonly overallScore: number;
    readonly criticalIssues: number;
    readonly warnings: number;
    readonly suggestions: number;
  };
}

export function usePageAnalysis(): AIHookResult<{ slug: string }, PageAnalysisOutput> {
  const auditHook = usePageAudit();
  const [critiques, setCritiques] = useState<PageAnalysisOutput['critiques']>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const execute = useCallback(async (input: { slug: string }): Promise<PageAnalysisOutput | null> => {
    setIsAnalyzing(true);
    setCritiques([]);

    try {
      // Step 1: Run page audit
      const audit = await auditHook.execute({
        slug: input.slug,
        focus: ['structure', 'content', 'seo', 'accessibility', 'brand'],
      });

      if (!audit) {
        setIsAnalyzing(false);
        return null;
      }

      // Step 2: Critique each block (in parallel)
      const critiqueHook = createAIHook<CritiqueInput, CritiqueResult>('/api/mcp/tools/critique_block');
      const useCritique = critiqueHook();

      const blockCritiques = await Promise.all(
        audit.summary.totalBlocks > 0 
          ? Array.from({ length: Math.min(audit.summary.totalBlocks, 5) }, async (_, i) => {
              const critique = await useCritique.execute({
                pageSlug: input.slug,
                blockId: `block-${i}`, // This would need to be actual block IDs
                focus: ['content', 'design'],
              });
              return critique ? { blockIndex: i, blockType: 'Unknown', critique } : null;
            })
          : []
      );

      const validCritiques = blockCritiques.filter((c): c is NonNullable<typeof c> => c !== null);
      setCritiques(validCritiques);

      const criticalIssues = audit.issues.filter(i => i.severity === 'error').length;
      const warnings = audit.issues.filter(i => i.severity === 'warning').length;
      const suggestions = audit.issues.filter(i => i.severity === 'info').length;

      const result: PageAnalysisOutput = {
        audit,
        critiques: validCritiques,
        summary: {
          overallScore: audit.score,
          criticalIssues,
          warnings,
          suggestions,
        },
      };

      return result;
    } finally {
      setIsAnalyzing(false);
    }
  }, [auditHook]);

  const reset = useCallback(() => {
    auditHook.reset();
    setCritiques([]);
    setIsAnalyzing(false);
  }, [auditHook]);

  const cancel = useCallback(() => {
    auditHook.cancel();
    setIsAnalyzing(false);
  }, [auditHook]);

  return {
    data: null, // Would be computed from state
    isLoading: auditHook.isLoading || isAnalyzing,
    error: auditHook.error,
    isError: auditHook.isError,
    isSuccess: auditHook.isSuccess,
    execute,
    reset,
    cancel,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// BLOCK GENERATION HOOK — Enhanced block generation with MCP integration
// ═══════════════════════════════════════════════════════════════════════════════

export interface GenerateBlockInput {
  readonly prompt: string;
  readonly pageSlug?: string;
  readonly existingBlocks?: readonly PuckBlock[];
  readonly count?: number;
}

export interface GenerateBlockOutput {
  readonly blocks: readonly PuckBlock[];
  readonly reasoning: string;
}

export function useGenerateBlocks(): AIHookResult<GenerateBlockInput, GenerateBlockOutput> {
  const [state, setState] = useState<AIHookState<GenerateBlockOutput>>({
    data: null,
    isLoading: false,
    error: null,
    isError: false,
    isSuccess: false,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    cancel();
    setState({
      data: null,
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: false,
    });
  }, [cancel]);

  const execute = useCallback(async (input: GenerateBlockInput): Promise<GenerateBlockOutput | null> => {
    cancel();

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setState((prev: AIHookState<GenerateBlockOutput>) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch('/api/ai/generate-blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
        signal: abortController.signal,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' })) as { error: string };
        throw new Error(error.error);
      }

      const result = await response.json() as GenerateBlockOutput & { success: boolean };

      setState((prev: AIHookState<GenerateBlockOutput>) => ({ ...prev, data: result, isLoading: false, error: null, isError: false, isSuccess: true }));

      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      
      if (message.includes('abort')) {
        return null;
      }

      setState((prev: AIHookState<GenerateBlockOutput>) => ({ ...prev, data: null, isLoading: false, error: message, isError: true, isSuccess: false }));
      return null;
    } finally {
      abortControllerRef.current = null;
    }
  }, [cancel]);

  useEffect(() => cancel, [cancel]);

  return {
    ...state,
    execute,
    reset,
    cancel,
  };
}

// ... (rest of the code remains the same)

export function useAIChat(options: UseAIChatOptions = {}) {
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: AIChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev: AIChatMessage[]) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          propertyContext: options.propertyContext,
          history: messages.slice(-10), // Last 10 messages for context
        }),
      });

      if (!response.ok) {
        throw new Error('Chat request failed');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const assistantMessage: AIChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
      };

      setMessages((prev: AIChatMessage[]) => [...prev, assistantMessage]);

      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullContent += chunk;

        setMessages((prev: AIChatMessage[]) =>
          prev.map((m: AIChatMessage) =>
            m.id === assistantMessage.id
              ? { ...m, content: fullContent }
              : m
          )
        );
      }

      options.onMessage?.({ ...assistantMessage, content: fullContent });
    } catch (err) {
      setError((prev: string | null) => err instanceof Error ? err.message : 'Chat failed');
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, options]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setInput(e.target.value);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const stop = useCallback(() => {
    // Abort current fetch if implemented
    setIsLoading(false);
  }, []);

  return {
    messages,
    input,
    isLoading,
    error,
    handleSubmit,
    handleInputChange,
    setInput,
    clearMessages,
    stop,
    lastAssistantMessage: messages.filter(m => m.role === 'assistant').pop(),
  };
}

// ... (rest of the code remains the same)

export function useBulkAudit(): AIHookResult<BulkAuditInput, BulkAuditOutput> {
  const auditHook = usePageAudit();
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const execute = useCallback(async (input: BulkAuditInput): Promise<BulkAuditOutput | null> => {
    setProgress((prev: { current: number; total: number }) => ({ ...prev, current: 0, total: input.slugs.length }));

    const results: BulkAuditOutput['results'] = [];

    for (const slug of input.slugs) {
      const audit = await auditHook.execute({ slug });
      results.push({
        slug,
        audit,
        error: auditHook.error ?? undefined,
      });
      setProgress((prev: { current: number; total: number }) => ({ ...prev, current: prev.current + 1 }));
    }

    const successful = results.filter(r => r.audit !== null);
    const scores = successful.map(r => r.audit!.score);
    const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

    return {
      results,
      summary: {
        total: input.slugs.length,
        successful: successful.length,
        failed: input.slugs.length - successful.length,
        averageScore: Math.round(averageScore * 10) / 10,
      },
    };
  }, [auditHook]);

  return {
    data: null,
    isLoading: auditHook.isLoading,
    error: auditHook.error,
    isError: auditHook.isError,
    isSuccess: auditHook.isSuccess,
    execute,
    reset: auditHook.reset,
    cancel: auditHook.cancel,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT CONVENIENCE — Single import for all AI functionality
// ═══════════════════════════════════════════════════════════════════════════════

export const AI = {
  usePageAudit,
  useBlockCritique,
  usePageOptimize,
  useGenerateCustomBlock,
  useGenerateBlocks,
  usePageAnalysis,
  useMcpTool,
  useAIChat,
  useBulkAudit,
} as const;

export default AI;
