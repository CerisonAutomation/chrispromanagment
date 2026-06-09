# Task 3: Auto-select Props panel when block is selected

## Agent: full-stack-developer

## Work Summary

### Files Modified
1. **`/home/z/my-project/src/components/editor/canvas.tsx`**
   - Added `useEditorStore()` to `SortableBlockWrapper` component
   - Enhanced `onClick` handler to dispatch `right-sidebar-tab` custom event with `{ tab: "props" }`
   - Auto-opens right sidebar if closed when a block is clicked

2. **`/home/z/my-project/src/app/admin/page.tsx`**
   - Added `useEffect` watching `store.selectedBlockId` changes
   - When a block is selected (via any method), dispatches `right-sidebar-tab` event with `{ tab: "props" }`
   - Opens right sidebar if closed using `useEditorStore.getState().toggleRightSidebar()`
   - Covers all selection paths: click, keyboard (Ctrl+D, Ctrl+V), add block, duplicate

### No Changes Needed
- **`right-sidebar.tsx`** - Already listens for `right-sidebar-tab` custom events (lines 63-72)
- **`canvas-toolbar.tsx`** - Already uses same pattern for AI panel button (line 459)

### Key Design Decisions
- Used `useEditorStore.getState()` inside useEffect to read sidebar state without adding it to dependency array (avoids unnecessary re-runs)
- Canvas click handler provides immediate response; useEffect provides fallback for all other selection methods
- Double-dispatch for clicks is harmless (same event, same target)
