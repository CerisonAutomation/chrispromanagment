import { useState, useEffect, useCallback } from "react";
import {
  Upload, Trash2, Search, Grid, List, RefreshCw,
  Copy, ExternalLink, Check, Sparkles, FolderOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface MediaItem {
  id: string;
  url: string;
  name: string;
  file_type: string | null;
  file_size: number | null;
  storage_path: string | null;
  created_at: string;
}

export const MediaLibrary = () => {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchMedia = useCallback(async () => {
    const { data, error } = await supabase
      .from("media_library")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) { toast.error("Failed to load media"); return; }
    setMedia((data as MediaItem[]) || []);
  }, []);

  useEffect(() => {
    fetchMedia().finally(() => setLoading(false));

    const channel = supabase.channel("media_library_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "media_library" }, fetchMedia)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchMedia]);

  const filteredMedia = media.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setIsUploading(true);

    try {
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop();
        const path = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        const { error: storageErr } = await supabase.storage.from("media").upload(path, file);
        if (storageErr) { toast.error(`Failed to upload ${file.name}`); continue; }

        const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(path);

        await supabase.from("media_library").insert({
          url: publicUrl,
          name: file.name.replace(/\.[^.]+$/, ""),
          file_type: file.type,
          file_size: file.size,
          storage_path: path,
        });
      }
      toast.success(`Uploaded ${files.length} file(s)`);
      await fetchMedia();
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const generateAIImage = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-generate-image", {
        body: { prompt: "Luxury Mediterranean villa in Malta with sea view at sunset, professional real estate photography" },
      });
      if (error) throw error;

      if (data?.url) {
        await supabase.from("media_library").insert({
          url: data.url,
          name: "AI Generated",
          file_type: "image/png",
          file_size: null,
          storage_path: null,
        });
        toast.success("AI image generated!");
        await fetchMedia();
      }
    } catch {
      toast.error("Image generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyUrl = async (item: MediaItem) => {
    await navigator.clipboard.writeText(item.url);
    setCopiedId(item.id);
    toast.success("URL copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const deleteItem = async (item: MediaItem) => {
    if (item.storage_path) {
      await supabase.storage.from("media").remove([item.storage_path]);
    }
    const { error } = await supabase.from("media_library").delete().eq("id", item.id);
    if (error) { toast.error("Delete failed"); return; }
    if (selectedItem?.id === item.id) setSelectedItem(null);
    setMedia(prev => prev.filter(m => m.id !== item.id));
    toast.success("Item deleted");
  };

  const formatSize = (bytes: number | null) => {
    if (!bytes) return "AI";
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 text-[#D4AF37] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
              accept="image/*,video/*"
              multiple
              onChange={handleUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

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
        <div className="lg:col-span-2">
          {filteredMedia.length === 0 ? (
            <div className="flex items-center justify-center h-48 border border-dashed border-white/10 rounded-lg">
              <p className="text-sm text-[#71717A]">No media found</p>
            </div>
          ) : viewMode === "grid" ? (
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
                  <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-sm text-white truncate">{item.name}</p>
                      <p className="text-xs text-white/60">{formatSize(item.file_size)}</p>
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
                    selectedItem?.id === item.id ? "border-[#D4AF37]" : "border-white/10 hover:border-white/20"
                  }`}
                >
                  <img src={item.url} alt={item.name} className="w-16 h-16 object-cover rounded" />
                  <div className="flex-1">
                    <p className="text-sm text-[#F5F5F0]">{item.name}</p>
                    <p className="text-xs text-[#71717A]">{formatSize(item.file_size)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); copyUrl(item); }}>
                      {copiedId === item.id ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); deleteItem(item); }}
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

        <div className="lg:col-span-1">
          {selectedItem ? (
            <div className="sticky top-4 space-y-4 p-4 bg-[#0F0F10] border border-white/10 rounded-lg">
              <img src={selectedItem.url} alt={selectedItem.name} className="w-full aspect-video object-cover rounded" />
              <div>
                <p className="text-sm font-medium text-[#F5F5F0]">{selectedItem.name}</p>
                <p className="text-xs text-[#71717A]">{formatSize(selectedItem.file_size)} • {selectedItem.file_type ?? "image"}</p>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-[#71717A]">URL</p>
                <div className="flex items-center gap-2">
                  <Input
                    value={selectedItem.url}
                    readOnly
                    className="bg-[#0a0a0b] border-white/10 text-[#F5F5F0] text-xs"
                  />
                  <Button variant="ghost" size="sm" onClick={() => copyUrl(selectedItem)}>
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
                  onClick={() => deleteItem(selectedItem)}
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
