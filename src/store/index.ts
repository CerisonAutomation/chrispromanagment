// =============================================================================
// STORE INDEX - Canonical Store Exports
// =============================================================================

// Canonical editor store
export {
  useEditorStore,
  selectSelectedBlock,
  selectCanUndo,
  selectCanRedo,
  selectBlockById,
  selectBlockIndex,
  selectBlocksByType,
  selectIsDirty,
  selectIsSaving,
  selectSyncStatus,
  selectCurrentTheme,
  selectToasts,
  selectViewMode,
  selectDeviceMode,
  selectCanvasZoom,
  selectSidebarPanel,
  selectRightPanel,
} from './editor-store-canonical';

export type {
  EditorStore,
  EditorState,
  EditorActions,
  ViewMode,
  DeviceMode,
  SidebarPanel,
  RightPanel,
  ToastType,
  Toast,
  UndoSnapshot,
  SyncStatus,
} from './editor-store-canonical';

// Puck editor store (legacy, for compatibility)
export { usePuckEditorStore } from './puck-editor-store';

// Puck reducer
export { puckReducer, createReducer } from './puck-reducer';

export type {
  PuckAction,
  InsertAction,
  RemoveAction,
  ReplaceAction,
  ReorderAction,
  MoveAction,
  DuplicateAction,
  SelectAction,
  SetUiAction,
  SetDataAction,
  BatchAction,
  ResetAction,
} from './puck-reducer';

// Default app state
export { defaultAppState } from './default-app-state';
