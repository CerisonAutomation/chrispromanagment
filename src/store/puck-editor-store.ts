'use client';

import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';
import {v4 as uuidv4} from 'uuid';
import type {Data} from '@puckeditor/core';

// =============================================================================
// Types
// =============================================================================

export interface PageVersion {
  id: string;
  pageId: string;
  data: Data;
  title: string;
  createdAt: number;
  description?: string;
}

export interface LocalDraft {
  pageId: string;
  slug: string;
  data: Data;
  title: string;
  lastModified: number;
  syncStatus: 'synced' | 'pending' | 'error';
}

export interface PuckEditorState {
  // Current page being edited
  currentSlug: string | null;
  currentData: Data | null;
  currentTitle: string;
  
  // UI state
  sidebarVisible: boolean;
  rightPanelVisible: boolean;
  previewMode: boolean;
  
  // Undo/Redo stacks
  undoStack: Data[];
  redoStack: Data[];
  
  // Version history
  versions: PageVersion[];
  
  // Autosave
  autosaveEnabled: boolean;
  lastSavedAt: number | null;
  isDirty: boolean;
  isSaving: boolean;
  
  // Local drafts
  drafts: Record<string, LocalDraft>;
  
  // Initialization
  initialized: boolean;
}

export interface PuckEditorActions {
  // Page operations
  loadPage: (slug: string, title?: string) => Promise<void>;
  savePage: (data: Data) => Promise<void>;
  publishPage: (data: Data) => Promise<void>;
  setTitle: (title: string) => void;
  
  // Data management
  updateData: (data: Data) => void;
  resetEditor: () => void;
  
  // Undo/Redo (Back/Forward)
  undo: () => Data | null;
  redo: () => Data | null;
  canUndo: () => boolean;
  canRedo: () => boolean;
  pushUndoState: (data: Data) => void;
  
  // Version history
  createVersion: (description?: string) => void;
  restoreVersion: (versionId: string) => Data | null;
  deleteVersion: (versionId: string) => void;
  getVersionsForPage: (pageId: string) => PageVersion[];
  
  // Local drafts
  saveDraft: () => void;
  loadDraft: (slug: string) => LocalDraft | null;
  deleteDraft: (slug: string) => void;
  hasDraft: (slug: string) => boolean;
  
  // Autosave
  startAutosave: () => void;
  stopAutosave: () => void;
  toggleAutosave: () => void;
  
  // UI
  toggleSidebar: () => void;
  toggleRightPanel: () => void;
  togglePreview: () => void;
  
  // Sync
  syncToDatabase: () => Promise<boolean>;
  forceSync: () => Promise<void>;
}

// =============================================================================
// Constants
// =============================================================================

const MAX_UNDO = 50;
const MAX_VERSIONS = 20;
const AUTOSAVE_INTERVAL = 3000; // 3 seconds
const LOCAL_STORAGE_KEY = 'puck-editor-storage';

// =============================================================================
// Helper Functions
// =============================================================================

function createEmptyData(): Data {
  return {
    content: [],
    root: { props: {} },
  };
}

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// =============================================================================
// Store
// =============================================================================

let autosaveTimer: ReturnType<typeof setInterval> | null = null;
let savingLock = false;

