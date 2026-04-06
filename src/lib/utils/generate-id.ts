// =============================================================================
// GENERATE ID UTILITY
// Mirror of puck-main/packages/core/lib/generate-id.ts
// =============================================================================

import {v4 as uuidv4} from "uuid";

export const generateId = (type?: string | number) =>
  type ? `${type}-${uuidv4()}` : uuidv4();
