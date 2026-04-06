"use client";

import React, {createContext, memo, useCallback, useContext, useEffect, useMemo, useRef, useState,} from "react";
import {type Data, Puck, type PuckAction, usePuck} from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import "@puckeditor/plugin-ai/styles.css";
import {toast} from "sonner";
import {ArrowLeft, CheckCircle2, Code, Download, Eye, EyeOff, FileJson, Save, Upload, X,} from "lucide-react";

// Lazy load AI components for better initial load
const AiPageBuilder = React.lazy(() => import("./ai-page-builder"));
const AiBlockEditor = React.lazy(() => import("./ai-block-editor"));
const BlockBuilder = React.lazy(() => import("./block-builder"));

// ============================================================
// EDITOR CONTEXT
// ============================================================
interface EditorContextValue {
  currentPage: string;
  previewMode: boolean;
  setPreviewMode: (v: boolean) => void;
  jsonView: boolean;
  setJsonView: (v: boolean) => void;
  isDirty: boolean;
  setIsDirty: (v: boolean) => void;
  currentData: Data;
  saveStatus: "idle" | "saving" | "saved" | "error";
}

const EditorContext = createContext<EditorContextValue | null>(null);

function useEditorContext(): EditorContextValue {
  const ctx = useContext(EditorContext);
  if (!ctx)
    throw new Error("useEditorContext must be used within EditorContext.Provider");
  return ctx;
}

// ============================================================
// ERROR BOUNDARY
// ============================================================
interface EBProps {
  children: React.ReactNode;
  onReset: () => void;
}
interface EBState {
  hasError: boolean;
  error: Error | null;
}

