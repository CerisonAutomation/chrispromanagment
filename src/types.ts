// =============================================================================
// TYPES SHIM - Redirect to canonical types
// =============================================================================

export * from '@/lib/canonical';

export interface AppState {
  data: any;
}

export interface ComponentData {
  id: string;
  type: string;
  props: Record<string, unknown>;
}
