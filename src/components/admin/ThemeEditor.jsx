import { useState } from "react";
import { 
  Palette, Sun, Moon, Type, Check, RefreshCw, Save,
  PaintBucket, Contrast, Pipette
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

// Preset color palettes
const COLOR_PRESETS = [
  {
    name: "Gold & Black (Default)",
    colors: {
      gold: "#D4AF37",
      goldHover: "#E5C158",
      bgDark: "#0F0F10",
      bgCard: "#161618",
      bgAlt: "#0A0A0B",
      textPrimary: "#F5F5F0",
      textSecondary: "#A1A1AA",
      border: "#27272A",
    },
  },
  {
    name: "Sapphire & Navy",
    colors: {
      gold: "#3B82F6",
      goldHover: "#60A5FA",
      bgDark: "#0F172A",
      bgCard: "#1E293B",
      bgAlt: "#0C1222",
      textPrimary: "#F8FAFC",
      textSecondary: "#94A3B8",
      border: "#334155",
    },
  },
  {
    name: "Emerald & Forest",
    colors: {
      gold: "#10B981",
      goldHover: "#34D399",
      bgDark: "#0A1612",
      bgCard: "#122820",
      bgAlt: "#071210",
      textPrimary: "#ECFDF5",
      textSecondary: "#A7F3D0",
      border: "#1F4D3D",
    },
  },
  {
    name: "Rose & Charcoal",
    colors: {
      gold: "#F43F5E",
      goldHover: "#FB7185",
      bgDark: "#18181B",
      bgCard: "#27272A",
      bgAlt: "#09090B",
      textPrimary: "#FAFAFA",
      textSecondary: "#A1A1AA",
      border: "#3F3F46",
    },
  },
  {
    name: "Amber & Slate",
    colors: {
      gold: "#F59E0B",
      goldHover: "#FBBF24",
      bgDark: "#1C1917",
      bgCard: "#292524",
      bgAlt: "#0C0A09",
      textPrimary: "#FAFAF9",
      textSecondary: "#A8A29E",
      border: "#44403C",
    },
  },
  {
    name: "Light Mode",
    colors: {
      gold: "#D4AF37",
      goldHover: "#C4A030",
      bgDark: "#FFFFFF",
      bgCard: "#F9FAFB",
      bgAlt: "#F3F4F6",
      textPrimary: "#111827",
      textSecondary: "#6B7280",
      border: "#E5E7EB",
    },
  },
];

const FONT_OPTIONS = [
  { heading: "'Playfair Display', serif", body: "'Manrope', sans-serif", name: "Playfair + Manrope (Default)" },
  { heading: "'Cormorant Garamond', serif", body: "'Open Sans', sans-serif", name: "Cormorant + Open Sans" },
  { heading: "'Libre Baskerville', serif", body: "'Source Sans Pro', sans-serif", name: "Baskerville + Source Sans" },
  { heading: "'Montserrat', sans-serif", body: "'Lato', sans-serif", name: "Montserrat + Lato" },
  { heading: "'Cinzel', serif", body: "'Raleway', sans-serif", name: "Cinzel + Raleway" },
];

export const ThemeEditor = ({ cms, updateSection, setHasUnsavedChanges }) => {
  const [localTheme, setLocalTheme] = useState(cms.theme || {});
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("colors");

  const handleColorChange = (key, value) => {
    setLocalTheme(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [key]: value,
      },
    }));
    setHasUnsavedChanges(true);
  };

  const handleFontChange = (fonts) => {
    setLocalTheme(prev => ({
      ...prev,
      fonts: {
        heading: fonts.heading,
        body: fonts.body,
      },
    }));
    setHasUnsavedChanges(true);
  };

  const applyPreset = (preset) => {
    setLocalTheme(prev => ({
      ...prev,
      colors: { ...preset.colors },
    }));
    setHasUnsavedChanges(true);
    toast.success(`Applied "${preset.name}" palette`);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSection("theme", localTheme);
      
      // Apply CSS variables in real-time
      const root = document.documentElement;
      Object.entries(localTheme.colors || {}).forEach(([key, value]) => {
        root.style.setProperty(`--color-${key}`, value);
      });
      
      setHasUnsavedChanges(false);
      toast.success("Theme saved successfully");
    } catch (error) {
      toast.error("Failed to save theme");
    } finally {
      setIsSaving(false);
    }
  };

  const colors = localTheme.colors || {};
  const fonts = localTheme.fonts || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F5F5F0]">Theme Editor</h1>
          <p className="text-sm text-[#71717A]">Customize colors, fonts, and styling</p>
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
          Save Theme
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-2">
        {["colors", "fonts", "presets"].map((tab) => (
          <Button
            key={tab}
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab(tab)}
            className={`capitalize ${
              activeTab === tab
                ? "text-[#D4AF37] bg-[#D4AF37]/10"
                : "text-[#A1A1AA]"
            }`}
          >
            {tab === "colors" && <Palette className="w-4 h-4 mr-2" />}
            {tab === "fonts" && <Type className="w-4 h-4 mr-2" />}
            {tab === "presets" && <PaintBucket className="w-4 h-4 mr-2" />}
            {tab}
          </Button>
        ))}
      </div>

      {/* Colors Tab */}
      {activeTab === "colors" && (
        <div className="space-y-6">
          {/* Live Preview */}
          <div 
            className="p-6 rounded-lg border border-white/10"
            style={{ backgroundColor: colors.bgDark || "#0F0F10" }}
          >
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: colors.gold || "#D4AF37" }}>
              Live Preview
            </p>
            <h2 className="text-2xl font-bold mb-2" style={{ color: colors.textPrimary || "#F5F5F0" }}>
              Your Brand Headline
            </h2>
            <p className="mb-4" style={{ color: colors.textSecondary || "#A1A1AA" }}>
              This is how your secondary text will appear across the site.
            </p>
            <div className="flex gap-3">
              <button
                className="px-4 py-2 font-medium transition-colors"
                style={{ 
                  backgroundColor: colors.gold || "#D4AF37",
                  color: colors.bgDark || "#0F0F10"
                }}
              >
                Primary Button
              </button>
              <button
                className="px-4 py-2 font-medium border transition-colors"
                style={{ 
                  borderColor: colors.border || "#27272A",
                  color: colors.textPrimary || "#F5F5F0"
                }}
              >
                Secondary Button
              </button>
            </div>
          </div>

          {/* Color Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { key: "gold", label: "Brand Primary" },
              { key: "goldHover", label: "Brand Hover" },
              { key: "bgDark", label: "Background Dark" },
              { key: "bgCard", label: "Card Background" },
              { key: "bgAlt", label: "Alt Background" },
              { key: "textPrimary", label: "Text Primary" },
              { key: "textSecondary", label: "Text Secondary" },
              { key: "border", label: "Border Color" },
            ].map(({ key, label }) => (
              <div key={key} className="space-y-2">
                <p className="text-xs text-[#71717A]">{label}</p>
                <div className="flex items-center gap-2">
                  <div
                    className="w-10 h-10 rounded border border-white/20 cursor-pointer relative overflow-hidden"
                    style={{ backgroundColor: colors[key] || "#000" }}
                  >
                    <input
                      type="color"
                      value={colors[key] || "#000000"}
                      onChange={(e) => handleColorChange(key, e.target.value)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                  <Input
                    value={colors[key] || ""}
                    onChange={(e) => handleColorChange(key, e.target.value)}
                    placeholder="#000000"
                    className="bg-[#0a0a0b] border-white/10 text-[#F5F5F0] font-mono text-sm"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fonts Tab */}
      {activeTab === "fonts" && (
        <div className="space-y-6">
          <div className="grid gap-4">
            {FONT_OPTIONS.map((option, i) => (
              <button
                key={i}
                onClick={() => handleFontChange(option)}
                className={`p-4 text-left border rounded-lg transition-colors ${
                  fonts.heading === option.heading && fonts.body === option.body
                    ? "border-[#D4AF37] bg-[#D4AF37]/10"
                    : "border-white/10 hover:border-white/20 bg-[#0F0F10]"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#A1A1AA]">{option.name}</span>
                  {fonts.heading === option.heading && fonts.body === option.body && (
                    <Check className="w-4 h-4 text-[#D4AF37]" />
                  )}
                </div>
                <p 
                  className="text-xl font-bold text-[#F5F5F0] mb-1"
                  style={{ fontFamily: option.heading }}
                >
                  Heading Preview
                </p>
                <p 
                  className="text-sm text-[#A1A1AA]"
                  style={{ fontFamily: option.body }}
                >
                  Body text preview - The quick brown fox jumps over the lazy dog.
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Presets Tab */}
      {activeTab === "presets" && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {COLOR_PRESETS.map((preset, i) => (
            <button
              key={i}
              onClick={() => applyPreset(preset)}
              className="group p-4 border border-white/10 rounded-lg hover:border-white/20 transition-colors bg-[#0F0F10]"
            >
              <div className="flex gap-1 mb-3">
                {Object.entries(preset.colors).slice(0, 5).map(([key, value]) => (
                  <div
                    key={key}
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: value }}
                  />
                ))}
              </div>
              <p className="text-sm font-medium text-[#F5F5F0] text-left">{preset.name}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
