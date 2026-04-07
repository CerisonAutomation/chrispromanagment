// =============================================================================
// CANONICAL EDITOR STORE - Production-Ready Zustand Store
// =============================================================================
// Consolidated from application/complete-store.ts, application/editor-store.ts,
// application/editor-store-final.ts, application/editor-store-fixed.ts,
// store/puck-editor-store.ts, and store/puck-reducer.ts
//
// Features:
// - Type-safe with unified types from @/types
// - Undo/Redo with bounded stack
// - Autosave with configurable interval
// - Toast notifications
// - Theme support
// - Sync status tracking
// - Version history
// - Local drafts with persistence
// =============================================================================

import {create} from 'zustand';
import {devtools, subscribeWithSelector} from 'zustand/middleware';
import {
  Block,
  BlockData,
  BlockId,
  BlockType,
  ComponentData,
  Data,
  DomainError,
  err,
  Errors,
  LocalDraft,
  ok,
  Page,
  PageId,
  PageVersion,
  Result,
  Theme,
  ThemeId,
} from '@/types';

// =============================================================================
// CONSTANTS
// =============================================================================

const MAX_UNDO = 50;
const MAX_VERSIONS = 20;
const DEFAULT_AUTOSAVE_INTERVAL = 30000; // 30 seconds
const DEFAULT_ZOOM = 100;
const MIN_ZOOM = 25;
const MAX_ZOOM = 200;

// =============================================================================
// UI TYPES
// =============================================================================

export type ViewMode = 'edit' | 'preview' | 'code' | 'split';
export type DeviceMode = 'desktop' | 'tablet' | 'mobile';
export type SidebarPanel = 'blocks' | 'ai' | 'theme' | 'pages' | 'settings' | 'assets' | 'none';
export type RightPanel = 'properties' | 'styles' | 'animations' | 'events' | 'none';
export type ToastType = 'success' | 'error' | 'info' | 'warning';
export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'offline';

export interface Toast {
  readonly id: string;
  readonly type: ToastType;
  readonly title: string;
  readonly description?: string;
  readonly duration: number;
  readonly action?: {
    readonly label: string;
    readonly onClick: () => void;
  };
}

export interface UndoSnapshot {
  readonly blocks: readonly Block[];
  readonly selectedBlockId: BlockId | null;
  readonly timestamp: number;
}

// =============================================================================
// EDITOR STATE
// =============================================================================

export interface EditorState {
  // Core data
  readonly page: Page | null;
  readonly blocks: readonly Block[];
  readonly selectedBlockId: BlockId | null;
  readonly hoveredBlockId: BlockId | null;

  // Puck-compatible data
  readonly puckData: Data | null;
  readonly puckComponents: Record<string, ComponentData>;

  // UI state
  readonly viewMode: ViewMode;
  readonly deviceMode: DeviceMode;
  readonly sidebarPanel: SidebarPanel;
  readonly rightPanel: RightPanel;
  readonly canvasZoom: number;
  readonly showGrid: boolean;
  readonly showOutlines: boolean;

  // Drag & drop
  readonly draggedBlockId: BlockId | null;
  readonly dragOverIndex: number | null;
  readonly isDragging: boolean;

  // Undo/redo - bounded stack
  readonly undoStack: readonly UndoSnapshot[];
  readonly redoStack: readonly UndoSnapshot[];

  // Status
  readonly isDirty: boolean;
  readonly isSaving: boolean;
  readonly isLoading: boolean;
  readonly lastSavedAt: number | null;
  readonly lastError: DomainError | null;

  // Autosave
  readonly autosaveEnabled: boolean;
  readonly autosaveIntervalMs: number;

  // Toasts
  readonly toasts: readonly Toast[];

  // Theme
  readonly currentTheme: Theme;
  readonly availableThemes: readonly Theme[];

  // Sync
  readonly syncStatus: SyncStatus;
  readonly pendingSync: boolean;

  // Version history
  readonly versions: readonly PageVersion[];

  // Local drafts
  readonly drafts: readonly LocalDraft[];

  // Meta
  readonly initialized: boolean;
}

// =============================================================================
// EDITOR ACTIONS
// =============================================================================

export interface EditorActions {
  // Initialization
  initialize: () => Promise<void>;

