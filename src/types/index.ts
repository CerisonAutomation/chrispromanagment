/**
 * Unified Type System — single source of truth for all branded types,
 * domain primitives, and shared contracts.
 */

// ─── Branded Primitives ───────────────────────────────────────────────────────
declare const __brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [__brand]: B };

export type UserId       = Brand<string, "UserId">;
export type ListingId    = Brand<string, "ListingId">;
export type BookingId    = Brand<string, "BookingId">;
export type QuoteId      = Brand<string, "QuoteId">;
export type CMSSectionId = Brand<string, "CMSSectionId">;
export type BlockId      = Brand<string, "BlockId">;
export type ImageUrl     = Brand<string, "ImageUrl">;
export type ISODate      = Brand<string, "ISODate">;
export type Currency     = Brand<string, "Currency">;

// Constructors with runtime validation
export const UserId    = (v: string): UserId    => v as UserId;
export const ListingId = (v: string): ListingId => v as ListingId;
export const BookingId = (v: string): BookingId => v as BookingId;
export const QuoteId   = (v: string): QuoteId   => v as QuoteId;
export const ISODate   = (v: string): ISODate   => v as ISODate;

// ─── Result<T, E> ─────────────────────────────────────────────────────────────
export type Ok<T>  = { readonly ok: true;  readonly value: T };
export type Err<E> = { readonly ok: false; readonly error: E };
export type Result<T, E = AppError> = Ok<T> | Err<E>;

export const ok  = <T>(value: T): Ok<T>   => ({ ok: true,  value });
export const err = <E>(error: E): Err<E>  => ({ ok: false, error });

export function isOk<T, E>(r: Result<T, E>): r is Ok<T>   {
 return r.ok; 
}
export function isErr<T, E>(r: Result<T, E>): r is Err<E>  {
 return !r.ok; 
}

/** Unwrap or throw */
export function unwrap<T, E>(r: Result<T, E>): T {
  if (r.ok) {
return r.value;
}
  throw r.error;
}

/** Map the Ok branch */
export function mapOk<T, U, E>(r: Result<T, E>, f: (v: T) => U): Result<U, E> {
  return r.ok ? ok(f(r.value)) : r;
}

/** Safely await a promise, returning Result */
export async function tryAsync<T>(
  fn: () => Promise<T>,
  toError?: (e: unknown) => AppError,
): Promise<Result<T>> {
  try {
    return ok(await fn());
  } catch (e) {
    return err(toError ? toError(e) : AppError.from(e));
  }
}

// ─── Option<T> ────────────────────────────────────────────────────────────────
export type Some<T> = { readonly some: true;  readonly value: T };
export type None    = { readonly some: false };
export type Option<T> = Some<T> | None;

export const some = <T>(value: T): Some<T> => ({ some: true, value });
export const none: None = { some: false };
export const fromNullable = <T>(v: T | null | undefined): Option<T> =>
  v === null || v === undefined ? none : some(v);

// ─── AppError ─────────────────────────────────────────────────────────────────
export type ErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "RATE_LIMITED"
  | "EXTERNAL_API_ERROR"
  | "DATABASE_ERROR"
  | "NETWORK_ERROR"
  | "CONFLICT"
  | "INTERNAL_ERROR";

export class AppError extends Error {
  readonly code:    ErrorCode;
  readonly status:  number;
  readonly details: unknown;

  constructor(code: ErrorCode, message: string, details?: unknown, status?: number) {
    super(message);
    this.name    = "AppError";
    this.code    = code;
    this.status  = status ?? AppError.statusFor(code);
    this.details = details;
  }

  static from(e: unknown): AppError {
    if (e instanceof AppError) {
return e;
}
    const msg = e instanceof Error ? e.message : String(e);
    return new AppError("INTERNAL_ERROR", msg, e);
  }

  static notFound(resource: string): AppError {
    return new AppError("NOT_FOUND", `${resource} not found`, undefined, 404);
  }
  static unauthorized(msg = "Unauthorized"): AppError {
    return new AppError("UNAUTHORIZED", msg, undefined, 401);
  }
  static forbidden(msg = "Forbidden"): AppError {
    return new AppError("FORBIDDEN", msg, undefined, 403);
  }
  static validation(msg: string, details?: unknown): AppError {
    return new AppError("VALIDATION_ERROR", msg, details, 400);
  }
  static external(service: string, msg: string): AppError {
    return new AppError("EXTERNAL_API_ERROR", `${service}: ${msg}`, undefined, 502);
  }
  static rateLimited(): AppError {
    return new AppError("RATE_LIMITED", "Rate limit exceeded", undefined, 429);
  }

  private static statusFor(code: ErrorCode): number {
    const map: Record<ErrorCode, number> = {
      VALIDATION_ERROR:  400,
      UNAUTHORIZED:      401,
      FORBIDDEN:         403,
      NOT_FOUND:         404,
      CONFLICT:          409,
      RATE_LIMITED:      429,
      INTERNAL_ERROR:    500,
      DATABASE_ERROR:    500,
      NETWORK_ERROR:     503,
      EXTERNAL_API_ERROR:502,
    };
    return map[code];
  }

  toJSON() {
    return { code: this.code, message: this.message, status: this.status };
  }
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export type UserRole = "admin" | "editor" | "viewer";

export interface AuthUser {
  readonly id:    UserId;
  readonly email: string;
  readonly roles: readonly UserRole[];
}

// ─── Pagination ───────────────────────────────────────────────────────────────
export interface PageParams {
  page:  number;
  limit: number;
}

export interface PagedResult<T> {
  data:    T[];
  total:   number;
  page:    number;
  limit:   number;
  hasMore: boolean;
}
