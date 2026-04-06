/**
 * Unified Type Definitions - Canonical Type Exports
 * ==================================================
 * Single source of truth for all types used by the application.
 * Consolidates Puck types, Domain types, and Field types.
 * 100% TypeScript coverage - Zero `any` types
 */

import {ReactElement, ReactNode} from "react";

// =============================================================================
// CORE UTILITY TYPES
// =============================================================================

/** Generic indexable type for dynamic object handling */
type Indexable<T = unknown> = { [key: string]: T };

/** Nullable helper */
type Nullable<T> = T | null | undefined;

/** Unknown-safe generic */
type Unknown = unknown;

// =============================================================================
// SECTION 1: BRANDED TYPES - Type-safe IDs
// =============================================================================

declare const __brand: unique symbol;
type Brand<B> = { [__brand]: B };

export type Branded<T, B> = T & Brand<B>;

export type BlockId = Branded<string, "BlockId">;
export type PageId = Branded<string, "PageId">;
export type UserId = Branded<string, "UserId">;
export type ThemeId = Branded<string, "ThemeId">;
export type PropertyId = Branded<string, "PropertyId">;
export type BookingId = Branded<string, "BookingId">;
export type QuoteId = Branded<string, "QuoteId">;
export type Timestamp = Branded<number, "Timestamp">;
export type ISODate = Branded<string, "ISODate">;
export type Email = Branded<string, "Email">;
export type URLString = Branded<string, "URLString">;
export type Slug = Branded<string, "Slug">;

// Factory functions
export function createBlockId(): BlockId {
  return crypto.randomUUID() as BlockId;
}

export function createPageId(): PageId {
  return crypto.randomUUID() as PageId;
}

export function createUserId(): UserId {
  return crypto.randomUUID() as UserId;
}

export function createTimestamp(): Timestamp {
  return Date.now() as Timestamp;
}

export function createISODate(date: Date = new Date()): ISODate {
  return date.toISOString() as ISODate;
}

// =============================================================================
// SECTION 2: RESULT TYPE - Railway-oriented programming
// =============================================================================

export type Result<T, E = DomainError> =
  | { readonly _tag: "Ok"; readonly value: T }
  | { readonly _tag: "Err"; readonly error: E };

export function ok<T>(value: T): Result<T, never> {
  return { _tag: "Ok", value };
}

export function err<E>(error: E): Result<never, E> {
  return { _tag: "Err", error };
}

export function isOk<T, E>(result: Result<T, E>): result is { _tag: "Ok"; value: T } {
  return result._tag === "Ok";
}

export function isErr<T, E>(result: Result<T, E>): result is { _tag: "Err"; error: E } {
  return result._tag === "Err";
}

export function map<T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> {
  return isOk(result) ? ok(fn(result.value)) : result;
}

export function flatMap<T, U, E>(result: Result<T, E>, fn: (value: T) => Result<U, E>): Result<U, E> {
  return isOk(result) ? fn(result.value) : result;
}

export function getOrElse<T, E>(result: Result<T, E>, defaultValue: T): T {
  return isOk(result) ? result.value : defaultValue;
}

// =============================================================================
// SECTION 3: OPTION TYPE - Null safety
// =============================================================================

export type Option<T> = Some<T> | None;

interface Some<T> {
  readonly _tag: "Some";
  readonly value: T;
}

interface None {
  readonly _tag: "None";
}

