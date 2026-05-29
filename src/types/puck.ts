// =============================================================================
// PUCK DOMAIN TYPES
// Authoritative. Replaces: canonical-puck-types.ts, official-puck-types.ts,
// src/lib/types/Data.tsx, src/lib/types/Internal.tsx, block-types.ts (BlockData).
// =============================================================================
import type { ReactNode, ReactElement, CSSProperties } from 'react';

// ─── Primitives ──────────────────────────────────────────────────────────────

export type Indexable<T = unknown> = Record<string, T>;
export type WithId<T = unknown> = T & { id: string };
export type FieldOption = {
  label: string;
  value: string | number | boolean | null | undefined;
};

// ─── Field Types ─────────────────────────────────────────────────────────────

export interface BaseField {
  label?: string;
  labelIcon?: ReactElement;
  visible?: boolean;
  metadata?: { description?: string };
}

export interface TextField extends BaseField { type: 'text'; placeholder?: string; contentEditable?: boolean; }
export interface TextareaField extends BaseField { type: 'textarea'; placeholder?: string; rows?: number; }
export interface NumberField extends BaseField { type: 'number'; placeholder?: string; min?: number; max?: number; step?: number; }
export interface SelectField extends BaseField { type: 'select'; options: FieldOption[]; placeholder?: string; }
export interface RadioField extends BaseField { type: 'radio'; options: FieldOption[]; }
export interface CheckboxField extends BaseField { type: 'checkbox'; }
export interface DateField extends BaseField { type: 'date'; placeholder?: string; }
export interface HiddenField extends BaseField { type: 'hidden'; }
export interface SlotField extends BaseField { type: 'slot'; allowedTypes?: string[]; }
export interface UploadField extends BaseField { type: 'upload'; }
export interface RichtextField extends BaseField { type: 'richtext'; placeholder?: string; }

export interface ArrayField<ItemProps extends Indexable = Indexable> extends BaseField {
  type: 'array';
  arrayFields: Fields<ItemProps>;
  defaultItemProps?: Partial<ItemProps>;
  labelSingular?: string;
  minItems?: number;
  maxItems?: number;
}

export interface CustomField<T = unknown> extends BaseField {
  type: 'custom';
  render: (props: {
    name: string;
    value: T;
    onChange: (value: T) => void;
    field: CustomField<T>;
    readOnly: boolean;
  }) => ReactNode;
}

export interface ExternalField<Item = unknown> extends BaseField {
  type: 'external';
  fetchList?: (params: { query: string; filters: Indexable }) => Promise<Array<{ id: string } & Indexable>>;
  getItemSummary?: (item: Indexable) => string;
  placeholder?: string;
  mapProp?: (item: Indexable) => Item;
}

export interface GroupField extends BaseField {
  type: 'group';
  group: Fields;
  defaultProps?: Indexable;
}

export type AnyField =
  | TextField | TextareaField | NumberField | SelectField | RadioField
  | CheckboxField | DateField | HiddenField | SlotField | UploadField
  | RichtextField | ArrayField | CustomField | ExternalField | GroupField;

export type Field = AnyField;

export type Fields<T extends Indexable = Indexable> = {
  [K in keyof T]?: AnyField;
} & { [key: string]: AnyField };

// ─── Component & Config ───────────────────────────────────────────────────────

export interface DefaultComponentProps extends Indexable { id?: string; }

export type Permissions = {
  delete?: boolean;
  copy?: boolean;
  drag?: boolean;
  edit?: boolean;
  duplicate?: boolean;
  insert?: boolean;
};

export type ComponentConfig<
  RenderProps extends DefaultComponentProps = DefaultComponentProps,
  FieldProps extends DefaultComponentProps = RenderProps,
> = {
  label?: string;
  category?: string;
  fields?: Fields<FieldProps>;
  defaultProps?: Partial<FieldProps>;
  render: (props: RenderProps & { id: string }) => ReactNode;
  permissions?: Partial<Permissions>;
  inline?: boolean;
  resolveData?: (args: { data: RenderProps }) => Promise<Partial<RenderProps>>;
  metadata?: { description?: string; aiHint?: string };
};

export interface RootConfig<RootProps extends DefaultComponentProps = DefaultComponentProps> {
  render: (props: { children?: ReactNode; title?: string }) => ReactNode;
  fields?: Fields<RootProps>;
  defaultProps?: Partial<RootProps>;
}

export type Config<
  Props extends Indexable = Indexable,
  RootProps extends DefaultComponentProps = DefaultComponentProps,
> = {
  components: { [K in keyof Props]: ComponentConfig<Props[K] & DefaultComponentProps> };
  root?: RootConfig<RootProps>;
  categories?: Array<{ name: string; label?: string; components?: string[] }>;
};

// ─── Data Shape ───────────────────────────────────────────────────────────────

export interface ComponentData<P extends Indexable = DefaultComponentProps> {
  type: string;
  props: WithId<P>;
  readOnly?: boolean;
}

export type Content = ComponentData[];

export interface RootData {
  props: Indexable;
  readOnly?: boolean;
}

/**
 * Authoritative page data shape.
 * Replaces all prior BlockData / Data aliases across the codebase.
 */
export interface PuckData {
  content: Content;
  root: RootData;
  zones?: Record<string, Content>;
}

/** @deprecated Use PuckData */
export type Data = PuckData;

/** @deprecated Use PuckData */
export type BlockData = PuckData;

// ─── Editor UI ────────────────────────────────────────────────────────────────

export type DeviceMode = 'desktop' | 'tablet' | 'mobile';
export type ViewMode = 'edit' | 'preview';
export type SidebarPanel = 'blocks' | 'ai' | 'pages' | 'theme' | 'none';
export type RightPanel = 'properties' | 'none';

export type { ReactNode, ReactElement, CSSProperties };
