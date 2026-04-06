"use client";

import React, {useCallback, useEffect, useRef, useState} from "react";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Copy, FileText, ImageIcon, Loader2, Search, Trash2, Upload, Video, X,} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MediaItem {
  url: string;
  name: string;
  size: number;
  type: string;
  uploadedAt?: string;
}

interface UploadProgress {
  file: File;
  progress: number;
  error?: string;
}

type FilterType = "all" | "images" | "videos" | "documents";

interface MediaLibraryProps {
  open: boolean;
  onClose: () => void;
  onSelect?: (url: string) => void;
  accept?: string; // e.g. "image/*" to limit file types
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function getMediaType(mimeType: string): FilterType {
  if (mimeType.startsWith("image/")) return "images";
  if (mimeType.startsWith("video/")) return "videos";
  return "documents";
}

function getMediaIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return <ImageIcon className="size-5" />;
  if (mimeType.startsWith("video/")) return <Video className="size-5" />;
  return <FileText className="size-5" />;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function MediaLibrary({
  open,
  onClose,
  onSelect,
  accept,
}: MediaLibraryProps) {
  // State
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);
  const isInternalDragRef = useRef(false);

  // -----------------------------------------------------------------------
  // Fetch media list
  // -----------------------------------------------------------------------
  const fetchMedia = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/media");
      if (res.ok) {
        const data = await res.json();
        setItems(Array.isArray(data) ? data : data.files ?? []);
      }
    } catch {
      // Silently fail — user sees empty state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      fetchMedia();
      setSearch("");
      setFilter("all");
      setUploads([]);
    }
  }, [open, fetchMedia]);

  // -----------------------------------------------------------------------
  // Upload files
  // -----------------------------------------------------------------------
  const uploadFiles = useCallback(
    async (files: File[]) => {
      if (!files.length) return;

      // Seed progress entries
      const pending: UploadProgress[] = files.map((f) => ({
        file: f,
        progress: 0,
      }));
      setUploads((prev) => [...prev, ...pending]);

      // Upload one-by-one so we can track individual progress
      for (const file of files) {
        try {
          const formData = new FormData();
          formData.append("file", file);

          const xhr = new XMLHttpRequest();
          await new Promise<void>((resolve, reject) => {
            xhr.upload.addEventListener("progress", (e) => {
              if (e.lengthComputable) {
                const pct = Math.round((e.loaded / e.total) * 100);
                setUploads((prev) =>
                  prev.map((u) =>
                    u.file.name === file.name ? { ...u, progress: pct } : u
                  )
                );
              }
            });

            xhr.addEventListener("load", () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                resolve();
              } else {
                reject(new Error(xhr.statusText || "Upload failed"));
              }
            });

            xhr.addEventListener("error", () =>
              reject(new Error("Network error"))
            );
            xhr.open("POST", "/api/upload");
            xhr.send(formData);
          });

          // Remove completed upload entry
          setUploads((prev) =>
            prev.filter((u) => u.file.name !== file.name)
          );
        } catch (err) {
          const msg =
            err instanceof Error ? err.message : "Upload failed";
          setUploads((prev) =>
            prev.map((u) =>
              u.file.name === file.name
                ? { ...u, progress: 0, error: msg }
                : u
            )
          );
          // Auto-clear error after 4 s
          setTimeout(() => {
            setUploads((prev) =>
              prev.filter((u) => u.file.name !== file.name)
            );
          }, 4000);
        }
      }

      // Refresh list after all uploads
      fetchMedia();
    },
    [fetchMedia]
  );

  // -----------------------------------------------------------------------
  // Delete media
  // -----------------------------------------------------------------------
  const deleteItem = useCallback(
    async (url: string) => {
      setDeleting(url);
      try {
        await fetch(`/api/media?url=${encodeURIComponent(url)}`, {
          method: "DELETE",
        });
        setItems((prev) => prev.filter((i) => i.url !== url));
      } catch {
        // Silently fail
      } finally {
        setDeleting(null);
      }
    },
    []
  );

  // -----------------------------------------------------------------------
  // Copy URL to clipboard
  // -----------------------------------------------------------------------
  const copyUrl = useCallback((url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 1500);
    });
  }, []);

  // -----------------------------------------------------------------------
  // Drag-and-drop
  // -----------------------------------------------------------------------
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current += 1;
    // Detect internal drag (e.g. dragging items within the grid)
    if (e.dataTransfer.types.includes("application/x-internal")) {
      isInternalDragRef.current = true;
      return;
    }
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current === 0) {
      setDragOver(false);
      isInternalDragRef.current = false;
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounterRef.current = 0;
      setDragOver(false);
      if (isInternalDragRef.current) {
        isInternalDragRef.current = false;
        return;
      }
      const droppedFiles = Array.from(e.dataTransfer.files);
      if (droppedFiles.length) uploadFiles(droppedFiles);
    },
    [uploadFiles]
  );

  // -----------------------------------------------------------------------
  // File picker
  // -----------------------------------------------------------------------
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      if (files.length) uploadFiles(files);
      // Reset input so the same file can be re-selected
      e.target.value = "";
    },
    [uploadFiles]
  );

  // -----------------------------------------------------------------------
  // Filtered items
  // -----------------------------------------------------------------------
  const filteredItems = items.filter((item) => {
    // Type filter
    if (filter !== "all") {
      const itemType = getMediaType(item.type);
      if (itemType !== filter) return false;
    }
    // Search filter
    if (search) {
      const q = search.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // -----------------------------------------------------------------------
  // Filter pills
  // -----------------------------------------------------------------------
  const filterPills: { key: FilterType; label: string; icon: React.ReactNode }[] = [
    { key: "all", label: "All", icon: <ImageIcon className="size-3.5" /> },
    { key: "images", label: "Images", icon: <ImageIcon className="size-3.5" /> },
    { key: "videos", label: "Videos", icon: <Video className="size-3.5" /> },
    { key: "documents", label: "Docs", icon: <FileText className="size-3.5" /> },
  ];

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[90vh] w-full max-w-4xl flex-col gap-0 overflow-hidden rounded-2xl border-cpm-border bg-cpm-bg-primary p-0 text-white sm:max-w-4xl"
      >
        {/* ---- Header ---- */}
        <DialogHeader className="border-b border-cpm-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg font-semibold text-white">
                Media Library
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-400">
                Upload, browse and manage your media assets
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-gray-400 hover:bg-cpm-border hover:text-white"
            >
              <X className="size-5" />
            </Button>
          </div>
        </DialogHeader>

        {/* ---- Scrollable body ---- */}
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-6">
          {/* Upload drop-zone */}
          <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 transition-all cursor-pointer text-center ${
              dragOver
                ? "border-cpm-accent/60 bg-cpm-accent/5"
                : "border-cpm-border hover:border-cpm-accent/40 bg-cpm-bg-secondary/50"
            }`}
          >
            <Upload
              className={`mx-auto mb-3 size-10 ${
                dragOver ? "text-cpm-accent" : "text-gray-500"
              }`}
            />
            <p className="text-sm font-medium text-gray-300">
              {dragOver
                ? "Drop files here to upload"
                : "Drag & drop files here, or click to browse"}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Images, videos, documents — any file type supported
            </p>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              multiple
              accept={accept}
              onChange={handleFileChange}
            />
          </div>

          {/* Upload progress list */}
          {uploads.length > 0 && (
            <div className="space-y-2">
              {uploads.map((u) => (
                <div
                  key={u.file.name}
                  className="flex items-center gap-3 rounded-xl border border-cpm-border bg-cpm-bg-secondary px-4 py-3"
                >
                  <Loader2
                    className={`size-4 shrink-0 ${
                      u.error ? "text-red-400" : "animate-spin text-cpm-accent"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-gray-200">
                      {u.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {u.error ? u.error : `${u.progress}%`}
                    </p>
                  </div>
                  {!u.error && (
                    <div className="h-1.5 w-20 overflow-hidden rounded-full bg-cpm-border">
                      <div
                        className="h-full rounded-full bg-cpm-accent transition-all"
                        style={{ width: `${u.progress}%` }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Search + filter bar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-500" />
              <Input
                placeholder="Search media..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 rounded-lg border-cpm-border bg-cpm-bg-secondary pl-9 pr-3 text-sm text-white placeholder:text-gray-500 focus-visible:border-cpm-accent/50 focus-visible:ring-cpm-accent/20"
              />
            </div>

            {/* Filter pills */}
            <div className="flex gap-1">
              {filterPills.map(({ key, label, icon }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    filter === key
                      ? "bg-cpm-accent/15 text-cpm-accent ring-1 ring-cpm-accent/30"
                      : "text-gray-400 hover:bg-cpm-border hover:text-gray-200"
                  }`}
                >
                  {icon}
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Content area */}
          {loading ? (
            /* ---- Loading ---- */
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="mb-4 size-8 animate-spin text-cpm-accent" />
              <p className="text-sm text-gray-400">Loading media...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            /* ---- Empty state ---- */
            <div className="flex flex-col items-center justify-center rounded-2xl border border-cpm-border bg-cpm-bg-secondary/50 py-20">
              <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-cpm-border">
                <ImageIcon className="size-8 text-gray-500" />
              </div>
              <p className="text-sm font-medium text-gray-300">
                {search || filter !== "all"
                  ? "No media matches your search"
                  : "No media uploaded yet"}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {search || filter !== "all"
                  ? "Try adjusting your filters"
                  : "Upload your first file using the area above"}
              </p>
            </div>
          ) : (
            /* ---- Grid ---- */
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {filteredItems.map((item) => {
                const isImage = item.type.startsWith("image/");
                const isVideo = item.type.startsWith("video/");
                const isDeletingThis = deleting === item.url;
                const isCopied = copiedUrl === item.url;

                return (
                  <div
                    key={item.url}
                    className="group relative overflow-hidden rounded-xl border border-cpm-border bg-cpm-bg-secondary transition-all hover:border-cpm-accent/30"
                  >
                    {/* Thumbnail */}
                    <div
                      className="relative flex aspect-square items-center justify-center overflow-hidden bg-cpm-bg-primary cursor-pointer"
                      onClick={() => {
                        copyUrl(item.url);
                        onSelect?.(item.url);
                      }}
                      title="Click to copy URL"
                    >
                      {isImage ? (
                        <img
                          src={item.url}
                          alt={item.name}
                          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-gray-500">
                          {isVideo ? (
                            <Video className="size-10" />
                          ) : (
                            <FileText className="size-10" />
                          )}
                          <span className="text-[10px] uppercase tracking-wider">
                            {isVideo ? "Video" : "Document"}
                          </span>
                        </div>
                      )}

                      {/* Copied overlay */}
                      {isCopied && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                          <div className="flex items-center gap-1.5 rounded-lg bg-cpm-accent px-3 py-1.5 text-xs font-semibold text-black">
                            <Copy className="size-3.5" />
                            Copied!
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Info row */}
                    <div className="px-3 py-2.5">
                      <p className="truncate text-xs font-medium text-gray-200">
                        {item.name}
                      </p>
                      <div className="mt-0.5 flex items-center gap-2 text-[10px] text-gray-500">
                        <span>{formatSize(item.size)}</span>
                        <span className="h-1 w-1 rounded-full bg-gray-600" />
                        <span className="flex items-center gap-1">
                          {getMediaIcon(item.type)}
                          {item.type.split("/")[1]?.toUpperCase() ?? "FILE"}
                        </span>
                      </div>
                    </div>

                    {/* Hover actions */}
                    <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyUrl(item.url);
                        }}
                        className="flex size-8 items-center justify-center rounded-lg bg-black/60 text-gray-300 backdrop-blur-sm transition-colors hover:bg-cpm-accent hover:text-black"
                        title="Copy URL"
                      >
                        <Copy className="size-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteItem(item.url);
                        }}
                        disabled={isDeletingThis}
                        className="flex size-8 items-center justify-center rounded-lg bg-black/60 text-gray-300 backdrop-blur-sm transition-colors hover:bg-red-500 hover:text-white"
                        title="Delete"
                      >
                        {isDeletingThis ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="size-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
