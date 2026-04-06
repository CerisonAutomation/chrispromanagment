// =============================================================================
// Admin Components - Unified Export
// Combined and harmonized admin system with block autosync
// =============================================================================

export {
  UnifiedAdminDashboard,
  useBlockAutosync,
  SyncStatusIndicator,
  type BlockItem,
  type BlockData,
  type PageItem,
  type SyncState,
  type UnifiedAdminDashboardProps,
} from "./unified-admin";

// Re-export for backward compatibility
export { UnifiedAdminDashboard as AdminDashboard } from "./unified-admin";
