/**
 * @file PuckAIPanel — World-class AI assistant panel embedded in the Puck editor.
 * Supports block generation, full page generation, and streaming chat.
 */
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useAIChat } from '@/hooks/useAIChat';
import { useAIBlockGenerator, useAIPageGenerator } from '@/hooks/useAIGenerate';
import { Sparkles, Send, Loader2, StopCircle, Trash2, Zap, FileText, Blocks } from 'lucide-react';
import { cn } from '@/lib/utils';

export type AIMode = 'chat' | 'blocks' | 'page';

export interface PuckAIPanelProps {
  /** Current page slug for context-aware generation */
  pageSlug?: string;
  /** Existing Puck data blocks for context */
  existingBlocks?: unknown[];
  /** Called when blocks are generated — insert into Puck editor */
  onBlocksGenerated?: (blocks: Array<{ id: string; type: string; props: Record<string, unknown> }>) => void;
  /** Called when a full page is generated */
  onPageGenerated?: (page: { title: string; description: string; blocks: Array<{ type: string; props: Record<string, unknown> }> }) => void;
  className?: string;
}

/**
 * Embedded AI panel for the Puck CMS editor — chat, block gen, page gen.
 */
export function PuckAIPanel({
  pageSlug,
  existingBlocks,
  onBlocksGenerated,
  onPageGenerated,
  className,
}: PuckAIPanelProps) {
  const [mode, setMode] = useState<AIMode>('chat');
  const [prompt, setPrompt] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, handleSubmit, handleInputChange, isLoading: chatLoading, stop, clearMessages, input, setInput } = useAIChat();
  const { generate: generateBlocks, isGenerating: blocksLoading, error: blocksError } = useAIBlockGenerator();
  const { generate: generatePage, isGenerating: pageLoading, error: pageError } = useAIPageGenerator();

  const isLoading = chatLoading || blocksLoading || pageLoading;

  // Auto-scroll chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function handleGenerate(): Promise<void> {
    if (!prompt.trim() || isLoading) return;

    if (mode === 'blocks') {
      const blocks = await generateBlocks({ prompt, existingBlocks, pageSlug });
      if (blocks) {
        onBlocksGenerated?.(blocks);
        setPrompt('');
      }
    } else if (mode === 'page') {
      const page = await generatePage({ prompt, pageType: 'property', propertyData: existingBlocks ? { blocks: existingBlocks } : undefined });
      if (page) {
        onPageGenerated?.(page);
        setPrompt('');
      }
    }
  }

  const modeConfig: Record<AIMode, { label: string; icon: React.ReactNode; placeholder: string; color: string }> = {
    chat: { label: 'Chat', icon: <Sparkles className="w-3.5 h-3.5" />, placeholder: 'Ask anything about this page or property...', color: 'bg-violet-500/10 text-violet-600 border-violet-200' },
    blocks: { label: 'Add Blocks', icon: <Blocks className="w-3.5 h-3.5" />, placeholder: 'Describe blocks to add (e.g. "Add a hero section with booking CTA for a beachfront villa")...', color: 'bg-blue-500/10 text-blue-600 border-blue-200' },
    page: { label: 'Generate Page', icon: <FileText className="w-3.5 h-3.5" />, placeholder: 'Describe the full page to generate (e.g. "Landing page for a luxury 3BR apartment in Sliema with pool")...', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200' },
  };

  return (
    <div className={cn('flex flex-col h-full bg-background border-l border-border', className)}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
        <Zap className="w-4 h-4 text-violet-500" />
        <span className="text-sm font-semibold text-foreground">AI Assistant</span>
        <div className="ml-auto flex gap-1">
          {(['chat', 'blocks', 'page'] as AIMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                'flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all border',
                mode === m ? modeConfig[m].color : 'text-muted-foreground border-transparent hover:bg-muted'
              )}
            >
              {modeConfig[m].icon}
              {modeConfig[m].label}
            </button>
          ))}
        </div>
      </div>

      {/* Chat messages (chat mode only) */}
      {mode === 'chat' && (
        <ScrollArea className="flex-1 px-4" ref={scrollRef as React.RefObject<HTMLDivElement>}>
          <div className="py-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground text-xs py-8">
                <Sparkles className="w-8 h-8 mx-auto mb-2 text-violet-300" />
                <p>Ask me to help write copy, answer questions about this property, or explain your page structure.</p>
              </div>
            )}
            {messages.map((msg) => (
              <div key={msg.id} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                <div className={cn(
                  'max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed',
                  msg.role === 'user'
                    ? 'bg-violet-600 text-white rounded-br-sm'
                    : 'bg-muted text-foreground rounded-bl-sm'
                )}>
                  {msg.content}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-xl rounded-bl-sm px-3 py-2">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      )}

      {/* Generation mode placeholder */}
      {mode !== 'chat' && (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center text-muted-foreground text-xs space-y-2">
            {modeConfig[mode].icon}
            <p className="text-sm font-medium text-foreground">
              {mode === 'blocks' ? 'AI Block Injection' : 'AI Page Generator'}
            </p>
            <p>{mode === 'blocks' ? 'Describe blocks and they\'ll be inserted into your editor.' : 'Describe a complete page and it will replace the current content.'}</p>
            {(blocksError ?? pageError) && (
              <Badge variant="destructive" className="mt-2">
                {blocksError ?? pageError}
              </Badge>
            )}
          </div>
        </div>
      )}

      <Separator />

      {/* Input area */}
      <div className="p-3 space-y-2">
        {mode === 'chat' ? (
          <form
            onSubmit={(e) => {
              handleSubmit(e);
            }}
            className="flex gap-2"
          >
            <Textarea
              value={input}
              onChange={handleInputChange}
              placeholder={modeConfig.chat.placeholder}
              className="min-h-[60px] max-h-[120px] resize-none text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  (e.currentTarget.form as HTMLFormElement)?.requestSubmit();
                }
              }}
            />
            <div className="flex flex-col gap-1">
              <Button type="submit" size="sm" disabled={isLoading || !input.trim()} className="bg-violet-600 hover:bg-violet-700">
                {chatLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
              {chatLoading && (
                <Button type="button" size="sm" variant="outline" onClick={stop}>
                  <StopCircle className="w-4 h-4" />
                </Button>
              )}
              <Button type="button" size="sm" variant="ghost" onClick={clearMessages} title="Clear">
                <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex gap-2">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={modeConfig[mode].placeholder}
              className="min-h-[60px] max-h-[120px] resize-none text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  void handleGenerate();
                }
              }}
            />
            <Button
              onClick={() => void handleGenerate()}
              disabled={isLoading || !prompt.trim()}
              size="sm"
              className={mode === 'blocks' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700'}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
