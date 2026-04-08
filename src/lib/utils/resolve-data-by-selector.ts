// @ts-nocheck
// =============================================================================
// RESOLVE DATA BY SELECTOR UTILITY
// =============================================================================

import {ItemSelector, ResolveDataTrigger} from "@/types";
import {getItem} from "./data/get-item";

export function resolveDataBySelector(
  selector: ItemSelector,
  getState: () => { config: any; state: any },
  trigger?: ResolveDataTrigger
) {
  const { config, state } = getState();
  const item = getItem(selector as any, state);

  if (!item) {
    return;
  }

  const { config: storeConfig } = getState();
  const componentConfig = storeConfig.components?.[item.type];

  if (!componentConfig?.resolveData) {
    return;
  }

  componentConfig.resolveData({
    data: item.props,
    trigger: trigger || "force",
  });
}
