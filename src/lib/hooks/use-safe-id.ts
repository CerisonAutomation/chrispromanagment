// =============================================================================
// CANONICAL PUCK USE-SAFE-ID HOOK
// Mirror of puck-main/packages/core/lib/use-safe-id.ts
// SSR-safe ID generation
// =============================================================================

import React, {useState} from "react";
import {generateId} from "../generate-id";

export const useSafeId = () => {
  if (typeof React.useId !== "undefined") {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return React.useId();
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [id] = useState(generateId());

  return id;
};
