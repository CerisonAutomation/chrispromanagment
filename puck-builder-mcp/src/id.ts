/**
 * @fileoverview Generate a stable Puck component ID matching the demo format.
 * Format: `${Type}-${timestamp}-${random}`
 */
export function generatePuckId(type: string): string {
  return `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
