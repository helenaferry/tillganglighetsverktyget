import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { requestContextMiddleware } from '../requestContext';

describe('requestContextMiddleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      headers: {},
      ip: '127.0.0.1',
      socket: {
        remoteAddress: '127.0.0.1',
      } as any,
    };
    mockRes = {};
    mockNext = vi.fn();
    vi.clearAllMocks();
    // Reset env
    delete process.env.DEV_CIAM_SUB;
  });

  describe('userId extraction', () => {
    it('should extract userId from CIAM_Sub header (lowercase)', () => {
      mockReq.headers = { ciam_sub: 'testuser123' };
      requestContextMiddleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.context?.userId).toBe('testuser123');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should extract userId from CIAM-Sub header (with hyphen)', () => {
      mockReq.headers = { 'ciam-sub': 'testuser456' };
      requestContextMiddleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.context?.userId).toBe('testuser456');
    });

    it('should handle header name variations (case-insensitive)', () => {
      mockReq.headers = { CIAM_SUB: 'testuser789' };
      requestContextMiddleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.context?.userId).toBe('testuser789');
    });

    it('should handle array header values', () => {
      mockReq.headers = { ciam_sub: ['testuser', 'another'] };
      requestContextMiddleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.context?.userId).toBe('testuser');
    });

    it('should use DEV_CIAM_SUB env var in development when header missing', () => {
      process.env.NODE_ENV = 'development';
      process.env.DEV_CIAM_SUB = 'devuser123';
      mockReq.headers = {};

      requestContextMiddleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.context?.userId).toBe('devuser123');
    });

    it('should not use DEV_CIAM_SUB in production', () => {
      process.env.NODE_ENV = 'production';
      process.env.DEV_CIAM_SUB = 'devuser123';
      mockReq.headers = {};

      requestContextMiddleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.context?.userId).toBeUndefined();
    });

    it('should prefer header over DEV_CIAM_SUB', () => {
      process.env.NODE_ENV = 'development';
      process.env.DEV_CIAM_SUB = 'devuser';
      mockReq.headers = { ciam_sub: 'headeruser' };

      requestContextMiddleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.context?.userId).toBe('headeruser');
    });
  });

  describe('clientIp extraction', () => {
    it('should extract IP from X-Forwarded-For header', () => {
      mockReq.headers = { 'x-forwarded-for': '192.168.1.1, 10.0.0.1' };
      requestContextMiddleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.context?.clientIp).toBe('192.168.1.1');
    });

    it('should use first IP from X-Forwarded-For chain', () => {
      mockReq.headers = { 'x-forwarded-for': '1.2.3.4, 5.6.7.8, 9.10.11.12' };
      requestContextMiddleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.context?.clientIp).toBe('1.2.3.4');
    });

    it('should fallback to req.ip when X-Forwarded-For missing', () => {
      mockReq.headers = {};
      mockReq.ip = '192.168.1.100';
      requestContextMiddleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.context?.clientIp).toBe('192.168.1.100');
    });

    it('should fallback to req.socket.remoteAddress when req.ip missing', () => {
      mockReq.headers = {};
      mockReq.ip = undefined;
      mockReq.socket = { remoteAddress: '10.0.0.50' } as any;
      requestContextMiddleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.context?.clientIp).toBe('10.0.0.50');
    });

    it('should use "unknown" when no IP source available', () => {
      mockReq.headers = {};
      mockReq.ip = undefined;
      mockReq.socket = { remoteAddress: undefined } as any;
      requestContextMiddleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.context?.clientIp).toBe('unknown');
    });
  });

  describe('requestId generation', () => {
    it('should generate unique request ID', () => {
      requestContextMiddleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.context?.requestId).toBeDefined();
      expect(typeof mockReq.context?.requestId).toBe('string');
      expect(mockReq.context?.requestId.length).toBeGreaterThan(0);
    });

    it('should generate different request IDs for different requests', () => {
      const req1 = { ...mockReq };
      const req2 = { ...mockReq };
      requestContextMiddleware(req1 as Request, mockRes as Response, mockNext);
      requestContextMiddleware(req2 as Request, mockRes as Response, mockNext);

      expect(req1.context?.requestId).not.toBe(req2.context?.requestId);
    });
  });

  describe('context attachment', () => {
    it('should attach complete context to req object', () => {
      mockReq.headers = {
        ciam_sub: 'testuser',
        'x-forwarded-for': '1.2.3.4',
      };
      requestContextMiddleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.context).toBeDefined();
      expect(mockReq.context?.userId).toBe('testuser');
      expect(mockReq.context?.clientIp).toBe('1.2.3.4');
      expect(mockReq.context?.requestId).toBeDefined();
    });

    it('should call next() middleware', () => {
      requestContextMiddleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });
  });
});
