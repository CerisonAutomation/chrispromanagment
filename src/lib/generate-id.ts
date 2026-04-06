/**
 * ID Generator - Generate unique IDs for components and history entries
 */

let counter = 0;

const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

/**
 * Generate a unique ID
 */
export function generateId(prefix?: string): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Array.from({ length: 8 })
    .map(() => chars[Math.floor(Math.random() * chars.length)])
    .join("");
  const counterPart = (++counter).toString(36);
  
  return prefix
    ? `${prefix}_${timestamp}${randomPart}${counterPart}`
    : `${timestamp}${randomPart}${counterPart}`;
}

/**
 * Generate a short ID (for display purposes)
 */
export function generateShortId(): string {
  return Array.from({ length: 6 })
    .map(() => chars[Math.floor(Math.random() * chars.length)])
    .join("");
}

export default generateId;
