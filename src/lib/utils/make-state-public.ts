// =============================================================================
// MAKE STATE PUBLIC UTILITY
// Mirror of puck-main/packages/core/lib/data/make-state-public.ts
// =============================================================================

import {PrivateAppState} from "../../types/Internal";
import {AppState} from "../../types";

/**
 * Convert private app state to public app state
 */
export function makeStatePublic(
  state: PrivateAppState
): AppState {
  return {
    ...state,
    // Remove internal indexes, keeping only public data
  } as AppState;
}
