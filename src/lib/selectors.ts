/**
 * Data Selectors - Memoized selector functions for efficient state access
 * Part of the P2 data & state management implementation
 */

import type {AppState, ComponentData, Data, ItemSelector,} from "../types";
import {rootDroppableId} from "./root-droppable-id";
import type {NodeIndex, ZoneIndex, ZoneTypeEnum} from "../store/puck-reducer";

// =============================================================================
// Selector Types
// =============================================================================

/** Private app state with indexes */
export type PrivateAppState<UserData extends Data = Data> = AppState<UserData> & {
  indexes: {
    nodes: NodeIndex;
    zones: ZoneIndex;
  };
};

/** Selector function type */
export type Selector<T> = (state: PrivateAppState) => T;

/** Item selector with zone */
export type ItemSelector = {
  index: number;
  zone?: string;
};

// =============================================================================
// Basic Selectors
// =============================================================================

/** Select the entire data object */
export function selectData<UserData extends Data>(): Selector<UserData> {
  return (state) => state.data;
}

/** Select the content array */
export function selectContent<UserData extends Data>(): Selector<UserData["content"]> {
  return (state) => state.data.content;
}

/** Select the root data */
export function selectRoot<UserData extends Data>(): Selector<UserData["root"]> {
  return (state) => state.data.root;
}

/** Select the zones object */
export function selectZones<UserData extends Data>(): Selector<UserData["zones"]> {
  return (state) => state.data.zones;
}

/** Select the entire UI state */
export function selectUi(): Selector<AppState["ui"]> {
  return (state) => state.ui;
}

/** Select the item selector (currently selected item) */
export function selectItemSelector(): Selector<ItemSelector | null> {
  return (state) => state.ui.itemSelector;
}

/** Select the preview mode */
export function selectPreviewMode(): Selector<"edit" | "interactive"> {
  return (state) => state.ui.previewMode;
}

// =============================================================================
// Node & Zone Selectors
// =============================================================================

/** Select the node index */
export function selectNodes(): Selector<NodeIndex> {
  return (state) => state.indexes.nodes;
}

/** Select the zone index */
export function selectZonesIndex(): Selector<ZoneIndex> {
  return (state) => state.indexes.zones;
}

/** Select a specific node by ID */
export function selectNodeById(id: string): Selector<PrivateAppState["indexes"]["nodes"][string] | undefined> {
  return (state) => state.indexes.nodes[id];
}

/** Select all content IDs for a zone */
export function selectZoneContentIds(zone: string): Selector<string[]> {
  return (state) => state.indexes.zones[zone]?.contentIds || [];
}

/** Get the zone type */
export function selectZoneType(zone: string): Selector<ZoneTypeEnum | undefined> {
  return (state) => state.indexes.zones[zone]?.type;
}

// =============================================================================
// Item Retrieval Selectors
// =============================================================================

/**
 * Get an item by its selector (index + zone)
 * Returns the component data for the selected item
 */
export function getItem<UserData extends Data>(
  selector: ItemSelector,
  state: PrivateAppState<UserData>
): UserData["content"][0] | undefined {
  const zone = state.indexes.zones?.[selector.zone || rootDroppableId];
  
  if (!zone) return undefined;
  
  const contentId = zone.contentIds[selector.index];
  if (!contentId) return undefined;
  
  return state.indexes.nodes[contentId]?.data;
}

/**
 * Create a selector that gets the selected item
 */
export function selectSelectedItem<UserData extends Data>(): Selector<UserData["content"][0] | null> {
  return (state) => {
    if (!state.ui.itemSelector) return null;
    return getItem(state.ui.itemSelector, state) || null;
  };
}

/**
 * Get item by component ID
 */
export function getItemById<UserData extends Data>(
  id: string,
  state: PrivateAppState<UserData>
): UserData["content"][0] | undefined {
  return state.indexes.nodes[id]?.data;
}

/**
 * Create a selector that gets an item by ID
 */
