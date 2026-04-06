/**
 * Props Injection - P4 Advanced Feature #59
 * 
 * Puck injects id, puck context to render functions.
 * Provides utilities for working with injected props and context.
 * 
 * @example
 * const config = {
 *   render: ({ id, puck, ...props }) => {
 *     // id is automatically injected
 *     // puck context is available
 *     return <MyComponent id={id} data={puck} {...props} />;
 *   }
 * };
 */

import type {AppData, Data, PuckAction, UiState} from "@puckeditor/core";
import {createContext, memo, ReactElement, ReactNode, useCallback, useContext, useRef} from "react";

// ============================================================================
// TYPES
// ============================================================================

/**
 * Puck context injected into render functions
 */
export interface PuckContext {
  /** Current app state */
  appState: AppState;
  /** Puck dispatch function */
  dispatch: (action: PuckAction) => void;
  /** Selected item */
  selectedItem: AppData | null;
  /** Current record mode */
  recordHistory: boolean;
}

/**
 * App state structure
 */
export interface AppState {
  data: Data;
  ui: UiState;
}

/**
 * Injected props that Puck adds to component renders
 */
export interface InjectedPuckProps {
  /** Unique ID for this component instance */
  id: string;
  /** Puck context */
  puck: PuckContext;
}

/**
 * Extended props with injected ones
 */
export type ExtendedProps<T extends Record<string, any> = Record<string, any>> = 
  T & InjectedPuckProps;

/**
 * Props that can be injected via puck.config
 */
export interface InjectableProps {
  /** Inject component ID */
  id?: boolean;
  /** Inject puck context */
  puck?: boolean;
  /** Inject selected item data */
  selectedItem?: boolean;
  /** Inject current app state */
  appState?: boolean;
}

/**
 * Inject configuration options
 */
export interface PropsInjectionConfig {
  /** Props to inject */
  inject?: InjectableProps;
  /** Custom injection function */
  injectFn?: (props: Record<string, any>, context: PuckContext) => Record<string, any>;
}

// ============================================================================
// CONTEXT PROVIDER
// ============================================================================

const PuckContextInternal = createContext<PuckContext | null>(null);

export function usePuckContext(): PuckContext | null {
  return useContext(PuckContextInternal);
}

/**
 * Provider for Puck context
 */
