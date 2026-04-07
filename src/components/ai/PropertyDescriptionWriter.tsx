/**
 * @file PropertyDescriptionWriter — Inline streaming AI description writer.
 * Embeds directly in property forms. Streams output token-by-token.
 * Supports style modes, multi-language, and copy-to-clipboard.
 */
'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Wand2, Copy, Check, StopCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAIDescription } from '@/hooks/useAIGenerate';
import type { DescriptionOptions } from '@/hooks/useAIGenerate';

interface PropertyDescriptionWriterProps {
  /** Pre-filled property data to generate from */
  propertyData: Omit<DescriptionOptions, 'style' | 'language' | 'maxLength'>;
  /** Called with the final description when generation completes */
  onAccept?: (description: string) => void;
  className?: string;
}

/**
 * Inline streaming property description writer with style/language controls.
 */
export function PropertyDescriptionWriter({ propertyData, onAccept, className }: PropertyDescriptionWriterProps) {
  const [style, setStyle] = useState<DescriptionOptions['style']>('luxury');
  const [language, setLanguage] = useState<NonNullable<DescriptionOptions['language']>>('en');
  const [copied, setCopied] = useState(false);

  const { description, generate, isStreaming, error, stop } = useAIDescription();

  const handleGenerate = useCallback(() => {
    void generate({ ...propertyData, style, language, maxLength: 300 });
  }, [generate, propertyData, style, language]);

  const handleCopy = useCallback(async () => {
    if (!description) return;
    await navigator.clipboard.writeText(description);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [description]);

  return (
    <div className={cn('flex flex-col gap-3 rounded-xl border border-border bg-muted/30 p-4', className)}>
      <div className="flex items-center gap-2">
        <Wand2 className="w-4 h-4 text-violet-500" />
        <span className="text-sm font-semibold">AI Description Writer</span>
        {isStreaming && <Badge variant="outline" className="ml-auto text-xs animate-pulse">Streaming...</Badge>}
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        <Select value={style} onValueChange={(v) => setStyle(v as DescriptionOptions['style'])}>
          <SelectTrigger className="flex-1 h-8 text-xs">
            <SelectValue placeholder="Style" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="luxury">✨ Luxury</SelectItem>
            <SelectItem value="casual">😊 Casual</SelectItem>
            <SelectItem value="professional">💼 Professional</SelectItem>
            <SelectItem value="airbnb">🏠 Airbnb</SelectItem>
          </SelectContent>
        </Select>
        <Select value={language} onValueChange={(v) => setLanguage(v as NonNullable<DescriptionOptions['language']>)}>
          <SelectTrigger className="flex-1 h-8 text-xs">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">🇬🇧 English</SelectItem>
            <SelectItem value="de">🇩🇪 German</SelectItem>
            <SelectItem value="fr">🇫🇷 French</SelectItem>
            <SelectItem value="it">🇮🇹 Italian</SelectItem>
            <SelectItem value="mt">🇲🇹 Maltese</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Streaming output */}
      {description && (
        <div className="relative rounded-lg bg-background border border-border p-3 min-h-[80px]">
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{description}</p>
          {isStreaming && <span className="inline-block w-1 h-4 bg-violet-500 animate-pulse ml-0.5" />}
        </div>
      )}

      {error && <p className="text-xs text-destructive">{String(error)}</p>}

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          onClick={handleGenerate}
          disabled={isStreaming}
          size="sm"
          className="flex-1 bg-violet-600 hover:bg-violet-700"
        >
          {isStreaming ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Wand2 className="w-4 h-4 mr-2" />}
          {isStreaming ? 'Writing...' : description ? 'Regenerate' : 'Generate'}
        </Button>
        {isStreaming && (
          <Button variant="outline" size="sm" onClick={stop}>
            <StopCircle className="w-4 h-4" />
          </Button>
        )}
        {description && !isStreaming && (
          <>
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </Button>
            {onAccept && (
              <Button variant="outline" size="sm" onClick={() => onAccept(description)} className="border-emerald-500 text-emerald-500 hover:bg-emerald-50">
                <Check className="w-4 h-4 mr-1" /> Use This
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
