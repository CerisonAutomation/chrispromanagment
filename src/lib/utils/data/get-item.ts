// =============================================================================
// GET ITEM UTILITY
// Mirror of puck-main/packages/core/lib/data/get-item.ts
// =============================================================================

import {PrivateAppState} from "@/lib/types/Internal";

/**
 * Get a component by its item selector
 */
export function getItem(
  itemSelector: { zone: string; index: number },
  state: PrivateAppState
) {
  const zone = state.indexes.zones[itemSelector.zone];

  if (!zone) {
    return undefined;
  }

  const id = zone.contentIds[itemSelector.index];

  if (!id) {
    return undefined;
  }

  return state.indexes.nodes[id]?.data;
}

/**
 * Get the item selector for a component by its ID
 */
export function getSelectorForId(
  state: PrivateAppState,
  id: string
): { zone: string; index: number } | undefined {
  const node = state.indexes.nodes[id];

  if (!node) {
    return undefined;
  }

  const zone = state.indexes.zones[node.zone];

  if (!zone) {
    return undefined;
  }

  const index = zone.contentIds.indexOf(id);

  if (index === -1) {
    return undefined;
  }

  return {
    zone: node.zone,
    index,
  };
}
