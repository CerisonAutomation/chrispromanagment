"use client";

import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {toast} from "sonner";
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  Blocks,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Eye,
  FilePlus,
  FileText,
  Globe,
  Heart,
  Home,
  ImageIcon,
  Layers,
  Layers as LayersIcon,
  Layout,
  MessageSquare,
  Pencil,
  RefreshCw,
  Search,
  Settings,
  Star,
  Type
} from "lucide-react";

// =============================================================================
// BLOCK AUTOSYNC SYSTEM - Core Types & Interfaces
// =============================================================================

export interface BlockItem {
  type: string;
  props: Record<string, unknown>;
  id: string;
  syncStatus?: "synced" | "pending" | "conflict" | "error";
  lastModified?: number;
  modifiedBy?: string;
  version?: number;
}

export interface BlockData {
  content: BlockItem[];
  root: {
    props: Record<string, unknown>;
    title?: string;
    description?: string;
    slug?: string;
  };
  meta?: {
    createdAt: string;
    updatedAt: string;
    version: number;
    lastModifiedBy: string;
  };
}

export interface PageItem {
  id: string;
  slug: string;
  title: string;
  status: "published" | "draft" | "archived";
  updatedAt: string;
  createdAt: string;
  modifiedBy?: string;
  version?: number;
  blocksCount: number;
  hasUnsyncedChanges?: boolean;
}

export interface SyncState {
  status: "idle" | "syncing" | "synced" | "error" | "offline";
  lastSyncAt: string | null;
  pendingChanges: number;
  conflicts: string[];
}

// =============================================================================
// BLOCK AUTOSYNC HOOK
// =============================================================================

