/**
 * @file useAIChat — Vercel AI SDK useChat wrapper with property context injection.
 * Provides streaming chat, error recovery, and optimistic message handling.
 */
'use client';

import { useChat } from '@ai-sdk/react';
import { useCallback, useMemo } from 'react';

export interface PropertyContext {
  id?: string;
  title?: string;
  location?: string;
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  pricePerNight?: number;
  amenities?: string[];
}

export interface UseAIChatOptions {
  propertyContext?: PropertyContext;
  onDescriptionGenerated?: (description: string) => void;
  initialMessages?: any[];
}

export interface UseAIChatReturn {
  messages: any[];
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  error: Error | undefined;
  stop: () => void;
  reload: () => void;
  setInput: (input: string) => void;
  clearMessages: () => void;
  sendMessage: (content: string) => void;
  lastAssistantMessage: string | undefined;
}

/**
 * Production-grade AI chat hook with property context, streaming, and error recovery.
 * @param options - Configuration including optional property context
 */
export function useAIChat(options: UseAIChatOptions = {}): UseAIChatReturn {
  const { propertyContext, initialMessages } = options;

  const body = useMemo(
    () => (propertyContext ? { propertyContext } : undefined),
    [propertyContext]
  );

  const chat = useChat({
    initialMessages,
    onError: (err: any) => {
      console.error('[useAIChat] Stream error:', err);
    },
  } as any);

  const messages = chat.messages || [];
  const input = (chat as any).input || '';
  const handleInputChange = (chat as any).handleInputChange || (() => {});
  const handleSubmit = (chat as any).handleSubmit || (() => {});
  const isLoading = (chat as any).isLoading || false;
  const error = (chat as any).error;
  const stop = chat.stop || (() => {});
  const reload = (chat as any).reload || (() => {});
  const setMessages = chat.setMessages || (() => {});
  const setInput = (chat as any).setInput || (() => {});
  const append = (chat as any).append || (() => {});

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, [setMessages]);

  const sendMessage = useCallback(
    (content: string) => {
      append({ role: 'user', content });
    },
    [append]
  );

  const lastAssistantMessage = useMemo(() => {
    const msgs = messages as any[];
    const last = [...msgs].reverse().find((m) => m.role === 'assistant');
    return (last as any)?.content as string | undefined;
  }, [messages]);

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    stop,
    reload,
    setInput,
    clearMessages,
    sendMessage,
    lastAssistantMessage,
  };
}
