// =============================================================================
// CANONICAL PUCK USE-AUTOSAVE HOOK
// Auto-save functionality with retry logic
// =============================================================================

'use client';

import {useCallback, useEffect, useRef} from 'react';
import {useAdminStore} from '@/store/admin-store';
import {toast} from 'sonner';

const AUTOSAVE_DELAY = 3000;
const MAX_RETRIES = 3;

export function useAutosave() {
  const { currentPage, isDirty, isSaving, savePage: adminSavePage } = useAdminStore();

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);

  const savePage = useCallback(async (content: unknown) => {
    if (!currentPage || isSaving) return;

    try {
      await adminSavePage();
    } catch (error) {
      console.error('Auto-save failed:', error);
      
      if (retryCountRef.current < MAX_RETRIES) {
        retryCountRef.current++;
        setTimeout(() => savePage(content), 2000 * retryCountRef.current);
      } else {
        toast.error('Auto-save failed. Please save manually.');
        retryCountRef.current = 0;
      }
    }
  }, [currentPage, isSaving, adminSavePage]);

  const triggerAutosave = useCallback((content: unknown) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      if (isDirty && !isSaving) {
        savePage(content);
      }
    }, AUTOSAVE_DELAY);
  }, [isDirty, isSaving, savePage]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { triggerAutosave, savePage };
}

export function useManualSave() {
  const { currentPage, savePage, publishPage } = useAdminStore();

  const savePageHandler = useCallback(async (content: unknown, publish: boolean = false) => {
    if (!currentPage) {
      toast.error('No page selected');
      return null;
    }

    try {
      if (publish) {
        await publishPage();
        toast.success('Page published successfully!');
      } else {
        await savePage();
        toast.success('Draft saved');
      }
      return true;
    } catch (error) {
      console.error('Save failed:', error);
      toast.error('Failed to save page');
      return null;
    }
  }, [currentPage, savePage, publishPage]);

  return { savePage: savePageHandler };
}