export function useBlockAutosync(
  pageId: string,
  initialData: BlockData | null
) {
  const [data, setData] = useState<BlockData | null>(initialData);
  const [syncState, setSyncState] = useState<SyncState>({
    status: "idle",
    lastSyncAt: null,
    pendingChanges: 0,
    conflicts: [],
  });
  const pendingChangesRef = useRef<Map<string, BlockItem>>(new Map());
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSyncRef = useRef<number>(Date.now());

  // Auto-sync to server with debounce
  const queueSync = useCallback(() => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    setSyncState((prev) => ({
      ...prev,
      status: "syncing",
      pendingChanges: pendingChangesRef.current.size,
    }));

    syncTimeoutRef.current = setTimeout(async () => {
      await performSync();
    }, 1500); // 1.5s debounce
  }, []);

  const performSync = async () => {
    if (pendingChangesRef.current.size === 0) return;

    try {
      const changes = Array.from(pendingChangesRef.current.values());
      
      const response = await fetch(`/api/pages/${pageId}/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          changes,
          lastSyncAt: lastSyncRef.current,
          version: data?.meta?.version || 1,
        }),
      });

      if (!response.ok) throw new Error("Sync failed");

      const result = await response.json();
      
      lastSyncRef.current = Date.now();
      pendingChangesRef.current.clear();
      
      setSyncState({
        status: "synced",
        lastSyncAt: new Date().toISOString(),
        pendingChanges: 0,
        conflicts: result.conflicts || [],
      });

      // Update data with server response
      if (result.data) {
        setData((prev) => ({
          ...prev!,
          ...result.data,
        }));
      }

      toast.success("Changes saved");
    } catch (error) {
      setSyncState((prev) => ({ ...prev, status: "error" }));
      toast.error("Failed to save changes");
    }
  };

  // Add or update block
  const upsertBlock = useCallback(
    (block: BlockItem, index?: number) => {
      setData((prev) => {
        if (!prev) return prev;

        const newBlock: BlockItem = {
          ...block,
          id: block.id || `${block.type}-${Date.now()}`,
          syncStatus: "pending",
          lastModified: Date.now(),
          version: (block.version || 0) + 1,
        };

        const newContent = [...prev.content];
        if (index !== undefined && index >= 0 && index < newContent.length) {
          newContent[index] = newBlock;
        } else {
          newContent.push(newBlock);
        }

        const newData = {
          ...prev,
          content: newContent,
          root: {
            ...prev.root,
            updatedAt: new Date().toISOString(),
          },
        };

        pendingChangesRef.current.set(newBlock.id, newBlock);
        queueSync();

        return newData;
      });
    },
    [queueSync]
  );

  // Delete block
  const deleteBlock = useCallback(
    (blockId: string) => {
      setData((prev) => {
        if (!prev) return prev;

        const newContent = prev.content.filter((b) => b.id !== blockId);
        
        pendingChangesRef.current.set(blockId, {
          id: blockId,
          type: "__DELETE__",
          props: {},
          syncStatus: "pending",
          lastModified: Date.now(),
        } as BlockItem);

        queueSync();

        return {
          ...prev,
          content: newContent,
          root: {
            ...prev.root,
            updatedAt: new Date().toISOString(),
          },
        };
      });
    },
    [queueSync]
  );

  // Move block
  const moveBlock = useCallback(
    (fromIndex: number, toIndex: number) => {
      setData((prev) => {
        if (!prev) return prev;

        const newContent = [...prev.content];
        const [moved] = newContent.splice(fromIndex, 1);
        newContent.splice(toIndex, 0, moved);

        // Mark all affected blocks as pending
        const affectedIndices = [fromIndex, toIndex].sort((a, b) => a - b);
        for (let i = affectedIndices[0]; i <= affectedIndices[1]; i++) {
          if (newContent[i]) {
            newContent[i] = {
              ...newContent[i],
              syncStatus: "pending",
              lastModified: Date.now(),
            };
            pendingChangesRef.current.set(newContent[i].id, newContent[i]);
          }
        }

        queueSync();

        return {
          ...prev,
          content: newContent,
          root: {
            ...prev.root,
            updatedAt: new Date().toISOString(),
          },
        };
      });
    },
    [queueSync]
  );

  // Reorder blocks
  const reorderBlocks = useCallback(
    (newOrder: string[]) => {
      setData((prev) => {
        if (!prev) return prev;

        const blockMap = new Map(prev.content.map((b) => [b.id, b]));
        const newContent = newOrder
          .map((id) => blockMap.get(id))
          .filter((b): b is BlockItem => !!b)
          .map((b) => ({
            ...b,
            syncStatus: "pending" as const,
            lastModified: Date.now(),
          }));

        newContent.forEach((b) => pendingChangesRef.current.set(b.id, b));
        queueSync();

        return {
          ...prev,
          content: newContent,
          root: {
            ...prev.root,
            updatedAt: new Date().toISOString(),
          },
        };
      });
    },
    [queueSync]
  );

  // Force immediate sync
  const forceSync = useCallback(async () => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }
    await performSync();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, []);

  return {
    data,
    setData,
    syncState,
    upsertBlock,
    deleteBlock,
    moveBlock,
    reorderBlocks,
    forceSync,
  };
}

// =============================================================================
// ADMIN SYNC STATUS INDICATOR
// =============================================================================

export function SyncStatusIndicator({ state }: { state: SyncState }) {
  const getStatusConfig = () => {
    switch (state.status) {
      case "synced":
        return {
          icon: CheckCircle2,
          text: "Synced",
          className: "text-green-500",
          bgClass: "bg-green-500/10",
        };
      case "syncing":
        return {
          icon: RefreshCw,
          text: `Saving ${state.pendingChanges > 0 ? `(${state.pendingChanges})` : ""}`,
          className: "text-amber-500 animate-pulse",
          bgClass: "bg-amber-500/10",
        };
      case "error":
        return {
          icon: AlertCircle,
          text: "Sync failed",
          className: "text-red-500",
          bgClass: "bg-red-500/10",
        };
      case "offline":
        return {
          icon: WifiOff,
          text: "Offline",
          className: "text-slate-500",
          bgClass: "bg-slate-500/10",
        };
      default:
        return {
          icon: CheckCircle2,
          text: "Ready",
          className: "text-slate-400",
          bgClass: "bg-slate-400/10",
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div
      className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config.bgClass} ${config.className}`}
    >
      <Icon className={`h-3.5 w-3.5 ${state.status === "syncing" ? "animate-spin" : ""}`} />
      <span>{config.text}</span>
    </div>
  );
}

// WifiOff icon component
function WifiOff({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="2" y1="2" x2="22" y2="22" />
      <path d="M8.5 16.5a5 5 0 0 1 7 0" />
      <path d="M2 8.82a15 15 0 0 1 4.17-2.65" />
      <path d="M22 8.82a15 15 0 0 0-4.17-2.65" />
      <path d="M6.34 12.41a9 9 0 0 1 2.34-1.14" />
      <path d="M17.66 12.41a9 9 0 0 0-2.34-1.14" />
      <line x1="9" y1="20" x2="15" y2="20" />
    </svg>
  );
}

// =============================================================================
// UNIFIED ADMIN DASHBOARD
// =============================================================================

export interface UnifiedAdminDashboardProps {
  navigate: (path: string) => void;
}

