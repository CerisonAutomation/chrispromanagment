// =============================================================================
// CONSOLIDATED TYPES - Single Source of Truth (15/10 Quality)
// =============================================================================
// This file consolidates all type definitions across the codebase.
// Import from here instead of分散 sources.

// ============================================================================
// BRANDED TYPES - Type-safe IDs
// ============================================================================
declare const __brand: unique symbol;
type Brand<B> = { [__brand]: B };
export type Branded<T, B> = T & Brand<B>;

export type BlockId = Branded<string, 'BlockId'>;
export type PageId = Branded<string, 'PageId'>;
export type UserId = Branded<string, 'UserId'>;
export type ThemeId = Branded<string, 'ThemeId'>;
export type Timestamp = Branded<number, 'Timestamp'>;

export function createBlockId(): BlockId { return crypto.randomUUID() as BlockId; }
export function createPageId(): PageId { return crypto.randomUUID() as PageId; }
export function createTimestamp(): Timestamp { return Date.now() as Timestamp; }

// ============================================================================
// RESULT TYPE - Railway-oriented programming
// ============================================================================
export type Result<T, E = Error> = 
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: E };

export function ok<T>(data: T): Result<T, never> { return { success: true, data } as const; }
export function err<E>(error: E): Result<never, E> { return { success: false, error } as const; }

// ============================================================================
// OPTION TYPE - Null safety
// ============================================================================
export type Option<T> = Some<T> | None;
export type Some<T> = { readonly type: 'some'; readonly value: T };
export type None = { readonly type: 'none' };

export const some = <T>(value: T): Some<T> => ({ type: 'some', value });
export const none: None = { type: 'none' };

export function isSome<T>(opt: Option<T>): opt is Some<T> { return opt.type === 'some'; }
export function isNone<T>(opt: Option<T>): opt is None { return opt.type === 'none'; }
export function fromNullable<T>(val: T | null | undefined): Option<T> {
  return val == null ? none : some(val);
}

// ============================================================================
// PUCK CMS TYPES
// ============================================================================
export type DeviceMode = 'desktop' | 'tablet' | 'mobile';
export type SidebarPanel = 'blocks' | 'pages' | 'layers' | 'ai';
export type RightPanel = 'properties' | 'layers' | 'versions';
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

export interface HistoryEntry {
  content: any;
  selectedBlockId: string | null;
  timestamp: number;
}

// ============================================================================
// DOMAIN ENTITIES
// ============================================================================
export interface Block {
  id: BlockId;
  type: string;
  props: Record<string, any>;
  zones?: Record<string, Block[]>;
}

export interface Page {
  id: PageId;
  slug: string;
  title: string;
  data: PuckData;
  status: 'draft' | 'published' | 'archived';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface PuckData {
  content: any[];
  root: { props: Record<string, any> };
}

// ============================================================================
// API TYPES
// ============================================================================
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

// ============================================================================
// Re-export commonly used types
// ============================================================================
export * from './supabase';
export * from './guesty';
export * from './db';
export * from './cms';
export * from './puck';
