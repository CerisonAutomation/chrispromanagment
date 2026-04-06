// =============================================================================
// DEFAULT APP STATE
// =============================================================================

import {AppState} from "../lib/types";

export const defaultAppState: AppState = {
  data: {
    content: [],
    root: {
      props: {},
    },
  },
  ui: {
    itemSelector: null,
    isDragging: false,
    section: "components",
    viewports: {
      current: { width: 375, label: "Mobile" },
    },
    field: {
      focus: null,
    },
  },
};
