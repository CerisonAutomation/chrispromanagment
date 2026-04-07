/**
 * @fileoverview useToast — imperative toast API backed by Zustand editor store.
 * Compatible with shadcn/ui Toast primitive.
 */
'use client';
import { useEditorStore } from '@/store/editor';
import { generateId } from '@/lib/utils';
import type { ToastType } from '@/types';

export function useToast() {
  const addToast = useEditorStore((s) => s.addToast);
  const removeToast = useEditorStore((s) => s.removeToast);

  const toast = (type: ToastType, title: string, description?: string, duration = 4000) => {
    const id = generateId('toast');
    addToast({ id, type, title, description, duration });
    if (duration > 0) setTimeout(() => removeToast(id), duration);
    return id;
  };

  return {
    toast,
    success: (title: string, description?: string) => toast('success', title, description),
    error: (title: string, description?: string) => toast('error', title, description),
    info: (title: string, description?: string) => toast('info', title, description),
    warn: (title: string, description?: string) => toast('warning', title, description),
    dismiss: removeToast,
  };
}
