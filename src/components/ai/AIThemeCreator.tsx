/**
 * @file AIThemeCreator — Premium AI-powered theme generation panel.
 * Generates design tokens from natural language, applies them live via CSS vars,
 * with preset gallery and real-time preview.
 */
'use client';

import { useState, useCallback, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Wand2, Check, Palette, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GeneratedTheme } from '@/app/api/ai/generate-theme/route';

const THEME_PRESETS = [
  { label: 'Malta Gold', prompt: 'Luxury dark theme with warm gold accents, reminiscent of Malta limestone and Mediterranean evenings', emoji: '🥇' },
  { label: 'Ocean Blue', prompt: 'Deep ocean blues with aquamarine accents, clean and fresh Mediterranean coastal resort', emoji: '🌊' },
  { label: 'Santorini', prompt: 'White and cobalt blue Santorini inspired, bright clean minimal Greek island aesthetic', emoji: '🏛️' },
  { label: 'Night Emerald', prompt: 'Deep charcoal dark theme with rich emerald green accents, luxury boutique hotel', emoji: '💎' },
  { label: 'Sand Linen', prompt: 'Warm beige and sand tones, light luxurious minimal Scandinavian-Mediterranean hybrid', emoji: '🏖️' },
  { label: 'Obsidian', prompt: 'Ultra dark near-black obsidian with pure white text and electric blue accents, modern tech luxury', emoji: '⚫' },
] as const;

interface AIThemeCreatorProps {
  /** Called when a theme is applied — receives CSS token map */
  onThemeApplied?: (tokens: Record<string, string>, theme: GeneratedTheme) => void;
  className?: string;
}

/**
 * AI Theme Creator with preset gallery, live token preview, and one-click application.
 */
export function AIThemeCreator({ onThemeApplied, className }: AIThemeCreatorProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTheme, setGeneratedTheme] = useState<GeneratedTheme | null>(null);
  const [appliedTheme, setAppliedTheme] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const generate = useCallback(async (promptText: string) => {
    if (!promptText.trim() || isGenerating) return;
    setIsGenerating(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/generate-theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptText }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Generation failed' })) as { error: string };
        throw new Error(err.error);
      }
      const data = await res.json() as { theme: GeneratedTheme };
      setGeneratedTheme(data.theme);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Theme generation failed');
    } finally {
      setIsGenerating(false);
    }
  }, [isGenerating]);

  const applyTheme = useCallback((theme: GeneratedTheme) => {
    startTransition(() => {
      // Apply tokens to :root for live preview
      const root = document.documentElement;
      const tokens = theme.tokens ?? {};
      Object.entries(tokens).forEach(([key, value]) => {
        root.style.setProperty(key, value as string);
      });
      setAppliedTheme(theme.name);
      onThemeApplied?.(tokens, theme);
    });
  }, [onThemeApplied]);

  const resetTheme = useCallback(() => {
    // Reset to default Malta Gold tokens
    const defaults: Record<string, string> = {
      '--pm-bg': '#0e0f11', '--pm-bg-2': '#111214', '--pm-bg-3': '#1a1b1f',
      '--pm-border': '#2a2b30', '--pm-accent': '#c8a96a', '--pm-accent-fg': '#0e0f11',
      '--pm-text': '#e8e4dc', '--pm-text-muted': '#e8e4dc80',
      '--pm-radius': '12px', '--pm-font': "'Inter', system-ui, sans-serif",
    };
    Object.entries(defaults).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));
    setAppliedTheme(null);
    setGeneratedTheme(null);
  }, []);

  return (
    <div className={cn('flex flex-col gap-4 p-4 rounded-xl border border-border bg-background', className)}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <Palette className="w-4 h-4 text-violet-500" />
        <span className="text-sm font-semibold">AI Theme Creator</span>
        {appliedTheme && (
          <Badge variant="outline" className="ml-auto text-xs border-emerald-500 text-emerald-500">
            <Check className="w-3 h-3 mr-1" /> {appliedTheme}
          </Badge>
        )}
      </div>

      {/* Preset Gallery */}
      <div className="grid grid-cols-3 gap-1.5">
        {THEME_PRESETS.map((preset) => (
          <button
            key={preset.label}
            onClick={() => {
              setPrompt(preset.prompt);
              generate(preset.prompt).catch((err) => {
                console.error('[AIThemeCreator] Failed to generate theme:', err);
              });
            }}
            disabled={isGenerating}
            className="flex flex-col items-center gap-1 p-2 rounded-lg border border-border hover:border-violet-400 hover:bg-muted/50 transition-all text-xs font-medium disabled:opacity-50"
          >
            <span className="text-lg">{preset.emoji}</span>
            <span className="text-muted-foreground">{preset.label}</span>
          </button>
        ))}
      </div>

      {/* Custom Prompt */}
      <div className="space-y-2">
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your ideal theme... (e.g. 'Warm Mediterranean sunset with terracotta and gold')"
          className="min-h-[72px] resize-none text-sm"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              generate(prompt).catch((err) => {
                console.error('[AIThemeCreator] Failed to generate theme:', err);
              });
            }
          }}
        />
        <div className="flex gap-2">
          <Button
            onClick={() => generate(prompt).catch((err) => {
              console.error('[AIThemeCreator] Failed to generate theme:', err);
            })}
            disabled={isGenerating || !prompt.trim()}
            size="sm"
            className="flex-1 bg-violet-600 hover:bg-violet-700"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Wand2 className="w-4 h-4 mr-2" />}
            {isGenerating ? 'Generating...' : 'Generate Theme'}
          </Button>
          {(generatedTheme ?? appliedTheme) && (
            <Button variant="outline" size="sm" onClick={resetTheme} title="Reset to default">
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-destructive bg-destructive/10 rounded-md px-3 py-2">{error}</p>
      )}

      {/* Generated Theme Preview */}
      {generatedTheme && (
        <div className="space-y-3 rounded-lg border border-border p-3">
          {/* Gradient swatch */}
          <div
            className="h-12 rounded-md w-full"
            style={{ background: generatedTheme.previewGradient }}
          />
          <div className="space-y-1">
            <p className="text-sm font-semibold">{generatedTheme.name}</p>
            <p className="text-xs text-muted-foreground">{generatedTheme.description}</p>
          </div>
          {/* Token swatches */}
          <div className="flex gap-1.5 flex-wrap">
            {(['--pm-bg', '--pm-bg-3', '--pm-accent', '--pm-text'] as const).map((tok) => (
              <div
                key={tok}
                className="w-7 h-7 rounded-full border-2 border-background shadow-sm"
                style={{ background: generatedTheme.tokens?.[tok] ?? '#ccc' }}
                title={`${tok}: ${generatedTheme.tokens?.[tok] ?? 'N/A'}`}
              />
            ))}
            <Badge variant="outline" className="text-xs">
              {generatedTheme.darkMode ? '🌙 Dark' : '☀️ Light'}
            </Badge>
          </div>
          <Button
            onClick={() => applyTheme(generatedTheme)}
            size="sm"
            className="w-full bg-emerald-600 hover:bg-emerald-700"
          >
            <Check className="w-4 h-4 mr-2" /> Apply Theme Live
          </Button>
        </div>
      )}
    </div>
  );
}
