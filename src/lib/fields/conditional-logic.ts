/**
 * Conditional Logic - P4 Advanced Feature #50
 * 
 * Show/hide fields based on other field values.
 * Provides declarative conditional field visibility rules.
 * 
 * @example
 * const conditionalFields = createConditionalFields({
 *   backgroundColor: { type: "text", label: "Background Color" },
 *   backgroundImage: { type: "text", label: "Background Image URL" },
 *   overlayOpacity: { type: "number", showWhen: { field: "backgroundType", value: "image" } }
 * });
 */

import type {Field} from "@puckeditor/core";
import {useMemo} from "react";

// ============================================================================
// TYPES
// ============================================================================

export type ConditionOperator = 
  | "equals"
  | "notEquals"
  | "contains"
  | "notContains"
  | "greaterThan"
  | "lessThan"
  | "greaterThanOrEqual"
  | "lessThanOrEqual"
  | "isEmpty"
  | "isNotEmpty"
  | "in"
  | "notIn";

export type ConditionValue = 
  | string
  | number
  | boolean
  | null
  | undefined
  | string[]
  | number[];

export interface ShowCondition {
  field: string;
  operator?: ConditionOperator;
  value?: ConditionValue;
  /** AND condition - all conditions must be met */
  and?: ShowCondition[];
  /** OR condition - any condition must be met */
  or?: ShowCondition[];
}

export interface FieldVisibility {
  showWhen?: ShowCondition;
  hideWhen?: ShowCondition;
  /** Custom function for complex conditions */
  visibleIf?: (values: Record<string, any>) => boolean;
}

export type ConditionalFieldConfig = Field<any> & FieldVisibility;

// ============================================================================
// UTILITIES
// ============================================================================

function evaluateOperator(
  operator: ConditionOperator,
  fieldValue: any,
  conditionValue: ConditionValue
): boolean {
  switch (operator) {
    case "equals":
      return fieldValue === conditionValue;
    case "notEquals":
      return fieldValue !== conditionValue;
    case "contains":
      if (typeof fieldValue === "string") {
        return fieldValue.includes(String(conditionValue));
      }
      if (Array.isArray(fieldValue)) {
        return fieldValue.includes(conditionValue);
      }
      return false;
    case "notContains":
      if (typeof fieldValue === "string") {
        return !fieldValue.includes(String(conditionValue));
      }
      if (Array.isArray(fieldValue)) {
        return !fieldValue.includes(conditionValue);
      }
      return true;
    case "greaterThan":
      return Number(fieldValue) > Number(conditionValue);
    case "lessThan":
      return Number(fieldValue) < Number(conditionValue);
    case "greaterThanOrEqual":
      return Number(fieldValue) >= Number(conditionValue);
    case "lessThanOrEqual":
      return Number(fieldValue) <= Number(conditionValue);
    case "isEmpty":
      return fieldValue === null || fieldValue === undefined || fieldValue === "";
    case "isNotEmpty":
      return fieldValue !== null && fieldValue !== undefined && fieldValue !== "";
    case "in":
      return Array.isArray(conditionValue) && conditionValue.includes(fieldValue);
    case "notIn":
      return Array.isArray(conditionValue) && !conditionValue.includes(fieldValue);
    default:
      return false;
  }
}

function evaluateCondition(
  condition: ShowCondition,
  values: Record<string, any>
): boolean {
  const fieldValue = values[condition.field];
  const operator = condition.operator || "equals";
  
  // Handle AND conditions
  if (condition.and && condition.and.length > 0) {
    const allAndMet = condition.and.every((c) => evaluateCondition(c, values));
    if (!allAndMet) return false;
  }
  
  // Handle OR conditions
  if (condition.or && condition.or.length > 0) {
    const anyOrMet = condition.or.some((c) => evaluateCondition(c, values));
    if (!anyOrMet) return false;
  }
  
  // Evaluate the main condition
  if (condition.value !== undefined || operator !== "equals") {
    return evaluateOperator(operator, fieldValue, condition.value);
  }
  
  // Default: field is truthy
  return Boolean(fieldValue);
}

// ============================================================================
// MAIN FUNCTIONS
// ============================================================================

/**
 * Evaluate if a field should be visible based on conditions
 */
export function isFieldVisible(
  field: ConditionalFieldConfig,
  values: Record<string, any>
): boolean {
  // Check custom visibleIf function first
  if (field.visibleIf !== undefined) {
    return field.visibleIf(values);
  }
  
  // Check showWhen condition
  if (field.showWhen !== undefined) {
    return evaluateCondition(field.showWhen, values);
  }
  
  // Check hideWhen condition (inverted)
  if (field.hideWhen !== undefined) {
    return !evaluateCondition(field.hideWhen, values);
  }
  
  // Default: visible
  return true;
}

/**
 * Filter fields based on conditions, returning only visible ones
 */
