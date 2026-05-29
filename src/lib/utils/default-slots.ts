// @ts-nocheck
// =============================================================================
// DEFAULT SLOTS UTILITY
// =============================================================================

import {Fields} from "@/types";

export function defaultSlots(
  props: Record<string, any>,
  fields: Fields
): Record<string, any> {
  const newProps = { ...props };

  Object.keys(fields).forEach((key) => {
    const field = fields[key];
    
    if (field.type === "slot" && !(key in newProps)) {
      newProps[key] = [];
    }
  });

  return newProps;
}
