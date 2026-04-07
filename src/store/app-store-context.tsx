/**
 * App Store Context - Provider-based store injection for nested editors
 * Enables nested Puck editors with isolated state
 */

"use client";

import React, {createContext, ReactNode, useContext, useEffect, useMemo, useRef,} from "react";
import {create} from "zustand";
import {subscribeWithSelector} from "zustand/middleware";
import {generateId} from "../lib/generate-id";
import type {AppState, ComponentData, Config, Data, ItemSelector, RootData, UiState,} from "../types";
import type {NodeIndex, ZoneIndex, ZoneTypeEnum} from "./puck-reducer";
import {rootDroppableId} from "../lib/root-droppable-id";
import {buildNodeIndex} from "../lib/build-node-index";
// Import slice types
import type {DataSlice, DataSliceState} from "./slices/data-slice";
import {createDataSlice} from "./slices/data-slice";
import type {UiSlice, UiSliceState} from "./slices/ui-slice";
import {createUiSlice} from "./slices/ui-slice";
import type {HistorySlice, HistorySliceState} from "./slices/history-slice";
import {createHistorySlice} from "./slices/history-slice";
import type {PermissionsSlice, PermissionsSliceState} from "./slices/permissions-slice";
import {createPermissionsSlice} from "./slices/permissions-slice";
import type {FieldsSlice, FieldsSliceState} from "./slices/fields-slice";
import {createFieldsSlice} from "./slices/fields-slice";

// =============================================================================
// Type Definitions
// =============================================================================

/** Private app state with indexes */
export type PrivateAppState<UserData extends Data = Data> = AppState<UserData> & {
  indexes: {
    nodes: NodeIndex;
    zones: ZoneIndex;
  };
};

/** Full app store type */
export type AppStore<UserData extends Data = Data> = {
  // Identity
  instanceId: string;
  
  // State
  state: PrivateAppState<UserData>;
  
  // Actions
  dispatch: (action: PuckAction) => void;
  
  // Config
  config: Config;
  
  // UI helpers
  selectedItem: ComponentData | null;
  getCurrentData: () => ComponentData | RootData;
  setUi: (ui: Partial<UiState>) => void;
  getComponentConfig: (type?: string) => Config["components"][string] | undefined;
  
  // Direct data access
  data: DataSlice;
  ui: UiSlice;
  history: HistorySlice;
  permissions: PermissionsSlice;
  fields: FieldsSlice;
};

/** Action types for dispatch */
export type PuckAction =
  | { type: "insert"; componentType: string; destinationIndex: number; destinationZone: string; id?: string }
  | { type: "remove"; index: number; zone: string }
  | { type: "move"; sourceIndex: number; sourceZone: string; destinationIndex: number; destinationZone: string }
  | { type: "replace"; destinationIndex: number; destinationZone: string; data: ComponentData }
  | { type: "replaceRoot"; root: RootData }
  | { type: "reorder"; sourceIndex: number; destinationIndex: number; destinationZone: string }
  | { type: "duplicate"; sourceIndex: number; sourceZone: string }
  | { type: "set"; state: Partial<PrivateAppState> }
  | { type: "setData"; data: Partial<Data> }
  | { type: "setUi"; ui: Partial<UiState> }
  | { type: "select"; selector: ItemSelector | null }
  | { type: "registerZone"; zone: string }
  | { type: "unregisterZone"; zone: string }
  | { type: "batch"; actions: PuckAction[] }
  | { type: "reset" };

// =============================================================================
// Context
// =============================================================================

/** Default app state */
function createDefaultAppState<UserData extends Data = Data>(): PrivateAppState<UserData> {
  const { nodes, zones } = buildNodeIndex([], {});
  
  return {
    data: {
      content: [],
      root: { props: {} },
      zones: {},
    } as UserData,
    ui: {
      selected: { id: null },
      dragging: { id: null },
      hovering: { id: null },
      section: "content" as const,
      media: { isOpen: false },
      history: { canUndo: false, canRedo: false },
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
        options: [],
      },
      field: { focus: null, metadata: {} },
      plugin: { current: null },
      arrayState: {},
    },
    indexes: { nodes, zones },
  };
}

