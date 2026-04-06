/**
 * Field-Level Permissions - P4 Advanced Feature #57
 * 
 * Per-field read-only/hidden based on user permissions or conditions.
 * Integrates with Puck's permissions system.
 * 
 * @example
 * const fields = {
 *   title: { type: "text" },
 *   secretData: { 
 *     type: "text", 
 *     readOnly: { role: "editor" },
 *     hidden: { role: "viewer" }
 *   }
 * };
 */

import type {Field, Fields} from "@puckeditor/core";
import {useMemo} from "react";

// ============================================================================
// TYPES
// ============================================================================

export type PermissionCondition = 
  | boolean
  | ((context: PermissionContext) => boolean);

export interface PermissionContext {
  /** Current user object */
  user?: User;
  /** User's role */
  role?: string;
  /** User's permissions */
  permissions?: Record<string, boolean>;
  /** Current component data */
  componentData?: Record<string, any>;
  /** Current field value */
  fieldValue?: any;
  /** Whether in edit mode */
  editMode?: boolean;
  /** App state */
  appState?: any;
}

export interface User {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  permissions?: Record<string, boolean>;
}

export interface FieldPermission {
  /** Field is read-only when condition is met */
  readOnly?: PermissionCondition;
  /** Field is hidden when condition is met */
  hidden?: PermissionCondition;
  /** Field is required when condition is met */
  required?: PermissionCondition;
  /** Field is disabled when condition is met */
  disabled?: PermissionCondition;
}

export interface FieldWithPermission extends Field<any> {
  permission?: FieldPermission;
}

export type FieldPermissionMap = {
  [fieldName: string]: FieldPermission;
};

// ============================================================================
// PERMISSION ENGINE
// ============================================================================

export class FieldPermissionEngine {
  private permissionMap: FieldPermissionMap = {};
  private defaultPermission: FieldPermission = {};
  
  constructor(permissionMap?: FieldPermissionMap) {
    if (permissionMap) {
      this.permissionMap = permissionMap;
    }
  }
  
  /**
   * Set permission map
   */
  setPermissionMap(map: FieldPermissionMap): void {
    this.permissionMap = map;
  }
  
  /**
   * Set default permission for fields without explicit permission
   */
  setDefaultPermission(permission: FieldPermission): void {
    this.defaultPermission = permission;
  }
  
  /**
   * Get permission for a specific field
   */
  getFieldPermission(fieldName: string): FieldPermission {
    return this.permissionMap[fieldName] || this.defaultPermission;
  }
  
  /**
   * Evaluate a permission condition
   */
  evaluateCondition(condition: PermissionCondition, context: PermissionContext): boolean {
    if (typeof condition === "boolean") {
      return condition;
    }
    
    if (typeof condition === "function") {
      return condition(context);
    }
    
    return false;
  }
  
  /**
   * Check if a field should be read-only
   */
  isReadOnly(fieldName: string, context: PermissionContext): boolean {
    const permission = this.getFieldPermission(fieldName);
    
    if (!permission.readOnly) {
      return false;
    }
    
    return this.evaluateCondition(permission.readOnly, context);
  }
  
  /**
   * Check if a field should be hidden
   */
  isHidden(fieldName: string, context: PermissionContext): boolean {
    const permission = this.getFieldPermission(fieldName);
    
    if (!permission.hidden) {
      return false;
    }
    
    return this.evaluateCondition(permission.hidden, context);
  }
  
  /**
   * Check if a field should be required
   */
  isRequired(fieldName: string, context: PermissionContext): boolean {
    const permission = this.getFieldPermission(fieldName);
    
    if (!permission.required) {
      return false;
    }
    
    return this.evaluateCondition(permission.required, context);
  }
  
  /**
   * Check if a field should be disabled
   */
  isDisabled(fieldName: string, context: PermissionContext): boolean {
    const permission = this.getFieldPermission(fieldName);
    
    if (!permission.disabled) {
      return false;
    }
    
    return this.evaluateCondition(permission.disabled, context);
  }
  
  /**
   * Get all permission states for fields
   */
  getFieldStates(
    fieldNames: string[],
    context: PermissionContext
  ): Record<string, { readOnly: boolean; hidden: boolean; required: boolean; disabled: boolean }> {
    const states: Record<string, any> = {};
    
    for (const fieldName of fieldNames) {
      states[fieldName] = {
        readOnly: this.isReadOnly(fieldName, context),
        hidden: this.isHidden(fieldName, context),
        required: this.isRequired(fieldName, context),
        disabled: this.isDisabled(fieldName, context),
      };
    }
    
    return states;
  }
  
  /**
   * Filter fields based on hidden state
   */
  filterVisibleFields<T extends Record<string, FieldWithPermission>>(
    fields: T,
    context: PermissionContext
  ): Partial<T> {
    const visible: Partial<T> = {};
    
    for (const [name, field] of Object.entries(fields) as [string, FieldWithPermission][]) {
      if (this.isHidden(name, context)) {
        continue;
      }
      visible[name] = field;
    }
    
    return visible;
  }
  
  /**
   * Apply readOnly to fields
   */
  applyReadOnlyToFields<T extends Record<string, FieldWithPermission>>(
    fields: T,
    context: PermissionContext
  ): T {
    const updated = { ...fields };
    
    for (const [name, field] of Object.entries(updated) as [string, FieldWithPermission][]) {
      if (this.isReadOnly(name, context)) {
        (updated[name] as any).readOnly = true;
      }
    }
    
    return updated;
  }
}

// ============================================================================
// PRESET CONDITIONS
// ============================================================================

/**
 * Create a condition that checks user role
 */
