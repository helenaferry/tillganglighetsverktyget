import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  logReviewCreated,
  logReviewUpdated,
  logReviewDeleted,
  logCheckUpdated,
} from '../../logger';
import { RequestContext } from '../../middleware/requestContext';
import { Status, StatusText } from '../../types/status';

// Mock winston logger - functions must be defined inside the factory
vi.mock('winston', () => {
  const mockInfoFn = vi.fn();
  const mockErrorFn = vi.fn();
  const mockDebugFn = vi.fn();
  const mockWarnFn = vi.fn();
  
  // Store references globally so tests can access them
  (global as any).__mockWinstonInfo = mockInfoFn;
  (global as any).__mockWinstonError = mockErrorFn;
  (global as any).__mockWinstonDebug = mockDebugFn;
  (global as any).__mockWinstonWarn = mockWarnFn;
  
  const mockLogger = {
    info: mockInfoFn,
    error: mockErrorFn,
    debug: mockDebugFn,
    warn: mockWarnFn,
  };
  return {
    default: {
      createLogger: vi.fn(() => mockLogger),
      transports: {
        Console: vi.fn(),
      },
    },
    createLogger: vi.fn(() => mockLogger),
    transports: {
      Console: vi.fn(),
    },
  };
});

vi.mock('@elastic/ecs-winston-format', () => ({
  ecsFormat: vi.fn(() => (info: any) => info),
}));

