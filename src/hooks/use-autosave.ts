'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useEditorStore } from '@/store/editor-store';
import { toast } from 'sonner';

// =============================================================================
// AUTO-SAVE HOOK
// =============================================================================

const AUTOSAVE_DELAY = 3000; // 3 seconds
const MAX_RETRIES = 3;

export function useAutosave() {
  const {
    currentPage,
    isDirty,
    isSaving,
    setSaving,
    markSaved,
    pushToUndo,
  } = useEditorStore();

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const lastContentRef = useRef<any>(null);

  const savePage = useCallback(async (content: any) => {
    if (!currentPage || isSaving) return;

    setSaving(true);
    
    try {
      const response = await fetch(`/api/pages/${currentPage.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: currentPage.title,
          data: content,
          saveAsDraft: true,
          meta: {
            title: currentPage.metaTitle || currentPage.title,
            description: currentPage.metaDescription,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save page');
      }

      markSaved();
      retryCountRef.current = 0;
      
      // Push to undo stack after successful save
      if (lastContentRef.current) {
        pushToUndo(lastContentRef.current);
      }
      lastContentRef.current = content;
      
    } catch (error) {
      console.error('Auto-save failed:', error);
      
      if (retryCountRef.current < MAX_RETRIES) {
        retryCountRef.current++;
        // Retry after delay
        setTimeout(() => savePage(content), 2000 * retryCountRef.current);
      } else {
        toast.error('Auto-save failed. Please save manually.');
        retryCountRef.current = 0;
      }
    } finally {
      setSaving(false);
    }
  }, [currentPage, isSaving, setSaving, markSaved, pushToUndo]);

  // Trigger auto-save when content changes
  const triggerAutosave = useCallback((content: any) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      if (isDirty && !isSaving) {
        savePage(content);
      }
    }, AUTOSAVE_DELAY);
  }, [isDirty, isSaving, savePage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { triggerAutosave, savePage };
}

// =============================================================================
// MANUAL SAVE HOOK
// =============================================================================

export function useManualSave() {
  const { currentPage, setSaving, markSaved, pushToUndo } = useEditorStore();

  const savePage = useCallback(async (content: any, publish: boolean = false) => {
    if (!currentPage) {
      toast.error('No page selected');
      return null;
    }

    setSaving(true);
    
    try {
      const response = await fetch(`/api/pages/${currentPage.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: currentPage.title,
          data: content,
          publish,
          meta: {
            title: currentPage.metaTitle || currentPage.title,
            description: currentPage.metaDescription,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save page');
      }

      const savedPage = await response.json();
      markSaved();
      pushToUndo(content);
      
      if (publish) {
        toast.success('Page published successfully!');
      } else {
        toast.success('Draft saved');
      }
      
      return savedPage;
    } catch (error) {
      console.error('Save failed:', error);
      toast.error('Failed to save page');
      return null;
    } finally {
      setSaving(false);
    }
  }, [currentPage, setSaving, markSaved, pushToUndo]);

  return { savePage };
}
