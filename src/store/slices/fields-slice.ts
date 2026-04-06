/**
 * Fields Slice - Manages field definitions and resolution
 * Part of the modular slice architecture
 */

import type {ComponentData, Fields} from "../../types";

// =============================================================================
// Types
// =============================================================================

type ComponentOrRootData = Omit<ComponentData, "type">;

export type FieldsSliceState = {
  fields: Fields | Partial<Fields>;
  loading: boolean;
  lastResolvedData: Partial<ComponentOrRootData>;
  id: string | undefined;
};

export type FieldsSlice = FieldsSliceState & {
  /** Set fields directly */
  setFields: (fields: Fields) => void;
  
  /** Reset fields to defaults for a component */
  resetFields: (componentType: string) => void;
  
  /** Update a single field */
  updateField: (fieldName: string, field: Fields[string]) => void;
  
  /** Set loading state */
  setLoading: (loading: boolean) => void;
  
  /** Get fields for a specific item */
  getFieldsForItem: (itemId: string) => Fields | undefined;
  
  /** Check if fields are loading */
  isLoading: () => boolean;
  
  /** Get the last resolved data */
  getLastResolvedData: () => Partial<ComponentOrRootData>;
  
  /** Set the current item ID */
  setCurrentItemId: (id: string | undefined) => void;
  
  /** Resolve fields asynchronously */
  resolveFields: (item: ComponentData, options?: ResolveFieldsOptions) => Promise<Fields>;
};

// =============================================================================
// Resolve Fields Options
// =============================================================================

export type ResolveFieldsOptions = {
  /** Default fields to use as base */
  defaultFields?: Fields;
  /** Custom metadata */
  metadata?: Record<string, unknown>;
  /** Parent component data */
  parent?: ComponentData | null;
  /** Callback for when fields change */
  onFieldsChange?: (fields: Fields) => void;
};

// =============================================================================
// Default State
// =============================================================================

export const defaultFieldsState: FieldsSliceState = {
  fields: {},
  loading: false,
  lastResolvedData: {},
  id: undefined,
};

// =============================================================================
// Slice Factory
// =============================================================================

export function createFieldsSlice(
  set: (newState: Partial<FieldsSlice>) => void,
  _get: () => FieldsSlice
): FieldsSlice {
  return {
    ...defaultFieldsState,
    
    setFields: (fields) => {
      set({ fields, loading: false });
    },
    
    resetFields: (componentType) => {
      // This would typically look up the default fields from config
      set({ fields: {}, id: undefined });
    },
    
    updateField: (fieldName, field) => {
      set((state) => ({
        fields: {
          ...state.fields,
          [fieldName]: field,
        },
      }));
    },
    
    setLoading: (loading) => {
      set({ loading });
    },
    
    getFieldsForItem: (itemId) => {
      const state = _get();
      if (state.id === itemId) {
        return state.fields as Fields;
      }
      return undefined;
    },
    
    isLoading: () => _get().loading,
    
    getLastResolvedData: () => _get().lastResolvedData,
    
    setCurrentItemId: (id) => {
      set({ id });
    },
    
    resolveFields: async (item, options = {}) => {
      const { defaultFields = {} } = options;
      
      set({ loading: true, id: item.props.id });
      
      try {
        // In a real implementation, this would call the component's
        // resolveFields function if available
        const resolvedFields = defaultFields;
        
        set({
          fields: resolvedFields,
          loading: false,
          lastResolvedData: item.props,
        });
        
        options.onFieldsChange?.(resolvedFields);
        
        return resolvedFields;
      } catch (error) {
        set({ loading: false });
        throw error;
      }
    },
  };
}