export const usePuckEditorStore = create<PuckEditorState & PuckEditorActions>()(
  persist(
    (set, get) => ({
      // =========================================================================
      // Initial State
      // =========================================================================
      
      currentSlug: null,
      currentData: null,
      currentTitle: 'Untitled Page',
      
      sidebarVisible: true,
      rightPanelVisible: false,
      previewMode: false,
      
      undoStack: [],
      redoStack: [],
      
      versions: [],
      
      autosaveEnabled: true,
      lastSavedAt: null,
      isDirty: false,
      isSaving: false,
      
      drafts: {},
      
      initialized: false,
      
      // =========================================================================
      // Page Operations
      // =========================================================================
      
      async loadPage(slug: string, title?: string) {
        set({ isSaving: true });
        
        try {
          // 1. Try to load from local draft first
          const draft = get().drafts[slug];
          
          // 2. Fetch from database
          const res = await fetch(`/api/pages/${slug}`);
          const dbData = res.ok ? await res.json() : null;
          
          // 3. Decide which data to use (newest wins)
          let finalData: Data;
          let finalTitle: string;
          
          if (draft && dbData) {
            // Both exist - use whichever is newer
            if (draft.lastModified > new Date(dbData.updatedAt).getTime()) {
              finalData = draft.data;
              finalTitle = draft.title;
            } else {
              finalData = dbData.data || createEmptyData();
              finalTitle = dbData.title || title || slug;
            }
          } else if (draft) {
            finalData = draft.data;
            finalTitle = draft.title;
          } else if (dbData) {
            finalData = dbData.data || createEmptyData();
            finalTitle = dbData.title || title || slug;
          } else {
            finalData = createEmptyData();
            finalTitle = title || slug;
          }
          
          set({
            currentSlug: slug,
            currentData: finalData,
            currentTitle: finalTitle,
            undoStack: [deepClone(finalData)],
            redoStack: [],
            isDirty: false,
            initialized: true,
            lastSavedAt: Date.now(),
          });
          
          // Start autosave
          get().startAutosave();
          
        } catch (error) {
          console.error('Failed to load page:', error);
          // Fallback to empty page
          set({
            currentSlug: slug,
            currentData: createEmptyData(),
            currentTitle: title || slug,
            undoStack: [createEmptyData()],
            redoStack: [],
            initialized: true,
          });
        } finally {
          set({ isSaving: false });
        }
      },
      
      async savePage(data: Data) {
        const { currentSlug, currentTitle } = get();
        if (!currentSlug) return;
        
        if (savingLock) return;
        savingLock = true;
        set({ isSaving: true });
        
        try {
          const res = await fetch(`/api/pages/${currentSlug}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: currentTitle,
              data: data,
            }),
          });
          
          if (res.ok) {
            set({
              isDirty: false,
              lastSavedAt: Date.now(),
            });
            // Update draft status
            get().saveDraft();
          }
        } catch (error) {
          console.error('Failed to save page:', error);
        } finally {
          savingLock = false;
          set({ isSaving: false });
        }
      },
      
      async publishPage(data: Data) {
        // First save
        await get().savePage(data);
        
        // Then publish (if you have a publish endpoint)
        const { currentSlug } = get();
        if (!currentSlug) return;
        
        try {
          const res = await fetch(`/api/pages/${currentSlug}/publish`, {
            method: 'POST',
          });
          
          if (res.ok) {
            set({ isDirty: false, lastSavedAt: Date.now() });
          }
        } catch (error) {
          console.error('Failed to publish:', error);
        }
      },
      
      setTitle(title: string) {
        set({ currentTitle: title, isDirty: true });
        get().saveDraft();
      },
      
      // =========================================================================
      // Data Management
      // =========================================================================
      
      updateData(data: Data) {
        const { currentData } = get();
        if (!currentData) return;
        
        // Push current state to undo stack before updating
        get().pushUndoState(currentData);
        
        set({
          currentData: data,
          isDirty: true,
        });
        
        // Auto-save draft to local storage
        get().saveDraft();
      },
      
      resetEditor() {
        if (autosaveTimer) {
          clearInterval(autosaveTimer);
          autosaveTimer = null;
        }
        
        set({
          currentSlug: null,
          currentData: null,
          currentTitle: 'Untitled Page',
          undoStack: [],
          redoStack: [],
          isDirty: false,
          initialized: false,
        });
      },
      
      // =========================================================================
      // Undo/Redo (Back/Forward)
      // =========================================================================
      
      pushUndoState(data: Data) {
        const { undoStack } = get();
        const newStack = [...undoStack, deepClone(data)];
        
        // Limit stack size
        if (newStack.length > MAX_UNDO) {
          newStack.shift();
        }
        
        set({
          undoStack: newStack,
          redoStack: [], // Clear redo on new action
        });
      },
      
      undo() {
        const { undoStack, currentData, redoStack } = get();
        
        if (undoStack.length <= 1) return null; // Keep at least initial state
        
        // Get previous state
        const newUndoStack = undoStack.slice(0, -1);
        const previousState = newUndoStack[newUndoStack.length - 1];
        
        // Add current to redo
        const newRedoStack = [...redoStack, deepClone(currentData!)].slice(0, MAX_UNDO);
        
        set({
          undoStack: newUndoStack,
          redoStack: newRedoStack,
          currentData: deepClone(previousState),
          isDirty: true,
        });
        
        get().saveDraft();
        
        return deepClone(previousState);
      },
      
      redo() {
        const { redoStack, currentData, undoStack } = get();
        
        if (redoStack.length === 0) return null;
        
        // Get next state
        const nextState = redoStack[redoStack.length - 1];
        const newRedoStack = redoStack.slice(0, -1);
        
        // Add current to undo
        const newUndoStack = [...undoStack, deepClone(currentData!)].slice(-MAX_UNDO);
        
        set({
          undoStack: newUndoStack,
          redoStack: newRedoStack,
          currentData: deepClone(nextState),
          isDirty: true,
        });
        
        get().saveDraft();
        
        return deepClone(nextState);
      },
      
      canUndo() {
        const { undoStack } = get();
        return undoStack.length > 1;
      },
      
      canRedo() {
        const { redoStack } = get();
        return redoStack.length > 0;
      },
      
      // =========================================================================
      // Version History
      // =========================================================================
      
      createVersion(description?: string) {
        const { currentSlug, currentData, currentTitle, versions } = get();
        if (!currentSlug || !currentData) return;
        
        const newVersion: PageVersion = {
          id: uuidv4(),
          pageId: currentSlug,
          data: deepClone(currentData),
          title: currentTitle,
          createdAt: Date.now(),
          description: description || `Version ${versions.filter(v => v.pageId === currentSlug).length + 1}`,
        };
        
        set({
          versions: [...versions, newVersion].slice(-MAX_VERSIONS),
        });
      },
      
      restoreVersion(versionId: string) {
        const { versions, currentData } = get();
        const version = versions.find(v => v.id === versionId);
        
        if (!version) return null;
        
        // Push current to undo before restoring
        if (currentData) {
          get().pushUndoState(currentData);
        }
        
        set({
          currentData: deepClone(version.data),
          currentTitle: version.title,
          isDirty: true,
        });
        
        get().saveDraft();
        
        return deepClone(version.data);
      },
      
      deleteVersion(versionId: string) {
        const { versions } = get();
        set({
          versions: versions.filter(v => v.id !== versionId),
        });
      },
      
      getVersionsForPage(pageId: string) {
        const { versions } = get();
        return versions
          .filter(v => v.pageId === pageId)
          .sort((a, b) => b.createdAt - a.createdAt);
      },
      
      // =========================================================================
      // Local Drafts
      // =========================================================================
      
      saveDraft() {
        const { currentSlug, currentData, currentTitle, drafts } = get();
        if (!currentSlug || !currentData) return;
        
        const draft: LocalDraft = {
          pageId: currentSlug,
          slug: currentSlug,
          data: deepClone(currentData),
          title: currentTitle,
          lastModified: Date.now(),
          syncStatus: 'pending',
        };
        
        set({
          drafts: { ...drafts, [currentSlug]: draft },
        });
      },
      
      loadDraft(slug: string) {
        return get().drafts[slug] || null;
      },
      
      deleteDraft(slug: string) {
        const { drafts } = get();
        const { [slug]: _, ...rest } = drafts;
        set({ drafts: rest });
      },
      
      hasDraft(slug: string) {
        return !!get().drafts[slug];
      },
      
      // =========================================================================
      // Autosave
      // =========================================================================
      
      startAutosave() {
        if (autosaveTimer) return;
        set({ autosaveEnabled: true });
        
        autosaveTimer = setInterval(() => {
          const { isDirty, autosaveEnabled, initialized, currentSlug, currentData } = get();
          
          if (!initialized || !autosaveEnabled || !isDirty || !currentSlug || !currentData) return;
          
          // Save to database
          get().savePage(currentData);
          
          // Also create a version periodically (every 5 autosaves ≈ 15 seconds)
          const random = Math.random();
          if (random < 0.2) { // 20% chance
            get().createVersion('Autosave checkpoint');
          }
        }, AUTOSAVE_INTERVAL);
      },
      
      stopAutosave() {
        if (autosaveTimer) {
          clearInterval(autosaveTimer);
          autosaveTimer = null;
        }
        set({ autosaveEnabled: false });
      },
      
      toggleAutosave() {
        const { autosaveEnabled } = get();
        if (autosaveEnabled) {
          get().stopAutosave();
        } else {
          get().startAutosave();
        }
      },
      
      // =========================================================================
      // UI
      // =========================================================================
      
      toggleSidebar() {
        set(s => ({ sidebarVisible: !s.sidebarVisible }));
      },
      
      toggleRightPanel() {
        set(s => ({ rightPanelVisible: !s.rightPanelVisible }));
      },
      
      togglePreview() {
        set(s => ({ previewMode: !s.previewMode }));
      },
      
      // =========================================================================
      // Sync
      // =========================================================================
      
      async syncToDatabase(): Promise<boolean> {
        const { currentSlug, currentData } = get();
        if (!currentSlug || !currentData) return false;
        
        try {
          await get().savePage(currentData);
          
          // Update draft status
          const { drafts } = get();
          const draft = drafts[currentSlug];
          if (draft) {
            set({
              drafts: {
                ...drafts,
                [currentSlug]: { ...draft, syncStatus: 'synced' },
              },
            });
          }
          
          return true;
        } catch {
          return false;
        }
      },
      
      async forceSync() {
        const { currentData } = get();
        if (!currentData) return;
        
        set({ isSaving: true });
        
        try {
          await get().savePage(currentData);
          await get().createVersion('Manual save');
        } finally {
          set({ isSaving: false });
        }
      },
    }),
    {
      name: LOCAL_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist these fields to localStorage
        drafts: state.drafts,
        versions: state.versions,
        autosaveEnabled: state.autosaveEnabled,
      }),
    }
  )
);

export default usePuckEditorStore;
