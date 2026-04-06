/**
 * Async Field Options - P4 Advanced Feature #53
 * 
 * Dynamic select options that are fetched asynchronously based on context.
 * Supports caching, dependent options, and debouncing.
 * 
 * @example
 * const fields = {
 *   category: {
 *     type: "select",
 *     options: async () => fetchCategories(),
 *     optionsDependsOn: []
 *   },
 *   subcategory: {
 *     type: "select",
 *     options: async (values) => fetchSubcategories(values.category),
 *     optionsDependsOn: ["category"]
 *   }
 * };
 */

import type {SelectField} from "@puckeditor/core";
import {useCallback, useEffect, useRef, useState} from "react";

// ============================================================================
// TYPES
// ============================================================================

export type FieldOption = {
  label: string;
  value: string | number | boolean | null;
  disabled?: boolean;
  group?: string;
  description?: string;
};

export type OptionsLoader = (
  values?: Record<string, any>,
  context?: LoadOptionsContext
) => Promise<FieldOption[]>;

export interface LoadOptionsContext {
  /** The field name being loaded */
  fieldName: string;
  /** Current form values */
  values: Record<string, any>;
  /** API client for fetching */
  api: OptionsAPIClient;
  /** Abort signal for cancellation */
  signal?: AbortSignal;
  /** Cache key for this load */
  cacheKey?: string;
}

export interface OptionsAPIClient {
  get: <T = any>(url: string, params?: Record<string, any>) => Promise<T>;
  post: <T = any>(url: string, body?: Record<string, any>) => Promise<T>;
}

export interface AsyncOptionsField extends SelectField {
  options: OptionsLoader | FieldOption[];
  /** Fields that trigger option reload when changed */
  optionsDependsOn?: string[];
  /** Cache options for this duration (ms) */
  optionsCacheDuration?: number;
  /** Show loading state */
  optionsLoading?: boolean;
  /** Custom placeholder while loading */
  optionsPlaceholder?: string;
}

export interface OptionsCache {
  data: FieldOption[];
  timestamp: number;
  cacheKey: string;
}

// ============================================================================
// CACHE MANAGEMENT
// ============================================================================

class OptionsCacheManager {
  private cache: Map<string, OptionsCache> = new Map();
  private defaultDuration: number = 60000; // 1 minute
  
  /**
   * Get cached options if valid
   */
  get(cacheKey: string, maxAge?: number): FieldOption[] | null {
    const cached = this.cache.get(cacheKey);
    if (!cached) return null;
    
    const age = Date.now() - cached.timestamp;
    const maxAgeConfigured = maxAge || this.defaultDuration;
    
    if (age > maxAgeConfigured) {
      this.cache.delete(cacheKey);
      return null;
    }
    
    return cached.data;
  }
  
  /**
   * Set cached options
   */
  set(cacheKey: string, data: FieldOption[]): void {
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      cacheKey,
    });
  }
  
  /**
   * Invalidate cache for a specific key pattern
   */
  invalidate(pattern?: string | RegExp): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }
    
    if (typeof pattern === "string") {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      for (const key of this.cache.keys()) {
        if (pattern.test(key)) {
          this.cache.delete(key);
        }
      }
    }
  }
  
  /**
   * Set default cache duration
   */
  setDefaultDuration(ms: number): void {
    this.defaultDuration = ms;
  }
}

// Global cache instance
export const optionsCache = new OptionsCacheManager();

// ============================================================================
// OPTIONS LOADER
// ============================================================================

/**
 * Create an async options loader with caching
 */
export function createAsyncOptionsLoader(
  loader: OptionsLoader,
  options: {
    cacheKey?: string;
    cacheDuration?: number;
  } = {}
): OptionsLoader {
  const { cacheKey, cacheDuration } = options;
  
  return async (values, context) => {
    // Generate cache key
    const key = cacheKey || (context?.fieldName || "options");
    const depsValues = values ? JSON.stringify(values) : "";
    const fullCacheKey = `${key}_${depsValues}`;
    
    // Check cache
    const cached = optionsCache.get(fullCacheKey, cacheDuration);
    if (cached) {
      return cached;
    }
    
    // Load fresh
    const data = await loader(values, context);
    
    // Cache result
    optionsCache.set(fullCacheKey, data);
    
    return data;
  };
}

/**
 * Create a dependent options loader
 */
export function createDependentOptionsLoader(
  loader: OptionsLoader,
  dependencyField: string | string[]
): OptionsLoader {
  return async (values, context) => {
    const deps = Array.isArray(dependencyField) ? dependencyField : [dependencyField];
    
    // Check if all dependencies have values
    const hasAllDeps = deps.every((dep) => {
      const value = values?.[dep];
      return value !== null && value !== undefined && value !== "";
    });
    
    if (!hasAllDeps) {
      return [];
    }
    
    return loader(values, context);
  };
}

