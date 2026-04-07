// =============================================================================
// STORE INDEX - Canonical Store Exports
// =============================================================================

// Canonical types
export * from '@/lib/canonical';

// Admin store (new unified store)
export {
    useAdminStore,
} from './admin-store';

export type {
    AdminState,
    AdminActions,
    PageData,
    ThemeData,
    Toast,
    ToastType,
    AIMessage,
    DeviceMode,
    ViewMode,
    SidebarPanel,
    RightPanel,
} from './admin-store';

// Selectors from admin store
export {
  selectCanUndo,
  selectCanRedo,
  selectIsDirty,
    selectCurrentPage,
    selectContent,
  selectViewMode,
  selectDeviceMode,
  selectSidebarPanel,
  selectRightPanel,
    selectCurrentTheme,
    selectThemes,
    selectAiMessages,
    selectIsAiGenerating,
    selectToasts,
    selectIsSaving,
    selectIsPublishing,
    selectLastSavedAt,
    selectPages,
    selectIsLoadingPages,
} from './admin-store';

// Re-export canonicalThemes from canonical
export { canonicalThemes } from '@/lib/canonical';
