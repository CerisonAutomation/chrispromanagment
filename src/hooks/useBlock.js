// ============================================================
// useBlock — single hook surface for schema-aware content access.
// Reads CMS overrides, falls back to block registry defaults,
// merges deeply, and validates with Zod.
//
// Usage:
//   const { content, def } = useBlock("header");                // schema defaults + cms.header override
//   const nav = useBlockField("header", "navItems", []);        // single field with fallback
//   const subjects = useEditableList("contactModal", "subjects");
// ============================================================
import { useMemo } from "react";
import { useCMS } from "@/context/CMSContext";
import { getBlock, migrateContent } from "@/lib/blockRegistry";

function deepMerge(base, override) {
  if (override == null) return base;
  if (Array.isArray(override)) return override; // arrays replace, not merge
  if (typeof override !== "object" || typeof base !== "object" || base == null) return override;
  const out = { ...base };
  for (const k of Object.keys(override)) {
    out[k] = deepMerge(base[k], override[k]);
  }
  return out;
}

/** Read a block's content merged from registry defaults + cms[typeId] override. */
export function useBlock(typeId) {
  const { cms } = useCMS();
  return useMemo(() => {
    const def = getBlock(typeId);
    const defaults = def ? def.defaults() : {};
    const override = cms?.[typeId] ?? cms?.blocks?.[typeId];
    const migrated = migrateContent(typeId, override);
    const content = deepMerge(defaults, migrated || {});
    let validation = { success: true, data: content };
    try { validation = def ? def.validate(content) : validation; } catch { /* tolerate */ }
    return {
      def,
      content,
      defaults,
      override: migrated || null,
      valid: validation.success !== false,
    };
  }, [cms, typeId]);
}

/** Read a single field with explicit fallback. */
export function useBlockField(typeId, fieldPath, fallback) {
  const { content } = useBlock(typeId);
  return useMemo(() => {
    const keys = String(fieldPath).split(".");
    let cur = content;
    for (const k of keys) {
      if (cur == null) return fallback;
      cur = cur[k];
    }
    return cur === undefined || cur === null ? fallback : cur;
  }, [content, fieldPath, fallback]);
}

/** Read an editable array (e.g. nav items, columns) with a guaranteed array result. */
export function useEditableList(typeId, fieldPath, fallback = []) {
  const v = useBlockField(typeId, fieldPath, fallback);
  return Array.isArray(v) ? v : fallback;
}

/** Convenience: full AI metadata for a block type. */
export function useBlockAI(typeId) {
  const def = getBlock(typeId);
  return def?.ai || null;
}

export default useBlock;
