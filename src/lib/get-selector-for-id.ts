"use client";

import {State} from "@/store/puck-editor-store";

export function getSelectorForId(
  state: State,
  id: string
): { zone: string; index: number } | null {
  const { indexes, zones } = state;
  const node = indexes.nodes[id];
  
  if (!node) return null;
  
  const { parentId, zone, index } = node;
  const zoneCompound = parentId ? `${parentId}:${zone}` : zone;
  const contentIds = zones[zoneCompound]?.contentIds || [];
  
  const itemIndex = contentIds.indexOf(id);
  
  return {
    zone: zoneCompound,
    index: itemIndex >= 0 ? itemIndex : index,
  };
}
