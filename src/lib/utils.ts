/**
 * @fileoverview Shared utilities — canonical, tree-shakeable.
 */
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** shadcn/ui canonical class merger */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Slugify a string to URL-safe format */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Format currency */
export function formatCurrency(amount: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('en-MT', { style: 'currency', currency }).format(amount);
}

/** Format date range for display */
export function formatDateRange(from: string, to: string): string {
  const f = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  return `${f.format(new Date(from))} – ${f.format(new Date(to))}`;
}

/** Safe JSON parse — returns fallback on error */
export function safeJson<T>(raw: string, fallback: T): T {
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}

/** Ensure data is always an array — prevents .map() crashes */
export function toArray<T>(val: T | T[] | null | undefined): T[] {
  if (Array.isArray(val)) return val;
  if (val == null) return [];
  return [val];
}

/** Clamp a number between min and max */
export function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}

/** Debounce a function */
export function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: unknown[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  }) as T;
}
