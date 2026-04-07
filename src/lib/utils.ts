/**
 * @fileoverview Shared utility functions — canonical, tree-shakeable.
 * All helpers are pure functions with no side-effects.
 */
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** shadcn/ui canonical class merger */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Slugify a string to URL-safe lowercase-hyphenated format */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Format a number as a locale currency string (defaults to EUR / Malta locale) */
export function formatCurrency(amount: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('en-MT', { style: 'currency', currency }).format(amount);
}

/** Format a date range for human display: "1 Jan 2025 – 7 Jan 2025" */
export function formatDateRange(from: string, to: string): string {
  const fmt = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  return `${fmt.format(new Date(from))} – ${fmt.format(new Date(to))}`;
}

/** Safely parse JSON, returning `fallback` on any error */
export function safeJson<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** Ensure `val` is always returned as an array — prevents `.map()` crashes */
export function toArray<T>(val: T | T[] | null | undefined): T[] {
  if (Array.isArray(val)) return val;
  if (val == null) return [];
  return [val];
}

/** Clamp `n` between `min` and `max` (inclusive) */
export function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}

/**
 * Debounce: returns a function that delays invoking `fn` until `ms` ms
 * after the last invocation.
 */
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  ms: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

/**
 * Throttle: returns a function that invokes `fn` at most once per `ms` ms.
 */
export function throttle<T extends (...args: unknown[]) => void>(
  fn: T,
  ms: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= ms) {
      lastCall = now;
      fn(...args);
    }
  };
}

/**
 * Format bytes into a human-readable string: "1.23 MB"
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = Math.max(0, decimals);
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Generate a collision-resistant client-side ID.
 * Prefers `crypto.randomUUID()` when available (all modern browsers + Node 19+).
 */
export function generateId(prefix = 'id'): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Deep-equal check using JSON serialization.
 * Suitable for small/medium objects — do not use on circular structures.
 */
export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
}
