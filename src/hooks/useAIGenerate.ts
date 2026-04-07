/**
 * @file useAIGenerate — Typed hooks for AI object/text generation endpoints.
 * Covers page generation, block generation, and streaming descriptions.
 */
'use client';

import { useCompletion } from '@ai-sdk/react';
import { useState, useCallback } from 'react';

// ─── Page Generation ─────────────────────────────────────────────────────────

export interface GeneratePageOptions {
  prompt: string;
  pageType?: string;
  propertyData?: Record<string, unknown>;
}

export interface GeneratedPage {
  title: string;
  description: string;
  blocks: Array<{ type: string; props: Record<string, unknown> }>;
  generatedAt: string;
}

export interface UseAIPageGeneratorReturn {
  generate: (opts: GeneratePageOptions) => Promise<GeneratedPage | null>;
  isGenerating: boolean;
  error: string | null;
  result: GeneratedPage | null;
  reset: () => void;
}

/**
 * Hook for AI-powered full page generation via /api/ai/generate-page.
 */
export function useAIPageGenerator(): UseAIPageGeneratorReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GeneratedPage | null>(null);

  const generate = useCallback(async (opts: GeneratePageOptions): Promise<GeneratedPage | null> => {
    setIsGenerating(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/generate-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(opts),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: 'Unknown error' })) as { error: string };
        throw new Error(errData.error);
      }
      const data = await res.json() as { success: boolean; page: GeneratedPage };
      setResult(data.page);
      return data.page;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Generation failed';
      setError(message);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { generate, isGenerating, error, result, reset };
}

// ─── Block Generation ─────────────────────────────────────────────────────────

export interface GenerateBlocksOptions {
  prompt: string;
  existingBlocks?: unknown[];
  pageSlug?: string;
}

export interface UseAIBlockGeneratorReturn {
  generate: (opts: GenerateBlocksOptions) => Promise<Array<{ id: string; type: string; props: Record<string, unknown> }> | null>;
  isGenerating: boolean;
  error: string | null;
  reset: () => void;
}

/**
 * Hook for AI-powered Puck block generation via /api/ai/generate-blocks.
 */
export function useAIBlockGenerator(): UseAIBlockGeneratorReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (opts: GenerateBlocksOptions) => {
    setIsGenerating(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/generate-blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(opts),
      });
      if (!res.ok) throw new Error('Block generation failed');
      const data = await res.json() as { blocks: Array<{ id: string; type: string; props: Record<string, unknown> }> };
      return data.blocks;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const reset = useCallback(() => setError(null), []);

  return { generate, isGenerating, error, reset };
}

// ─── Streaming Description ───────────────────────────────────────────────────

export interface DescriptionOptions {
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  location: string;
  amenities: string[];
  pricePerNight?: number;
  style?: 'luxury' | 'casual' | 'professional' | 'airbnb';
  maxLength?: number;
}

/**
 * Hook for streaming AI property description generation via /api/ai/generate-description.
 */
export function useAIDescription() {
  const { completion, complete, isLoading, error, stop } = useCompletion({
    api: '/api/ai/generate-description',
    onError: (err) => console.error('[useAIDescription]', err),
  });

  const generate = useCallback(
    (opts: DescriptionOptions) =>
      complete('', { body: opts }),
    [complete]
  );

  return { description: completion, generate, isStreaming: isLoading, error, stop };
}
