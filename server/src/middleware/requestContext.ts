import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import logger from '../logger';

export interface RequestContext {
  userId?: string;
  clientIp: string;
  requestId: string;
}

/**
 * Extracts request context from headers and attaches to req object
 * - CIAM_Sub header → userId
 * - X-Forwarded-For or req.ip → clientIp
 * - Generates requestId for correlation
 */
export const requestContextMiddleware = (
  req: Request & { context?: RequestContext },
  res: Response,
  next: NextFunction,
) => {
  // Extract user ID from CIAM_Sub header (set by proxy)
  // Express normalizes headers to lowercase, but we need to check the actual header keys
  // since the proxy might send CIAM_Sub, CIAM-Sub, or similar variations
  let userId: string | undefined;
  
  // First, try to extract from actual header
  const headerKeys = Object.keys(req.headers);
  const ciamHeaderKey = headerKeys.find(
    (key) => key.toLowerCase().replace(/[-_]/g, '') === 'ciamsub',
  );
  if (ciamHeaderKey) {
    const headerValue = req.headers[ciamHeaderKey];
    // Handle both string and string[] (Express can return arrays for headers)
    userId = Array.isArray(headerValue) ? headerValue[0] : headerValue;
  }
  
  // Fallback: In development, use DEV_CIAM_SUB env var if header not found
  // This allows testing without a proxy
  if (!userId && process.env.NODE_ENV === 'development' && process.env.DEV_CIAM_SUB) {
    userId = process.env.DEV_CIAM_SUB;
  }

  // Extract client IP from X-Forwarded-For header (first IP in chain) or fallback to req.ip
  const forwardedFor = req.headers['x-forwarded-for'] as string | undefined;
  const clientIp = forwardedFor
    ? forwardedFor.split(',')[0].trim()
    : req.ip || req.socket.remoteAddress || 'unknown';

  // Generate request ID for correlation
  const requestId = randomUUID();

  // Attach context to request object
  req.context = {
    userId,
    clientIp,
    requestId,
  };

  next();
};