export function UnifiedAdminDashboard({ navigate }: UnifiedAdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "pages" | "blocks" | "media" | "settings">("overview");
  const [pages, setPages] = useState<PageItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPages, setSelectedPages] = useState<Set<string>>(new Set());

  // Fetch pages on mount
  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const res = await fetch("/api/pages");
      const json = await res.json();
      setPages(json.pages || []);
    } catch (error) {
      toast.error("Failed to load pages");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPages = useMemo(() => {
    if (!searchQuery) return pages;
    const q = searchQuery.toLowerCase();
    return pages.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q)
    );
  }, [pages, searchQuery]);

  const stats = useMemo(() => {
    return {
      total: pages.length,
      published: pages.filter((p) => p.status === "published").length,
      draft: pages.filter((p) => p.status === "draft").length,
      unsynced: pages.filter((p) => p.hasUnsyncedChanges).length,
    };
  }, [pages]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80">
        <div className="flex h-16 items-center gap-4 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Admin
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Block Autosync Enabled
              </p>
            </div>
          </div>

          <nav className="ml-8 flex items-center gap-1">
            <TabButton
              active={activeTab === "overview"}
              onClick={() => setActiveTab("overview")}
              icon={BarChart3}
              label="Overview"
            />
            <TabButton
              active={activeTab === "pages"}
              onClick={() => setActiveTab("pages")}
              icon={FileText}
              label="Pages"
            />
            <TabButton
              active={activeTab === "blocks"}
              onClick={() => setActiveTab("blocks")}
              icon={Blocks}
              label="Blocks"
            />
            <TabButton
              active={activeTab === "media"}
              onClick={() => setActiveTab("media")}
              icon={ImageIcon}
              label="Media"
            />
            <TabButton
              active={activeTab === "settings"}
              onClick={() => setActiveTab("settings")}
              icon={Settings}
              label="Settings"
            />
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-800">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Autosync Active
              </span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => navigate("#/home")}>
              <Home className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {activeTab === "overview" && (
          <OverviewTab stats={stats} pages={pages.slice(0, 5)} navigate={navigate} />
        )}
        {activeTab === "pages" && (
          <PagesTab
            pages={filteredPages}
            isLoading={isLoading}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedPages={selectedPages}
            setSelectedPages={setSelectedPages}
            onRefresh={fetchPages}
            navigate={navigate}
          />
        )}
        {activeTab === "blocks" && <BlocksTab />}
        {activeTab === "media" && <MediaTab />}
        {activeTab === "settings" && <SettingsTab />}
      </main>
    </div>
  );
}