export const Option = {
  some: <T>(value: T): Option<T> => ({ _tag: "Some", value }),
  none: (): Option<never> => ({ _tag: "None" }),
  fromNullable: <T>(value: T | null | undefined): Option<T> =>
    value == null ? Option.none() : Option.some(value),
  map: <T, U>(opt: Option<T>, fn: (value: T) => U): Option<U> =>
    opt._tag === "None" ? Option.none() : Option.some(fn(opt.value)),
  flatMap: <T, U>(opt: Option<T>, fn: (value: T) => Option<U>): Option<U> =>
    opt._tag === "None" ? Option.none() : fn(opt.value),
  filter: <T>(opt: Option<T>, predicate: (value: T) => boolean): Option<T> =>
    opt._tag === "None" || !predicate(opt.value) ? Option.none() : opt,
  getOrElse: <T>(opt: Option<T>, defaultValue: T): T =>
    opt._tag === "None" ? defaultValue : opt.value,
  getOrNull: <T>(opt: Option<T>): T | null =>
    opt._tag === "None" ? null : opt.value,
  match: <T, U>(opt: Option<T>, handlers: { some: (value: T) => U; none: () => U }): U =>
    opt._tag === "None" ? handlers.none() : handlers.some(opt.value),
  isSome: <T>(opt: Option<T>): opt is Some<T> => opt._tag === "Some",
  isNone: <T>(opt: Option<T>): opt is None => opt._tag === "None",
  all: <T>(options: Option<T>[]): Option<T[]> => {
    const values: T[] = [];
    for (const opt of options) {
      if (opt._tag === "None") return Option.none();
      values.push(opt.value);
    }
    return Option.some(values);
  },
} as const;

// =============================================================================
// SECTION 4: DOMAIN ERRORS
// =============================================================================

export type ErrorCode =
  | "BLOCK_NOT_FOUND"
  | "PAGE_NOT_FOUND"
  | "USER_NOT_FOUND"
  | "PROPERTY_NOT_FOUND"
  | "BOOKING_NOT_FOUND"
  | "QUOTE_NOT_FOUND"
  | "VALIDATION_FAILED"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "RATE_LIMITED"
  | "SYNC_CONFLICT"
  | "INVALID_STATE"
  | "OPERATION_FAILED"
  | "NETWORK_ERROR"
  | "TIMEOUT_ERROR"
  | "SERVICE_UNAVAILABLE"
  | "AI_GENERATION_FAILED"
  | "FILE_UPLOAD_FAILED"
  | "THEME_NOT_FOUND"
  | "INVALID_THEME";

export class DomainError extends Error {
  readonly code: ErrorCode;
  readonly statusCode: number;
  readonly context?: Indexable<unknown>;
  readonly timestamp: Timestamp;

  constructor(options: {
    code: ErrorCode;
    message: string;
    statusCode: number;
    context?: Indexable<unknown>;
    cause?: Error;
  }) {
    super(options.message);
    this.name = "DomainError";
    this.code = options.code;
    this.statusCode = options.statusCode;
    this.context = options.context;
    this.timestamp = createTimestamp();
    if (options.cause) {
      this.cause = options.cause;
    }
  }
}

export const Errors = {
  BlockNotFound: (id: BlockId | string) =>
    new DomainError({
      code: "BLOCK_NOT_FOUND",
      message: `Block with id "${id}" not found`,
      statusCode: 404,
      context: { blockId: id },
    }),

  PageNotFound: (id: PageId | string) =>
    new DomainError({
      code: "PAGE_NOT_FOUND",
      message: `Page with id "${id}" not found`,
      statusCode: 404,
      context: { pageId: id },
    }),

  ValidationFailed: (field: string, reason: string, value?: unknown) =>
    new DomainError({
      code: "VALIDATION_FAILED",
      message: `Validation failed for "${field}": ${reason}`,
      statusCode: 400,
      context: { field, reason, value },
    }),

  Unauthorized: (reason?: string) =>
    new DomainError({
      code: "UNAUTHORIZED",
      message: reason || "Authentication required",
      statusCode: 401,
    }),

  SyncConflict: (blockId: BlockId, serverVersion: number, clientVersion: number) =>
    new DomainError({
      code: "SYNC_CONFLICT",
      message: `Sync conflict detected for block "${blockId}"`,
      statusCode: 409,
      context: { blockId, serverVersion, clientVersion },
    }),
} as const;

