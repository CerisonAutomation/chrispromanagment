/**
 * CMS Undo/Redo Engine
 * Lifted directly from OpenPage configStore's pushUndo/undo/redo pattern,
 * adapted for Christiano's flat CmsRow model instead of block pages.
 *
 * Max 50 entries, timestamped, labelled.
 */

import type { CmsRow } from "./cms-types";

export interface UndoEntry {
  rows:      CmsRow[];
  label:     string;
  timestamp: number;
}

const MAX_UNDO = 50;

export class CmsUndoStack {
  private undoStack: UndoEntry[] = [];
  private redoStack: UndoEntry[] = [];

  /** Deep clone of current rows → push onto undo stack */
  push(rows: CmsRow[], label: string): void {
    const snap: UndoEntry = {
      rows:      JSON.parse(JSON.stringify(rows)) as CmsRow[],
      label,
      timestamp: Date.now(),
    };
    this.undoStack = [...this.undoStack, snap].slice(-MAX_UNDO);
    this.redoStack = []; // Clear redo on new action
  }

  /** Pop last undo entry, push current state onto redo stack */
  undo(currentRows: CmsRow[]): CmsRow[] | null {
    if (this.undoStack.length === 0) return null;
    const prev = this.undoStack[this.undoStack.length - 1]!;
    const snap: UndoEntry = {
      rows:      JSON.parse(JSON.stringify(currentRows)) as CmsRow[],
      label:     prev.label,
      timestamp: Date.now(),
    };
    this.redoStack = [...this.redoStack, snap];
    this.undoStack = this.undoStack.slice(0, -1);
    return JSON.parse(JSON.stringify(prev.rows)) as CmsRow[];
  }

  /** Pop last redo entry, push current state onto undo stack */
  redo(currentRows: CmsRow[]): CmsRow[] | null {
    if (this.redoStack.length === 0) return null;
    const next = this.redoStack[this.redoStack.length - 1]!;
    const snap: UndoEntry = {
      rows:      JSON.parse(JSON.stringify(currentRows)) as CmsRow[],
      label:     next.label,
      timestamp: Date.now(),
    };
    this.undoStack = [...this.undoStack, snap];
    this.redoStack = this.redoStack.slice(0, -1);
    return JSON.parse(JSON.stringify(next.rows)) as CmsRow[];
  }

  canUndo(): boolean { return this.undoStack.length > 0; }
  canRedo(): boolean { return this.redoStack.length > 0; }

  getUndoStack(): readonly UndoEntry[] { return this.undoStack; }
  getRedoStack(): readonly UndoEntry[] { return this.redoStack; }

  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
  }
}

// Module-level singleton — one stack per admin session
export const cmsUndoStack = new CmsUndoStack();
