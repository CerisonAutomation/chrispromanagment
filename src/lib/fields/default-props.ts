/**
 * Default Props from Data - P4 Advanced Feature #58
 * 
 * Dynamic defaultProps based on context, parent data, or external data sources.
 * Provides sophisticated default value resolution.
 * 
 * @example
 * const config = {
 *   defaultProps: (context) => ({
 *     title: context.parent?.props?.title || "Default Title",
 *     count: context.count + 1,
 *   })
 * };
 */

import {useCallback, useEffect, useState} from "react";

// ============================================================================
// TYPES
// ============================================================================

export interface DefaultPropsContext {
  /** Parent component data */
  parent?: ComponentData;
  /** Root data */
  root?: Record<string, any>;
  /** Current data */
  data?: Record<string, any>;
  /** Component index in parent */
  index?: number;
  /** Component type */
  componentType?: string;
  /** User data */
  user?: {
    id: string;
    name?: string;
    email?: string;
    role?: string;
    [key: string]: any;
  };
  /** URL parameters */
  params?: Record<string, string>;
  /** Query parameters */
  query?: Record<string, string>;
  /** External data sources */
  external?: Record<string, any>;
  /** App state */
  appState?: any;
}

export interface ComponentData {
  type: string;
  props: Record<string, any>;
  id?: string;
  content?: ComponentData[];
}

export type DefaultPropsResolver = (
  context: DefaultPropsContext
) => Record<string, any> | Promise<Record<string, any>>;

export type StaticDefaultProps = Record<string, any>;

export type DefaultPropsConfig = 
  | StaticDefaultProps
  | DefaultPropsResolver
  | ((context: DefaultPropsContext) => StaticDefaultProps);

// ============================================================================
// DEFAULT VALUE TYPES
// ============================================================================

export type DefaultValueType = 
  | string
  | number
  | boolean
  | null
  | undefined
  | Date
  | Record<string, any>
  | any[]
  | ((context: DefaultPropsContext) => any);

export interface DefaultValueConfig {
  /** Static default value */
  value?: DefaultValueType;
  /** Dynamic default value resolver */
  resolve?: (context: DefaultPropsContext) => any;
  /** Default value based on another field */
  copyFrom?: string;
  /** Conditional default value */
  conditional?: Array<{
    when: (context: DefaultPropsContext) => boolean;
    then: DefaultValueType;
  }>;
  /** Transform the resolved value */
  transform?: (value: any, context: DefaultPropsContext) => any;
}

// ============================================================================
// DEFAULT PROPS ENGINE
// ============================================================================

export class DefaultPropsEngine {
  private resolvers: Map<string, DefaultValueConfig> = new Map();
  
  /**
   * Register a default value config for a field
   */
  register(fieldName: string, config: DefaultValueConfig): void {
    this.resolvers.set(fieldName, config);
  }
  
  /**
   * Register multiple default value configs
   */
  registerAll(configs: Record<string, DefaultValueConfig>): void {
    Object.entries(configs).forEach(([name, config]) => {
      this.register(name, config);
    });
  }
  
  /**
   * Resolve a single field's default value
   */
  resolve(fieldName: string, context: DefaultPropsContext): any {
    const config = this.resolvers.get(fieldName);
    
    if (!config) {
      return undefined;
    }
    
    // Check conditional defaults
    if (config.conditional) {
      for (const cond of config.conditional) {
        if (cond.when(context)) {
          return this.resolveValue(cond.then, context);
        }
      }
    }
    
    // Copy from another field
    if (config.copyFrom !== undefined) {
      const sourceValue = this.getNestedValue(context.data || {}, config.copyFrom);
      if (config.transform) {
        return config.transform(sourceValue, context);
      }
      return sourceValue;
    }
    
    // Resolve dynamic value
    if (config.resolve) {
      const value = config.resolve(context);
      if (config.transform) {
        return config.transform(value, context);
      }
      return value;
    }
    
    // Static value
    if (config.value !== undefined) {
      return this.resolveValue(config.value, context);
    }
    
    return undefined;
  }
  
  /**
   * Resolve all default values
   */
  resolveAll(context: DefaultPropsContext): Record<string, any> {
    const defaults: Record<string, any> = {};
    
    for (const [fieldName] of this.resolvers) {
      const value = this.resolve(fieldName, context);
      if (value !== undefined) {
        defaults[fieldName] = value;
      }
    }
    
    return defaults;
  }
  
