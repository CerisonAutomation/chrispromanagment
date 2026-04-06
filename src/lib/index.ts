/**
 * @fileoverview Lib Index - Main exports for lib directory
 * 
 * Canonical exports organized by category:
 * - Hooks
 * - Store (with slices)
 * - Utils
 * - Migration
 * - Types
 * 
 * @example
 * import { useEditorStore } from '@/lib';
 * import type { Field, ComponentConfig } from '@/lib';
 */

// =============================================================================
// HOOKS
// =============================================================================
export * from './hooks';

// =============================================================================
// STORE
// =============================================================================
export * from './store';
export * from './store/slices/history';
export * from './store/slices/permissions';

// =============================================================================
// UTILS
// =============================================================================
export * from './utils/data-helpers';
export * from './utils/walk-transform';
export * from './utils/map-fields';
export * from './utils/generate-id';
export * from './shallow-equal';

// =============================================================================
// MIGRATION
// =============================================================================
export { migrate, needsMigration } from './migration';

// =============================================================================
// TYPES
// =============================================================================
export * from './types';

// =============================================================================
// API MODULE
// =============================================================================
export * from './api-index';

// =============================================================================
// CONSTANTS
// =============================================================================
export {
  API_CONFIG,
  CACHE_CONFIG,
  PAGINATION_DEFAULTS,
  DEFAULT_TIMEOUT,
  MAX_RETRIES,
} from './constants';