// =============================================================================
// SECTION 5: SYNC STATUS
// =============================================================================

export type SyncStatus =
  | { readonly state: "synced"; readonly syncedAt: Timestamp }
  | { readonly state: "pending"; readonly pendingSince: Timestamp; readonly attempts?: number }
  | { readonly state: "syncing"; readonly startedAt: Timestamp }
  | { readonly state: "conflict"; readonly conflictDetails: string; readonly serverVersion?: number }
  | { readonly state: "error"; readonly errorMessage: string; readonly retryable?: boolean };

export const SyncStatus = {
  synced: (syncedAt: Timestamp = createTimestamp()): SyncStatus => ({
    state: "synced",
    syncedAt,
  }),
  pending: (pendingSince: Timestamp = createTimestamp(), attempts = 0): SyncStatus => ({
    state: "pending",
    pendingSince,
    attempts,
  }),
  conflict: (conflictDetails: string, serverVersion?: number): SyncStatus => ({
    state: "conflict",
    conflictDetails,
    serverVersion,
  }),
  error: (errorMessage: string, retryable = true): SyncStatus => ({
    state: "error",
    errorMessage,
    retryable,
  }),
} as const;

// =============================================================================
// SECTION 6: BLOCK TYPES
// =============================================================================

export type BlockType =
  | "hero"
  | "features"
  | "pricing"
  | "testimonials"
  | "cta"
  | "faq"
  | "footer"
  | "text"
  | "image"
  | "gallery"
  | "divider"
  | "spacer"
  | "custom";

export type BlockData = Indexable<unknown>;

export interface BlockMeta {
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
  readonly createdBy: UserId;
  readonly updatedBy: UserId;
  readonly syncStatus: SyncStatus;
}

export interface BlockProps {
  readonly id: BlockId;
  readonly type: BlockType | string;
  readonly data: BlockData;
  readonly meta: BlockMeta;
  readonly version: number;
}

export interface Block {
  id: BlockId;
  type: string;
  props: Indexable<unknown>;
}

// =============================================================================
// SECTION 7: PAGE TYPES
// =============================================================================

export interface PageMeta {
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
  readonly publishedAt: Option<Timestamp>;
  readonly createdBy: UserId;
  readonly updatedBy: UserId;
}

export interface SeoData {
  readonly title: Option<string>;
  readonly description: Option<string>;
  readonly keywords: readonly string[];
  readonly ogImage: Option<string>;
  readonly canonicalUrl: Option<string>;
  readonly noIndex: boolean;
}

export interface PageProps {
  readonly id: PageId;
  readonly slug: string;
  readonly title: string;
  readonly description: Option<string>;
  readonly blocks: readonly Block[];
  readonly themeId: ThemeId;
  readonly meta: PageMeta;
  readonly published: boolean;
  readonly seo: SeoData;
}

export interface PageData {
  content: Block[];
  root: {
    props: Indexable<unknown>;
  };
}

export interface PageListItem {
  id: string;
  slug: string;
  title: string;
  status: "draft" | "published";
  updatedAt: string;
}

export interface PageContent {
  blocks: Block[];
  root: {
    props: Indexable<unknown>;
  };
}

// =============================================================================
// SECTION 8: FIELD TYPES
// =============================================================================

export type FieldOption = {
  label: string;
  value: string | number | boolean | undefined | null | object;
};

export type FieldOptions = Array<FieldOption> | ReadonlyArray<FieldOption>;

export interface FieldMetadata extends Indexable<unknown> {
  description?: string;
}

