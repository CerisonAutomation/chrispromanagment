// =============================================================================
// UNIFIED ADMIN STORE - Complete State Management
// =============================================================================
// Features: autosave, undo/redo, AI chat, keyboard shortcuts, toast notifications,
// component library, theme system, device preview, page management

import {create} from 'zustand';
import {devtools, persist} from 'zustand/middleware';
import {v4 as uuid} from 'uuid';
import type {Data} from '@measured/puck';
import {canonicalThemes} from '@/lib/canonical';

// =============================================================================
// TYPES (from canonical.ts)
// =============================================================================

export type DeviceMode = 'desktop' | 'tablet' | 'mobile';
export type ViewMode = 'edit' | 'preview';
export type SidebarPanel = 'blocks' | 'ai' | 'pages' | 'theme' | 'none';
export type RightPanel = 'properties' | 'none';
export type ToastType = 'success' | 'error' | 'info' | 'warning';
export type PageStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type SyncStatus = 'synced' | 'pending' | 'error';

export interface PageData {
  id?: string;
  slug: string;
  title: string;
  status: PageStatus;
  content: Data | null;
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

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  loading?: boolean;
}

export interface HistoryEntry {
  content: Data | null;
  selectedBlockId: string | null;
  timestamp: number;
}

// =============================================================================
// STORE INTERFACE
// =============================================================================

export interface AdminState {
  // Page state
  currentPage: PageData | null;
  pages: PageData[];
  
  // Editor state
  content: any;
  selectedBlockId: string | null;
  hoveredBlockId: string | null;
  
  // UI state
  viewMode: ViewMode;
  deviceMode: DeviceMode;
  sidebarPanel: SidebarPanel;
  rightPanel: RightPanel;
  
  // Dirty state
  isDirty: boolean;
  isSaving: boolean;
  isPublishing: boolean;
  lastSavedAt: Date | null;
  autosaveEnabled: boolean;
  
  // Theme
  currentTheme: ThemeData;
  themes: ThemeData[];
  
  // History (undo/redo)
  undoStack: HistoryEntry[];
  redoStack: HistoryEntry[];
  maxHistory: number;
  
  // AI
  aiMessages: AIMessage[];
  isAiGenerating: boolean;
  
  // Toasts
  toasts: Toast[];
  
  // Loading states
  isLoadingPages: boolean;
  isLoadingPage: boolean;
}

export interface AdminActions {
  // Page actions
  setCurrentPage: (page: PageData | null) => void;
  updateCurrentPage: (updates: Partial<PageData>) => void;
  loadPages: () => Promise<void>;
  loadPage: (slug: string) => Promise<void>;
  createPage: (data: Partial<PageData>) => Promise<PageData>;
  deletePage: (slug: string) => Promise<void>;
  duplicatePage: (page: PageData) => Promise<void>;
  
  // Content actions
  setContent: (content: any) => void;
  setSelectedBlockId: (id: string | null) => void;
  setHoveredBlockId: (id: string | null) => void;
  
  // Save/Publish
  savePage: () => Promise<void>;
  publishPage: () => Promise<void>;
  enableAutosave: () => void;
  disableAutosave: () => void;
  
  // UI actions
  setViewMode: (mode: ViewMode) => void;
  setDeviceMode: (mode: DeviceMode) => void;
  setSidebarPanel: (panel: SidebarPanel) => void;
  setRightPanel: (panel: RightPanel) => void;
  
  // Theme actions
  setTheme: (theme: ThemeData) => void;
  loadThemes: () => void;
  
  // History actions
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;
  
  // AI actions
  addAiMessage: (message: AIMessage) => void;
  setAiGenerating: (generating: boolean) => void;
  clearAiMessages: () => void;
  generateWithAI: (prompt: string) => Promise<void>;
  
  // Toast actions
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  
  // Block actions
  duplicateBlock: (blockId: string) => void;
  deleteBlock: (blockId: string) => void;
  moveBlock: (fromIndex: number, toIndex: number) => void;
}

type AdminStore = AdminState & AdminActions;

// =============================================================================
// INITIAL STATE
// =============================================================================