class EditorErrorBoundary extends React.Component<EBProps, EBState> {
  constructor(props: EBProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error): EBState {
    return { hasError: true, error };
  }
  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset();
  };
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-screen items-center justify-center bg-cpm-bg-primary px-6">
          <div className="w-full max-w-md text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 ring-1 ring-red-500/20">
              <X className="h-8 w-8 text-red-400"/>
            </div>
            <h2 className="mb-2 text-xl font-medium text-cpm-text-primary">
              Editor Error
            </h2>
            <p className="mb-6 text-sm text-cpm-text-secondary">
              Something went wrong loading the editor.
            </p>
            {this.state.error && (
              <pre className="mb-6 max-h-32 overflow-auto rounded-lg bg-cpm-bg-secondary p-4 text-xs text-red-400">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={this.handleReset}
              className="rounded-lg bg-cpm-accent px-6 py-2.5 text-sm font-semibold text-cpm-bg-primary transition-all hover:bg-cpm-accent-hover"
            >
              Reset Editor
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ============================================================
// EDITOR HEADER
// ============================================================
const EditorHeader = memo(function EditorHeader({onBack}: { onBack: () => void }) {
  const { appState, dispatch } = usePuck();
  const ctx = useEditorContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI dialog states
  const [aiPageBuilderOpen, setAiPageBuilderOpen] = useState(false);
  const [aiBlockEditorOpen, setAiBlockEditorOpen] = useState(false);
  const [blockBuilderOpen, setBlockBuilderOpen] = useState(false);

  // Track selected component for AI block editing
  const selectedComponentId = appState.ui?.selectedComponentId;
  const contentArray = useMemo(() => {
    const data = appState.data as Record<string, unknown>;
    return (data?.content as Array<{ type: string; props: Record<string, unknown>; id?: string }>) || [];
  }, [appState.data]);

  const selectedComponent = useMemo(() => {
    if (!selectedComponentId || !contentArray) return null;
    return contentArray.find(
        (item) =>
            item.id === selectedComponentId ||
            (item.props?.id as string) === selectedComponentId
    );
  }, [selectedComponentId, contentArray]);

  const handlePublish = useCallback(async () => {
    ctx.setIsDirty(true);
    try {
      const res = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: ctx.currentPage,
          title: ctx.currentPage,
          data: appState.data,
          status: "published",
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      ctx.setIsDirty(false);
      toast.success("Page published!");
    } catch {
      toast.error("Failed to save page");
    }
  }, [appState.data, ctx]);

  const handleExport = useCallback(() => {
    const json = JSON.stringify(appState.data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${ctx.currentPage}-data.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [appState.data, ctx.currentPage]);

  const handleImport = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const json = JSON.parse(ev.target?.result as string);
          if (!json.root || !Array.isArray(json.content)) {
            toast.error("Invalid Puck data format");
            return;
          }
          dispatch({
            type: "setData",
            data: json,
          } as unknown as PuckAction);
          toast.success("Data imported");
        } catch {
          toast.error("Failed to parse JSON");
        }
      };
      reader.readAsText(file);
      e.target.value = "";
    },
    [dispatch]
  );

  const handleCopyJson = useCallback(() => {
    try {
      navigator.clipboard.writeText(JSON.stringify(appState.data, null, 2));
      toast.success("JSON copied");
    } catch {
      toast.error("Failed to copy");
    }
  }, [appState.data]);

  const handleAiPageApply = useCallback(
    (data: Data) => {
      dispatch({
        type: "setData",
        data,
      } as unknown as PuckAction);
      ctx.setIsDirty(true);
    },
    [dispatch, ctx]
  );

  const handleAiBlockApply = useCallback(
    (newProps: Record<string, unknown>) => {
      if (!selectedComponent) return;
      dispatch({
        type: "replace",
        componentId: selectedComponent.id || selectedComponent.props?.id || "",
        state: { data: newProps },
      } as unknown as PuckAction);
      ctx.setIsDirty(true);
    },
    [dispatch, selectedComponent, ctx]
  );

  const handleAddBlock = useCallback(
    (blockType: string, props: Record<string, unknown>) => {
      dispatch({
        type: "insert",
        componentType: blockType,
        data: props,
      } as unknown as PuckAction);
      ctx.setIsDirty(true);
    },
    [dispatch, ctx]
  );

  // Keyboard shortcut: Ctrl/Cmd+S to save
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handlePublish();
      }
      if (e.key === "Escape") {
        onBack();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handlePublish, onBack]);

  return (
    <>
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-cpm-border bg-cpm-bg-primary px-4">
        {/* Left: Back + Status + Page Name */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-cpm-text-secondary transition-all hover:bg-cpm-bg-secondary hover:text-cpm-text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </button>
          <div className="h-5 w-px bg-cpm-border" />
          <div className="flex items-center gap-1.5">
            {ctx.isDirty ? (
              <span className="inline-block h-2 w-2 rounded-full animate-pulse bg-cpm-accent" />
            ) : (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            )}
            <span className="text-xs text-cpm-text-secondary">
              {ctx.isDirty ? "Unsaved changes" : "Saved"}
            </span>
          </div>
          <div className="h-5 w-px bg-cpm-border" />
          <span className="text-xs font-medium capitalize text-cpm-accent">
            {ctx.currentPage}
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5">
          {/* AI Page Builder */}
          <button
            onClick={() => setAiPageBuilderOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-cpm-accent/25 bg-gradient-to-r from-cpm-accent/15 to-cpm-accent/5 px-2.5 py-1.5 text-xs font-medium text-cpm-accent transition-all duration-300 hover:from-cpm-accent/25 hover:to-cpm-accent/10 hover:border-cpm-accent/40"
            title="AI Page Builder"
          >
            <span className="hidden md:inline">AI Page</span>
          </button>

          {/* Add Block */}
          <button
            onClick={() => setBlockBuilderOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-cpm-border px-2.5 py-1.5 text-xs text-cpm-text-secondary transition-all duration-200 hover:border-cpm-accent/25 hover:text-cpm-accent"
            title="Block Builder"
          >
            <span className="hidden lg:inline">Add Block</span>
          </button>

          <div className="mx-0.5 h-5 w-px bg-cpm-border" />

          {/* JSON View */}
          <button
            onClick={() => ctx.setJsonView(!ctx.jsonView)}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition-all ${
              ctx.jsonView
                ? "border-cpm-accent/30 bg-cpm-accent/10 text-cpm-accent"
                : "border-cpm-border text-cpm-text-secondary hover:text-cpm-text-primary"
            }`}
          >
            <Code className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">JSON</span>
          </button>

          {/* Import */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center rounded-lg border border-cpm-border px-2.5 py-1.5 text-cpm-text-secondary transition-all hover:text-cpm-text-primary"
            title="Import JSON"
          >
            <Upload className="h-3.5 w-3.5" />
          </button>

          {/* Export */}
          <button
            onClick={handleExport}
            className="flex items-center rounded-lg border border-cpm-border px-2.5 py-1.5 text-cpm-text-secondary transition-all hover:text-cpm-text-primary"
            title="Export JSON"
          >
            <Download className="h-3.5 w-3.5" />
          </button>

          {/* Preview */}
          <button
            onClick={() => ctx.setPreviewMode(true)}
            className="flex items-center gap-1.5 rounded-lg border border-cpm-border px-2.5 py-1.5 text-xs text-cpm-text-secondary transition-all hover:text-cpm-text-primary"
          >
            <Eye className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Preview</span>
          </button>

          {/* Save */}
          <button
            onClick={handlePublish}
            className="flex items-center gap-1.5 rounded-lg bg-cpm-accent px-3 py-1.5 text-xs font-semibold text-cpm-bg-primary transition-all hover:bg-cpm-accent-hover"
          >
            <Save className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Save</span>
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImport}
        className="hidden"
      />

      {/* JSON View Panel */}
      {ctx.jsonView && (
        <div className="shrink-0 border-b border-cpm-border bg-cpm-bg-primary">
          <div className="flex items-center justify-between border-b border-cpm-border px-4 py-2">
            <div className="flex items-center gap-2">
              <FileJson className="h-3.5 w-3.5 text-cpm-text-tertiary" />
              <span className="text-[10px] font-medium uppercase tracking-wider text-cpm-text-tertiary">
                Page Data
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleCopyJson}
                className="rounded px-2 py-1 text-[10px] text-cpm-text-secondary hover:text-cpm-accent"
              >
                Copy
              </button>
              <button
                onClick={() => ctx.setJsonView(false)}
                className="rounded p-1 text-cpm-text-secondary hover:text-cpm-text-primary"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <pre className="max-h-64 overflow-auto px-4 pb-3 text-xs leading-relaxed text-cpm-accent/80">
            {JSON.stringify(appState.data, null, 2)}
          </pre>
        </div>
      )}

      {/* AI Dialogs - Lazy loaded */}
      <React.Suspense fallback={null}>
        {aiPageBuilderOpen && (
            <AiPageBuilder
                open={aiPageBuilderOpen}
                onClose={() => setAiPageBuilderOpen(false)}
                onApply={handleAiPageApply}
                currentPage={ctx.currentPage}
            />
        )}

        {selectedComponent && aiBlockEditorOpen && (
            <AiBlockEditor
                open={aiBlockEditorOpen}
                onClose={() => setAiBlockEditorOpen(false)}
                blockType={selectedComponent.type as string}
                currentProps={selectedComponent.props as Record<string, unknown>}
                onApply={handleAiBlockApply}
            />
        )}

        <BlockBuilder
            open={blockBuilderOpen}
            onClose={() => setBlockBuilderOpen(false)}
            onAddBlock={handleAddBlock}
        />
      </React.Suspense>
    </>
  );
});

// ============================================================
// PREVIEW RENDERER
// ============================================================
const PreviewRenderer = memo(function PreviewRenderer({data}: { data: Data }) {
  const d = data as Record<string, unknown>;
  const content = useMemo(
      () => (d.content || []) as Array<{ type: string; props: Record<string, unknown> }>,
      [d.content]
  );

  if (!content.length) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-cpm-text-tertiary">
        <span className="mb-4 h-16 w-16"/>
        <p className="text-sm">No content yet</p>
      </div>
    );
  }

  return (
    <>
      {content.map((item, index) => {
        const componentDef = (window as any).__PUCK_CONFIG__?.components?.[item.type as string];
        if (!componentDef) return null;
        const key = item.props?.id || `preview-${item.type}-${index}`;
        return (
            <React.Fragment key={key}>
              {React.createElement(componentDef.Component, item.props)}
          </React.Fragment>
        );
      })}
    </>
  );
});

// ============================================================
// EDITOR LOADING SCREEN
// ============================================================
const EditorLoadingScreen = memo(function EditorLoadingScreen({pageName}: { pageName: string }) {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-cpm-bg-primary">
      <div className="relative mb-6">
        <div className="h-12 w-12 rounded-full border-2 border-cpm-border border-t-cpm-accent animate-spin" />
      </div>
      <p className="mb-1 text-sm font-medium text-cpm-text-primary">
        Loading editor
      </p>
      <p className="text-xs capitalize text-cpm-text-tertiary">
        Preparing &ldquo;{pageName}&rdquo; page...
      </p>
    </div>
  );
});

// ============================================================
// MAIN COMPONENT
// ============================================================
interface PuckEditorProps {
  currentPage: string;
  initialData: Data;
  onBack: () => void;
}

export default function PuckEditor({
  currentPage,
  initialData: propInitialData,
  onBack,
}: PuckEditorProps) {
  // Validate the data has proper structure
  const [readyData, setReadyData] = useState<Data | null>(() => {
    if (
      propInitialData &&
      typeof propInitialData === "object" &&
      Array.isArray((propInitialData as Record<string, unknown>).content)
    ) {
      return propInitialData;
    }
    return null;
  });

  const [previewMode, setPreviewMode] = useState(false);
  const [jsonView, setJsonView] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [currentData, setCurrentData] = useState<Data>(
    propInitialData || {}
  );
  const [puckKey, setPuckKey] = useState(0);

  // Fallback: if prop was empty, try fetching
  useEffect(() => {
    if (readyData) return;
    fetch(`/api/pages/${currentPage}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((page) => {
        if (page?.data) {
          setReadyData(page.data);
          setCurrentData(page.data);
        } else {
          setReadyData({});
        }
      })
      .catch(() => setReadyData({}));
  }, [currentPage, readyData]);

  const handleChange = useCallback((data: Data) => {
    setCurrentData(data);
    setIsDirty(true);
  }, []);

  const handleReset = useCallback(() => {
    setIsDirty(false);
    setPreviewMode(false);
    setJsonView(false);
    setPuckKey((k) => k + 1);
  }, []);

  const handleExitPreview = useCallback(() => {
    setPreviewMode(false);
  }, []);

  const contextValue = useMemo<EditorContextValue>(
    () => ({
      currentPage,
      previewMode,
      setPreviewMode,
      jsonView,
      setJsonView,
      isDirty,
      setIsDirty,
      currentData,
      saveStatus: isDirty ? "idle" : "saved",
    }),
    [currentPage, previewMode, jsonView, isDirty, currentData]
  );

  // Don't mount Puck until data is ready
  if (!readyData) {
    return <EditorLoadingScreen pageName={currentPage} />;
  }

  // ── Preview mode ──
  if (previewMode) {
    return (
      <EditorErrorBoundary onReset={handleReset}>
        <div className="flex h-screen flex-col bg-cpm-bg-primary">
          <div className="flex h-12 shrink-0 items-center justify-between border-b border-cpm-border bg-cpm-bg-primary px-4">
            <span className="text-xs font-medium text-cpm-accent">
              Preview — <span className="capitalize">{currentPage}</span>
            </span>
            <button
              onClick={handleExitPreview}
              className="flex items-center gap-1.5 rounded-lg bg-cpm-accent px-3 py-1.5 text-xs font-semibold text-cpm-bg-primary hover:bg-cpm-accent-hover"
            >
              <EyeOff className="h-3.5 w-3.5" />
              Exit Preview
            </button>
          </div>
          <div className="flex-1 overflow-auto">
            <PreviewRenderer data={currentData} />
          </div>
        </div>
      </EditorErrorBoundary>
    );
  }

  // ── Editor mode ──
  return (
    <EditorErrorBoundary onReset={handleReset}>
      <EditorContext.Provider value={contextValue}>
        <div className="flex h-screen flex-col bg-cpm-bg-primary">
          <Puck
            key={puckKey}
            config={(window as any).__PUCK_CONFIG__}
            data={readyData}
            overrides={{
              header: () => <EditorHeader onBack={onBack} />,
            }}
            headerTitle=""
            onChange={handleChange}
            onPublish={async (data) => {
              try {
                await fetch("/api/pages", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    slug: currentPage,
                    title: currentPage,
                    data,
                    status: "published",
                  }),
                });
                setIsDirty(false);
                toast.success("Page published!");
              } catch {
                toast.error("Failed to publish");
              }
            }}
          />
        </div>
      </EditorContext.Provider>
    </EditorErrorBoundary>
  );
}