  // Page actions
  loadPage: (pageId: PageId) => Promise<Result<void, DomainError>>;
  createPage: (slug: string, title: string) => Promise<Result<void, DomainError>>;
  savePage: () => Promise<Result<void, DomainError>>;
  publishPage: () => Promise<Result<void, DomainError>>;
  unpublishPage: () => Promise<Result<void, DomainError>>;
  updatePageTitle: (title: string) => void;
  updatePageSEO: (seo: Partial<Page['seo']>) => void;
  changeTheme: (themeId: ThemeId) => Result<void, DomainError>;

  // Block actions
  addBlock: (type: BlockType, position?: number, data?: BlockData) => Result<Block, DomainError>;
  removeBlock: (blockId: BlockId) => Result<void, DomainError>;
  updateBlock: (blockId: BlockId, data: Partial<BlockData>) => Result<void, DomainError>;
  moveBlock: (fromIndex: number, toIndex: number) => Result<void, DomainError>;
  duplicateBlock: (blockId: BlockId) => Result<Block, DomainError>;
  selectBlock: (blockId: BlockId | null) => void;
  setHoveredBlock: (blockId: BlockId | null) => void;

  // Drag actions
  startDrag: (blockId: BlockId) => void;
  setDragOver: (index: number | null) => void;
  endDrag: () => void;

  // View actions
  setViewMode: (mode: ViewMode) => void;
  setDeviceMode: (mode: DeviceMode) => void;
  setSidebarPanel: (panel: SidebarPanel) => void;
  setRightPanel: (panel: RightPanel) => void;
  setCanvasZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  toggleGrid: () => void;
  toggleOutlines: () => void;

  // Undo/redo - bounded
  undo: () => Result<void, DomainError>;
  redo: () => Result<void, DomainError>;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Autosave
  startAutosave: () => void;
  stopAutosave: () => void;
  toggleAutosave: () => void;

  // Toasts
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (toastId: string) => void;

  // Sync
  syncNow: () => Promise<Result<void, DomainError>>;
  markSyncResolved: (blockId: BlockId) => void;

  // Version history
  createVersion: (description?: string) => void;
  restoreVersion: (versionId: string) => Result<Data, DomainError>;
  deleteVersion: (versionId: string) => void;
  getVersionsForPage: (pageId: string) => readonly PageVersion[];

  // Local drafts
  saveDraft: () => void;
  loadDraft: (slug: string) => LocalDraft | null;
  deleteDraft: (slug: string) => void;
  hasDraft: (slug: string) => boolean;

  // Puck data operations
  setPuckData: (data: Data) => void;
  updatePuckComponent: (id: string, props: Record<string, unknown>) => void;

  // Reset
  resetEditor: () => void;
}

// =============================================================================
// STORE TYPE
// =============================================================================

export type EditorStore = EditorState & EditorActions;

// =============================================================================
// DEFAULT THEME
// =============================================================================

const defaultTheme: Theme = {
  id: 'default' as ThemeId,
  name: 'Default Theme',
  description: 'Clean, modern default theme',
  isDefault: true,
  tokens: {
    colors: {
      primary: '#3b82f6',
      secondary: '#64748b',
      accent: '#8b5cf6',
      background: '#ffffff',
      foreground: '#0f172a',
      muted: '#f1f5f9',
      border: '#e2e8f0',
      card: '#ffffff',
      error: '#ef4444',
      success: '#22c55e',
      warning: '#f59e0b',
    },
    fonts: {
      heading: 'Inter, system-ui, sans-serif',
      body: 'Inter, system-ui, sans-serif',
      mono: 'JetBrains Mono, monospace',
    },
    spacing: {
      section: '4rem',
      container: '1200px',
      gap: '1.5rem',
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '2rem',
      xl: '4rem',
    },
    borderRadius: {
      none: '0',
      sm: '0.25rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
      full: '9999px',
    },
    shadows: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
    },
    animations: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
  },
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;
}

function createUndoSnapshot(
  blocks: readonly Block[],
  selectedBlockId: BlockId | null
): UndoSnapshot {
  return {
    blocks: [...blocks],
    selectedBlockId,
    timestamp: Date.now(),
  };
}

