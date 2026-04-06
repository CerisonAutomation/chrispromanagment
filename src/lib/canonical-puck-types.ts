"use client";

// =============================================================================
// CANONICAL PUCK TYPES - Complete Type Safety
// Mirror of puck-main/packages/core/types/ with 100% TypeScript coverage
// =============================================================================

import React, {CSSProperties, ReactElement, ReactNode} from "react";

// =============================================================================
// CORE UTILITY TYPES
// =============================================================================

/** Unknown-safe unknown type for truly unknown data */
type Unknown = unknown;

/** Generic object type for flexible but safe object handling */
type GenericObject = Record<string, Unknown>;

/** Array of unknown items */
type UnknownArray = Unknown[];

/** Nullable type helper */
type Nullable<T> = T | null | undefined;

/** Index signature for dynamic keys */
type Indexable<T = Unknown> = {
  [key: string]: T;
};

// =============================================================================
// FIELD TYPES
// =============================================================================

type FieldOption = {
  label: string;
  value: string | number | boolean | undefined | null | object;
};

type FieldOptions = Array<FieldOption> | ReadonlyArray<FieldOption>;

export interface BaseField {
  label?: string;
  labelIcon?: React.ReactElement;
  visible?: boolean;
  metadata?: { description?: string };
}

export interface TextField extends BaseField {
  type: "text";
  placeholder?: string;
  contentEditable?: boolean;
}

export interface NumberField extends BaseField {
  type: "number";
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
}

export interface TextareaField extends BaseField {
  type: "textarea";
  placeholder?: string;
  contentEditable?: boolean;
}

export interface SelectField extends BaseField {
  type: "select";
  options: FieldOptions;
  placeholder?: string;
}

export interface RadioField extends BaseField {
  type: "radio";
  options: FieldOptions;
}

export interface CheckboxField extends BaseField {
  type: "checkbox";
}

export interface DateField extends BaseField {
  type: "date";
  placeholder?: string;
}

export interface HiddenField extends BaseField {
  type: "hidden";
}

export interface ArrayField<ItemProps extends Indexable = Indexable> extends BaseField {
  type: "array";
  arrayFields: Fields<ItemProps>;
  label?: string;
  defaultItemProps?: Partial<ItemProps>;
  labelSingular?: string;
  minItems?: number;
  maxItems?: number;
}

export interface CustomField<T = Unknown> extends BaseField {
  type: "custom";
  key?: string;
  render?: (props: CustomFieldRenderProps<T>) => ReactNode;
}

export interface CustomFieldRenderProps<T = Unknown> {
  name: string;
  value: T;
  onChange: (value: T) => void;
  field: CustomField<T>;
  readOnly: boolean;
}

export interface GroupField extends BaseField {
  type: "group";
  group: Fields;
  defaultProps?: Record<string, Unknown>;
}

export interface UploadField extends BaseField {
  type: "upload";
}

export interface SlotField extends BaseField {
  type: "slot";
}

export interface ExternalField<Item = Unknown> extends BaseField {
  type: "external";
  fetchList?: (params: ExternalFetchParams) => Promise<ExternalListItem[]>;
  getItemSummary?: (item: ExternalListItem) => string;
  placeholder?: string;
  showSearch?: boolean;
  initialFilters?: Indexable;
  initialQuery?: string;
  mapProp?: (item: ExternalListItem) => Item;
  mapRow?: (item: ExternalListItem) => ExternalListItem;
  filterFields?: Fields;
  cache?: { enabled: boolean };
  renderFooter?: (props: ExternalFooterProps) => ReactNode;
}

export interface ExternalFetchParams {
  query: string;
  filters: Indexable;
}

export interface ExternalListItem {
  id: string;
  [key: string]: Unknown;
}

export interface ExternalFooterProps {
  items: ExternalListItem[];
}

export interface RichtextField extends BaseField {
  type: "richtext";
  placeholder?: string;
  options?: Indexable;
  renderMenu?: React.ComponentType<RichtextMenuProps>;
  renderInlineMenu?: React.ComponentType<RichtextMenuProps>;
}

export interface RichtextMenuProps {
  editor: Unknown;
}