// ============================================================================
// PRESET LOADERS
// ============================================================================

/**
 * Create an API-based options loader
 */
export function createApiOptionsLoader(
  endpoint: string,
  options: {
    method?: "GET" | "POST";
    params?: Record<string, any>;
    mapResponse?: (data: any) => FieldOption[];
    valueKey?: string;
    labelKey?: string;
  } = {}
): OptionsLoader {
  const { 
    method = "GET", 
    params = {}, 
    mapResponse,
    valueKey = "id",
    labelKey = "name" 
  } = options;
  
  return async (_, context) => {
    const api = context?.api;
    if (!api) {
      throw new Error("API client not provided");
    }
    
    let data: any[];
    
    if (method === "GET") {
      data = await api.get(endpoint, params);
    } else {
      data = await api.post(endpoint, params);
    }
    
    if (!Array.isArray(data)) {
      data = [];
    }
    
    if (mapResponse) {
      return mapResponse(data);
    }
    
    return data.map((item) => ({
      value: item[valueKey],
      label: item[labelKey],
    }));
  };
}

/**
 * Create options loader from static data
 */
export function createStaticOptionsLoader(
  options: FieldOption[] | Record<string, string>
): OptionsLoader {
  return async () => {
    if (Array.isArray(options)) {
      return options;
    }
    
    return Object.entries(options).map(([value, label]) => ({
      value,
      label,
    }));
  };
}

/**
 * Create grouped options loader
 */
export function createGroupedOptionsLoader(
  groups: Record<string, FieldOption[]>
): OptionsLoader {
  return async () => {
    const result: FieldOption[] = [];
    
    for (const [groupName, groupOptions] of Object.entries(groups)) {
      for (const option of groupOptions) {
        result.push({
          ...option,
          group: groupName,
        });
      }
    }
    
    return result;
  };
}

// ============================================================================
// OPTIONS STATE MANAGER
// ============================================================================

export interface OptionsState {
  options: FieldOption[];
  loading: boolean;
  error: string | null;
}

export class OptionsStateManager {
  private loaders: Map<string, OptionsLoader> = new Map();
  private state: Map<string, OptionsState> = new Map();
  private listeners: Map<string, Set<(state: OptionsState) => void>> = new Map();
  private abortControllers: Map<string, AbortController> = new Map();
  
  /**
   * Register an options loader for a field
   */
  registerLoader(fieldName: string, loader: OptionsLoader): void {
    this.loaders.set(fieldName, loader);
    this.state.set(fieldName, {
      options: [],
      loading: false,
      error: null,
    });
  }
  
  /**
   * Unregister a field's loader
   */
  unregisterLoader(fieldName: string): void {
    this.loaders.delete(fieldName);
    this.state.delete(fieldName);
    this.abortControllers.delete(fieldName);
  }
  
  /**
   * Load options for a field
   */
  async loadOptions(
    fieldName: string,
    values: Record<string, any>,
    api: OptionsAPIClient
  ): Promise<FieldOption[]> {
    const loader = this.loaders.get(fieldName);
    if (!loader) return [];
    
    // Cancel previous request
    const prevController = this.abortControllers.get(fieldName);
    if (prevController) {
      prevController.abort();
    }
    
    // Create new abort controller
    const controller = new AbortController();
    this.abortControllers.set(fieldName, controller);
    
    // Set loading state
    this.updateState(fieldName, {
      loading: true,
      error: null,
    });
    
    try {
      const context: LoadOptionsContext = {
        fieldName,
        values,
        api,
        signal: controller.signal,
      };
      
      const options = await loader(values, context);
      
      this.updateState(fieldName, {
        options,
        loading: false,
      });
      
      return options;
    } catch (error: any) {
      if (error.name === "AbortError") {
        return [];
      }
      
      const message = error.message || "Failed to load options";
      this.updateState(fieldName, {
        loading: false,
        error: message,
      });
      
      return [];
    }
  }
  
  /**
   * Get current state for a field
   */
  getState(fieldName: string): OptionsState {
    return this.state.get(fieldName) || {
      options: [],
      loading: false,
      error: null,
    };
  }
  
  /**
   * Subscribe to state changes
   */
  subscribe(fieldName: string, listener: (state: OptionsState) => void): () => void {
    if (!this.listeners.has(fieldName)) {
      this.listeners.set(fieldName, new Set());
    }
    
    this.listeners.get(fieldName)!.add(listener);
    
    return () => {
      this.listeners.get(fieldName)?.delete(listener);
    };
  }
  
