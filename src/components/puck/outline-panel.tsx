"use client";

import {forwardRef, memo, useCallback, useMemo, useState} from "react";
import {useAppStore} from "@/store/puck-editor-store";
import getClassNameFactory from "@/lib/get-class-name-factory";
import styles from "./styles.module.css";
import {ChevronDown, ChevronRight, Layers, LayoutGrid, Type} from "lucide-react";

const getClassName = getClassNameFactory("LayerTree", styles);
const getLayerClassName = getClassNameFactory("Layer", styles);

export type LayerZoneTree = {
  items: LayerNodeTree[];
  label?: string;
  zoneCompound: string;
};

export type LayerNodeTree = {
  childZones: LayerZoneTree[];
  componentType: string;
  index: number;
  itemId: string;
  label: string;
  zoneCompound: string;
};

export type OutlinePanelProps = {
  onSelectItem?: (itemId: string, zoneCompound: string, index: number) => void;
  selectedId?: string | null;
  className?: string;
};

// Build layer tree from state - extracted and memoized outside component
const buildLayerTree = (
  config: any, 
  nodes: any, 
  zones: any, 
  zoneCompound: string
): LayerZoneTree => {
  const contentIds = zones[zoneCompound]?.contentIds ?? [];
  
  return {
    items: contentIds.map((itemId: string, index: number) => {
      const nodeData = nodes[itemId];
      const componentType = nodeData?.data?.type?.toString() || "Component";
      const label = config.components?.[componentType]?.label ?? componentType;
      
      const childZoneCompounds = Object.keys(zones).filter((z) => {
        const [parentId] = z.split(":");
        return parentId === itemId;
      });
      
      return {
        childZones: childZoneCompounds.map((childZoneCompound) =>
          buildLayerTree(config, nodes, zones, childZoneCompound)
        ),
        componentType,
        index,
        itemId,
        label,
        zoneCompound,
      };
    }),
    zoneCompound,
  };
};

// Get node icon based on component type - memoized
const getNodeIcon = (componentType: string) => {
  const textComponents = ["text", "heading", "paragraph", "typography"];
  if (textComponents.some((t) => componentType.toLowerCase().includes(t))) {
    return <Type size={14} />;
  }
  return <LayoutGrid size={14} />;
};

// Single layer item - fully memoized with custom comparison
const LayerItem = memo(forwardRef<HTMLLIElement, {
  node: LayerNodeTree;
  depth: number;
  isSelected: boolean;
  selectedPathIds: Set<string>;
  onSelect: (itemId: string, zoneCompound: string, index: number) => void;
}>(({ node, isSelected, selectedPathIds, onSelect }, ref) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const containsZone = node.childZones.length > 0;
  const hasSelectedChild = useMemo(
    () => node.childZones.some((zone) =>
      zone.items.some((item) => selectedPathIds.has(item.itemId))
    ),
    [node.childZones, selectedPathIds]
  );

  const handleClick = useCallback(() => {
    onSelect(node.itemId, node.zoneCompound, node.index);
  }, [node.itemId, node.zoneCompound, node.index, onSelect]);

  const handleToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded((prev) => !prev);
  }, []);

  const icon = useMemo(() => getNodeIcon(node.componentType), [node.componentType]);

  return (
    <li
      ref={ref}
      className={getLayerClassName({
        isSelected,
        containsZone,
        childIsSelected: hasSelectedChild,
      })}
      data-layer-id={node.itemId}
    >
      <div className={getLayerClassName("inner")}>
        <button
          type="button"
          className={getLayerClassName("clickable")}
          onClick={handleClick}
        >
          {containsZone && (
            <button
              type="button"
              className={getLayerClassName("chevron")}
              onClick={handleToggle}
            >
              {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            </button>
          )}
          <div className={getLayerClassName("icon")}>
            {icon}
          </div>
          <div className={getLayerClassName("name")}>{node.label}</div>
        </button>
      </div>
      
      {containsZone && isExpanded && (
        <div className={getLayerClassName("zones")}>
          {node.childZones.map((childZone) => (
            <div key={childZone.zoneCompound} className={getLayerClassName("zone")}>
              {childZone.label && (
                <div className={getClassName("zoneTitle")}>
                  <div className={getClassName("zoneIcon")}>
                    <Layers size={12} />
                  </div>
                  <span>{childZone.label}</span>
                </div>
              )}
              <LayerTree
                tree={childZone}
                depth={1}
                selectedId={null}
                selectedPathIds={selectedPathIds}
                onSelect={onSelect}
              />
            </div>
          ))}
        </div>
      )}
    </li>
  );
}), (prevProps, nextProps) => {
  // Custom comparison for better memoization
  return (
    prevProps.node.itemId === nextProps.node.itemId &&
    prevProps.node.label === nextProps.node.label &&
    prevProps.node.childZones.length === nextProps.node.childZones.length &&
    prevProps.isSelected === nextProps.isSelected
  );
});

