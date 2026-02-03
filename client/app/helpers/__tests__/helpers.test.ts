import { describe, expect, it } from 'vitest';

import { ObjectType, type RequirementWithCheck, Status } from '~/data/types';
import {
  numberChecked,
  numberPerStatus,
  numberRemaining,
  percentageChecked,
} from '~/helpers/helpers';

describe('helpers', () => {
  // Mock data
  const mockRequirements: RequirementWithCheck[] = [
    {
      id: '1',
      name: 'Krav 1',
      regulatoryFramework: 'WCAG',
      wcag: '1.1.1',
      en301549: '',
      contentType: 'Bilder',
      category: 'Kategori 1',
      objectType: ObjectType.WEB,
      statement: 'Statement 1',
      why: 'Why 1',
      howToTest: 'How to test 1',
      check: {
        id: 1,
        requirement: '1',
        review: 1,
        status: Status.PASS,
        comment: '',
        flag: null,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      },
    },
    {
      id: '2',
      name: 'Krav 2',
      regulatoryFramework: 'WCAG',
      wcag: '1.1.2',
      en301549: '',
      contentType: 'Formulär',
      category: 'Kategori 1',
      objectType: ObjectType.WEB,
      statement: 'Statement 2',
      why: 'Why 2',
      howToTest: 'How to test 2',
      check: {
        id: 2,
        requirement: '2',
        review: 1,
        status: Status.FAIL,
        comment: '',
        flag: null,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      },
    },
    {
      id: '3',
      name: 'Krav 3',
      regulatoryFramework: 'WCAG',
      wcag: '1.1.3',
      en301549: '',
      contentType: 'Video',
      category: 'Kategori 2',
      objectType: ObjectType.WEB,
      statement: 'Statement 3',
      why: 'Why 3',
      howToTest: 'How to test 3',
      check: {
        id: 3,
        requirement: '3',
        review: 1,
        status: Status.IRRELEVANT,
        comment: '',
        flag: null,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      },
    },
    {
      id: '4',
      name: 'Krav 4',
      regulatoryFramework: 'WCAG',
      wcag: '1.1.4',
      en301549: '',
      contentType: 'Bilder',
      category: 'Kategori 2',
      objectType: ObjectType.WEB,
      statement: 'Statement 4',
      why: 'Why 4',
      howToTest: 'How to test 4',
      check: undefined,
    },
    {
      id: '5',
      name: 'Krav 5',
      regulatoryFramework: 'WCAG',
      wcag: '1.1.5',
      en301549: '',
      contentType: 'Formulär',
      category: 'Kategori 2',
      objectType: ObjectType.WEB,
      statement: 'Statement 5',
      why: 'Why 5',
      howToTest: 'How to test 5',
      check: {
        id: 5,
        requirement: '5',
        review: 1,
        status: Status.NOT_ASSESSED,
        comment: '',
        flag: null,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      },
    },
  ];

  describe('numberChecked', () => {
    it('should count requirements with PASS, FAIL, or IRRELEVANT status', () => {
      expect(numberChecked(mockRequirements)).toBe(3);
    });

    it('should return 0 for empty array', () => {
      expect(numberChecked([])).toBe(0);
    });

    it('should not count NOT_ASSESSED or undefined checks', () => {
      const notAssessedReqs = mockRequirements.filter(
        (req) => !req.check || req.check.status === Status.NOT_ASSESSED,
      );
      expect(numberChecked(notAssessedReqs)).toBe(0);
    });
  });

  describe('percentageChecked', () => {
    it('should calculate correct percentage', () => {
      // 3 av 5 = 60%
      expect(percentageChecked(mockRequirements)).toBe(60);
    });

    it('should return 0 for empty array', () => {
      expect(percentageChecked([])).toBe(0);
    });

    it('should return 100 when all are checked', () => {
      const allChecked = mockRequirements.slice(0, 3);
      expect(percentageChecked(allChecked)).toBe(100);
    });

    it('should return 0 when none are checked', () => {
      const noneChecked = mockRequirements.slice(3, 5);
      expect(percentageChecked(noneChecked)).toBe(0);
    });
  });

  describe('numberPerStatus', () => {
    it('should count requirements by status correctly', () => {
      const result = numberPerStatus(mockRequirements);
      expect(result.passCount).toBe(1);
      expect(result.failCount).toBe(1);
      expect(result.irrelevantCount).toBe(1);
      expect(result.notAssessedCount).toBe(2);
    });

    it('should return zeros for empty array', () => {
      const result = numberPerStatus([]);
      expect(result.passCount).toBe(0);
      expect(result.failCount).toBe(0);
      expect(result.irrelevantCount).toBe(0);
      expect(result.notAssessedCount).toBe(0);
    });

    it('should count undefined checks as not assessed', () => {
      const reqsWithUndefined = mockRequirements.filter((req) => !req.check);
      const result = numberPerStatus(reqsWithUndefined);
      expect(result.notAssessedCount).toBe(1);
    });
  });

  describe('numberRemaining', () => {
    it('should count requirements that are not assessed', () => {
      expect(numberRemaining(mockRequirements)).toBe(2);
    });

    it('should return 0 when all are assessed', () => {
      const allAssessed = mockRequirements.slice(0, 3);
      expect(numberRemaining(allAssessed)).toBe(0);
    });

    it('should return total count when none are assessed', () => {
      const noneAssessed = mockRequirements.slice(3, 5);
      expect(numberRemaining(noneAssessed)).toBe(2);
    });

    it('should return 0 for empty array', () => {
      expect(numberRemaining([])).toBe(0);
    });
  });
});
