import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

export interface RequestContext {
  userId?: string;
  requestId: string;
}

/**
 * Extracts request context from headers and attaches to req object
 * - CIAM_Sub header → userId
 * - Generates requestId for correlation
 */
export const requestContextMiddleware = (
  req: Request,
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

  // Generate request ID for correlation
  const requestId = randomUUID();

  // Attach context to request object
  req.context = {
    userId,
    requestId,
  };

  next();
};
