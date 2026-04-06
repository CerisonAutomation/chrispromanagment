/**
 * @fileoverview Types Index - Canonical Puck types exports
 * 
 * @example
 * import type { Field, ComponentConfig, Data } from '@/lib/types-index';
 */

// Field Types
export type {
  BaseField,
  TextField,
  NumberField,
  TextareaField,
  SelectField,
  RadioField,
  CheckboxField,
  DateField,
  HiddenField,
  ArrayField,
  CustomField,
  GroupField,
  UploadField,
  SlotField,
  AnyField,
  Field,
  Fields,
  FieldOption,
  FieldOptions,
} from './types';

// Component Types
export type {
  DefaultComponentProps,
  PuckComponent,
  SlotComponent,
  ResolveDataTrigger,
  Permissions,
  ComponentConfig,
} from './types';

// Root Types
export type {
  RootRender,
  RootConfig,
} from './types';

// Data Types
export type {
  WithId,
  ComponentData,
  Content,
  RootData,
  Data,
  History,
} from './types';

// Config Types
export type {
  Config,
} from './types';

// UI Types
export type {
  Viewport,
  ItemSelector,
} from './types';

// Generics
export type {
  UserGenerics,
} from './types';

// Plugin Types
export type {
  Overrides,
  Plugin,
} from './types';

// App State
export type {
  AppState,
} from './types';