export function filterVisibleFields<T extends Record<string, any>>(
  fields: Record<string, ConditionalFieldConfig>,
  values: T
): Record<string, ConditionalFieldConfig> {
  const visible: Record<string, ConditionalFieldConfig> = {};
  
  for (const [name, field] of Object.entries(fields)) {
    if (isFieldVisible(field, values)) {
      visible[name] = field;
    }
  }
  
  return visible;
}

/**
 * Create a copy of fields with computed visibility
 */
export function createConditionalFields<T extends Record<string, any>>(
  fieldDefinitions: Record<string, ConditionalFieldConfig>
): Record<string, ConditionalFieldConfig> {
  return { ...fieldDefinitions };
}

/**
 * Helper to create showWhen conditions
 */
export function when(field: string, value?: ConditionValue, operator: ConditionOperator = "equals"): ShowCondition {
  return { field, operator, value };
}

/**
 * Combine conditions with AND
 */
export function and(...conditions: ShowCondition[]): ShowCondition {
  return { field: "", and: conditions };
}

/**
 * Combine conditions with OR
 */
export function or(...conditions: ShowCondition[]): ShowCondition {
  return { field: "", or: conditions };
}

// ============================================================================
// HOOK FOR REACTIVE CONDITIONAL FIELDS
// ============================================================================

/**
 * Hook for reactive conditional field visibility
 */
export function useConditionalFields<T extends Record<string, any>>(
  fields: Record<string, ConditionalFieldConfig>,
  values: T
) {
  return useMemo(() => {
    return filterVisibleFields(fields, values);
  }, [fields, values]);
}

/**
 * Hook to get field visibility state
 */
export function useFieldVisibility<T extends Record<string, any>>(
  field: ConditionalFieldConfig,
  values: T
): boolean {
  return useMemo(() => {
    return isFieldVisible(field, values);
  }, [field, values]);
}

// ============================================================================
// CONDITIONAL VALIDATION
// ============================================================================

export interface ValidationCondition {
  field: string;
  operator?: ConditionOperator;
  value?: ConditionValue;
  message?: string;
}

export interface FieldValidation {
  validate?: ((value: any, values?: Record<string, any>) => string | null | undefined)[];
  showErrorWhen?: ValidationCondition;
}

/**
 * Validate a field considering conditional rules
 */
export function validateField<T extends Record<string, any>>(
  field: ConditionalFieldConfig & FieldValidation,
  value: any,
  values: T
): string | null {
  // Check if field has conditional validation
  if (field.showErrorWhen !== undefined) {
    const conditionMet = evaluateCondition(
      field.showErrorWhen as ShowCondition,
      values
    );
    
    if (!conditionMet) {
      // Condition not met, skip validation
      return null;
    }
  }
  
  // Run custom validators
  if (field.validate && Array.isArray(field.validate)) {
    for (const validator of field.validate) {
      const error = validator(value, values);
      if (error) return error;
    }
  }
  
  return null;
}

// ============================================================================
// PRESET CONDITIONS
// ============================================================================

/**
 * Common condition presets
 */
export const ConditionPresets = {
  /** Field equals a specific value */
  equals: (field: string, value: ConditionValue) => when(field, value, "equals"),
  
  /** Field is not empty */
  isFilled: (field: string) => when(field, undefined, "isNotEmpty"),
  
  /** Field is empty */
  isEmpty: (field: string) => when(field, undefined, "isEmpty"),
  
  /** Field is truthy */
  isTrue: (field: string) => when(field, true, "equals"),
  
  /** Field is falsy */
  isFalse: (field: string) => when(field, false, "equals"),
  
  /** Field value is in array */
  isOneOf: (field: string, values: string[] | number[]) => when(field, values, "in"),
  
  /** Field is greater than */
  gt: (field: string, value: number) => when(field, value, "greaterThan"),
  
  /** Field is less than */
  lt: (field: string, value: number) => when(field, value, "lessThan"),
};

// ============================================================================
// EXAMPLE USAGE
// ============================================================================

/**
 * Example: Complex conditional field configuration
 * 
 * const conditionalConfig = {
 *   backgroundType: {
 *     type: "select",
 *     options: [
 *       { label: "Solid Color", value: "color" },
 *       { label: "Image", value: "image" },
 *       { label: "Gradient", value: "gradient" }
 *     ]
 *   },
 *   backgroundColor: {
 *     type: "text",
 *     label: "Background Color",
 *     showWhen: { field: "backgroundType", value: "color" }
 *   },
 *   backgroundImage: {
 *     type: "text",
 *     label: "Image URL",
 *     showWhen: { field: "backgroundType", value: "image" }
 *   },
 *   gradientStart: {
 *     type: "text",
 *     label: "Gradient Start",
 *     visibleIf: (values) => values.backgroundType === "gradient"
 *   },
 *   overlayOpacity: {
 *     type: "number",
 *     min: 0,
 *     max: 100,
 *     showWhen: {
 *       field: "backgroundType",
 *       operator: "in",
 *       value: ["image", "gradient"]
 *     }
 *   }
 * };
 */
