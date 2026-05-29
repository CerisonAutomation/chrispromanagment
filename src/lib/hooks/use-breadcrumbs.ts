// @ts-nocheck
// =============================================================================
// CANONICAL PUCK USE-BREADCRUMBS HOOK
// Mirror of puck-main/packages/core/lib/use-breadcrumbs.ts
// =============================================================================

import {useMemo} from "react";
import {useAppStore, useAppStoreApi} from "@/store/app-store-context";
import {ItemSelector} from "../utils/data/get-item";

export type Breadcrumb = {
  label: string;
  selector: ItemSelector | null;
  zoneCompound?: string;
};

export const useBreadcrumbs = (renderCount?: number) => {
  const selectedId = useAppStore((s) => s.selectedItem?.props.id);
  const config = useAppStore((s) => s.config);
  const path = useAppStore((s) => selectedId ? s.state.indexes.nodes[selectedId]?.path : undefined);
  const appStore = useAppStoreApi();

  return useMemo<Breadcrumb[]>(() => {
    const breadcrumbs =
      path?.map((zoneCompound) => {
        const [componentId] = zoneCompound.split(":");

        if (componentId === "root") {
          return {
            label: "Page",
            selector: null,
          };
        }

        const node = appStore.state.indexes.nodes[componentId];
        const parentId = node?.path[node?.path.length - 1];
        const contentIds =
          appStore.state.indexes.zones[parentId]?.contentIds || [];
        const index = contentIds.indexOf(componentId);

        const label = node
          ? config.components[node.data.type]?.label ?? node.data.type
          : "Component";

        return {
          label,
          selector: node
            ? {
                index,
                zone: node.path[node.path.length - 1],
              }
            : null,
        };
      }) || [];

    if (renderCount) {
      return breadcrumbs.slice(breadcrumbs.length - renderCount);
    }

    return breadcrumbs;
  }, [path, renderCount, config, appStore]);
};
