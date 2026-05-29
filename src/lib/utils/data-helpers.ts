// @ts-nocheck
// =============================================================================
// CANONICAL PUCK DATA-HELPERS
// Mirror of puck-main/packages/core/lib/data/flatten-data.ts
// Flatten/Map data helpers for component manipulation
// =============================================================================

import {ComponentData, Config, UserGenerics} from "@/types";
import {PrivateAppState} from "@/lib/types/Internal";
import {walkAppState} from "./walk-transform";

/**
 * Flatten all component data from the app state into a single array
 */
export const flattenData = <
  UserConfig extends Config = Config,
  G extends UserGenerics<UserConfig> = UserGenerics<UserConfig>
>(
  state: PrivateAppState,
  config: UserConfig
) => {
  const data: ComponentData[] = [];

  walkAppState(
    state,
    config,
    (content) => content,
    (item) => {
      data.push(item);
      return item;
    }
  );

  return data;
};

// =============================================================================
// ADDITIONAL DATA MANIPULATION HELPERS
// =============================================================================

/**
 * Deep clone component data
 */
export function cloneComponentData<T extends ComponentData>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

/**
 * Get all component IDs from state
 */
export function getAllComponentIds(
  state: PrivateAppState
): string[] {
  return Object.keys(state.indexes.nodes);
}

/**
 * Get components by type
 */
export function getComponentsByType(
  state: PrivateAppState,
  type: string
): ComponentData[] {
  return flattenData(state, {} as Config).filter(
    (item) => item.type === type
  );
}

/**
 * Find component by ID
 */
export function findComponentById(
  state: PrivateAppState,
  id: string
): ComponentData | undefined {
  return state.indexes.nodes[id]?.data;
}

/**
 * Get component count
 */
export function getComponentCount(state: PrivateAppState): number {
  return Object.keys(state.indexes.nodes).length;
}

/**
 * Check if component exists
 */
export function hasComponent(state: PrivateAppState, id: string): boolean {
  return id in state.indexes.nodes;
}

/**
 * Get root components (direct children of root)
 */
export function getRootComponents(
  state: PrivateAppState
): ComponentData[] {
  const rootZone = state.indexes.zones["root"];
  if (!rootZone) return [];
  
  return rootZone.contentIds.map(
    (id) => state.indexes.nodes[id]?.data
  ).filter(Boolean) as ComponentData[];
}

/**
 * Get component depth in tree
 */
export function getComponentDepth(
  state: PrivateAppState,
  id: string
): number {
  const node = state.indexes.nodes[id];
  if (!node) return 0;
  return node.path.length;
}

/**
 * Check if component is ancestor of another
 */
export function isAncestorOf(
  state: PrivateAppState,
  ancestorId: string,
  descendantId: string
): boolean {
  const descendant = state.indexes.nodes[descendantId];
  if (!descendant) return false;
  
  return descendant.path.some((p) => p.startsWith(`${ancestorId}:`));
}

/**
 * Get siblings of a component
 */
export function getSiblings(
  state: PrivateAppState,
  id: string
): ComponentData[] {
  const node = state.indexes.nodes[id];
  if (!node || !node.parentId) return [];
  
  const parentZone = state.indexes.zones[node.zone];
  if (!parentZone) return [];
  
  return parentZone.contentIds
    .filter((cid) => cid !== id)
    .map((cid) => state.indexes.nodes[cid]?.data)
    .filter(Boolean) as ComponentData[];
}

/**
 * Get children of a component (for slots/dropzones)
 */
export function getChildren(
  state: PrivateAppState,
  id: string,
  zoneName: string
): ComponentData[] {
  const zoneCompound = `${id}:${zoneName}`;
  const zone = state.indexes.zones[zoneCompound];
  if (!zone) return [];
  
  return zone.contentIds.map(
    (cid) => state.indexes.nodes[cid]?.data
  ).filter(Boolean) as ComponentData[];
}

/**
 * Map over all components with a transform function
 */
export function mapComponents<T>(
  state: PrivateAppState,
  transform: (component: ComponentData, id: string) => T
): T[] {
  return Object.entries(state.indexes.nodes).map(([id, node]) =>
    transform(node.data, id)
  );
}

/**
 * Filter components by a predicate
 */
export function filterComponents(
  state: PrivateAppState,
  predicate: (component: ComponentData, id: string) => boolean
): ComponentData[] {
  return Object.entries(state.indexes.nodes)
    .filter(([id, node]) => predicate(node.data, id))
    .map(([, node]) => node.data);
}

/**
 * Reduce over all components
 */
export function reduceComponents<T>(
  state: PrivateAppState,
  reducer: (acc: T, component: ComponentData, id: string) => T,
  initial: T
): T {
  return Object.entries(state.indexes.nodes).reduce(
    (acc, [id, node]) => reducer(acc, node.data, id),
    initial
  );
}
