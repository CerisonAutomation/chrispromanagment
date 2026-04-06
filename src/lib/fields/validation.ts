/**
 * Field Validation - P4 Advanced Feature #52
 * 
 * Built-in and custom validation for Puck fields.
 * Provides declarative validation rules and async validation support.
 * 
 * @example
 * const fields = {
 *   email: {
 *     type: "text",
 *     validate: [
 *       required("Email is required"),
 *       email("Must be a valid email")
 *     ]
 *   },
 *   password: {
 *     type: "text",
 *     validate: [
 *       required("Password is required"),
 *       minLength(8, "Password must be at least 8 characters"),
 *       pattern(/[A-Z]/, "Must contain an uppercase letter")
 *     ]
 *   }
 * };
 */

import type {Field} from "@puckeditor/core";
import {useCallback, useEffect, useRef, useState} from "react";

// ============================================================================
// TYPES
// ============================================================================

export type ValidationError = string | null | undefined;

export type ValidatorFn<T = any> = (
  value: T,
  allValues?: Record<string, any>
) => ValidationError;

export interface AsyncValidatorFn<T = any> {
  (
    value: T,
    allValues?: Record<string, any>
  ): Promise<ValidationError>;
}

export interface ValidationRule<T = any> {
  validate: ValidatorFn<T>;
  message: string;
}

export interface FieldWithValidation extends Field<any> {
  validate?: ValidatorFn[];
  asyncValidate?: AsyncValidatorFn[];
  validationDelay?: number;
  showErrorWhen?: {
    field: string;
    value?: any;
  };
}

// ============================================================================
// BUILT-IN VALIDATORS
// ============================================================================

/**
 * Required field validator
 */
export function required(message: string = "This field is required"): ValidatorFn {
  return (value) => {
    if (value === null || value === undefined || value === "") {
      return message;
    }
    if (Array.isArray(value) && value.length === 0) {
      return message;
    }
    return null;
  };
}

/**
 * Minimum length validator
 */
export function minLength(min: number, message?: string): ValidatorFn<string> {
  return (value) => {
    if (!value) return null;
    if (value.length < min) {
      return message || `Must be at least ${min} characters`;
    }
    return null;
  };
}

/**
 * Maximum length validator
 */
export function maxLength(max: number, message?: string): ValidatorFn<string> {
  return (value) => {
    if (!value) return null;
    if (value.length > max) {
      return message || `Must be at most ${max} characters`;
    }
    return null;
  };
}

/**
 * Minimum value validator
 */
export function min(min: number, message?: string): ValidatorFn<number> {
  return (value) => {
    if (value === null || value === undefined) return null;
    if (Number(value) < min) {
      return message || `Must be at least ${min}`;
    }
    return null;
  };
}

/**
 * Maximum value validator
 */
export function max(max: number, message?: string): ValidatorFn<number> {
  return (value) => {
    if (value === null || value === undefined) return null;
    if (Number(value) > max) {
      return message || `Must be at most ${max}`;
    }
    return null;
  };
}

/**
 * Pattern/Regex validator
 */
export function pattern(
  regex: RegExp,
  message: string = "Invalid format"
): ValidatorFn<string> {
  return (value) => {
    if (!value) return null;
    if (!regex.test(String(value))) {
      return message;
    }
    return null;
  };
}

/**
 * Email validator
 */
export function email(message: string = "Must be a valid email"): ValidatorFn {
  return pattern(
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message
  );
}

/**
 * URL validator
 */
export function url(message: string = "Must be a valid URL"): ValidatorFn {
  return pattern(
    /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
    message
  );
}

/**
 * Custom function validator
 */
export function custom<T = any>(
  fn: (value: T) => boolean,
  message: string
): ValidatorFn<T> {
  return (value) => {
    if (!fn(value)) {
      return message;
    }
    return null;
  };
}

/**
 * Match another field validator
 */
export function matchesField(
  fieldName: string,
  message: string = "Fields do not match"
): ValidatorFn {
  return (_, allValues) => {
    if (!allValues) return null;
    // This needs context - handled in validateField
    return null;
  };
}

/**
 * Conditional validator - only validate when condition is met
 */
