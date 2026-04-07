/**
 * @file useAIChat — Vercel AI SDK useChat wrapper with property context injection.
 * Provides streaming chat, error recovery, and optimistic message handling.
 */
'use client';

import { useChat, type Message } from 'ai/react';
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
  initialMessages?: Message[];
}

export interface UseAIChatReturn {
  messages: Message[];
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

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    stop,
    reload,
    setMessages,
    setInput,
    append,
  } = useChat({
    api: '/api/ai/chat',
    body,
    initialMessages,
    onError: (err) => {
      console.error('[useAIChat] Stream error:', err);
    },
  });

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, [setMessages]);

  const sendMessage = useCallback(
    (content: string) => {
      void append({ role: 'user', content });
    },
    [append]
  );

  const lastAssistantMessage = useMemo(() => {
    const last = [...messages].reverse().find((m) => m.role === 'assistant');
    return last?.content;
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
