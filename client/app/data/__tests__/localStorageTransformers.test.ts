import { beforeEach, describe, expect, it } from 'vitest';

import {
  computeReviewSummary,
  flagToBoolean,
  flagToNumber,
  normalizeCheck,
  normalizeReview,
} from '../localStorageTransformers';
import type { Check, Review } from '../types';
import { Status } from '../types';

describe('localStorageTransformers', () => {
  describe('flagToNumber', () => {
    it('converts true to 1', () => {
      expect(flagToNumber(true)).toBe(1);
    });

    it('converts false to 0', () => {
      expect(flagToNumber(false)).toBe(0);
    });

    it('converts null to null', () => {
      expect(flagToNumber(null)).toBeNull();
    });

    it('converts undefined to null', () => {
      expect(flagToNumber(undefined)).toBeNull();
    });
  });

  describe('flagToBoolean', () => {
    it('converts 1 to true', () => {
      expect(flagToBoolean(1)).toBe(true);
    });

    it('converts 0 to false', () => {
      expect(flagToBoolean(0)).toBe(false);
    });

    it('converts null to null', () => {
      expect(flagToBoolean(null)).toBeNull();
    });

    it('converts undefined to null', () => {
      expect(flagToBoolean(undefined)).toBeNull();
    });
  });

  describe('normalizeReview', () => {
    it('normalizes review with all fields', () => {
      const review: Review = {
        id: 1,
        created_at: '2024-01-01T00:00:00Z',
        title: 'Test Review',
        excludedContentTypes: 'video,audio',
        objectType: 'web',
        regulatoryFramework: 'dos',
        selectedPrefillIds: '1,2',
      };

      const result = normalizeReview(review);

      expect(result).toEqual(review);
    });

    it('sets default created_at if missing', () => {
      const review = {
        id: 1,
        title: 'Test Review',
      } as Review;

      const result = normalizeReview(review);

      expect(result.created_at).toBeDefined();
      expect(new Date(result.created_at).getTime()).toBeGreaterThan(0);
    });

    it('converts undefined fields to null', () => {
      const review = {
        id: 1,
        created_at: '2024-01-01T00:00:00Z',
      } as Review;

      const result = normalizeReview(review);

      expect(result.title).toBeNull();
      expect(result.excludedContentTypes).toBeNull();
      expect(result.objectType).toBeNull();
      expect(result.regulatoryFramework).toBeNull();
      expect(result.selectedPrefillIds).toBeNull();
    });

    it('preserves null values', () => {
      const review: Review = {
        id: 1,
        created_at: '2024-01-01T00:00:00Z',
        title: null,
        excludedContentTypes: null,
        objectType: null,
        regulatoryFramework: null,
        selectedPrefillIds: null,
      };

      const result = normalizeReview(review);

      expect(result.title).toBeNull();
      expect(result.excludedContentTypes).toBeNull();
    });
  });

  describe('normalizeCheck', () => {
    it('normalizes check with all fields', () => {
      const check: Check = {
        id: 1,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
        review: 1,
        requirement: 'req1',
        status: Status.PASS,
        comment: 'Test comment',
        flag: false,
      };

      const result = normalizeCheck(check);

      expect(result).toEqual(check);
    });

    it('sets default created_at if missing', () => {
      const check = {
        id: 1,
        review: 1,
      } as Check;

      const result = normalizeCheck(check);

      expect(result.created_at).toBeDefined();
      expect(new Date(result.created_at).getTime()).toBeGreaterThan(0);
    });

    it('converts undefined fields to null', () => {
      const check = {
        id: 1,
        created_at: '2024-01-01T00:00:00Z',
        review: 1,
      } as Check;

      const result = normalizeCheck(check);

      expect(result.updated_at).toBeNull();
      expect(result.requirement).toBeNull();
      expect(result.status).toBeNull();
      expect(result.comment).toBeNull();
      expect(result.flag).toBeUndefined(); // flag preserves undefined (not converted to null)
    });

    it('preserves null values', () => {
      const check: Check = {
        id: 1,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: null,
        review: 1,
        requirement: null,
        status: null,
        comment: null,
        flag: null,
      };

      const result = normalizeCheck(check);

      expect(result.updated_at).toBeNull();
      expect(result.requirement).toBeNull();
      expect(result.status).toBeNull();
    });
  });

  describe('computeReviewSummary', () => {
    beforeEach(() => {
      // Ensure consistent date handling
    });

    it('calculates summary fields correctly with multiple checks', () => {
      const review: Review = {
        id: 1,
        created_at: '2024-01-01T00:00:00Z',
        title: 'Test Review',
        excludedContentTypes: null,
        objectType: 'web',
        regulatoryFramework: 'dos',
        selectedPrefillIds: null,
      };

      const checks: Check[] = [
        {
          id: 1,
          created_at: '2024-01-01T10:00:00Z',
          updated_at: '2024-01-02T10:00:00Z',
          review: 1,
          requirement: 'req1',
          status: Status.PASS,
          comment: 'Pass',
          flag: false,
        },
        {
          id: 2,
          created_at: '2024-01-01T11:00:00Z',
          updated_at: '2024-01-03T10:00:00Z',
          review: 1,
          requirement: 'req2',
          status: Status.FAIL,
          comment: 'Fail',
          flag: false,
        },
        {
          id: 3,
          created_at: '2024-01-01T12:00:00Z',
          updated_at: '2024-01-04T10:00:00Z',
          review: 1,
          requirement: 'req3',
          status: Status.IRRELEVANT,
          comment: 'Irrelevant',
          flag: false,
        },
        {
          id: 4,
          created_at: '2024-01-01T13:00:00Z',
          updated_at: null,
          review: 1,
          requirement: 'req4',
          status: Status.NOT_ASSESSED,
          comment: null,
          flag: false,
        },
      ];

      const result = computeReviewSummary(review, checks);

      expect(result.latestUpdate).toBe('2024-01-04T10:00:00Z');
      expect(result.reviewedCount).toBe(3); // Excludes NOT_ASSESSED
      expect(result.passCount).toBe(1);
      expect(result.failCount).toBe(1);
      expect(result.irrelevantCount).toBe(1);
    });

    it('uses review created_at when no checks have updated_at', () => {
      const review: Review = {
        id: 1,
        created_at: '2024-01-01T00:00:00Z',
        title: 'Test Review',
        excludedContentTypes: null,
        objectType: 'web',
        regulatoryFramework: 'dos',
        selectedPrefillIds: null,
      };

      const checks: Check[] = [
        {
          id: 1,
          created_at: '2024-01-01T10:00:00Z',
          updated_at: null,
          review: 1,
          requirement: 'req1',
          status: Status.PASS,
          comment: 'Pass',
          flag: false,
        },
      ];

      const result = computeReviewSummary(review, checks);

      expect(result.latestUpdate).toBe('2024-01-01T00:00:00Z');
    });

    it('uses review created_at when no checks exist', () => {
      const review: Review = {
        id: 1,
        created_at: '2024-01-01T00:00:00Z',
        title: 'Test Review',
        excludedContentTypes: null,
        objectType: 'web',
        regulatoryFramework: 'dos',
        selectedPrefillIds: null,
      };

      const checks: Check[] = [];

      const result = computeReviewSummary(review, checks);

      expect(result.latestUpdate).toBe('2024-01-01T00:00:00Z');
      expect(result.reviewedCount).toBe(0);
      expect(result.passCount).toBe(0);
      expect(result.failCount).toBe(0);
      expect(result.irrelevantCount).toBe(0);
    });

    it('filters checks by review ID', () => {
      const review: Review = {
        id: 1,
        created_at: '2024-01-01T00:00:00Z',
        title: 'Test Review',
        excludedContentTypes: null,
        objectType: 'web',
        regulatoryFramework: 'dos',
        selectedPrefillIds: null,
      };

      const checks: Check[] = [
        {
          id: 1,
          created_at: '2024-01-01T10:00:00Z',
          updated_at: '2024-01-02T10:00:00Z',
          review: 1,
          requirement: 'req1',
          status: Status.PASS,
          comment: 'Pass',
          flag: false,
        },
        {
          id: 2,
          created_at: '2024-01-01T10:00:00Z',
          updated_at: '2024-01-02T10:00:00Z',
          review: 2, // Different review
          requirement: 'req1',
          status: Status.PASS,
          comment: 'Pass',
          flag: false,
        },
      ];

      const result = computeReviewSummary(review, checks);

      expect(result.reviewedCount).toBe(1);
      expect(result.passCount).toBe(1);
    });

    it('handles checks with null status correctly', () => {
      const review: Review = {
        id: 1,
        created_at: '2024-01-01T00:00:00Z',
        title: 'Test Review',
        excludedContentTypes: null,
        objectType: 'web',
        regulatoryFramework: 'dos',
        selectedPrefillIds: null,
      };

      const checks: Check[] = [
        {
          id: 1,
          created_at: '2024-01-01T10:00:00Z',
          updated_at: null,
          review: 1,
          requirement: 'req1',
          status: null,
          comment: null,
          flag: false,
        },
        {
          id: 2,
          created_at: '2024-01-01T10:00:00Z',
          updated_at: null,
          review: 1,
          requirement: 'req2',
          status: Status.NOT_ASSESSED,
          comment: null,
          flag: false,
        },
      ];

      const result = computeReviewSummary(review, checks);

      expect(result.reviewedCount).toBe(0); // null and NOT_ASSESSED both excluded
      expect(result.passCount).toBe(0);
      expect(result.failCount).toBe(0);
      expect(result.irrelevantCount).toBe(0);
    });

    it('selects latest updated_at correctly', () => {
      const review: Review = {
        id: 1,
        created_at: '2024-01-01T00:00:00Z',
        title: 'Test Review',
        excludedContentTypes: null,
        objectType: 'web',
        regulatoryFramework: 'dos',
        selectedPrefillIds: null,
      };

      const checks: Check[] = [
        {
          id: 1,
          created_at: '2024-01-01T10:00:00Z',
          updated_at: '2024-01-05T10:00:00Z', // Latest
          review: 1,
          requirement: 'req1',
          status: Status.PASS,
          comment: 'Pass',
          flag: false,
        },
        {
          id: 2,
          created_at: '2024-01-01T10:00:00Z',
          updated_at: '2024-01-03T10:00:00Z',
          review: 1,
          requirement: 'req2',
          status: Status.PASS,
          comment: 'Pass',
          flag: false,
        },
        {
          id: 3,
          created_at: '2024-01-01T10:00:00Z',
          updated_at: '2024-01-04T10:00:00Z',
          review: 1,
          requirement: 'req3',
          status: Status.PASS,
          comment: 'Pass',
          flag: false,
        },
      ];

      const result = computeReviewSummary(review, checks);

      expect(result.latestUpdate).toBe('2024-01-05T10:00:00Z');
    });
  });
});