/** Create the app store */
function createAppStore<UserData extends Data = Data>(
  initialState?: Partial<PrivateAppState<UserData>>
) {
  const defaultState = createDefaultAppState<UserData>();
  
  return create<AppStore<UserData>>()(
    subscribeWithSelector((set, get) => {
      // Create slices
      const dataSlice = createDataSlice(
        (newState) => set(newState as any),
        () => get() as any
      );
      
      const uiSlice = createUiSlice(
        (newState) => set(newState as any),
        () => get() as any
      );
      
      const historySlice = createHistorySlice(
        (newState) => set(newState as any),
        () => get() as any
      );
      
      const permissionsSlice = createPermissionsSlice(
        (newState) => set(newState as any),
        () => get() as any
      );
      
      const fieldsSlice = createFieldsSlice(
        (newState) => set(newState as any),
        () => get() as any
      );
      
      return {
        instanceId: generateId(),
        
        state: {
          ...defaultState,
          ...initialState,
        },
        
        dispatch: (action: PuckAction) => {
          const currentState = get().state;
          let newState = currentState;
          
          // Handle batch actions
          if (action.type === "batch") {
            for (const subAction of action.actions) {
              get().dispatch(subAction);
            }
            return;
          }
          
          // Handle reset
          if (action.type === "reset") {
            set({ state: createDefaultAppState() });
            return;
          }
          
          // Update based on action type
          switch (action.type) {
            case "setData": {
              const newData = { ...currentState.data, ...action.data };
              
              const { nodes, zones } = buildNodeIndex(
                newData.content || [],
                newData.zones || {}
              );
              
              newState = {
                ...currentState,
                data: newData,
                indexes: { nodes, zones },
              };
              break;
            }
            
            case "setUi": {
              const newUi = { ...currentState.ui, ...action.ui };
              
              newState = {
                ...currentState,
                ui: newUi,
              };
              break;
            }
            
            case "select": {
              const sel = action.selector as any;
              const item = sel
                ? currentState.indexes.nodes[currentState.indexes.zones[sel.zone || rootDroppableId]?.contentIds[sel.index]]?.data
                : null;
              
              newState = {
                ...currentState,
                ui: {
                  ...currentState.ui,
                  itemSelector: action.selector,
                },
              };
              break;
            }
            
            case "registerZone": {
              const newZones = {
                ...currentState.indexes.zones,
                [action.zone]: { contentIds: [], type: "dropzone" as ZoneTypeEnum },
              };
              
              newState = {
                ...currentState,
                indexes: {
                  ...currentState.indexes,
                  zones: newZones,
                },
              };
              break;
            }
            
            case "unregisterZone": {
              const { [action.zone]: _, ...remainingZones } = currentState.indexes.zones;
              
              newState = {
                ...currentState,
                indexes: {
                  ...currentState.indexes,
                  zones: remainingZones,
                },
              };
              break;
            }
            
            case "set": {
              newState = { ...currentState, ...(action.state as any) };
              break;
            }
          }
          
          // Record history for state-changing actions
          const recordableActions = ["insert", "remove", "move", "replace", "replaceRoot", "reorder", "duplicate"];
          if (recordableActions.includes(action.type)) {
            historySlice.record(newState);
          }
          
          set({ state: newState });
        },
        
        config: { components: {} },
        
        selectedItem: null,
        
        getCurrentData: () => {
          const state = get().state;
          const selector = state.ui.itemSelector as any;
          return selector
            ? state.indexes.nodes[state.indexes.zones[selector.zone || rootDroppableId]?.contentIds[selector.index]]?.data
            : state.data.root;
        },
        
        setUi: (ui) => {
          get().dispatch({ type: "setUi", ui });
        },
        
        getComponentConfig: (type) => {
          const { config } = get();
          return type ? config.components?.[type] : undefined;
        },
        
        data: dataSlice as DataSlice,
        ui: uiSlice as UiSlice,
        history: historySlice as HistorySlice,
        permissions: permissionsSlice as PermissionsSlice,
        fields: fieldsSlice as FieldsSlice,
      };
    })
  );
}

/** Create context */
export const AppStoreContext = createContext<ReturnType<typeof createAppStore> | null>(null);

/** Provider props */
export type AppStoreProviderProps = {
  children: ReactNode;
  initialState?: Partial<PrivateAppState>;
  config?: Config;
};

/**
 * App Store Provider - wrap your app to provide the store
 * Supports nested stores for multiple editors
 */
export function AppStoreProvider({
  children,
  initialState,
  config,
}: AppStoreProviderProps) {
  const storeRef = useRef<ReturnType<typeof createAppStore> | null>(null);
  
  if (!storeRef.current) {
    storeRef.current = createAppStore(initialState);
  }
  
  const store = storeRef.current;
  
  // Apply config if provided
  useEffect(() => {
    if (config) {
      store.setState({ config });
    }
  }, [config, store]);
  
  return (
    <AppStoreContext.Provider value={store}>
      {children}
    </AppStoreContext.Provider>
  );
}

/**
 * Hook to access the app store
 */
export function useAppStore<T>(
  selector: (state: AppStore) => T
): T {
  const store = useContext(AppStoreContext);
  
  if (!store) {
    throw new Error("useAppStore must be used within an AppStoreProvider");
  }
  
  return store(selector);
}

/**
 * Hook to access the app store without selector (full state)
 */
export function useAppStoreApi(): AppStore {
  const store = useContext(AppStoreContext);
  
  if (!store) {
    throw new Error("useAppStoreApi must be used within an AppStoreProvider");
  }
  
  return store.getState();
}

/**
 * Hook to dispatch actions
 */
export function useAppDispatch() {
  const store = useContext(AppStoreContext);
  
  if (!store) {
    throw new Error("useAppDispatch must be used within an AppStoreProvider");
  }
  
  return store.getState().dispatch;
}

/**
 * Hook to access a specific slice
 */
export function useAppSlice<K extends keyof AppStore>(
  slice: K
): AppStore[K] {
  return useAppStore((state) => state[slice]);
}

/**
 * Create a nested editor context
 * Use this for rendering multiple editors on the same page
 */
export function createNestedEditorContext() {
  const context = createContext<ReturnType<typeof createAppStore> | null>(null);
  
  const Provider: React.FC<{
    children: ReactNode;
    initialState?: Partial<PrivateAppState>;
  }> = ({ children, initialState }) => {
    const store = useMemo(
      () => createAppStore(initialState),
      [initialState]
    );
    
    return (
      <context.Provider value={store}>
        {children}
      </context.Provider>
    );
  };
  
  return {
    context,
    Provider,
    useStore: () => {
      const store = useContext(context);
      if (!store) {
        throw new Error("useNestedStore must be used within its Provider");
      }
      return store;
    },
  };
}

// =============================================================================
// Export Types
// =============================================================================

export type { DataSlice, DataSliceState };
export type { UiSlice, UiSliceState };
export type { HistorySlice, HistorySliceState };
export type { PermissionsSlice, PermissionsSliceState };
export type { FieldsSlice, FieldsSliceState };
