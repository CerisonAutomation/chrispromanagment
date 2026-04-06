/**
 * Field Dependencies - P4 Advanced Feature #49
 * 
 * Enables fields that depend on other field values using resolveFields pattern.
 * When one field changes, dependent fields can update their configuration dynamically.
 * 
 * @example
 * const config = {
 *   fields: {
 *     layout: { type: "select", options: [...] },
 *     columns: { type: "number", dependsOn: "layout" },
 *     gap: { type: "number", dependsOn: ["layout", "columns"] }
 *   },
 *   resolveFields: resolveFieldDependencies
 * }
 */

import type {Field, Fields} from "@puckeditor/core";
import {useEffect, useState} from "react";

// ============================================================================
// TYPES
// ============================================================================

export type DependencyValue = string | number | boolean | null | undefined;

export type DependencyCondition = 
  | DependencyValue
  | DependencyValue[]
  | ((currentValue: any, allValues: Record<string, any>) => boolean);

export interface FieldDependency {
  /** Field names this field depends on */
  dependsOn: string | string[];
  /** Condition for when this dependency is active */
  condition?: DependencyCondition;
  /** Transform the field based on dependency values */
  transform?: (field: Field<any>, currentValues: Record<string, any>) => Field<any>;
  /** Override field visibility based on dependencies */
  visible?: (currentValues: Record<string, any>) => boolean;
  /** Override field readOnly based on dependencies */
  readOnly?: (currentValues: Record<string, any>) => boolean;
}

export type FieldDependencyMap = {
  [fieldName: string]: FieldDependency;
};

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Check if a condition is met for dependency evaluation
 */
function evaluateCondition(
  condition: DependencyCondition | undefined,
  currentValue: any,
  allValues: Record<string, any>
): boolean {
  if (condition === undefined) return true;
  
  if (typeof condition === "function") {
    return condition(currentValue, allValues);
  }
  
  if (Array.isArray(condition)) {
    return condition.includes(currentValue);
  }
  
  return condition === currentValue;
}

/**
 * Get current values from component data for dependency resolution
 */
export function getDependencyValues(
  componentData: Record<string, any>,
  dependencyMap: FieldDependencyMap
): Record<string, any> {
  const dependencyFields = new Set<string>();
  
  Object.values(dependencyMap).forEach((dep) => {
    const fields = Array.isArray(dep.dependsOn) ? dep.dependsOn : [dep.dependsOn];
    fields.forEach((f) => dependencyFields.add(f));
  });
  
  const values: Record<string, any> = {};
  dependencyFields.forEach((field) => {
    values[field] = componentData[field];
  });
  
  return values;
}

// ============================================================================
// MAIN RESOLVER
// ============================================================================

/**
 * Creates a resolveFields function that handles field dependencies.
 * 
 * @param dependencyMap - Map of field names to their dependency configurations
 * @param baseFields - Original field definitions (optional, for type safety)
 * @returns A resolveFields function compatible with Puck component config
 */
