/**
 * @fileoverview Typed error classes for structured error handling.
 * Every thrown error has a code, message, and optional context.
 */

export type ErrorCode =
  | "PAGE_NOT_FOUND"
  | "BLOCK_TYPE_INVALID"
  | "VALIDATION_FAILED"
  | "PRESET_NOT_FOUND"
  | "INDEX_OUT_OF_RANGE"
  | "CLONE_SOURCE_NOT_FOUND"
  | "IMPORT_PARSE_ERROR"
  | "STORE_WRITE_ERROR"
  | "UNKNOWN";

export class PuckMcpError extends Error {
  readonly code: ErrorCode;
  readonly context?: Record<string, unknown>;

  constructor(code: ErrorCode, message: string, context?: Record<string, unknown>) {
    super(message);
    this.name = "PuckMcpError";
    this.code = code;
    this.context = context;
  }

  toJSON() {
    return { error: true, code: this.code, message: this.message, context: this.context };
  }
}

export function mcpError(code: ErrorCode, message: string, context?: Record<string, unknown>) {
  return new PuckMcpError(code, message, context);
}

export function formatToolError(err: unknown): string {
  if (err instanceof PuckMcpError) return JSON.stringify(err.toJSON(), null, 2);
  if (err instanceof Error) return JSON.stringify({ error: true, code: "UNKNOWN", message: err.message }, null, 2);
  return JSON.stringify({ error: true, code: "UNKNOWN", message: String(err) }, null, 2);
}
