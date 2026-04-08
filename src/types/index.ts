/**
 * @fileoverview Canonical Type Definitions for Christiano Property Management
 * Central type definitions used throughout the application.
 */

import type { ReactNode } from 'react';

// ═══════════════════════════════════════════════════════════════════════════════
// DEVICE & VIEW MODES
// ═══════════════════════════════════════════════════════════════════════════════

export type DeviceMode = 'desktop' | 'tablet' | 'mobile';
export type ViewMode = 'edit' | 'preview';
export type SidebarPanel = 'blocks' | 'pages' | 'ai' | 'theme' | 'settings' | 'history' | null;
export type RightPanel = 'properties' | 'layers' | null;

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE DATA STRUCTURES
// ═══════════════════════════════════════════════════════════════════════════════

export interface PageData {
  id: string;
  slug: string;
  title: string;
  description?: string;
  puckData: PuckData;
  status: PageStatus;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  version: number;
}

export interface PageVersion {
  id: string;
  pageId: string;
  version: number;
  puckData: PuckData;
  createdAt: string;
  createdBy?: string;
  message?: string;
}

export interface LocalDraft {
  pageId: string;
  puckData: PuckData;
  savedAt: string;
}

export type SyncStatus = 'synced' | 'saving' | 'error' | 'offline';
export type PageStatus = 'draft' | 'published' | 'archived';

// ═══════════════════════════════════════════════════════════════════════════════
// THEME SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════════════════════
// TOAST & NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════════

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// AI ASSISTANT
// ═══════════════════════════════════════════════════════════════════════════════

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
  blocks?: ComponentData[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// HISTORY & UNDO/REDO
// ═══════════════════════════════════════════════════════════════════════════════

export interface HistoryEntry {
  id: string;
  timestamp: string;
  action: string;
  data: PuckData;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PUCK CMS TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface PuckData {
  content: Content[];
  root: RootData;
  zones?: Record<string, Content[]>;
}

export interface Content {
  type: string;
  props: Record<string, unknown>;
}

export interface RootData {
  props?: Record<string, unknown>;
  title?: string;
  description?: string;
  theme?: string;
}

export interface ComponentData {
  type: string;
  props: Record<string, unknown>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PUCK FIELD DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════

export interface BaseField {
  label?: string;
  placeholder?: string;
}

export interface TextField extends BaseField {
  type: 'text';
}

export interface TextareaField extends BaseField {
  type: 'textarea';
}

export interface SelectField extends BaseField {
  type: 'select';
  options: Array<{ label: string; value: string }>;
}

export interface NumberField extends BaseField {
  type: 'number';
  min?: number;
  max?: number;
}

export interface ArrayField extends BaseField {
  type: 'array';
  defaultItemProps?: Record<string, unknown>;
  arrayFields?: Record<string, AnyField>;
  getItemSummary?: (item: Record<string, unknown>) => string;
}

export interface CustomField extends BaseField {
  type: 'custom';
  render: (props: { value: unknown; onChange: (value: unknown) => void }) => ReactNode;
}

export type AnyField = TextField | TextareaField | SelectField | NumberField | ArrayField | CustomField | { type: string; [key: string]: unknown };

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT CONFIG (PUCK BLOCKS)
// ═══════════════════════════════════════════════════════════════════════════════

export interface ComponentConfig<Props extends Record<string, unknown> = Record<string, unknown>> {
  label: string;
  category?: string;
  metadata?: {
    description?: string;
    icon?: string;
  };
  fields: Record<string, AnyField>;
  defaultProps: Props;
  render: (props: Props) => ReactNode;
  ai?: {
    instructions?: string;
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// GUESTY INTEGRATION TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface GuestyListing {
  _id: string;
  title?: string;
  nickname?: string;
  bedrooms?: number;
  bathrooms?: number;
  occupancy?: number;
  prices?: {
    basePrice?: number;
    currency?: string;
  };
  pictures?: Array<{
    thumbnail?: string;
    regular?: string;
    large?: string;
  }>;
  address?: {
    city?: string;
    neighborhood?: string;
    country?: string;
    full?: string;
  };
  amenities?: string[];
  description?: string;
}

export interface GuestyReservation {
  _id: string;
  confirmationCode: string;
  status: string;
  checkIn: string;
  checkOut: string;
  guestsCount: number;
  money?: {
    totalPaid?: number;
    currency?: string;
  };
  guest?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITY TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Nullable<T> = T | null;

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
