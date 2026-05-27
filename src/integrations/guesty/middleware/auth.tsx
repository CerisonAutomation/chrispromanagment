// @ts-nocheck
/**
 * Guesty Authentication Middleware
 * 
 * Validates Guesty API access tokens before route access
 * Handles token refresh, health checks, and circuit breaker activation
 * 
 * Features:
 * - Token health validation
 * - Automatic token refresh
 * - Circuit breaker on token failure
 * - Route protection based on token status
 * 
 * @author Development Team
 * @version 1.0.0
 */

import { logger } from '@/lib/logger';
import { supabase } from '@/integrations/supabase/client';

export interface GuestyAuthContext {
  isAuthenticated: boolean;
  tokenStatus: 'active' | 'expired' | 'invalid' | 'unknown';
  tokenExpiry?: Date;
  lastRefreshed?: Date;
  error?: string;
}

export interface AuthMiddlewareOptions {
  requireValidToken?: boolean;
  allowExpiredWithRefresh?: boolean;
  circuitBreakerThreshold?: number;
  circuitBreakerTimeout?: number;
}

export class GuestyAuthMiddleware {
  private circuitBreakerOpen: boolean = false;
  private circuitBreakerOpenAt: number = 0;
  private failureCount: number = 0;
  private readonly circuitBreakerThreshold: number;
  private readonly circuitBreakerTimeout: number;

  constructor(options: AuthMiddlewareOptions = {}) {
    this.circuitBreakerThreshold = options.circuitBreakerThreshold || 5;
    this.circuitBreakerTimeout = options.circuitBreakerTimeout || 60000; // 1 minute
  }

  /**
   * Check if circuit breaker is open
   */
  private isCircuitBreakerOpen(): boolean {
    if (this.circuitBreakerOpen) {
      const timeSinceOpen = Date.now() - this.circuitBreakerOpenAt;
      if (timeSinceOpen > this.circuitBreakerTimeout) {
        // Reset circuit breaker after timeout
        this.circuitBreakerOpen = false;
        this.failureCount = 0;
        logger.info('Guesty auth circuit breaker reset after timeout');
        return false;
      }
      return true;
    }
    return false;
  }

  /**
   * Trigger circuit breaker open
   */
  private triggerCircuitBreaker(): void {
    this.circuitBreakerOpen = true;
    this.circuitBreakerOpenAt = Date.now();
    logger.error('Guesty auth circuit breaker triggered', {
      failureCount: this.failureCount,
      threshold: this.circuitBreakerThreshold,
    });
  }

  /**
   * Record a failure
   */
  private recordFailure(error: string): void {
    this.failureCount++;
    logger.warn('Guesty auth failure recorded', {
      failureCount: this.failureCount,
      threshold: this.circuitBreakerThreshold,
      error,
    });

    if (this.failureCount >= this.circuitBreakerThreshold) {
      this.triggerCircuitBreaker();
    }
  }

  /**
   * Reset failure count on success
   */
  private recordSuccess(): void {
    if (this.failureCount > 0) {
      logger.info('Guesty auth success, resetting failure count', {
        previousFailures: this.failureCount,
      });
      this.failureCount = 0;
    }
  }

