import {NextRequest, NextResponse} from 'next/server';
import {logger} from '@/lib/error/logger';
import {v4 as uuidv4} from 'uuid';

/**
 * API Response wrapper with consistent formatting
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  requestId?: string;
  timestamp?: string;
}

/**
 * Create a successful API response
 */
export function successResponse<T>(data: T, requestId?: string): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      requestId,
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}

/**
 * Create an error API response
 */
export function errorResponse(
  message: string,
  code: string = 'INTERNAL_ERROR',
  status: number = 500,
  requestId?: string
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: message,
      code,
      requestId,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

/**
 * Validation error response
 */
export function validationErrorResponse(
  errors: Record<string, string>,
  requestId?: string
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      data: errors,
      requestId,
      timestamp: new Date().toISOString(),
    },
    { status: 400 }
  );
}

/**
 * Wraps an API route handler with logging and error handling
 */
export function withApiHandler<T>(
  handler: (
    req: NextRequest,
    context: { params: Record<string, string> }
  ) => Promise<NextResponse<T>>
) {
  return async (
    req: NextRequest,
    context: { params: Record<string, string> }
  ): Promise<NextResponse> => {
    const requestId = uuidv4();
    const startTime = Date.now();
    const method = req.method;
    const pathname = new URL(req.url).pathname;

    try {
      logger.info(`[${method}] ${pathname} started`, {
        requestId,
        method,
        pathname,
      });

      const response = await handler(req, context);
      const duration = Date.now() - startTime;

      logger.info(`[${method}] ${pathname} completed`, {
        requestId,
        method,
        pathname,
        status: response.status,
        duration,
      });

      // Add request ID to response headers
      response.headers.set('X-Request-ID', requestId);
      response.headers.set('X-Response-Time', `${duration}ms`);

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      const err = error instanceof Error ? error : new Error(String(error));

      logger.error(
        `[${method}] ${pathname} failed`,
        err,
        {
          requestId,
          method,
          pathname,
          duration,
        }
      );

      const response = errorResponse(
        process.env.NODE_ENV === 'production'
          ? 'Internal server error'
          : err.message,
        'INTERNAL_ERROR',
        500,
        requestId
      );

      response.headers.set('X-Request-ID', requestId);
      response.headers.set('X-Response-Time', `${duration}ms`);

      return response;
    }
  };
}

/**
 * Rate limiting decorator (simple in-memory implementation)
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(maxRequests: number = 100, windowMs: number = 60000) {
  return (
    handler: (
      req: NextRequest,
      context: { params: Record<string, string> }
    ) => Promise<NextResponse>
  ) => {
    return async (
      req: NextRequest,
      context: { params: Record<string, string> }
    ): Promise<NextResponse> => {
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('cf-connecting-ip') || 'unknown';
      const now = Date.now();
      const key = `${ip}:${new URL(req.url).pathname}`;

      const record = rateLimitStore.get(key);

      if (record && record.resetTime > now) {
        if (record.count >= maxRequests) {
          return errorResponse(
            'Too many requests',
            'RATE_LIMIT_EXCEEDED',
            429
          );
        }
        record.count++;
      } else {
        rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
      }

      // Cleanup old entries
      if (rateLimitStore.size > 10000) {
        for (const [k, v] of rateLimitStore.entries()) {
          if (v.resetTime < now) {
            rateLimitStore.delete(k);
          }
        }
      }

      return handler(req, context);
    };
  };
}

/**
 * Authentication check middleware
 */
export function requireAuth(
  handler: (
    req: NextRequest,
    context: { params: Record<string, string> }
  ) => Promise<NextResponse>
) {
  return async (
    req: NextRequest,
    context: { params: Record<string, string> }
  ): Promise<NextResponse> => {
    const authHeader = req.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(
        'Unauthorized: Missing or invalid authorization header',
        'UNAUTHORIZED',
        401
      );
    }

    // Token validation would happen here
    // For now, just check presence
    const token = authHeader.substring(7);
    if (!token) {
      return errorResponse(
        'Unauthorized: Invalid token',
        'INVALID_TOKEN',
        401
      );
    }

    return handler(req, context);
  };
}

/**
 * CORS handler
 */
export function withCors(
  handler: (
    req: NextRequest,
    context: { params: Record<string, string> }
  ) => Promise<NextResponse>,
  allowedOrigins: string[] = ['*']
) {
  return async (
    req: NextRequest,
    context: { params: Record<string, string> }
  ): Promise<NextResponse> => {
    if (req.method === 'OPTIONS') {
      const origin = req.headers.get('origin') || '';
      const allowed = allowedOrigins.includes('*') || allowedOrigins.includes(origin);

      return new NextResponse(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': allowed ? origin : '',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    const response = await handler(req, context);
    const origin = req.headers.get('origin') || '';
    const allowed = allowedOrigins.includes('*') || allowedOrigins.includes(origin);

    if (allowed) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }

    return response;
  };
}

/**
 * Compose multiple middleware functions
 */
export function composeMiddleware<T>(
  ...middleware: Array<(handler: any) => any>
) {
  return (
    handler: (
      req: NextRequest,
      context: { params: Record<string, string> }
    ) => Promise<NextResponse<T>>
  ) => {
    return middleware.reduceRight((acc, fn) => fn(acc), handler);
  };
}
