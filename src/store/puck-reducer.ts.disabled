/**
 * Puck Reducer - Full reducer architecture with 20+ actions
 * Implements the complete action system for the CPM Puck editor
 */

import {Reducer} from "react";
import {rootDroppableId} from "../lib/root-droppable-id";
import {generateId} from "../lib/generate-id";
import type {AppState, ComponentData, Data, RootData, UiState, ItemSelector,} from "@/types";

// =============================================================================
// Type Definitions
// =============================================================================

/** Zone type enum */
export type ZoneTypeEnum = "root" | "dropzone" | "slot";

/** Node index - maps component IDs to their full node data */
export type NodeIndex = Record<
  string,
  {
    data: ComponentData;
    flatData: ComponentData;
    parentId: string | null;
    zone: string;
    path: string[];
  }
>;

/** Zone index - maps zone IDs to their content */
export type ZoneIndex = Record<string, { contentIds: string[]; type: ZoneTypeEnum }>;

/** Private app state with indexes for efficient lookups */
export type PrivateAppState<UserData extends Data = Data> = AppState<UserData> & {
  indexes: {
    nodes: NodeIndex;
    zones: ZoneIndex;
  };
};

// Re-export ItemSelector for convenience
export { ItemSelector };

// =============================================================================
// Action Types (20+ Actions)
// =============================================================================

export type InsertAction = {
  type: "insert";
  componentType: string;
  destinationIndex: number;
  destinationZone: string;
  id?: string;
  data?: ComponentData;
};

export type DuplicateAction = {
  type: "duplicate";
  sourceIndex: number;
  sourceZone: string;
};

export type ReplaceAction<UserData extends Data = Data> = {
  type: "replace";
  destinationIndex: number;
  destinationZone: string;
  data: ComponentData;
  ui?: Partial<AppState<UserData>["ui"]>;
};

export type ReplaceRootAction<UserData extends Data = Data> = {
  type: "replaceRoot";
  root: RootData;
  ui?: Partial<AppState<UserData>["ui"]>;
};

export type ReorderAction = {
  type: "reorder";
  sourceIndex: number;
  destinationIndex: number;
  destinationZone: string;
};

export type MoveAction = {
  type: "move";
  sourceIndex: number;
  sourceZone: string;
  destinationIndex: number;
  destinationZone: string;
};

export type RemoveAction = {
  type: "remove";
  index: number;
  zone: string;
};

export type SetUiAction = {
  type: "setUi";
  ui: Partial<UiState> | ((previous: UiState) => Partial<UiState>);
};

export type SetDataAction = {
  type: "setData";
  data: Partial<Data> | ((previous: Data) => Partial<Data>);
};

export type SetAction<UserData extends Data = Data> = {
  type: "set";
  state:
    | Partial<PrivateAppState<UserData>>
    | ((previous: PrivateAppState<UserData>) => Partial<PrivateAppState<UserData>>);
};

export type RegisterZoneAction = {
  type: "registerZone";
  zone: string;
  zoneType?: ZoneTypeEnum;
};

export type UnregisterZoneAction = {
  type: "unregisterZone";
  zone: string;
};

export type SelectAction = {
  type: "select";
  selector: ItemSelector | null;
};

export type CommitAction = {
  type: "commit";
};

export type RecordHistoryAction = {
  type: "recordHistory";
};

export type HistoryBackAction = {
  type: "history/back";
};

export type HistoryForwardAction = {
  type: "history/forward";
};

export type HistoryJumpAction = {
  type: "history/jump";
  index: number;
};

export type PushStateAction = {
  type: "pushState";
  state: AppState;
};

export type ClearHistoryAction = {
  type: "history/clear";
};

export type BatchAction = {
  type: "batch";
  actions: PuckAction[];
};

export type ResetAction = {
  type: "reset";
  initialState: PrivateAppState;
};

/** Union type of all puck actions */
export type PuckAction = {
  recordHistory?: boolean;
} & (
  | ReorderAction
  | InsertAction
  | MoveAction
  | ReplaceAction
  | ReplaceRootAction
  | RemoveAction
  | DuplicateAction
  | SetAction
  | SetDataAction
  | SetUiAction
  | RegisterZoneAction
  | UnregisterZoneAction
  | SelectAction
  | CommitAction
  | RecordHistoryAction
  | HistoryBackAction
  | HistoryForwardAction
  | HistoryJumpAction
  | PushStateAction
  | ClearHistoryAction
  | BatchAction
  | ResetAction
);

