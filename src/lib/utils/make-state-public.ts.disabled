// =============================================================================
// MAKE STATE PUBLIC UTILITY
// Mirror of puck-main/packages/core/lib/data/make-state-public.ts
// =============================================================================

import {PrivateAppState} from "@/lib/types/Internal";
import {AppState} from "@/types";

/**
 * Convert private app state to public app state
 */
export function makeStatePublic(
  state: PrivateAppState
): AppState {
  return {
    data: state.data,
    ui: {
      selected: { id: null },
      dragging: { id: null },
      hovering: { id: null },
      section: "components",
      media: { isOpen: false },
      history: { canUndo: false, canRedo: false },
      itemSelector: null,
      isDragging: false,
      field: { focus: null },
    },
  };
}
