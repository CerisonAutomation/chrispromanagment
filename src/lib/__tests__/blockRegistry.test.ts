import { describe, it, expect } from "vitest";
// @ts-ignore - JS module
import { getBlock, listBlocks, registerBlock, categories, migrateContent } from "../blockRegistry.js";

describe("blockRegistry", () => {
  it("registers and retrieves a block by stable type ID", () => {
    const hero = getBlock("hero");
    expect(hero).toBeTruthy();
    expect(hero?.type).toBe("hero");
    expect(typeof hero?.defaults).toBe("function");
  });

  it("rejects duplicate type IDs", () => {
    expect(() => registerBlock("hero", { label: "Dupe", fields: {}, defaults: {} })).toThrow();
  });

  it("validates content against schema (good payload)", () => {
    const features = getBlock("features");
    const result = features?.validate(features.defaults());
    expect(result?.success).toBe(true);
  });

  it("validates content against schema (rejects wrong type on a known string field)", () => {
    const hero = getBlock("hero");
    // Find any text-typed field on hero and pass a number for it
    const textField = Object.entries(hero?.editorFields || {}).find(
      ([, f]: [string, any]) => f?.type === "text" || f?.type === "textarea",
    );
    expect(textField).toBeTruthy();
    const [key] = textField;
    const result = hero?.validate({ ...hero.defaults(), [key]: 123 });
    expect(result?.success).toBe(false);
  });

  it("defaults() produces schema-valid content for every registered block", () => {
    for (const b of listBlocks()) {
      const result = b.validate(b.defaults());
      expect(result.success, `defaults for ${b.type} failed: ${JSON.stringify(result.error?.flatten())}`).toBe(true);
    }
  });

  it("listBlocks filters by category", () => {
    const heroBlocks = listBlocks({ category: "hero" });
    expect(heroBlocks.length).toBeGreaterThan(0);
    expect(heroBlocks.every((b) => b.category === "hero")).toBe(true);
  });

  it("listBlocks filters by canSuggest", () => {
    const suggestable = listBlocks({ canSuggest: true });
    const notSuggestable = listBlocks({ canSuggest: false });
    expect(suggestable.length).toBeGreaterThan(0);
    expect(notSuggestable.length).toBeGreaterThan(0);
    expect(suggestable.every((b) => b.ai.canSuggest === true)).toBe(true);
  });

  it("exposes categories list", () => {
    const cats = categories();
    expect(cats).toContain("hero");
    expect(cats).toContain("booking");
    expect(cats).toContain("media");
  });

  it("migrateContent is a passthrough by default and never throws", () => {
    const out = migrateContent("hero", { heading: "x" });
    expect(out).toEqual({ heading: "x" });
    expect(migrateContent("nonexistent", { foo: 1 })).toEqual({ foo: 1 });
  });

  it("every block carries AI capability metadata", () => {
    for (const b of listBlocks()) {
      expect(Array.isArray(b.ai.useCases)).toBe(true);
      expect(Array.isArray(b.ai.suggestedModels)).toBe(true);
      expect(typeof b.ai.canSuggest).toBe("boolean");
    }
  });
});
