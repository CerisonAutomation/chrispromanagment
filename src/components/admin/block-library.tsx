import { useState } from "react";
import { 
  Layout, Type, Image, Quote, Star, Phone, Award, Map, List,
  Plus, Copy, Trash2, GripVertical, ChevronRight, Settings,
  Video, Grid, Columns, Box, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

// All available block types
const BLOCK_LIBRARY = [
  {
    category: "Layout",
    blocks: [
      { id: "hero", icon: Layout, label: "Hero Section", desc: "Full-width hero with headline, subtext, and CTA" },
      { id: "section", icon: Box, label: "Content Section", desc: "Generic content container" },
      { id: "columns", icon: Columns, label: "Multi-Column", desc: "2 or 3 column layout" },
      { id: "grid", icon: Grid, label: "Grid Layout", desc: "Flexible grid for cards or items" },
    ],
  },
  {
    category: "Content",
    blocks: [
      { id: "text", icon: Type, label: "Text Block", desc: "Rich text content" },
      { id: "heading", icon: Type, label: "Heading", desc: "Section heading with optional subtitle" },
      { id: "image", icon: Image, label: "Image", desc: "Single image with optional caption" },
      { id: "gallery", icon: Image, label: "Image Gallery", desc: "Grid or carousel of images" },
      { id: "video", icon: Video, label: "Video", desc: "Embedded video player" },
    ],
  },
  {
    category: "Components",
    blocks: [
      { id: "testimonials", icon: Quote, label: "Testimonials", desc: "Customer reviews carousel or grid" },
      { id: "features", icon: Star, label: "Features", desc: "Feature grid with icons" },
      { id: "pricing", icon: Award, label: "Pricing Table", desc: "Pricing plans comparison" },
      { id: "faq", icon: List, label: "FAQ Accordion", desc: "Expandable Q&A section" },
      { id: "cta", icon: Phone, label: "Call to Action", desc: "Action block with button" },
      { id: "map", icon: Map, label: "Map", desc: "Interactive map embed" },
    ],
  },
  {
    category: "AI-Powered",
    blocks: [
      { id: "ai-text", icon: Sparkles, label: "AI Text Block", desc: "Auto-generated content" },
      { id: "ai-gallery", icon: Sparkles, label: "AI Gallery", desc: "AI-curated image collection" },
    ],
  },
];

export const BlockLibrary = ({ cms, updateSection, setHasUnsavedChanges }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [activeBlocks, setActiveBlocks] = useState([]);

  const filteredLibrary = BLOCK_LIBRARY.map(category => ({
    ...category,
    blocks: category.blocks.filter(block => 
      block.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      block.desc.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(category => 
    category.blocks.length > 0 && 
    (!selectedCategory || category.category === selectedCategory)
  );

  const addBlock = (block) => {
    setActiveBlocks(prev => [...prev, { ...block, instanceId: Date.now() }]);
    toast.success(`Added "${block.label}" block`);
    setHasUnsavedChanges(true);
  };

  const removeBlock = (instanceId) => {
    setActiveBlocks(prev => prev.filter(b => b.instanceId !== instanceId));
    setHasUnsavedChanges(true);
  };

  const duplicateBlock = (block) => {
    const index = activeBlocks.findIndex(b => b.instanceId === block.instanceId);
    const newBlock = { ...block, instanceId: Date.now() };
    setActiveBlocks(prev => [
      ...prev.slice(0, index + 1),
      newBlock,
      ...prev.slice(index + 1)
    ]);
    toast.success("Block duplicated");
    setHasUnsavedChanges(true);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Block Library */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-[#F5F5F0] mb-1">Block Library</h2>
          <p className="text-sm text-[#71717A]">Drag blocks to build your pages</p>
        </div>

        {/* Search */}
        <Input
          placeholder="Search blocks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-[#0a0a0b] border-white/10 text-[#F5F5F0]"
        />

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedCategory(null)}
            className={`${!selectedCategory ? "bg-[#D4AF37]/10 text-[#D4AF37]" : "text-[#A1A1AA]"}`}
          >
            All
          </Button>
          {BLOCK_LIBRARY.map(cat => (
            <Button
              key={cat.category}
              variant="ghost"
              size="sm"
              onClick={() => setSelectedCategory(cat.category)}
              className={`${selectedCategory === cat.category ? "bg-[#D4AF37]/10 text-[#D4AF37]" : "text-[#A1A1AA]"}`}
            >
              {cat.category}
            </Button>
          ))}
        </div>

        {/* Blocks */}
        <div className="space-y-6">
          {filteredLibrary.map(category => (
            <div key={category.category}>
              <p className="text-xs uppercase tracking-widest text-[#71717A] mb-3">{category.category}</p>
              <div className="grid grid-cols-2 gap-2">
                {category.blocks.map(block => (
                  <button
                    key={block.id}
                    onClick={() => addBlock(block)}
                    className="group p-3 bg-[#0F0F10] border border-white/10 rounded-lg hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/5 transition-all text-left"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <block.icon className="w-4 h-4 text-[#D4AF37]" />
                      <span className="text-sm font-medium text-[#F5F5F0]">{block.label}</span>
                    </div>
                    <p className="text-xs text-[#71717A] line-clamp-1">{block.desc}</p>
                    <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Plus className="w-4 h-4 text-[#D4AF37]" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Blocks / Canvas */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-[#F5F5F0] mb-1">Page Canvas</h2>
          <p className="text-sm text-[#71717A]">Arrange and configure blocks</p>
        </div>

        {activeBlocks.length === 0 ? (
          <div className="h-96 border-2 border-dashed border-white/10 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Layout className="w-12 h-12 text-[#71717A] mx-auto mb-3" />
              <p className="text-[#A1A1AA]">Add blocks from the library</p>
              <p className="text-sm text-[#71717A]">Click on a block to add it here</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2 min-h-[400px] p-4 border border-white/10 rounded-lg bg-[#0a0a0b]">
            {activeBlocks.map((block, index) => (
              <div
                key={block.instanceId}
                className="flex items-center gap-3 p-3 bg-[#0F0F10] border border-white/10 rounded group hover:border-[#D4AF37]/30"
              >
                <GripVertical className="w-4 h-4 text-[#71717A] cursor-grab" />
                <block.icon className="w-4 h-4 text-[#D4AF37]" />
                <span className="flex-1 text-sm text-[#F5F5F0]">{block.label}</span>
                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => duplicateBlock(block)}
                    className="h-8 w-8 p-0 text-[#A1A1AA] hover:text-[#F5F5F0]"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-[#A1A1AA] hover:text-[#F5F5F0]"
                  >
                    <Settings className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeBlock(block.instanceId)}
                    className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeBlocks.length > 0 && (
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setActiveBlocks([])}
              className="border-white/10 text-[#A1A1AA]"
            >
              Clear All
            </Button>
            <Button className="bg-[#D4AF37] text-[#0F0F10] hover:bg-[#E5C158]">
              Save Layout
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