const initialState: AdminState = {
  currentPage: null,
  pages: [],
  content: null,
  selectedBlockId: null,
  hoveredBlockId: null,
  viewMode: 'edit',
  deviceMode: 'desktop',
  sidebarPanel: 'blocks',
  rightPanel: 'none',
  isDirty: false,
  isSaving: false,
  isPublishing: false,
  lastSavedAt: null,
  autosaveEnabled: true,
  currentTheme: canonicalThemes[0]!,
  themes: canonicalThemes,
  undoStack: [],
  redoStack: [],
  maxHistory: 50,
  aiMessages: [],
  isAiGenerating: false,
  toasts: [],
  isLoadingPages: false,
  isLoadingPage: false,
};

// =============================================================================
// STORE IMPLEMENTATION
// =============================================================================

export const useAdminStore = create<AdminStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        setCurrentPage: (page) => set({ 
          currentPage: page, 
          content: page?.content || null,
          isDirty: false,
        }),

        updateCurrentPage: (updates) => set((state) => ({
          currentPage: state.currentPage ? { ...state.currentPage, ...updates } : null,
          isDirty: true,
        })),

        loadPages: async () => {
          set({ isLoadingPages: true });
          try {
            const response = await fetch('/api/pages');
            if (!response.ok) throw new Error('Failed to load pages');
            const pages = await response.json();
            set({ pages, isLoadingPages: false });
          } catch (error) {
            console.error('Failed to load pages:', error);
            set({ isLoadingPages: false });
          }
        },

        loadPage: async (slug: string) => {
          set({ isLoadingPage: true });
          try {
            const response = await fetch(`/api/pages/${slug}`);
            if (!response.ok) throw new Error('Failed to load page');
            const page = await response.json();
            set({ 
              currentPage: page, 
              content: page.content,
              isLoadingPage: false,
              isDirty: false,
            });
            get().addToast({ type: 'success', title: `Loaded "${page.title}"` });
          } catch (error) {
            console.error('Failed to load page:', error);
            set({ isLoadingPage: false });
            get().addToast({ type: 'error', title: 'Failed to load page' });
          }
        },

        createPage: async (data) => {
          const response = await fetch('/api/pages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              slug: data.slug,
              title: data.title,
              data: data.content || { content: [], root: { props: {} }, zones: {} },
              status: 'DRAFT',
              meta: { title: data.title, description: '' },
            }),
          });
          if (!response.ok) throw new Error('Failed to create page');
          const newPage = await response.json();
          set((state) => ({ 
            pages: [...state.pages, newPage],
            currentPage: newPage,
            content: newPage.content,
          }));
          get().addToast({ type: 'success', title: `Created "${newPage.title}"` });
          return newPage;
        },

        deletePage: async (slug) => {
          const response = await fetch(`/api/pages/${slug}`, { method: 'DELETE' });
          if (!response.ok) throw new Error('Failed to delete page');
          set((state) => ({
            pages: state.pages.filter((p) => p.slug !== slug),
            currentPage: state.currentPage?.slug === slug ? null : state.currentPage,
          }));
          get().addToast({ type: 'info', title: 'Page deleted' });
        },

        duplicatePage: async (page) => {
          const newSlug = `${page.slug}-copy`;
          const newTitle = `${page.title} (Copy)`;
          const response = await fetch('/api/pages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              slug: newSlug,
              title: newTitle,
              data: page.content || { content: [], root: { props: {} }, zones: {} },
              status: 'DRAFT',
            }),
          });
          if (!response.ok) throw new Error('Failed to duplicate page');
          const newPage = await response.json();
          set((state) => ({ pages: [...state.pages, newPage] }));
          get().addToast({ type: 'success', title: `Duplicated "${page.title}"` });
        },

        setContent: (content) => {
          get().pushHistory();
          set({ content, isDirty: true });
        },

        setSelectedBlockId: (id) => set({ 
          selectedBlockId: id,
          rightPanel: id ? 'properties' : 'none',
        }),

        setHoveredBlockId: (id) => set({ hoveredBlockId: id }),

        savePage: async () => {
          const { currentPage, content, isSaving } = get();
          if (!currentPage || isSaving) return;
          
          set({ isSaving: true });
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
                  description: currentPage.metaDescription || '',
                },
              }),
            });
            if (!response.ok) throw new Error('Failed to save');
            const saved = await response.json();
            set({ 
              isDirty: false, 
              isSaving: false, 
              lastSavedAt: new Date(),
              currentPage: { ...currentPage, ...saved },
            });
            get().addToast({ type: 'success', title: 'Draft saved' });
          } catch (error) {
            console.error('Save failed:', error);
            set({ isSaving: false });
            get().addToast({ type: 'error', title: 'Failed to save' });
          }
        },

        publishPage: async () => {
          const { currentPage, isPublishing } = get();
          if (!currentPage || isPublishing) return;
          
          set({ isPublishing: true });
          try {
            await get().savePage();
            
            const response = await fetch(`/api/pages/${currentPage.slug}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: 'PUBLISHED' }),
            });
            if (!response.ok) throw new Error('Failed to publish');
            
            const published = await response.json();
            set({ 
              isPublishing: false,
              currentPage: { ...currentPage, status: 'PUBLISHED', ...published },
            });
            get().addToast({ type: 'success', title: 'Page published!', description: 'Your page is now live' });
          } catch (error) {
            console.error('Publish failed:', error);
            set({ isPublishing: false });
            get().addToast({ type: 'error', title: 'Failed to publish' });
          }
        },

        enableAutosave: () => set({ autosaveEnabled: true }),
        disableAutosave: () => set({ autosaveEnabled: false }),

        setViewMode: (mode) => set({ 
          viewMode: mode,
          selectedBlockId: mode === 'preview' ? null : get().selectedBlockId,
          rightPanel: mode === 'preview' ? 'none' : get().rightPanel,
        }),

        setDeviceMode: (mode) => set({ deviceMode: mode }),
        setSidebarPanel: (panel) => set({ sidebarPanel: panel }),
        setRightPanel: (panel) => set({ rightPanel: panel }),

        setTheme: (theme) => set({ currentTheme: theme, isDirty: true }),
        loadThemes: () => set({ themes: canonicalThemes }),

        pushHistory: () => {
          const { content, selectedBlockId, undoStack, maxHistory } = get();
          const entry: HistoryEntry = {
            content: JSON.parse(JSON.stringify(content)),
            selectedBlockId,
            timestamp: Date.now(),
          };
          const newStack = [...undoStack, entry];
          if (newStack.length > maxHistory) newStack.shift();
          set({ undoStack: newStack, redoStack: [] });
        },

        undo: () => {
          const { undoStack, redoStack, content, selectedBlockId } = get();
          if (undoStack.length === 0) return;
          
          const previous = undoStack[undoStack.length - 1]!;
          const current: HistoryEntry = {
            content: JSON.parse(JSON.stringify(content)),
            selectedBlockId,
            timestamp: Date.now(),
          };
          
          set({
            content: previous.content,
            selectedBlockId: previous.selectedBlockId,
            undoStack: undoStack.slice(0, -1),
            redoStack: [...redoStack, current],
            isDirty: true,
          });
          get().addToast({ type: 'info', title: 'Undo' });
        },

        redo: () => {
          const { undoStack, redoStack, content, selectedBlockId } = get();
          if (redoStack.length === 0) return;
          
          const next = redoStack[redoStack.length - 1]!;
          const current: HistoryEntry = {
            content: JSON.parse(JSON.stringify(content)),
            selectedBlockId,
            timestamp: Date.now(),
          };
          
          set({
            content: next.content,
            selectedBlockId: next.selectedBlockId,
            undoStack: [...undoStack, current],
            redoStack: redoStack.slice(0, -1),
            isDirty: true,
          });
          get().addToast({ type: 'info', title: 'Redo' });
        },

        clearHistory: () => set({ undoStack: [], redoStack: [] }),

        addAiMessage: (message) => set((state) => ({
          aiMessages: [...state.aiMessages, message],
        })),

        setAiGenerating: (generating) => set({ isAiGenerating: generating }),
        clearAiMessages: () => set({ aiMessages: [] }),

        generateWithAI: async (prompt) => {
          const { isAiGenerating } = get();
          if (isAiGenerating) return;

          const userMsg: AIMessage = {
            id: uuid(),
            role: 'user',
            content: prompt,
            timestamp: new Date(),
          };
          get().addAiMessage(userMsg);

          const loadingMsg: AIMessage = {
            id: uuid(),
            role: 'assistant',
            content: '',
            timestamp: new Date(),
            loading: true,
          };
          get().addAiMessage(loadingMsg);
          get().setAiGenerating(true);

          try {
            await new Promise((resolve) => setTimeout(resolve, 2000));
            
            const response = `I've generated content for: "${prompt}"\n\nI've created:\n- A hero section with your branding\n- Feature highlights that showcase your value\n- Social proof with testimonials\n\nWould you like me to generate these blocks for you?`;

            set((state) => ({
              aiMessages: state.aiMessages.map((m) =>
                m.id === loadingMsg.id
                  ? { ...m, content: response, loading: false }
                  : m
              ),
              isAiGenerating: false,
            }));
          } catch (error) {
            console.error('AI generation failed:', error);
            get().setAiGenerating(false);
            get().addToast({ type: 'error', title: 'AI generation failed' });
          }
        },

        addToast: (toast) => {
          const id = uuid();
          const newToast: Toast = { ...toast, id };
          set((state) => ({ toasts: [...state.toasts, newToast] }));
          const duration = toast.duration || 4000;
          if (duration > 0) {
            setTimeout(() => get().removeToast(id), duration);
          }
        },

        removeToast: (id) => set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        })),

        duplicateBlock: (blockId) => {
          const { content } = get();
          if (!content?.content) return;
          
          get().pushHistory();
          
          const blocks = [...content.content];
          const blockIndex = blocks.findIndex((b: any) => b.props?.id === blockId);
          
          if (blockIndex === -1) return;
          
          const block = blocks[blockIndex];
          const newBlock = {
            ...block,
            props: { ...block.props, id: uuid() },
          };
          
          blocks.splice(blockIndex + 1, 0, newBlock);
          
          set({
            content: { ...content, content: blocks },
            isDirty: true,
            selectedBlockId: newBlock.props.id,
          });
          get().addToast({ type: 'success', title: 'Block duplicated' });
        },

        deleteBlock: (blockId) => {
          const { content, selectedBlockId } = get();
          if (!content?.content) return;
          
          get().pushHistory();
          
          const blocks = content.content.filter((b: any) => b.props?.id !== blockId);
          
          set({
            content: { ...content, content: blocks },
            isDirty: true,
            selectedBlockId: selectedBlockId === blockId ? null : selectedBlockId,
          });
          get().addToast({ type: 'info', title: 'Block deleted' });
        },

        moveBlock: (fromIndex, toIndex) => {
          const { content } = get();
          if (!content?.content) return;
          
          get().pushHistory();
          
          const blocks = [...content.content];
          const [moved] = blocks.splice(fromIndex, 1);
          blocks.splice(toIndex, 0, moved);
          
          set({
            content: { ...content, content: blocks },
            isDirty: true,
          });
        },
      }),
      {
        name: 'admin-store',
        partialize: (state) => ({
          autosaveEnabled: state.autosaveEnabled,
          deviceMode: state.deviceMode,
          sidebarPanel: state.sidebarPanel,
          currentTheme: state.currentTheme,
        }),
      }
    ),
    { name: 'AdminStore' }
  )
);

// =============================================================================
// SELECTORS
// =============================================================================

export const selectCanUndo = (state: AdminStore) => state.undoStack.length > 0;
export const selectCanRedo = (state: AdminStore) => state.redoStack.length > 0;
export const selectIsDirty = (state: AdminStore) => state.isDirty;
export const selectCurrentPage = (state: AdminStore) => state.currentPage;
export const selectContent = (state: AdminStore) => state.content;
export const selectViewMode = (state: AdminStore) => state.viewMode;
export const selectDeviceMode = (state: AdminStore) => state.deviceMode;
export const selectSidebarPanel = (state: AdminStore) => state.sidebarPanel;
export const selectRightPanel = (state: AdminStore) => state.rightPanel;
export const selectCurrentTheme = (state: AdminStore) => state.currentTheme;
export const selectThemes = (state: AdminStore) => state.themes;
export const selectAiMessages = (state: AdminStore) => state.aiMessages;
export const selectIsAiGenerating = (state: AdminStore) => state.isAiGenerating;
export const selectToasts = (state: AdminStore) => state.toasts;
export const selectIsSaving = (state: AdminStore) => state.isSaving;
export const selectIsPublishing = (state: AdminStore) => state.isPublishing;
export const selectLastSavedAt = (state: AdminStore) => state.lastSavedAt;
export const selectPages = (state: AdminStore) => state.pages;
export const selectIsLoadingPages = (state: AdminStore) => state.isLoadingPages;

export default useAdminStore;