export type AnyField =
  | TextField
  | NumberField
  | TextareaField
  | SelectField
  | RadioField
  | CheckboxField
  | DateField
  | HiddenField
  | ArrayField
  | CustomField
  | GroupField
  | UploadField
  | SlotField
  | ExternalField
  | RichtextField;

export type Field = AnyField;

export type Fields<T extends Indexable = DefaultComponentProps, UserField = Indexable> = {
  [key: string]: AnyField | UserField;
};

// =============================================================================
// COMPONENT TYPES
// =============================================================================

export interface DefaultComponentProps extends Indexable {
  id?: string;
}

export type PuckComponent<Props extends Indexable = DefaultComponentProps> = (
  props: Props & {
    id: string;
  }
) => ReactNode;

export type SlotComponent = (props?: {
  zone?: string;
  [key: string]: Unknown;
}) => ReactNode;

export type ResolveDataTrigger = "insert" | "replace" | "load" | "force" | "move";

export type Permissions = {
  delete?: boolean;
  copy?: boolean;
  drag?: boolean;
  edit?: boolean;
  duplicate?: boolean;
  insert?: boolean;
};

export type FieldTransforms = Indexable<FieldTransformFn>;

export type FieldTransformFn = (params: FieldTransformParams) => Unknown;

export interface FieldTransformParams {
  value: Unknown;
  onChange: (value: Unknown) => void;
  field: Field;
}

export type ComponentConfig<
  RenderProps extends DefaultComponentProps = DefaultComponentProps,
  FieldProps extends DefaultComponentProps = RenderProps,
  DataShape extends Indexable = Indexable,
> = {
  render: PuckComponent<RenderProps>;
  label?: string;
  category?: string;
  defaultProps?: Partial<FieldProps>;
  fields?: Fields<FieldProps>;
  permissions?: Partial<Permissions>;
  inline?: boolean;
  resolveFields?: (args: { data?: DataShape; name?: string }) => Promise<Fields<FieldProps>>;
  resolveData?: (args: {
    data: DataShape;
    trigger: ResolveDataTrigger;
  }) => Promise<DataShape>;
  resolvePermissions?: (args: {
    data: DataShape;
    changed?: Indexable<boolean>;
    lastPermissions?: Permissions | null;
    permissions?: Permissions;
    lastData?: DataShape | null;
    parent?: ComponentData | null;
  }) => Promise<Permissions>;
  metadata?: ComponentMetadata;
};

export interface ComponentMetadata extends Indexable {
  description?: string;
  aiHint?: string;
  nonDeterministic?: boolean;
}

// =============================================================================
// ROOT CONFIG
// =============================================================================

export type RootRender = (props: {
  children?: ReactNode;
  title?: string;
}) => ReactNode;

export type RootConfig<RootProps extends DefaultComponentProps = DefaultComponentProps> = {
  render: RootRender;
  fields?: Fields<RootProps>;
  defaultProps?: Partial<RootProps>;
  permissions?: Partial<Permissions>;
};

// =============================================================================
// DATA TYPES
// =============================================================================

export type WithId<T = Unknown> = T & { id: string };

export interface ComponentData<P extends Indexable = DefaultComponentProps> {
  type: string;
  props: WithId<P>;
  readOnly?: boolean;
}

export type Content = Array<ComponentData>;

export type RootData = {
  props: Indexable;
  readOnly?: boolean;
};

export type Data = {
  content: Content;
  root: RootData;
  zones?: Indexable<Content>;
};

export type History<D extends Data = Data> = {
  state: D;
  id: string;
};

// =============================================================================
// CONFIG AGGREGATION
// =============================================================================

export type Config<
  Props extends Indexable = Indexable,
  RootProps extends DefaultComponentProps = DefaultComponentProps,
> = {
  components: Indexable<ComponentConfig>;
  root?: RootConfig<RootProps>;
  categories?: Array<Category>;
};

export interface Category {
  name: string;
  label?: string;
  components?: string[];
}

// =============================================================================
// UI TYPES
// =============================================================================

export type Viewport = {
  width: number;
  height?: number;
  label?: string;
  icon?: string | React.ReactElement;
};

export type ItemSelector = {
  zone: string;
  index: number;
};

export type Viewports = Indexable<Viewport>;

export type UiState = {
  itemSelector: ItemSelector | null;
  isDragging: boolean;
  section: string;
  viewports: {
    current: Viewport;
  };
  field: {
    focus: string | null;
  };
};

