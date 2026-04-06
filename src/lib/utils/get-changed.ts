// =============================================================================
// GET CHANGED UTILITY
// Mirror of puck-main/packages/core/lib/get-changed.ts
// =============================================================================

import {ComponentData} from "../../types";

type Changed = Record<string, boolean>;

/**
 * Compare two component data objects and return which fields changed
 */
export function getChanged(
  newData: ComponentData,
  oldData: ComponentData | null | undefined
): Changed {
  if (!oldData) {
    return Object.keys(newData.props || {}).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {}
    );
  }

  const changed: Changed = {};

  const newProps = newData.props || {};
  const oldProps = oldData.props || {};

  const allKeys = new Set([...Object.keys(newProps), ...Object.keys(oldProps)]);

  allKeys.forEach((key) => {
    if (JSON.stringify(newProps[key]) !== JSON.stringify(oldProps[key])) {
      changed[key] = true;
    }
  });

  return changed;
}
