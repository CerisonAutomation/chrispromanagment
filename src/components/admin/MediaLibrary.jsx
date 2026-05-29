import { useState, useCallback } from "react";
import { 
  Image, Upload, Trash2, Search, Grid, List, RefreshCw,
  Copy, ExternalLink, Check, X, Sparkles, FolderOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const API = process.env.REACT_APP_BACKEND_URL + "/api";

// Mock media items (in production, these would come from API)
const MOCK_MEDIA = [
  { id: 1, url: "https://images.unsplash.com/photo-1771218830084-fdd272e149a1?w=800", name: "Hero Background", type: "image", size: "2.4 MB" },
  { id: 2, url: "https://primary.jwwb.nl/public/i/m/x/temp-jszjykaojetbmrgovpoe/img_7990-standard.jpg", name: "About Section", type: "image", size: "1.8 MB" },
  { id: 3, url: "https://primary.jwwb.nl/public/i/m/x/temp-jszjykaojetbmrgovpoe/pembroke-pent-20250427__mg_5998-edit-edit-high.jpg", name: "Property 1", type: "image", size: "3.1 MB" },
  { id: 4, url: "https://primary.jwwb.nl/public/i/m/x/temp-jszjykaojetbmrgovpoe/img_9620-high.jpg", name: "Property 2", type: "image", size: "2.7 MB" },
  { id: 5, url: "https://primary.jwwb.nl/public/i/m/x/temp-jszjykaojetbmrgovpoe/img_2625-high-g3dssk.jpg", name: "Property 3", type: "image", size: "2.2 MB" },
  { id: 6, url: "https://primary.jwwb.nl/public/i/m/x/temp-jszjykaojetbmrgovpoe/valletta-apartment-10-high-1r9pym.jpg", name: "Valletta Apt", type: "image", size: "1.9 MB" },
];

export const MediaLibrary = () => {
  const [media, setMedia] = useState(MOCK_MEDIA);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedItem, setSelectedItem] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const filteredMedia = media.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUpload = async (e) => {
    const files = e.target.files;
    if (!files?.length) return;

    setIsUploading(true);
    // In production, this would upload to a storage service
    setTimeout(() => {
      const newMedia = Array.from(files).map((file, i) => ({
        id: Date.now() + i,
        url: URL.createObjectURL(file),
        name: file.name,
        type: file.type.startsWith("image") ? "image" : "file",
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
      }));
      setMedia(prev => [...newMedia, ...prev]);
      setIsUploading(false);
      toast.success(`Uploaded ${files.length} file(s)`);
    }, 1500);
  };

  const generateAIImage = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch(`${API}/ai/generate-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: "Luxury Mediterranean villa in Malta with sea view at sunset, professional real estate photography" 
        }),
      });
      const data = await res.json();
      
      if (data.url) {
        setMedia(prev => [{
          id: Date.now(),
          url: data.url,
          name: "AI Generated",
          type: "image",
          size: "AI",
        }, ...prev]);
        toast.success("AI image generated!");
      }
    } catch (error) {
      toast.error("Image generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyUrl = async (item) => {
    await navigator.clipboard.writeText(item.url);
    setCopiedId(item.id);
    toast.success("URL copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const deleteItem = (id) => {
    setMedia(prev => prev.filter(item => item.id !== id));
    if (selectedItem?.id === id) setSelectedItem(null);
    toast.success("Item deleted");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F5F5F0]">Media Library</h1>
          <p className="text-sm text-[#71717A]">{media.length} items</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={generateAIImage}
            disabled={isGenerating}
            className="border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10"
          >
            {isGenerating ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            Generate with AI
          </Button>
          <label className="cursor-pointer">
            <Button
              className="bg-[#D4AF37] text-[#0F0F10] hover:bg-[#E5C158]"
              disabled={isUploading}
              asChild
            >
              <span>
                {isUploading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                Upload
              </span>
            </Button>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A]" />
          <Input
            placeholder="Search media..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-[#0a0a0b] border-white/10 text-[#F5F5F0]"
          />
        </div>
        <div className="flex items-center border border-white/10 rounded">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("grid")}
            className={viewMode === "grid" ? "bg-white/10" : ""}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("list")}
            className={viewMode === "list" ? "bg-white/10" : ""}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Media Grid/List */}
        <div className="lg:col-span-2">
          {viewMode === "grid" ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filteredMedia.map(item => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`group relative aspect-square bg-[#0a0a0b] border rounded-lg overflow-hidden cursor-pointer transition-all ${
                    selectedItem?.id === item.id
                      ? "border-[#D4AF37] ring-2 ring-[#D4AF37]/20"
                      : "border-white/10 hover:border-white/20"
                  }`}
                >
                  <img
                    src={item.url}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-sm text-white truncate">{item.name}</p>
                      <p className="text-xs text-white/60">{item.size}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredMedia.map(item => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`flex items-center gap-4 p-3 bg-[#0F0F10] border rounded-lg cursor-pointer transition-all ${
                    selectedItem?.id === item.id
                      ? "border-[#D4AF37]"
                      : "border-white/10 hover:border-white/20"
                  }`}
                >
                  <img
                    src={item.url}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-[#F5F5F0]">{item.name}</p>
                    <p className="text-xs text-[#71717A]">{item.size}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); copyUrl(item); }}
                    >
                      {copiedId === item.id ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }}
                      className="text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-1">
          {selectedItem ? (
            <div className="sticky top-4 space-y-4 p-4 bg-[#0F0F10] border border-white/10 rounded-lg">
              <img
                src={selectedItem.url}
                alt={selectedItem.name}
                className="w-full aspect-video object-cover rounded"
              />
              <div>
                <p className="text-sm font-medium text-[#F5F5F0]">{selectedItem.name}</p>
                <p className="text-xs text-[#71717A]">{selectedItem.size} • {selectedItem.type}</p>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-[#71717A]">URL</p>
                <div className="flex items-center gap-2">
                  <Input
                    value={selectedItem.url}
                    readOnly
                    className="bg-[#0a0a0b] border-white/10 text-[#F5F5F0] text-xs"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyUrl(selectedItem)}
                  >
                    {copiedId === selectedItem.id ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(selectedItem.url, "_blank")}
                  className="flex-1 border-white/10"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteItem(selectedItem.id)}
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 border border-dashed border-white/10 rounded-lg">
              <div className="text-center">
                <FolderOpen className="w-12 h-12 text-[#71717A] mx-auto mb-3" />
                <p className="text-sm text-[#A1A1AA]">Select an item to preview</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
