"use client";

import React, {useCallback, useEffect, useRef, useState} from "react";
import {toast} from "sonner";
import {
  ArrowLeft,
  BarChart3,
  Building2,
  CalendarCheck,
  Check,
  Clock,
  Columns,
  CreditCard,
  DollarSign,
  Footprints,
  GalleryHorizontal,
  Grid3X3,
  HelpCircle,
  Image,
  Layout,
  LayoutGrid,
  Loader2,
  Mail,
  MapPin,
  Maximize,
  Megaphone,
  Menu,
  Phone,
  Plus,
  Search,
  SearchIcon,
  Settings,
  Sparkles,
  Star,
  Type,
  Users,
  Video,
  Wand2,
  X,
} from "lucide-react";
import {Dialog, DialogContent, DialogDescription, DialogTitle,} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Textarea} from "@/components/ui/textarea";
import {Badge} from "@/components/ui/badge";

// ============================================================
// TYPES & CONSTANTS
// ============================================================
interface BlockBuilderProps {
  open: boolean;
  onClose: () => void;
  onAddBlock: (blockType: string, props: Record<string, unknown>) => void;
}

interface BlockDefinition {
  type: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
}

type ViewMode = "grid" | "detail";

const BLOCK_DEFINITIONS: BlockDefinition[] = [
  // Hero
  {
    type: "HeroSection",
    label: "Hero Section",
    description: "Full-width hero with background image, title, subtitle, and CTA button",
    icon: Layout,
    category: "Hero",
  },
  // Content
  {
    type: "AboutSection",
    label: "About Section",
    description: "Company story with image and detailed description",
    icon: Users,
    category: "Content",
  },
  {
    type: "WhyChooseUs",
    label: "Why Choose Us",
    description: "Feature cards highlighting your key advantages and differentiators",
    icon: Settings,
    category: "Content",
  },
  {
    type: "ServicesSection",
    label: "Services Section",
    description: "List of included services and optional extras with pricing",
    icon: Star,
    category: "Content",
  },
  {
    type: "StatsSection",
    label: "Stats Section",
    description: "Key metrics and statistics with animated counters",
    icon: BarChart3,
    category: "Content",
  },
  {
    type: "TextBlock",
    label: "Text Block",
    description: "Flexible text content block for custom content sections",
    icon: Type,
    category: "Content",
  },
  {
    type: "FeatureGrid",
    label: "Feature Grid",
    description: "Grid of feature cards with icons, titles, and descriptions",
    icon: Grid3X3,
    category: "Content",
  },
  {
    type: "Timeline",
    label: "Timeline",
    description: "Company history or guest journey timeline with dates",
    icon: Clock,
    category: "Content",
  },
  {
    type: "TeamSection",
    label: "Team Section",
    description: "Team member cards with photos, names, roles, and bios",
    icon: Users,
    category: "Content",
  },
  {
    type: "MaltaMapSection",
    label: "Malta Map",
    description: "Animated SVG map of Malta and Gozo islands",
    icon: MapPin,
    category: "Content",
  },
  {
    type: "SocialProofStrip",
    label: "Social Proof Strip",
    description: "Horizontal strip of key metrics and social proof",
    icon: BarChart3,
    category: "Content",
  },
  // Properties
  {
    type: "PropertyShowcase",
    label: "Property Showcase",
    description: "Image gallery grid showcasing your property portfolio",
    icon: Image,
    category: "Properties",
  },
  {
    type: "ImageGallery",
    label: "Image Gallery",
    description: "Image gallery for property photos or destination photos",
    icon: GalleryHorizontal,
    category: "Properties",
  },
  {
    type: "ImageWithText",
    label: "Image With Text",
    description: "Image and text side-by-side layout with optional badge",
    icon: LayoutGrid,
    category: "Properties",
  },
  // Booking
  {
    type: "BookingSection",
    label: "Booking Section",
    description: "Booking form with property selection, dates, and guest info",
    icon: CalendarCheck,
    category: "Booking",
  },
  {
    type: "GuestyPropertySearch",
    label: "Guesty · Property Search",
    description: "Property search interface with location, dates, guests",
    icon: SearchIcon,
    category: "Booking",
  },
  {
    type: "GuestyPropertyGrid",
    label: "Guesty · Property Grid",
    description: "Property listing grid with filters and pagination",
    icon: Grid3X3,
    category: "Booking",
  },
  {
    type: "GuestyPropertyDetail",
    label: "Guesty · Property Detail",
    description: "Detailed property view with amenities and gallery",
    icon: Building2,
    category: "Booking",
  },
  {
    type: "GuestyBookingWidget",
    label: "Guesty · Booking Widget",
    description: "Direct booking interface with date selection and pricing",
    icon: CreditCard,
    category: "Booking",
  },
  {
    type: "GuestyBookingConfirmation",
    label: "Guesty · Booking Confirmation",
    description: "Booking success confirmation with reservation details",
    icon: Check,
    category: "Booking",
  },
  {
    type: "GuestyBookingDashboard",
    label: "Guesty · Booking Dashboard",
    description: "Booking management overview with status tracking",
    icon: Layout,
    category: "Booking",
  },
  // Pricing
  {
    type: "PricingTable",
    label: "Pricing Table",
    description: "Pricing plans with features comparison and highlighted option",
    icon: DollarSign,
    category: "Pricing",
  },
  {
    type: "ComparisonSection",
    label: "Comparison Section",
    description: "Multi-column comparison table for plan comparison",
    icon: Columns,
    category: "Pricing",
  },
  // Testimonials
  {
    type: "TestimonialSection",
    label: "Testimonials",
    description: "Customer reviews and testimonials with star ratings",
    icon: Megaphone,
    category: "Testimonials",
  },
  // FAQ
  {
    type: "FaqSection",
    label: "FAQ Section",
    description: "Collapsible frequently asked questions accordion",
    icon: HelpCircle,
    category: "FAQ",
  },
  // Contact
  {
    type: "ContactSection",
    label: "Contact Section",
    description: "Contact form with company info and map display",
    icon: Phone,
    category: "Contact",
  },
  {
    type: "MapSection",
    label: "Map Section",
    description: "Embedded Google Map with location coordinates",
    icon: MapPin,
    category: "Contact",
  },
  // Navigation
  {
    type: "LogoBar",
    label: "Logo Bar",
    description: "Scrolling logo carousel for partners and affiliations",
    icon: Building2,
    category: "Navigation",
  },
  {
    type: "CtaBanner",
    label: "CTA Banner",
    description: "Call-to-action banner with headline and button",
    icon: Megaphone,
    category: "Navigation",
  },
  {
    type: "FooterSection",
    label: "Footer Section",
    description: "Site footer with navigation links and contact details",
    icon: Footprints,
    category: "Navigation",
  },
  // Layout
  {
    type: "Divider",
    label: "Divider",
    description: "Decorative section divider with optional title",
    icon: Menu,
    category: "Layout",
  },
  {
    type: "Spacer",
    label: "Spacer",
    description: "Vertical spacing block for layout control",
    icon: Maximize,
    category: "Layout",
  },
  // Media
  {
    type: "VideoSection",
    label: "Video Section",
    description: "Embedded video section (YouTube/Vimeo)",
    icon: Video,
    category: "Media",
  },
  // Marketing
  {
    type: "NewsletterSection",
    label: "Newsletter Section",
    description: "Email subscription section with signup form",
    icon: Mail,
    category: "Marketing",
  },
  // Settings
  {
    type: "ThemeSettings",
    label: "Theme Settings",
    description: "Theme customization for accent color and background",
    icon: Settings,
    category: "Settings",
  },
];

