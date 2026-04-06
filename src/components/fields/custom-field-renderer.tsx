/**
 * Custom Field Renderer - Type-safe implementation
 * Plugin-based custom field rendering system.
 */

"use client";

import React, {createContext, ReactElement, ReactNode, useCallback, useContext, useMemo,} from "react";
import type {Field} from "@/lib/canonical-puck-types";

/** Generic indexable type */
type Indexable<T = unknown> = { [key: string]: T };

export type CustomFieldRenderFn<T = unknown> = (
  props: CustomFieldRenderProps<T>
) => ReactElement;

export interface CustomFieldRenderProps<T = unknown> {
  field: CustomField<T>;
  value: T;
  onChange: (value: T, uiState?: Indexable<unknown>) => void;
  readOnly?: boolean;
  id: string;
  name?: string;
  error?: string;
  touched?: boolean;
  loading?: boolean;
  helperText?: string;
  label?: string;
  labelIcon?: ReactNode;
  placeholder?: string;
}

export interface CustomField<T = unknown> extends Field {
  type: string;
  fieldKey?: string;
  metadata?: Indexable<unknown>;
}

export interface FieldPlugin {
  key: string;
  name: string;
  description?: string;
  icon?: ReactNode;
  render: CustomFieldRenderFn;
  defaultConfig?: Partial<CustomField>;
  schema?: FieldSchema;
  validate?: (value: unknown) => string | null;
}

export interface FieldSchema {
  type: string;
  properties?: Indexable<FieldSchemaProperty>;
  required?: string[];
}

export interface FieldSchemaProperty {
  type: string;
  title?: string;
  description?: string;
  default?: unknown;
  enum?: unknown[];
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  format?: string;
}

interface FieldRegistryContextValue {
  plugins: Map<string, FieldPlugin>;
  register: (plugin: FieldPlugin) => void;
  unregister: (key: string) => void;
  getPlugin: (key: string) => FieldPlugin | undefined;
  renderField: (
    field: CustomField,
    props: Omit<CustomFieldRenderProps, "field">
  ) => ReactElement | null;
}

const FieldRegistryContext = createContext<FieldRegistryContextValue | null>(null);

export function useFieldRegistry(): FieldRegistryContextValue {
  const context = useContext(FieldRegistryContext);
  if (!context) {
    throw new Error("useFieldRegistry must be used within FieldRegistryProvider");
  }
  return context;
}

interface FieldRegistryProviderProps {
  children: ReactNode;
  plugins?: FieldPlugin[];
  onRegister?: (plugin: FieldPlugin) => void;
  onUnregister?: (key: string) => void;
}

export function FieldRegistryProvider({
  children,
  plugins: initialPlugins = [],
  onRegister,
  onUnregister,
}: FieldRegistryProviderProps) {
  const pluginsRef = React.useRef<Map<string, FieldPlugin>>(new Map());
  
  React.useEffect(() => {
    initialPlugins.forEach((plugin) => {
      pluginsRef.current.set(plugin.key, plugin);
    });
  }, [initialPlugins]);
  
  const register = useCallback((plugin: FieldPlugin) => {
    pluginsRef.current.set(plugin.key, plugin);
    onRegister?.(plugin);
  }, [onRegister]);
  
  const unregister = useCallback((key: string) => {
    pluginsRef.current.delete(key);
    onUnregister?.(key);
  }, [onUnregister]);
  
  const getPlugin = useCallback((key: string) => {
    return pluginsRef.current.get(key);
  }, []);
  
  const renderField = useCallback((
    field: CustomField,
    props: Omit<CustomFieldRenderProps, "field">
  ) => {
    const plugin = pluginsRef.current.get(field.fieldKey || field.type);
    if (!plugin) return null;
    
    return plugin.render({
      ...props,
      field,
    });
  }, []);
  
  const contextValue = useMemo<FieldRegistryContextValue>(() => ({
    plugins: pluginsRef.current,
    register,
    unregister,
    getPlugin,
    renderField,
  }), [register, unregister, getPlugin, renderField]);
  
  return (
    <FieldRegistryContext.Provider value={contextValue}>
      {children}
    </FieldRegistryContext.Provider>
  );
}

interface CustomFieldRendererProps {
  field: CustomField;
  value: unknown;
  onChange: (value: unknown, uiState?: Indexable<unknown>) => void;
  readOnly?: boolean;
  id?: string;
  name?: string;
  error?: string;
  touched?: boolean;
  loading?: boolean;
  helperText?: string;
}