export function when<T = any>(
  condition: (values: Record<string, any>) => boolean,
  validators: ValidatorFn<T>[]
): ValidatorFn<T> {
  return (value, allValues) => {
    if (!allValues || !condition(allValues)) {
      return null;
    }
    
    for (const validator of validators) {
      const error = validator(value, allValues);
      if (error) return error;
    }
    
    return null;
  };
}

// ============================================================================
// ASYNC VALIDATORS
// ============================================================================

/**
 * Async email uniqueness check
 */
export async function uniqueEmail(
  value: string,
  apiEndpoint: string,
  excludeId?: string
): Promise<ValidationError> {
  if (!value) return null;
  
  try {
    const params = new URLSearchParams({ email: value });
    if (excludeId) params.append("excludeId", excludeId);
    
    const response = await fetch(`${apiEndpoint}?${params}`);
    const result = await response.json();
    
    if (result.exists) {
      return "This email is already in use";
    }
    return null;
  } catch {
    return null; // Don't block on network errors
  }
}

/**
 * Async slug uniqueness check
 */
export async function uniqueSlug(
  value: string,
  apiEndpoint: string,
  excludeId?: string
): Promise<ValidationError> {
  if (!value) return null;
  
  try {
    const params = new URLSearchParams({ slug: value });
    if (excludeId) params.append("excludeId", excludeId);
    
    const response = await fetch(`${apiEndpoint}?${params}`);
    const result = await response.json();
    
    if (result.exists) {
      return "This slug is already in use";
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Debounced async validator
 */
export function debouncedAsync<T = any>(
  validator: AsyncValidatorFn<T>,
  delay: number = 300
): AsyncValidatorFn<T> {
  let timeoutId: NodeJS.Timeout | null = null;
  
  return (value, allValues) => {
    return new Promise((resolve) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      timeoutId = setTimeout(async () => {
        const error = await validator(value, allValues);
        resolve(error);
      }, delay);
    });
  };
}

// ============================================================================
// VALIDATION ENGINE
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
  hasAsyncErrors: boolean;
}

export class ValidationEngine {
  private validators: Map<string, ValidatorFn[]>;
  private asyncValidators: Map<string, AsyncValidatorFn[]>;
  
  constructor() {
    this.validators = new Map();
    this.asyncValidators = new Map();
  }
  
  /**
   * Add sync validators for a field
   */
  addValidator(fieldName: string, ...fns: ValidatorFn[]): this {
    const existing = this.validators.get(fieldName) || [];
    this.validators.set(fieldName, [...existing, ...fns]);
    return this;
  }
  
  /**
   * Add async validators for a field
   */
  addAsyncValidator(fieldName: string, ...fns: AsyncValidatorFn[]): this {
    const existing = this.asyncValidators.get(fieldName) || [];
    this.asyncValidators.set(fieldName, [...existing, ...fns]);
    return this;
  }
  
  /**
   * Validate all fields synchronously
   */
  validateSync(values: Record<string, any>): Record<string, string> {
    const errors: Record<string, string> = {};
    
    for (const [fieldName, fieldValidators] of this.validators) {
      const value = values[fieldName];
      
      for (const validator of fieldValidators) {
        const error = validator(value, values);
        if (error) {
          errors[fieldName] = error;
          break; // Stop at first error per field
        }
      }
    }
    
    return errors;
  }
  
  /**
   * Validate all fields asynchronously
   */
  async validateAsync(values: Record<string, any>): Promise<Record<string, string>> {
    const errors: Record<string, string> = {};
    const promises: Promise<void>[] = [];
    
    for (const [fieldName, fieldValidators] of this.asyncValidators) {
      const value = values[fieldName];
      
      for (const validator of fieldValidators) {
        promises.push(
          validator(value, values).then((error) => {
            if (error && !errors[fieldName]) {
              errors[fieldName] = error;
            }
          })
        );
      }
    }
    
    await Promise.all(promises);
    return errors;
  }
  
  /**
   * Validate all fields (sync + async)
   */
  async validate(values: Record<string, any>): Promise<ValidationResult> {
    const syncErrors = this.validateSync(values);
    const asyncErrors = await this.validateAsync(values);
    
    const errors = { ...syncErrors, ...asyncErrors };
    
    return {
      valid: Object.keys(errors).length === 0,
      errors,
      hasAsyncErrors: Object.keys(asyncErrors).length > 0,
    };
  }
  
  /**
   * Validate a single field
   */
  validateField(
    fieldName: string,
    value: any,
    allValues?: Record<string, any>
  ): ValidationError {
    const fieldValidators = this.validators.get(fieldName);
    if (!fieldValidators) return null;
    
    for (const validator of fieldValidators) {
      const error = validator(value, allValues);
      if (error) return error;
    }
    
    return null;
  }
  
  /**
   * Clear all validators
   */
  clear(): this {
    this.validators.clear();
    this.asyncValidators.clear();
    return this;
  }
}

// ============================================================================
// HOOK FOR VALIDATION
// ============================================================================

export interface UseValidationOptions {
  validateOnBlur?: boolean;
  validateOnChange?: boolean;
  debounceMs?: number;
}

export function useFieldValidation<T extends Record<string, any>>(
  values: T,
  fieldName: string,
  validators: ValidatorFn[],
  options: UseValidationOptions = {}
) {
  const { validateOnBlur = true, validateOnChange = false, debounceMs = 300 } = options;
  
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [validating, setValidating] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const validate = useCallback(
    (value: any) => {
      for (const validator of validators) {
        const err = validator(value, values);
        if (err) {
          setError(err);
          return err;
        }
      }
      setError(null);
      return null;
    },
    [validators, values]
  );
  
  const handleBlur = useCallback(() => {
    if (validateOnBlur) {
      setTouched(true);
      validate(values[fieldName]);
    }
  }, [validateOnBlur, validate, values, fieldName]);
  
  const handleChange = useCallback(
    (value: any) => {
      if (validateOnChange) {
        if (debounceMs > 0) {
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          timeoutRef.current = setTimeout(() => {
            validate(value);
          }, debounceMs);
        } else {
          validate(value);
        }
      }
    },
    [validateOnChange, debounceMs, validate]
  );
  
  useEffect(() => {
    if (touched) {
      validate(values[fieldName]);
    }
  }, [values, fieldName, touched, validate]);
  
  return {
    error: touched ? error : null,
    validating,
    touched,
    handleBlur,
    handleChange,
    validate: () => {
      setTouched(true);
      return validate(values[fieldName]);
    },
  };
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Extract validation rules from field definitions
 */
export function extractFieldValidators(
  fields: Record<string, FieldWithValidation>
): Record<string, ValidatorFn[]> {
  const validators: Record<string, ValidatorFn[]> = {};
  
  for (const [name, field] of Object.entries(fields)) {
    if (field.validate) {
      validators[name] = field.validate;
    }
  }
  
  return validators;
}

/**
 * Run validation against field definitions
 */
export function validateFields<T extends Record<string, any>>(
  fields: Record<string, FieldWithValidation>,
  values: T
): Record<string, string> {
  const errors: Record<string, string> = {};
  
  for (const [name, field] of Object.entries(fields)) {
    if (field.validate) {
      const value = values[name];
      
      for (const validator of field.validate) {
        const error = validator(value, values);
        if (error) {
          errors[name] = error;
          break;
        }
      }
    }
  }
  
  return errors;
}

// ============================================================================
// EXAMPLE USAGE
// ============================================================================

/**
 * Example: Form validation setup
 * 
 * const formValidators = new ValidationEngine()
 *   .addValidator("title",
 *     required("Title is required"),
 *     minLength(3, "Title must be at least 3 characters"),
 *     maxLength(100, "Title must be at most 100 characters")
 *   )
 *   .addValidator("email",
 *     required("Email is required"),
 *     email("Please enter a valid email")
 *   )
 *   .addValidator("price",
 *     required("Price is required"),
 *     min(0, "Price cannot be negative")
 *   )
 *   .addAsyncValidator("slug", async (value) => {
 *     return uniqueSlug(value, "/api/slug-check");
 *   });
 * 
 * // Validate on submit
 * async function handleSubmit(values) {
 *   const result = await formValidators.validate(values);
 *   if (!result.valid) {
 *     showErrors(result.errors);
 *     return;
 *   }
 *   // Submit form
 * }
 */
