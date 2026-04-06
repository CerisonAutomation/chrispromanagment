// =============================================================================
// MOVE COMPONENT UTILITY
// =============================================================================

import {AppStore} from "../store";
import {ItemSelector, Preview} from "../components/puck/drop-zone-context";

export function moveComponent(
  id: string,
  from: ItemSelector,
  to: Preview,
  appStore: AppStore
) {
  const { dispatch } = appStore;
  
  dispatch({
    type: "move",
    id,
    from,
    to,
  });
}
