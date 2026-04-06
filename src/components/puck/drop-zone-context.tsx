// =============================================================================
// CANONICAL PUCK DROP ZONE CONTEXT
// Mirror of puck-main/packages/core/components/DropZone/context.tsx
// =============================================================================

import {createContext, createElement, ReactNode, useContext,} from "react";
import {StoreApi} from "zustand";

export type Preview =
  | {
      type: "insert";
      componentType: string;
      zone: string;
      index: number;
      element?: HTMLElement;
      props: Record<string, any>;
    }
  | {
      type: "move";
      componentType: string;
      zone: string;
      index: number;
      element?: HTMLElement;
      props: Record<string, any>;
    };

export type RootVirtualizerHandle = {
  resolveIndex: (targetId: string | null) => number;
  virtualizer: any;
};

export type ZoneStore = {
  zoneDepthIndex: Record<string, boolean>;
  nextZoneDepthIndex: Record<string, boolean>;
  areaDepthIndex: Record<string, boolean>;
  nextAreaDepthIndex: Record<string, boolean>;
  draggedItem: any;
  previewIndex: Record<string, Preview>;
  enabledIndex: Record<string, boolean>;
  hoveringComponent: string | null;
  registerRootVirtualizer: (
    zoneCompound: string,
    handle: RootVirtualizerHandle
  ) => void;
  unregisterRootVirtualizer: (zoneCompound: string) => void;
  scrollToComponent: (id: string) => void;
};

export const ZoneStoreContext = createContext<StoreApi<ZoneStore> | null>(null);

export const ZoneStoreProvider = ({
  store,
  children,
}: {
  store: StoreApi<ZoneStore>;
  children: ReactNode;
}) => {
  return createElement(
    ZoneStoreContext.Provider,
    { value: store },
    children
  );
};

export const useZoneStore = <T = ZoneStore>(
  selector: (state: ZoneStore) => T
): T => {
  const store = useContext(ZoneStoreContext);
  
  if (!store) {
    throw new Error("useZoneStore must be used within ZoneStoreProvider");
  }
  
  return selector(store.getState());
};

export type DropZoneContext = {
  mode: "edit" | "preview";
  areaId: string;
  depth: number;
};

export const DropZoneContext = createContext<DropZoneContext>({
  mode: "edit",
  areaId: "root",
  depth: 0,
});

export const DropZoneProvider = DropZoneContext.Provider;
