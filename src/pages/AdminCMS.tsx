import { useEffect, useState, useCallback, useRef } from "react";
import { Link, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Loader2, SaveAll, Clock, Search,
  LayoutGrid, Sparkles, RefreshCw, CheckCircle2,
  Eye, EyeOff, Filter, Undo2, Redo2, Bot
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth, useRoles } from "@/hooks/use-auth";
import { BlockEditor } from "@/components/cms/BlockEditor";
import { CmsBlockSkeleton } from "@/components/skeletons";
import { VersionPanel } from "@/components/cms/VersionPanel";
import { AgentChat } from "@/components/cms/AgentChat";
import { PageSpinner } from "@/components/shared/PageSpinner";
import { CmsQueryRepository, CmsCommandRepository } from "@/lib/cms-repository";
import { getDefinition, getDefinitionsByPage } from "@/lib/cms-types";
import { cmsUndoStack } from "@/lib/cms-undo";
import type { CmsRow } from "@/lib/cms-types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type PageFilter = "all" | "landing" | "booking" | "owners" | "listing" | "global" | "unregistered";
type RightPanel = "none" | "history" | "agent";

const PAGE_TABS: { key: PageFilter; label: string }[] = [
  { key: "all",          label: "All"      },
  { key: "landing",      label: "Landing"  },
  { key: "booking",      label: "Booking"  },
  { key: "owners",       label: "Owners"   },
  { key: "listing",      label: "Listings" },
  { key: "unregistered", label: "Other"    },
];

