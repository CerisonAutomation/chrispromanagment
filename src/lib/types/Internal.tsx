// =============================================================================
// CANONICAL PUCK INTERNAL TYPES
// =============================================================================

import {ComponentData, Data, ZoneType} from "./Data";


export type NodeIndexEntry = {
  data: ComponentData;
  flatData: ComponentData;
  path: string[];
  parentId: string | null;
  zone: string;
};

export type NodeIndex = Record<string, NodeIndexEntry>;

export type ZoneIndexEntry = {
  contentIds: string[];
  type: ZoneType;
};

export type ZoneIndex = Record<string, ZoneIndexEntry>;

export type PrivateAppState<UserData extends Data = Data> = {
  data: UserData;
  indexes: {
    nodes: NodeIndex;
    zones: ZoneIndex;
  };
};
export type { ZoneType } from "./Data";
