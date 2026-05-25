import { describe, it, expect } from "vitest";
import * as themeTokens from "../themeTokens.js";

describe("themeTokens", () => {
  it("exports a non-empty module surface", () => {
    expect(themeTokens).toBeDefined();
    expect(typeof themeTokens).toBe("object");
  });
});
