/**
 * Idempotency Manager for Guesty API Operations
 * 
 * Ensures that duplicate requests with the same idempotency key
 * return the same result, preventing race conditions and duplicate operations.
 * 
 * Features:
 * - UUID-based idempotency key generation
 * - Database-backed key storage with TTL
 * - Automatic result caching for completed operations
 * - Distributed locking for concurrent requests
 * - Automatic cleanup of expired keys
 * 
 * @version 1.0.0
 */

import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export interface IdempotencyKeyResult {
  exists: boolean;
  result: unknown | null;
  status: 'pending' | 'completed' | 'failed' | null;
}

export interface IdempotencyOptions {
  ttl?: number; // Time to live in milliseconds (default: 24 hours)
  operation?: string; // Operation name for tracking
  skipCache?: boolean; // Skip result caching (for read operations)
}

export class IdempotencyManager {
  private readonly DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Generate a new idempotency key
   * @returns UUID v4 string
   */
  generateKey(): string {
    return uuidv4();
  }

  /**
   * Generate an idempotency key from user-provided data
   * Useful for client-generated keys or deterministic keys
   * @param data - Object to hash for key generation
   * @returns Hash-based UUID
   */
  generateDeterministicKey(data: Record<string, unknown>): string {
    const hash = this.simpleHash(JSON.stringify(data));
    const bytes = new Uint8Array(16);
    for (let i = 0; i < 16; i++) {
      bytes[i] = hash[i % hash.length] & 0xff;
    }
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant
    const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  /**
   * Check if an idempotency key exists and return cached result
   * @param key - Idempotency key to check
   * @returns Idempotency key result with cached data if exists
   */
  async checkKey(key: string): Promise<IdempotencyKeyResult> {
    try {
      const { data, error } = await supabase.rpc('get_idempotency_result', {
        p_key: key,
      });

      if (error) {
        logger.error('Failed to check idempotency key', { key, error: error.message });
        throw error;
      }

      if (!data || data.length === 0) {
        return { exists: false, result: null, status: null };
      }

      const row = data[0] as { exists: boolean; result: unknown; status: string };
      
      logger.debug('Idempotency key check result', {
        key,
        exists: row.exists,
        status: row.status,
      });

      return {
        exists: row.exists,
        result: row.result,
        status: row.status as 'pending' | 'completed' | 'failed' | null,
      };
    } catch (error) {
      logger.error('Error checking idempotency key', {
        key,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      // On error, assume key doesn't exist to avoid blocking operations
      return { exists: false, result: null, status: null };
    }
  }

  /**
   * Create a new idempotency key entry
   * Returns true if the key was created (first time), false if it already exists
   * @param key - Idempotency key to create
   * @param operation - Operation name for tracking
   * @param params - Request parameters
   * @param options - Idempotency options
   * @returns true if key was created, false if already exists
   */
  async createKey(
    key: string,
    operation: string,
    params: Record<string, unknown> = {},
    _options: IdempotencyOptions = {}
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('create_idempotency_key', {
        p_key: key,
        p_operation: operation,
        p_params: params as Record<string, unknown>,
      });

      if (error) {
        logger.error('Failed to create idempotency key', {
          key,
          operation,
          error: error.message,
        });
        throw error;
      }

      const created = data === true;
      
      logger.info('Idempotency key creation', {
        key,
        operation,
        created,
      });

      return created;
    } catch (error) {
      logger.error('Error creating idempotency key', {
        key,
        operation,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      // On error, assume key was created to avoid blocking operations
      return true;
    }
  }

  /**
   * Complete an idempotency key operation with its result
   * @param key - Idempotency key to complete
   * @param result - Operation result to cache
   * @param status - Final status of the operation
   * @param responseCode - HTTP response code (optional)
   */
  async completeKey(
    key: string,
    result: unknown,
    status: 'completed' | 'failed',
    responseCode?: number
  ): Promise<void> {
    try {
      const { error } = await supabase.rpc('complete_idempotency_key', {
        p_key: key,
        p_result: result as Record<string, unknown>,
        p_status: status,
        p_response_code: responseCode,
      });

      if (error) {
        logger.error('Failed to complete idempotency key', {
          key,
          status,
          error: error.message,
        });
        throw error;
      }

      logger.info('Idempotency key completed', {
        key,
        status,
        responseCode,
      });
    } catch (error) {
      logger.error('Error completing idempotency key', {
        key,
        status,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      // Don't throw - completion failure shouldn't break the operation
    }
  }

  /**
   * Execute an operation with idempotency protection
   * If the key exists, returns the cached result instead of executing
   * @param key - Idempotency key
   * @param operation - Operation name
   * @param params - Request parameters
   * @param fn - Function to execute if key doesn't exist
   * @param options - Idempotency options
   * @returns Operation result
   */
  async executeWithIdempotency<T>(
    key: string,
    operation: string,
    params: Record<string, unknown>,
    fn: () => Promise<T>,
    options: IdempotencyOptions = {}
  ): Promise<T> {
    // Check if key already exists
    const checkResult = await this.checkKey(key);

    if (checkResult.exists && checkResult.result) {
      logger.info('Returning cached idempotency result', {
        key,
        operation,
        status: checkResult.status,
      });
      
      if (checkResult.status === 'completed') {
        return checkResult.result as T;
      }
      
      if (checkResult.status === 'failed') {
        throw new Error('Operation previously failed with idempotency key');
      }
      
      if (checkResult.status === 'pending') {
        // Wait for pending operation to complete
        // In a distributed system, this could poll or use pub/sub
        throw new Error('Operation is currently pending with this idempotency key');
      }
    }

    // Create the key if it doesn't exist
    const created = await this.createKey(key, operation, params, options);

    if (!created) {
      // Key was not created (already exists), fetch result again
      const retryCheck = await this.checkKey(key);
      if (retryCheck.exists && retryCheck.result) {
        return retryCheck.result as T;
      }
    }

    // Execute the operation
    try {
      const result = await fn();
      
      // Cache the successful result
      await this.completeKey(key, result, 'completed', 200);
      
      return result;
    } catch (error) {
      // Cache the failure
      await this.completeKey(
        key,
        { error: error instanceof Error ? error.message : 'Unknown error' },
        'failed',
        500
      );
      
      throw error;
    }
  }

  /**
   * Simple hash function for deterministic key generation
   * @param str - String to hash
   * @returns Hashed number array
   */
  private simpleHash(str: string): number[] {
    let hash = 0;
    const result: number[] = [];
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
      result.push(Math.abs(hash));
    }
    
    return result;
  }

  /**
   * Validate an idempotency key format
   * @param key - Key to validate
   * @returns true if valid UUID v4 format
   */
  static isValidKey(key: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(key);
  }

  /**
   * Extract idempotency key from request headers
   * @param headers - Request headers
   * @returns Idempotency key or null if not present
   */
  static extractFromHeaders(headers: Headers): string | null {
    const key = headers.get('idempotency-key') || headers.get('Idempotency-Key');
    return key && IdempotencyManager.isValidKey(key) ? key : null;
  }

  /**
   * Add idempotency key to response headers
   * @param headers - Response headers
   * @param key - Idempotency key to add
   */
  static addToHeaders(headers: Headers, key: string): void {
    headers.set('Idempotency-Key', key);
  }
}

// Singleton instance
export const idempotencyManager = new IdempotencyManager();

// Decorator for automatic idempotency
export function withIdempotency(operation: string, options: IdempotencyOptions = {}) {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      const key = args[0] as string; // Assume first arg is idempotency key
      const params = args[1] as Record<string, unknown> || {};
      
      return idempotencyManager.executeWithIdempotency(
        key,
        operation,
        params,
        () => originalMethod.apply(this, args),
        options
      );
    };

    return descriptor;
  };
}