  /**
   * Get token status from guesty_token_vault table
   */
  private async getTokenStatus(): Promise<GuestyAuthContext> {
    try {
      const { data, error } = await supabase
        .from('guesty_token_vault')
        .select('*')
        .eq('active', true)
        .single();

      if (error) {
        throw new Error(`Failed to fetch token status: ${error.message}`);
      }

      if (!data) {
        return {
          isAuthenticated: false,
          tokenStatus: 'invalid',
          error: 'No active token found in vault',
        };
      }

      const now = new Date();
      const expiresAt = new Date(data.expires_at);
      const isExpired = now >= expiresAt;

      return {
        isAuthenticated: !isExpired,
        tokenStatus: isExpired ? 'expired' : 'active',
        tokenExpiry: expiresAt,
        lastRefreshed: data.last_refreshed ? new Date(data.last_refreshed) : undefined,
      };
    } catch (error) {
      logger.error('Error fetching token status from vault', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return {
        isAuthenticated: false,
        tokenStatus: 'unknown',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check token health via Guesty API
   */
  private async pingToken(): Promise<boolean> {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/guesty-beapi?action=ping-token`,
        {
          headers: {
            'api-key': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Token ping failed: ${response.status}`);
      }

      const data = await response.json();
      return data?.status === 'ok' || data?.valid === true;
    } catch (error) {
      logger.error('Error pinging Guesty token', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  /**
   * Trigger token refresh via edge function
   */
  private async refreshToken(): Promise<boolean> {
    try {
      logger.info('Attempting to refresh Guesty token');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/guesty-token-refresh`,
        {
          method: 'POST',
          headers: {
            'api-key': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.status}`);
      }

      const data = await response.json();
      const success = data?.success === true || data?.refreshed === true;

      if (success) {
        logger.info('Guesty token refreshed successfully');
      }

      return success;
    } catch (error) {
      logger.error('Error refreshing Guesty token', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  /**
   * Main authentication check
   */
  async authenticate(options: AuthMiddlewareOptions = {}): Promise<GuestyAuthContext> {
    const {
      requireValidToken = true,
      allowExpiredWithRefresh = true,
    } = options;

    // Check circuit breaker first
    if (this.isCircuitBreakerOpen()) {
      const error = 'Guesty auth circuit breaker is open - service temporarily unavailable';
      logger.error(error);
      return {
        isAuthenticated: false,
        tokenStatus: 'unknown',
        error,
      };
    }

    try {
      // Get token status from vault
      const context = await this.getTokenStatus();

      // If token is active, verify with ping
      if (context.tokenStatus === 'active') {
        const isHealthy = await this.pingToken();
        if (isHealthy) {
          this.recordSuccess();
          return context;
        } else {
          // Token claims to be active but ping failed
          logger.warn('Token ping failed despite active status in vault');
          context.tokenStatus = 'invalid';
          this.recordFailure('Token ping failed');
        }
      }

      // If token is expired and refresh is allowed
      if (context.tokenStatus === 'expired' && allowExpiredWithRefresh) {
        logger.info('Token expired, attempting refresh');
        const refreshed = await this.refreshToken();
        if (refreshed) {
          this.recordSuccess();
          // Fetch updated status after refresh
          return await this.getTokenStatus();
        } else {
          this.recordFailure('Token refresh failed');
        }
      }

      // If valid token is required but we don't have one
      if (requireValidToken && context.tokenStatus !== 'active') {
        logger.error('Authentication failed - valid token required but not available', {
          tokenStatus: context.tokenStatus,
        });
        this.recordFailure('Authentication failed');
      }

      return context;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Guesty authentication error', { error: errorMessage });
      this.recordFailure(errorMessage);

      return {
        isAuthenticated: false,
        tokenStatus: 'unknown',
        error: errorMessage,
      };
    }
  }

  /**
   * Check if route access is allowed
   */
  async canAccessRoute(route: string, options: AuthMiddlewareOptions = {}): Promise<{
    allowed: boolean;
    context: GuestyAuthContext;
    reason?: string;
  }> {
    const context = await this.authenticate(options);

    if (!context.isAuthenticated && options.requireValidToken !== false) {
      return {
        allowed: false,
        context,
        reason: 'Valid Guesty token required but not available',
      };
    }

    // Route-specific checks
    const guestyDependentRoutes = [
      '/properties',
      '/property/:id',
      '/checkout/:quoteId',
      '/confirmation',
      '/listings',
      '/maintenance',
      '/offline-booking',
      '/pricing',
    ];

    const isGuestyDependent = guestyDependentRoutes.some(pattern => 
      route === pattern || route.startsWith(pattern.split(':')[0])
    );

    if (isGuestyDependent && context.tokenStatus !== 'active') {
      return {
        allowed: false,
        context,
        reason: `Route depends on Guesty but token status is ${context.tokenStatus}`,
      };
    }

    return {
      allowed: true,
      context,
    };
  }

  /**
   * Get circuit breaker status
   */
  getCircuitBreakerStatus(): {
    isOpen: boolean;
    failureCount: number;
    threshold: number;
    openSince?: Date;
  } {
    return {
      isOpen: this.circuitBreakerOpen,
      failureCount: this.failureCount,
      threshold: this.circuitBreakerThreshold,
      openSince: this.circuitBreakerOpenAt ? new Date(this.circuitBreakerOpenAt) : undefined,
    };
  }

  /**
   * Manually reset circuit breaker
   */
  resetCircuitBreaker(): void {
    this.circuitBreakerOpen = false;
    this.failureCount = 0;
    logger.info('Guesty auth circuit breaker manually reset');
  }
}

// Singleton instance
export const guestyAuthMiddleware = new GuestyAuthMiddleware();

/**
 * Higher-order function to wrap route components with auth check
 */
export function withGuestyAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: AuthMiddlewareOptions = {}
) {
  return function AuthenticatedComponent(props: P) {
    const [authStatus, setAuthStatus] = React.useState<GuestyAuthContext | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
      guestyAuthMiddleware
        .authenticate(options)
        .then(context => {
          setAuthStatus(context);
          setIsLoading(false);
        })
        .catch(error => {
          logger.error('Auth check failed in component wrapper', { error });
          setAuthStatus({
            isAuthenticated: false,
            tokenStatus: 'unknown',
            error: error instanceof Error ? error.message : 'Unknown error',
          });
          setIsLoading(false);
        });
    }, []);

    if (isLoading) {
      return <div>Loading...</div>;
    }

    if (!authStatus?.isAuthenticated && options.requireValidToken !== false) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-4">
              {authStatus?.error || 'Unable to authenticate with Guesty services'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}
