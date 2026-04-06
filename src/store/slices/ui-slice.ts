/**
 * UI Slice - Manages the editor UI state
 * Part of the modular slice architecture
 */

import type {ItemSelector, UiState} from "../../types";

// =============================================================================
// Types
// =============================================================================

export type UiSliceState = {
  leftSideBarVisible: boolean;
  rightSideBarVisible: boolean;
  leftSideBarWidth: number | null;
  rightSideBarWidth: number | null;
  mobilePanelExpanded: boolean;
  itemSelector: ItemSelector | null;
  previewMode: "interactive" | "edit";
  componentList: Record<string, { components?: string[]; title?: string; visible?: boolean; expanded?: boolean }>;
  isDragging: boolean;
  viewports: {
    current: { width: number | "100%"; height: number | "auto" };
    controlsVisible: boolean;
    options: Array<{ width: number | "100%"; height: number | "auto"; label: string }>;
  };
  field: { focus?: string | null; metadata?: Record<string, unknown> };
  plugin: { current: string | null };
  arrayState: Record<string, { items: Array<{ _arrayId: string; _originalIndex: number; _currentIndex: number }>; openId: string } | undefined>;
};

// =============================================================================
// Default State
// =============================================================================

export const defaultUiState: UiSliceState = {
  leftSideBarVisible: true,
  rightSideBarVisible: false,
  leftSideBarWidth: 240,
  rightSideBarWidth: 320,
  mobilePanelExpanded: false,
  itemSelector: null,
  previewMode: "edit",
  componentList: {},
  isDragging: false,
  viewports: {
    current: { width: "100%", height: "auto" },
    controlsVisible: true,
    options: [
      { width: "100%", height: "auto", label: "Auto" },
      { width: 375, height: 812, label: "iPhone" },
      { width: 768, height: 1024, label: "iPad" },
      { width: 1440, height: 900, label: "Desktop" },
    ],
  },
  field: { focus: null, metadata: {} },
  plugin: { current: null },
  arrayState: {},
};

// =============================================================================
// Slice Factory
// =============================================================================

export type UiSlice = UiSliceState & {
  /** Set the entire UI state */
  setUi: (ui: Partial<UiState>) => void;
  
  /** Update UI using a function */
  updateUi: (updater: (ui: UiState) => Partial<UiState>) => void;
  
  /** Toggle left sidebar */
  toggleLeftSideBar: () => void;
  
  /** Toggle right sidebar */
  toggleRightSideBar: () => void;
  
  /** Set left sidebar width */
  setLeftSideBarWidth: (width: number | null) => void;
  
  /** Set right sidebar width */
  setRightSideBarWidth: (width: number | null) => void;
  
  /** Select an item */
  selectItem: (selector: ItemSelector | null) => void;
  
  /** Toggle preview mode */
  togglePreviewMode: () => void;
  
  /** Set preview mode */
  setPreviewMode: (mode: "interactive" | "edit") => void;
  
  /** Set dragging state */
  setDragging: (isDragging: boolean) => void;
  
  /** Set field focus */
  setFieldFocus: (fieldName: string | null) => void;
  
  /** Set field metadata */
  setFieldMetadata: (metadata: Record<string, unknown>) => void;
  
  /** Set viewport size */
  setViewport: (viewport: { width: number | "100%"; height: number | "auto" }) => void;
  
  /** Toggle viewport controls */
  toggleViewportControls: () => void;
  
  /** Set array state for array fields */
  setArrayState: (arrayId: string, state: UiSliceState["arrayState"][string]) => void;
  
  /** Clear array state */
  clearArrayState: (arrayId: string) => void;
  
  /** Set plugin */
  setPlugin: (pluginId: string | null) => void;
  
  /** Expand/collapse component category */
  setComponentCategoryExpanded: (category: string, expanded: boolean) => void;
  
  /** Set component category visibility */
  setComponentCategoryVisible: (category: string, visible: boolean) => void;
  
  /** Reset to default UI state */
  resetUi: () => void;
};

export function createUiSlice(
  set: (newState: Partial<UiSlice>) => void,
  _get: () => UiSlice
): UiSlice {
  return {
    ...defaultUiState,
    
    setUi: (ui) => {
      set((state) => ({
        ...state,
        ...ui,
      }));
    },
    
    updateUi: (updater) => {
      set((state) => updater(state as unknown as UiState));
    },
    
    toggleLeftSideBar: () => {
      set((state) => ({
        leftSideBarVisible: !state.leftSideBarVisible,
      }));
    },
    
    toggleRightSideBar: () => {
      set((state) => ({
        rightSideBarVisible: !state.rightSideBarVisible,
      }));
    },
    
    setLeftSideBarWidth: (width) => {
      set({ leftSideBarWidth: width });
    },
    
    setRightSideBarWidth: (width) => {
      set({ rightSideBarWidth: width });
    },
    
    selectItem: (selector) => {
      set({ itemSelector: selector });
    },
    
    togglePreviewMode: () => {
      set((state) => ({
        previewMode: state.previewMode === "edit" ? "interactive" : "edit",
      }));
    },
    
    setPreviewMode: (mode) => {
      set({ previewMode: mode });
    },
    
    setDragging: (isDragging) => {
      set({ isDragging });
    },
    
    setFieldFocus: (fieldName) => {
      set((state) => ({
        field: {
          ...state.field,
          focus: fieldName,
        },
      }));
    },
    
    setFieldMetadata: (metadata) => {
      set((state) => ({
        field: {
          ...state.field,
          metadata,
        },
      }));
    },
    
    setViewport: (viewport) => {
      set((state) => ({
        viewports: {
          ...state.viewports,
          current: viewport,
        },
      }));
    },
    
    toggleViewportControls: () => {
      set((state) => ({
        viewports: {
          ...state.viewports,
          controlsVisible: !state.viewports.controlsVisible,
        },
      }));
    },
    
    setArrayState: (arrayId, arrayState) => {
      set((state) => ({
        arrayState: {
          ...state.arrayState,
          [arrayId]: arrayState,
        },
      }));
    },
    
    clearArrayState: (arrayId) => {
      set((state) => {
        const { [arrayId]: _, ...remaining } = state.arrayState;
        return { arrayState: remaining };
      });
    },
    
    setPlugin: (pluginId) => {
      set({ plugin: { current: pluginId } });
    },
    
    setComponentCategoryExpanded: (category, expanded) => {
      set((state) => ({
        componentList: {
          ...state.componentList,
          [category]: {
            ...state.componentList[category],
            expanded,
          },
        },
      }));
    },
    
    setComponentCategoryVisible: (category, visible) => {
      set((state) => ({
        componentList: {
          ...state.componentList,
          [category]: {
            ...state.componentList[category],
            visible,
          },
        },
      }));
    },
    
    resetUi: () => {
      set(defaultUiState);
    },
  };
}