export default function AdminCMS() {
  const { user, loading: authLoading }         = useAuth();
  const { isAdmin, isEditor, loading: rLoad }  = useRoles(user?.id);

  const [rows,          setRows]          = useState<CmsRow[]>([]);
  const [dataLoading,   setDataLoading]   = useState(true);
  const [savingAll,     setSavingAll]     = useState(false);
  const [savedAll,      setSavedAll]      = useState(false);
  const [rightPanel,    setRightPanel]    = useState<RightPanel>("none");
  const [search,        setSearch]        = useState("");
  const [pageFilter,    setPageFilter]    = useState<PageFilter>("all");
  const [aiEnabled,     setAiEnabled]     = useState(true);
  const [hideInvisible, setHideInvisible] = useState(false);
  const [canUndo,       setCanUndo]       = useState(false);
  const [canRedo,       setCanRedo]       = useState(false);
  // Track which block to auto-expand (from agent)
  const [focusedKey,    setFocusedKey]    = useState<string | null>(null);
  const focusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const syncUndoState = useCallback(() => {
    setCanUndo(cmsUndoStack.canUndo());
    setCanRedo(cmsUndoStack.canRedo());
  }, []);

  const load = useCallback(async () => {
    setDataLoading(true);
    const r = await CmsQueryRepository.fetchAllRows();
    setDataLoading(false);
    if (!r.ok) { toast.error(r.error); return; }
    setRows(r.data);
    cmsUndoStack.clear();
    syncUndoState();
  }, [syncUndoState]);

  useEffect(() => { load(); }, [load]);

  // Keyboard shortcuts: Ctrl+Z / Ctrl+Shift+Z (from OpenPage useKeyboardShortcuts pattern)
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        handleRedo();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows]);

  if (authLoading || rLoad) return <PageSpinner />;
  if (!user)                return <Navigate to="/auth" replace />;
  if (!isAdmin && !isEditor) return <Navigate to="/admin" replace />;

  // ── Row mutation with undo push ────────────────────────────────────────────
  const handleChange = useCallback((id: string, patch: Partial<CmsRow>) => {
    setRows((prev) => {
      // Push current state before mutation (OpenPage pushUndo pattern)
      cmsUndoStack.push(prev, `Edit ${prev.find((r) => r.id === id)?.section_key ?? id}`);
      syncUndoState();
      return prev.map((r) => r.id === id ? { ...r, ...patch } : r);
    });
    setSavedAll(false);
  }, [syncUndoState]);

  // ── Agent patch apply ──────────────────────────────────────────────────────
  const handleAgentPatch = useCallback((sectionKey: string, fieldPath: string, newValue: string) => {
    setRows((prev) => {
      const row = prev.find((r) => r.section_key === sectionKey);
      if (!row) { toast.error(`Block not found: ${sectionKey}`); return prev; }
      cmsUndoStack.push(prev, `Agent: ${sectionKey}.${fieldPath}`);
      syncUndoState();
      return prev.map((r) =>
        r.section_key === sectionKey
          ? { ...r, content: { ...(r.content as Record<string, unknown>), [fieldPath]: newValue } }
          : r
      );
    });
    setSavedAll(false);
    toast.success(`Updated ${sectionKey} · ${fieldPath}`);
  }, [syncUndoState]);

  // ── Agent focus block ──────────────────────────────────────────────────────
  const handleFocusBlock = useCallback((sectionKey: string) => {
    // Set filter to show this block's page
    const def = getDefinition(sectionKey);
    if (def) setPageFilter(def.page);
    setSearch(sectionKey);
    setFocusedKey(sectionKey);
    if (focusTimeoutRef.current) clearTimeout(focusTimeoutRef.current);
    focusTimeoutRef.current = setTimeout(() => setFocusedKey(null), 3000);
    // Scroll into view
    setTimeout(() => {
      document.getElementById(`block-${sectionKey}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  }, []);

  // ── Undo / Redo ────────────────────────────────────────────────────────────
  const handleUndo = useCallback(() => {
    setRows((prev) => {
      const restored = cmsUndoStack.undo(prev);
      if (!restored) { toast("Nothing to undo"); return prev; }
      syncUndoState();
      toast("Undone");
      return restored;
    });
  }, [syncUndoState]);

  const handleRedo = useCallback(() => {
    setRows((prev) => {
      const restored = cmsUndoStack.redo(prev);
      if (!restored) { toast("Nothing to redo"); return prev; }
      syncUndoState();
      toast("Redone");
      return restored;
    });
  }, [syncUndoState]);

  // ── Save all ───────────────────────────────────────────────────────────────
  const saveAll = async () => {
    setSavingAll(true);
    const result = await CmsCommandRepository.saveAllRows(
      rows.map((r) => ({ id: r.id, content: r.content, is_visible: r.is_visible, section_label: r.section_label }))
    );
    setSavingAll(false);
    if (!result.ok) { toast.error(result.error); return; }
    setSavedAll(true);
    setTimeout(() => setSavedAll(false), 3000);
    toast.success(`All ${result.data} blocks saved`);
  };

  // ── Filter ─────────────────────────────────────────────────────────────────
  const defsByPage     = getDefinitionsByPage();
  const registeredKeys = new Set(Object.values(defsByPage).flat().map((d) => d.section_key));

  const filtered = rows.filter((row) => {
    if (hideInvisible && !row.is_visible) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!row.section_key.toLowerCase().includes(q) && !row.section_label.toLowerCase().includes(q)) return false;
    }
    if (pageFilter === "all")          return true;
    if (pageFilter === "unregistered") return !registeredKeys.has(row.section_key);
    return getDefinition(row.section_key)?.page === pageFilter;
  });

  const tabCount = (key: PageFilter) => {
    if (key === "all")          return rows.length;
    if (key === "unregistered") return rows.filter((r) => !registeredKeys.has(r.section_key)).length;
    return rows.filter((r) => getDefinition(r.section_key)?.page === key).length;
  };

  const rightPanelOpen = rightPanel !== "none";

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* ── Top bar ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-border/40 bg-background/80 backdrop-blur">
        <div className="container flex items-center justify-between gap-2 py-3">
          <div className="flex items-center gap-2 shrink-0">
            <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Link to="/admin" aria-label="Back to dashboard"><ArrowLeft className="h-4 w-4" /></Link>
            </Button>
            <div className="flex items-center gap-1.5">
              <LayoutGrid className="h-4 w-4 text-gold" aria-hidden />
              <span className="font-display font-semibold text-sm">CMS Editor</span>
            </div>
            <div className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
              <span className="rounded-full bg-muted px-2 py-0.5">{rows.length}</span>
              <span className="rounded-full bg-emerald-500/15 text-emerald-400 px-2 py-0.5">
                {rows.filter((r) => r.is_visible).length} visible
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Undo/Redo (OpenPage undo pattern) */}
            <Button
              onClick={handleUndo}
              variant="ghost" size="sm"
              className="h-8 w-8 p-0"
              disabled={!canUndo}
              aria-label="Undo (Ctrl+Z)"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              onClick={handleRedo}
              variant="ghost" size="sm"
              className="h-8 w-8 p-0"
              disabled={!canRedo}
              aria-label="Redo (Ctrl+Y)"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="h-3.5 w-3.5" />
            </Button>

            {/* AI toggle */}
            <button
              type="button"
              onClick={() => setAiEnabled((v) => !v)}
              className={cn("flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs transition-colors",
                aiEnabled ? "border-gold/40 bg-gold/10 text-gold" : "border-border/40 text-muted-foreground hover:text-foreground")}
              aria-pressed={aiEnabled}
            >
              <Sparkles className="h-3 w-3" aria-hidden />
              <span className="hidden sm:inline">AI</span>
            </button>

            {/* Agent chat */}
            <Button
              onClick={() => setRightPanel((v) => v === "agent" ? "none" : "agent")}
              variant="outline" size="sm"
              className={cn("h-8 gap-1.5 text-xs", rightPanel === "agent" && "border-gold/40 text-gold")}
              aria-pressed={rightPanel === "agent"}
              title="AI Assistant"
            >
              <Bot className="h-3.5 w-3.5" aria-hidden />
              <span className="hidden sm:inline">Agent</span>
            </Button>

            {/* Version history */}
            <Button
              onClick={() => setRightPanel((v) => v === "history" ? "none" : "history")}
              variant="outline" size="sm"
              className={cn("h-8 gap-1.5 text-xs", rightPanel === "history" && "border-gold/40 text-gold")}
              aria-pressed={rightPanel === "history"}
            >
              <Clock className="h-3.5 w-3.5" aria-hidden />
              <span className="hidden sm:inline">History</span>
            </Button>

            {/* Reload */}
            <Button onClick={load} variant="ghost" size="sm" className="h-8 w-8 p-0" disabled={dataLoading} aria-label="Reload">
              <RefreshCw className={cn("h-3.5 w-3.5", dataLoading && "animate-spin")} />
            </Button>

            {/* Save all */}
            <Button onClick={saveAll} variant="gold" size="sm" className="h-8 gap-1.5 text-xs" disabled={savingAll} aria-label="Save all blocks">
              {savingAll  ? <Loader2    className="h-3.5 w-3.5 animate-spin" aria-hidden />
               : savedAll ? <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
               :            <SaveAll    className="h-3.5 w-3.5" aria-hidden />}
              <span className="hidden sm:inline">Save all</span>
            </Button>
          </div>
        </div>
      </header>

      {/* ── Main ─────────────────────────────────────────────────────────────── */}
      <div className={cn("transition-all duration-300", rightPanelOpen ? "mr-80" : "")}>
        <div className="container max-w-4xl py-6">
          {/* Search + filters */}
          <div className="mb-6 space-y-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search blocks…"
                  className="pl-9 h-9"
                  aria-label="Search CMS blocks"
                />
              </div>
              <button
                type="button"
                onClick={() => setHideInvisible((v) => !v)}
                className={cn("flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs transition-colors",
                  hideInvisible ? "border-gold/40 bg-gold/10 text-gold" : "border-border/40 text-muted-foreground hover:text-foreground")}
                aria-pressed={hideInvisible}
              >
                {hideInvisible ? <EyeOff className="h-3.5 w-3.5" aria-hidden /> : <Eye className="h-3.5 w-3.5" aria-hidden />}
                <span className="hidden sm:inline">{hideInvisible ? "Visible" : "All"}</span>
              </button>
            </div>

            <div role="tablist" aria-label="Filter by page" className="flex items-center gap-1 overflow-x-auto pb-1">
              <Filter className="h-3.5 w-3.5 shrink-0 text-muted-foreground mr-1" aria-hidden />
              {PAGE_TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={pageFilter === tab.key}
                  onClick={() => setPageFilter(tab.key)}
                  className={cn("shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                    pageFilter === tab.key
                      ? "bg-gold/15 text-gold border border-gold/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted")}
                >
                  {tab.label}
                  <span className="ml-1 tabular-nums text-[10px] opacity-50">{tabCount(tab.key)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Block list */}
          {dataLoading ? <CmsBlockSkeleton count={8} /> : filtered.length === 0 ? (
            <div className="rounded-2xl border border-border/40 bg-card/30 p-12 text-center">
              <p className="font-display text-lg">
                {rows.length === 0 ? "No CMS blocks found" : "No blocks match your filter"}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {rows.length === 0 ? "Run supabase db push to seed blocks." : "Clear search or change filter."}
              </p>
              {rows.length === 0 && (
                <code className="mt-4 inline-block rounded-xl border border-border/40 bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
                  supabase db push
                </code>
              )}
            </div>
          ) : (
            <div className="space-y-3" role="list" aria-label="CMS content blocks">
              <AnimatePresence initial={false}>
                {filtered.map((row, i) => (
                  <motion.div
                    key={row.id}
                    id={`block-${row.section_key}`}
                    role="listitem"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ delay: Math.min(i * 0.02, 0.3) }}
                    className={cn(focusedKey === row.section_key && "ring-2 ring-gold/50 rounded-2xl")}
                  >
                    <BlockEditor
                      row={row}
                      definition={getDefinition(row.section_key)}
                      onChange={handleChange}
                      aiEnabled={aiEnabled}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* ── Right panels ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {rightPanelOpen && (
          <motion.div
            key={rightPanel}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed right-0 top-0 z-40 flex h-full w-80 flex-col border-l border-border/50 bg-card/95 backdrop-blur shadow-elegant"
            aria-label={rightPanel === "agent" ? "AI Agent panel" : "Version history panel"}
            role="complementary"
          >
            {rightPanel === "agent" && (
              <AgentChat
                rows={rows}
                onApplyPatch={handleAgentPatch}
                onFocusBlock={handleFocusBlock}
                onClose={() => setRightPanel("none")}
              />
            )}
            {rightPanel === "history" && (
              <VersionPanel
                userId={user?.id}
                onRestored={() => { void load(); setRightPanel("none"); }}
                onClose={() => setRightPanel("none")}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
