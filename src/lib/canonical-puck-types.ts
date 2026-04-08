/**
 * @fileoverview Canonical Puck Types — Type definitions for Puck CMS components.
 * Re-exports from @/types for backwards compatibility with existing block imports.
 */

export type { ComponentConfig, AnyField, PuckData, Content, RootData } from '@/types';

// Additional Puck-specific types used in blocks
import type { ReactNode } from 'react';

export interface FieldConfig {
  type: 'text' | 'textarea' | 'select' | 'number' | 'array' | 'radio' | 'checkbox' | 'custom';
  label?: string;
  placeholder?: string;
  options?: Array<{ label: string; value: string | boolean }>;
  min?: number;
  max?: number;
  defaultItemProps?: Record<string, unknown>;
  arrayFields?: Record<string, FieldConfig>;
  getItemSummary?: (item: Record<string, unknown>) => string;
}

export interface BlockMetadata {
  description?: string;
  icon?: string;
  screenshot?: string;
}

export interface BlockConfig<Props extends Record<string, unknown> = Record<string, unknown>> {
  label: string;
  category?: string;
  metadata?: BlockMetadata;
  fields: Record<string, FieldConfig>;
  defaultProps: Props;
  render: (props: Props) => ReactNode;
  ai?: {
    instructions?: string;
    examples?: string[];
  };
}
