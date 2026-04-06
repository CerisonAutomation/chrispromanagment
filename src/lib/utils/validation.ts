/**
 * Validation utility functions
 */

import { VALIDATION, FILE_UPLOAD } from "@/lib/constants";

/**
 * Validate email address
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email || typeof email !== "string") {
    return { valid: false, error: "Email is required" };
  }
  if (!VALIDATION.email.test(email.trim())) {
    return { valid: false, error: "Invalid email format" };
  }
  return { valid: true };
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!password) {
    errors.push("Password is required");
    return { valid: false, errors };
  }

  if (password.length < VALIDATION.minPasswordLength) {
    errors.push(`Password must be at least ${VALIDATION.minPasswordLength} characters`);
  }
  if (password.length > VALIDATION.maxPasswordLength) {
    errors.push(`Password must not exceed ${VALIDATION.maxPasswordLength} characters`);
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate URL
 */
export function validateUrl(url: string): { valid: boolean; error?: string } {
  if (!url) {
    return { valid: false, error: "URL is required" };
  }
  try {
    new URL(url);
    return { valid: true };
  } catch {
    return { valid: false, error: "Invalid URL format" };
  }
}

/**
 * Validate slug
 */
export function validateSlug(slug: string): { valid: boolean; error?: string } {
  if (!slug) {
    return { valid: false, error: "Slug is required" };
  }
  if (slug.length > VALIDATION.maxSlugLength) {
    return { valid: false, error: `Slug must not exceed ${VALIDATION.maxSlugLength} characters` };
  }
  if (!VALIDATION.slug.test(slug)) {
    return { valid: false, error: "Slug must contain only lowercase letters, numbers, and hyphens" };
  }
  return { valid: true };
}

/**
 * Validate file for upload
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: "File is required" };
  }

  if (file.size > FILE_UPLOAD.maxSizeBytes) {
    return { valid: false, error: `File size exceeds ${FILE_UPLOAD.maxSizeMB}MB limit` };
  }

  if (!FILE_UPLOAD.allowedMimeTypes.includes(file.type as any)) {
    return { valid: false, error: `File type ${file.type} is not allowed` };
  }

  const ext = file.name.split(".").pop()?.toLowerCase();
  if (!ext || !FILE_UPLOAD.allowedExtensions.includes(ext as any)) {
    return { valid: false, error: `File extension .${ext} is not allowed` };
  }

  return { valid: true };
}

/**
 * Validate name (first/last name, etc.)
 */
export function validateName(name: string): { valid: boolean; error?: string } {
  if (!name || typeof name !== "string") {
    return { valid: false, error: "Name is required" };
  }

  const trimmed = name.trim();
  if (trimmed.length < VALIDATION.minNameLength) {
    return { valid: false, error: `Name must be at least ${VALIDATION.minNameLength} characters` };
  }
  if (trimmed.length > VALIDATION.maxNameLength) {
    return { valid: false, error: `Name must not exceed ${VALIDATION.maxNameLength} characters` };
  }

  return { valid: true };
}

/**
 * Validate phone number (basic validation)
 */
export function validatePhone(phone: string): { valid: boolean; error?: string } {
  if (!phone) {
    return { valid: false, error: "Phone is required" };
  }

  const phoneRegex = /^[\d\s\-\+\(\)]{7,}$/;
  if (!phoneRegex.test(phone)) {
    return { valid: false, error: "Invalid phone number format" };
  }

  return { valid: true };
}

/**
 * Validate date is in future
 */
export function validateFutureDate(date: Date): { valid: boolean; error?: string } {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return { valid: false, error: "Invalid date" };
  }

  if (date <= new Date()) {
    return { valid: false, error: "Date must be in the future" };
  }

  return { valid: true };
}

/**
 * Validate date range
 */
export function validateDateRange(
  startDate: Date,
  endDate: Date
): { valid: boolean; error?: string } {
  if (!(startDate instanceof Date) || isNaN(startDate.getTime())) {
    return { valid: false, error: "Invalid start date" };
  }
  if (!(endDate instanceof Date) || isNaN(endDate.getTime())) {
    return { valid: false, error: "Invalid end date" };
  }
  if (endDate <= startDate) {
    return { valid: false, error: "End date must be after start date" };
  }

  return { valid: true };
}

/**
 * Validate number is within range
 */
export function validateNumberRange(
  value: number,
  min: number,
  max: number
): { valid: boolean; error?: string } {
  if (typeof value !== "number" || isNaN(value)) {
    return { valid: false, error: "Invalid number" };
  }
  if (value < min || value > max) {
    return { valid: false, error: `Value must be between ${min} and ${max}` };
  }

  return { valid: true };
}