export function hasRole(role: string | string[]): PermissionCondition {
  return (context) => {
    const userRole = context.role || context.user?.role;
    if (!userRole) return false;
    
    if (Array.isArray(role)) {
      return role.includes(userRole);
    }
    
    return userRole === role;
  };
}

/**
 * Create a condition that checks user permission
 */
export function hasPermission(permission: string): PermissionCondition {
  return (context) => {
    const permissions = context.permissions || context.user?.permissions;
    if (!permissions) return false;
    
    return permissions[permission] === true;
  };
}

/**
 * Create a condition that checks if in edit mode
 */
export function isEditMode(): PermissionCondition {
  return (context) => context.editMode === true;
}

/**
 * Create a condition based on field value
 */
export function whenFieldEquals(fieldName: string, value: any): PermissionCondition {
  return (context) => context.fieldValue === value;
}

/**
 * Create a condition based on component data
 */
export function whenField<T = any>(
  fieldName: string,
  check: (value: T) => boolean
): PermissionCondition {
  return (context) => {
    const value = context.componentData?.[fieldName];
    return check(value);
  };
}

/**
 * Create a condition based on multiple permissions (AND)
 */
export function hasAllPermissions(...permissions: string[]): PermissionCondition {
  return (context) => {
    return permissions.every((p) => hasPermission(p)(context));
  };
}

/**
 * Create a condition based on any permission (OR)
 */
export function hasAnyPermission(...permissions: string[]): PermissionCondition {
  return (context) => {
    return permissions.some((p) => hasPermission(p)(context));
  };
}

/**
 * Create a condition that inverts another condition
 */
export function not(condition: PermissionCondition): PermissionCondition {
  return (context) => !evaluateCondition(condition, context);
}

function evaluateCondition(condition: PermissionCondition, context: PermissionContext): boolean {
  if (typeof condition === "boolean") {
    return condition;
  }
  if (typeof condition === "function") {
    return condition(context);
  }
  return false;
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook for field permissions
 */
export function useFieldPermissions(
  fields: Record<string, FieldWithPermission>,
  context: PermissionContext
) {
  const engine = useMemo(() => {
    const map: FieldPermissionMap = {};
    
    for (const [name, field] of Object.entries(fields)) {
      if (field.permission) {
        map[name] = field.permission;
      }
    }
    
    return new FieldPermissionEngine(map);
  }, [fields]);
  
  const fieldStates = useMemo(() => {
    const names = Object.keys(fields);
    return engine.getFieldStates(names, context);
  }, [engine, fields, context]);
  
  const visibleFields = useMemo(() => {
    return engine.filterVisibleFields(fields, context);
  }, [engine, fields, context]);
  
  return {
    engine,
    fieldStates,
    visibleFields,
    isReadOnly: (name: string) => fieldStates[name]?.readOnly ?? false,
    isHidden: (name: string) => fieldStates[name]?.hidden ?? false,
    isRequired: (name: string) => fieldStates[name]?.required ?? false,
    isDisabled: (name: string) => fieldStates[name]?.disabled ?? false,
  };
}

/**
 * Hook for a single field's permission state
 */
export function useFieldPermission(
  fieldName: string,
  field: FieldWithPermission,
  context: PermissionContext
) {
  const engine = useMemo(() => {
    const map: FieldPermissionMap = {};
    if (field.permission) {
      map[fieldName] = field.permission;
    }
    return new FieldPermissionEngine(map);
  }, [fieldName, field]);
  
  return {
    readOnly: engine.isReadOnly(fieldName, context),
    hidden: engine.isHidden(fieldName, context),
    required: engine.isRequired(fieldName, context),
    disabled: engine.isDisabled(fieldName, context),
  };
}

// ============================================================================
// RESOLVE FIELDS INTEGRATION
// ============================================================================

/**
 * Create a resolveFields function that applies field permissions
 */
export function createPermissionAwareResolveFields(
  permissionEngine: FieldPermissionEngine,
  getPermissionContext: (params: any) => PermissionContext
) {
  return async function resolveFieldsWithPermissions(
    data: Record<string, any>,
    params: any
  ): Promise<Fields> {
    const { fields } = params;
    const context = getPermissionContext(params);
    
    // Apply permission context with component data
    const fullContext: PermissionContext = {
      ...context,
      componentData: data,
    };
    
    // Filter hidden fields
    let updatedFields = permissionEngine.filterVisibleFields(fields, fullContext);
    
    // Apply readOnly
    updatedFields = permissionEngine.applyReadOnlyToFields(updatedFields, fullContext);
    
    return updatedFields;
  };
}

// ============================================================================
// EXAMPLE USAGE
// ============================================================================

/**
 * Example: Role-based field permissions
 * 
 * const permissionEngine = new FieldPermissionEngine({
 *   // Admin-only fields
 *   apiKey: {
 *     hidden: hasRole("viewer"),
 *     readOnly: hasRole("editor"),
 *   },
 *   // Permission-based fields
 *   analytics: {
 *     hidden: not(hasPermission("view_analytics")),
 *   },
 *   // Edit mode fields
 *   draftContent: {
 *     readOnly: not(isEditMode()),
 *   },
 *   // Field value-based
 *   approvalDate: {
 *     hidden: whenFieldEquals("status", "draft"),
 *   },
 * });
 * 
 * // In Puck config
 * const config = {
 *   fields: {
 *     title: { type: "text" },
 *     content: { type: "richtext" },
 *     apiKey: { type: "text" },
 *     status: { type: "select", options: [...] },
 *     approvalDate: { type: "date" },
 *   },
 *   resolveFields: createPermissionAwareResolveFields(
 *     permissionEngine,
 *     (params) => ({
 *       user: params.appState?.user,
 *       role: params.appState?.user?.role,
 *       editMode: params.metadata?.editMode,
 *     })
 *   ),
 * };
 */
