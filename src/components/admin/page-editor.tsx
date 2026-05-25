import { useState, useCallback } from "react";
import { 
  Save, Plus, Trash2, GripVertical, ChevronDown, ChevronRight,
  Type, Image, Layout, List, Quote, Star, Map, Phone, Award,
  Edit2, Eye, EyeOff, Copy, Move, Wand2, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const API = process.env.REACT_APP_BACKEND_URL + "/api";

// Block type definitions
const BLOCK_TYPES = {
  hero: { icon: Layout, label: "Hero Section", color: "#D4AF37" },
  text: { icon: Type, label: "Text Block", color: "#3B82F6" },
  image: { icon: Image, label: "Image", color: "#10B981" },
  gallery: { icon: Layout, label: "Image Gallery", color: "#8B5CF6" },
  testimonials: { icon: Quote, label: "Testimonials", color: "#F59E0B" },
  features: { icon: Star, label: "Features Grid", color: "#EC4899" },
  cta: { icon: Phone, label: "Call to Action", color: "#06B6D4" },
  pricing: { icon: Award, label: "Pricing", color: "#6366F1" },
  map: { icon: Map, label: "Map", color: "#14B8A6" },
  faq: { icon: List, label: "FAQ", color: "#F97316" },
};

// Page structure definitions
const PAGE_STRUCTURES = {
  landing: {
    sections: ["hero", "about", "features", "testimonials", "cta"],
    title: "Landing Page",
  },
  properties: {
    sections: ["header", "filters", "listings"],
    title: "Properties Page",
  },
  propertyOwners: {
    sections: ["hero", "whyChooseUs", "services", "pricing", "faqs", "cta"],
    title: "For Property Owners",
  },
  about: {
    sections: ["hero", "story", "team", "values"],
    title: "About Page",
  },
  contact: {
    sections: ["hero", "form", "info", "map"],
    title: "Contact Page",
  },
};

export const PageEditor = ({ pageId, cms, updateSection, setHasUnsavedChanges, previewMode }) => {
  const [expandedSection, setExpandedSection] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [localCms, setLocalCms] = useState(cms);
  const [isSaving, setIsSaving] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);

  const pageStructure = PAGE_STRUCTURES[pageId] || { sections: [], title: pageId };

  // Get the relevant CMS section for this page
  const getPageData = () => {
    switch (pageId) {
      case "landing":
        return { hero: localCms.hero, about: localCms.about, features: localCms.features, testimonials: localCms.testimonials };
      case "propertyOwners":
        return localCms.propertyOwners || {};
      case "contact":
        return localCms.contact || {};
      default:
        return localCms[pageId] || {};
    }
  };

  const handleFieldChange = (section, field, value) => {
    setLocalCms(prev => {
      const newCms = { ...prev };
      if (pageId === "landing" && ["hero", "about", "features", "testimonials"].includes(section)) {
        if (!newCms[section]) newCms[section] = {};
        if (field.includes(".")) {
          const [parent, child] = field.split(".");
          if (!newCms[section][parent]) newCms[section][parent] = {};
          newCms[section][parent][child] = value;
        } else {
          newCms[section][field] = value;
        }
      } else if (pageId === "propertyOwners") {
        if (!newCms.propertyOwners) newCms.propertyOwners = {};
        if (!newCms.propertyOwners[section]) newCms.propertyOwners[section] = {};
        newCms.propertyOwners[section][field] = value;
      } else {
        if (!newCms[pageId]) newCms[pageId] = {};
        if (!newCms[pageId][section]) newCms[pageId][section] = {};
        newCms[pageId][section][field] = value;
      }
      return newCms;
    });
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save the appropriate section based on page
      if (pageId === "landing") {
        await updateSection("hero", localCms.hero);
        await updateSection("about", localCms.about);
        await updateSection("features", localCms.features);
        await updateSection("testimonials", localCms.testimonials);
      } else if (pageId === "propertyOwners") {
        await updateSection("propertyOwners", localCms.propertyOwners);
      } else {
        await updateSection(pageId, localCms[pageId]);
      }
      setHasUnsavedChanges(false);
      toast.success("Changes saved successfully");
    } catch (error) {
      toast.error("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const generateAIContent = async (section, field, prompt) => {
    setAiGenerating(true);
    try {
      const response = await fetch(`${API}/ai/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, section, field, context: pageId }),
      });
      const data = await response.json();
      if (data.content) {
        handleFieldChange(section, field, data.content);
        toast.success("AI content generated!");
      }
    } catch (error) {
      toast.error("AI generation failed. Please try again.");
    } finally {
      setAiGenerating(false);
    }
  };

  // Render editable field
  const EditableField = ({ section, field, value, type = "text", label, placeholder }) => {
    const isEditing = editingField === `${section}.${field}`;
    const fieldValue = value || "";

    if (previewMode) {
      return (
        <div className="py-2">
          <p className="text-xs text-[#71717A] mb-1">{label}</p>
          <p className="text-[#F5F5F0]">{fieldValue || <span className="text-[#71717A] italic">Empty</span>}</p>
        </div>
      );
    }

    return (
      <div className="group relative">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs text-[#71717A]">{label}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => generateAIContent(section, field, `Generate ${label} for ${pageStructure.title}`)}
            className="opacity-0 group-hover:opacity-100 h-6 px-2 text-[#D4AF37] hover:bg-[#D4AF37]/10"
            disabled={aiGenerating}
          >
            <Wand2 className="w-3 h-3 mr-1" />
            AI
          </Button>
        </div>
        {type === "textarea" ? (
          <Textarea
            value={fieldValue}
            onChange={(e) => handleFieldChange(section, field, e.target.value)}
            placeholder={placeholder}
            className="bg-[#0a0a0b] border-white/10 text-[#F5F5F0] min-h-[100px] resize-y"
          />
        ) : type === "image" ? (
          <div className="relative">
            <Input
              value={fieldValue}
              onChange={(e) => handleFieldChange(section, field, e.target.value)}
              placeholder={placeholder || "Image URL"}
              className="bg-[#0a0a0b] border-white/10 text-[#F5F5F0] pr-20"
            />
            {fieldValue && (
              <img 
                src={fieldValue} 
                alt="Preview" 
                className="mt-2 h-20 w-auto object-cover rounded border border-white/10"
              />
            )}
          </div>
        ) : (
          <Input
            value={fieldValue}
            onChange={(e) => handleFieldChange(section, field, e.target.value)}
            placeholder={placeholder}
            className="bg-[#0a0a0b] border-white/10 text-[#F5F5F0]"
          />
        )}
      </div>
    );
  };

  // Render section editor based on type
  const renderSectionEditor = (sectionId) => {
    const pageData = getPageData();
    
    switch (sectionId) {
      case "hero":
        const heroData = pageId === "landing" ? localCms.hero : pageData.hero;
        return (
          <div className="space-y-4">
            <EditableField
              section="hero"
              field="headline"
              value={heroData?.headline}
              label="Headline"
              placeholder="Your main headline..."
            />
            <EditableField
              section="hero"
              field="subheadline"
              value={heroData?.subheadline}
              type="textarea"
              label="Subheadline"
              placeholder="Supporting text..."
            />
            <EditableField
              section="hero"
              field="backgroundImage"
              value={heroData?.backgroundImage}
              type="image"
              label="Background Image"
            />
            <div className="grid grid-cols-2 gap-4">
              <EditableField
                section="hero"
                field="ctaPrimary.text"
                value={heroData?.ctaPrimary?.text}
                label="Primary CTA Text"
              />
              <EditableField
                section="hero"
                field="ctaSecondary.text"
                value={heroData?.ctaSecondary?.text}
                label="Secondary CTA Text"
              />
            </div>
          </div>
        );

      case "about":
        const aboutData = localCms.about;
        return (
          <div className="space-y-4">
            <EditableField
              section="about"
              field="subtitle"
              value={aboutData?.subtitle}
              label="Subtitle"
            />
            <EditableField
              section="about"
              field="title"
              value={aboutData?.title}
              label="Title"
            />
            <div className="space-y-2">
              <p className="text-xs text-[#71717A]">Paragraphs</p>
              {aboutData?.paragraphs?.map((p, i) => (
                <Textarea
                  key={i}
                  value={p}
                  onChange={(e) => {
                    const newParagraphs = [...(aboutData?.paragraphs || [])];
                    newParagraphs[i] = e.target.value;
                    handleFieldChange("about", "paragraphs", newParagraphs);
                  }}
                  className="bg-[#0a0a0b] border-white/10 text-[#F5F5F0] min-h-[80px]"
                />
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newParagraphs = [...(aboutData?.paragraphs || []), ""];
                  handleFieldChange("about", "paragraphs", newParagraphs);
                }}
                className="border-white/10 text-[#A1A1AA]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Paragraph
              </Button>
            </div>
            <EditableField
              section="about"
              field="image"
              value={aboutData?.image}
              type="image"
              label="Image"
            />
          </div>
        );

      case "features":
        const featuresData = localCms.features || [];
        return (
          <div className="space-y-4">
            {featuresData.map((feature, i) => (
              <div key={i} className="p-4 bg-[#0a0a0b] border border-white/10 rounded space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#D4AF37]">Feature {i + 1}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newFeatures = featuresData.filter((_, idx) => idx !== i);
                      setLocalCms(prev => ({ ...prev, features: newFeatures }));
                      setHasUnsavedChanges(true);
                    }}
                    className="text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <Input
                  value={feature.title || ""}
                  onChange={(e) => {
                    const newFeatures = [...featuresData];
                    newFeatures[i] = { ...newFeatures[i], title: e.target.value };
                    setLocalCms(prev => ({ ...prev, features: newFeatures }));
                    setHasUnsavedChanges(true);
                  }}
                  placeholder="Feature title"
                  className="bg-[#161618] border-white/10 text-[#F5F5F0]"
                />
                <Textarea
                  value={feature.description || ""}
                  onChange={(e) => {
                    const newFeatures = [...featuresData];
                    newFeatures[i] = { ...newFeatures[i], description: e.target.value };
                    setLocalCms(prev => ({ ...prev, features: newFeatures }));
                    setHasUnsavedChanges(true);
                  }}
                  placeholder="Feature description"
                  className="bg-[#161618] border-white/10 text-[#F5F5F0]"
                />
              </div>
            ))}
            <Button
              variant="outline"
              onClick={() => {
                const newFeatures = [...featuresData, { icon: "Star", title: "", description: "" }];
                setLocalCms(prev => ({ ...prev, features: newFeatures }));
                setHasUnsavedChanges(true);
              }}
              className="w-full border-dashed border-white/10 text-[#A1A1AA]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Feature
            </Button>
          </div>
        );

      case "testimonials":
        const testimonialsData = localCms.testimonials || [];
        return (
          <div className="space-y-4">
            {testimonialsData.slice(0, 5).map((testimonial, i) => (
              <div key={i} className="p-4 bg-[#0a0a0b] border border-white/10 rounded space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#D4AF37]">Testimonial {i + 1}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newTestimonials = testimonialsData.filter((_, idx) => idx !== i);
                      setLocalCms(prev => ({ ...prev, testimonials: newTestimonials }));
                      setHasUnsavedChanges(true);
                    }}
                    className="text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={testimonial.name || ""}
                    onChange={(e) => {
                      const newTestimonials = [...testimonialsData];
                      newTestimonials[i] = { ...newTestimonials[i], name: e.target.value };
                      setLocalCms(prev => ({ ...prev, testimonials: newTestimonials }));
                      setHasUnsavedChanges(true);
                    }}
                    placeholder="Name"
                    className="bg-[#161618] border-white/10 text-[#F5F5F0]"
                  />
                  <Input
                    value={testimonial.date || ""}
                    onChange={(e) => {
                      const newTestimonials = [...testimonialsData];
                      newTestimonials[i] = { ...newTestimonials[i], date: e.target.value };
                      setLocalCms(prev => ({ ...prev, testimonials: newTestimonials }));
                      setHasUnsavedChanges(true);
                    }}
                    placeholder="Date"
                    className="bg-[#161618] border-white/10 text-[#F5F5F0]"
                  />
                </div>
                <Textarea
                  value={testimonial.text || ""}
                  onChange={(e) => {
                    const newTestimonials = [...testimonialsData];
                    newTestimonials[i] = { ...newTestimonials[i], text: e.target.value };
                    setLocalCms(prev => ({ ...prev, testimonials: newTestimonials }));
                    setHasUnsavedChanges(true);
                  }}
                  placeholder="Testimonial text"
                  className="bg-[#161618] border-white/10 text-[#F5F5F0]"
                />
              </div>
            ))}
            {testimonialsData.length > 5 && (
              <p className="text-sm text-[#71717A]">+ {testimonialsData.length - 5} more testimonials</p>
            )}
            <Button
              variant="outline"
              onClick={() => {
                const newTestimonials = [...testimonialsData, { name: "", date: "", rating: 5, text: "" }];
                setLocalCms(prev => ({ ...prev, testimonials: newTestimonials }));
                setHasUnsavedChanges(true);
              }}
              className="w-full border-dashed border-white/10 text-[#A1A1AA]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Testimonial
            </Button>
          </div>
        );

      case "whyChooseUs":
        const whyData = pageData?.whyChooseUs;
        return (
          <div className="space-y-4">
            <EditableField
              section="whyChooseUs"
              field="title"
              value={whyData?.title}
              label="Section Title"
            />
            <div className="space-y-3">
              {whyData?.items?.map((item, i) => (
                <div key={i} className="p-4 bg-[#0a0a0b] border border-white/10 rounded space-y-2">
                  <Input
                    value={item.title || ""}
                    onChange={(e) => {
                      const newItems = [...(whyData?.items || [])];
                      newItems[i] = { ...newItems[i], title: e.target.value };
                      handleFieldChange("whyChooseUs", "items", newItems);
                    }}
                    placeholder="Item title"
                    className="bg-[#161618] border-white/10 text-[#F5F5F0]"
                  />
                  <Textarea
                    value={item.description || ""}
                    onChange={(e) => {
                      const newItems = [...(whyData?.items || [])];
                      newItems[i] = { ...newItems[i], description: e.target.value };
                      handleFieldChange("whyChooseUs", "items", newItems);
                    }}
                    placeholder="Description"
                    className="bg-[#161618] border-white/10 text-[#F5F5F0]"
                  />
                </div>
              ))}
            </div>
          </div>
        );

      case "pricing":
        return (
          <div className="space-y-4">
            <p className="text-sm text-[#A1A1AA]">
              Pricing plans are configured in the CMS context. Edit the pricing section in the main CMS data.
            </p>
            <EditableField
              section="pricing"
              field="headline"
              value={localCms.pricing?.headline}
              label="Headline"
            />
            <EditableField
              section="pricing"
              field="description"
              value={localCms.pricing?.description}
              type="textarea"
              label="Description"
            />
          </div>
        );

      default:
        return (
          <div className="text-center py-8 text-[#71717A]">
            <p>Section editor for "{sectionId}" coming soon</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F5F5F0]">{pageStructure.title}</h1>
          <p className="text-sm text-[#71717A]">Edit page content and structure</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-[#D4AF37] text-[#0F0F10] hover:bg-[#E5C158]"
        >
          {isSaving ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save Changes
        </Button>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {pageStructure.sections.map((sectionId) => {
          const isExpanded = expandedSection === sectionId;
          const blockType = BLOCK_TYPES[sectionId] || { icon: Layout, label: sectionId, color: "#71717A" };
          
          return (
            <div
              key={sectionId}
              className="border border-white/10 rounded-lg overflow-hidden bg-[#0F0F10]"
            >
              <button
                onClick={() => setExpandedSection(isExpanded ? null : sectionId)}
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded flex items-center justify-center"
                    style={{ backgroundColor: `${blockType.color}20` }}
                  >
                    <blockType.icon className="w-4 h-4" style={{ color: blockType.color }} />
                  </div>
                  <span className="font-medium text-[#F5F5F0] capitalize">{blockType.label}</span>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-[#71717A]" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-[#71717A]" />
                )}
              </button>
              
              {isExpanded && (
                <div className="p-4 border-t border-white/10 bg-[#161618]">
                  {renderSectionEditor(sectionId)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