export const CustomFieldRenderer: React.FC<CustomFieldRendererProps> = ({
  field,
  value,
  onChange,
  readOnly,
  id,
  name,
  error,
  touched,
  loading,
  helperText,
}) => {
  const { getPlugin } = useFieldRegistry();
  
  const plugin = useMemo(() => {
    return getPlugin(field.fieldKey || field.type);
  }, [getPlugin, field]);
  
  if (!plugin) {
    console.warn(`No plugin registered for field type: ${field.type}`);
    return (
      <div className="rounded-md border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm text-red-400">
        Unknown field type: {field.type}
      </div>
    );
  }
  
  return plugin.render({
    field,
    value,
    onChange,
    readOnly,
    id: id || `custom-${field.type}`,
    name,
    error,
    touched,
    loading,
    helperText,
    label: field.label,
    labelIcon: field.labelIcon,
    placeholder: (field as CustomField<string> & { placeholder?: string }).placeholder,
  });
};

export const colorPickerPlugin: FieldPlugin = {
  key: "colorPicker",
  name: "Color Picker",
  description: "A color picker with hex input",
  icon: "🎨",
  render: ({ value, onChange, readOnly, id, label }) => {
    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={id} className="block text-xs font-medium text-gray-400">
            {label}
          </label>
        )}
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
            id={id}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            disabled={readOnly}
            placeholder="#000000"
            pattern="^#[0-9A-Fa-f]{6}$"
            className="flex-1 rounded-md border border-gray-600 bg-gray-900/50 px-3 py-1.5 text-sm text-gray-200 uppercase placeholder-gray-500 focus:border-cpm-accent focus:outline-none focus:ring-1 focus:ring-cpm-accent/50"
          />
        </div>
      </div>
    );
  },
};

export const rangeSliderPlugin: FieldPlugin = {
  key: "range",
  name: "Range Slider",
  description: "A range slider with numeric input",
  icon: "🎚️",
  render: ({ value, onChange, readOnly, id, label, field }) => {
    const config = field as CustomField<number> & { min?: number; max?: number; step?: number };
    const min = config.min ?? 0;
    const max = config.max ?? 100;
    const step = config.step ?? 1;
    const currentValue = value ?? min;
    
    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={id} className="block text-xs font-medium text-gray-400">
            {label}
          </label>
        )}
        <div className="flex items-center gap-3">
          <input
            type="range"
            id={id}
            value={currentValue}
            onChange={(e) => onChange(Number(e.target.value))}
            disabled={readOnly}
            min={min}
            max={max}
            step={step}
            className="flex-1 accent-cpm-accent"
          />
          <input
            type="number"
            value={currentValue}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (v >= min && v <= max) {
                onChange(v);
              }
            }}
            disabled={readOnly}
            min={min}
            max={max}
            step={step}
            className="w-16 rounded-md border border-gray-600 bg-gray-900/50 px-2 py-1 text-center text-sm text-gray-200 focus:border-cpm-accent focus:outline-none"
          />
        </div>
      </div>
    );
  },
};

export const toggleSwitchPlugin: FieldPlugin = {
  key: "toggle",
  name: "Toggle Switch",
  description: "A toggle switch for boolean values",
  icon: "🔘",
  render: ({ value, onChange, readOnly, id, label }) => {
    const isOn = Boolean(value);
    
    return (
      <div className="flex items-center justify-between">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-gray-300">
            {label}
          </label>
        )}
        <button
          type="button"
          id={id}
          role="switch"
          aria-checked={isOn}
          onClick={() => !readOnly && onChange(!isOn)}
          disabled={readOnly}
          className={`
            relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent 
            transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-cpm-accent focus:ring-offset-2 focus:ring-offset-gray-900
            disabled:cursor-not-allowed disabled:opacity-50
            ${isOn ? "bg-cpm-accent" : "bg-gray-600"}
          `}
        >
          <span
            className={`
              pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 
              transition duration-200 ease-in-out
              ${isOn ? "translate-x-5" : "translate-x-0"}
            `}
          />
        </button>
      </div>
    );
  },
};

