// Comprehensive Input Validation and Sanitization Library
// Implements OWASP A03: Injection and A07: Authentication Failures remediation

import { z } from 'zod';

/**
 * Common validation patterns and schemas
 */
export const ValidationPatterns = {
  // Email validation (RFC 5322 compliant)
  email: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
  
  // Phone number (international format)
  phone: /^\+?[\d\s\-()]{10,20}$/,
  
  // URL (http/https)
  url: /^https?:\/\/.+/,
  
  // Alphanumeric with spaces, hyphens, apostrophes
  name: /^[a-zA-ZÀ-ÿ\s'-]{2,100}$/,
  
  // UUID v4
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  
  // Date (ISO 8601)
  date: /^\d{4}-\d{2}-\d{2}$/,
  
  // Property ID
  propertyId: /^prop_[a-zA-Z0-9]{16,}$/,
  
  // Booking reference
  bookingRef: /^BK[0-9]{8,12}$/,
};

/**
 * Input sanitization functions
 */
export class InputSanitizer {
  /**
   * Remove potentially dangerous characters
   */
  static sanitizeString(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim();
  }

  /**
   * Sanitize HTML using DOMPurify approach (basic implementation)
   * For production, use DOMPurify library
   */
  static sanitizeHtml(input: string): string {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed\b[^>]*>/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }

  /**
   * Sanitize URL to prevent XSS and SSRF
   */
  static sanitizeUrl(input: string): string {
    try {
      const url = new URL(input);
      
      // Only allow http/https
      if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error('Invalid protocol');
      }
      
      // Remove user info (prevents auth abuse)
      url.username = '';
      url.password = '';
      
      return url.toString();
    } catch {
      throw new Error('Invalid URL');
    }
  }

  /**
   * Escape special characters for SQL (though parameterized queries should be used)
   */
  static escapeSql(input: string): string {
    return input
      .replace(/'/g, "''")
      .replace(/\\/g, '\\\\')
      .replace(/\0/g, '\\0')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      // eslint-disable-next-line no-control-regex
      .replace(/\x1a/g, '\\Z');
  }

  /**
   * Truncate string to max length
   */
  static truncate(input: string, maxLength: number): string {
    if (input.length <= maxLength) {
return input;
}
    return input.substring(0, maxLength);
  }
}

/**
 * Zod Validation Schemas
 */
export const ValidationSchemas = {
  // Authentication schemas
  email: z.string()
    .min(1, 'Email is required')
    .max(255, 'Email is too long')
    .email('Invalid email address')
    .transform(val => val.toLowerCase().trim()),

  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),

  // Contact form schema
  contactForm: z.object({
    name: z.string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must be less than 100 characters')
      .regex(ValidationPatterns.name, 'Invalid characters in name')
      .transform(val => InputSanitizer.sanitizeString(val)),
    
    email: z.string()
      .min(1, 'Email is required')
      .max(255, 'Email is too long')
      .email('Invalid email address')
      .transform(val => val.toLowerCase().trim()),
    
    phone: z.string()
      .optional()
      .refine(
        val => !val || ValidationPatterns.phone.test(val),
        'Invalid phone number'
      )
      .transform(val => val ? InputSanitizer.sanitizeString(val) : undefined),
    
    message: z.string()
      .min(10, 'Message must be at least 10 characters')
      .max(2000, 'Message must be less than 2000 characters')
      .transform(val => InputSanitizer.sanitizeString(val)),
  }),

  // Property search schema
  propertySearch: z.object({
    location: z.string()
      .max(100, 'Location too long')
      .optional()
      .transform(val => val ? InputSanitizer.sanitizeString(val) : undefined),
    
    checkIn: z.string()
      .regex(ValidationPatterns.date, 'Invalid check-in date')
      .optional(),
    
    checkOut: z.string()
      .regex(ValidationPatterns.date, 'Invalid check-out date')
      .optional(),
    
    guests: z.number()
      .int('Must be a whole number')
      .min(1, 'At least 1 guest required')
      .max(20, 'Maximum 20 guests')
      .optional(),
    
    bedrooms: z.number()
      .int('Must be a whole number')
      .min(1, 'At least 1 bedroom')
      .max(10, 'Maximum 10 bedrooms')
      .optional(),
  }),

  // Booking schema
  booking: z.object({
    propertyId: z.string()
      .regex(ValidationPatterns.propertyId, 'Invalid property ID')
      .transform(val => InputSanitizer.sanitizeString(val)),
    
    checkIn: z.string()
      .regex(ValidationPatterns.date, 'Invalid check-in date'),
    
    checkOut: z.string()
      .regex(ValidationPatterns.date, 'Invalid check-out date'),
    
    guests: z.number()
      .int('Must be a whole number')
      .min(1, 'At least 1 guest required')
      .max(20, 'Maximum 20 guests'),
    
    firstName: z.string()
      .min(2, 'First name required')
      .max(50, 'First name too long')
      .regex(ValidationPatterns.name, 'Invalid characters in first name')
      .transform(val => InputSanitizer.sanitizeString(val)),
    
    lastName: z.string()
      .min(2, 'Last name required')
      .max(50, 'Last name too long')
      .regex(ValidationPatterns.name, 'Invalid characters in last name')
      .transform(val => InputSanitizer.sanitizeString(val)),
    
    email: z.string()
      .email('Invalid email address')
      .transform(val => val.toLowerCase().trim()),
    
    phone: z.string()
      .regex(ValidationPatterns.phone, 'Invalid phone number')
      .transform(val => InputSanitizer.sanitizeString(val)),
    
    specialRequests: z.string()
      .max(500, 'Special requests too long')
      .optional()
      .transform(val => val ? InputSanitizer.sanitizeString(val) : undefined),
  }),

  // Admin action schema
  adminAction: z.object({
    action: z.enum(['update', 'delete', 'create', 'publish']),
    resourceType: z.enum(['page', 'property', 'user', 'booking']),
    resourceId: z.string().min(1),
    data: z.record(z.unknown()).optional(),
  }),

  // Property update schema
  propertyUpdate: z.object({
    title: z.string()
      .min(10, 'Title must be at least 10 characters')
      .max(200, 'Title too long')
      .transform(val => InputSanitizer.sanitizeString(val)),
    
    description: z.string()
      .min(50, 'Description must be at least 50 characters')
      .max(5000, 'Description too long')
      .transform(val => InputSanitizer.sanitizeString(val)),
    
    price: z.number()
      .positive('Price must be positive')
      .max(100000, 'Price too high'),
    
    bedrooms: z.number()
      .int('Must be a whole number')
      .min(1, 'At least 1 bedroom')
      .max(20, 'Maximum 20 bedrooms'),
    
    bathrooms: z.number()
      .int('Must be a whole number')
      .min(1, 'At least 1 bathroom')
      .max(10, 'Maximum 10 bathrooms'),
    
    maxGuests: z.number()
      .int('Must be a whole number')
      .min(1, 'At least 1 guest')
      .max(20, 'Maximum 20 guests'),
    
    amenities: z.array(z.string()).optional(),
    images: z.array(z.string().url()).optional(),
  }),

  // Query parameter schema
  queryParam: z.string()
    .max(100, 'Query parameter too long')
    .transform(val => InputSanitizer.sanitizeString(val)),
};

