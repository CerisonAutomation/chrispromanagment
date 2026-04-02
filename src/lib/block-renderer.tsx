// =============================================================================
// Block Renderer — Maps block type names to render functions from puck.config
// This replaces Puck's built-in rendering with a custom lightweight system
// =============================================================================

"use client";

import React from "react";
import config from "@/puck.config";
import type { BlockData, BlockItem } from "@/lib/block-types";

// ---------------------------------------------------------------------------
// Block Definition Type (matches puck.config structure)
// ---------------------------------------------------------------------------
interface BlockDefinition {
  label: string;
  render?: (props: Record<string, unknown>) => React.ReactNode;
  Component?: React.ComponentType<Record<string, unknown>>;
  defaultProps: Record<string, unknown>;
}

/**
 * Get a block definition by type name from the puck config.
 */
export function getBlockDefinition(type: string): BlockDefinition | undefined {
  return config.components[type as keyof typeof config.components] as
    | BlockDefinition
    | undefined;
}

// ---------------------------------------------------------------------------
// BlockRenderer — Renders a single block by type
// ---------------------------------------------------------------------------
export function BlockRenderer({ block, index }: { block: BlockItem; index: number }) {
  const def = getBlockDefinition(block.type);

  if (!def) {
    return (
      <div
        key={block.props?.id || `unknown-${index}`}
        className="rounded-lg border border-dashed border-red-500/30 bg-red-500/5 p-6 text-center"
      >
        <p className="text-sm text-red-400">Unknown block type: <code>{block.type}</code></p>
      </div>
    );
  }

  const key = (block.props?.id as string) || `${block.type}-${index}`;

  if (def.Component) {
    return React.createElement(def.Component, { ...block.props, key });
  }

  if (def.render) {
    return <React.Fragment key={key}>{def.render(block.props)}</React.Fragment>;
  }

  return null;
}

// ---------------------------------------------------------------------------
// PageRenderer — Renders all blocks from page data
// ---------------------------------------------------------------------------
export function PageRenderer({ data }: { data: BlockData }) {
  const content = data?.content;

  if (!content || !Array.isArray(content) || content.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-cpm-text-tertiary">
        <p className="text-sm">No content blocks</p>
      </div>
    );
  }

  return (
    <>
      {content.map((block, index) => (
        <BlockRenderer key={(block.props?.id as string) || `block-${index}`} block={block} index={index} />
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// Block type list for editor
// ---------------------------------------------------------------------------
export function getBlockTypeList(): { type: string; label: string }[] {
  return Object.entries(config.components).map(([type, def]) => ({
    type,
    label: (def as BlockDefinition).label || type,
  }));
}

// ---------------------------------------------------------------------------
// Block default props getter
// ---------------------------------------------------------------------------
export function getBlockDefaults(type: string): Record<string, unknown> {
  const def = getBlockDefinition(type);
  return def?.defaultProps ?? {};
}
