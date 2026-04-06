// =============================================================================
// GET ITEM UTILITY
// Mirror of puck-main/packages/core/lib/data/get-item.ts
// =============================================================================

import {ItemSelector} from "./get-item";
import {PrivateAppState} from "../../types/Internal";

export type ItemSelector = {
  zone: string;
  index: number;
};

/**
 * Get a component by its item selector
 */
export function getItem(
  itemSelector: ItemSelector,
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
): Required<ItemSelector> | undefined {
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
