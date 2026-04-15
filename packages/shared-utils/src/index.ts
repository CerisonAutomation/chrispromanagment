// ============================================================
// @cpm/shared-utils — Shared utility functions for CPM Monorepo
// ============================================================

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ---- Tailwind class merging ----

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ---- Date utilities ----

export function formatDate(date: string | Date, locale = 'en-MT'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
}

export function formatDateShort(date: string | Date, locale = 'en-MT'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
}

export function getNights(checkIn: string | Date, checkOut: string | Date): number {
  const inDate = typeof checkIn === 'string' ? new Date(checkIn) : checkIn;
  const outDate = typeof checkOut === 'string' ? new Date(checkOut) : checkOut;
  const diff = outDate.getTime() - inDate.getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

export function isDateInRange(date: Date, start: Date, end: Date): boolean {
  return date >= start && date <= end;
}

// ---- Currency utilities ----

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

// ---- String utilities ----

export function slugify(str: string): string {
  if (str.length > 500) str = str.slice(0, 500);
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '');
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength).trimEnd()}…`;
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ---- URL utilities ----

export function buildUrl(base: string, params: Record<string, string | number | boolean | undefined>): string {
  const url = new URL(base, 'https://placeholder.invalid');
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  }
  return url.pathname + (url.search ? url.search : '');
}

// ---- Array utilities ----

export function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
  return arr.reduce<Record<string, T[]>>((acc, item) => {
    const groupKey = String(item[key]);
    if (!acc[groupKey]) acc[groupKey] = [];
    acc[groupKey].push(item);
    return acc;
  }, {});
}

export function uniqueBy<T>(arr: T[], key: keyof T): T[] {
  const seen = new Set<unknown>();
  return arr.filter((item) => {
    const val = item[key];
    if (seen.has(val)) return false;
    seen.add(val);
    return true;
  });
}

// ---- Validation utilities ----

export function isValidEmail(email: string): boolean {
  if (email.length > 254) return false;
  const atIndex = email.indexOf('@');
  if (atIndex < 1) return false;
  const local = email.slice(0, atIndex);
  const domain = email.slice(atIndex + 1);
  if (local.length > 64 || domain.length < 3) return false;
  return /^[^@\s]+$/.test(local) && /^[^@\s]+\.[^@\s]+$/.test(domain);
}

export function isValidPhone(phone: string): boolean {
  return /^\+?[\d\s\-().]{7,20}$/.test(phone);
}