function pushUndoState(state: EditorState): Partial<EditorState> {
  const snapshot = createUndoSnapshot(state.blocks, state.selectedBlockId);
  const newUndoStack = state.undoStack.length >= MAX_UNDO
    ? [...state.undoStack.slice(1), snapshot]
    : [...state.undoStack, snapshot];
  
  return {
    undoStack: newUndoStack,
    redoStack: [],
  };
}

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
// STORE IMPLEMENTATION
// =============================================================================

let autosaveTimer: ReturnType<typeof setInterval> | null = null;
let saveLock = false;

export const useEditorStore = create<EditorStore>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // =========================================================================
      // INITIAL STATE
      // =========================================================================
      
      // Core data
      page: null,
      blocks: [],
      selectedBlockId: null,
      hoveredBlockId: null,
      
      // Puck-compatible data
      puckData: null,
      puckComponents: {},
      
      // UI state
      viewMode: 'edit',
      deviceMode: 'desktop',
      sidebarPanel: 'blocks',
      rightPanel: 'none',
      canvasZoom: DEFAULT_ZOOM,
      showGrid: false,
      showOutlines: false,
      
      // Drag & drop
      draggedBlockId: null,
      dragOverIndex: null,
      isDragging: false,
      
      // Undo/redo
      undoStack: [],
      redoStack: [],
      
      // Status
      isDirty: false,
      isSaving: false,
      isLoading: false,
      lastSavedAt: null,
      lastError: null,
      
      // Autosave
      autosaveEnabled: true,
      autosaveIntervalMs: DEFAULT_AUTOSAVE_INTERVAL,
      
      // Toasts
      toasts: [],
      
      // Theme
      currentTheme: defaultTheme,
      availableThemes: [defaultTheme],
      
      // Sync
      syncStatus: 'idle',
      pendingSync: false,
      
      // Version history
      versions: [],
      
      // Local drafts
      drafts: [],
      
      // Meta
      initialized: false,

      // =========================================================================
      // INITIALIZATION
      // =========================================================================

      initialize: async () => {
        set({ initialized: true });
      },

      // =========================================================================
      // PAGE ACTIONS
      // =========================================================================

      loadPage: async (pageId: PageId) => {
        set({ isLoading: true, lastError: null });

        try {
          const response = await fetch(`/api/pages/${pageId}`);
          
          if (!response.ok) {
            const error = Errors.PageNotFound(pageId);
            set({ isLoading: false, lastError: error });
            return err(error);
          }

          const pageData = await response.json();
          
          set({
            page: pageData as Page,
            blocks: pageData.blocks || [],
            puckData: pageData.puckData || createEmptyData(),
            isLoading: false,
            isDirty: false,
            undoStack: [],
            redoStack: [],
            selectedBlockId: null,
          });

          return ok(undefined);
        } catch (error) {
          const domainError = new DomainError({
            code: 'LOAD_FAILED',
            message: error instanceof Error ? error.message : 'Failed to load page',
            statusCode: 500,
          });
          set({ isLoading: false, lastError: domainError });
          return err(domainError);
        }
      },

      createPage: async (slug: string, title: string) => {
        set({ isLoading: true, lastError: null });

        try {
          const response = await fetch('/api/pages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slug, title }),
          });

          if (!response.ok) {
            const error = new DomainError({
              code: 'CREATE_FAILED',
              message: 'Failed to create page',
              statusCode: 500,
            });
            set({ isLoading: false, lastError: error });
            return err(error);
          }

          const pageData = await response.json();
          
          set({
            page: pageData as Page,
            blocks: [],
            puckData: createEmptyData(),
            isLoading: false,
            isDirty: false,
            undoStack: [],
            redoStack: [],
          });

          return ok(undefined);
        } catch (error) {
          const domainError = new DomainError({
            code: 'CREATE_FAILED',
            message: error instanceof Error ? error.message : 'Failed to create page',
            statusCode: 500,
          });
          set({ isLoading: false, lastError: domainError });
          return err(domainError);
        }
      },

      savePage: async () => {
        if (saveLock) return ok(undefined);

        const state = get();
        if (!state.page || !state.isDirty) return ok(undefined);

        saveLock = true;
        set({ isSaving: true, lastError: null, syncStatus: 'syncing' });

        try {
          const response = await fetch(`/api/pages/${state.page.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              blocks: state.blocks.map(b => b),
              puckData: state.puckData,
              theme: state.currentTheme.id,
            }),
          });

          if (!response.ok) {
            const error = new DomainError({
              code: 'SAVE_FAILED',
              message: 'Failed to save page',
              statusCode: 500,
            });
            set({ isSaving: false, syncStatus: 'error', lastError: error });
            saveLock = false;
            return err(error);
          }

          set({
            isSaving: false,
            isDirty: false,
            lastSavedAt: Date.now(),
            syncStatus: 'synced',
          });

          saveLock = false;
          return ok(undefined);
        } catch (error) {
          const domainError = new DomainError({
            code: 'SAVE_FAILED',
            message: error instanceof Error ? error.message : 'Failed to save page',
            statusCode: 500,
          });
          set({ isSaving: false, syncStatus: 'error', lastError: domainError });
          saveLock = false;
          return err(domainError);
        }
      },

      publishPage: async () => {
        const state = get();
        if (!state.page) {
          return err(Errors.PageNotFound('' as PageId));
        }

        const saveResult = await get().savePage();
        if (!saveResult.success) return saveResult;

        try {
          const response = await fetch(`/api/pages/${state.page.id}/publish`, {
            method: 'POST',
          });

          if (!response.ok) {
            const error = new DomainError({
              code: 'PUBLISH_FAILED',
              message: 'Failed to publish page',
              statusCode: 500,
            });
            return err(error);
          }

          get().addToast({
            type: 'success',
            title: 'Page published!',
            description: 'Your page is now live',
            duration: 3000,
          });

          return ok(undefined);
        } catch (error) {
          return err(new DomainError({
            code: 'PUBLISH_FAILED',
            message: error instanceof Error ? error.message : 'Failed to publish page',
            statusCode: 500,
          }));
        }
      },

      unpublishPage: async () => {
        const state = get();
        if (!state.page) {
          return err(Errors.PageNotFound('' as PageId));
        }

        try {
          await fetch(`/api/pages/${state.page.id}/unpublish`, {
            method: 'POST',
          });

          get().addToast({
            type: 'info',
            title: 'Page unpublished',
            duration: 2000,
          });

          return ok(undefined);
        } catch (error) {
          return err(new DomainError({
            code: 'UNPUBLISH_FAILED',
            message: error instanceof Error ? error.message : 'Failed to unpublish page',
            statusCode: 500,
          }));
        }
      },

      updatePageTitle: (title: string) => {
        const state = get();
        if (!state.page) return;

        set({
          page: { ...state.page, title } as Page,
          isDirty: true,
        });
      },

      updatePageSEO: (seo: Partial<Page['seo']>) => {
        const state = get();
        if (!state.page) return;

        set({
          page: { ...state.page, seo: { ...state.page.seo, ...seo } } as Page,
          isDirty: true,
        });
      },

      changeTheme: (themeId: ThemeId) => {
        const state = get();
        const theme = state.availableThemes.find(t => t.id === themeId);
        
        if (!theme) {
          return err(Errors.ValidationFailed('themeId', 'Theme not found'));
        }

        set({
          currentTheme: theme,
          isDirty: true,
        });

        return ok(undefined);
      },

      // =========================================================================
      // BLOCK ACTIONS
      // =========================================================================

      addBlock: (type: BlockType, position?: number, data?: BlockData) => {
        const state = get();

        // Push undo state
        set(pushUndoState);

        const newId = generateId() as BlockId;
        const block: Block = {
          id: newId,
          type,
          props: data || {},
        };

        const insertAt = position ?? state.blocks.length;
        const newBlocks = [...state.blocks];
        newBlocks.splice(insertAt, 0, block);

        // Also update puck data if present
        let newPuckData = state.puckData;
        if (newPuckData) {
          newPuckData = {
            ...newPuckData,
            content: [
              ...newPuckData.content,
              { type, props: { id: newId, ...data } },
            ],
          };
        }

        set({
          blocks: newBlocks,
          puckData: newPuckData,
          selectedBlockId: newId,
          isDirty: true,
        });

        get().addToast({
          type: 'success',
          title: `${type} added`,
          duration: 2000,
        });

        return ok(block);
      },

      removeBlock: (blockId: BlockId) => {
        const state = get();
        const blockExists = state.blocks.some(b => b.id === blockId);

        if (!blockExists) {
          return err(Errors.BlockNotFound(blockId));
        }

        // Push undo state
        set(pushUndoState);

        const newBlocks = state.blocks.filter(b => b.id !== blockId);
        
        // Update puck data
        let newPuckData = state.puckData;
        if (newPuckData) {
          newPuckData = {
            ...newPuckData,
            content: newPuckData.content.filter(
              (c) => c.props.id !== blockId
            ),
          };
        }

        set({
          blocks: newBlocks,
          puckData: newPuckData,
          selectedBlockId: state.selectedBlockId === blockId ? null : state.selectedBlockId,
          isDirty: true,
        });

        get().addToast({
          type: 'info',
          title: 'Block removed',
          duration: 2000,
        });

        return ok(undefined);
      },

      updateBlock: (blockId: BlockId, data: Partial<BlockData>) => {
        const state = get();
        const blockIndex = state.blocks.findIndex(b => b.id === blockId);

        if (blockIndex === -1) {
          return err(Errors.BlockNotFound(blockId));
        }

        // Throttle undo for rapid updates
        const lastUndo = state.undoStack[state.undoStack.length - 1];
        const shouldPushUndo = !lastUndo || 
          Date.now() - lastUndo.timestamp > 1000 ||
          lastUndo.selectedBlockId !== blockId;

        if (shouldPushUndo) {
          set(pushUndoState);
        }

        const newBlocks = [...state.blocks];
        newBlocks[blockIndex] = {
          ...newBlocks[blockIndex],
          props: { ...newBlocks[blockIndex].props, ...data },
        };

        // Update puck data
        let newPuckData = state.puckData;
        if (newPuckData) {
          newPuckData = {
            ...newPuckData,
            content: newPuckData.content.map((c) =>
              c.props.id === blockId
                ? { ...c, props: { ...c.props, ...data } }
                : c
            ),
          };
        }

        set({
          blocks: newBlocks,
          puckData: newPuckData,
          isDirty: true,
        });

        return ok(undefined);
      },

      moveBlock: (fromIndex: number, toIndex: number) => {
        const state = get();

        if (
          fromIndex < 0 ||
          fromIndex >= state.blocks.length ||
          toIndex < 0 ||
          toIndex >= state.blocks.length
        ) {
          return err(Errors.ValidationFailed('index', 'Out of bounds'));
        }

        // Push undo state
        set(pushUndoState);

        const newBlocks = [...state.blocks];
        const [moved] = newBlocks.splice(fromIndex, 1);
        newBlocks.splice(toIndex, 0, moved);

        // Update puck data
        let newPuckData = state.puckData;
        if (newPuckData) {
          const content = [...newPuckData.content];
          const [removed] = content.splice(fromIndex, 1);
          content.splice(toIndex, 0, removed);
          newPuckData = { ...newPuckData, content };
        }

        set({
          blocks: newBlocks,
          puckData: newPuckData,
          isDirty: true,
        });

        return ok(undefined);
      },

      duplicateBlock: (blockId: BlockId) => {
        const state = get();
        const blockIndex = state.blocks.findIndex(b => b.id === blockId);

        if (blockIndex === -1) {
          return err(Errors.BlockNotFound(blockId));
        }

        const original = state.blocks[blockIndex];
        const newId = generateId() as BlockId;
        const clone: Block = {
          id: newId,
          type: original.type,
          props: deepClone(original.props),
        };

        const result = get().addBlock(original.type, blockIndex + 1, original.props);
        
        if (result.success && state.puckData) {
          const newPuckData = {
            ...state.puckData,
            content: [
              ...state.puckData.content.slice(0, blockIndex + 1),
              { type: original.type, props: { id: newId, ...original.props } },
              ...state.puckData.content.slice(blockIndex + 1),
            ],
          };
          set({ puckData: newPuckData });
        }

        return ok(clone);
      },

      selectBlock: (blockId: BlockId | null) => {
        set({
          selectedBlockId: blockId,
          rightPanel: blockId ? 'properties' : 'none',
        });
      },

      setHoveredBlock: (blockId: BlockId | null) => {
        set({ hoveredBlockId: blockId });
      },

      // =========================================================================
      // DRAG ACTIONS
      // =========================================================================

      startDrag: (blockId: BlockId) => {
        set({
          draggedBlockId: blockId,
          isDragging: true,
        });
      },

      setDragOver: (index: number | null) => {
        set({ dragOverIndex: index });
      },

      endDrag: () => {
        const state = get();
        if (state.draggedBlockId && state.dragOverIndex !== null) {
          const fromIndex = state.blocks.findIndex(b => b.id === state.draggedBlockId);
          if (fromIndex !== -1 && fromIndex !== state.dragOverIndex) {
            get().moveBlock(fromIndex, state.dragOverIndex);
          }
        }

        set({
          draggedBlockId: null,
          dragOverIndex: null,
          isDragging: false,
        });
      },

      // =========================================================================
      // VIEW ACTIONS
      // =========================================================================

      setViewMode: (mode: ViewMode) => {
        set({
          viewMode: mode,
          selectedBlockId: mode === 'preview' ? null : get().selectedBlockId,
          rightPanel: mode === 'preview' ? 'none' : get().rightPanel,
        });
      },

      setDeviceMode: (mode: DeviceMode) => {
        set({ deviceMode: mode });
      },

      setSidebarPanel: (panel: SidebarPanel) => {
        set({ sidebarPanel: panel });
      },

      setRightPanel: (panel: RightPanel) => {
        set({ rightPanel: panel });
      },

      setCanvasZoom: (zoom: number) => {
        set({
          canvasZoom: Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom)),
        });
      },

      zoomIn: () => {
        const state = get();
        get().setCanvasZoom(state.canvasZoom + 25);
      },

      zoomOut: () => {
        const state = get();
        get().setCanvasZoom(state.canvasZoom - 25);
      },

      resetZoom: () => {
        set({ canvasZoom: DEFAULT_ZOOM });
      },

      toggleGrid: () => {
        set(state => ({ showGrid: !state.showGrid }));
      },

      toggleOutlines: () => {
        set(state => ({ showOutlines: !state.showOutlines }));
      },

      // =========================================================================
      // UNDO/REDO
      // =========================================================================

      undo: () => {
        const state = get();
        if (state.undoStack.length === 0) {
          return err(Errors.ValidationFailed('undo', 'Nothing to undo'));
        }

        const prev = state.undoStack[state.undoStack.length - 1];

        set({
          blocks: prev.blocks,
          puckData: prev.blocks.length > 0 ? {
            root: state.puckData?.root || { props: {} },
            content: prev.blocks.map(b => ({ type: b.type, props: { id: b.id, ...b.props } })),
          } : state.puckData,
          selectedBlockId: prev.selectedBlockId,
          undoStack: state.undoStack.slice(0, -1),
          redoStack: [
            ...state.redoStack,
            createUndoSnapshot(state.blocks, state.selectedBlockId),
          ],
          isDirty: true,
        });

        return ok(undefined);
      },

      redo: () => {
        const state = get();
        if (state.redoStack.length === 0) {
          return err(Errors.ValidationFailed('redo', 'Nothing to redo'));
        }

        const next = state.redoStack[state.redoStack.length - 1];

        set({
          blocks: next.blocks,
          puckData: next.blocks.length > 0 ? {
            root: state.puckData?.root || { props: {} },
            content: next.blocks.map(b => ({ type: b.type, props: { id: b.id, ...b.props } })),
          } : state.puckData,
          selectedBlockId: next.selectedBlockId,
          redoStack: state.redoStack.slice(0, -1),
          undoStack: [
            ...state.undoStack,
            createUndoSnapshot(state.blocks, state.selectedBlockId),
          ],
          isDirty: true,
        });

        return ok(undefined);
      },

      canUndo: () => get().undoStack.length > 0,
      canRedo: () => get().redoStack.length > 0,

      // =========================================================================
      // AUTOSAVE
      // =========================================================================

      startAutosave: () => {
        const state = get();
        if (autosaveTimer || !state.autosaveEnabled) return;

        set({ autosaveEnabled: true });

        autosaveTimer = setInterval(() => {
          const current = get();
          if (current.isDirty && !current.isSaving && current.page) {
            current.savePage();
          }
        }, state.autosaveIntervalMs);
      },

      stopAutosave: () => {
        if (autosaveTimer) {
          clearInterval(autosaveTimer);
          autosaveTimer = null;
        }
        set({ autosaveEnabled: false });
      },

      toggleAutosave: () => {
        const state = get();
        if (state.autosaveEnabled) {
          get().stopAutosave();
        } else {
          get().startAutosave();
        }
      },

      // =========================================================================
      // TOASTS
      // =========================================================================

      addToast: (toast: Omit<Toast, 'id'>) => {
        const id = generateId();
        const newToast: Toast = { ...toast, id };

        set(state => ({
          toasts: [...state.toasts, newToast],
        }));

        // Auto-remove
        if (toast.duration > 0) {
          setTimeout(() => {
            get().removeToast(id);
          }, toast.duration);
        }
      },

      removeToast: (toastId: string) => {
        set(state => ({
          toasts: state.toasts.filter(t => t.id !== toastId),
        }));
      },

      // =========================================================================
      // SYNC
      // =========================================================================

      syncNow: async () => {
        set({ syncStatus: 'syncing' });

        try {
          const state = get();
          if (!state.page) {
            return err(Errors.PageNotFound('' as PageId));
          }

          const response = await fetch(`/api/pages/${state.page.id}/sync`, {
            method: 'POST',
          });

          if (!response.ok) {
            const error = new DomainError({
              code: 'SYNC_FAILED',
              message: 'Sync failed',
              statusCode: 500,
            });
            set({ syncStatus: 'error' });
            return err(error);
          }

          set({ syncStatus: 'synced', pendingSync: false });
          return ok(undefined);
        } catch (error) {
          set({ syncStatus: 'error' });
          return err(new DomainError({
            code: 'SYNC_FAILED',
            message: error instanceof Error ? error.message : 'Sync failed',
            statusCode: 500,
          }));
        }
      },

      markSyncResolved: (blockId: BlockId) => {
        // Implementation for marking specific blocks as resolved
        set({ pendingSync: false });
      },

      // =========================================================================
      // VERSION HISTORY
      // =========================================================================

      createVersion: (description?: string) => {
        const state = get();
        if (!state.page || !state.puckData) return;

        const pageVersions = state.versions.filter(v => v.pageId === state.page!.id);
        const newVersion: PageVersion = {
          id: generateId(),
          pageId: state.page.id as unknown as string,
          data: deepClone(state.puckData),
          title: state.page.title,
          createdAt: Date.now(),
          description: description || `Version ${pageVersions.length + 1}`,
        };

        set(state => ({
          versions: [...state.versions, newVersion].slice(-MAX_VERSIONS),
        }));
      },

      restoreVersion: (versionId: string) => {
        const state = get();
        const version = state.versions.find(v => v.id === versionId);

        if (!version) {
          return err(Errors.ValidationFailed('versionId', 'Version not found'));
        }

        // Push current state to undo before restoring
        set(pushUndoState);

        set({
          puckData: deepClone(version.data),
          blocks: version.data.content.map(c => ({
            id: c.props.id as BlockId,
            type: c.type,
            props: c.props,
          })),
          isDirty: true,
        });

        get().addToast({
          type: 'success',
          title: 'Version restored',
          duration: 2000,
        });

        return ok(version.data);
      },

      deleteVersion: (versionId: string) => {
        set(state => ({
          versions: state.versions.filter(v => v.id !== versionId),
        }));
      },

      getVersionsForPage: (pageId: string) => {
        const state = get();
        return state.versions
          .filter(v => v.pageId === pageId)
          .sort((a, b) => b.createdAt - a.createdAt);
      },

      // =========================================================================
      // LOCAL DRAFTS
      // =========================================================================

      saveDraft: () => {
        const state = get();
        if (!state.page || !state.puckData) return;

        const draft: LocalDraft = {
          pageId: state.page.id as unknown as string,
          slug: state.page.slug,
          data: deepClone(state.puckData),
          title: state.page.title,
          lastModified: Date.now(),
          syncStatus: 'pending',
        };

        set(state => {
          const existingDraftIndex = state.drafts.findIndex(
            d => d.pageId === draft.pageId
          );
          
          if (existingDraftIndex >= 0) {
            const newDrafts = [...state.drafts];
            newDrafts[existingDraftIndex] = draft;
            return { drafts: newDrafts };
          }
          
          return { drafts: [...state.drafts, draft] };
        });
      },

      loadDraft: (slug: string) => {
        const state = get();
        return state.drafts.find(d => d.slug === slug) || null;
      },

      deleteDraft: (slug: string) => {
        set(state => ({
          drafts: state.drafts.filter(d => d.slug !== slug),
        }));
      },

      hasDraft: (slug: string) => {
        const state = get();
        return state.drafts.some(d => d.slug === slug);
      },

      // =========================================================================
      // PUCK DATA OPERATIONS
      // =========================================================================

      setPuckData: (data: Data) => {
        set({
          puckData: data,
          blocks: data.content.map(c => ({
            id: c.props.id as BlockId,
            type: c.type,
            props: c.props,
          })),
          isDirty: true,
        });
      },

      updatePuckComponent: (id: string, props: Record<string, unknown>) => {
        const state = get();
        if (!state.puckData) return;

        const newContent = state.puckData.content.map(c =>
          c.props.id === id ? { ...c, props: { ...c.props, ...props } } : c
        );

        set({
          puckData: { ...state.puckData, content: newContent },
          isDirty: true,
        });
      },

      // =========================================================================
      // RESET
      // =========================================================================

      resetEditor: () => {
        if (autosaveTimer) {
          clearInterval(autosaveTimer);
          autosaveTimer = null;
        }
        saveLock = false;

        set({
          page: null,
          blocks: [],
          selectedBlockId: null,
          hoveredBlockId: null,
          puckData: null,
          puckComponents: {},
          viewMode: 'edit',
          deviceMode: 'desktop',
          sidebarPanel: 'blocks',
          rightPanel: 'none',
          canvasZoom: DEFAULT_ZOOM,
          showGrid: false,
          showOutlines: false,
          draggedBlockId: null,
          dragOverIndex: null,
          isDragging: false,
          undoStack: [],
          redoStack: [],
          isDirty: false,
          isSaving: false,
          isLoading: false,
          lastSavedAt: null,
          lastError: null,
          autosaveEnabled: true,
          syncStatus: 'idle',
          pendingSync: false,
          versions: [],
          initialized: false,
        });
      },
    })),
    { name: 'EditorStore' }
  )
);

// =============================================================================
// SELECTORS
// =============================================================================

export const selectSelectedBlock = (state: EditorStore): Block | null => {
  if (!state.selectedBlockId) return null;
  return state.blocks.find(b => b.id === state.selectedBlockId) || null;
};

export const selectCanUndo = (state: EditorStore): boolean =>
  state.undoStack.length > 0;

export const selectCanRedo = (state: EditorStore): boolean =>
  state.redoStack.length > 0;

export const selectBlockById = (state: EditorStore, blockId: BlockId): Block | null =>
  state.blocks.find(b => b.id === blockId) || null;

export const selectBlockIndex = (state: EditorStore, blockId: BlockId): number =>
  state.blocks.findIndex(b => b.id === blockId);

export const selectBlocksByType = (state: EditorStore, type: BlockType): readonly Block[] =>
  state.blocks.filter(b => b.type === type);

export const selectIsDirty = (state: EditorStore): boolean => state.isDirty;

export const selectIsSaving = (state: EditorStore): boolean => state.isSaving;

export const selectSyncStatus = (state: EditorStore): SyncStatus => state.syncStatus;

export const selectCurrentTheme = (state: EditorStore): Theme => state.currentTheme;

export const selectToasts = (state: EditorStore): readonly Toast[] => state.toasts;

export const selectViewMode = (state: EditorStore): ViewMode => state.viewMode;

export const selectDeviceMode = (state: EditorStore): DeviceMode => state.deviceMode;

export const selectCanvasZoom = (state: EditorStore): number => state.canvasZoom;

export const selectSidebarPanel = (state: EditorStore): SidebarPanel => state.sidebarPanel;

export const selectRightPanel = (state: EditorStore): RightPanel => state.rightPanel;