export function selectItemById<UserData extends Data>(
  id: string
): Selector<UserData["content"][0] | undefined> {
  return (state) => state.indexes.nodes[id]?.data;
}

// =============================================================================
// Zone Query Selectors
// =============================================================================

/**
 * Find all zones for a given area/component
 * Returns zones that are children of the specified area
 */
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

/**
 * Selector to find zones for an area
 */
export function selectZonesForArea(
  areaId: string
): Selector<Array<{ zone: string; contentIds: string[]; type: ZoneTypeEnum }>> {
  return (state) => findZonesForArea(areaId, state.indexes.zones);
}

/**
 * Get the parent zone for a component
 */
export function getParentZone(
  componentId: string,
  state: PrivateAppState
): { zone: string; index: number } | null {
  const node = state.indexes.nodes[componentId];
  if (!node) return null;
  
  const zone = state.indexes.zones[node.zone];
  if (!zone) return null;
  
  const index = zone.contentIds.indexOf(componentId);
  return { zone: node.zone, index };
}

/**
 * Selector to get the parent zone for a component
 */
export function selectParentZone(
  componentId: string
): Selector<{ zone: string; index: number } | null> {
  return (state) => getParentZone(componentId, state);
}

// =============================================================================
// Child/Sibling Selectors
// =============================================================================

/**
 * Get children of a component (items in its slots)
 */
export function getChildren(
  componentId: string,
  state: PrivateAppState
): ComponentData[] {
  const childZoneIds = Object.keys(state.indexes.zones).filter(
    (zoneId) => zoneId.startsWith(`${componentId}:`)
  );
  
  const children: ComponentData[] = [];
  for (const zoneId of childZoneIds) {
    const zone = state.indexes.zones[zoneId];
    for (const contentId of zone.contentIds) {
      const node = state.indexes.nodes[contentId];
      if (node) {
        children.push(node.data);
      }
    }
  }
  
  return children;
}

/**
 * Selector to get children of a component
 */
export function selectChildren(
  componentId: string
): Selector<ComponentData[]> {
  return (state) => getChildren(componentId, state);
}

/**
 * Get siblings of a component (items in the same zone)
 */
export function getSiblings(
  componentId: string,
  state: PrivateAppState
): ComponentData[] {
  const node = state.indexes.nodes[componentId];
  if (!node) return [];
  
  const zone = state.indexes.zones[node.zone];
  if (!zone) return [];
  
  return zone.contentIds
    .filter((id) => id !== componentId)
    .map((id) => state.indexes.nodes[id]?.data)
    .filter((item): item is ComponentData => item !== undefined);
}

/**
 * Selector to get siblings of a component
 */
export function selectSiblings(
  componentId: string
): Selector<ComponentData[]> {
  return (state) => getSiblings(componentId, state);
}

/**
 * Get the previous sibling of a component
 */
export function getPrevSibling(
  componentId: string,
  state: PrivateAppState
): ComponentData | null {
  const siblings = getSiblings(componentId, state);
  const node = state.indexes.nodes[componentId];
  if (!node) return null;
  
  const zone = state.indexes.zones[node.zone];
  if (!zone) return null;
  
  const currentIndex = zone.contentIds.indexOf(componentId);
  if (currentIndex <= 0) return null;
  
  const prevId = zone.contentIds[currentIndex - 1];
  return state.indexes.nodes[prevId]?.data || null;
}

/**
 * Get the next sibling of a component
 */
export function getNextSibling(
  componentId: string,
  state: PrivateAppState
): ComponentData | null {
  const node = state.indexes.nodes[componentId];
  if (!node) return null;
  
  const zone = state.indexes.zones[node.zone];
  if (!zone) return null;
  
  const currentIndex = zone.contentIds.indexOf(componentId);
  if (currentIndex < 0 || currentIndex >= zone.contentIds.length - 1) return null;
  
  const nextId = zone.contentIds[currentIndex + 1];
  return state.indexes.nodes[nextId]?.data || null;
}

// =============================================================================
// Tree Selectors
// =============================================================================

