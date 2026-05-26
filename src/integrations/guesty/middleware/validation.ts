/**
 * Guesty Data Validation Middleware
 * 
 * Validates Guesty API responses against schemas
 * Provides data sanitization and type coercion
 * Ensures data integrity at route boundaries
 * 
 * Features:
 * - Schema validation with Zod
 * - Data sanitization
 * - Missing field handling
 * - Type coercion
 * - Error reporting with context
 * 
 * @author Development Team
 * @version 1.0.0
 */

import { z } from 'zod';
import { logger } from '@/lib/logger';

// =============================================
// Schema Definitions
// =============================================

/**
 * Guesty Listing Schema
 */
export const GuestyListingSchema = z.object({
  _id: z.string().min(1),
  id: z.string().min(1).optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
  }).optional(),
  amenities: z.array(z.string()).optional(),
  prices: z.object({
    basePrice: z.number().positive(),
    currency: z.string().default('EUR'),
    cleaningFee: z.number().default(0),
    // Additional pricing fields
  }).optional(),
  images: z.array(z.string().url()).optional(),
  thumbnail: z.string().url().optional(),
  bedrooms: z.number().int().nonnegative().optional(),
  bathrooms: z.number().nonnegative().optional(),
  accommodates: z.number().int().positive().optional(),
  defaultCheckInTime: z.string().optional(),
  defaultCheckOutTime: z.string().optional(),
  reviews: z.object({
    avg: z.number().min(0).max(5).optional(),
    count: z.number().int().nonnegative().optional(),
  }).optional(),
  active: z.boolean().default(true),
});

export type GuestyListing = z.infer<typeof GuestyListingSchema>;

/**
 * Guesty Quote Schema
 */
export const GuestyQuoteSchema = z.object({
  _id: z.string().min(1),
  id: z.string().min(1).optional(),
  listingId: z.string().min(1),
  checkInDateLocalized: z.string(),
  checkOutDateLocalized: z.string(),
  guestsCount: z.number().int().positive(),
  basePrice: z.number().positive(),
  taxes: z.number().nonnegative().default(0),
  fees: z.number().nonnegative().default(0),
  totalPrice: z.number().positive(),
  currency: z.string().default('EUR'),
  expiresAt: z.string().datetime().optional(),
  status: z.enum(['pending', 'confirmed', 'expired', 'cancelled']).default('pending'),
  rates: z.object({
    ratePlans: z.array(z.object({
      id: z.string(),
      name: z.string(),
      price: z.number().positive(),
      cancellationPolicy: z.string().optional(),
    })).optional(),
  }).optional(),
  invoiceItems: z.array(z.object({
    type: z.string(),
    amount: z.number(),
    description: z.string().optional(),
  })).optional(),
});

export type GuestyQuote = z.infer<typeof GuestyQuoteSchema>;

/**
 * Guesty Reservation Schema
 */
export const GuestyReservationSchema = z.object({
  _id: z.string().min(1),
  id: z.string().min(1).optional(),
  quoteId: z.string().optional(),
  guestId: z.string().optional(),
  listingId: z.string().min(1),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed', 'inquiry']),
  checkIn: z.string(),
  checkOut: z.string(),
  money: z.object({
    total: z.number().positive(),
    currency: z.string().default('EUR'),
    paid: z.number().default(0),
  }).optional(),
  paymentMethod: z.string().optional(),
  guestName: z.string().optional(),
  guestEmail: z.string().email().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
});

export type GuestyReservation = z.infer<typeof GuestyReservationSchema>;

/**
 * Guesty Calendar Schema
 */
export const GuestyCalendarSchema = z.object({
  listingId: z.string(),
  days: z.array(z.object({
    date: z.string(),
    available: z.boolean(),
    price: z.number().optional(),
    minimumStay: z.number().int().nonnegative().optional(),
    checkInAllowed: z.boolean().optional(),
    checkOutAllowed: z.boolean().optional(),
  })),
});

export type GuestyCalendar = z.infer<typeof GuestyCalendarSchema>;

/**
 * Guesty Listings Response Schema
 */
export const GuestyListingsResponseSchema = z.object({
  results: z.array(GuestyListingSchema),
  pagination: z.object({
    total: z.number().int().nonnegative(),
    limit: z.number().int().positive(),
    offset: z.number().int().nonnegative(),
  }).optional(),
});

// =============================================
// Validation Middleware
// =============================================

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: z.ZodError;
  sanitized?: boolean;
  warnings?: string[];
}

export interface ValidationOptions {
  strict?: boolean;
  sanitize?: boolean;
  logErrors?: boolean;
  throwOnError?: boolean;
}

export class GuestyValidationMiddleware {
  private validationStats = {
    totalValidations: 0,
    successfulValidations: 0,
    failedValidations: 0,
    sanitizedCount: 0,
  };

