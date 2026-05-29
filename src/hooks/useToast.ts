/**
 * @fileoverview useToast — imperative toast API backed by Zustand editor store.
 * Compatible with shadcn/ui Toast primitive.
 */
'use client';
import { useEditorStore } from '@/store/editor-store';
import { generateId } from '@/lib/utils';
import type { ToastType } from '@/types/ui';

export function useToast() {
  // Stub toast functions - store doesn't have toast methods yet
  const addToast = (toast: any) => console.log('Toast:', toast);
  const removeToast = (id: string) => console.log('Remove toast:', id);

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
