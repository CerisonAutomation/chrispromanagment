/**
 * Permissions Slice - Manages component and action permissions
 * Part of the modular slice architecture
 */

import type {ComponentData, Permissions} from "../../types";

// =============================================================================
// Types
// =============================================================================

export type PermissionsArgs = {
  item?: ComponentData | null;
  type?: string;
  root?: boolean;
};

export type PermissionsCache = Record<
  string,
  {
    lastPermissions: Partial<Permissions>;
    lastData: ComponentData | null;
    lastParentId: string | null;
  }
>;

export type PermissionsSliceState = {
  globalPermissions: Permissions;
  resolvedPermissions: Record<string, Partial<Permissions>>;
  cache: PermissionsCache;
};

export type PermissionsSlice = PermissionsSliceState & {
  /** Get permissions for a specific item */
  getPermissions: (params?: PermissionsArgs) => Permissions;
  
  /** Resolve permissions for an item */
  resolvePermissions: (params?: PermissionsArgs, force?: boolean) => Promise<void>;
  
  /** Refresh permissions (force resolution) */
  refreshPermissions: (params?: PermissionsArgs) => Promise<void>;
  
  /** Set global permissions */
  setGlobalPermissions: (permissions: Partial<Permissions>) => void;
  
  /** Clear resolved permissions cache */
  clearCache: () => void;
  
  /** Clear permissions for a specific item */
  clearItemCache: (itemId: string) => void;
  
  /** Check if user can perform an action */
  can: (action: keyof Permissions) => boolean;
  
  /** Check if a specific item can be edited */
  canEditItem: (itemId: string) => boolean;
  
  /** Check if a specific item can be deleted */
  canDeleteItem: (itemId: string) => boolean;
  
  /** Check if a specific item can be duplicated */
  canDuplicateItem: (itemId: string) => boolean;
  
  /** Check if a specific item can be dragged */
  canDragItem: (itemId: string) => boolean;
  
  /** Check if a component type can be inserted */
  canInsertType: (type: string) => boolean;
};

// =============================================================================
// Default State
// =============================================================================

export const defaultPermissionsState: PermissionsSliceState = {
  globalPermissions: {
    drag: true,
    edit: true,
    delete: true,
    duplicate: true,
    copy: true,
    insert: true,
  },
  resolvedPermissions: {},
  cache: {},
};

// =============================================================================
// Slice Factory
// =============================================================================

export function createPermissionsSlice(
  set: (newState: Partial<PermissionsSlice>) => void,
  get: () => PermissionsSlice
): PermissionsSlice {
  return {
    ...defaultPermissionsState,
    
    getPermissions: (params = {}) => {
      const { globalPermissions, resolvedPermissions } = get();
      const { item, type, root } = params;
      
      if (item) {
        // Get permissions for specific item
        const resolvedForItem = resolvedPermissions[item.props.id];
        return {
          ...globalPermissions,
          ...resolvedForItem,
        } as Permissions;
      }
      
      if (type) {
        // Type-based permissions (no cache lookup)
        return { ...globalPermissions };
      }
      
      if (root) {
        // Root permissions
        const resolvedForRoot = resolvedPermissions["root"];
        return {
          ...globalPermissions,
          ...resolvedForRoot,
        } as Permissions;
      }
      
      return globalPermissions;
    },
    
    resolvePermissions: async (params = {}, _force = false) => {
      // This would integrate with the config's resolvePermissions functions
      // For now, we just use the global permissions
      const { globalPermissions } = get();
      return;
    },
    
    refreshPermissions: async (params) => {
      await get().resolvePermissions(params, true);
    },
    
    setGlobalPermissions: (permissions) => {
      set((state) => ({
        globalPermissions: {
          ...state.globalPermissions,
          ...permissions,
        },
      }));
    },
    
    clearCache: () => {
      set({
        resolvedPermissions: {},
        cache: {},
      });
    },
    
    clearItemCache: (itemId) => {
      set((state) => {
        const { [itemId]: _, ...remainingCache } = state.cache;
        const { [itemId]: __, ...remainingResolved } = state.resolvedPermissions;
        
        return {
          cache: remainingCache,
          resolvedPermissions: remainingResolved,
        };
      });
    },
    
    can: (action) => {
      const { globalPermissions } = get();
      return globalPermissions[action] !== false;
    },
    
    canEditItem: (itemId) => {
      const permissions = get().getPermissions({
        item: get().cache[itemId]?.lastData || undefined,
      });
      return permissions.edit !== false;
    },
    
    canDeleteItem: (itemId) => {
      const permissions = get().getPermissions({
        item: get().cache[itemId]?.lastData || undefined,
      });
      return permissions.delete !== false;
    },
    
    canDuplicateItem: (itemId) => {
      const permissions = get().getPermissions({
        item: get().cache[itemId]?.lastData || undefined,
      });
      return permissions.duplicate !== false;
    },
    
    canDragItem: (itemId) => {
      const permissions = get().getPermissions({
        item: get().cache[itemId]?.lastData || undefined,
      });
      return permissions.drag !== false;
    },
    
    canInsertType: (type) => {
      const { globalPermissions } = get();
      return globalPermissions.insert !== false;
    },
  };
}
