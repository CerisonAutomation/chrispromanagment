import {create} from 'zustand';
import {devtools, persist} from 'zustand/middleware';

// =============================================================================
// TYPES
// =============================================================================

export interface PageData {
  id?: string;
  slug: string;
  title: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  content: any;
  metaTitle?: string;
  metaDescription?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ThemeData {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    foreground: string;
    muted: string;
    accent: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
}

export interface EditorState {
  // Page data
  currentPage: PageData | null;
  pages: PageData[];
  
  // Editor state
  isDirty: boolean;
  isSaving: boolean;
  isPublishing: boolean;
  lastSavedAt: Date | null;
  
  // UI state
  activePanel: 'components' | 'outline' | 'pages' | 'ai' | 'theme';
  deviceMode: 'desktop' | 'tablet' | 'mobile';
  viewMode: 'edit' | 'preview';
  
  // Theme
  currentTheme: ThemeData | null;
  themes: ThemeData[];
  
  // History
  undoStack: any[];
  redoStack: any[];
  
  // AI
  aiMessages: Array<{ role: 'user' | 'assistant'; content: string }>;
  isAiGenerating: boolean;
}

export interface EditorActions {
  // Page actions
  setCurrentPage: (page: PageData) => void;
  updatePage: (updates: Partial<PageData>) => void;
  loadPages: () => Promise<void>;
  createPage: (page: Partial<PageData>) => Promise<PageData>;
  deletePage: (slug: string) => Promise<void>;
  
  // Editor actions
  setDirty: (dirty: boolean) => void;
  setSaving: (saving: boolean) => void;
  setPublishing: (publishing: boolean) => void;
  markSaved: () => void;
  
  // UI actions
  setActivePanel: (panel: EditorState['activePanel']) => void;
  setDeviceMode: (mode: EditorState['deviceMode']) => void;
  setViewMode: (mode: EditorState['viewMode']) => void;
  
  // Theme actions
  setTheme: (theme: ThemeData) => void;
  loadThemes: () => Promise<void>;
  
  // History actions
  pushToUndo: (data: any) => void;
  undo: () => any | null;
  redo: () => any | null;
  clearHistory: () => void;
  
  // AI actions
  addAiMessage: (message: { role: 'user' | 'assistant'; content: string }) => void;
  clearAiMessages: () => void;
  setAiGenerating: (generating: boolean) => void;
}

// =============================================================================
// STORE
// =============================================================================

export const useEditorStore = create<EditorState & EditorActions>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        currentPage: null,
        pages: [],
        isDirty: false,
        isSaving: false,
        isPublishing: false,
        lastSavedAt: null,
        activePanel: 'components',
        deviceMode: 'desktop',
        viewMode: 'edit',
        currentTheme: null,
        themes: [],
        undoStack: [],
        redoStack: [],
        aiMessages: [],
        isAiGenerating: false,

        // Page actions
        setCurrentPage: (page) => set({ currentPage: page, isDirty: false }),
        
        updatePage: (updates) => {
          const { currentPage } = get();
          if (!currentPage) return;
          set({
            currentPage: { ...currentPage, ...updates },
            isDirty: true,
          });
        },

        loadPages: async () => {
          try {
            const response = await fetch('/api/pages');
            if (!response.ok) throw new Error('Failed to load pages');
            const pages = await response.json();
            set({ pages });
          } catch (error) {
            console.error('Failed to load pages:', error);
          }
        },

        createPage: async (page) => {
          const response = await fetch('/api/pages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(page),
          });
          if (!response.ok) throw new Error('Failed to create page');
          const newPage = await response.json();
          set((state) => ({ pages: [...state.pages, newPage] }));
          return newPage;
        },

        deletePage: async (slug) => {
          const response = await fetch(`/api/pages/${slug}`, {
            method: 'DELETE',
          });
          if (!response.ok) throw new Error('Failed to delete page');
          set((state) => ({
            pages: state.pages.filter((p) => p.slug !== slug),
          }));
        },

        // Editor actions
        setDirty: (dirty) => set({ isDirty: dirty }),
        setSaving: (saving) => set({ isSaving: saving }),
        setPublishing: (publishing) => set({ isPublishing: publishing }),
        markSaved: () => set({ isDirty: false, lastSavedAt: new Date() }),

        // UI actions
        setActivePanel: (panel) => set({ activePanel: panel }),
        setDeviceMode: (mode) => set({ deviceMode: mode }),
        setViewMode: (mode) => set({ viewMode: mode }),

        // Theme actions
        setTheme: (theme) => set({ currentTheme: theme }),
        loadThemes: async () => {
          // Themes are loaded from the database or API
          const defaultTheme: ThemeData = {
            id: 'default',
            name: 'Default',
            colors: {
              primary: 'hsl(221 83% 53%)',
              secondary: 'hsl(215 20% 65%)',
              background: 'hsl(0 0% 100%)',
              foreground: 'hsl(222 47% 11%)',
              muted: 'hsl(210 40% 96%)',
              accent: 'hsl(210 40% 96%)',
            },
            fonts: {
              heading: 'Inter',
              body: 'Inter',
            },
          };
          set({ themes: [defaultTheme], currentTheme: defaultTheme });
        },

        // History actions
        pushToUndo: (data) => {
          const { undoStack } = get();
          // Keep only last 50 items
          const newStack = [...undoStack.slice(-49), data];
          set({ undoStack: newStack, redoStack: [] });
        },

        undo: () => {
          const { undoStack, redoStack } = get();
          if (undoStack.length === 0) return null;
          const current = undoStack[undoStack.length - 1];
          set({
            undoStack: undoStack.slice(0, -1),
            redoStack: [...redoStack, current],
          });
          return current;
        },

        redo: () => {
          const { redoStack, undoStack } = get();
          if (redoStack.length === 0) return null;
          const current = redoStack[redoStack.length - 1];
          set({
            redoStack: redoStack.slice(0, -1),
            undoStack: [...undoStack, current],
          });
          return current;
        },

        clearHistory: () => set({ undoStack: [], redoStack: [] }),

        // AI actions
        addAiMessage: (message) =>
          set((state) => ({ aiMessages: [...state.aiMessages, message] })),
        clearAiMessages: () => set({ aiMessages: [] }),
        setAiGenerating: (generating) => set({ isAiGenerating: generating }),
      }),
      {
        name: 'editor-storage',
        partialize: (state) => ({
          currentTheme: state.currentTheme,
          themes: state.themes,
          deviceMode: state.deviceMode,
        }),
      }
    ),
    { name: 'EditorStore' }
  )
);

// =============================================================================
// SELECTORS
// =============================================================================

export const selectCurrentPage = (state: EditorState) => state.currentPage;
export const selectIsDirty = (state: EditorState) => state.isDirty;
export const selectIsSaving = (state: EditorState) => state.isSaving;
export const selectDeviceMode = (state: EditorState) => state.deviceMode;
export const selectPages = (state: EditorState) => state.pages;

// =============================================================================
// HOOKS
// =============================================================================

export function useCurrentPage() {
  return useEditorStore(selectCurrentPage);
}

export function useEditorDirty() {
  return useEditorStore(selectIsDirty);
}

export function useDeviceMode() {
  return useEditorStore(selectDeviceMode);
}

export function usePages() {
  return useEditorStore(selectPages);
}