// =============================================================================
// Helper Functions
// =============================================================================

/** Build node index from content array */
function buildNodeIndex(
  content: ComponentData[],
  zones: Record<string, ComponentData[]>,
  parentId: string | null = null,
  zone: string = rootDroppableId,
  path: string[] = []
): { nodes: NodeIndex; zones: ZoneIndex } {
  const nodes: NodeIndex = {};
  const zoneEntries: ZoneIndex = {};

  // Index root zone
  zoneEntries[rootDroppableId] = {
    contentIds: content.map((item) => item.props.id as string),
    type: "root",
  };

  // Index content items
  content.forEach((item, index) => {
    const id = item.props.id as string;
    nodes[id] = {
      data: item,
      flatData: item,
      parentId,
      zone,
      path: [...path, String(index)],
    };

    // Check for nested zones in item props
    if (item.props && typeof item.props === "object") {
      Object.entries(item.props).forEach(([propKey, propValue]) => {
        if (
          propValue &&
          typeof propValue === "object" &&
          "content" in (propValue as Record<string, unknown>)
        ) {
          const nestedContent = (propValue as { content: ComponentData[] }).content;
          const nestedZone = `${id}:${propKey}`;

          zoneEntries[nestedZone] = {
            contentIds: nestedContent.map((child) => child.props.id as string),
            type: "slot",
          };

          const nested = buildNodeIndex(nestedContent, {}, id, nestedZone, [
            ...path,
            String(index),
            propKey,
          ]);
          Object.assign(nodes, nested.nodes);
          Object.assign(zoneEntries, nested.zones);
        }
      });
    }
  });

  // Index custom zones
  Object.entries(zones).forEach(([zoneId, zoneContent]) => {
    zoneEntries[zoneId] = {
      contentIds: zoneContent.map((item) => item.props.id as string),
      type: "dropzone",
    };

    zoneContent.forEach((item, index) => {
      const id = item.props.id as string;
      if (!nodes[id]) {
        nodes[id] = {
          data: item,
          flatData: item,
          parentId,
          zone: zoneId,
          path: [...path, zoneId, String(index)],
        };
      }
    });
  });

  return { nodes, zones: zoneEntries };
}

/** Get item by selector */
export function getItem<UserData extends Data>(
  selector: ItemSelector,
  state: PrivateAppState
): UserData["content"][0] | undefined {
  const zone = state.indexes.zones?.[selector.zone || rootDroppableId];
  return zone
    ? state.indexes.nodes[zone.contentIds[selector.index]]?.data
    : undefined;
}

/** Find zones for a given area/component */
export function findZonesForArea(
  areaId: string,
  zones: ZoneIndex
): Array<{ zone: string; contentIds: string[]; type: ZoneTypeEnum }> {
  return Object.entries(zones)
    .filter(([zoneId]) => zoneId.startsWith(`${areaId}:`) || zoneId === areaId)
    .map(([zone, data]) => ({
      zone,
      contentIds: data.contentIds,
      type: data.type,
    }));
}

// =============================================================================
// Reducer
// =============================================================================

const EMPTY_HISTORY_INDEX = 0;

/** Create the main puck reducer */
export function createReducer<UserData extends Data>(): Reducer<
  PrivateAppState<UserData>,
  PuckAction
