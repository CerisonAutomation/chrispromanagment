/**
 * BlockRenderer — single canonical renderer for CMS blocks.
 *
 * One block, one renderer: the editor canvas (LiveNavigateMode / PageEditor)
 * and the public site both render through this component. Add a block to
 * LIVE_BLOCKS once and it shows up everywhere.
 *
 * Props:
 *   block:     { id, type, data, visible? }
 *   onEdit?:   (patch) => void   // only passed in editor; omit for public
 *   mode?:     "public" | "editor" (default: "public")
 *   className?: string
 */

import { memo } from "react";
import { LIVE_BLOCKS } from "@/components/admin/LiveBlocks";
import { CarouselHero } from "@/components/blocks/CarouselHero";
import { BlockErrorBoundary } from "@/components/BlockErrorBoundary";

// Renderers registered outside LiveBlocks (game-changer / specialized blocks).
const EXTRA_BLOCKS = {
  hero_carousel: ({ d }) => <CarouselHero data={d} />,
};

function resolveRenderer(type) {
  return LIVE_BLOCKS?.[type] || EXTRA_BLOCKS[type] || null;
}

function BlockRendererImpl({ block, onEdit, mode = "public", className }) {
  if (!block || block.visible === false) return null;
  const Renderer = resolveRenderer(block.type);

  if (!Renderer) {
    if (mode === "editor") {
      return (
        <div
          className="my-2 p-3 border border-dashed border-[#D4AF37]/40 bg-[#D4AF37]/5 text-xs text-[#D4AF37]"
          data-testid={`block-unknown-${block.type}`}
        >
          Unknown block type: <code>{block.type}</code>
        </div>
      );
    }
    return null;
  }

  const data = block.data || {};
  // Public mode never receives onEdit, so inline-edit handlers stay inert.
  const handler = mode === "editor" ? onEdit : undefined;

  return (
    <BlockErrorBoundary blockType={block.type} blockId={block.id}>
      <div data-block-id={block.id} data-block-type={block.type} className={className}>
        <Renderer d={data} onEdit={handler} />
      </div>
    </BlockErrorBoundary>
  );
}

export const BlockRenderer = memo(BlockRendererImpl);

/**
 * Render an ordered list of blocks. Public pages can do:
 *   <BlockList blocks={page.blocks} />
 * Editor canvases keep their own selection chrome and call BlockRenderer per block.
 */
export const BlockList = memo(function BlockList({ blocks = [], mode = "public", className }) {
  if (!Array.isArray(blocks)) return null;
  return (
    <>
      {blocks.map((b) =>
        b ? <BlockRenderer key={b.id || `${b.type}-${b._idx ?? ""}`} block={b} mode={mode} className={className} /> : null
      )}
    </>
  );
});

export default BlockRenderer;
