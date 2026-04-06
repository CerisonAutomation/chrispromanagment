// =============================================================================
// CANONICAL PUCK TYPES
// Mirror of puck-main/packages/core/types/
// =============================================================================

import React, {ReactNode} from "react";

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

export interface ArrayField<ItemProps = DefaultComponentProps> extends BaseField {
  type: "array";
  arrayFields: Fields<ItemProps>;
  label?: string;
  defaultItemProps?: Partial<ItemProps>;
  labelSingular?: string;
  minItems?: number;
  maxItems?: number;
}

export interface CustomField<T = any> extends BaseField {
  type: "custom";
  render: (props: {
    name: string;
    value: T;
    onChange: (value: T) => void;
    field: CustomField<T>;
    readOnly: boolean;
  }) => ReactNode;
}

export interface GroupField extends BaseField {
  type: "group";
  group: Fields;
  defaultProps?: Record<string, unknown>;
}

export interface UploadField extends BaseField {
  type: "upload";
}

export interface SlotField extends BaseField {
  type: "slot";
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
  | SlotField;

export type Field = AnyField;

export type Fields<T = DefaultComponentProps, UserField = {}> = {
  [key: string]: AnyField | UserField;
};

// =============================================================================
// COMPONENT TYPES
// =============================================================================

export interface DefaultComponentProps {
  [key: string]: unknown;
  id?: string;
}

export type PuckComponent<Props> = (
  props: Props & {
    id: string;
  }
) => ReactNode;

export type SlotComponent = (props?: {
  zone?: string;
  [key: string]: any;
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

export type ComponentConfig<
  RenderProps extends DefaultComponentProps,
  FieldProps extends DefaultComponentProps,
  DataShape = any,
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
    changed?: Record<string, boolean>;
    lastPermissions?: Permissions | null;
    permissions?: Permissions;
    lastData?: DataShape | null;
    parent?: ComponentData | null;
  }) => Promise<Permissions>;
  metadata?: {
    description?: string;
    aiHint?: string;
    nonDeterministic?: boolean;
    [key: string]: any;
  };
};

// =============================================================================
// ROOT CONFIG
// =============================================================================

export type RootRender = (props: {
  children?: ReactNode;
  title?: string;
}) => ReactNode;

export type RootConfig<RootProps = any> = {
  render: RootRender;
  fields?: Fields<RootProps>;
  defaultProps?: Partial<RootProps>;
  permissions?: Partial<Permissions>;
};

// =============================================================================
// DATA TYPES
// =============================================================================

export type WithId<T = any> = T & { id: string };

export interface ComponentData<P = any> {
  type: string;
  props: WithId<P>;
  readOnly?: boolean;
}

export type Content = Array<ComponentData>;

export type RootData = {
  props: Record<string, unknown>;
  readOnly?: boolean;
};

export type Data = {
  content: Content;
  root: RootData;
  zones?: Record<string, Content>;
};

export type History<D = any> = {
  state: D;
  id: string;
};

// =============================================================================
// CONFIG AGGREGATION
// =============================================================================

export type Config<Props = any, RootProps = any> = {
  components: Record<string, ComponentConfig<any, any>>;
  root?: RootConfig<RootProps>;
  categories?: Array<{
    name: string;
    label?: string;
    components?: string[];
  }>;
};

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

// =============================================================================
// GENERICS
// =============================================================================

export type UserGenerics<UserConfig extends Config = Config> = {
  UserData: Data;
  UserComponentData: ComponentData;
  UserProps: Record<string, any>;
  UserPublicAppState: any;
};

// =============================================================================
// PLUGIN TYPES
// =============================================================================

export type Overrides = {
  fieldTypes?: Record<string, React.ComponentType<any>>;
  components?: Record<string, React.ComponentType<any>>;
};

export type Plugin = {
  name: string;
  overrides?: Overrides;
};

// =============================================================================
// APP STATE
// =============================================================================

export type AppState = {
  data: Data;
  ui: {
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
};