> {
  return (state: PrivateAppState<UserData>, action: PuckAction): PrivateAppState<UserData> => {
    // Validate state
    if (!state || !state.data) {
      return state;
    }

    // Execute action handlers
    switch (action.type) {
      // -------------------------------------------------------------------------
      // Data Actions
      // -------------------------------------------------------------------------

      case "insert": {
        const { componentType, destinationIndex, destinationZone, id, data } = action;
        const newId = id || generateId();
        const newComponent: ComponentData = data || {
          type: componentType,
          props: { id: newId },
        };

        const zone = action.destinationZone || rootDroppableId;
        const zoneContent = [...(state.data.content || [])];

        // Find insertion point
        const existingZone = state.indexes.zones[zone];
        const contentIds = existingZone?.contentIds || [];
        const actualIndex =
          destinationIndex < 0
            ? contentIds.length
            : Math.min(destinationIndex, contentIds.length);

        // Create new content array with insertion
        const newContentIds = [
          ...contentIds.slice(0, actualIndex),
          newId,
          ...contentIds.slice(actualIndex),
        ];

        const newContent: ComponentData[] = [];
        for (const contentId of newContentIds) {
          if (contentId === newId) {
            newContent.push(newComponent);
          } else {
            const existing = state.indexes.nodes[contentId]?.data;
            if (existing) newContent.push(existing);
          }
        }

        // Rebuild indexes
        const { nodes, zones } = buildNodeIndex(
          newContent,
          state.data.zones || {}
        );

        return {
          ...state,
          data: {
            ...state.data,
            content: newContent,
          },
          indexes: { nodes, zones },
        };
      }

      case "remove": {
        const { index, zone } = action;
        const zoneId = zone || rootDroppableId;
        const zoneData = state.indexes.zones[zoneId];

        if (!zoneData || index < 0 || index >= zoneData.contentIds.length) {
          return state;
        }

        const contentIdToRemove = zoneData.contentIds[index];
        const newContent = state.data.content.filter(
          (item) => item.props.id !== contentIdToRemove
        );

        const { nodes, zones } = buildNodeIndex(
          newContent,
          state.data.zones || {}
        );

        return {
          ...state,
          data: {
            ...state.data,
            content: newContent,
          },
          indexes: { nodes, zones },
        };
      }

      case "replace": {
        const { destinationIndex, destinationZone, data, ui } = action;
        const zoneId = destinationZone || rootDroppableId;
        const zoneData = state.indexes.zones[zoneId];

        if (!zoneData || destinationIndex < 0 || destinationIndex >= zoneData.contentIds.length) {
          return state;
        }

        const contentIdToReplace = zoneData.contentIds[destinationIndex];
        const newContent = state.data.content.map((item) =>
          item.props.id === contentIdToReplace ? data : item
        );

        const { nodes, zones } = buildNodeIndex(
          newContent,
          state.data.zones || {}
        );

        return {
          ...state,
          data: {
            ...state.data,
            content: newContent,
          },
          indexes: { nodes, zones },
          ui: ui
            ? {
                ...state.ui,
                ...ui,
              }
            : state.ui,
        };
      }

      case "replaceRoot": {
        const { root, ui } = action;
        return {
          ...state,
          data: {
            ...state.data,
            root,
          },
          ui: ui
            ? {
                ...state.ui,
                ...ui,
              }
            : state.ui,
        };
      }

      case "duplicate": {
        const { sourceIndex, sourceZone } = action;
        const zoneId = sourceZone || rootDroppableId;
        const zoneData = state.indexes.zones[zoneId];

        if (!zoneData || sourceIndex < 0 || sourceIndex >= zoneData.contentIds.length) {
          return state;
        }

        const sourceItemId = zoneData.contentIds[sourceIndex];
        const sourceItem = state.indexes.nodes[sourceItemId]?.data;

        if (!sourceItem) return state;

        const newId = generateId();
        const duplicatedItem: ComponentData = {
          ...sourceItem,
          props: {
            ...sourceItem.props,
            id: newId,
          },
        };

        const newContentIds = [
          ...zoneData.contentIds.slice(0, sourceIndex + 1),
          newId,
          ...zoneData.contentIds.slice(sourceIndex + 1),
        ];

        const newContent: ComponentData[] = [];
        for (const contentId of newContentIds) {
          if (contentId === newId) {
            newContent.push(duplicatedItem);
          } else {
            const existing = state.indexes.nodes[contentId]?.data;
            if (existing) newContent.push(existing);
          }
        }

        const { nodes, zones } = buildNodeIndex(
          newContent,
          state.data.zones || {}
        );

        return {
          ...state,
          data: {
            ...state.data,
            content: newContent,
          },
          indexes: { nodes, zones },
        };
      }

      case "reorder": {
        const { sourceIndex, destinationIndex, destinationZone } = action;
        const zoneId = destinationZone || rootDroppableId;
        const zoneData = state.indexes.zones[zoneId];

        if (!zoneData || sourceIndex < 0 || sourceIndex >= zoneData.contentIds.length) {
          return state;
        }

        const contentIds = [...zoneData.contentIds];
        const [movedId] = contentIds.splice(sourceIndex, 1);
        const actualDestIndex =
          destinationIndex > sourceIndex
            ? destinationIndex - 1
            : destinationIndex;
        contentIds.splice(actualDestIndex, 0, movedId);

        const newContent: ComponentData[] = [];
        for (const contentId of contentIds) {
          const item = state.indexes.nodes[contentId]?.data;
          if (item) newContent.push(item);
        }

        const { nodes, zones } = buildNodeIndex(
          newContent,
          state.data.zones || {}
        );

        return {
          ...state,
          data: {
            ...state.data,
            content: newContent,
          },
          indexes: { nodes, zones },
        };
      }

      case "move": {
        const { sourceIndex, sourceZone, destinationIndex, destinationZone } = action;
        const sourceZoneId = sourceZone || rootDroppableId;
        const destZoneId = destinationZone || rootDroppableId;

        const sourceZoneData = state.indexes.zones[sourceZoneId];
        const destZoneData = state.indexes.zones[destZoneId];

        if (
          !sourceZoneData ||
          sourceIndex < 0 ||
          sourceIndex >= sourceZoneData.contentIds.length
        ) {
          return state;
        }

        const movedId = sourceZoneData.contentIds[sourceIndex];
        const movedItem = state.indexes.nodes[movedId]?.data;

        if (!movedItem) return state;

        let newContent = [...state.data.content];

        // Remove from source
        if (sourceZoneId === rootDroppableId) {
          newContent = newContent.filter((item) => item.props.id !== movedId);
        }

        // Insert into destination
        if (destZoneId === rootDroppableId) {
          const destIndex =
            destinationIndex < 0
              ? newContent.length
              : Math.min(destinationIndex, newContent.length);
          newContent.splice(destIndex, 0, movedItem);
        }

        const { nodes, zones } = buildNodeIndex(
          newContent,
          state.data.zones || {}
        );

        return {
          ...state,
          data: {
            ...state.data,
            content: newContent,
          },
          indexes: { nodes, zones },
        };
      }

      case "setData": {
        const { data } = action;
        const newData =
          typeof data === "function" ? data(state.data) : { ...state.data, ...data };

        const { nodes, zones } = buildNodeIndex(
          newData.content || [],
          newData.zones || {}
        );

        return {
          ...state,
          data: newData as UserData,
          indexes: { nodes, zones },
        };
      }

      // -------------------------------------------------------------------------
      // UI Actions
      // -------------------------------------------------------------------------

      case "setUi": {
        const { ui } = action;
        const newUi =
          typeof ui === "function" ? ui(state.ui) : { ...state.ui, ...ui };
        return {
          ...state,
          ui: newUi as UiState,
        };
      }

      case "select": {
        const { selector } = action;
        return {
          ...state,
          ui: {
            ...state.ui,
            itemSelector: selector,
          },
        };
      }

      case "set": {
        const { state: newState } = action;
        const resolvedState =
          typeof newState === "function" ? newState(state) : { ...state, ...newState };
        return resolvedState as PrivateAppState<UserData>;
      }

      // -------------------------------------------------------------------------
      // Zone Actions
      // -------------------------------------------------------------------------

      case "registerZone": {
        const { zone, zoneType = "dropzone" } = action;
        const newZones = {
          ...state.indexes.zones,
          [zone]: { contentIds: [], type: zoneType },
        };
        return {
          ...state,
          indexes: {
            ...state.indexes,
            zones: newZones,
          },
        };
      }

      case "unregisterZone": {
        const { zone } = action;
        const { [zone]: _, ...remainingZones } = state.indexes.zones;
        return {
          ...state,
          indexes: {
            ...state.indexes,
            zones: remainingZones,
          },
        };
      }

      // -------------------------------------------------------------------------
      // History Actions
      // -------------------------------------------------------------------------

      case "history/back": {
        // Handled by external history slice
        return state;
      }

      case "history/forward": {
        // Handled by external history slice
        return state;
      }

      case "history/jump": {
        // Handled by external history slice
        return state;
      }

      case "history/clear": {
        // Handled by external history slice
        return state;
      }

      // -------------------------------------------------------------------------
      // Batch & Reset Actions
      // -------------------------------------------------------------------------

      case "batch": {
        let newState = state;
        for (const subAction of action.actions) {
          newState = createReducer<UserData>()(newState, subAction);
        }
        return newState as PrivateAppState<UserData>;
      }

      case "reset": {
        return action.initialState as PrivateAppState<UserData>;
      }

      default: {
        return state;
      }
    }
  };
}

// Export singleton reducer for convenience
export const puckReducer = createReducer();
