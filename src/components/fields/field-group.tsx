/**
 * Field Group - P4 Advanced Feature #55
 * 
 * Collapsible field groups with optional nested fields and styling.
 * Provides a way to organize complex field configurations.
 */

"use client";

import React, {memo, ReactNode, useCallback, useId, useMemo, useState,} from "react";
import {ChevronDown, ChevronRight, Eye, Lock,} from "lucide-react";
import type {Field} from "@puckeditor/core";

// ============================================================================
// TYPES
// ============================================================================

export interface FieldGroupConfig {
  /** Fields within this group */
  fields: Record<string, Field<any>>;
  /** Group title */
  label?: string;
  /** Group icon */
  icon?: ReactNode;
  /** Whether the group is collapsed by default */
  defaultCollapsed?: boolean;
  /** Allow collapsing */
  collapsible?: boolean;
  /** Lock the group */
  locked?: boolean;
  /** Hide fields when collapsed */
  hideFieldsWhenCollapsed?: boolean;
  /** Group description */
  description?: string;
  /** CSS class for the group container */
  className?: string;
  /** Callback when collapsed state changes */
  onCollapsedChange?: (collapsed: boolean) => void;
}

export interface FieldGroupField extends Field<any> {
  type: "group";
  groupConfig: FieldGroupConfig;
}

// ============================================================================
// FIELD GROUP COMPONENT
// ============================================================================

interface FieldGroupProps {
  field: FieldGroupField;
  value?: Record<string, any>;
  onChange?: (value: Record<string, any>) => void;
  readOnly?: boolean;
  name?: string;
  id?: string;
}

export const FieldGroup: React.FC<FieldGroupProps> = ({
  field,
  value = {},
  onChange,
  readOnly,
  name,
  id,
}) => {
  const groupId = useId();
  const [isCollapsed, setIsCollapsed] = useState(field.groupConfig.defaultCollapsed ?? false);
  
  const config = field.groupConfig;
  
  // Handle collapse toggle
  const handleToggle = useCallback(() => {
    if (!config.collapsible && config.collapsible !== undefined) return;
    
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    config.onCollapsedChange?.(newCollapsed);
  }, [config, isCollapsed]);
  
  // Handle field change within group
  const handleFieldChange = useCallback(
    (fieldName: string, fieldValue: any) => {
      onChange?.({
        ...value,
        [fieldName]: fieldValue,
      });
    },
    [value, onChange]
  );
  
  // Check if group should be visible
  const isVisible = config.visible !== false;
  
  if (!isVisible) return null;
  
  // Render field content
  const renderFields = () => {
    return Object.entries(config.fields).map(([fieldName, fieldDef]) => {
      if (fieldDef.type === "slot" || fieldDef.visible === false) return null;
      
      return (
        <GroupedField
          key={fieldName}
          fieldDef={fieldDef}
          value={value[fieldName]}
          onChange={(v) => handleFieldChange(fieldName, v)}
          readOnly={readOnly || config.locked}
          name={`${name || id}_${fieldName}`}
          id={`${id || groupId}_${fieldName}`}
        />
      );
    });
  };

  return (
    <div 
      className={`rounded-lg border border-gray-700/50 bg-gray-800/30 ${
        config.className || ""
      }`}
      data-field-group={fieldName}
      data-collapsed={isCollapsed}
    >
      {/* Group Header */}
      <div 
        className={`
          flex items-center gap-2 border-b border-gray-700/30 px-3 py-2
          ${config.collapsible !== false ? "cursor-pointer hover:bg-gray-700/20" : ""}
        `}
        onClick={handleToggle}
      >
        {/* Collapse Toggle */}
        {config.collapsible !== false && (
          <span className="text-gray-500">
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </span>
        )}
        
        {/* Icon */}
        {config.icon && (
          <span className="text-gray-400">
            {config.icon}
          </span>
        )}
        
        {/* Label */}
        <span className="flex-1 text-sm font-medium text-gray-200">
          {config.label || "Field Group"}
        </span>
        
        {/* Status Icons */}
        {config.locked && (
          <Lock className="h-3.5 w-3.5 text-amber-500" title="Locked" />
        )}
        {isCollapsed && (
          <Eye className="h-3.5 w-3.5 text-gray-500" title="Collapsed" />
        )}
      </div>
      
      {/* Group Description */}
      {config.description && !isCollapsed && (
        <div className="border-b border-gray-700/30 bg-gray-900/30 px-3 py-2">
          <p className="text-xs text-gray-500">{config.description}</p>
        </div>
      )}
      
      {/* Group Fields */}
      {(!isCollapsed || !config.hideFieldsWhenCollapsed) && (
        <div className="space-y-1 p-3">
          {renderFields()}
        </div>
      )}
      
      {/* Collapsed Summary */}
      {isCollapsed && config.hideFieldsWhenCollapsed && (
        <div className="border-t border-gray-700/30 bg-gray-900/30 px-3 py-2">
          <CollapsedSummary fields={config.fields} values={value} />
        </div>
      )}
    </div>
  );
};

