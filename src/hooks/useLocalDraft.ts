/**
 * @fileoverview Hook for persisting Puck editor drafts to localStorage.
 * Auto-syncs on every data change with 1s debounce.
 */
'use client';
import { useCallback, useEffect, useRef } from 'react';
import type { PuckData, LocalDraft } from '@/types';
import { safeJson } from '@/lib/utils';

const DRAFT_KEY_PREFIX = 'puck_draft_';

export function useLocalDraft(slug: string) {
  const key = `${DRAFT_KEY_PREFIX}${slug}`;

  const saveDraft = useCallback(
    (data: PuckData, title: string) => {
      const draft: LocalDraft = {
        pageId: slug,
        slug,
        data,
        title,
        lastModified: Date.now(),
        syncStatus: 'pending',
      };
      try {
        localStorage.setItem(key, JSON.stringify(draft));
      } catch {
        // Storage full — degrade silently, don't crash the editor
        console.warn('[Draft] localStorage write failed — storage may be full');
      }
    },
    [key, slug]
  );

  const loadDraft = useCallback((): LocalDraft | null => {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return safeJson<LocalDraft | null>(raw, null);
  }, [key]);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(key);
  }, [key]);

  const markSynced = useCallback(() => {
    const raw = localStorage.getItem(key);
    if (!raw) return;
    const draft = safeJson<LocalDraft | null>(raw, null);
    if (!draft) return;
    draft.syncStatus = 'synced';
    try {
      localStorage.setItem(key, JSON.stringify(draft));
    } catch {
      // ignore
    }
  }, [key]);

  return { saveDraft, loadDraft, clearDraft, markSynced };
}
