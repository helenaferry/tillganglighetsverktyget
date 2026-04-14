/// <reference types="vite/client" />
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../public/standaloneConfiguration.js', () => ({
  STANDALONE_CLIENT: false,
  USE_EXAMPLE_DATA: false,
}));

import { RequirementService } from '../requirementService';
import { ObjectType, type Requirement } from '../types';

const API_BASE_URL =
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api'
    : 'api';

const REQUIREMENTS_URL = `${API_BASE_URL}/requirements`;

describe('RequirementService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllRequirements', () => {
    it('returns all requirements when no regulatory framework specified', async () => {
      const mockRequirements: Requirement[] = [
        {
          id: '1',
          name: 'Req 1',
          category: 'Cat A',
          regulatoryFramework: 'lptt',
          objectType: ObjectType.WEB,
          contentType: 'text',
          wcag: '1.1.1',
          en301549: '9.1.1.1',
          statement: 'Test statement',
          why: 'Test why',
          howToTest: 'Test how to test',
        },
        {
          id: '2',
          name: 'Req 2',
          category: 'Cat B',
          regulatoryFramework: 'dos',
          objectType: ObjectType.WEB,
          contentType: 'image',
          wcag: '1.2.1',
          en301549: '9.1.2.1',
          statement: 'Test statement',
          why: 'Test why',
          howToTest: 'Test how to test',
        },
      ];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: mockRequirements }),
      });

      const result = await RequirementService.getAllRequirements('');

      expect(result).toEqual(mockRequirements);
      expect(global.fetch).toHaveBeenCalledWith(
        REQUIREMENTS_URL,
        expect.objectContaining({
          headers: expect.any(Headers),
        }),
      );
    });

    it('filters requirements by regulatory framework', async () => {
      const mockRequirements: Requirement[] = [
        {
          id: '1',
          name: 'Req 1',
          category: 'Cat A',
          regulatoryFramework: 'dos',
          objectType: ObjectType.WEB,
          contentType: 'text',
          wcag: '1.1.1',
          en301549: '9.1.1.1',
          statement: 'Test statement',
          why: 'Test why',
          howToTest: 'Test how to test',
        },
        {
          id: '2',
          name: 'Req 2',
          category: 'Cat B',
          regulatoryFramework: 'dos',
          objectType: ObjectType.WEB,
          contentType: 'image',
          wcag: '1.2.1',
          en301549: '9.1.2.1',
          statement: 'Test statement',
          why: 'Test why',
          howToTest: 'Test how to test',
        },
        {
          id: '3',
          name: 'Req 3',
          category: 'Cat C',
          regulatoryFramework: 'dos,lptt',
          objectType: ObjectType.WEB,
          contentType: 'video',
          wcag: '1.3.1',
          en301549: '9.1.3.1',
          statement: 'Test statement',
          why: 'Test why',
          howToTest: 'Test how to test',
        },
      ];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: mockRequirements }),
      });

      const result = await RequirementService.getAllRequirements('dos');

      expect(result).toHaveLength(3);
      expect(result[0].id).toBe('1');
      expect(result[1].id).toBe('2');
    });

    it('throws error when fetch fails', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(RequirementService.getAllRequirements('')).rejects.toThrow(
        /Failed to load requirements/,
      );
    });

    it('throws error when response data is not an array', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: 'invalid' }),
      });

      await expect(RequirementService.getAllRequirements('')).rejects.toThrow(
        'Invalid requirements data format',
      );
    });

    it('throws error when response has no data property', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });

      await expect(RequirementService.getAllRequirements('')).rejects.toThrow(
        'Invalid requirements data format',
      );
    });

    it('returns empty array when no requirements match regulatory framework', async () => {
      const mockRequirements: Requirement[] = [
        {
          id: '1',
          name: 'Req 1',
          category: 'Cat A',
          regulatoryFramework: 'dos',
          objectType: ObjectType.WEB,
          contentType: 'text',
          wcag: '1.1.1',
          en301549: '9.1.1.1',
          statement: 'Test statement',
          why: 'Test why',
          howToTest: 'Test how to test',
        },
      ];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: mockRequirements }),
      });

      const result = await RequirementService.getAllRequirements('en301549');

      expect(result).toEqual([]);
    });
  });
});
