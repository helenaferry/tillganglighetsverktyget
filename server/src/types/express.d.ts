import { RequestContext } from '../middleware/requestContext';

declare global {
  namespace Express {
    interface Request {
      context?: RequestContext;
    }
  }
}

export {};
