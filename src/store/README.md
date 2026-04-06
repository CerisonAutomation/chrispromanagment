# Store - Zustand State Management

## Overview

Centralized state management using Zustand with the canonical editor store providing full editor functionality.

## Structure

```
store/
├── index.ts                    # Main exports
├── editor-store-canonical.ts   # Main editor store
├── puck-editor-store.ts        # Legacy Puck store
├── puck-reducer.ts            # Puck action reducer
├── default-app-state.ts       # Default state values
├── app-store-context.tsx      # React context wrapper
└── slices/                    # Store slices
    ├── data-slice.ts          # Content data management
    ├── fields-slice.ts        # Field configuration
    ├── history-slice.ts        # Undo/redo
    ├── permissions-slice.ts   # User permissions
    ├── ui-slice.ts            # UI state
    ├── history.ts             # History utilities
    └── permissions.ts         # Permission utilities
```

## Main Exports

```typescript
import { 
  useEditorStore,
  usePuckEditorStore,
  puckReducer,
  defaultAppState,
  selectSelectedBlock,
  selectCanUndo,
} from '@/store';
```

## Editor Store (editor-store-canonical.ts)

Production-ready Zustand store with all editor functionality:

### State Shape

```typescript
interface EditorState {
  // Core data
  page: Page | null;
  blocks: readonly Block[];
  selectedBlockId: BlockId | null;
  hoveredBlockId: BlockId | null;
  
  // Puck-compatible data
  puckData: Data | null;
  puckComponents: Record<string, ComponentData>;
  
  // UI state
  viewMode: ViewMode;
  deviceMode: DeviceMode;
  sidebarPanel: SidebarPanel;
  rightPanel: RightPanel;
  canvasZoom: number;
  
  // Drag & drop
  draggedBlockId: BlockId | null;
  dragOverIndex: number | null;
  isDragging: boolean;
  
  // Undo/redo
  undoStack: readonly UndoSnapshot[];
  redoStack: readonly UndoSnapshot[];
  
  // Status
  isDirty: boolean;
  isSaving: boolean;
  isLoading: boolean;
  lastSavedAt: number | null;
  
  // Theme
  currentTheme: Theme;
  availableThemes: readonly Theme[];
  
  // Sync
  syncStatus: SyncStatus;
}
```

### UI Types

```typescript
type ViewMode = 'edit' | 'preview' | 'code' | 'split';
type DeviceMode = 'desktop' | 'tablet' | 'mobile';
type SidebarPanel = 'blocks' | 'ai' | 'theme' | 'pages' | 'settings' | 'assets' | 'none';
type RightPanel = 'properties' | 'styles' | 'animations' | 'events' | 'none';
type ToastType = 'success' | 'error' | 'info' | 'warning';
type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'offline';
```

## Usage Examples

### Basic Store Usage

```typescript
import { useEditorStore } from '@/store';

function Editor() {
  const { 
    puckData, 
    selectedBlockId, 
    isDirty,
    viewMode 
  } = useEditorStore();
  
  return <div>...</div>;
}
```

### Block Operations

```typescript
import { useEditorStore } from '@/store';

function BlockToolbar() {
  const { 
    selectedBlockId,
    addBlock,
    removeBlock,
    updateBlock,
    duplicateBlock,
    selectBlock 
  } = useEditorStore();
  
  const handleAdd = () => {
    const result = addBlock('hero', 0, { title: 'New Hero' });
    if (result.success) {
      console.log('Added:', result.data.id);
    }
  };
  
  const handleDelete = () => {
    if (selectedBlockId) {
      removeBlock(selectedBlockId);
    }
  };
  
  return <div>...</div>;
}
```

### Undo/Redo

```typescript
import { useEditorStore } from '@/store';

function UndoControls() {
  const { undo, redo, canUndo, canRedo } = useEditorStore();
  
  return (
    <div>
      <button onClick={undo} disabled={!canUndo()}>Undo</button>
      <button onClick={redo} disabled={!canRedo()}>Redo</button>
    </div>
  );
}
```

### Toast Notifications