describe('Logger audit functions', () => {
  let context: RequestContext;
  let mockInfo: ReturnType<typeof vi.fn>;
  let mockError: ReturnType<typeof vi.fn>;
  let mockDebug: ReturnType<typeof vi.fn>;
  let mockWarn: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Get references to the mocked functions
    mockInfo = (global as any).__mockWinstonInfo;
    mockError = (global as any).__mockWinstonError;
    mockDebug = (global as any).__mockWinstonDebug;
    mockWarn = (global as any).__mockWinstonWarn;
    
    vi.clearAllMocks();
    context = {
      userId: 'testuser123',
      requestId: 'test-request-id',
    };
  });

  describe('logReviewCreated', () => {
    it('should log review creation with correct metadata', () => {
      const review = {
        id: 1,
        title: 'Test Review',
        created_at: new Date(),
        excludedContentTypes: null,
        objectType: null,
        regulatoryFramework: null,
        selectedPrefillIds: null,
      };

      logReviewCreated(review, context);

      expect(mockInfo).toHaveBeenCalledWith(
        expect.stringContaining("Granskning 'Test Review' skapad av användare testuser123"),
        expect.objectContaining({
          'event.action': 'create',
          'user.name': 'testuser123',
          'source.ip': '192.168.1.1',
          'object.type': 'review',
          'object.id': 1,
          'audit.log': 'true',
          'audit.spu': 'false',
        }),
      );
    });

    it('should use "okänd användare" when userId is missing', () => {
      const review = {
        id: 2,
        title: 'Another Review',
        created_at: new Date(),
        excludedContentTypes: null,
        objectType: null,
        regulatoryFramework: null,
        selectedPrefillIds: null,
      };
      const contextWithoutUser = {
        ...context,
        userId: undefined,
      };

      logReviewCreated(review, contextWithoutUser);

      expect(mockInfo).toHaveBeenCalledWith(
        expect.stringContaining('okänd användare'),
        expect.objectContaining({
          'user.name': null,
        }),
      );
    });

    it('should handle review without title', () => {
      const review = {
        id: 3,
        title: null,
        created_at: new Date(),
        excludedContentTypes: null,
        objectType: null,
        regulatoryFramework: null,
        selectedPrefillIds: null,
      };

      logReviewCreated(review, context);

      expect(mockInfo).toHaveBeenCalledWith(
        expect.stringContaining("'Namnlös granskning'"),
        expect.any(Object),
      );
    });
  });

  describe('logReviewUpdated', () => {
    it('should log only changed fields', () => {
      const review = {
        id: 1,
        title: 'Updated Title',
        created_at: new Date(),
        excludedContentTypes: null,
        objectType: null,
        regulatoryFramework: null,
        selectedPrefillIds: null,
      };
      const changes = {
        title: { old: 'Old Title', new: 'Updated Title' },
      };

      logReviewUpdated(review, changes, context);

      expect(mockInfo).toHaveBeenCalledWith(
        expect.stringContaining("Granskning 'Updated Title' uppdaterad"),
        expect.objectContaining({
          'event.action': 'update',
          'event.update_parameters': expect.stringContaining("Titel ändrad från 'Old Title' till 'Updated Title'"),
          'object.type': 'review',
          'object.id': 1,
        }),
      );
    });

    it('should skip logging if no changes detected', () => {
      const review = {
        id: 1,
        title: 'Test',
        created_at: new Date(),
        excludedContentTypes: null,
        objectType: null,
        regulatoryFramework: null,
        selectedPrefillIds: null,
      };
      const changes = {};

      logReviewUpdated(review, changes, context);

      expect(mockInfo).not.toHaveBeenCalled();
    });

    it('should log multiple changes correctly', () => {
      const review = {
        id: 1,
        title: 'New Title',
        created_at: new Date(),
        excludedContentTypes: 'type1;type2',
        objectType: null,
        regulatoryFramework: null,
        selectedPrefillIds: null,
      };
      const changes = {
        title: { old: 'Old Title', new: 'New Title' },
        excludedContentTypes: { old: 'type1', new: 'type1;type2' },
      };

      logReviewUpdated(review, changes, context);

      expect(mockInfo).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          'event.update_parameters': expect.stringMatching(/Titel ändrad.*Exkluderade innehållstyper ändrade/),
        }),
      );
    });

    it('should handle null values in changes', () => {
      const review = {
        id: 1,
        title: 'Test',
        created_at: new Date(),
        excludedContentTypes: null,
        objectType: null,
        regulatoryFramework: null,
        selectedPrefillIds: null,
      };
      const changes = {
        title: { old: null, new: 'New Title' },
      };

      logReviewUpdated(review, changes, context);

      expect(mockInfo).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          'event.update_parameters': expect.stringContaining("Titel ändrad från 'tomt' till 'New Title'"),
        }),
      );
    });
  });

  describe('logReviewDeleted', () => {
    it('should log review deletion with correct metadata', () => {
      const review = {
        id: 1,
        title: 'Review to Delete',
        created_at: new Date(),
        excludedContentTypes: null,
        objectType: null,
        regulatoryFramework: null,
        selectedPrefillIds: null,
      };

      logReviewDeleted(review, context);

      expect(mockInfo).toHaveBeenCalledWith(
        expect.stringContaining("Granskning 'Review to Delete' raderad av användare testuser123"),
        expect.objectContaining({
          'event.action': 'delete',
          'object.type': 'review',
          'object.id': 1,
          'user.name': 'testuser123',
          'source.ip': '192.168.1.1',
        }),
      );
    });
  });

  describe('logCheckUpdated', () => {
    it('should log check creation with correct metadata', () => {
      const check = {
        review: 1,
        requirement: 'req-123',
        status: Status.PASS,
        comment: 'Test comment',
        flag: 0,
      };

      logCheckUpdated(check, true, context);

      expect(mockInfo).toHaveBeenCalledWith(
        expect.stringContaining('Kontroll för krav req-123 skapad'),
        expect.objectContaining({
          'event.action': 'create',
          'object.type': 'check',
          'object.id': '1-req-123',
          'object.review_id': 1,
          'object.requirement': 'req-123',
          'object.status': Status.PASS,
          'object.flag': 0,
        }),
      );
    });

    it('should log check update with correct metadata', () => {
      const check = {
        review: 1,
        requirement: 'req-456',
        status: Status.FAIL,
        comment: 'Updated comment',
        flag: 1,
      };

      logCheckUpdated(check, false, context);

      expect(mockInfo).toHaveBeenCalledWith(
        expect.stringContaining('Kontroll för krav req-456 uppdaterad'),
        expect.objectContaining({
          'event.action': 'update',
          'object.status': Status.FAIL,
        }),
      );
    });

    it('should map status values to Swedish text correctly', () => {
      const statusTests = [
        { status: Status.FAIL, expectedText: StatusText.FAIL },
        { status: Status.PASS, expectedText: StatusText.PASS },
        { status: Status.IRRELEVANT, expectedText: StatusText.IRRELEVANT },
        { status: Status.NOT_ASSESSED, expectedText: StatusText.NOT_ASSESSED },
      ];

      statusTests.forEach(({ status, expectedText }) => {
        vi.clearAllMocks();
        const check = {
          review: 1,
          requirement: 'req-1',
          status,
          comment: '',
          flag: 0,
        };

        logCheckUpdated(check, false, context);

        expect(mockInfo).toHaveBeenCalledWith(
          expect.stringContaining(`Status: ${expectedText}`),
          expect.any(Object),
        );
      });
    });

    it('should handle null status', () => {
      const check = {
        review: 1,
        requirement: 'req-1',
        status: null,
        comment: '',
        flag: 0,
      };

      logCheckUpdated(check, false, context);

      expect(mockInfo).toHaveBeenCalledWith(
        expect.stringContaining(`Status: ${StatusText.NOT_ASSESSED}`),
        expect.any(Object),
      );
    });

    it('should handle unknown requirement ID', () => {
      const check = {
        review: 1,
        requirement: null,
        status: Status.PASS,
        comment: '',
        flag: 0,
      };

      logCheckUpdated(check, false, context);

      expect(mockInfo).toHaveBeenCalledWith(
        expect.stringContaining('Kontroll för krav okänt'),
        expect.any(Object),
      );
    });

    it('should use "okänd användare" when userId is missing', () => {
      const check = {
        review: 1,
        requirement: 'req-1',
        status: Status.PASS,
        comment: '',
        flag: 0,
      };
      const contextWithoutUser = {
        ...context,
        userId: undefined,
      };

      logCheckUpdated(check, false, contextWithoutUser);

      expect(mockInfo).toHaveBeenCalledWith(
        expect.stringContaining('okänd användare'),
        expect.objectContaining({
          'user.name': null,
        }),
      );
    });
  });
});