  /**
   * Merge defaults with existing values
   */
  mergeWithDefaults(
    existing: Record<string, any>,
    context: DefaultPropsContext,
    options: {
      overrideExisting?: boolean;
      onlyMissing?: boolean;
    } = {}
  ): Record<string, any> {
    const { overrideExisting = false, onlyMissing = true } = options;
    const defaults = this.resolveAll(context);
    
    const result = { ...existing };
    
    for (const [key, value] of Object.entries(defaults)) {
      if (overrideExisting) {
        result[key] = value;
      } else if (onlyMissing) {
        if (!(key in existing) || existing[key] === undefined || existing[key] === null) {
          result[key] = value;
        }
      } else {
        if (!(key in existing)) {
          result[key] = value;
        }
      }
    }
    
    return result;
  }
  
  /**
   * Clear all registered resolvers
   */
  clear(): void {
    this.resolvers.clear();
  }
  
  /**
   * Get nested value using dot notation
   */
  private getNestedValue(obj: Record<string, any>, path: string): any {
    return path.split(".").reduce((current, key) => {
      return current?.[key];
    }, obj);
  }
  
  /**
   * Resolve a value that might be a function
   */
  private resolveValue(value: any, context: DefaultPropsContext): any {
    if (typeof value === "function") {
      return value(context);
    }
    return value;
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create a static default value config
 */
export function defaultValue<T = any>(value: T): DefaultValueConfig {
  return { value };
}

/**
 * Create a dynamic default value config
 */
export function dynamicDefault(
  resolve: (context: DefaultPropsContext) => any
): DefaultValueConfig {
  return { resolve };
}

/**
 * Copy default value from another field
 */
export function copyFrom(
  fieldPath: string,
  transform?: (value: any) => any
): DefaultValueConfig {
  return {
    copyFrom: fieldPath,
    transform: transform ? (v) => transform(v) : undefined,
  };
}

/**
 * Create a conditional default value
 */
export function conditionalDefault(
  conditions: Array<{
    when: (context: DefaultPropsContext) => boolean;
    then: DefaultValueType;
  }>
): DefaultValueConfig {
  return { conditional: conditions };
}

/**
 * Create default value based on parent
 */
export function fromParent(fieldPath: string): DefaultValueConfig {
  return {
    resolve: (context) => {
      return context.parent?.props?.[fieldPath];
    },
  };
}

/**
 * Create default value based on index
 */
export function fromIndex(transform?: (index: number) => any): DefaultValueConfig {
  return {
    resolve: (context) => {
      const value = context.index ?? 0;
      return transform ? transform(value) : value;
    },
  };
}

/**
 * Create incrementing default value
 */
export function incrementFrom(start: number = 1): DefaultValueConfig {
  let counter = start;
  return {
    resolve: () => counter++,
  };
}

/**
 * Create a unique ID default
 */
export function generateId(prefix: string = "id"): DefaultValueConfig {
  return {
    resolve: () => `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  };
}

/**
 * Create timestamp default
 */
export function timestamp(
  type: "created" | "updated" | "now" = "now"
): DefaultValueConfig {
  return {
    resolve: () => {
      switch (type) {
        case "created":
          return new Date().toISOString();
        case "updated":
          return new Date().toISOString();
        default:
          return Date.now();
      }
    },
  };
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook for resolving default props
 */
export function useDefaultProps(
  config: DefaultPropsConfig,
  context: DefaultPropsContext
) {
  const [defaults, setDefaults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  
  const resolveDefaults = useCallback(async () => {
    setLoading(true);
    
    try {
      let resolved: Record<string, any>;
      
      if (typeof config === "function") {
        resolved = await Promise.resolve(config(context));
      } else {
        resolved = config;
      }
      
      setDefaults(resolved);
    } finally {
      setLoading(false);
    }
  }, [config, context]);
  
  useEffect(() => {
    resolveDefaults();
  }, [resolveDefaults]);
  
  return { defaults, loading, refetch: resolveDefaults };
}

/**
 * Hook for a single default value
 */
export function useDefaultValue(
  fieldName: string,
  engine: DefaultPropsEngine,
  context: DefaultPropsContext
) {
  const [value, setValue] = useState<any>(undefined);
  
  useEffect(() => {
    const resolved = engine.resolve(fieldName, context);
    setValue(resolved);
  }, [engine, fieldName, context]);
  
  return value;
}

// ============================================================================
// MERGE UTILITIES
// ============================================================================

/**
 * Merge static and dynamic defaults
 */
export function mergeDefaultProps(
  ...sources: Array<DefaultPropsConfig | Record<string, any>>
): DefaultPropsConfig {
  return (context) => {
    const result: Record<string, any> = {};
    
    for (const source of sources) {
      let values: Record<string, any>;
      
      if (typeof source === "function") {
        values = source(context);
      } else {
        values = source;
      }
      
      Object.assign(result, values);
    }
    
    return result;
  };
}

/**
 * Override defaults with user preferences
 */
export function withUserDefaults(
  defaults: DefaultPropsConfig,
  userPreferences: Record<string, any>
): DefaultPropsConfig {
  return (context) => {
    const resolvedDefaults = typeof defaults === "function"
      ? defaults(context)
      : defaults;
    
    return {
      ...resolvedDefaults,
      ...userPreferences,
    };
  };
}

// ============================================================================
// RESOLVER INTEGRATION
// ============================================================================

/**
 * Create a resolveData function that includes default props resolution
 */
export function createDefaultPropsResolver(
  defaultPropsConfig: DefaultPropsConfig
) {
  return async function resolveWithDefaults(
    data: Record<string, any>,
    params: {
      trigger: string;
      lastData: Record<string, any> | null;
      changed?: Record<string, boolean>;
      parent?: ComponentData;
    }
  ): Promise<Record<string, any>> {
    // Only apply defaults on insert or load
    if (params.trigger !== "insert" && params.trigger !== "load") {
      return data;
    }
    
    const context: DefaultPropsContext = {
      parent: params.parent,
      data,
      index: params.changed?.index as number,
      appState: params,
    };
    
    let defaults: Record<string, any>;
    
    if (typeof defaultPropsConfig === "function") {
      defaults = await Promise.resolve(defaultPropsConfig(context));
    } else {
      defaults = defaultPropsConfig;
    }
    
    // Merge with existing data, don't override
    return {
      ...defaults,
      ...data,
    };
  };
}

// ============================================================================
// EXAMPLE USAGE
// ============================================================================

/**
 * Example: E-commerce product defaults
 * 
 * const productDefaultProps: DefaultPropsConfig = {
 *   // Static defaults
 *   status: "draft",
 *   visibility: true,
 *   // Dynamic defaults based on context
 *   sku: (context) => `SKU-${Date.now()}`,
 *   // Conditional defaults
 *   category: conditionalDefault([
 *     {
 *       when: (ctx) => ctx.parent?.type === "CategoryPage",
 *       then: copyFrom("parent.props.defaultCategory")
 *     },
 *     {
 *       when: (ctx) => ctx.index === 0,
 *       then: "featured"
 *     }
 *   ]),
 *   // From parent
 *   brand: fromParent("brand"),
 * };
 * 
 * // In Puck config
 * const config = {
 *   defaultProps: productDefaultProps,
 *   fields: {
 *     title: { type: "text" },
 *     sku: { type: "text" },
 *     status: { type: "select", options: [...] },
 *     category: { type: "text" },
 *     brand: { type: "text" },
 *   }
 * };
 */

/**
 * Example: Using DefaultPropsEngine
 * 
 * const engine = new DefaultPropsEngine();
 * 
 * engine.registerAll({
 *   title: { value: "Untitled" },
 *   order: { resolve: (ctx) => (ctx.index ?? 0) + 1 },
 *   createdAt: { resolve: () => new Date().toISOString() },
 *   slug: { 
 *     resolve: (ctx) => ctx.data?.title?.toLowerCase().replace(/\s+/g, "-")
 *   },
 * });
 * 
 * // Later, when inserting a new component
 * const defaults = engine.mergeWithDefaults(
 *   {}, // no existing values
 *   { index: 5, parent: { type: "List", props: {} } },
 *   { onlyMissing: true }
 * );
 * 
 * // defaults = { title: "Untitled", order: 6, createdAt: "2024-...", slug: "untitled" }
 */
