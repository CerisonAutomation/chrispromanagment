// =============================================================================
// CANONICAL PUCK COLLISION STORE
// Dynamic collision algorithm for nested drops
// =============================================================================

import {create} from "zustand";

export const collisionStore = create<{
  fallbackEnabled: boolean;
  setFallbackEnabled: (enabled: boolean) => void;
}>((set) => ({
  fallbackEnabled: true,
  setFallbackEnabled: (enabled) => set({ fallbackEnabled: enabled }),
}));