export interface BaseField {
  label?: string;
  labelIcon?: ReactElement;
  visible?: boolean;
  metadata?: FieldMetadata;
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

export type ArrayFieldProps = Indexable<unknown>;

export interface ArrayField<ItemProps extends Indexable = Indexable> extends BaseField {
  type: "array";
  arrayFields: Fields<ItemProps>;
  label?: string;
  defaultItemProps?: Partial<ItemProps> | ((index: number) => Partial<ItemProps>);
  getItemSummary?: (item: ItemProps, index?: number) => ReactNode;
  minItems?: number;
  maxItems?: number;
}

export interface ObjectField<ItemProps extends Indexable = Indexable> extends BaseField {
  type: "object";
  objectFields: Fields<ItemProps>;
}

export interface CustomFieldRender<Value = unknown> {
  (props: CustomFieldRenderProps<Value>): ReactElement;
}

export interface CustomFieldRenderProps<Value = unknown> {
  field: CustomField<Value>;
  name: string;
  id: string;
  value: Value;
  onChange: (value: Value, uiState?: Indexable<unknown>) => void;
  readOnly?: boolean;
}

export interface CustomField<Value = unknown> extends BaseField {
  type: "custom";
  render?: CustomFieldRender<Value>;
  contentEditable?: boolean;
  key?: string;
}

export interface GroupField<ItemProps extends Indexable = Indexable> extends BaseField {
  type: "group";
  groupFields: Fields<ItemProps>;
  defaultProps?: Partial<ItemProps>;
}

export interface UploadField extends BaseField {
  type: "upload";
  accept?: string;
  maxSize?: number;
}

export interface SlotField extends BaseField {
  type: "slot";
  allow?: string[];
  disallow?: string[];
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
  | ObjectField
  | CustomField
  | GroupField
  | UploadField
  | SlotField;

export type Fields<T extends Indexable = DefaultComponentProps, UserField = Indexable> = {
  [key: string]: AnyField | UserField;
};

// =============================================================================
// SECTION 9: COMPONENT TYPES
// =============================================================================

export type DefaultComponentProps = Indexable<unknown>;

export type DefaultComponents = Indexable<DefaultComponentProps>;

export type SlotComponent = (props?: {
  zone?: string;
  [key: string]: unknown;
}) => ReactNode;

export type ResolveDataTrigger = "insert" | "replace" | "load" | "force" | "move";

export type Permissions = {
  drag: boolean;
  duplicate: boolean;
  delete: boolean;
  edit: boolean;
  insert: boolean;
} & Indexable<boolean>;

export type ComponentMetadata = {
  description?: string;
  aiHint?: string;
  nonDeterministic?: boolean;
  [key: string]: unknown;
};

export type PuckComponent<Props extends Indexable = DefaultComponentProps> = (
  props: {
    [K in keyof Props]: WithDeepSlots<Props[K], SlotComponent>;
  } & {
    id: string;
  }
) => ReactElement;

export type FieldTransformFn = (params: FieldTransformParams) => unknown;

export interface FieldTransformParams {
  value: unknown;
  onChange: (value: unknown) => void;
  field: Field;
}

export type FieldTransforms = Indexable<FieldTransformFn>;

export type ComponentConfig<
  RenderProps extends DefaultComponentProps = DefaultComponentProps,
  FieldProps extends DefaultComponentProps = RenderProps,
> = {
  render: PuckComponent<RenderProps>;
  label?: string;
  defaultProps?: Partial<FieldProps>;
  fields?: Fields<FieldProps>;
  permissions?: Partial<Permissions>;
  inline?: boolean;
  resolveFields?: (
    data: Indexable<unknown>,
    params: {
      changed: Partial<Record<keyof FieldProps, boolean> & { id: string }>;
      fields: Fields<FieldProps>;
      lastFields: Fields<FieldProps>;
      lastData: Indexable<unknown> | null;
      metadata: ComponentMetadata;
      appState: AppState;
      parent: ComponentData | null;
    }
  ) => Promise<Fields<FieldProps>> | Fields<FieldProps>;
  resolveData?: (
    data: Indexable<unknown>,
    params: {
      changed: Partial<Record<keyof FieldProps, boolean> & { id: string }>;
      lastData: Indexable<unknown> | null;
      metadata: ComponentMetadata;
      trigger: ResolveDataTrigger;
      parent: ComponentData | null;
    }
  ) => Promise<Indexable<unknown>> | Indexable<unknown>;
  resolvePermissions?: (
    data: Indexable<unknown>,
    params: {
      changed: Partial<Record<keyof FieldProps, boolean> & { id: string }>;
      lastPermissions: Partial<Permissions>;
      permissions: Partial<Permissions>;
      appState: AppState;
      lastData: Indexable<unknown> | null;
      parent: ComponentData | null;
    }
  ) => Promise<Partial<Permissions>> | Partial<Permissions>;
  metadata?: ComponentMetadata;
};

export type RootRender = (props: { children?: ReactNode } & Partial<Indexable<unknown>>) => ReactElement;

export type RootConfig<RootProps extends DefaultComponentProps = DefaultComponentProps> = {
  render: RootRender;
  fields?: Fields<RootProps>;
  defaultProps?: Partial<RootProps>;
};

export type RootData<RootProps extends DefaultComponentProps = DefaultComponentProps> = {
  props: RootProps;
};

// =============================================================================
// SECTION 10: DATA TYPES
// =============================================================================

export type ComponentData<FieldProps extends DefaultComponentProps = DefaultComponentProps> = {
  type: string;
  props: FieldProps & { id: string };
};

export type Content<Components extends DefaultComponents = DefaultComponents> = Array<
  ComponentData<Components[keyof Components]>
>;

export type Data<
  Components extends DefaultComponents = DefaultComponents,
  RootProps extends DefaultComponentProps = DefaultComponentProps
> = {
  root: RootData<RootProps>;
  content: Content<Components>;
};

// =============================================================================
// SECTION 11: UI STATE TYPES
// =============================================================================

export type ItemSelector = {
  id?: string;
  type?: string;
};

export type Viewport = {
  width: number;
  height?: number;
  label: string;
};

export type Viewports = Indexable<Viewport>;

export type UiState = {
  selected: {
    id: string | null;
  };
  dragging: {
    id: string | null;
  };
  hovering: {
    id: string | null;
  };
  section: "components" | "content" | "layers";
  media: {
    isOpen: boolean;
  };
  history: {
    canUndo: boolean;
    canRedo: boolean;
  };
  viewports?: Viewports;
  iframe?: IframeConfig;
};

export type IframeConfig = {
  enabled?: boolean;
  waitForStyles?: boolean;
};

export type AppState<
  Components extends DefaultComponents = DefaultComponents,
  RootProps extends DefaultComponentProps = DefaultComponentProps
> = {
  data: Data<Components, RootProps>;
  ui: UiState;
};

// =============================================================================
// SECTION 12: CONFIG TYPES
// =============================================================================

export type Category<ComponentName extends string = string> = {
  components?: ComponentName[];
  title?: string;
  visible?: boolean;
  defaultExpanded?: boolean;
};

export type Config<
  Props extends DefaultComponents = DefaultComponents,
  RootProps extends DefaultComponentProps = DefaultComponentProps,
  CategoryName extends string = string
> = {
  categories?: Record<CategoryName, Category<keyof Props>> & {
    other?: Category<keyof Props>;
  };
  components: {
    [ComponentName in keyof Props]: Omit<ComponentConfig<Props[ComponentName], Props[ComponentName]>, "type">;
  };
  root?: RootConfig<RootProps>;
};

// =============================================================================
// SECTION 13: PUCKACTION & DISPATCH
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
  | { type: string; [key: string]: unknown };

// =============================================================================
// SECTION 14: HELPER TYPES
// =============================================================================

type BuiltinTypes = Date | RegExp | Error | Function | symbol | null | undefined;

export type WithDeepSlots<T, SlotType = T> =
  T extends Slot
    ? SlotType
    : T extends (infer U)[]
      ? Array<WithDeepSlots<U, SlotType>>
      : T extends BuiltinTypes
        ? T
        : T extends object
          ? { [K in keyof T]: WithDeepSlots<T[K], SlotType> }
          : T;

export type Slot<Props extends { [key: string]: DefaultComponentProps } = Indexable> = {
  [K in keyof Props]: ComponentData<Props[K]>;
}[keyof Props][];

// =============================================================================
// SECTION 15: EDITOR STORE TYPES
// =============================================================================

export interface PageVersion {
  id: string;
  pageId: string;
  data: Data;
  title: string;
  createdAt: number;
  description?: string;
}

export interface LocalDraft {
  pageId: string;
  slug: string;
  data: Data;
  title: string;
  lastModified: number;
  syncStatus: "synced" | "pending" | "error";
}

export interface PuckEditorState {
  currentSlug: string | null;
  currentData: Data | null;
  currentTitle: string;
  sidebarVisible: boolean;
  rightPanelVisible: boolean;
  previewMode: boolean;
  undoStack: Data[];
  redoStack: Data[];
  versions: PageVersion[];
  autosaveEnabled: boolean;
  lastSavedAt: number | null;
  isDirty: boolean;
  isSaving: boolean;
  drafts: Indexable<LocalDraft>;
  initialized: boolean;
}

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

export type History<D extends Data = Data> = {
  state: D;
  id: string;
};

export type UsePuckData<UserConfig extends Config = Config> = {
  appState: AppState;
  config: UserConfig;
  dispatch: (action: PuckAction) => void;
  selectedItem: ComponentData | null;
  getPermissions: () => Permissions;
  refreshPermissions: () => Promise<Permissions>;
  history: HistorySlice;
};

export type OnAction = (
  action: PuckAction,
  appState: AppState,
  prevAppState: AppState
) => void;

// =============================================================================
// SECTION 16: THEME TYPES
// =============================================================================

export interface ThemeTokens {
  readonly colors: {
    readonly primary: string;
    readonly secondary: string;
    readonly accent: string;
    readonly background: string;
    readonly foreground: string;
    readonly muted: string;
    readonly border: string;
  };
  readonly fonts: {
    readonly heading: string;
    readonly body: string;
    readonly mono: string;
  };
  readonly spacing: {
    readonly section: string;
    readonly container: string;
    readonly gap: string;
  };
  readonly borderRadius: {
    readonly sm: string;
    readonly md: string;
    readonly lg: string;
    readonly full: string;
  };
}

export interface Theme {
  readonly id: ThemeId;
  readonly name: string;
  readonly description: string;
  readonly tokens: ThemeTokens;
  readonly isDefault: boolean;
}

// =============================================================================
// SECTION 17: USER TYPES
// =============================================================================

export interface User {
  readonly id: UserId;
  readonly email: string;
  readonly name: string;
  readonly role: "admin" | "editor" | "viewer";
  readonly createdAt: Timestamp;
  readonly lastLoginAt: Option<Timestamp>;
}

// =============================================================================
// SECTION 18: FIELD PROPS
// =============================================================================

export interface FieldProps<F extends Field = Field, ValueType = unknown> {
  field: F;
  name?: string;
  id?: string;
  value?: ValueType;
  onChange?: (value: ValueType) => void;
  readOnly?: boolean;
}

// =============================================================================
// SECTION 19: FACTORY FUNCTIONS
// =============================================================================

export function createEmptyPageData(title = "Untitled"): PageData {
  return {
    content: [],
    root: { props: { title } },
  };
}

export function isValidPageData(data: unknown): data is PageData {
  if (!data || typeof data !== "object") return false;
  const d = data as Indexable<unknown>;
  return Array.isArray(d.content) && d.root !== null && typeof d.root === "object";
}

// =============================================================================
// SECTION 20: RE-EXPORTS
// =============================================================================

export type { ReactNode, ReactElement } from "react";