// ============================================================================
// GROUPED FIELD RENDERER
// ============================================================================

interface GroupedFieldProps {
  fieldDef: Field<any>;
  value: any;
  onChange: (value: any) => void;
  readOnly?: boolean;
  name?: string;
  id?: string;
}

const GroupedField: React.FC<GroupedFieldProps> = memo(function GroupedField({
  fieldDef,
  value,
  onChange,
  readOnly,
  name,
  id,
}) {
  // Render different field types
  switch (fieldDef.type) {
    case "text":
    case "number":
      return (
        <div className="mb-3">
          <label className="mb-1 block text-xs font-medium text-gray-400">
            {fieldDef.label || name}
          </label>
          <input
            type={fieldDef.type}
            value={value ?? ""}
            onChange={(e) => onChange(
              fieldDef.type === "number" 
                ? Number(e.target.value) 
                : e.target.value
            )}
            disabled={readOnly}
            placeholder={(fieldDef as any).placeholder}
            min={(fieldDef as any).min}
            max={(fieldDef as any).max}
            className="w-full rounded-md border border-gray-600 bg-gray-900/50 px-3 py-1.5 text-sm text-gray-200 placeholder-gray-500 focus:border-cpm-accent focus:outline-none focus:ring-1 focus:ring-cpm-accent/50 disabled:opacity-50"
          />
        </div>
      );
      
    case "textarea":
      return (
        <div className="mb-3">
          <label className="mb-1 block text-xs font-medium text-gray-400">
            {fieldDef.label || name}
          </label>
          <textarea
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            disabled={readOnly}
            placeholder={(fieldDef as any).placeholder}
            rows={3}
            className="w-full rounded-md border border-gray-600 bg-gray-900/50 px-3 py-1.5 text-sm text-gray-200 placeholder-gray-500 focus:border-cpm-accent focus:outline-none focus:ring-1 focus:ring-cpm-accent/50 disabled:opacity-50"
          />
        </div>
      );
      
    case "select":
      return (
        <div className="mb-3">
          <label className="mb-1 block text-xs font-medium text-gray-400">
            {fieldDef.label || name}
          </label>
          <select
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            disabled={readOnly}
            className="w-full rounded-md border border-gray-600 bg-gray-900/50 px-3 py-1.5 text-sm text-gray-200 focus:border-cpm-accent focus:outline-none focus:ring-1 focus:ring-cpm-accent/50 disabled:opacity-50"
          >
            <option value="">{(fieldDef as any).placeholder || "Select..."}</option>
            {((fieldDef as any).options || []).map((opt: any) => (
              <option key={String(opt.value)} value={String(opt.value)}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      );
      
    case "checkbox":
    case "boolean":
      return (
        <div className="mb-3 flex items-center gap-2">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
            disabled={readOnly}
            className="h-4 w-4 rounded border-gray-600 bg-gray-900 text-cpm-accent focus:ring-cpm-accent/50"
          />
          <label className="text-sm text-gray-300">
            {fieldDef.label || name}
          </label>
        </div>
      );
      
    case "color":
      return (
        <div className="mb-3">
          <label className="mb-1 block text-xs font-medium text-gray-400">
            {fieldDef.label || name}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={value || "#000000"}
              onChange={(e) => onChange(e.target.value)}
              disabled={readOnly}
              className="h-8 w-12 cursor-pointer rounded border border-gray-600 bg-transparent"
            />
            <input
              type="text"
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              disabled={readOnly}
              placeholder="#000000"
              className="flex-1 rounded-md border border-gray-600 bg-gray-900/50 px-3 py-1.5 text-sm text-gray-200 placeholder-gray-500 focus:border-cpm-accent focus:outline-none focus:ring-1 focus:ring-cpm-accent/50"
            />
          </div>
        </div>
      );
      
    case "radio":
      return (
        <div className="mb-3">
          <label className="mb-2 block text-xs font-medium text-gray-400">
            {fieldDef.label || name}
          </label>
          <div className="space-y-1.5">
            {((fieldDef as any).options || []).map((opt: any, idx: number) => (
              <label key={idx} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={id}
                  value={String(opt.value)}
                  checked={value === opt.value}
                  onChange={(e) => onChange(opt.value)}
                  disabled={readOnly}
                  className="h-4 w-4 border-gray-600 bg-gray-900 text-cpm-accent focus:ring-cpm-accent/50"
                />
                <span className="text-sm text-gray-300">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>
      );
      
    case "array":
      // For arrays within groups, use a simpler inline approach
      return (
        <div className="mb-3">
          <label className="mb-1 block text-xs font-medium text-gray-400">
            {fieldDef.label || name}
          </label>
          <InlineArrayField
            field={fieldDef}
            value={value || []}
            onChange={onChange}
            readOnly={readOnly}
          />
        </div>
      );
      
    case "object":
      // Nested object - recurse
      return (
        <div className="mb-3">
          <label className="mb-1 block text-xs font-medium text-gray-400">
            {fieldDef.label || name}
          </label>
          <div className="rounded-md border border-gray-700/50 bg-gray-900/30 p-3">
            <div className="space-y-2">
              {Object.entries((fieldDef as any).objectFields || {}).map(([subName, subDef]: [string, any]) => (
                <GroupedField
                  key={subName}
                  fieldDef={subDef}
                  value={value?.[subName]}
                  onChange={(v) => onChange({ ...value, [subName]: v })}
                  readOnly={readOnly}
                  name={subName}
                  id={`${id}_${subName}`}
                />
              ))}
            </div>
          </div>
        </div>
      );
      
    case "group":
      // Nested group
      return (
        <FieldGroup
          field={fieldDef as FieldGroupField}
          value={value}
          onChange={onChange}
          readOnly={readOnly}
          name={name}
          id={id}
        />
      );
      
    default:
      return (
        <div className="mb-3">
          <label className="mb-1 block text-xs font-medium text-gray-400">
            {fieldDef.label || name}
          </label>
          <input
            type="text"
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            disabled={readOnly}
            className="w-full rounded-md border border-gray-600 bg-gray-900/50 px-3 py-1.5 text-sm text-gray-200 placeholder-gray-500 focus:border-cpm-accent focus:outline-none focus:ring-1 focus:ring-cpm-accent/50 disabled:opacity-50"
          />
        </div>
      );
  }
});

// ============================================================================
// INLINE ARRAY FIELD
// ============================================================================

interface InlineArrayFieldProps {
  field: Field<any>;
  value: any[];
  onChange: (value: any[]) => void;
  readOnly?: boolean;
}

function InlineArrayField({ field, value = [], onChange, readOnly }: InlineArrayFieldProps) {
  const { arrayFields, defaultItemProps, max, min } = field as any;
  
  const handleAdd = () => {
    if (max && value.length >= max) return;
    
    const newItem = typeof defaultItemProps === "function" 
      ? defaultItemProps(value.length)
      : defaultItemProps || {};
    
    onChange([...value, { ...newItem, _id: Date.now() }]);
  };
  
  const handleRemove = (index: number) => {
    if (min && value.length <= min) return;
    onChange(value.filter((_, i) => i !== index));
  };
  
  const handleUpdate = (index: number, fieldName: string, fieldValue: any) => {
    const newValue = [...value];
    newValue[index] = { ...newValue[index], [fieldName]: fieldValue };
    onChange(newValue);
  };
  
  const canAdd = !readOnly && (!max || value.length < max);
  const canRemove = !readOnly && (!min || value.length > min);
  
  return (
    <div className="space-y-2">
      {value.map((item, index) => (
        <div 
          key={item._id || index} 
          className="flex items-start gap-2 rounded-md border border-gray-700/50 bg-gray-800/30 p-2"
        >
          <div className="flex-1 space-y-2">
            {Object.entries(arrayFields || {}).map(([fieldName, subDef]: [string, any]) => (
              <GroupedField
                key={fieldName}
                fieldDef={subDef}
                value={item[fieldName]}
                onChange={(v) => handleUpdate(index, fieldName, v)}
                readOnly={readOnly}
                name={fieldName}
                id={`${fieldName}_${index}`}
              />
            ))}
          </div>
          {canRemove && (
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="mt-1 rounded p-1 text-gray-500 hover:bg-red-500/20 hover:text-red-400"
            >
              ×
            </button>
          )}
        </div>
      ))}
      
      {canAdd && (
        <button
          type="button"
          onClick={handleAdd}
          className="w-full rounded-md border border-dashed border-gray-600 py-2 text-sm text-gray-400 hover:border-cpm-accent/50 hover:text-cpm-accent"
        >
          + Add Item
        </button>
      )}
    </div>
  );
}

// ============================================================================
// COLLAPSED SUMMARY
// ============================================================================

function CollapsedSummary({ 
  fields, 
  values 
}: { 
  fields: Record<string, Field<any>>; 
  values: Record<string, any> 
}) {
  const summary = useMemo(() => {
    const parts: string[] = [];
    
    // Show first few non-empty values
    const fieldEntries = Object.entries(fields).slice(0, 3);
    
    for (const [fieldName, fieldDef] of fieldEntries) {
      const value = values[fieldName];
      if (value === null || value === undefined || value === "") continue;
      
      const label = fieldDef.label || fieldName;
      
      if (typeof value === "boolean") {
        parts.push(`${label}: ${value ? "Yes" : "No"}`);
      } else if (typeof value === "string" && value.length > 20) {
        parts.push(`${label}: ${value.substring(0, 20)}...`);
      } else {
        parts.push(`${label}: ${value}`);
      }
    }
    
    return parts.join(" • ");
  }, [fields, values]);
  
  if (!summary) {
    return <p className="text-xs text-gray-500">No values set</p>;
  }
  
  return <p className="text-xs text-gray-400">{summary}</p>;
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

/**
 * Create a field group configuration
 */
export function createFieldGroup(config: FieldGroupConfig): FieldGroupField {
  return {
    type: "group",
    groupConfig: config,
  };
}

// ============================================================================
// PRESET GROUP LAYOUTS
// ============================================================================

/**
 * Create an accordion-style field group
 */
export function createAccordionGroup(
  label: string,
  fields: Record<string, Field<any>>,
  options: Partial<FieldGroupConfig> = {}
): FieldGroupField {
  return createFieldGroup({
    label,
    fields,
    collapsible: true,
    defaultCollapsed: true,
    hideFieldsWhenCollapsed: true,
    ...options,
  });
}

/**
 * Create a section group (always expanded)
 */
export function createSectionGroup(
  label: string,
  fields: Record<string, Field<any>>,
  options: Partial<FieldGroupConfig> = {}
): FieldGroupField {
  return createFieldGroup({
    label,
    fields,
    collapsible: false,
    ...options,
  });
}

/**
 * Create a locked field group
 */
export function createLockedGroup(
  label: string,
  fields: Record<string, Field<any>>,
  options: Partial<FieldGroupConfig> = {}
): FieldGroupField {
  return createFieldGroup({
    label,
    fields,
    locked: true,
    collapsible: true,
    ...options,
  });
}