// =============================================================================
// TAB COMPONENTS
// =============================================================================

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
        active
          ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
          : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function OverviewTab({
  stats,
  pages,
  navigate,
}: {
  stats: { total: number; published: number; draft: number; unsynced: number };
  pages: PageItem[];
  navigate: (path: string) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Pages"
          value={stats.total}
          icon={FileText}
          trend="+2 this week"
          trendUp={true}
        />
        <StatCard
          title="Published"
          value={stats.published}
          icon={CheckCircle2}
          color="green"
        />
        <StatCard
          title="Drafts"
          value={stats.draft}
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Unsynced"
          value={stats.unsynced}
          icon={AlertCircle}
          color={stats.unsynced > 0 ? "red" : "slate"}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 lg:grid-cols-3">
        <QuickActionCard
          title="Create New Page"
          description="Start building a new page with the block editor"
          icon={FilePlus}
          action={() => navigate("#/admin/edit/new")}
          actionLabel="Create Page"
        />
        <QuickActionCard
          title="Block Library"
          description="Browse and manage your 35+ content blocks"
          icon={Blocks}
          action={() => {}}
          actionLabel="View Blocks"
        />
        <QuickActionCard
          title="Media Library"
          description="Manage images, videos, and other assets"
          icon={ImageIcon}
          action={() => {}}
          actionLabel="Open Library"
        />
      </div>

      {/* Recent Pages */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Pages</CardTitle>
          <CardDescription>Recently updated pages across your site</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {pages.map((page) => (
              <PageRow key={page.id} page={page} navigate={navigate} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PagesTab({
  pages,
  isLoading,
  searchQuery,
  setSearchQuery,
  selectedPages,
  setSelectedPages,
  onRefresh,
  navigate,
}: {
  pages: PageItem[];
  isLoading: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedPages: Set<string>;
  setSelectedPages: (s: Set<string>) => void;
  onRefresh: () => void;
  navigate: (path: string) => void;
}) {
  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search pages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" onClick={onRefresh}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
        <Button onClick={() => navigate("#/admin/edit/new")}>
          <FilePlus className="mr-2 h-4 w-4" />
          New Page
        </Button>
      </div>

      {/* Pages List */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-amber-500" />
              <p className="mt-2 text-sm text-slate-500">Loading pages...</p>
            </div>
          ) : pages.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-2 text-sm text-slate-500">No pages found</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {pages.map((page) => (
                <PageRow
                  key={page.id}
                  page={page}
                  navigate={navigate}
                  selectable
                  selected={selectedPages.has(page.id)}
                  onSelect={() => {
                    const newSet = new Set(selectedPages);
                    if (newSet.has(page.id)) {
                      newSet.delete(page.id);
                    } else {
                      newSet.add(page.id);
                    }
                    setSelectedPages(newSet);
                  }}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function PageRow({
  page,
  navigate,
  selectable,
  selected,
  onSelect,
}: {
  page: PageItem;
  navigate: (path: string) => void;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: () => void;
}) {
  return (
    <div
      className={`flex items-center gap-4 p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900 ${
        selectable ? "cursor-pointer" : ""
      }`}
      onClick={() => selectable && onSelect?.()}
    >
      {selectable && (
        <div
          className={`h-5 w-5 rounded border-2 ${
            selected
              ? "border-amber-500 bg-amber-500"
              : "border-slate-300 dark:border-slate-700"
          }`}
        >
          {selected && <CheckCircle2 className="h-4 w-4 text-white" />}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-slate-900 dark:text-slate-100 truncate">
            {page.title}
          </h4>
          <Badge
            variant={page.status === "published" ? "default" : "secondary"}
            className={
              page.status === "published"
                ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400"
                : ""
            }
          >
            {page.status}
          </Badge>
          {page.hasUnsyncedChanges && (
            <Badge
              variant="outline"
              className="border-amber-200 text-amber-700 dark:border-amber-500/30 dark:text-amber-400"
            >
              <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
              Unsynced
            </Badge>
          )}
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          /{page.slug} · {page.blocksCount} blocks · Updated{" "}
          {new Date(page.updatedAt).toLocaleDateString()}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`#/admin/edit/${page.slug}`);
          }}
        >
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`#/${page.slug}`);
          }}
        >
          <Eye className="mr-2 h-4 w-4" />
          View
        </Button>
      </div>
    </div>
  );
}

function BlocksTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Block Library</CardTitle>
        <CardDescription>35+ content blocks available for your pages</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BLOCK_CATEGORIES.map((category) => (
            <div
              key={category.name}
              className="rounded-lg border border-slate-200 p-4 dark:border-slate-800"
            >
              <div className="mb-3 flex items-center gap-2">
                <category.icon className="h-5 w-5 text-amber-500" />
                <h3 className="font-medium">{category.name}</h3>
                <Badge variant="secondary" className="ml-auto">
                  {category.blocks.length}
                </Badge>
              </div>
              <div className="space-y-1">
                {category.blocks.map((block) => (
                  <div
                    key={block}
                    className="rounded px-2 py-1 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                  >
                    {block}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

const BLOCK_CATEGORIES = [
  {
    name: "Hero",
    icon: Layout,
    blocks: ["HeroSection"],
  },
  {
    name: "Content",
    icon: Type,
    blocks: [
      "AboutSection",
      "WhyChooseUs",
      "ServicesSection",
      "StatsSection",
      "TextBlock",
      "FeatureGrid",
      "Timeline",
      "TeamSection",
      "MaltaMapSection",
      "SocialProofStrip",
    ],
  },
  {
    name: "Properties",
    icon: Home,
    blocks: ["PropertyShowcase", "ImageGallery", "ImageWithText"],
  },
  {
    name: "Booking",
    icon: CalendarCheck,
    blocks: [
      "BookingSection",
      "GuestyPropertySearch",
      "GuestyPropertyGrid",
      "GuestyPropertyDetail",
      "GuestyBookingWidget",
      "GuestyBookingConfirmation",
      "GuestyBookingDashboard",
    ],
  },
  {
    name: "Pricing",
    icon: BarChart3,
    blocks: ["PricingTable", "ComparisonSection"],
  },
  {
    name: "Testimonials",
    icon: Star,
    blocks: ["TestimonialSection"],
  },
  {
    name: "FAQ",
    icon: MessageSquare,
    blocks: ["FaqSection"],
  },
  {
    name: "Contact",
    icon: Globe,
    blocks: ["ContactSection", "MapSection"],
  },
  {
    name: "Navigation",
    icon: ArrowRight,
    blocks: ["LogoBar", "CtaBanner", "FooterSection"],
  },
  {
    name: "Layout",
    icon: LayersIcon,
    blocks: ["Divider", "Spacer"],
  },
  {
    name: "Media",
    icon: ImageIcon,
    blocks: ["VideoSection"],
  },
  {
    name: "Marketing",
    icon: Heart,
    blocks: ["NewsletterSection"],
  },
  {
    name: "Settings",
    icon: Settings,
    blocks: ["ThemeSettings"],
  },
];

function MediaTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Media Library</CardTitle>
        <CardDescription>Manage your images, videos, and other assets</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="aspect-square rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="flex h-full flex-col items-center justify-center gap-2">
                <ImageIcon className="h-8 w-8 text-slate-400" />
                <span className="text-xs text-slate-500">Placeholder {i}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function SettingsTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Autosync Settings</CardTitle>
          <CardDescription>Configure automatic block synchronization</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Autosync</Label>
              <p className="text-sm text-slate-500">
                Automatically save changes as you edit
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Sync Debounce</Label>
              <p className="text-sm text-slate-500">
                Delay before saving (milliseconds)
              </p>
            </div>
            <Input type="number" defaultValue={1500} className="w-24" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Conflict Resolution</Label>
              <p className="text-sm text-slate-500">
                How to handle conflicting changes
              </p>
            </div>
            <select className="rounded-md border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800">
              <option>Last write wins</option>
              <option>Manual merge</option>
              <option>Always prompt</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Editor Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Show Block Previews</Label>
              <p className="text-sm text-slate-500">
                Render block previews in the editor
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Auto-save Drafts</Label>
              <p className="text-sm text-slate-500">
                Save drafts locally before publishing
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendUp,
  color = "slate",
}: {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: string;
  trendUp?: boolean;
  color?: "slate" | "green" | "amber" | "red";
}) {
  const colorClasses = {
    slate: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    green: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400",
    amber: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
    red: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className={`rounded-xl p-3 ${colorClasses[color]}`}>
            <Icon className="h-5 w-5" />
          </div>
          {trend && (
            <div
              className={`text-xs font-medium ${
                trendUp ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend}
            </div>
          )}
        </div>
        <div className="mt-4">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {title}
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickActionCard({
  title,
  description,
  icon: Icon,
  action,
  actionLabel,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  actionLabel: string;
}) {
  return (
    <Card className="flex flex-col">
      <CardContent className="flex flex-1 flex-col p-6">
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-500/20">
          <Icon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        </div>
        <h3 className="font-medium text-slate-900 dark:text-slate-100">{title}</h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {description}
        </p>
        <div className="mt-auto pt-4">
          <Button onClick={action} className="w-full">
            {actionLabel}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// =============================================================================
// UI COMPONENTS (Simplified)
// =============================================================================

function Button({
  children,
  variant = "default",
  size = "default",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "icon";
}) {
  const baseClasses =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:pointer-events-none disabled:opacity-50";

  const variantClasses = {
    default: "bg-amber-500 text-white hover:bg-amber-600",
    ghost: "hover:bg-slate-100 dark:hover:bg-slate-800",
    outline: "border border-slate-300 bg-transparent hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800",
  };

  const sizeClasses = {
    default: "h-10 px-4 py-2",
    sm: "h-8 px-3 text-sm",
    icon: "h-10 w-10",
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function Input({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:border-slate-700 dark:bg-slate-900 dark:placeholder:text-slate-600 ${className}`}
      {...props}
    />
  );
}

function Switch({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="relative inline-flex h-6 w-11 cursor-pointer items-center">
      <input type="checkbox" className="peer sr-only" {...props} />
      <span className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-amber-500 peer-checked:after:translate-x-5 peer-focus:ring-2 peer-focus:ring-amber-500 peer-focus:ring-offset-2 dark:bg-slate-700 dark:peer-focus:ring-offset-slate-900" />
    </label>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-sm font-medium text-slate-900 dark:text-slate-100">
      {children}
    </label>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950 ${className}`}
    >
      {children}
    </div>
  );
}

function CardHeader({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>;
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="font-semibold leading-none tracking-tight">{children}</h3>;
}

function CardDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-slate-500 dark:text-slate-400">{children}</p>;
}

function CardContent({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`p-6 pt-0 ${className}`}>{children}</div>;
}

function Badge({
  children,
  variant = "default",
  className = "",
}: {
  children: React.ReactNode;
  variant?: "default" | "secondary" | "outline";
  className?: string;
}) {
  const variantClasses = {
    default: "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900",
    secondary: "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100",
    outline: "border border-slate-300 bg-transparent text-slate-700 dark:border-slate-700 dark:text-slate-300",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
