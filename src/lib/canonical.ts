/**
 * @fileoverview Canonical types & themes — maintained for backwards compatibility.
 *
 * ⚠️  All type definitions have been migrated to `src/types/`.
 *     This file re-exports them for zero-diff migration of existing import paths.
 *     New code should import directly from '@/types'.
 *
 * @deprecated Import from '@/types' instead.
 */

// Re-export all types from the new canonical gateway
export type {
  DeviceMode,
  ViewMode,
  SidebarPanel,
  RightPanel,
  PageData,
  PageVersion,
  LocalDraft,
  SyncStatus,
  PageStatus,
  ThemeColors,
  ThemeFonts,
  ThemeData,
  Toast,
  ToastType,
  AIMessage,
  HistoryEntry,
  PuckData,
  ComponentConfig,
  ComponentData,
  Content,
  RootData,
  AnyField,
  BaseField,
  TextField,
  TextareaField,
  SelectField,
  NumberField,
  ArrayField,
  CustomField,
  /** @deprecated Use PuckData */
  PuckData as Data,
  /** @deprecated Use PuckData */
  PuckData as BlockData,
} from '@/types';

// ─── Default Themes (runtime value — cannot be a type-only export) ─────────────
import type { ThemeData } from '@/types';

export const canonicalThemes: ThemeData[] = [
  {
    id: 'default',
    name: 'Default',
    colors: {
      primary: '#c8a96a', secondary: '#a08040', accent: '#c8a96a',
      background: '#0e0f11', foreground: '#e8e4dc', muted: '#1a1b1f',
      border: '#2a2b30', card: '#151518', error: '#ef4444',
      success: '#22c55e', warning: '#f59e0b',
    },
    fonts: { heading: 'Inter', body: 'Inter' },
  },
  {
    id: 'ivory',
    name: 'Ivory Marble',
    colors: {
      primary: '#9b7240', secondary: '#7a5a30', accent: '#9b7240',
      background: '#faf6f0', foreground: '#2a2318', muted: '#f0ebe3',
      border: '#e0d8cc', card: '#ffffff', error: '#dc2626',
      success: '#16a34a', warning: '#d97706',
    },
    fonts: { heading: 'Playfair Display', body: 'Source Sans Pro' },
  },
  {
    id: 'midnight',
    name: 'Midnight Sapphire',
    colors: {
      primary: '#8ba8d0', secondary: '#6a8ab8', accent: '#8ba8d0',
      background: '#0a0e1a', foreground: '#d0d8e8', muted: '#141a2a',
      border: '#1e2438', card: '#121a2a', error: '#f87171',
      success: '#34d399', warning: '#fbbf24',
    },
    fonts: { heading: 'Inter', body: 'Inter' },
  },
  {
    id: 'obsidian',
    name: 'Obsidian Gold',
    colors: {
      primary: '#f0c050', secondary: '#d0a030', accent: '#f0c050',
      background: '#050505', foreground: '#f0ece4', muted: '#111111',
      border: '#222222', card: '#0a0a0a', error: '#f87171',
      success: '#4ade80', warning: '#fbbf24',
    },
    fonts: { heading: 'Cinzel', body: 'Inter' },
  },
  {
    id: 'neural',
    name: 'Neural Network',
    colors: {
      primary: '#00d4ff', secondary: '#7b2ff7', accent: '#00d4ff',
      background: '#0a0a0f', foreground: '#e8f4f8', muted: '#151520',
      border: '#252535', card: '#12121f', error: '#f87171',
      success: '#22d3ee', warning: '#fbbf24',
    },
    fonts: { heading: 'Inter', body: 'Inter' },
  },
  {
    id: 'matrix',
    name: 'Matrix AI',
    colors: {
      primary: '#00ff41', secondary: '#00cc33', accent: '#00ff41',
      background: '#000a00', foreground: '#e0ffe0', muted: '#001500',
      border: '#003300', card: '#001000', error: '#ff3333',
      success: '#00ff41', warning: '#ffff00',
    },
    fonts: { heading: 'JetBrains Mono', body: 'JetBrains Mono' },
  },
];

export default canonicalThemes;
