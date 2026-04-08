/**
 * @fileoverview Zod to Puck Field Converter
 * Transforms Zod schemas into Puck CMS field definitions for dynamic block generation.
 *
 * @note This file uses .tsx extension because generateStubRender returns JSX (React.ReactNode).
 */

import type { z } from 'zod';
import type React from 'react';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface PuckField {
  type: 'text' | 'textarea' | 'select' | 'number' | 'array' | 'radio' | 'custom';
  label?: string;
  placeholder?: string;
  options?: Array<{ label: string; value: string | boolean }>;
  min?: number;
  max?: number;
  defaultItemProps?: Record<string, unknown>;
  arrayFields?: Record<string, PuckField>;
  getItemSummary?: (item: Record<string, unknown>) => string;
}

export type PuckFields = Record<string, PuckField>;

// ═══════════════════════════════════════════════════════════════════════════════
// ZOD TO PUCK FIELD CONVERTER
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Converts a Zod schema into Puck CMS field definitions.
 * Handles common Zod types: string, number, boolean, enum, array, object.
 */
export function zodToPuckFields(schema: z.ZodTypeAny): PuckFields {
  const fields: PuckFields = {};

  if (schema._def?.typeName === 'ZodObject') {
    const shape = (schema as z.ZodObject<z.ZodRawShape>).shape;

    for (const [key, fieldSchema] of Object.entries(shape)) {
      fields[key] = zodFieldToPuckField(key, fieldSchema as z.ZodTypeAny);
    }
  }

  return fields;
}

/**
 * Converts a single Zod field to a Puck field definition.
 */
function zodFieldToPuckField(name: string, schema: z.ZodTypeAny): PuckField {
  const typeName = schema._def?.typeName;
  const description = schema._def?.description;

  if (typeName === 'ZodOptional' || typeName === 'ZodNullable') {
    return zodFieldToPuckField(name, schema._def.innerType);
  }

  if (typeName === 'ZodDefault') {
    return zodFieldToPuckField(name, schema._def.innerType);
  }

  if (typeName === 'ZodString') {
    const maxLength = schema._def?.checks?.find((c: { kind: string }) => c.kind === 'max')?.value;
    return {
      type: maxLength && maxLength > 200 ? 'textarea' : 'text',
      label: formatLabel(name),
      placeholder: description,
    };
  }

  if (typeName === 'ZodNumber') {
    const min = schema._def?.checks?.find((c: { kind: string }) => c.kind === 'min')?.value;
    const max = schema._def?.checks?.find((c: { kind: string }) => c.kind === 'max')?.value;
    return {
      type: 'number',
      label: formatLabel(name),
      min,
      max,
    };
  }

  if (typeName === 'ZodBoolean') {
    return {
      type: 'radio',
      label: formatLabel(name),
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false },
      ],
    };
  }

  if (typeName === 'ZodEnum' || typeName === 'ZodNativeEnum') {
    const values = schema._def?.values || Object.values(schema._def?.values || {});
    return {
      type: 'select',
      label: formatLabel(name),
      options: (values as string[]).map((v: string) => ({
        label: formatLabel(String(v)),
        value: v,
      })),
    };
  }

  if (typeName === 'ZodArray') {
    const itemSchema = schema._def.type;
    const itemFields = zodToPuckFields(itemSchema);

    return {
      type: 'array',
      label: formatLabel(name),
      arrayFields: itemFields,
      defaultItemProps: extractDefaultProps(itemSchema),
      getItemSummary: (item: Record<string, unknown>) => {
        return String(item.title || item.name || item.label || item.question || 'Item');
      },
    };
  }

  if (typeName === 'ZodObject') {
    return {
      type: 'textarea',
      label: formatLabel(name),
      placeholder: 'JSON object',
    };
  }

  return {
    type: 'text',
    label: formatLabel(name),
  };
}

/**
 * Extracts default props from a Zod schema for array items.
 */
function extractDefaultProps(schema: z.ZodTypeAny): Record<string, unknown> {
  const defaults: Record<string, unknown> = {};

  if (schema._def?.typeName === 'ZodObject') {
    const shape = (schema as z.ZodObject<z.ZodRawShape>).shape;

    for (const [key, fieldSchema] of Object.entries(shape)) {
      const field = fieldSchema as z.ZodTypeAny;

      if (field._def?.typeName === 'ZodDefault') {
        defaults[key] = field._def.defaultValue();
      } else if (field._def?.typeName === 'ZodString') {
        defaults[key] = '';
      } else if (field._def?.typeName === 'ZodNumber') {
        defaults[key] = 0;
      } else if (field._def?.typeName === 'ZodBoolean') {
        defaults[key] = false;
      }
    }
  }

  return defaults;
}

/**
 * Formats a camelCase or snake_case field name into a readable label.
 */
function formatLabel(name: string): string {
  return name
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ═══════════════════════════════════════════════════════════════════════════════
// STUB RENDER GENERATOR
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generates a placeholder render function for blocks without a custom implementation.
 * Used as a fallback when a canonical block component doesn't exist yet.
 *
 * @param blockType - The block type identifier string shown in the editor placeholder.
 * @returns A React render function returning JSX placeholder UI.
 */
export function generateStubRender(blockType: string): (props: Record<string, unknown>) => React.ReactNode {
  return function StubRender(props: Record<string, unknown>): React.ReactNode {
    const title = props.title || props.heading || props.name || blockType;

    return (
      <div
        style={{
          padding: '2rem',
          border: '2px dashed rgba(200, 169, 106, 0.3)',
          borderRadius: '1rem',
          backgroundColor: 'rgba(200, 169, 106, 0.05)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'rgba(200, 169, 106, 0.8)',
            marginBottom: '0.5rem',
          }}
        >
          {blockType}
        </div>
        <div
          style={{
            fontSize: '1.25rem',
            fontWeight: 300,
            color: 'var(--cpm-text-primary, #e8e4dc)',
          }}
        >
          {String(title)}
        </div>
        <div
          style={{
            fontSize: '0.75rem',
            color: 'var(--cpm-text-tertiary, #6b7280)',
            marginTop: '0.5rem',
          }}
        >
          This block uses auto-generated fields. A custom render component can be added.
        </div>
      </div>
    );
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCHEMA VALIDATION HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Validates props against a Zod schema, returning sanitized props or null on failure.
 */
export function validateBlockProps<T>(schema: z.ZodType<T>, props: unknown): T | null {
  const result = schema.safeParse(props);
  return result.success ? result.data : null;
}

/**
 * Gets the default values from a Zod schema by parsing an empty object.
 */
export function getSchemaDefaults<T>(schema: z.ZodType<T>): Partial<T> {
  try {
    const result = schema.safeParse({});
    return result.success ? result.data : {};
  } catch {
    return {} as Partial<T>;
  }
}