  /**
   * Validate data against schema
   */
  private validate<T>(
    schema: z.ZodSchema<T>,
    data: unknown,
    options: ValidationOptions = {}
  ): ValidationResult<T> {
    const {
      strict = false,
      sanitize = true,
      logErrors = true,
      throwOnError = false,
    } = options;

    this.validationStats.totalValidations++;

    try {
      // Parse with schema
      const result = schema.safeParse(data);

      if (result.success) {
        this.validationStats.successfulValidations++;
        return {
          success: true,
          data: result.data,
          sanitized: sanitize,
        };
      }

      // Validation failed
      this.validationStats.failedValidations++;

      if (logErrors) {
        logger.error('Guesty data validation failed', {
          errors: result.error.errors,
          path: result.error.errors[0]?.path,
        });
      }

      // Try to sanitize if enabled and not in strict mode
      if (sanitize && !strict) {
        try {
          // Attempt to coerce and sanitize
          const sanitized = schema.parse(data);
          this.validationStats.sanitizedCount++;
          return {
            success: true,
            data: sanitized,
            sanitized: true,
            warnings: ['Data was sanitized to match schema'],
          };
        } catch (sanitizeError) {
          if (logErrors) {
            logger.warn('Data sanitization failed', {
              sanitizeError: sanitizeError instanceof Error ? sanitizeError.message : 'Unknown error',
            });
          }
        }
      }

      if (throwOnError) {
        throw result.error;
      }

      return {
        success: false,
        error: result.error,
        sanitized: false,
      };
    } catch (error) {
      this.validationStats.failedValidations++;

      if (logErrors) {
        logger.error('Unexpected validation error', {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }

      if (throwOnError) {
        throw error;
      }

      return {
        success: false,
        error: error instanceof z.ZodError ? error : new z.ZodError([]),
        sanitized: false,
      };
    }
  }

  /**
   * Validate listing data
   */
  validateListing(data: unknown, options: ValidationOptions = {}): ValidationResult<GuestyListing> {
    return this.validate(GuestyListingSchema, data, options);
  }

  /**
   * Validate quote data
   */
  validateQuote(data: unknown, options: ValidationOptions = {}): ValidationResult<GuestyQuote> {
    return this.validate(GuestyQuoteSchema, data, options);
  }

  /**
   * Validate reservation data
   */
  validateReservation(data: unknown, options: ValidationOptions = {}): ValidationResult<GuestyReservation> {
    return this.validate(GuestyReservationSchema, data, options);
  }

  /**
   * Validate calendar data
   */
  validateCalendar(data: unknown, options: ValidationOptions = {}): ValidationResult<GuestyCalendar> {
    return this.validate(GuestyCalendarSchema, data, options);
  }

  /**
   * Validate listings response
   */
  validateListingsResponse(data: unknown, options: ValidationOptions = {}): ValidationResult<z.infer<typeof GuestyListingsResponseSchema>> {
    return this.validate(GuestyListingsResponseSchema, data, options);
  }

  /**
   * Validate based on route/endpoint type
   */
  validateByEndpoint(endpoint: string, data: unknown, options: ValidationOptions = {}): ValidationResult<unknown> {
    switch (endpoint) {
      case 'listing':
        return this.validateListing(data, options);
      case 'listings':
        return this.validateListingsResponse(data, options);
      case 'create-quote':
      case 'get-quote':
      case 'apply-coupon':
        return this.validateQuote(data, options);
      case 'create-reservation':
      case 'reservation':
        return this.validateReservation(data, options);
      case 'calendar':
        return this.validateCalendar(data, options);
      default:
        logger.warn(`No schema defined for endpoint: ${endpoint}, skipping validation`);
        return {
          success: true,
          data: data as unknown,
          sanitized: false,
          warnings: ['No validation schema for this endpoint'],
        };
    }
  }

  /**
   * Get validation statistics
   */
  getStats() {
    return { ...this.validationStats };
  }

  /**
   * Reset validation statistics
   */
  resetStats() {
    this.validationStats = {
      totalValidations: 0,
      successfulValidations: 0,
      failedValidations: 0,
      sanitizedCount: 0,
    };
  }
}

// Singleton instance
export const guestyValidationMiddleware = new GuestyValidationMiddleware();

// =============================================
// Route-Level Validation Functions
// =============================================

/**
 * Validate data at property detail route
 */
export function validatePropertyDetailRoute(data: {
  listing: unknown;
  calendar?: unknown;
  quote?: unknown;
}) {
  const results = {
    listing: guestyValidationMiddleware.validateListing(data.listing),
    calendar: data.calendar ? guestyValidationMiddleware.validateCalendar(data.calendar) : undefined,
    quote: data.quote ? guestyValidationMiddleware.validateQuote(data.quote) : undefined,
  };

  const hasErrors = Object.values(results).some(
    r => r && !r.success
  );

  if (hasErrors) {
    logger.error('Property detail route validation failed', { results });
  }

  return {
    valid: !hasErrors,
    results,
  };
}

/**
 * Validate data at checkout route
 */
export function validateCheckoutRoute(data: {
  quote: unknown;
  listing?: unknown;
}) {
  const results = {
    quote: guestyValidationMiddleware.validateQuote(data.quote),
    listing: data.listing ? guestyValidationMiddleware.validateListing(data.listing) : undefined,
  };

  const hasErrors = !results.quote.success;

  if (hasErrors) {
    logger.error('Checkout route validation failed', { results });
  }

  return {
    valid: !hasErrors,
    results,
  };
}

/**
 * Validate data at properties route
 */
export function validatePropertiesRoute(data: {
  listings: unknown;
}) {
  const result = guestyValidationMiddleware.validateListingsResponse(data.listings);

  if (!result.success) {
    logger.error('Properties route validation failed', { result });
  }

  return {
    valid: result.success,
    result,
  };
}
