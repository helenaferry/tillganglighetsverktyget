import { beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '../apiClient';
import { ReviewService } from '../reviewService';
import { ObjectType, Status } from '../types';

vi.mock('../apiClient', () => ({
  apiClient: {
    reviews: {
      getAll: vi.fn(),
      getById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    checks: {
      getForReview: vi.fn(),
      getByRequirement: vi.fn(),
      upsert: vi.fn(),
      delete: vi.fn(),
      bulkDisable: vi.fn(),
      bulkEnable: vi.fn(),
      bulkDelete: vi.fn(),
      bulkPrefill: vi.fn(),
      toggleFlag: vi.fn(),
    },
  },
}));

const mockApiClient = vi.mocked(apiClient);

describe('ReviewService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllReviewSummaries', () => {
    it('returns all review summaries from API', async () => {
      const mockSummaries = [
        {
          id: 1,
          title: 'Review 1',
          created_at: '2024-01-01',
          latestUpdate: '2024-01-02',
          reviewedCount: 5,
          passCount: 3,
          failCount: 1,
          irrelevantCount: 1,
        },
      ];
      mockApiClient.reviews.getAll.mockResolvedValue(mockSummaries as never);

      const result = await ReviewService.getAllReviewSummaries();

      expect(result).toEqual(mockSummaries);
      expect(mockApiClient.reviews.getAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('getReviewById', () => {
    it('returns review when found', async () => {
      const mockReview = {
        id: 1,
        title: 'Test Review',
        objectType: ObjectType.WEB,
        regulatoryFramework: 'wcag21',
        created_at: '2024-01-01T00:00:00Z',
        excludedContentTypes: '',
        selectedPrefillIds: '',
      };
      mockApiClient.reviews.getById.mockResolvedValue(mockReview as never);

      const result = await ReviewService.getReviewById('1');

      expect(result).toEqual(mockReview);
      expect(mockApiClient.reviews.getById).toHaveBeenCalledWith('1');
    });

    it('throws error when API error occurs', async () => {
      mockApiClient.reviews.getById.mockRejectedValue(new Error('Database error'));

      await expect(ReviewService.getReviewById('1')).rejects.toThrow('Database error');
    });
  });

  describe('getChecksForReview', () => {
    it('returns all checks for a review', async () => {
      const mockChecks = [
        {
          id: 1,
          review: 1,
          requirement: 'req1',
          status: Status.PASS,
          comment: 'Good',
          flag: false,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ];
      mockApiClient.checks.getForReview.mockResolvedValue(mockChecks as never);

      const result = await ReviewService.getChecksForReview('1');

      expect(result).toEqual(mockChecks);
      expect(mockApiClient.checks.getForReview).toHaveBeenCalledWith('1');
    });

    it('returns empty array when no checks found', async () => {
      mockApiClient.checks.getForReview.mockResolvedValue([] as never);

      const result = await ReviewService.getChecksForReview('1');

      expect(result).toEqual([]);
    });

    it('throws error on API error', async () => {
      mockApiClient.checks.getForReview.mockRejectedValue(new Error('Database error'));

      await expect(ReviewService.getChecksForReview('1')).rejects.toThrow('Database error');
    });
  });

  describe('upsertCheck', () => {
    it('creates/updates a check', async () => {
      const mockCheck = {
        id: 1,
        review: 1,
        requirement: 'req1',
        status: Status.PASS,
        comment: 'Looks good',
        flag: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };
      mockApiClient.checks.upsert.mockResolvedValue(mockCheck as never);

      const result = await ReviewService.upsertCheck({
        reviewId: '1',
        requirement: 'req1',
        status: Status.PASS,
        comment: 'Looks good',
      });

      expect(result).toEqual(mockCheck);
      expect(mockApiClient.checks.upsert).toHaveBeenCalledWith('1', {
        requirement: 'req1',
        status: Status.PASS,
        comment: 'Looks good',
      });
    });

    it('throws error on API error', async () => {
      mockApiClient.checks.upsert.mockRejectedValue(new Error('Upsert failed'));

      await expect(
        ReviewService.upsertCheck({
          reviewId: '1',
          requirement: 'req1',
          status: Status.PASS,
        }),
      ).rejects.toThrow('Upsert failed');
    });
  });

  describe('getCheckById', () => {
    it('returns check when found', async () => {
      const mockCheck = {
        id: 1,
        review: 1,
        requirement: 'req1',
        status: Status.PASS,
        comment: 'Good',
        flag: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };
      mockApiClient.checks.getByRequirement.mockResolvedValue(mockCheck as never);

      const result = await ReviewService.getCheckById('1', 'req1');

      expect(result).toEqual(mockCheck);
      expect(mockApiClient.checks.getByRequirement).toHaveBeenCalledWith('1', 'req1');
    });

    it('returns null when check not found (404)', async () => {
      const err = new Error('Not found') as Error & { status?: number };
      err.status = 404;
      mockApiClient.checks.getByRequirement.mockRejectedValue(err);

      const result = await ReviewService.getCheckById('1', 'req999');

      expect(result).toBeNull();
    });

    it('throws error on non-404 API error', async () => {
      mockApiClient.checks.getByRequirement.mockRejectedValue(new Error('Database error'));

      await expect(ReviewService.getCheckById('1', 'req1')).rejects.toThrow('Database error');
    });
  });

  describe('deleteCheck', () => {
    it('deletes check successfully', async () => {
      mockApiClient.checks.delete.mockResolvedValue(undefined as never);

      const result = await ReviewService.deleteCheck('1');

      expect(result).toBe(true);
      expect(mockApiClient.checks.delete).toHaveBeenCalledWith(1);
    });
  });

  describe('deleteChecks', () => {
    it('deletes multiple checks successfully', async () => {
      mockApiClient.checks.bulkDelete.mockResolvedValue(undefined as never);

      const result = await ReviewService.deleteChecks(1, ['req1', 'req2', 'req3']);

      expect(result).toBe(true);
      expect(mockApiClient.checks.bulkDelete).toHaveBeenCalledWith(1, ['req1', 'req2', 'req3']);
    });
  });

  describe('disableChecks', () => {
    it('creates irrelevant checks for requirements', async () => {
      const mockChecks = [
        {
          id: 1,
          review: 1,
          requirement: 'req1',
          status: Status.IRRELEVANT,
          comment: '',
          flag: false,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ];
      mockApiClient.checks.bulkDisable.mockResolvedValue(mockChecks as never);

      const result = await ReviewService.disableChecks(1, ['req1']);

      expect(result).toEqual(mockChecks);
      expect(mockApiClient.checks.bulkDisable).toHaveBeenCalledWith(1, ['req1']);
    });
  });

  describe('enableChecks', () => {
    it('calls bulkEnable and resolves', async () => {
      mockApiClient.checks.bulkEnable.mockResolvedValue(undefined as never);

      await ReviewService.enableChecks(1, ['req1', 'req2']);

      expect(mockApiClient.checks.bulkEnable).toHaveBeenCalledWith(1, ['req1', 'req2']);
    });
  });

  describe('prefillChecks', () => {
    it('prefills checks via bulkPrefill', async () => {
      const mockChecks = [
        {
          id: 1,
          review: 1,
          requirement: 'req1',
          status: Status.PASS,
          comment: 'Auto pass',
          flag: false,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ];
      mockApiClient.checks.bulkPrefill.mockResolvedValue(mockChecks as never);

      const result = await ReviewService.prefillChecks(1, [
        { ids: ['req1'], status: 'PASS', comment: 'Auto pass' },
      ]);

      expect(result).toEqual(mockChecks);
      expect(mockApiClient.checks.bulkPrefill).toHaveBeenCalledWith(1, [
        { ids: ['req1'], status: 'PASS', comment: 'Auto pass' },
      ]);
    });
  });

  describe('upsertReview', () => {
    it('creates new review when no id provided', async () => {
      const mockReview = {
        id: 1,
        title: 'New Review',
        objectType: ObjectType.WEB,
        regulatoryFramework: 'wcag21',
        excludedContentTypes: 'video;audio',
        selectedPrefillIds: '1,2,3',
        created_at: '2024-01-01T00:00:00Z',
      };
      mockApiClient.reviews.create.mockResolvedValue(mockReview as never);

      const result = await ReviewService.upsertReview({
        title: 'New Review',
        excludedContentTypes: ['video', 'audio'],
        selectedPrefillIds: '1,2,3',
        objectType: ObjectType.WEB,
        regulatoryFramework: 'wcag21',
      });

      expect(result).toEqual(mockReview);
      expect(mockApiClient.reviews.create).toHaveBeenCalledWith({
        title: 'New Review',
        excludedContentTypes: ['video', 'audio'],
        selectedPrefillIds: '1,2,3',
        objectType: ObjectType.WEB,
        regulatoryFramework: 'wcag21',
      });
    });

    it('updates existing review when id provided', async () => {
      const mockReview = {
        id: 1,
        title: 'Updated Review',
        objectType: ObjectType.DOCUMENT,
        regulatoryFramework: 'wcag22',
        excludedContentTypes: 'image',
        selectedPrefillIds: '4,5',
        created_at: '2024-01-01T00:00:00Z',
      };
      mockApiClient.reviews.update.mockResolvedValue(mockReview as never);

      const result = await ReviewService.upsertReview({
        id: '1',
        title: 'Updated Review',
        excludedContentTypes: ['image'],
        selectedPrefillIds: '4,5',
        objectType: ObjectType.DOCUMENT,
        regulatoryFramework: 'wcag22',
      });

      expect(result).toEqual(mockReview);
      expect(mockApiClient.reviews.update).toHaveBeenCalledWith('1', {
        title: 'Updated Review',
        excludedContentTypes: ['image'],
        selectedPrefillIds: '4,5',
        objectType: ObjectType.DOCUMENT,
        regulatoryFramework: 'wcag22',
      });
    });
  });

  describe('deleteChecksForReview', () => {
    it('resolves without calling API (no-op)', async () => {
      await ReviewService.deleteChecksForReview(1);

      expect(mockApiClient.checks.getForReview).not.toHaveBeenCalled();
    });
  });

  describe('deleteReview', () => {
    it('deletes a review', async () => {
      mockApiClient.reviews.delete.mockResolvedValue(undefined as never);

      await ReviewService.deleteReview(1);

      expect(mockApiClient.reviews.delete).toHaveBeenCalledWith(1);
    });
  });

  describe('toggleCheckFlag', () => {
    it('sets flag to true', async () => {
      const mockCheck = {
        id: 1,
        review: 1,
        requirement: 'req1',
        status: Status.NOT_ASSESSED,
        comment: '',
        flag: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };
      mockApiClient.checks.toggleFlag.mockResolvedValue(mockCheck as never);

      const result = await ReviewService.toggleCheckFlag(1, 'req1', true);

      expect(result.flag).toBe(true);
      expect(mockApiClient.checks.toggleFlag).toHaveBeenCalledWith(1, 'req1', true);
    });
  });
});