  /**
   * Update state and notify listeners
   */
  private updateState(fieldName: string, partial: Partial<OptionsState>): void {
    const current = this.state.get(fieldName) || {
      options: [],
      loading: false,
      error: null,
    };
    
    const updated = { ...current, ...partial };
    this.state.set(fieldName, updated);
    
    const listeners = this.listeners.get(fieldName);
    if (listeners) {
      listeners.forEach((listener) => listener(updated));
    }
  }
  
  /**
   * Clear all state
   */
  clear(): void {
    this.loaders.clear();
    this.state.clear();
    this.listeners.clear();
    
    for (const controller of this.abortControllers.values()) {
      controller.abort();
    }
    this.abortControllers.clear();
  }
}

// ============================================================================
// HOOK FOR ASYNC OPTIONS
// ============================================================================

export interface UseAsyncOptionsOptions {
  enabled?: boolean;
  debounceMs?: number;
  cacheDuration?: number;
}

export function useAsyncOptions(
  loader: OptionsLoader,
  values: Record<string, any>,
  options: UseAsyncOptionsOptions = {}
) {
  const { enabled = true, debounceMs = 200, cacheDuration } = options;
  
  const [state, setState] = useState<OptionsState>({
    options: [],
    loading: false,
    error: null,
  });
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const loadOptions = useCallback(
    async (currentValues: Record<string, any>) => {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Clear debounce timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      const doLoad = async () => {
        abortControllerRef.current = new AbortController();
        
        setState((prev) => ({ ...prev, loading: true, error: null }));
        
        try {
          const context: LoadOptionsContext = {
            fieldName: "",
            values: currentValues,
            api: {
              get: async (url, params) => {
                const searchParams = new URLSearchParams(params || {});
                const query = searchParams.toString();
                const response = await fetch(`${url}${query ? `?${query}` : ""}`, {
                  signal: abortControllerRef.current?.signal,
                });
                return response.json();
              },
              post: async (url, body) => {
                const response = await fetch(url, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(body || {}),
                  signal: abortControllerRef.current?.signal,
                });
                return response.json();
              },
            },
            signal: abortControllerRef.current?.signal,
          };
          
          // Check cache first
          if (cacheDuration !== undefined) {
            const cacheKey = `async_${JSON.stringify(currentValues)}`;
            const cached = optionsCache.get(cacheKey, cacheDuration);
            if (cached) {
              setState({ options: cached, loading: false, error: null });
              return;
            }
          }
          
          const options = await loader(currentValues, context);
          
          setState({ options, loading: false, error: null });
          
          // Cache result
          if (cacheDuration !== undefined) {
            const cacheKey = `async_${JSON.stringify(currentValues)}`;
            optionsCache.set(cacheKey, options);
          }
        } catch (error: any) {
          if (error.name !== "AbortError") {
            setState({
              options: [],
              loading: false,
              error: error.message || "Failed to load options",
            });
          }
        }
      };
      
      if (debounceMs > 0) {
        timeoutRef.current = setTimeout(doLoad, debounceMs);
      } else {
        doLoad();
      }
    },
    [loader, debounceMs, cacheDuration]
  );
  
  useEffect(() => {
    if (enabled) {
      loadOptions(values);
    }
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, values, loadOptions]);
  
  const refetch = useCallback(() => {
    loadOptions(values);
  }, [values, loadOptions]);
  
  return {
    ...state,
    refetch,
    reload: refetch,
  };
}

// ============================================================================
// EXAMPLE USAGE
// ============================================================================

/**
 * Example: Dynamic category/subcategory options
 * 
 * const categoryOptionsLoader = createApiOptionsLoader("/api/categories", {
 *   valueKey: "id",
 *   labelKey: "name"
 * });
 * 
 * const subcategoryOptionsLoader = async (values) => {
 *   if (!values.categoryId) return [];
 *   const response = await fetch(`/api/categories/${values.categoryId}/subcategories`);
 *   const data = await response.json();
 *   return data.map(item => ({ value: item.id, label: item.name }));
 * };
 * 
 * const config = {
 *   fields: {
 *     category: {
 *       type: "select",
 *       options: categoryOptionsLoader,
 *       optionsDependsOn: []
 *     },
 *     subcategory: {
 *       type: "select",
 *       options: subcategoryOptionsLoader,
 *       optionsDependsOn: ["category"],
 *       optionsLoading: true,
 *       optionsPlaceholder: "Select a subcategory"
 *     }
 *   }
 * };
 */
