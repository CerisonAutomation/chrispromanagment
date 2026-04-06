"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { BlockData } from "@/lib/block-types";
import { toast } from "sonner";
import {
  Sparkles,
  X,
  Check,
  Copy,
  Eye,
  ArrowLeft,
  Wand2,
  Globe,
  Building2,
  Users,
  CreditCard,
  Phone,
  CalendarCheck,
  Send,
  RotateCcw,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputActions,
  PromptInputAction,
} from "@/components/ui/prompt-input";
import {
  PromptSuggestion,
} from "@/components/ui/prompt-suggestion";
import {
  TextShimmerLoader,
  Loader,
} from "@/components/ui/loader";
import { BlurFade } from "@/components/effects/blur-fade";

// ============================================================
// TYPES & CONSTANTS
// ============================================================
interface AiPageBuilderProps {
  open: boolean;
  onClose: () => void;
  onApply: (data: BlockData) => void;
  currentPage: string;
}

type Stage = "input" | "loading" | "preview" | "error";

const PRESET_TEMPLATES = [
  {
    id: "landing",
    label: "Full Landing Page",
    description: "Hero, features, testimonials, CTA",
    icon: Globe,
    prompt:
      "Create a complete landing page with a hero section, feature highlights, testimonials, and a call-to-action banner.",
  },
  {
    id: "property",
    label: "Property Showcase",
    description: "Property gallery, highlights, booking",
    icon: Building2,
    prompt:
      "Create a property showcase page with a hero, property gallery, key highlights section, and booking section.",
  },
  {
    id: "about",
    label: "About Us",
    description: "Company story, team, values",
    icon: Users,
    prompt:
      "Create an About Us page with a hero, company story section, why choose us, and a contact CTA.",
  },
  {
    id: "pricing",
    label: "Pricing Page",
    description: "Pricing tiers, features, FAQ",
    icon: CreditCard,
    prompt:
      "Create a pricing page with a hero, pricing table, services overview, FAQ section, and CTA.",
  },
  {
    id: "contact",
    label: "Contact Page",
    description: "Contact form, info, map",
    icon: Phone,
    prompt:
      "Create a contact page with a hero, contact form, company info section, and footer.",
  },
  {
    id: "booking",
    label: "Booking Page",
    description: "Availability, booking form, properties",
    icon: CalendarCheck,
    prompt:
      "Create a booking page with a hero, property showcase, booking form, and testimonials.",
  },
];

const QUICK_SUGGESTIONS = [
  "A luxury landing page for villa rentals",
  "Property portfolio with 6 featured listings",
  "Guest testimonials with 5-star ratings",
  "About page with our Superhost story",
  "Contact page with map and form",
  "Pricing tiers for management services",
  "FAQ section for common guest questions",
];

const STATUS_MESSAGES = [
  "Analyzing your requirements...",
  "Crafting page structure...",
  "Generating content blocks...",
  "Applying design polish...",
  "Finalizing your page...",
];

