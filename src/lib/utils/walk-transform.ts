// =============================================================================
// CANONICAL PUCK WALK-TRANSFORM UTILITIES
// Mirror of puck-main/packages/core/lib/data/walk-tree.ts and walk-app-state.ts
// Data traversal helpers for component trees
// =============================================================================

import {ComponentData, Config, Content, Data, RootData, UserGenerics,} from "@/types";
import {mapFields} from "./map-fields";
import {rootDroppableId} from "../root-droppable-id";
import {forRelatedZones} from "./for-related-zones";
import {flattenNode} from "./flatten-node";
import {toComponent} from "./to-component";
import {NodeIndex, PrivateAppState, ZoneIndex, ZoneType,} from "@/lib/types/Internal";

type WalkTreeOptions = {
  parentId: string;
  propName: string;
};

/**
 * Walk through the component tree and transform data
 */
export function walkTree<
  T extends ComponentData | RootData | G["UserData"],
  UserConfig extends Config = Config,
  G extends UserGenerics<UserConfig> = UserGenerics<UserConfig>
>(
  data: T,
  config: UserConfig,
  callbackFn: (data: Content, options: WalkTreeOptions) => Content | null | void
): T {
  const walkItem = <
    ItemType extends
      | G["UserComponentData"]
      | G["UserData"]["root"]
      | G["UserData"]
  >(
    item: ItemType
  ): ItemType => {
    return mapFields(
      item as ComponentData,
      {
        slot: ({ value, parentId, propName }) => {
          const content = value as Content;
          return callbackFn(content, { parentId, propName }) ?? content;
        },
      },
      config as any,
      true
    ) as ItemType;
  };

  if ("props" in data) {
    return walkItem(data as any) as T;
  }

  const _data = data as G["UserData"];
  const zones = _data.zones ?? {};

  const mappedContent = _data.content.map(walkItem) as ComponentData[];

  return {
    root: walkItem(_data.root),
    content:
      callbackFn(mappedContent, {
        parentId: "root",
        propName: "default-zone",
      }) ?? mappedContent,
    zones: Object.keys(zones).reduce(
      (acc, zoneCompound) => ({
        ...acc,
        [zoneCompound]: zones[zoneCompound].map(walkItem),
      }),
      {}
    ),
  } as T;
}

/**
 * Walk the Puck state, generate indexes and make modifications to nodes.
 */
export function walkAppState<UserData extends Data = Data>(
  state: PrivateAppState<UserData>,
  config: Config,
  mapContent: (
    content: Content,
    zoneCompound: string,
    zoneType: ZoneType
  ) => Content | void = (content) => content,
  mapNodeOrSkip: (
    item: ComponentData,
    path: string[],
    index: number
  ) => ComponentData | null = (item) => item
): PrivateAppState<UserData> {
  let newZones: Record<string, Content> = {};
  const newZoneIndex: ZoneIndex = {};
  const newNodeIndex: NodeIndex = {};

  const processContent = (
    path: string[],
    zoneCompound: string,
    content: Content,
    zoneType: ZoneType,
    newId?: string
  ): [string, Content] => {
    const [parentId] = zoneCompound.split(":");
    const mappedContent =
      (mapContent(content, zoneCompound, zoneType) ?? content) || [];

    const [_, zone] = zoneCompound.split(":");
    const newZoneCompound = `${newId || parentId}:${zone}`;

    const newContent = mappedContent.map((zoneChild, index) =>
      processItem(zoneChild, [...path, newZoneCompound], index)
    );

    newZoneIndex[newZoneCompound] = {
      contentIds: newContent.map((item) => item.props.id),
      type: zoneType,
    };

    return [newZoneCompound, newContent];
  };

  const processRelatedZones = (
    item: ComponentData,
    newId: string,
    initialPath: string[]
  ) => {
    forRelatedZones(
      item,
      state.data,
      (relatedPath, relatedZoneCompound, relatedContent) => {
        const [zoneCompound, newContent] = processContent(
          [relatedPath],
          relatedZoneCompound,
          relatedContent,
          "dropzone",
          newId
        );

        newZones[zoneCompound] = newContent;
      },
      initialPath
    );
  };

  const processItem = (
    item: ComponentData,
    path: string[],
    index: number
  ): ComponentData => {
    const mappedItem = mapNodeOrSkip(item, path, index);

    if (!mappedItem) return item;

    const id = mappedItem.props.id;

    const newProps = {
      ...mapFields(
        mappedItem,
        {
          slot: ({ value, parentId, propPath }) => {
            const content = value as Content;
            const zoneCompound = `${parentId}:${propPath}`;

            const [_, newContent] = processContent(
              path,
              zoneCompound,
              content,
              "slot",
              parentId
            );

            return newContent;
          },
        },
        config
      ).props,
      id,
    };

    processRelatedZones(item, id, path);

    const newItem = { ...mappedItem, props: newProps };

    const thisZoneCompound = path[path.length - 1];
    const [parentId, zone] = thisZoneCompound
      ? thisZoneCompound.split(":")
      : [null, ""];

    newNodeIndex[id] = {
      data: newItem,
      flatData: flattenNode(newItem, config) as ComponentData,
      path,
      parentId,
      zone,
    };

    const finalData: any = { ...newItem, props: { ...newItem.props } };

    if (newProps.id === "root") {
      delete finalData["type"];
      delete finalData.props["id"];
    }

    return finalData;
  };

  const zones = state.data.zones || {};

  const [_, newContent] = processContent(
    [],
    rootDroppableId,
    state.data.content,
    "root"
  );

  const processedContent = newContent;

  const zonesAlreadyProcessed = Object.keys(newZones);

  Object.keys(zones || {}).forEach((zoneCompound) => {
    const [parentId] = zoneCompound.split(":");

    if (zonesAlreadyProcessed.includes(zoneCompound)) {
      return;
    }

    const [_, newContent] = processContent(
      [rootDroppableId],
      zoneCompound,
      zones[zoneCompound],
      "dropzone",
      parentId
    );

    newZones[zoneCompound] = newContent;
  }, newZones);

  let rootAsComponent: ComponentData = toComponent({
    props: { ...(state.data.root.props ?? state.data.root) },
  });

  if (state.data.root.readOnly) {
    rootAsComponent.readOnly = state.data.root.readOnly;
  }

  const processedRoot = processItem(rootAsComponent, [], -1);

  const root = {
    ...state.data.root,
    ...processedRoot,
  } as any;

  return {
    ...state,
    data: {
      root,
      content: processedContent,
      zones: {
        ...state.data.zones,
        ...newZones,
      },
    } as UserData,
    indexes: {
      nodes: { ...state.indexes.nodes, ...newNodeIndex },
      zones: { ...state.indexes.zones, ...newZoneIndex },
    },
  };
}
