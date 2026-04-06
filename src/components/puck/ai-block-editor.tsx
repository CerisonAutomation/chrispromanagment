"use client";

import React, {useCallback, useEffect, useRef, useState} from "react";
import {toast} from "sonner";
import {
  Briefcase,
  Check,
  FileText,
  Languages,
  Loader2,
  Minimize2,
  PenTool,
  RotateCcw,
  Sparkles,
  Wand2,
} from "lucide-react";
import {Dialog, DialogContent, DialogDescription, DialogTitle,} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {PromptInput, PromptInputAction, PromptInputActions, PromptInputTextarea,} from "@/components/ui/prompt-input";
import {Loader,} from "@/components/ui/loader";

// ============================================================
// TYPES & CONSTANTS
// ============================================================
interface AiBlockEditorProps {
  open: boolean;
  onClose: () => void;
  blockType: string;
  currentProps: Record<string, unknown>;
  onApply: (newProps: Record<string, unknown>) => void;
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  instruction: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "improve",
    label: "Improve this section",
    icon: PenTool,
    instruction: "Improve the content and copy of this section. Make it more compelling, engaging, and polished while keeping the same structure.",
  },
  {
    id: "professional",
    label: "Make it more professional",
    icon: Briefcase,
    instruction: "Rewrite the content in a more professional, formal tone suitable for a luxury property management company.",
  },
  {
    id: "detail",
    label: "Add more detail",
    icon: FileText,
    instruction: "Expand the content with more specific details, richer descriptions, and additional supporting information.",
  },
  {
    id: "simplify",
    label: "Simplify it",
    icon: Minimize2,
    instruction: "Simplify the content. Make it more concise, scannable, and easy to read. Remove unnecessary words.",
  },
  {
    id: "maltese",
    label: "Translate to Maltese",
    icon: Languages,
    instruction: "Translate all text content to Maltese (Malti). Keep the same structure and meaning.",
  },
];

