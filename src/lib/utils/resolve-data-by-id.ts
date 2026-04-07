// =============================================================================
// RESOLVE DATA BY ID UTILITY
// =============================================================================

import {ResolveDataTrigger} from "@/types";

export function resolveDataById(
  id: string,
  getState: () => { config: any; state: any },
  trigger?: ResolveDataTrigger
) {
  const { config, state } = getState();
  const node = state.indexes?.nodes?.[id];

  if (!node) {
    return;
  }

  const componentConfig = config.components?.[node.data.type];

  if (!componentConfig?.resolveData) {
    return;
  }

  componentConfig.resolveData({
    data: node.data.props,
    trigger: trigger || "force",
  });
}
