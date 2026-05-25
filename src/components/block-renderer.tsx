// BlockRenderer — additive on-ramp toward editor consolidation (P3).
//
// Resolves a block type via the centralized registry instead of inline
// `switch (block.type)` statements. Existing renderers in LiveBlocks.jsx
// remain untouched — call sites can migrate incrementally to this
// component without a big-bang refactor.
import { SCHEMAS } from "@/lib/blocks.jsx";

export function BlockRenderer({ type, content, fallback = null, ...rest }) {
  const schema = SCHEMAS?.[type];
  if (!schema) {
    if (import.meta.env.DEV) {
      
    }
    return fallback;
  }
  const Renderer = schema.render || schema.component || schema.Component;
  if (typeof Renderer !== "function") return fallback;
  try {
    return <Renderer content={content} {...rest} />;
  } catch (e) {
    
    return fallback;
  }
}

export default BlockRenderer;
