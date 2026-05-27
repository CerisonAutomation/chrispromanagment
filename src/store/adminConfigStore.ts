import { create } from 'zustand'
import { produce } from 'immer'
import type { BlockConfig } from '@/lib/blocks'

interface UndoEntry {
  blocks: BlockConfig[]
  label: string
  timestamp: number
}

interface AdminConfigState {
  blocks: BlockConfig[]
  undoStack: UndoEntry[]
  redoStack: UndoEntry[]
  setBlocks: (blocks: BlockConfig[]) => void
  updateBlock: (id: string, updates: Partial<BlockConfig>) => void
  updateBlockProps: (id: string, props: Record<string, unknown>) => void
  addBlock: (block: BlockConfig, index?: number) => void
  removeBlock: (id: string) => void
  duplicateBlock: (id: string) => void
  moveBlock: (fromIndex: number, toIndex: number) => void
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean
}

function snapshot(blocks: BlockConfig[]): BlockConfig[] {
  return JSON.parse(JSON.stringify(blocks))
}

const MAX_UNDO = 50

function pushUndo(state: AdminConfigState, blocks: BlockConfig[], label: string): Partial<AdminConfigState> {
  return {
    undoStack: [...state.undoStack, { blocks: snapshot(state.blocks), label, timestamp: Date.now() }].slice(-MAX_UNDO),
    redoStack: [],
    blocks,
  }
}

export const useAdminConfigStore = create<AdminConfigState>()((set, get) => ({
  blocks: [],
  undoStack: [],
  redoStack: [],

  setBlocks: (blocks) => set({ blocks, undoStack: [], redoStack: [] }),

  updateBlock: (id, updates) =>
    set((state) => ({
      ...pushUndo(state, state.blocks, 'Update block'),
      blocks: produce([...state.blocks], (draft) => {
        const block = draft.find((b) => b.id === id)
        if (block) {
Object.assign(block, updates)
}
      }),
    })),

  updateBlockProps: (id, props) =>
    set((state) => ({
      ...pushUndo(state, state.blocks, 'Update properties'),
      blocks: produce([...state.blocks], (draft) => {
        const block = draft.find((b) => b.id === id)
        if (block) {
Object.assign(block.props, props)
}
      }),
    })),

  addBlock: (block, index) =>
    set((state) => {
      const newBlocks = [...state.blocks]
      if (index !== undefined) {
        newBlocks.splice(index, 0, block)
      } else {
        newBlocks.push(block)
      }
      return { ...pushUndo(state, state.blocks, 'Add block'), blocks: newBlocks }
    }),

  removeBlock: (id) =>
    set((state) => ({
      ...pushUndo(state, state.blocks, 'Remove block'),
      blocks: state.blocks.filter((b) => b.id !== id),
    })),

  duplicateBlock: (id) =>
    set((state) => {
      const idx = state.blocks.findIndex((b) => b.id === id)
      if (idx === -1) {
return state
}
      const original = state.blocks[idx]
      const clone: BlockConfig = {
        ...JSON.parse(JSON.stringify(original)),
        id: `block-${Date.now()}`,
      }
      const newBlocks = [...state.blocks]
      newBlocks.splice(idx + 1, 0, clone)
      return { ...pushUndo(state, state.blocks, 'Duplicate block'), blocks: newBlocks }
    }),

  moveBlock: (fromIndex, toIndex) =>
    set((state) => {
      const newBlocks = [...state.blocks]
      const [moved] = newBlocks.splice(fromIndex, 1)
      newBlocks.splice(toIndex, 0, moved)
      return { ...pushUndo(state, state.blocks, 'Move block'), blocks: newBlocks }
    }),

  undo: () =>
    set((state) => {
      if (state.undoStack.length === 0) {
return state
}
      const prev = state.undoStack[state.undoStack.length - 1]
      return {
        undoStack: state.undoStack.slice(0, -1),
        redoStack: [...state.redoStack, { blocks: snapshot(state.blocks), label: prev.label, timestamp: Date.now() }],
        blocks: prev.blocks,
      }
    }),

  redo: () =>
    set((state) => {
      if (state.redoStack.length === 0) {
return state
}
      const next = state.redoStack[state.redoStack.length - 1]
      return {
        redoStack: state.redoStack.slice(0, -1),
        undoStack: [...state.undoStack, { blocks: snapshot(state.blocks), label: next.label, timestamp: Date.now() }],
        blocks: next.blocks,
      }
    }),

  canUndo: () => get().undoStack.length > 0,
  canRedo: () => get().redoStack.length > 0,
}))
