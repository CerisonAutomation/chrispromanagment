// =============================================================================
// INSERT COMPONENT UTILITY
// =============================================================================

import {AppStore} from "../store";

export function insertComponent(
  componentType: string,
  zone: string,
  index: number,
  appStore: AppStore
) {
  const { dispatch } = appStore;
  
  dispatch({
    type: "insert",
    componentType,
    zone,
    index,
  });
}