// ============================================================
// COMPONENT
// ============================================================
export default function AiPageBuilder({
  open,
  onClose,
  onApply,
  currentPage,
}: AiPageBuilderProps) {
  const [stage, setStage] = useState<Stage>("input");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [customInstruction, setCustomInstruction] = useState("");
  const [generatedBlockData, setGeneratedBlockData] = useState<BlockData | null>(null);
  const [previewJson, setPreviewJson] = useState("");
  const [error, setError] = useState("");
  const [statusIndex, setStatusIndex] = useState(0);
  const [blockSummary, setBlockSummary] = useState<string[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  // Cycling status messages during loading
  useEffect(() => {
    if (stage !== "loading") return;
    const interval = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % STATUS_MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [stage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const reset = useCallback(() => {
    setStage("input");
    setSelectedTemplate(null);
    setCustomInstruction("");
    setGeneratedBlockData(null);
    setPreviewJson("");
    setError("");
    setStatusIndex(0);
    setBlockSummary([]);
  }, []);

  const handleClose = useCallback(() => {
    abortRef.current?.abort();
    reset();
    onClose();
  }, [reset, onClose]);

  const handleSelectTemplate = useCallback(
    (template: (typeof PRESET_TEMPLATES)[0]) => {
      setSelectedTemplate(template.id);
      setCustomInstruction(template.prompt);
    },
    []
  );

  const handleSelectSuggestion = useCallback((suggestion: string) => {
    setCustomInstruction(suggestion);
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!customInstruction.trim()) {
      toast.error("Please enter instructions or select a template");
      return;
    }

    setStage("loading");
    setStatusIndex(0);
    setError("");
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/ai/build-page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: customInstruction,
          page: currentPage,
          template: selectedTemplate,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errorBlockData = await res.json().catch(() => ({}));
        throw new Error(
          errorBlockData.error || `Request failed with status ${res.status}`
        );
      }

      const result = await res.json();

      if (result.error) {
        throw new Error(result.error);
      }

      const data = result.data as BlockData;
      setGeneratedBlockData(data);
      setPreviewJson(JSON.stringify(data, null, 2));

      // Build block summary
      const content = (data as Record<string, unknown>)
        .content as Array<{ type: string }> | undefined;
      if (content && Array.isArray(content)) {
        setBlockSummary(content.map((b) => b.type));
      }

      setStage("preview");
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      const message =
        err instanceof Error ? err.message : "Failed to generate page";
      setError(message);
      setStage("error");
      toast.error(message);
    }
  }, [customInstruction, currentPage, selectedTemplate]);

  const handleApply = useCallback(() => {
    if (!generatedBlockData) return;
    onApply(generatedBlockData);
    toast.success("Page generated and applied!");
    handleClose();
  }, [generatedBlockData, onApply, handleClose]);

  const handleCopyJson = useCallback(() => {
    navigator.clipboard.writeText(previewJson);
    toast.success("JSON copied to clipboard");
  }, [previewJson]);

  const handleRegenerate = useCallback(() => {
    setGeneratedBlockData(null);
    setPreviewJson("");
    setBlockSummary([]);
    handleGenerate();
  }, [handleGenerate]);

  const handleBack = useCallback(() => {
    setStage("input");
    setGeneratedBlockData(null);
    setPreviewJson("");
    setError("");
    setBlockSummary([]);
  }, []);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent
        showCloseButton={stage !== "loading"}
        className="max-h-[90vh] overflow-hidden border-cpm-border bg-cpm-bg-primary p-0 sm:max-w-2xl"
      >
        {/* ── HEADER ── */}
        <div className="border-b border-cpm-border px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cpm-accent/10 ring-1 ring-cpm-accent/20">
              <Sparkles className="h-5 w-5 text-cpm-accent" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-cpm-text-primary">
                AI Page Builder
              </DialogTitle>
              <DialogDescription className="text-xs text-cpm-text-secondary">
                Generate a complete page with AI for{" "}
                <span className="capitalize text-cpm-accent">{currentPage}</span>
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div className="flex-1 overflow-y-auto">
          {/* === INPUT STAGE === */}
          {stage === "input" && (
            <div className="space-y-5 px-6 py-5">
              {/* Template cards */}
              <div>
                <p className="mb-3 text-xs font-medium uppercase tracking-wider text-cpm-text-tertiary">
                  Quick Templates
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {PRESET_TEMPLATES.map((template) => {
                    const Icon = template.icon;
                    const isSelected = selectedTemplate === template.id;
                    return (
                      <button
                        key={template.id}
                        onClick={() => handleSelectTemplate(template)}
                        className={`group flex flex-col items-start gap-2 rounded-xl border p-3 text-left transition-all duration-300 hover:-translate-y-0.5 ${
                          isSelected
                            ? "border-cpm-accent/40 bg-cpm-accent/5 ring-1 ring-cpm-accent/20"
                            : "border-cpm-border bg-cpm-bg-secondary hover:border-cpm-accent/20"
                        }`}
                      >
                        <Icon
                          className={`h-5 w-5 transition-colors duration-300 ${
                            isSelected
                              ? "text-cpm-accent"
                              : "text-cpm-text-tertiary group-hover:text-cpm-text-secondary"
                          }`}
                        />
                        <div>
                          <p
                            className={`text-xs font-medium transition-colors duration-300 ${
                              isSelected
                                ? "text-cpm-accent"
                                : "text-cpm-text-primary group-hover:text-cpm-accent"
                            }`}
                          >
                            {template.label}
                          </p>
                          <p className="mt-0.5 text-[10px] leading-tight text-cpm-text-tertiary">
                            {template.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* prompt-kit: Prompt Input with AI styling */}
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-cpm-text-tertiary">
                  Describe Your Page
                </p>
                <PromptInput
                  value={customInstruction}
                  onValueChange={setCustomInstruction}
                  onSubmit={handleGenerate}
                  maxHeight={180}
                  className="border-cpm-border bg-cpm-bg-secondary focus-within:ring-1 focus-within:ring-cpm-accent/20"
                >
                  <PromptInputTextarea
                    placeholder="Describe the page you want to build... e.g. 'A luxury property listing page with a hero, property gallery, amenities, and booking form'"
                    className="placeholder:text-cpm-text-tertiary"
                  />
                  <PromptInputActions className="px-2 pb-1.5">
                    <PromptInputAction tooltip="Generate with AI">
                      <Button
                        size="sm"
                        disabled={!customInstruction.trim()}
                        className="h-8 w-8 rounded-lg bg-cpm-accent p-0 text-cpm-bg-primary hover:bg-cpm-accent-hover disabled:opacity-40"
                      >
                        <Send className="h-3.5 w-3.5" />
                      </Button>
                    </PromptInputAction>
                  </PromptInputActions>
                </PromptInput>
              </div>

              {/* prompt-kit: Prompt Suggestions */}
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-cpm-text-tertiary">
                  Or Try a Suggestion
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_SUGGESTIONS.map((suggestion) => (
                    <PromptSuggestion
                      key={suggestion}
                      onClick={() => handleSelectSuggestion(suggestion)}
                      variant="outline"
                      size="sm"
                      className="border-cpm-border bg-cpm-bg-secondary text-cpm-text-secondary hover:border-cpm-accent/20 hover:text-cpm-accent hover:bg-cpm-accent/5 transition-all duration-200"
                    >
                      {suggestion}
                    </PromptSuggestion>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* === LOADING STAGE === */}
          {stage === "loading" && (
            <div className="flex flex-col items-center justify-center px-6 py-16">
              <BlurFade delay={0.1}>
                <div className="mb-8 flex flex-col items-center gap-4">
                  {/* prompt-kit: ShimmerLoader for premium loading text */}
                  <TextShimmerLoader
                    text="Generating your page"
                    size="lg"
                    className="text-cpm-text-primary"
                  />
                  <div className="mt-1">
                    <Loader variant="dots" size="md" className="text-cpm-accent" />
                  </div>
                </div>
              </BlurFade>
              <BlurFade delay={0.3}>
                <p className="text-xs text-cpm-text-secondary transition-all duration-500">
                  {STATUS_MESSAGES[statusIndex]}
                </p>
              </BlurFade>
              <BlurFade delay={0.5}>
                <button
                  onClick={() => {
                    abortRef.current?.abort();
                    handleBack();
                  }}
                  className="mt-6 flex items-center gap-1.5 rounded-lg border border-cpm-border px-4 py-2 text-xs text-cpm-text-tertiary transition-all hover:border-cpm-accent/20 hover:text-cpm-text-secondary"
                >
                  <X className="h-3.5 w-3.5" />
                  Cancel
                </button>
              </BlurFade>
            </div>
          )}

          {/* === PREVIEW STAGE === */}
          {stage === "preview" && generatedBlockData && (
            <div className="px-6 py-5">
              {/* Block summary */}
              {blockSummary.length > 0 && (
                <div className="mb-4">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-cpm-text-tertiary">
                    Generated Blocks
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {blockSummary.map((block, i) => (
                      <Badge
                        key={`${block}-${i}`}
                        className="rounded-md border-cpm-accent/20 bg-cpm-accent/5 text-[10px] text-cpm-accent"
                        variant="outline"
                      >
                        {block}
                        {i < blockSummary.length - 1 && (
                          <span className="ml-1 text-cpm-text-tertiary">→</span>
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview info */}
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-cpm-accent/10 bg-cpm-accent/5 px-4 py-3">
                <Eye className="h-4 w-4 shrink-0 text-cpm-accent" />
                <p className="text-xs text-cpm-text-secondary">
                  Preview generated content below. Click{" "}
                  <span className="font-medium text-cpm-accent">Apply</span> to
                  add it to the editor.
                </p>
              </div>

              {/* JSON Preview (collapsible) */}
              <details className="group">
                <summary className="flex cursor-pointer items-center gap-2 text-xs font-medium text-cpm-text-tertiary transition-colors hover:text-cpm-text-secondary">
                  <svg
                    className="h-3.5 w-3.5 transition-transform group-open:rotate-90"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                  View JSON BlockData
                </summary>
                <div className="mt-2">
                  <div className="flex items-center justify-between rounded-t-lg border border-b-0 border-cpm-border bg-cpm-bg-primary px-3 py-2">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-cpm-text-tertiary">
                      page-data.json
                    </span>
                    <button
                      onClick={handleCopyJson}
                      className="flex items-center gap-1 rounded px-2 py-1 text-[10px] text-cpm-text-secondary transition-colors hover:bg-cpm-bg-secondary hover:text-cpm-accent"
                    >
                      <Copy className="h-3 w-3" />
                      Copy
                    </button>
                  </div>
                  <pre className="max-h-48 overflow-auto rounded-b-lg border border-cpm-border bg-cpm-bg-primary p-3 text-[11px] leading-relaxed text-cpm-text-secondary">
                    {previewJson}
                  </pre>
                </div>
              </details>
            </div>
          )}

          {/* === ERROR STAGE === */}
          {stage === "error" && (
            <div className="flex flex-col items-center px-6 py-12">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 ring-1 ring-red-500/20">
                <X className="h-7 w-7 text-red-400" />
              </div>
              <p className="mb-1 text-sm font-medium text-cpm-text-primary">
                Generation Failed
              </p>
              <p className="mb-6 max-w-sm text-center text-xs text-cpm-text-secondary">
                {error}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleBack}
                  className="flex items-center gap-1.5 rounded-lg border border-cpm-border px-4 py-2 text-xs text-cpm-text-secondary transition-all hover:border-cpm-accent/20 hover:text-cpm-text-primary"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back
                </button>
                <button
                  onClick={handleRegenerate}
                  className="flex items-center gap-1.5 rounded-lg bg-cpm-accent px-4 py-2 text-xs font-semibold text-cpm-bg-primary transition-all hover:bg-cpm-accent-hover"
                >
                  <Wand2 className="h-3.5 w-3.5" />
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── FOOTER ── */}
        {(stage === "input" || stage === "preview") && (
          <div className="border-t border-cpm-border px-6 py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex gap-2">
                {stage === "preview" && (
                  <button
                    onClick={handleBack}
                    className="flex items-center gap-1.5 rounded-lg border border-cpm-border px-3 py-2 text-xs text-cpm-text-secondary transition-all hover:border-cpm-accent/20 hover:text-cpm-text-primary"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back
                  </button>
                )}
                <button
                  onClick={handleClose}
                  className="flex items-center gap-1.5 rounded-lg border border-cpm-border px-3 py-2 text-xs text-cpm-text-secondary transition-all hover:border-cpm-accent/20 hover:text-cpm-text-primary"
                >
                  Cancel
                </button>
              </div>
              <div className="flex gap-2">
                {stage === "input" && (
                  <Button
                    onClick={handleGenerate}
                    disabled={!customInstruction.trim()}
                    className="gap-1.5 rounded-lg bg-cpm-accent px-4 py-2 text-xs font-semibold text-cpm-bg-primary hover:bg-cpm-accent-hover disabled:opacity-40 disabled:cursor-not-allowed"
                    size="sm"
                  >
                    <Wand2 className="h-3.5 w-3.5" />
                    Generate
                  </Button>
                )}
                {stage === "preview" && (
                  <>
                    <button
                      onClick={handleRegenerate}
                      className="flex items-center gap-1.5 rounded-lg border border-cpm-border px-3 py-2 text-xs text-cpm-text-secondary transition-all hover:border-cpm-accent/20 hover:text-cpm-text-primary"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Regenerate
                    </button>
                    <Button
                      onClick={handleApply}
                      className="gap-1.5 rounded-lg bg-cpm-accent px-4 py-2 text-xs font-semibold text-cpm-bg-primary hover:bg-cpm-accent-hover"
                      size="sm"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Apply
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
