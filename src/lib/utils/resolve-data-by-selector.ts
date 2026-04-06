// =============================================================================
// RESOLVE DATA BY SELECTOR UTILITY
// =============================================================================

import {ItemSelector, ResolveDataTrigger} from "../../types";
import {useAppStoreApi} from "../../store";
import {getItem} from "./get-item";

export function resolveDataBySelector(
  selector: ItemSelector,
  getState: ReturnType<typeof useAppStoreApi>["getState"],
  trigger?: ResolveDataTrigger
) {
  const item = getItem(selector, getState().state);

  if (!item) {
    return;
  }

  const { config } = getState();
  const componentConfig = config.components[item.type];

  if (!componentConfig?.resolveData) {
    return;
  }

  componentConfig.resolveData({
    data: item.props,
    trigger: trigger || "force",
  });
}