const CATEGORIES = [
  "All",
  "Hero",
  "Content",
  "Properties",
  "Booking",
  "Pricing",
  "Testimonials",
  "FAQ",
  "Contact",
  "Navigation",
  "Layout",
  "Media",
  "Marketing",
  "Settings",
];

// ============================================================
// COMPONENT
// ============================================================
export default function BlockBuilder({
  open,
  onClose,
  onAddBlock,
}: BlockBuilderProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedBlock, setSelectedBlock] = useState<BlockDefinition | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const handleClose = useCallback(() => {
    abortRef.current?.abort();
    reset();
    onClose();
  }, [onClose]);

  const reset = useCallback(() => {
    setViewMode("grid");
    setSelectedBlock(null);
    setSearchQuery("");
    setActiveCategory("All");
    setAiPrompt("");
    setAiLoading(false);
  }, []);

  const filteredBlocks = React.useMemo(() => {
    return BLOCK_DEFINITIONS.filter((block) => {
      const matchesSearch =
        !searchQuery ||
        block.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        block.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        block.type.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        activeCategory === "All" || block.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  const handleSelectBlock = useCallback((block: BlockDefinition) => {
    setSelectedBlock(block);
    setViewMode("detail");
    setAiPrompt("");
  }, []);

  const handleBack = useCallback(() => {
    setSelectedBlock(null);
    setViewMode("grid");
    setAiPrompt("");
    setAiLoading(false);
  }, []);

  const handleAddDefault = useCallback(() => {
    if (!selectedBlock) return;
    onAddBlock(selectedBlock.type, {});
    toast.success(`${selectedBlock.label} added`);
    handleClose();
  }, [selectedBlock, onAddBlock, handleClose]);

  const handleGenerateWithAI = useCallback(async () => {
    if (!selectedBlock || !aiPrompt.trim()) {
      toast.error("Please enter a description for AI generation");
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setAiLoading(true);

    try {
      const res = await fetch("/api/ai/edit-block", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blockType: selectedBlock.type,
          currentProps: {},
          instruction: aiPrompt,
          mode: "create",
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Request failed with status ${res.status}`
        );
      }

      const result = await res.json();

      if (result.error) {
        throw new Error(result.error);
      }

      const props = result.props as Record<string, unknown>;
      onAddBlock(selectedBlock.type, props);
      toast.success(`${selectedBlock.label} generated and added`);
      handleClose();
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      const message =
        err instanceof Error ? err.message : "Failed to generate block";
      setAiLoading(false);
      toast.error(message);
    }
  }, [selectedBlock, aiPrompt, onAddBlock, handleClose]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent
        showCloseButton
        className="max-h-[90vh] overflow-hidden border-cpm-border bg-cpm-bg-primary p-0 sm:max-w-3xl"
      >
        {/* ── HEADER ── */}
        <div className="border-b border-cpm-border px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cpm-accent/10 ring-1 ring-cpm-accent/20">
              <Plus className="h-4.5 w-4.5 text-cpm-accent" />
            </div>
            <div>
              <DialogTitle className="text-sm font-semibold text-cpm-text-primary">
                {viewMode === "grid"
                  ? "Add Block"
                  : selectedBlock
                    ? selectedBlock.label
                    : "Add Block"}
              </DialogTitle>
              <DialogDescription className="text-xs text-cpm-text-secondary">
                {viewMode === "grid"
                  ? "Choose a block type to add to your page"
                  : "Configure the block before adding"}
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div className="flex-1 overflow-y-auto">
          {/* === GRID VIEW === */}
          {viewMode === "grid" && (
            <div className="px-6 py-5">
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cpm-text-tertiary" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search blocks..."
                  className="w-full rounded-xl border border-cpm-border bg-cpm-bg-secondary py-2.5 pl-10 pr-4 text-sm text-cpm-text-primary placeholder:text-cpm-text-tertiary outline-none transition-all duration-300 focus:border-cpm-accent/40 focus:shadow-[0_0_0_3px_rgba(200,169,106,0.1)]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-cpm-text-tertiary hover:text-cpm-text-secondary"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Categories */}
              <div className="mb-5 flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`shrink-0 rounded-lg px-3 py-1.5 text-[11px] font-medium transition-all duration-300 ${
                      activeCategory === cat
                        ? "bg-cpm-accent text-cpm-bg-primary"
                        : "border border-cpm-border bg-cpm-bg-secondary text-cpm-text-secondary hover:border-cpm-accent/20 hover:text-cpm-text-primary"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Block Grid */}
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {filteredBlocks.map((block) => {
                  const Icon = block.icon;
                  return (
                    <button
                      key={block.type}
                      onClick={() => handleSelectBlock(block)}
                      className="group flex flex-col items-start gap-3 rounded-xl border border-cpm-border bg-cpm-bg-secondary p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-cpm-accent/20 hover:shadow-[0_8px_24px_rgba(0,0,0,0.2)]"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cpm-accent/5 transition-all duration-300 group-hover:bg-cpm-accent/10 group-hover:shadow-[0_0_16px_rgba(200,169,106,0.08)]">
                        <Icon className="h-5 w-5 text-cpm-text-tertiary transition-colors duration-300 group-hover:text-cpm-accent" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-cpm-text-primary transition-colors duration-300 group-hover:text-cpm-accent">
                          {block.label}
                        </p>
                        <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-cpm-text-tertiary">
                          {block.description}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="border-cpm-border bg-transparent text-[9px] text-cpm-text-tertiary"
                      >
                        {block.category}
                      </Badge>
                    </button>
                  );
                })}
              </div>

              {filteredBlocks.length === 0 && (
                <div className="flex flex-col items-center py-12 text-cpm-text-tertiary">
                  <Search className="mb-3 h-8 w-8" />
                  <p className="text-sm">No blocks match your search</p>
                </div>
              )}
            </div>
          )}

          {/* === DETAIL VIEW === */}
          {viewMode === "detail" && selectedBlock && (
            <div className="px-6 py-5">
              {/* Block info header */}
              <div className="mb-5 flex items-start gap-4 rounded-xl border border-cpm-border bg-cpm-bg-secondary p-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cpm-accent/10 ring-1 ring-cpm-accent/20">
                  <selectedBlock.icon className="h-6 w-6 text-cpm-accent" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-semibold text-cpm-text-primary">
                    {selectedBlock.label}
                  </h3>
                  <p className="mt-1 text-xs text-cpm-text-secondary">
                    {selectedBlock.description}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <Badge
                      variant="outline"
                      className="border-cpm-accent/20 bg-cpm-accent/5 text-[10px] text-cpm-accent"
                    >
                      {selectedBlock.category}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="border-cpm-border text-[10px] text-cpm-text-tertiary"
                    >
                      {selectedBlock.type}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Two columns: Add default + AI generate */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Quick Add */}
                <div className="rounded-xl border border-cpm-border bg-cpm-bg-secondary p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cpm-bg-secondary ring-1 ring-cpm-border">
                      <Plus className="h-4 w-4 text-cpm-text-secondary" />
                    </div>
                    <p className="text-xs font-medium text-cpm-text-primary">
                      Quick Add
                    </p>
                  </div>
                  <p className="mb-4 text-[11px] leading-relaxed text-cpm-text-tertiary">
                    Add this block with default content. You can edit the
                    content afterwards.
                  </p>
                  <Button
                    onClick={handleAddDefault}
                    className="w-full gap-1.5 rounded-lg bg-cpm-bg-secondary text-xs font-medium text-cpm-text-primary ring-1 ring-cpm-border transition-all hover:bg-cpm-border hover:ring-cpm-accent/20"
                    variant="ghost"
                    size="sm"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add with Defaults
                  </Button>
                </div>

                {/* AI Generate */}
                <div className="rounded-xl border border-cpm-accent/20 bg-gradient-to-b from-cpm-accent/5 to-transparent p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cpm-accent/10 ring-1 ring-cpm-accent/20">
                      <Sparkles className="h-4 w-4 text-cpm-accent" />
                    </div>
                    <p className="text-xs font-medium text-cpm-accent">
                      Generate with AI
                    </p>
                  </div>
                  <Textarea
                    ref={textareaRef}
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder={`Describe what content you want in the ${selectedBlock.label}...`}
                    className="mb-3 min-h-[80px] resize-none border-cpm-border bg-cpm-bg-secondary text-xs text-cpm-text-primary placeholder:text-cpm-text-tertiary focus:border-cpm-accent/40 focus-visible:ring-cpm-accent/10 focus-visible:ring-offset-0"
                  />
                  <Button
                    onClick={handleGenerateWithAI}
                    disabled={!aiPrompt.trim() || aiLoading}
                    className="w-full gap-1.5 rounded-lg bg-cpm-accent text-xs font-semibold text-cpm-bg-primary hover:bg-cpm-accent-hover disabled:opacity-40 disabled:cursor-not-allowed"
                    size="sm"
                  >
                    {aiLoading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Wand2 className="h-3.5 w-3.5" />
                    )}
                    {aiLoading ? "Generating..." : "Generate"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── FOOTER ── */}
        <div className="border-t border-cpm-border px-6 py-3">
          <div className="flex items-center justify-between">
            {viewMode === "detail" ? (
              <button
                onClick={handleBack}
                className="flex items-center gap-1.5 text-xs text-cpm-text-secondary transition-colors hover:text-cpm-text-primary"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to blocks
              </button>
            ) : (
              <span className="text-[11px] text-cpm-text-tertiary">
                {filteredBlocks.length} block{filteredBlocks.length !== 1 && "s"}{" "}
                available
              </span>
            )}
            <button
              onClick={handleClose}
              className="text-xs text-cpm-text-secondary transition-colors hover:text-cpm-text-primary"
            >
              Close
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