LayerItem.displayName = "LayerItem";

// Layer tree component - memoized
const LayerTree = memo(function LayerTree({
  tree,
  depth,
  selectedId,
  selectedPathIds,
  onSelect,
}: {
  tree: LayerZoneTree;
  depth: number;
  selectedId: string | null;
  selectedPathIds: Set<string>;
  onSelect: (itemId: string, zoneCompound: string, index: number) => void;
}) {
  if (tree.items.length === 0) {
    return (
      <ul className={getClassName()}>
        <li className={getClassName("helper")}>No items</li>
      </ul>
    );
  }

  return (
    <ul className={getClassName()}>
      {tree.items.map((node) => (
        <LayerItem
          key={node.itemId}
          node={node}
          depth={depth}
          isSelected={selectedId === node.itemId}
          selectedPathIds={selectedPathIds}
          onSelect={onSelect}
        />
      ))}
    </ul>
  );
});

export const OutlinePanel = ({
  onSelectItem,
  selectedId: controlledSelectedId,
  className,
}: OutlinePanelProps) => {
  const config = useAppStore((s) => s.config);
  const state = useAppStore((s) => s.state);
  const dispatch = useAppStore((s) => s.dispatch);

  // Memoize selection computation
  const { selectedId, selectedPathIds } = useMemo(() => {
    const itemSelector = state.ui.itemSelector;
    if (!itemSelector) {
      return { selectedId: null, selectedPathIds: new Set<string>() };
    }

    const { indexes } = state;
    const selectedItemId = indexes.nodesArray.find(
      (n) => n.zone === itemSelector.zone && n.index === itemSelector.index
    )?.id;

    // Build path IDs
    const pathIds = new Set<string>();
    let currentId = selectedItemId;
    while (currentId) {
      pathIds.add(currentId);
      currentId = indexes.nodes[currentId]?.parentId;
    }

    return {
      selectedId: selectedItemId || null,
      selectedPathIds: pathIds,
    };
  }, [state.ui.itemSelector, state.indexes]);

  // Build tree - memoized
  const tree = useMemo(() => {
    return buildLayerTree(config, state.indexes.nodes, state.zones, "root");
  }, [config, state.indexes.nodes, state.zones]);

  const handleSelect = useCallback(
    (itemId: string, zoneCompound: string, index: number) => {
      if (onSelectItem) {
        onSelectItem(itemId, zoneCompound, index);
      } else {
        dispatch({
          type: "setUi",
          ui: { itemSelector: { zone: zoneCompound, index } },
        });
      }
    },
    [onSelectItem, dispatch]
  );

  return (
    <div className={getClassName(null, className)}>
      {tree.items.length > 0 ? (
        <LayerTree
          tree={tree}
          depth={0}
          selectedId={controlledSelectedId ?? selectedId}
          selectedPathIds={selectedPathIds}
          onSelect={handleSelect}
        />
      ) : (
        <div className={getClassName("empty")}>
          <p>No components on this page</p>
        </div>
      )}
    </div>
  );
};
