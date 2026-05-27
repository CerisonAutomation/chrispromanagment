// =============================================================================
// CONSOLIDATED TYPES - Single Source of Truth (15/10 Quality)
// =============================================================================
// This file consolidates ALL type definitions across the codebase.
// Import from here instead of dispersed sources.

// ============================================================================
// BRANDED TYPES - Type-safe IDs
// ============================================================================
export declare const __brand: unique symbol;
type Brand<B> = { [__brand]: B };
export type Branded<T, B> = T & Brand<B>;

export type BlockId = Branded<string, 'BlockId'>;
export type PageId = Branded<string, 'PageId'>;
export type UserId = Branded<string, 'UserId'>;
export type ListingId = Branded<string, 'ListingId'>;
export type ReservationId = Branded<string, 'ReservationId'>;
export type ThemeId = Branded<string, 'ThemeId'>;
export type Timestamp = Branded<number, 'Timestamp'>;
export type Email = Branded<string, 'Email'>;
export type Slug = Branded<string, 'Slug'>;

export function createBlockId(): BlockId { return crypto.randomUUID() as BlockId; }
export function createPageId(): PageId { return crypto.randomUUID() as PageId; }
export function createUserId(): UserId { return crypto.randomUUID() as UserId; }
export function createListingId(): ListingId { return crypto.randomUUID() as ListingId; }
export function createTimestamp(): Timestamp { return Date.now() as Timestamp; }
export function createSlug(text: string): Slug { 
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') as Slug; 
}

// ============================================================================
// RESULT TYPE - Railway-oriented programming
// ============================================================================
export type Result<T, E = Error> = 
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: E };

export function ok<T>(data: T): Result<T, never> { return { success: true, data } as const; }
export function err<E>(error: E): Result<never, E> { return { success: false, error } as const; }

// Type guards
export function isOk<T, E>(result: Result<T, E>): result is { success: true; data: T } {
  return result.success === true;
}
export function isErr<T, E>(result: Result<T, E>): result is { success: false; error: E } {
  return result.success === false;
}

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
// APP ERROR - Standardized error handling
// ============================================================================
export class AppError extends Error {
  constructor(
    public readonly code: string,
    public readonly message: string,
    public readonly statusCode: number = 500,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }

  static badRequest(message: string, cause?: unknown): AppError {
    return new AppError('BAD_REQUEST', message, 400, cause);
  }

  static unauthorized(message: string = 'Unauthorized'): AppError {
    return new AppError('UNAUTHORIZED', message, 401);
  }

  static forbidden(message: string = 'Forbidden'): AppError {
    return new AppError('FORBIDDEN', message, 403);
  }

  static notFound(message: string = 'Not found'): AppError {
    return new AppError('NOT_FOUND', message, 404);
  }

  static conflict(message: string): AppError {
    return new AppError('CONFLICT', message, 409);
  }

  static internal(message: string, cause?: unknown): AppError {
    return new AppError('INTERNAL_ERROR', message, 500, cause);
  }

  toJSON(): Record<string, unknown> {
    return {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
    };
  }
}

// ============================================================================
// DOMAIN ENTITIES
// ============================================================================
export interface Block {
  id: BlockId;
  type: string;
  props: Record<string, unknown>;
  zones?: Record<string, Block[]>;
}

export interface Page {
  id: PageId;
  slug: Slug;
  title: string;
  data: PuckData;
  status: PageStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type PageStatus = 'draft' | 'published' | 'archived';

export interface PuckData {
  content: Block[];
  root: { props: Record<string, unknown> };
  zones?: Record<string, Block[]>;
}

// ============================================================================
// API TYPES
// ============================================================================
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Timestamp;
}

export function successResponse<T>(data: T): ApiResponse<T> {
  return { success: true, data, timestamp: createTimestamp() };
}

export function errorResponse(error: string, statusCode: number = 500): ApiResponse<never> {
  return { success: false, error, timestamp: createTimestamp() };
}

// ============================================================================
// RE-EXPORTS
// ============================================================================
export * from './supabase';
export * from './guesty';
export * from './db';
export * from './cms';
export * from './puck';
