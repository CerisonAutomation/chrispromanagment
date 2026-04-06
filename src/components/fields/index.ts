/**
 * Advanced Field Components Index
 * 
 * Custom field components with enhanced features:
 * - Array Field with Sorting (#54)
 * - Field Group with Collapsible (#55)
 * - Custom Field Renderer (#56)
 */

// ============================================================================
// ARRAY FIELD (#54)
// ============================================================================
export { ArrayField, default as ArrayFieldDefault } from "./array-field";
export type { ArrayFieldProps, ArrayFieldConfig } from "./array-field";

// ============================================================================
// FIELD GROUP (#55)
// ============================================================================
export { 
  FieldGroup, 
  createFieldGroup, 
  createAccordionGroup, 
  createSectionGroup,
  createLockedGroup,
} from "./field-group";
export type { FieldGroupProps, FieldGroupConfig, FieldGroupField } from "./field-group";

// ============================================================================
// CUSTOM FIELD RENDERER (#56)
// ============================================================================
export {
  FieldRegistryProvider,
  CustomFieldRenderer,
  useFieldRegistry,
  presetPlugins,
  colorPickerPlugin,
  rangeSliderPlugin,
  toggleSwitchPlugin,
  imageUploadPlugin,
  codeEditorPlugin,
  tagsPlugin,
  createCustomField,
  createInlineCustomField,
} from "./custom-field-renderer";
export type {
  FieldPlugin,
  CustomField,
  CustomFieldRenderProps,
  CustomFieldRenderFn,
  FieldSchema,
} from "./custom-field-renderer";