// ============================================================
// COMPONENT
// ============================================================
export default function AiBlockEditor({
  open,
  onClose,
  blockType,
  currentProps,
  onApply,
}: AiBlockEditorProps) {
  const [instruction, setInstruction] = useState("");
  const [loadingActionId, setLoadingActionId] = useState<string | null>(null);
  const [completedActionId, setCompletedActionId] = useState<string | null>(null);
  const [errorActionId, setErrorActionId] = useState<string | null>(null);
  const [customLoading, setCustomLoading] = useState(false);
  const [generatedProps, setGeneratedProps] = useState<Record<string, unknown> | null>(null);
  const [previousProps, setPreviousProps] = useState<Record<string, unknown> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  // Reset state when block changes
  useEffect(() => {
    setInstruction("");
    setLoadingActionId(null);
    setCompletedActionId(null);
    setErrorActionId(null);
    setCustomLoading(false);
    setGeneratedProps(null);
    setPreviousProps(null);
  }, [blockType]);

  const handleClose = useCallback(() => {
    abortRef.current?.abort();
    onClose();
  }, [onClose]);

  const handleEdit = useCallback(
    async (actionId: string, editInstruction: string) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      if (actionId === "custom") {
        setCustomLoading(true);
      } else {
        setLoadingActionId(actionId);
      }
      setErrorActionId(null);
      setCompletedActionId(null);

      try {
        const res = await fetch("/api/ai/edit-block", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            blockType,
            currentProps,
            instruction: editInstruction,
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

        const newProps = result.props as Record<string, unknown>;

        if (actionId === "custom") {
          setGeneratedProps(newProps);
          setCustomLoading(false);
        } else {
          setPreviousProps({ ...currentProps });
          onApply(newProps);
          setLoadingActionId(null);
          setCompletedActionId(actionId);

          setTimeout(() => {
            setCompletedActionId(null);
          }, 2000);
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        const message = err instanceof Error ? err.message : "Failed to edit block";

        if (actionId === "custom") {
          setCustomLoading(false);
          toast.error(message);
        } else {
          setLoadingActionId(null);
          setErrorActionId(actionId);
          toast.error(message);
        }
      }
    },
    [blockType, currentProps, onApply]
  );

  const handleApplyCustom = useCallback(() => {
    if (!generatedProps) return;
    setPreviousProps({ ...currentProps });
    onApply(generatedProps);
    setGeneratedProps(null);
    setInstruction("");
    toast.success("Changes applied!");
  }, [generatedProps, currentProps, onApply]);

  const handleRevert = useCallback(() => {
    if (!previousProps) return;
    onApply(previousProps);
    setPreviousProps(null);
    setCompletedActionId(null);
    toast.success("Reverted to previous version");
  }, [previousProps, onApply]);

  const handleRetry = useCallback(
    (actionId: string, inst: string) => {
      setErrorActionId(null);
      handleEdit(actionId, inst);
    },
    [handleEdit]
  );

  const formatBlockType = (type: string) =>
    type.replace(/([A-Z])/g, " $1").trim();

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent
        showCloseButton
        className="max-h-[85vh] overflow-hidden border-cpm-border bg-cpm-bg-primary p-0 sm:max-w-lg"
      >
        {/* ── HEADER ── */}
        <div className="border-b border-cpm-border px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cpm-accent/10 ring-1 ring-cpm-accent/20">
              <Sparkles className="h-4.5 w-4.5 text-cpm-accent" />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="truncate text-sm font-semibold text-cpm-text-primary">
                AI Block Editor
              </DialogTitle>
              <DialogDescription className="text-xs text-cpm-text-secondary">
                Editing{" "}
                <Badge
                  variant="outline"
                  className="border-cpm-accent/20 bg-cpm-accent/5 text-[10px] text-cpm-accent"
                >
                  {formatBlockType(blockType)}
                </Badge>
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-5 px-6 py-5">
            {/* Quick Actions */}
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-cpm-text-tertiary">
                Quick Actions
              </p>
              <div className="space-y-1.5">
                {QUICK_ACTIONS.map((action) => {
                  const Icon = action.icon;
                  const isLoading = loadingActionId === action.id;
                  const isCompleted = completedActionId === action.id;
                  const isError = errorActionId === action.id;

                  return (
                    <button
                      key={action.id}
                      onClick={() => {
                        if (isError) {
                          handleRetry(action.id, action.instruction);
                        } else {
                          handleEdit(action.id, action.instruction);
                        }
                      }}
                      disabled={isLoading}
                      className={`group flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-300 ${
                        isLoading
                          ? "border-cpm-accent/20 bg-cpm-accent/5"
                          : isCompleted
                            ? "border-emerald-500/20 bg-emerald-500/5"
                            : isError
                              ? "border-red-500/20 bg-red-500/5"
                              : "border-cpm-border bg-cpm-bg-secondary hover:border-cpm-accent/20 hover:bg-cpm-accent/5"
                      }`}
                    >
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-300 ${
                          isLoading
                            ? "bg-cpm-accent/10"
                            : isCompleted
                              ? "bg-emerald-500/10"
                              : isError
                                ? "bg-red-500/10"
                                : "bg-cpm-bg-secondary group-hover:bg-cpm-accent/10"
                        }`}
                      >
                        {isLoading ? (
                          <Loader variant="dots" size="sm" className="text-cpm-accent" />
                        ) : isCompleted ? (
                          <Check className="h-4 w-4 text-emerald-400" />
                        ) : isError ? (
                          <RotateCcw className="h-4 w-4 text-red-400" />
                        ) : (
                          <Icon
                            className={`h-4 w-4 text-cpm-text-tertiary transition-colors duration-300 group-hover:text-cpm-accent`}
                          />
                        )}
                      </div>
                      <span
                        className={`flex-1 text-xs font-medium transition-colors duration-300 ${
                          isLoading
                            ? "text-cpm-accent"
                            : isCompleted
                              ? "text-emerald-400"
                              : isError
                                ? "text-red-400"
                                : "text-cpm-text-primary group-hover:text-cpm-accent"
                        }`}
                      >
                        {isCompleted
                          ? "Updated!"
                          : isError
                            ? "Retry"
                            : action.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-cpm-border" />
              <span className="text-[10px] uppercase tracking-wider text-cpm-text-tertiary">
                Or
              </span>
              <div className="h-px flex-1 bg-cpm-border" />
            </div>

            {/* prompt-kit: Prompt Input for custom instruction */}
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-cpm-text-tertiary">
                Custom Edit Instruction
              </p>
              <PromptInput
                value={instruction}
                onValueChange={setInstruction}
                onSubmit={() => handleEdit("custom", instruction)}
                maxHeight={120}
                className="border-cpm-border bg-cpm-bg-secondary focus-within:ring-1 focus-within:ring-cpm-accent/20"
              >
                <PromptInputTextarea
                  placeholder="e.g. 'Change the heading to be more inviting' or 'Add information about our airport transfer service'"
                  className="placeholder:text-cpm-text-tertiary"
                />
                <PromptInputActions className="px-2 pb-1.5">
                  <PromptInputAction tooltip="Edit with AI">
                    <Button
                      size="sm"
                      disabled={!instruction.trim() || customLoading}
                      className="h-8 w-8 rounded-lg bg-cpm-accent p-0 text-cpm-bg-primary hover:bg-cpm-accent-hover disabled:opacity-40"
                    >
                      {customLoading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Wand2 className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </PromptInputAction>
                </PromptInputActions>
              </PromptInput>
            </div>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div className="border-t border-cpm-border px-6 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex gap-2">
              {previousProps && (
                <button
                  onClick={handleRevert}
                  className="flex items-center gap-1.5 rounded-lg border border-cpm-border px-3 py-2 text-xs text-cpm-text-secondary transition-all hover:border-cpm-accent/20 hover:text-cpm-text-primary"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Revert
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
              {generatedProps && (
                <button
                  onClick={() => {
                    setGeneratedProps(null);
                    setInstruction("");
                  }}
                  className="flex items-center gap-1.5 rounded-lg border border-cpm-border px-3 py-2 text-xs text-cpm-text-secondary transition-all hover:border-cpm-accent/20 hover:text-cpm-text-primary"
                >
                  Discard
                </button>
              )}
              {generatedProps ? (
                <Button
                  onClick={handleApplyCustom}
                  className="gap-1.5 rounded-lg bg-cpm-accent px-4 py-2 text-xs font-semibold text-cpm-bg-primary hover:bg-cpm-accent-hover"
                  size="sm"
                >
                  <Check className="h-3.5 w-3.5" />
                  Apply Changes
                </Button>
              ) : (
                <Button
                  onClick={() => handleEdit("custom", instruction)}
                  disabled={!instruction.trim() || customLoading}
                  className="gap-1.5 rounded-lg bg-cpm-accent px-4 py-2 text-xs font-semibold text-cpm-bg-primary hover:bg-cpm-accent-hover disabled:opacity-40 disabled:cursor-not-allowed"
                  size="sm"
                >
                  {customLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Wand2 className="h-3.5 w-3.5" />
                  )}
                  {customLoading ? "Generating..." : "Edit Block"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
