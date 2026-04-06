/**
 * Computed Fields - P4 Advanced Feature #51
 * 
 * Read-only computed values that are calculated from other field values.
 * The computed value updates automatically when dependencies change.
 * 
 * @example
 * const computedFields = {
 *   fullName: computed(
 *     (values) => `${values.firstName} ${values.lastName}`,
 *     ["firstName", "lastName"]
 *   ),
 *   totalPrice: computed(
 *     (values) => values.price * values.quantity,
 *     ["price", "quantity"]
 *   )
 * };
 */

import {useEffect, useMemo, useRef, useState} from "react";

// ============================================================================
// TYPES
// ============================================================================

export type ComputedValueFn<T = any> = (values: Record<string, any>) => T;

export interface ComputedFieldConfig<T = any> {
  /** The computed value function */
  compute: ComputedValueFn<T>;
  /** Fields this computation depends on */
  dependencies: string[];
  /** Format the computed value for display */
  format?: (value: T) => string;
  /** Post-process after computation */
  transform?: (value: T, rawValue: any) => T;
}

export interface ComputedField<T = any> extends ComputedFieldConfig<T> {
  type: "computed";
  /** Internal tracking ID */
  _computedId: string;
}

// ============================================================================
// PRESET COMPUTATIONS
// ============================================================================

/**
 * String concatenations
 */
export function concatComputed(
  separator: string = " ",
  ...fields: string[]
): ComputedFieldConfig<string> {
  return {
    compute: (values) => fields.map((f) => String(values[f] || "")).join(separator),
    dependencies: fields,
    format: (v) => v,
  };
}

/**
 * Numeric computations
 */
export function numericComputed(
  operation: "sum" | "average" | "min" | "max" | "count",
  ...fields: string[]
): ComputedFieldConfig<number> {
  return {
    compute: (values) => {
      const nums = fields
        .map((f) => Number(values[f]))
        .filter((n) => !isNaN(n));
      
      if (nums.length === 0) return 0;
      
      switch (operation) {
        case "sum":
          return nums.reduce((a, b) => a + b, 0);
        case "average":
          return nums.reduce((a, b) => a + b, 0) / nums.length;
        case "min":
          return Math.min(...nums);
        case "max":
          return Math.max(...nums);
        case "count":
          return nums.length;
        default:
          return 0;
      }
    },
    dependencies: fields,
    format: (v) => v.toFixed(2),
  };
}

/**
 * Boolean computations
 */
export function booleanComputed(
  fn: (values: Record<string, any>) => boolean,
  ...dependencies: string[]
): ComputedFieldConfig<boolean> {
  return {
    compute: fn,
    dependencies,
    format: (v) => v ? "Yes" : "No",
  };
}

/**
 * Conditional computed value
 */
export function conditionalComputed<T = any>(
  condition: (values: Record<string, any>) => boolean,
  trueValue: T,
  falseValue: T,
  ...dependencies: string[]
): ComputedFieldConfig<T> {
  return {
    compute: (values) => condition(values) ? trueValue : falseValue,
    dependencies,
    format: (v) => String(v),
  };
}

// ============================================================================
// MAIN FACTORY
// ============================================================================

let computedFieldCounter = 0;

/**
 * Create a computed field configuration
 */
export function computed<T = any>(
  computeFn: ComputedValueFn<T>,
  dependencies: string[],
  options?: {
    format?: (value: T) => string;
    transform?: (value: T, rawValue: any) => T;
  }
): ComputedField<T> {
  return {
    type: "computed",
    _computedId: `computed_${++computedFieldCounter}`,
    compute: computeFn,
    dependencies,
    format: options?.format,
    transform: options?.transform,
  };
}

// ============================================================================
// COMPUTED VALUES MANAGER
// ============================================================================

export class ComputedValuesManager {
  private computedFields: Map<string, ComputedFieldConfig>;
  private cache: Map<string, { value: any; dependencies: Record<string, any> }>;
  
  constructor(computedFields?: Record<string, ComputedFieldConfig>) {
    this.computedFields = new Map(Object.entries(computedFields || {}));
    this.cache = new Map();
  }
  
  /**
   * Add a computed field
   */
  addComputedField(name: string, config: ComputedFieldConfig) {
    this.computedFields.set(name, config);
    this.cache.delete(name);
  }
  
  /**
   * Remove a computed field
   */
  removeComputedField(name: string) {
    this.computedFields.delete(name);
    this.cache.delete(name);
  }
  
  /**
   * Get all computed values for given field values
   */
  computeAll(values: Record<string, any>): Record<string, any> {
    const result: Record<string, any> = {};
    
    for (const [name, config] of this.computedFields) {
      result[name] = this.computeValue(name, values);
    }
    
    return result;
  }
  
  /**
   * Compute a single field value
   */
  computeValue(name: string, values: Record<string, any>): any {
    const config = this.computedFields.get(name);
    if (!config) return undefined;
    
    // Check cache validity
    const cached = this.cache.get(name);
    if (cached) {
      const depsChanged = config.dependencies.some(
        (dep) => cached.dependencies[dep] !== values[dep]
      );
      if (!depsChanged) {
        return cached.value;
      }
    }
    
    // Compute new value
    let value = config.compute(values);
    
    // Apply transform if provided
    if (config.transform) {
      value = config.transform(value, value);
    }
    
    // Update cache
    const dependencies: Record<string, any> = {};
    config.dependencies.forEach((dep) => {
      dependencies[dep] = values[dep];
    });
    this.cache.set(name, { value, dependencies });
    
    return value;
  }
  