```typescript
import { useEditorStore } from '@/store';

function ToastDemo() {
  const { addToast, removeToast, toasts } = useEditorStore();
  
  const showSuccess = () => {
    addToast({
      type: 'success',
      title: 'Saved!',
      description: 'Your changes have been saved.',
      duration: 3000,
    });
  };
  
  const showError = () => {
    addToast({
      type: 'error',
      title: 'Error',
      description: 'Something went wrong.',
      duration: 5000,
      action: {
        label: 'Retry',
        onClick: () => retryOperation(),
      },
    });
  };
  
  return (
    <div>
      <button onClick={showSuccess}>Success</button>
      <button onClick={showError}>Error</button>
      
      {/* Toast Container */}
      <div className="toast-container">
        {toasts.map(toast => (
          <Toast key={toast.id} {...toast} />
        ))}
      </div>
    </div>
  );
}
```

### View Mode Switching

```typescript
import { useEditorStore } from '@/store';

function ViewSwitcher() {
  const { viewMode, setViewMode, deviceMode, setDeviceMode } = useEditorStore();
  
  return (
    <div>
      <select value={viewMode} onChange={e => setViewMode(e.target.value)}>
        <option value="edit">Edit</option>
        <option value="preview">Preview</option>
        <option value="code">Code</option>
        <option value="split">Split</option>
      </select>
      
      <div className="device-switcher">
        <button onClick={() => setDeviceMode('desktop')}>Desktop</button>
        <button onClick={() => setDeviceMode('tablet')}>Tablet</button>
        <button onClick={() => setDeviceMode('mobile')}>Mobile</button>
      </div>
    </div>
  );
}
```

### Canvas Zoom

```typescript
import { useEditorStore } from '@/store';

function ZoomControls() {
  const { canvasZoom, setCanvasZoom, zoomIn, zoomOut, resetZoom } = useEditorStore();
  
  return (
    <div>
      <button onClick={zoomOut}>-</button>
      <span>{canvasZoom}%</span>
      <button onClick={zoomIn}>+</button>
      <button onClick={resetZoom}>Reset</button>
      
      <input 
        type="range" 
        min="25" 
        max="200" 
        value={canvasZoom}
        onChange={e => setCanvasZoom(Number(e.target.value))}
      />
    </div>
  );
}
```

### Page Management

```typescript
import { useEditorStore } from '@/store';

function PageManager() {
  const { 
    page, 
    loadPage, 
    createPage, 
    savePage, 
    publishPage,
    updatePageTitle,
    isDirty,
    isSaving 
  } = useEditorStore();
  
  const handleSave = async () => {
    const result = await savePage();
    if (result.success) {
      console.log('Saved!');
    }
  };
  
  const handlePublish = async () => {
    const result = await publishPage();
    if (result.success) {
      showToast('Page published!');
    }
  };
  
  return (
    <div>
      {page && (
        <>
          <input 
            value={page.title}
            onChange={e => updatePageTitle(e.target.value)}
          />
          <button onClick={handleSave} disabled={!isDirty || isSaving}>
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          <button onClick={handlePublish}>Publish</button>
        </>
      )}
    </div>
  );
}
```

## Selectors

Optimized selectors for specific state slices:

```typescript
import { 
  selectSelectedBlock,
  selectCanUndo,
  selectCanRedo,
  selectBlocksByType,
  selectIsDirty,
  selectSyncStatus,
  selectToasts,
  selectCurrentTheme,
} from '@/store';

function Component() {
  const selectedBlock = useEditorStore(selectSelectedBlock);
  const canUndo = useEditorStore(selectCanUndo);
  const canRedo = useEditorStore(selectCanRedo);
  const heroBlocks = useEditorStore(state => 
    selectBlocksByType(state, 'hero')
  );
  
  return <div>...</div>;
}
```

## Puck Reducer

For Puck-compatible actions:

```typescript
import { puckReducer, createReducer } from '@/store';

const initialState = { data: { content: [], root: { props: {} } } };

const reducer = createReducer(initialState);

// Dispatch Puck actions
const newState = puckReducer(initialState, {
  type: 'insert',
  component: { type: 'HeroSection', props: { id: '123' } },
  index: 0,
  after: null,
});
```

## Constants

```typescript
const MAX_UNDO = 50;           // Maximum undo stack size
const MAX_VERSIONS = 20;       // Version history limit
const DEFAULT_AUTOSAVE_INTERVAL = 30000;  // 30 seconds
const DEFAULT_ZOOM = 100;      // Default canvas zoom
const MIN_ZOOM = 25;           // Minimum zoom
const MAX_ZOOM = 200;          // Maximum zoom
```
