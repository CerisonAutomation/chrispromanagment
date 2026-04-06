'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useEditorStore } from '@/store/editor-store';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Sparkles, 
  Wand2, 
  Palette, 
  Layout, 
  Type, 
  Image as ImageIcon,
  Send,
  Loader2,
  Bot,
  User,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

// =============================================================================
// AI SPECIALIST MODES
// =============================================================================

type SpecialistMode = {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  prompt: string;
};

const specialists: SpecialistMode[] = [
  {
    id: 'designer',
    name: 'Visual Designer',
    description: 'Optimize colors, typography, and layout aesthetics',
    icon: Palette,
    prompt: 'You are a visual design expert. Analyze the current page and suggest improvements to colors, typography, spacing, and overall visual hierarchy. Provide specific CSS recommendations.',
  },
  {
    id: 'copywriter',
    name: 'Copywriter',
    description: 'Improve headlines, CTAs, and body text',
    icon: Type,
    prompt: 'You are a professional copywriter specializing in conversion optimization. Review the text content and suggest improvements for headlines, CTAs, and body copy to increase engagement.',
  },
  {
    id: 'architect',
    name: 'Layout Architect',
    description: 'Optimize structure and component organization',
    icon: Layout,
    prompt: 'You are a UX architect. Analyze the page structure and suggest improvements to component organization, flow, and user journey. Recommend component additions or removals.',
  },
  {
    id: 'seo',
    name: 'SEO Optimizer',
    description: 'Improve search visibility and meta data',
    icon: Wand2,
    prompt: 'You are an SEO specialist. Review the page content and suggest improvements for search engine optimization including meta titles, descriptions, headings structure, and content optimization.',
  },
];

// =============================================================================
// AI PANEL COMPONENT
// =============================================================================

export function AIPanel() {
  const { 
    currentPage, 
    aiMessages, 
    isAiGenerating, 
    addAiMessage, 
    setAiGenerating,
    clearAiMessages 
  } = useEditorStore();
  
  const [input, setInput] = useState('');
  const [activeSpecialist, setActiveSpecialist] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [aiMessages]);

  const handleSend = async () => {
    if (!input.trim() || isAiGenerating) return;

    const userMessage = input.trim();
    setInput('');
    addAiMessage({ role: 'user', content: userMessage });
    setAiGenerating(true);

    try {
      const specialist = specialists.find(s => s.id === activeSpecialist);
      const systemPrompt = specialist?.prompt || 'You are a helpful AI assistant for a website builder.';
      
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          systemPrompt,
          pageContext: currentPage ? {
            title: currentPage.title,
            slug: currentPage.slug,
            content: currentPage.content,
          } : null,
        }),
      });

      if (!response.ok) throw new Error('Failed to get AI response');

      const data = await response.json();
      addAiMessage({ role: 'assistant', content: data.response });
    } catch (error) {
      addAiMessage({ 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      });
    } finally {
      setAiGenerating(false);
    }
  };

  const handleSpecialistClick = (id: string) => {
    setActiveSpecialist(id === activeSpecialist ? null : id);
    const specialist = specialists.find(s => s.id === id);
    if (specialist && id !== activeSpecialist) {
      addAiMessage({ 
        role: 'assistant', 
        content: `I'm now in ${specialist.name} mode. ${specialist.description}. How can I help you?` 
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-4 py-3 border-b border-neutral-200">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-sm">AI Assistant</h2>
        </div>
        <p className="text-xs text-neutral-500 mt-1">
          Get help from AI specialists
        </p>
      </div>

      {/* Specialist Modes */}
      <div className="p-3 border-b border-neutral-200">
        <div className="grid grid-cols-2 gap-2">
          {specialists.map((specialist) => {
            const Icon = specialist.icon;
            const isActive = activeSpecialist === specialist.id;
            return (
              <button
                key={specialist.id}
                onClick={() => handleSpecialistClick(specialist.id)}
                className={cn(
                  "flex flex-col items-start p-2 rounded-lg text-left transition-all",
                  isActive 
                    ? "bg-primary/10 border border-primary/20" 
                    : "bg-neutral-50 hover:bg-neutral-100 border border-transparent"
                )}
              >
                <Icon className={cn(
                  "h-4 w-4 mb-1",
                  isActive ? "text-primary" : "text-neutral-500"
                )} />
                <span className={cn(
                  "text-xs font-medium",
                  isActive ? "text-primary" : "text-neutral-700"
                )}>
                  {specialist.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Messages */}
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        {aiMessages.length === 0 ? (
          <div className="text-center py-8 text-neutral-400">
            <Bot className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">Select a specialist or type a message</p>
            <p className="text-xs mt-1">to get AI-powered help</p>
          </div>
        ) : (
          <div className="space-y-4">
            {aiMessages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "flex gap-2",
                  msg.role === 'user' ? "justify-end" : "justify-start"
                )}
              >
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot className="h-3 w-3 text-primary" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                    msg.role === 'user'
                      ? "bg-primary text-white"
                      : "bg-neutral-100 text-neutral-800"
                  )}
                >
                  {msg.content}
                </div>
                {msg.role === 'user' && (
                  <div className="w-6 h-6 rounded-full bg-neutral-200 flex items-center justify-center shrink-0">
                    <User className="h-3 w-3 text-neutral-600" />
                  </div>
                )}
              </div>
            ))}
            {isAiGenerating && (
              <div className="flex gap-2 justify-start">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Bot className="h-3 w-3 text-primary" />
                </div>
                <div className="bg-neutral-100 rounded-lg px-3 py-2 flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span className="text-sm text-neutral-600">Thinking...</span>
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t border-neutral-200">
        {aiMessages.length > 0 && (
          <button
            onClick={clearAiMessages}
            className="text-xs text-neutral-400 hover:text-neutral-600 mb-2 flex items-center gap-1"
          >
            <RefreshCw className="h-3 w-3" />
            Clear chat
          </button>
        )}
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask AI for help..."
            className="min-h-[60px] resize-none"
          />
          <Button 
            size="icon" 
            onClick={handleSend}
            disabled={!input.trim() || isAiGenerating}
            className="shrink-0"
          >
            {isAiGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