export type IframeConfig = {
  enabled?: boolean;
  waitForStyles?: boolean;
};

// =============================================================================
// APP STATE
// =============================================================================

export type AppState = {
  data: Data;
  ui: UiState;
};

// =============================================================================
// GENERICS
// =============================================================================

export type UserGenerics<UserConfig extends Config = Config> = {
  UserData: Data;
  UserComponentData: ComponentData;
  UserProps: Indexable;
  UserPublicAppState: AppState;
};

// =============================================================================
// PLUGIN TYPES
// =============================================================================

export type Overrides = {
  fieldTypes?: Indexable<React.ComponentType<FieldProps<Field, Unknown>>>;
  components?: Indexable<React.ComponentType<Unknown>>;
};

export type Plugin<UserConfig extends Config = Config> = {
  name: string;
  overrides?: Overrides;
  fieldTransforms?: FieldTransforms;
  label?: string;
  icon?: ReactNode;
  render?: () => ReactNode;
};

// =============================================================================
// FIELD PROPS
// =============================================================================

export interface FieldProps<F extends Field = Field, ValueType = Unknown> {
  field: F;
  name?: string;
  id?: string;
  value?: ValueType;
  onChange?: (value: ValueType) => void;
  readOnly?: boolean;
}

// =============================================================================
// ACTION & DISPATCH TYPES
// =============================================================================

export type PuckAction =
  | { type: "set"; state: Partial<AppState> }
  | { type: "patch"; state: Partial<AppState> }
  | { type: "replace"; prev: AppState; next: AppState }
  | { type: "undo" }
  | { type: "redo" }
  | { type: "select"; id: string | null }
  | { type: "drag" }
  | { type: "drop" }
  | { type: "hover"; id: string | null }
  | { type: "insert" }
  | { type: "remove" }
  | { type: "update" }
  | { type: "move" }
  | { type: "create" }
  | { type: "save" }
  | { type: "load" }
  | { type: "reset" }
  | { type: "setUi"; ui: Partial<UiState> }
  | { type: string; [key: string]: Unknown };

// =============================================================================
// HISTORY TYPES
// =============================================================================

export interface HistorySlice {
  back: () => void;
  forward: () => void;
  setHistories: (histories: History[]) => void;
  setHistoryIndex: (index: number) => void;
  histories: History[];
  index: number;
  hasPast: boolean;
  hasFuture: boolean;
}

export type UsePuckData<UserConfig extends Config = Config> = {
  appState: AppState;
  config: UserConfig;
  dispatch: (action: PuckAction) => void;
  selectedItem: ComponentData | null;
  getPermissions: () => Permissions;
  refreshPermissions: () => Promise<Permissions>;
  history: HistorySlice;
};

// =============================================================================
// ONACTION CALLBACK
// =============================================================================

export type OnAction = (
  action: PuckAction,
  appState: AppState,
  prevAppState: AppState
) => void;

// =============================================================================
// DROPZONE TYPES
// =============================================================================

export type DropZoneProps = {
  zone: string;
  allow?: string[];
  disallow?: string[];
  style?: CSSProperties;
  className?: string;
  minEmptyHeight?: number;
  children?: ReactNode;
};

// =============================================================================
// RENDER FUNCTIONS
// =============================================================================

export type RenderFunc<P extends Indexable = Indexable> = (props: P) => ReactElement;

// =============================================================================
// LAYER TREE TYPES
// =============================================================================

export interface LayerZoneTree {
  zone: string;
  compound: string;
  node: {
    Title: ReactElement;
    Item: ReactElement;
  };
  nodes: Record<string, LayerZoneTree>;
}

// =============================================================================
// CHANGE TRACKING
// =============================================================================

export interface ChangeSummary {
  added: number;
  removed: number;
  modified: number;
}

// =============================================================================
// EXTERNAL INPUT TYPES
// =============================================================================

export interface ExternalInputProps {
  field: ExternalField;
  value: Unknown;
  onChange: (value: Unknown) => void;
  name?: string;
  id?: string;
  readOnly?: boolean;
}

// =============================================================================
// RE-EXPORTS
// =============================================================================

export type { ReactNode, ReactElement, CSSProperties };
