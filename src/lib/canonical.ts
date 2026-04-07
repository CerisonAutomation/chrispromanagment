// =============================================================================
// CANONICAL TYPES - Single Source of Truth for Christiano Property Management
// =============================================================================
// Harmonized from: admin-store.ts, puck-editor-store.ts, canonical-puck-types.ts
// Provides unified types for all stores, components, and APIs

import type {Data} from '@puckeditor/core';

// =============================================================================
// CORE EDITOR TYPES
// =============================================================================

export type DeviceMode = 'desktop' | 'tablet' | 'mobile';
export type ViewMode = 'edit' | 'preview';
export type SidebarPanel = 'blocks' | 'ai' | 'pages' | 'theme' | 'none';
export type RightPanel = 'properties' | 'none';
export type ToastType = 'success' | 'error' | 'info' | 'warning';
export type PageStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type SyncStatus = 'synced' | 'pending' | 'error';

// =============================================================================
// PAGE TYPES
// =============================================================================

export interface PageData {
  id?: string;
  slug: string;
  title: string;
  status: PageStatus;
  content: Data | null;
  metaTitle?: string;
  metaDescription?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PageVersion {
  id: string;
  pageId: string;
  data: Data;
  title: string;
  createdAt: number;
  description?: string;
}

export interface LocalDraft {
  pageId: string;
  slug: string;
  data: Data;
  title: string;
  lastModified: number;
  syncStatus: SyncStatus;
}

// =============================================================================
// THEME TYPES
// =============================================================================

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  muted: string;
  border: string;
  card: string;
  error: string;
  success: string;
  warning: string;
}

export interface ThemeFonts {
  heading: string;
  body: string;
}

export interface ThemeData {
  id: string;
  name: string;
  colors: ThemeColors;
  fonts: ThemeFonts;
}

// =============================================================================
// UI TYPES
// =============================================================================

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  loading?: boolean;
}

export interface HistoryEntry {
  content: Data | null;
  selectedBlockId: string | null;
  timestamp: number;
}

// =============================================================================
// BLOCK TYPES
// =============================================================================

export interface BlockData {
  id: string;
  type: string;
  props: Record<string, unknown>;
}

export interface ComponentConfig {
  type: string;
  label: string;
  icon: string;
  category: 'layout' | 'content' | 'media' | 'interactive' | 'sections' | 'hero' | 'marketing';
  description: string;
  defaultProps: Record<string, unknown>;
  fields: Record<string, unknown>;
  render: (props: unknown) => React.ReactElement;
  inline?: boolean;
  draggable?: boolean;
  droppable?: boolean;
}

// =============================================================================
// FIELD TYPES (from Puck)
// =============================================================================

export interface BaseField {
  label?: string;
  labelIcon?: React.ReactElement;
  visible?: boolean;
  metadata?: { description?: string };
}

export interface TextField extends BaseField {
  type: 'text';
  placeholder?: string;
}

export interface TextareaField extends BaseField {
  type: 'textarea';
  placeholder?: string;
  rows?: number;
}

export interface SelectField extends BaseField {
  type: 'select';
  options: Array<{ label: string; value: string }>;
  placeholder?: string;
}

export interface NumberField extends BaseField {
  type: 'number';
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
}

export interface SwitchField extends BaseField {
  type: 'switch';
}

export interface ArrayField<T = Record<string, unknown>> extends BaseField {
  type: 'array';
  arrayFields: Record<string, unknown>;
  defaultItemProps?: Partial<T>;
  minItems?: number;
  maxItems?: number;
}

export interface CustomField<T = unknown> extends BaseField {
  type: 'custom';
  render: (props: {
    name: string;
    value: T;
    onChange: (value: T) => void;
    field: CustomField<T>;
    readOnly: boolean;
  }) => React.ReactNode;
}

export type AnyField = TextField | TextareaField | SelectField | NumberField | SwitchField | ArrayField | CustomField;

// =============================================================================
// DEFAULT THEMES
// =============================================================================

export const canonicalThemes: ThemeData[] = [
  {
    id: 'default',
    name: 'Default',
    colors: {
      primary: '#c8a96a',
      secondary: '#a08040',
      accent: '#c8a96a',
      background: '#0e0f11',
      foreground: '#e8e4dc',
      muted: '#1a1b1f',
      border: '#2a2b30',
      card: '#151518',
      error: '#ef4444',
      success: '#22c55e',
      warning: '#f59e0b',
    },
    fonts: { heading: 'Inter', body: 'Inter' },
  },
  {
    id: 'ivory',
    name: 'Ivory Marble',
    colors: {
      primary: '#9b7240',
      secondary: '#7a5a30',
      accent: '#9b7240',
      background: '#faf6f0',
      foreground: '#2a2318',
      muted: '#f0ebe3',
      border: '#e0d8cc',
      card: '#ffffff',
      error: '#dc2626',
      success: '#16a34a',
      warning: '#d97706',
    },
    fonts: { heading: 'Playfair Display', body: 'Source Sans Pro' },
  },
  {
    id: 'midnight',
    name: 'Midnight Sapphire',
    colors: {
      primary: '#8ba8d0',
      secondary: '#6a8ab8',
      accent: '#8ba8d0',
      background: '#0a0e1a',
      foreground: '#d0d8e8',
      muted: '#141a2a',
      border: '#1e2438',
      card: '#121a2a',
      error: '#f87171',
      success: '#34d399',
      warning: '#fbbf24',
    },
    fonts: { heading: 'Inter', body: 'Inter' },
  },
  {
    id: 'obsidian',
    name: 'Obsidian Gold',
    colors: {
      primary: '#f0c050',
      secondary: '#d0a030',
      accent: '#f0c050',
      background: '#050505',
      foreground: '#f0ece4',
      muted: '#111111',
      border: '#222222',
      card: '#0a0a0a',
      error: '#f87171',
      success: '#4ade80',
      warning: '#fbbf24',
    },
    fonts: { heading: 'Cinzel', body: 'Inter' },
  },
  {
    id: 'neural',
    name: 'Neural Network',
    colors: {
      primary: '#00d4ff',
      secondary: '#7b2ff7',
      accent: '#00d4ff',
      background: '#0a0a0f',
      foreground: '#e8f4f8',
      muted: '#151520',
      border: '#252535',
      card: '#12121f',
      error: '#f87171',
      success: '#22d3ee',
      warning: '#fbbf24',
    },
    fonts: { heading: 'Inter', body: 'Inter' },
  },
  {
    id: 'matrix',
    name: 'Matrix AI',
    colors: {
      primary: '#00ff41',
      secondary: '#00cc33',
      accent: '#00ff41',
      background: '#000a00',
      foreground: '#e0ffe0',
      muted: '#001500',
      border: '#003300',
      card: '#001000',
      error: '#ff3333',
      success: '#00ff41',
      warning: '#ffff00',
    },
    fonts: { heading: 'JetBrains Mono', body: 'JetBrains Mono' },
  },
];

// =============================================================================
// RE-EXPORTS FOR BACKWARDS COMPATIBILITY
// =============================================================================

export type { Data } from '@puckeditor/core';

// Default export for convenience
export default canonicalThemes;