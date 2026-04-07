/**
 * @fileoverview Puck-compatible ID generation.
 * Format: `${Type}-${epoch_ms}-${random5}`
 */
export function generatePuckId(type: string): string {
  return `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function isValidPuckId(id: string): boolean {
  return /^[A-Za-z]+-\d{13}-[a-z0-9]{5}$/.test(id);
}
