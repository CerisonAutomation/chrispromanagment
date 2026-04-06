/**
 * P4 Advanced Field Features Index
 * 
 * Comprehensive field system for Puck with all advanced features:
 * - Field Dependencies (#49)
 * - Conditional Fields (#50)
 * - Computed Fields (#51)
 * - Field Validation (#52)
 * - Async Field Options (#53)
 * - Array Field Sorting (#54)
 * - Object Field Groups (#55)
 * - Custom Field Types (#56)
 * - Field-Level Permissions (#57)
 * - Default Values from Data (#58)
 * - Props Injection (#59)
 */

// ============================================================================
// FIELD DEPENDENCIES (#49)
// ============================================================================
export {
  createFieldDependencyResolver,
  getDependencyValues,
  useFieldDependencies,
  updateOptionsFromDependency,
  updateMinMaxFromDependency,
  updatePlaceholderFromDependency,
  type FieldDependency,
  type FieldDependencyMap,
  type DependencyValue,
  type DependencyCondition,
} from "./field-dependencies";

// ============================================================================
// CONDITIONAL FIELDS (#50)
// ============================================================================
export {
  createConditionalFields,
  filterVisibleFields,
  isFieldVisible,
  useConditionalFields,
  useFieldVisibility,
  when,
  and,
  or,
  validateField,
  ConditionPresets,
  type ShowCondition,
  type ConditionOperator,
  type ConditionValue,
  type FieldVisibility,
  type ConditionalFieldConfig,
  type ValidationCondition,
} from "./conditional-logic";

// ============================================================================
// COMPUTED FIELDS (#51)
// ============================================================================
export {
  computed,
  computed as createComputedField,
  concatComputed,
  numericComputed,
  booleanComputed,
  conditionalComputed,
  ComputedValuesManager,
  useComputedValues,
  useComputed,
  createComputedDataResolver,
  type ComputedField,
  type ComputedFieldConfig,
  type ComputedValueFn,
} from "./computed-fields";

// ============================================================================
// FIELD VALIDATION (#52)
// ============================================================================
export {
  required,
  minLength,
  maxLength,
  min,
  max,
  pattern,
  email,
  url,
  custom,
  matchesField,
  when,
  uniqueEmail,
  uniqueSlug,
  debouncedAsync,
  ValidationEngine,
  useFieldValidation,
  extractFieldValidators,
  validateFields,
  type ValidatorFn,
  type AsyncValidatorFn,
  type ValidationRule,
  type FieldWithValidation,
} from "./validation";

// ============================================================================
// ASYNC FIELD OPTIONS (#53)
// ============================================================================
export {
  createAsyncOptionsLoader,
  createDependentOptionsLoader,
  createApiOptionsLoader,
  createStaticOptionsLoader,
  createGroupedOptionsLoader,
  OptionsStateManager,
  optionsCache,
  useAsyncOptions,
  type FieldOption,
  type OptionsLoader,
  type LoadOptionsContext,
  type OptionsAPIClient,
  type AsyncOptionsField,
} from "./async-options";

// ============================================================================
// FIELD PERMISSIONS (#57)
// ============================================================================
export {
  FieldPermissionEngine,
  useFieldPermissions,
  useFieldPermission,
  createPermissionAwareResolveFields,
  hasRole,
  hasPermission,
  isEditMode,
  whenFieldEquals,
  whenField,
  hasAllPermissions,
  hasAnyPermission,
  not,
  type FieldPermission,
  type PermissionCondition,
  type PermissionContext,
  type User,
  type FieldPermissionMap,
} from "./field-permissions";

// ============================================================================
// DEFAULT PROPS (#58)
// ============================================================================
export {
  DefaultPropsEngine,
  useDefaultProps,
  useDefaultValue,
  mergeDefaultProps,
  withUserDefaults,
  createDefaultPropsResolver,
  defaultValue,
  dynamicDefault,
  copyFrom,
  conditionalDefault,
  fromParent,
  fromIndex,
  incrementFrom,
  generateId,
  timestamp,
  type DefaultPropsContext,
  type DefaultPropsResolver,
  type DefaultValueConfig,
  type DefaultValueType,
} from "./default-props";
