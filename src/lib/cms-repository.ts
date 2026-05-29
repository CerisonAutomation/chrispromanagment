// CMS Repository — CQRS. All methods return Result<T,E>. No throws into UI.
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { ok, err } from "./cms-types";
import type { Result, CmsRow, CmsVersion, SaveResult } from "./cms-types";
import { invalidateCmsCache } from "@/hooks/use-cms-content";

// ─── QUERIES ──────────────────────────────────────────────────────────────────

export const CmsQueryRepository = {
  async fetchAllRows(): Promise<Result<CmsRow[]>> {
    const { data, error } = await supabase
      .from("cms_content")
      .select("*")
      .order("sort_order");
    if (error) return err(error.message);
    return ok((data ?? []) as CmsRow[]);
  },

  async fetchVersions(limit = 20): Promise<Result<CmsVersion[]>> {
    const { data, error } = await supabase
      .from("cms_versions")
      .select("id, label, note, status, created_at, created_by, content_count, snapshot")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) return err(error.message);
    return ok((data ?? []) as CmsVersion[]);
  },

  async fetchVersion(id: string): Promise<Result<CmsVersion>> {
    const { data, error } = await supabase
      .from("cms_versions")
      .select("*")
      .eq("id", id)
      .single();
    if (error) return err(error.message);
    if (!data) return err("Version not found");
    return ok(data as CmsVersion);
  },
};

// ─── COMMANDS — parallel batch save ───────────────────────────────────────────

export const CmsCommandRepository = {
  async saveRow(
    id: string,
    patch: { content: Record<string, unknown>; is_visible: boolean; section_label: string }
  ): Promise<Result<SaveResult>> {
    const { data, error } = await supabase
      .from("cms_content")
      .update({ ...patch, content: patch.content as Json })
      .eq("id", id)
      .select("section_key, updated_at")
      .single();
    if (error) return err(error.message);
    invalidateCmsCache();
    return ok(data as SaveResult);
  },

  // Parallel upserts — was O(n) sequential, now O(1) concurrent
  async saveAllRows(
    rows: Pick<CmsRow, "id" | "content" | "is_visible" | "section_label">[]
  ): Promise<Result<number>> {
    const results = await Promise.allSettled(
      rows.map((row) =>
        supabase
          .from("cms_content")
          .update({ content: row.content as Json, is_visible: row.is_visible, section_label: row.section_label })
          .eq("id", row.id)
      )
    );
    const failed = results
      .filter((r): r is PromiseRejectedResult => r.status === "rejected")
      .map((r) => String(r.reason));
    if (failed.length > 0) return err(`${failed.length} row(s) failed: ${failed[0]}`);
    invalidateCmsCache();
    return ok(rows.length);
  },

  async createSnapshot(
    label: string,
    note: string,
    userId: string | undefined
  ): Promise<Result<string>> {
    const rowsResult = await CmsQueryRepository.fetchAllRows();
    if (!rowsResult.ok) return err(rowsResult.error);

    const snapshot: Record<string, unknown> = {};
    rowsResult.data.forEach((r) => {
      snapshot[r.section_key] = { content: r.content, is_visible: r.is_visible, section_label: r.section_label };
    });

    const { data, error } = await supabase
      .from("cms_versions")
      .insert({
        label:         label.trim() || `Snapshot ${new Date().toLocaleString()}`,
        note:          note.trim() || null,
        snapshot:      snapshot as Json,
        content_count: rowsResult.data.length,
        image_count:   0,
        setting_count: 0,
        status:        "draft",
        created_by:    userId ?? null,
      })
      .select("id")
      .single();

    if (error) return err(error.message);
    return ok((data as { id: string }).id);
  },

  async restoreSnapshot(versionId: string): Promise<Result<number>> {
    const vResult = await CmsQueryRepository.fetchVersion(versionId);
    if (!vResult.ok) return err(vResult.error);

    type SnapEntry = { content: Record<string, unknown>; is_visible: boolean; section_label: string };
    const snapshot = vResult.data.snapshot as Record<string, SnapEntry>;

    const results = await Promise.allSettled(
      Object.entries(snapshot).map(([sectionKey, v]) =>
        supabase
          .from("cms_content")
          .update({ content: v.content, is_visible: v.is_visible, section_label: v.section_label })
          .eq("section_key", sectionKey)
      )
    );

    const restored = results.filter((r) => r.status === "fulfilled").length;
    invalidateCmsCache();
    return ok(restored);
  },

  async aiEnhanceField(
    sectionKey: string,
    fieldKey: string,
    currentValue: string,
    instruction: string
  ): Promise<Result<string>> {
    const { data, error } = await supabase.functions.invoke("cms-ai-enhance", {
      body: { section_key: sectionKey, field_key: fieldKey, current_value: currentValue, instruction },
    });
    if (error) return err(error.message);
    const suggestion = (data as { suggestion?: string })?.suggestion;
    if (!suggestion) return err("No suggestion returned from AI");
    return ok(suggestion);
  },
};