export function createFieldDependencyResolver(
  dependencyMap: FieldDependencyMap,
  baseFields?: Fields
) {
  return async function resolveFieldDependencies(
    data: Record<string, any>,
    params: {
      changed: Partial<Record<string, boolean>>;
      fields: Fields;
      lastFields: Fields;
      lastData: Record<string, any> | null;
      metadata: any;
      appState: any;
      parent: any;
    }
  ): Promise<Fields> {
    const { changed, fields, lastData } = params;
    const currentValues = { ...data };
    
    // Determine which fields need recalculation
    const changedFields = Object.keys(changed).filter((k) => changed[k]);
    const affectedFields = new Set<string>(changedFields);
    
    // Add fields that depend on changed fields
    Object.entries(dependencyMap).forEach(([fieldName, dependency]) => {
      const deps = Array.isArray(dependency.dependsOn) 
        ? dependency.dependsOn 
        : [dependency.dependsOn];
      
      if (deps.some((d) => changedFields.includes(d) || affectedFields.has(d))) {
        affectedFields.add(fieldName);
      }
    });
    
    // Build updated fields
    const updatedFields = { ...fields };
    
    for (const fieldName of affectedFields) {
      const dependency = dependencyMap[fieldName];
      
      if (!dependency) continue;
      
      const originalField = updatedFields[fieldName];
      if (!originalField) continue;
      
      const deps = Array.isArray(dependency.dependsOn) 
        ? dependency.dependsOn 
        : [dependency.dependsOn];
      
      // Check if condition is met
      const depsMet = deps.every((depField) => {
        const condition = dependency.condition;
        const value = currentValues[depField];
        return evaluateCondition(condition, value, currentValues);
      });
      
      if (!depsMet) continue;
      
      // Apply visibility
      if (dependency.visible !== undefined) {
        (originalField as any).visible = dependency.visible(currentValues);
      }
      
      // Apply readOnly
      if (dependency.readOnly !== undefined) {
        (originalField as any).readOnly = dependency.readOnly(currentValues);
      }
      
      // Apply transformations
      if (dependency.transform) {
        const transformed = dependency.transform(originalField, currentValues);
        updatedFields[fieldName] = transformed;
      }
    }
    
    return updatedFields;
  };
}

// ============================================================================
// PRESET TRANSFORMATIONS
// ============================================================================

/**
 * Preset: Update select options based on dependency value
 */
export function updateOptionsFromDependency(
  field: Field<any>,
  dependencyField: string,
  optionsMap: Record<string, { label: string; value: string }[]>
): Field<any> {
  if (field.type !== "select") return field;
  
  return {
    ...field,
    options: optionsMap[dependencyField] || field.options,
  } as Field<any>;
}

/**
 * Preset: Set min/max based on dependency value
 */
export function updateMinMaxFromDependency(
  field: Field<any>,
  dependencyField: string,
  ranges: Record<string, { min?: number; max?: number }>
): Field<any> {
  if (field.type !== "number") return field;
  
  const range = ranges[dependencyField] || {};
  
  return {
    ...field,
    min: range.min ?? field.min,
    max: range.max ?? field.max,
  } as Field<any>;
}

/**
 * Preset: Update placeholder text based on dependency
 */
export function updatePlaceholderFromDependency(
  field: Field<any>,
  dependencyField: string,
  placeholders: Record<string, string>
): Field<any> {
  return {
    ...field,
    placeholder: placeholders[dependencyField] || field.placeholder,
  } as Field<any>;
}

// ============================================================================
// HOOK FOR REACTIVE DEPENDENCIES
// ============================================================================

/**
 * Hook for reactive field dependency updates in React components
 */
export function useFieldDependencies<T extends Record<string, any>>(
  values: T,
  dependencyMap: FieldDependencyMap
) {
  const [visibility, setVisibility] = useState<Record<string, boolean>>({});
  const [readOnly, setReadOnly] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    const newVisibility: Record<string, boolean> = {};
    const newReadOnly: Record<string, boolean> = {};
    
    Object.entries(dependencyMap).forEach(([fieldName, dependency]) => {
      if (dependency.visible !== undefined) {
        newVisibility[fieldName] = dependency.visible(values);
      }
      if (dependency.readOnly !== undefined) {
        newReadOnly[fieldName] = dependency.readOnly(values);
      }
    });
    
    setVisibility(newVisibility);
    setReadOnly(newReadOnly);
  }, [values, dependencyMap]);
  
  return { visibility, readOnly };
}

// ============================================================================
// EXAMPLE USAGE
// ============================================================================

/**
 * Example: Layout-dependent field configuration
 * 
 * const layoutDependency: FieldDependencyMap = {
 *   gridColumns: {
 *     dependsOn: "layout",
 *     transform: (field, values) => {
 *       if (values.layout === "grid") {
 *         return { ...field, min: 1, max: 12 };
 *       }
 *       return { ...field, visible: false };
 *     }
 *   },
 *   flexDirection: {
 *     dependsOn: "layout",
 *     visible: (values) => values.layout === "flex"
 *   }
 * };
 */
