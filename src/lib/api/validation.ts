import { z, ZodSchema } from 'zod';
import { NextRequest } from 'next/server';

/**
 * Validation error details
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validate request body with Zod schema
 */
export async function validateBody<T>(
  req: NextRequest,
  schema: ZodSchema<T>
): Promise<{ data: T | null; errors: ValidationError[] }> {
  try {
    const body = await req.json();
    const validated = await schema.parseAsync(body);
    return { data: validated, errors: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: ValidationError[] = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return { data: null, errors };
    }
    return {
      data: null,
      errors: [{ field: 'body', message: 'Invalid JSON' }],
    };
  }
}

/**
 * Validate query parameters with Zod schema
 */
export function validateQuery<T>(
  url: string,
  schema: ZodSchema<T>
): { data: T | null; errors: ValidationError[] } {
  try {
    const params = Object.fromEntries(new URL(url).searchParams.entries());
    const validated = schema.parse(params);
    return { data: validated, errors: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: ValidationError[] = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return { data: null, errors };
    }
    return {
      data: null,
      errors: [{ field: 'query', message: 'Invalid query parameters' }],
    };
  }
}

/**
 * Validate request headers with Zod schema
 */
export function validateHeaders<T>(
  headers: Headers,
  schema: ZodSchema<T>
): { data: T | null; errors: ValidationError[] } {
  try {
    const headerObj: Record<string, string> = {};
    headers.forEach((value, key) => {
      headerObj[key.toLowerCase()] = value;
    });

    const validated = schema.parse(headerObj);
    return { data: validated, errors: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: ValidationError[] = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return { data: null, errors };
    }
    return {
      data: null,
      errors: [{ field: 'headers', message: 'Invalid headers' }],
    };
  }
}

/**
 * Common validation schemas
 */
export const CommonSchemas = {
  // Pagination
  pagination: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),

  // UUID
  uuid: z.string().uuid(),

  // Email
  email: z.string().email(),

  // Date
  date: z.string().datetime(),

  // Slug
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),

  // URL
  url: z.string().url(),

  // Search query
  search: z.string().min(1).max(100),

  // Status
  status: z.enum(['active', 'inactive', 'pending', 'archived']),

  // Sort order
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
};

/**
 * Create a paginated response schema
 */
export function createPaginatedSchema<T extends ZodSchema>(itemSchema: T) {
  return z.object({
    items: z.array(itemSchema),
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    totalPages: z.number().int().nonnegative(),
  });
}

/**
 * Sanitize input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate and sanitize multiple inputs
 */
export function sanitizeInputs(inputs: Record<string, string>): Record<string, string> {
  const sanitized: Record<string, string> = {};
  for (const [key, value] of Object.entries(inputs)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    }
  }
  return sanitized;
}
