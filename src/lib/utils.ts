/**
 * @fileoverview Pure utility library — browser-safe, zero dependencies beyond clsx/tailwind-merge.
 * @module utils
 */
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes safely — handles conflicts, conditionals. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** URL-safe slug from any string. */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Format a number as currency (default: EUR). */
export function formatCurrency(
  amount: number,
  currency = 'EUR',
  locale = 'en-MT'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Format a date range as readable string, e.g. "Apr 7 – Apr 14, 2026". */
export function formatDateRange(from: Date | string, to: Date | string, locale = 'en-MT'): string {
  const df = new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' });
  const fromD = typeof from === 'string' ? new Date(from) : from;
  const toD = typeof to === 'string' ? new Date(to) : to;
  const year = toD.getFullYear();
  return `${df.format(fromD)} – ${df.format(toD)}, ${year}`;
}

/** Format bytes into human-readable string (KB/MB/GB). */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

/** Parse JSON safely — returns fallback on error. */
export function safeJson<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** Wrap a value in an array if it isn't already. */
export function toArray<T>(val: T | T[]): T[] {
  return Array.isArray(val) ? val : [val];
}

/** Clamp a number between min and max. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Debounce a function — returns a new fn that delays invocation by `wait` ms. */
export function debounce<T extends (...args: unknown[]) => void>(fn: T, wait = 300): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  }) as T;
}

/** Throttle a function — fires at most once per `ms` ms. */
export function throttle<T extends (...args: unknown[]) => void>(fn: T, ms = 200): T {
  let last = 0;
  return ((...args: Parameters<T>) => {
    const now = Date.now();
    if (now - last >= ms) {
      last = now;
      fn(...args);
    }
  }) as T;
}

/** Generate a prefixed random ID. */
export function generateId(prefix = 'id'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 11)}_${Date.now().toString(36)}`;
}

/** Deep equality check — structural comparison with cycle safety. */
export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || b === null) return false;
  if (typeof a !== 'object' || typeof b !== 'object') return false;
  const aKeys = Object.keys(a as object);
  const bKeys = Object.keys(b as object);
  if (aKeys.length !== bKeys.length) return false;
  return aKeys.every((key) =>
    deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])
  );
}