export const imageUploadPlugin: FieldPlugin = {
  key: "imageUpload",
  name: "Image Upload",
  description: "Upload or select an image",
  icon: "🖼️",
  render: ({ value, onChange, readOnly, id, label, loading }) => {
    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={id} className="block text-xs font-medium text-gray-400">
            {label}
          </label>
        )}
        <div className="relative">
          {loading ? (
            <div className="flex h-32 w-full items-center justify-center rounded-lg border border-gray-700 bg-gray-800">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-cpm-accent border-t-transparent" />
            </div>
          ) : value ? (
            <div className="group relative">
              <img
                src={value as string}
                alt="Preview"
                className="h-32 w-full rounded-lg border border-gray-700 object-cover"
              />
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => onChange("")}
                  className="absolute right-2 top-2 rounded-md bg-red-500/80 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  Remove
                </button>
              )}
            </div>
          ) : (
            <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-700 bg-gray-800/50 transition-colors hover:border-cpm-accent/50">
              <div className="text-gray-500">Click to upload</div>
              <input
                type="text"
                id={id}
                value={value as string || ""}
                onChange={(e) => onChange(e.target.value)}
                disabled={readOnly}
                placeholder="Image URL"
                className="mt-2 w-3/4 rounded-md border border-gray-600 bg-transparent px-2 py-1 text-center text-sm text-gray-400 placeholder-gray-500"
              />
            </label>
          )}
        </div>
      </div>
    );
  },
};

export const codeEditorPlugin: FieldPlugin = {
  key: "code",
  name: "Code Editor",
  description: "A code/monospace text field",
  icon: "📝",
  render: ({ value, onChange, readOnly, id, label, field }) => {
    const config = field as CustomField<string> & { placeholder?: string; rows?: number };
    
    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={id} className="block text-xs font-medium text-gray-400">
            {label}
          </label>
        )}
        <textarea
          id={id}
          value={value as string || ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={readOnly}
          placeholder={config.placeholder || "// Enter code..."}
          rows={config.rows || 5}
          spellCheck={false}
          className="w-full rounded-md border border-gray-600 bg-gray-900/50 px-3 py-2 font-mono text-sm text-gray-200 placeholder-gray-500 focus:border-cpm-accent focus:outline-none focus:ring-1 focus:ring-cpm-accent/50"
          style={{ fontFamily: "monospace" }}
        />
      </div>
    );
  },
};

export const tagsPlugin: FieldPlugin = {
  key: "tags",
  name: "Tags",
  description: "Add and manage tags",
  icon: "🏷️",
  render: ({ value = [], onChange, readOnly, id, label, field }) => {
    const [inputValue, setInputValue] = React.useState("");
    const tagsValue = value as string[] || [];
    
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && inputValue.trim()) {
        e.preventDefault();
        if (!tagsValue.includes(inputValue.trim())) {
          onChange([...tagsValue, inputValue.trim()]);
        }
        setInputValue("");
      } else if (e.key === "Backspace" && !inputValue && tagsValue.length > 0) {
        onChange(tagsValue.slice(0, -1));
      }
    };
    
    const removeTag = (index: number) => {
      onChange(tagsValue.filter((_: string, i: number) => i !== index));
    };
    
    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={id} className="block text-xs font-medium text-gray-400">
            {label}
          </label>
        )}
        <div className="flex min-h-[42px] flex-wrap gap-1.5 rounded-md border border-gray-600 bg-gray-900/50 p-2 focus-within:border-cpm-accent focus-within:ring-1 focus-within:ring-cpm-accent/50">
          {tagsValue.map((tag: string, index: number) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 rounded-md bg-cpm-accent/20 px-2 py-1 text-xs text-cpm-accent"
            >
              {tag}
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => removeTag(index)}
                  className="ml-0.5 text-cpm-accent/70 hover:text-cpm-accent"
                >
                  ×
                </button>
              )}
            </span>
          ))}
          {!readOnly && (
            <input
              type="text"
              id={id}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={tagsValue.length === 0 ? "Type and press Enter..." : ""}
              className="min-w-[100px] flex-1 bg-transparent text-sm text-gray-200 placeholder-gray-500 focus:outline-none"
            />
          )}
        </div>
      </div>
    );
  },
};

export const presetPlugins: FieldPlugin[] = [
  colorPickerPlugin,
  rangeSliderPlugin,
  toggleSwitchPlugin,
  imageUploadPlugin,
  codeEditorPlugin,
  tagsPlugin,
];

export function createCustomField(
  type: string,
  config: Partial<CustomField> = {}
): CustomField {
  return {
    type,
    fieldKey: type,
    ...config,
  } as CustomField;
}

export function createInlineCustomField<T = unknown>(
  key: string,
  render: CustomFieldRenderFn<T>,
  config: Partial<CustomField> = {}
): FieldPlugin {
  return {
    key,
    name: config.label || key,
    render: render as CustomFieldRenderFn,
    defaultConfig: config,
  };
}