export function PuckContextProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: PuckContext;
}) {
  return (
    <PuckContextInternal.Provider value={value}>
      {children}
    </PuckContextInternal.Provider>
  );
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook to access Puck context
 */
export function usePuck(): PuckContext {
  const context = useContext(PuckContextInternal);
  
  if (!context) {
    throw new Error("usePuck must be used within a Puck context provider");
  }
  
  return context;
}

/**
 * Hook to get component ID from context
 */
export function useComponentId(): string | undefined {
  const context = useContext(PuckContextInternal);
  return context?.selectedItem?.props?.id;
}

/**
 * Hook to access dispatch function
 */
export function usePuckDispatch() {
  const { dispatch } = usePuck();
  return dispatch;
}

/**
 * Hook to access app state
 */
export function useAppState(): AppState {
  const { appState } = usePuck();
  return appState;
}

/**
 * Hook to get selected item
 */
export function useSelectedItem(): AppData | null {
  const { selectedItem } = usePuck();
  return selectedItem;
}

/**
 * Hook to update component props
 */
export function useUpdateComponent() {
  const { dispatch } = usePuck();
  const { selectedItem } = usePuck();
  
  return useCallback(
    (newProps: Record<string, any>) => {
      if (!selectedItem) return;
      
      dispatch({
        type: "replace",
        componentId: selectedItem.props.id,
        data: newProps,
      });
    },
    [dispatch, selectedItem]
  );
}

/**
 * Hook for component-specific state management
 * Uses refs to persist state across re-renders
 */
export function useComponentState<T>(initialValue: T | (() => T)) {
  const stateRef = useRef<T>(
    typeof initialValue === "function"
      ? (initialValue as () => T)()
      : initialValue
  );
  
  const getState = useCallback(() => stateRef.current, []);
  const setState = useCallback((newValue: T | ((prev: T) => T)) => {
    stateRef.current =
      typeof newValue === "function"
        ? (newValue as (prev: T) => T)(stateRef.current)
        : newValue;
  }, []);
  
  return { state: stateRef.current, getState, setState };
}

// ============================================================================
// RENDER WRAPPER
// ============================================================================

/**
 * Higher-order component that injects Puck props into a render function
 */
export function withPuckProps<P extends Record<string, any>>(
  Component: (props: ExtendedProps<P>) => ReactElement,
  config?: PropsInjectionConfig
) {
  return memo(function PuckWrapper(props: P) {
    const puck = usePuckContext();
    
    if (!puck) {
      return Component(props as ExtendedProps<P>);
    }
    
    // Build injected props
    const injectedProps: InjectedPuckProps = {
      id: config?.inject?.id !== false ? (props as any).id : undefined,
      puck: config?.inject?.puck !== false ? puck : undefined,
    };
    
    // Apply custom injection function
    const finalProps = config?.injectFn
      ? config.injectFn({ ...props, ...injectedProps }, puck)
      : { ...props, ...injectedProps };
    
    return Component(finalProps as ExtendedProps<P>);
  });
}

/**
 * Wrap a simple render function with Puck props injection
 */
export function wrapRender<P extends Record<string, any>>(
  renderFn: (props: ExtendedProps<P>) => ReactElement,
  config?: PropsInjectionConfig
) {
  const WrappedComponent = withPuckProps(renderFn, config);
  
  return function WrappedRender(props: P) {
    return <WrappedComponent {...props} />;
  };
}

// ============================================================================
// INJECTED PROPS EXTRACTOR
// ============================================================================

/**
 * Extract injected props from component props
 */
export function extractInjectedProps<P extends Record<string, any>>(
  props: ExtendedProps<P>
): {
  id: string | undefined;
  puck: PuckContext | undefined;
  userProps: Omit<ExtendedProps<P>, keyof InjectedPuckProps>;
} {
  const { id, puck, ...userProps } = props;
  
  return {
    id,
    puck,
    userProps,
  };
}

/**
 * Check if props include injected Puck props
 */
export function hasInjectedProps(props: Record<string, any>): props is InjectedPuckProps {
  return "id" in props || "puck" in props;
}

// ============================================================================
// ID UTILITIES
// ============================================================================

/**
 * Generate a unique ID for a component
 */
export function generateComponentId(prefix: string = "comp"): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Extract ID from component props
 */
export function extractId(props: Record<string, any>): string | undefined {
  return props.id || props._id || props.componentId;
}

/**
 * Validate ID format
 */
export function isValidId(id: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(id);
}

// ============================================================================
// CONTEXT UTILITIES
// ============================================================================

/**
 * Get display name for selected component
 */
export function getSelectedComponentName(selectedItem: AppData | null): string | null {
  if (!selectedItem) return null;
  
  const type = selectedItem.type;
  const id = selectedItem.props?.id;
  
  if (id) {
    return `${type}:${id}`;
  }
  
  return type;
}

/**
 * Check if component is selected
 */
export function isComponentSelected(
  componentId: string,
  selectedItem: AppData | null
): boolean {
  if (!selectedItem) return false;
  return selectedItem.props?.id === componentId;
}

/**
 * Get component path in the tree
 */
export function getComponentPath(
  componentId: string,
  data: Data
): string[] {
  const path: string[] = [];
  
  function searchTree(nodes: AppData[]): boolean {
    for (const node of nodes) {
      if (node.props?.id === componentId) {
        return true;
      }
      
      path.push(node.props?.id || node.type);
      
      if (node.content) {
        if (searchTree(node.content)) {
          return true;
        }
      }
      
      path.pop();
    }
    
    return false;
  }
  
  searchTree(data.content || []);
  return path;
}

// ============================================================================
// RESOLVE FIELDS WITH INJECTED CONTEXT
// ============================================================================

/**
 * Create a resolveFields function that uses injected context
 */
export function createContextAwareResolveFields(
  resolver: (
    data: Record<string, any>,
    context: PuckContext,
    params: any
  ) => Record<string, any> | Promise<Record<string, any>>
) {
  return async function resolveFields(
    data: Record<string, any>,
    params: any
  ): Promise<Record<string, any>> {
    const puck = usePuckContext();
    
    if (!puck) {
      return resolver(data, {
        appState: params.appState,
        dispatch: () => {},
        selectedItem: params.selectedItem,
        recordHistory: true,
      }, params);
    }
    
    return resolver(data, puck, params);
  };
}

// ============================================================================
// EXAMPLE USAGE
// ============================================================================

/**
 * Example 1: Simple render with ID injection
 * 
 * const config = {
 *   render: ({ id, ...props }) => (
 *     <MyComponent id={id} {...props} />
 *   )
 * };
 */

/**
 * Example 2: Render with full puck context
 * 
 * const config = {
 *   render: ({ id, puck, title, content }) => {
 *     const handleUpdate = (newTitle) => {
 *       puck.dispatch({
 *         type: "replace",
 *         componentId: id,
 *         data: { title: newTitle }
 *       });
 *     };
 *     
 *     return (
 *       <div id={id}>
 *         <h1 onClick={() => handleUpdate("New Title")}>{title}</h1>
 *         {content}
 *       </div>
 *     );
 *   }
 * };
 */

/**
 * Example 3: Using the wrapper HOC
 * 
 * const MyBlock = withPuckProps(({ id, puck, title, children }) => {
 *   const isSelected = puck.selectedItem?.props?.id === id;
 *   
 *   return (
 *     <div className={isSelected ? "ring-2 ring-cpm-accent" : ""}>
 *       <h1>{title}</h1>
 *       {children}
 *     </div>
 *   );
 * });
 */

/**
 * Example 4: Field injection in resolveFields
 * 
 * const config = {
 *   resolveFields: async (data, { selectedItem, appState }) => {
 *     // Can access selected item and full app state
 *     const isEditing = !!selectedItem;
 *     
 *     return {
 *       ...fields,
 *       preview: {
 *         ...fields.preview,
 *         visible: isEditing && appState.ui.previewMode
 *       }
 *     };
 *   }
 * };
 */