/**
 * Get the path from root to a component
 * Returns array of component IDs representing the path
 */
export function getPath(
  componentId: string,
  state: PrivateAppState
): string[] {
  const path: string[] = [];
  let currentId: string | null = componentId;
  
  while (currentId) {
    path.unshift(currentId);
    const node = state.indexes.nodes[currentId];
    if (!node) break;
    
    if (node.parentId === null) {
      // Reached root
      break;
    }
    
    currentId = node.parentId;
  }
  
  return path;
}

/**
 * Selector to get the path to a component
 */
export function selectPath(
  componentId: string
): Selector<string[]> {
  return (state) => getPath(componentId, state);
}

/**
 * Get the depth of a component in the tree
 */
export function getDepth(
  componentId: string,
  state: PrivateAppState
): number {
  return getPath(componentId, state).length - 1;
}

/**
 * Selector to get the depth of a component
 */
export function selectDepth(
  componentId: string
): Selector<number> {
  return (state) => getDepth(componentId, state);
}

// =============================================================================
// Search & Filter Selectors
// =============================================================================

/**
 * Find all components of a specific type
 */
export function findByType<UserData extends Data>(
  type: string,
  state: PrivateAppState<UserData>
): UserData["content"] {
  return state.data.content.filter((item) => item.type === type);
}

/**
 * Selector to find components by type
 */
export function selectByType<UserData extends Data>(
  type: string
): Selector<UserData["content"]> {
  return (state) => findByType(type, state);
}

/**
 * Find components matching a predicate
 */
export function findWhere<UserData extends Data>(
  predicate: (item: UserData["content"][0]) => boolean,
  state: PrivateAppState<UserData>
): UserData["content"] {
  return state.data.content.filter(predicate);
}

/**
 * Selector to find components matching a predicate
 */
export function selectWhere<UserData extends Data>(
  predicate: (item: UserData["content"][0]) => boolean
): Selector<UserData["content"]> {
  return (state) => findWhere(predicate, state);
}

/**
 * Check if a component exists in the tree
 */
export function exists(
  componentId: string,
  state: PrivateAppState
): boolean {
  return componentId in state.indexes.nodes;
}

/**
 * Selector to check if a component exists
 */
export function selectExists(
  componentId: string
): Selector<boolean> {
  return (state) => exists(componentId, state);
}

// =============================================================================
// Aggregate Selectors
// =============================================================================

/**
 * Get the total count of components
 */
export function getTotalCount(
  state: PrivateAppState
): number {
  return Object.keys(state.indexes.nodes).length;
}

/**
 * Selector to get total component count
 */
export function selectTotalCount(): Selector<number> {
  return (state) => Object.keys(state.indexes.nodes).length;
}

/**
 * Get count of components by type
 */
export function getCountByType(
  state: PrivateAppState
): Record<string, number> {
  const counts: Record<string, number> = {};
  
  for (const item of state.data.content) {
    counts[item.type] = (counts[item.type] || 0) + 1;
  }
  
  return counts;
}

/**
 * Selector to get component counts by type
 */
export function selectCountByType(): Selector<Record<string, number>> {
  return (state) => getCountByType(state);
}

// =============================================================================
// Export all selectors as a named object
// =============================================================================

export const selectors = {
  // Basic
  selectData,
  selectContent,
  selectRoot,
  selectZones,
  selectUi,
  selectItemSelector,
  selectPreviewMode,
  
  // Node & Zone
  selectNodes,
  selectZonesIndex,
  selectNodeById,
  selectZoneContentIds,
  selectZoneType,
  
  // Item retrieval
  selectSelectedItem,
  selectItemById,
  
  // Zone queries
  selectZonesForArea,
  selectParentZone,
  
  // Child/Sibling
  selectChildren,
  selectSiblings,
  
  // Tree
  selectPath,
  selectDepth,
  
  // Search & Filter
  selectByType,
  selectWhere,
  selectExists,
  
  // Aggregate
  selectTotalCount,
  selectCountByType,
};

export default selectors;