  /**
   * Get computed field configuration
   */
  getComputedField(name: string): ComputedFieldConfig | undefined {
    return this.computedFields.get(name);
  }
  
  /**
   * Get all computed field names
   */
  getComputedFieldNames(): string[] {
    return Array.from(this.computedFields.keys());
  }
  
  /**
   * Check if a field is computed
   */
  isComputed(name: string): boolean {
    return this.computedFields.has(name);
  }
  
  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }
}

// ============================================================================
// HOOK FOR REACTIVE COMPUTED VALUES
// ============================================================================

/**
 * Hook for reactive computed values
 */
export function useComputedValues<T extends Record<string, any>>(
  values: T,
  computedFields: Record<string, ComputedFieldConfig>
): Record<string, any> {
  const managerRef = useRef<ComputedValuesManager | null>(null);
  
  // Initialize manager once
  if (!managerRef.current) {
    managerRef.current = new ComputedValuesManager(computedFields);
  }
  
  // Track if computedFields changed
  const computedFieldsJson = JSON.stringify(computedFields);
  
  // Update manager when computedFields change
  useEffect(() => {
    if (managerRef.current) {
      Object.entries(computedFields).forEach(([name, config]) => {
        if (!managerRef.current!.getComputedField(name)) {
          managerRef.current!.addComputedField(name, config);
        }
      });
    }
  }, [computedFieldsJson]);
  
  // Compute all values
  const computed = useMemo(() => {
    if (!managerRef.current) return {};
    return managerRef.current.computeAll(values);
  }, [values, computedFieldsJson]);
  
  return computed;
}

/**
 * Hook for a single computed value
 */
export function useComputed<T = any>(
  computeFn: ComputedValueFn<T>,
  dependencies: string[],
  values: Record<string, any>,
  options?: {
    format?: (value: T) => string;
  }
): { value: T; formatted: string } {
  const [value, setValue] = useState<T>(() => computeFn(values));
  const [formatted, setFormatted] = useState<string>(() => 
    options?.format ? options.format(value) : String(value)
  );
  
  useEffect(() => {
    const newValue = computeFn(values);
    setValue(newValue);
    setFormatted(options?.format ? options.format(newValue) : String(newValue));
  }, [values, computeFn, options?.format]);
  
  return { value, formatted };
}

// ============================================================================
// RESOLVER INTEGRATION
// ============================================================================

/**
 * Create a resolveData function that includes computed values
 */
export function createComputedDataResolver(
  computedFields: Record<string, ComputedFieldConfig>
) {
  return function resolveComputedData(
    data: Record<string, any>,
    params: {
      changed: Partial<Record<string, boolean>>;
      lastData: Record<string, any> | null;
      trigger: string;
    }
  ): Record<string, any> {
    const { changed, lastData } = params;
    
    // Check if any dependency changed
    const dependencyNames = new Set<string>();
    Object.values(computedFields).forEach((config) => {
      config.dependencies.forEach((dep) => dependencyNames.add(dep));
    });
    
    const dependencyChanged = Object.keys(changed).some(
      (key) => dependencyNames.has(key) && changed[key]
    );
    
    if (!dependencyChanged && lastData) {
      // Return last computed values if nothing changed
      const lastComputed: Record<string, any> = {};
      Object.keys(computedFields).forEach((name) => {
        if (lastData[name] !== undefined) {
          lastComputed[name] = lastData[name];
        }
      });
      return { ...data, ...lastComputed };
    }
    
    // Compute new values
    const manager = new ComputedValuesManager(computedFields);
    return { ...data, ...manager.computeAll(data) };
  };
}

// ============================================================================
// EXAMPLE USAGE
// ============================================================================

/**
 * Example: E-commerce computed fields
 * 
 * const computedFieldsConfig = {
 *   fullName: computed(
 *     (v) => `${v.firstName || ""} ${v.lastName || ""}`.trim(),
 *     ["firstName", "lastName"],
 *     { format: (v) => v || "Unnamed" }
 *   ),
 *   
 *   subtotal: computed(
 *     (v) => (v.price || 0) * (v.quantity || 0),
 *     ["price", "quantity"],
 *     { format: (v) => `$${v.toFixed(2)}` }
 *   ),
 *   
 *   discount: computed(
 *     (v) => v.subtotal * ((v.discountPercent || 0) / 100),
 *     ["subtotal", "discountPercent"],
 *     { format: (v) => `$${v.toFixed(2)}` }
 *   ),
 *   
 *   total: computed(
 *     (v) => v.subtotal - v.discount,
 *     ["subtotal", "discount"],
 *     { format: (v) => `$${v.toFixed(2)}` }
 *   ),
 *   
 *   isValid: booleanComputed(
 *     (v) => v.price > 0 && v.quantity > 0 && v.fullName.length > 0,
 *     "price", "quantity", "fullName"
 *   )
 * };
 */
