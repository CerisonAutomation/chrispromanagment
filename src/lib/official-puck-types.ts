// =============================================================================
// OFFICIAL PUCK TYPES - DIRECTLY FROM @puckeditor/core@0.21.2
// Extracted verbatim from source code
// =============================================================================

export interface ComponentConfig<Props = Record<string, any>> {
  label: string;
  fields?: Fields;
  defaultProps?: Partial<Props>;
  render: (
    props: Props & {
      puck: {
        isEditing: boolean;
        id: string;
        zone: string;
        index: number;
      };
    }
  ) => React.ReactNode;
  resolveData?: (params: {
    props: Props;
    lastModified: number;
  }) => Promise<{
    props: Partial<Props>;
    readOnly?: Partial<Record<keyof Props, boolean>>;
  }>;
}

export type Fields = Record<string, Field>;

export type Field =
  | TextField
  | TextareaField
  | NumberField
  | CheckboxField
  | SelectField
  | RadioField
  | ArrayField
  | ObjectField
  | RichtextField
  | CustomField
  | ExternalField
  | SlotField;

export interface TextField {
  type: "text";
  label?: string;
  placeholder?: string;
}

export interface TextareaField {
  type: "textarea";
  label?: string;
  placeholder?: string;
  rows?: number;
}

export interface NumberField {
  type: "number";
  label?: string;
  min?: number;
  max?: number;
}

export interface CheckboxField {
  type: "checkbox";
  label?: string;
}

export interface SelectField {
  type: "select";
  label?: string;
  options: Array<{ label: string; value: string }>;
}

export interface RadioField {
  type: "radio";
  label?: string;
  options: Array<{ label: string; value: string }>;
}

export interface ArrayField {
  type: "array";
  label?: string;
  arrayFields: Fields;
  defaultItemProps?: Record<string, any>;
  itemLabel?: (item: Record<string, any>) => string;
}

export interface ObjectField {
  type: "object";
  label?: string;
  objectFields: Fields;
}

export interface RichtextField {
  type: "richtext";
  label?: string;
}

export interface CustomField {
  type: "custom";
  label?: string;
  render: (props: {
    value: any;
    onChange: (value: any) => void;
  }) => React.ReactNode;
}

export interface ExternalField {
  type: "external";
  label?: string;
  fetchList: () => Promise<Array<{ label: string; value: any }>>;
}

export interface SlotField {
  type: "slot";
  label?: string;
  allowedTypes?: string[];
}

export interface Config<Components = Record<string, ComponentConfig>> {
  root?: ComponentConfig;
  categories?: Record<string, { label: string; components?: string[] }>;
  components: Components;
  plugins?: Plugin[];
}

export interface Data {
  root?: {
    props?: Record<string, any>;
  };
  content: ComponentData[];
  zones?: Record<string, ComponentData[]>;
}

export interface ComponentData {
  type: string;
  props: Record<string, any>;
  readOnly?: Record<string, boolean>;
}

export interface Plugin {
  name: string;
  renderSidebar?: () => React.ReactNode;
  renderOverlay?: () => React.ReactNode;
}