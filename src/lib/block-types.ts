// =============================================================================
// Block Type Definitions — Local replacement for @puckeditor/core Data type
// Based on the same structure used by Puck's Data type
// =============================================================================

/**
 * Represents a single block instance in page content.
 */
export interface BlockItem {
  type: string;
  props: Record<string, unknown>;
}

/**
 * Page data structure compatible with Puck's Data format.
 * This allows seamless migration if Puck is ever re-introduced.
 */
export interface BlockData {
  content: BlockItem[];
  root: {
    props: Record<string, unknown>;
  };
}

/**
 * Page list item for admin dashboard.
 */
export interface PageListItem {
  id: string;
  slug: string;
  title: string;
  status: string;
  updatedAt: string;
}

/**
 * Create an empty block data structure.
 */
export function createEmptyBlockData(title?: string): BlockData {
  return {
    content: [],
    root: { props: { title: title || "Untitled" } },
  };
}

/**
 * Validate if data has proper BlockData structure.
 */
export function isValidBlockData(data: unknown): data is BlockData {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  return Array.isArray(d.content) && d.root !== null && typeof d.root === "object";
}