/**
 * Validation error handler
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public details?: z.ZodError
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Validation utility class
 */
export class Validator {
  /**
   * Validate data against schema
   */
  static validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        throw new ValidationError(
          firstError.message,
          firstError.path.join('.'),
          error
        );
      }
      throw error;
    }
  }

  /**
   * Safely validate (returns null on error instead of throwing)
   */
  static safeValidate<T>(schema: z.ZodSchema<T>, data: unknown): T | null {
    try {
      return schema.parse(data);
    } catch {
      return null;
    }
  }

  /**
   * Validate email
   */
  static validateEmail(email: string): boolean {
    return ValidationPatterns.email.test(email);
  }

  /**
   * Validate phone number
   */
  static validatePhone(phone: string): boolean {
    return ValidationPatterns.phone.test(phone);
  }

  /**
   * Validate URL
   */
  static validateUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  }

  /**
   * Validate UUID
   */
  static validateUuid(uuid: string): boolean {
    return ValidationPatterns.uuid.test(uuid);
  }

  /**
   * Check if string contains potential XSS payload
   */
  static containsXSS(input: string): boolean {
    const xssPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe/i,
      /<object/i,
      /<embed/i,
      /fromCharCode/i,
      /&#/,
    ];

    return xssPatterns.some(pattern => pattern.test(input));
  }

  /**
   * Sanitize and validate in one step
   */
  static sanitizeAndValidate<T>(
    schema: z.ZodSchema<T>,
    data: unknown
  ): T {
    if (typeof data === 'string') {
      data = InputSanitizer.sanitizeString(data);
    }
    return this.validate(schema, data);
  }
}

/**
 * Request validation middleware (for future server-side use)
 */
export function validateRequest<T>(schema: z.ZodSchema<T>) {
  return (data: unknown): T => {
    return Validator.validate(schema, data);
  };
}

/**
 * Export all validation utilities
 */
export default {
  patterns: ValidationPatterns,
  sanitizer: InputSanitizer,
  schemas: ValidationSchemas,
  validator: Validator,
  ValidationError,
  validateRequest,
};
