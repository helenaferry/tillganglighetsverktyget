import { describe, expect, it } from 'vitest';

import {
  formatDate,
  formatDateAndTime,
  formatDateLong,
  formatPercentage,
} from '~/formattingHelpers';

describe('formattingHelpers', () => {
  describe('formatDate', () => {
    it('should format date as YYYY-MM-DD', () => {
      expect(formatDate('2024-03-15T10:30:00Z')).toBe('2024-03-15');
    });

    it('should handle single digit months and days with zero padding', () => {
      expect(formatDate('2024-01-05T10:30:00Z')).toBe('2024-01-05');
    });

    it('should format dates from different time zones consistently', () => {
      expect(formatDate('2024-12-25T23:59:59Z')).toMatch(/2024-12-(25|26)/);
    });
  });

  describe('formatDateAndTime', () => {
    it('should format date and time as YYYY-MM-DD HH:MM', () => {
      const result = formatDateAndTime('2024-03-15T14:30:00Z');
      expect(result).toMatch(/2024-03-15 \d{2}:\d{2}/);
    });

    it('should pad hours and minutes with zeros', () => {
      const result = formatDateAndTime('2024-01-05T08:05:00Z');
      expect(result).toMatch(/2024-01-05 \d{2}:\d{2}/);
    });
  });

  describe('formatDateLong', () => {
    it('should format date in Swedish long format', () => {
      const result = formatDateLong('2024-03-15T10:30:00Z');
      expect(result).toContain('mars');
      expect(result).toContain('2024');
    });

    it('should format January dates correctly', () => {
      const result = formatDateLong('2024-01-15T10:30:00Z');
      expect(result).toContain('januari');
    });

    it('should format December dates correctly', () => {
      const result = formatDateLong('2024-12-24T10:30:00Z');
      expect(result).toContain('december');
    });
  });

  describe('formatPercentage', () => {
    it('should format 0 as 0%', () => {
      expect(formatPercentage(0)).toBe('0%');
    });

    it('should format 1 as 100%', () => {
      expect(formatPercentage(1)).toBe('100%');
    });

    it('should format 0.5 as 50%', () => {
      expect(formatPercentage(0.5)).toBe('50%');
    });

    it('should round to nearest integer', () => {
      expect(formatPercentage(0.456)).toBe('46%');
      expect(formatPercentage(0.755)).toBe('76%');
    });

    it('should handle decimal values correctly', () => {
      expect(formatPercentage(0.123)).toBe('12%');
      expect(formatPercentage(0.999)).toBe('100%');
    });
  });
});
