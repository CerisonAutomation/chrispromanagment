/**
 * @fileoverview Zustand editor store — single source of truth for the Puck CMS editor.
 * Includes: page data, history (undo/redo), toasts, device mode, sidebar state.
 *
 * Usage (client components):
 *   import { useEditorStore } from '@/store/editor';
 *   const data = useEditorStore((s) => s.data);
 */
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  PuckData,
  DeviceMode,
  SidebarPanel,
  RightPanel,
  Toast,
  ToastType,
  HistoryEntry,
} from '@/types';
import { generateId } from '@/lib/utils';

const MAX_HISTORY = 50;

export interface EditorState {
  // ─ Page data
  data: PuckData | null;
  slug: string;
  title: string;
  isDirty: boolean;

  // ─ History (undo / redo)
  history: HistoryEntry[];
  historyIndex: number;

  // ─ Selection
  selectedBlockId: string | null;

  // ─ UI state
  deviceMode: DeviceMode;
  activeLeftPanel: SidebarPanel;
  activeRightPanel: RightPanel;
  isPreviewMode: boolean;
  isSaving: boolean;
  lastSavedAt: number | null;

  // ─ Toasts
  toasts: Toast[];

  // ─ Actions
  setData: (data: PuckData) => void;
  setSlug: (slug: string) => void;
  setTitle: (title: string) => void;
  setSelectedBlockId: (id: string | null) => void;
  setDeviceMode: (mode: DeviceMode) => void;
  setActiveLeftPanel: (panel: SidebarPanel) => void;
  setActiveRightPanel: (panel: RightPanel) => void;
  setPreviewMode: (v: boolean) => void;
  setIsSaving: (v: boolean) => void;
  markSaved: () => void;

  undo: () => void;
  redo: () => void;
  pushHistory: (entry: HistoryEntry) => void;
  clearHistory: () => void;

  addToast: (toast: Toast) => void;
  removeToast: (id: string) => void;

  reset: () => void;
}

const initialState = {
  data: null,
  slug: '',
  title: 'Untitled',
  isDirty: false,
  history: [] as HistoryEntry[],
  historyIndex: -1,
  selectedBlockId: null,
  deviceMode: 'desktop' as DeviceMode,
  activeLeftPanel: 'blocks' as SidebarPanel,
  activeRightPanel: 'properties' as RightPanel,
  isPreviewMode: false,
  isSaving: false,
  lastSavedAt: null,
  toasts: [] as Toast[],
};

export const useEditorStore = create<EditorState>()(
  immer(
    persist(
      (set) => ({
        ...initialState,

        setData: (data) =>
          set((s) => {
            s.data = data;
            s.isDirty = true;
          }),

        setSlug: (slug) => set((s) => { s.slug = slug; }),
        setTitle: (title) => set((s) => { s.title = title; }),
        setSelectedBlockId: (id) => set((s) => { s.selectedBlockId = id; }),
        setDeviceMode: (mode) => set((s) => { s.deviceMode = mode; }),
        setActiveLeftPanel: (panel) => set((s) => { s.activeLeftPanel = panel; }),
        setActiveRightPanel: (panel) => set((s) => { s.activeRightPanel = panel; }),
        setPreviewMode: (v) => set((s) => { s.isPreviewMode = v; }),
        setIsSaving: (v) => set((s) => { s.isSaving = v; }),
        markSaved: () =>
          set((s) => {
            s.isDirty = false;
            s.isSaving = false;
            s.lastSavedAt = Date.now();
          }),

        pushHistory: (entry) =>
          set((s) => {
            // Truncate forward history on new push
            s.history = s.history.slice(0, s.historyIndex + 1);
            s.history.push(entry);
            if (s.history.length > MAX_HISTORY) s.history.shift();
            s.historyIndex = s.history.length - 1;
          }),

        undo: () =>
          set((s) => {
            if (s.historyIndex > 0) {
              s.historyIndex -= 1;
              const entry = s.history[s.historyIndex];
              if (entry) {
                s.data = entry.content;
                s.selectedBlockId = entry.selectedBlockId;
                s.isDirty = true;
              }
            }
          }),

        redo: () =>
          set((s) => {
            if (s.historyIndex < s.history.length - 1) {
              s.historyIndex += 1;
              const entry = s.history[s.historyIndex];
              if (entry) {
                s.data = entry.content;
                s.selectedBlockId = entry.selectedBlockId;
                s.isDirty = true;
              }
            }
          }),

        clearHistory: () =>
          set((s) => {
            s.history = [];
            s.historyIndex = -1;
          }),

        addToast: (toast) =>
          set((s) => { s.toasts.push(toast); }),

        removeToast: (id) =>
          set((s) => {
            s.toasts = s.toasts.filter((t) => t.id !== id);
          }),

        reset: () => set(() => ({ ...initialState })),
      }),
      {
        name: 'puck-editor-store',
        storage: createJSONStorage(() => sessionStorage),
        partialize: (s) => ({
          slug: s.slug,
          title: s.title,
          deviceMode: s.deviceMode,
          activeLeftPanel: s.activeLeftPanel,
        }),
      }
    )
  )
);
