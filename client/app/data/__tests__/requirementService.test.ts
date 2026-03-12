/// <reference types="vite/client" />
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RequirementService } from '../requirementService';
import { ObjectType, type Requirement } from '../types';

const API_BASE_URL = window.location.hostname === 'localhost'|| '127.0.0.1' ? 'http://localhost:3000/api' : 'api'

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

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('1');
      expect(result[1].id).toBe('3');
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

  describe('getAllRequirementCategories', () => {
    it('returns unique categories for WEB object type', async () => {
      const mockRequirements: Requirement[] = [
        {
          id: '1',
          name: 'Req 1',
          category: 'Perceivable',
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
          category: 'Operable',
          regulatoryFramework: 'dos',
          objectType: ObjectType.WEB,
          contentType: 'text',
          wcag: '2.1.1',
          en301549: '9.2.1.1',
          statement: 'Test statement',
          why: 'Test why',
          howToTest: 'Test how to test',
        },
        {
          id: '3',
          name: 'Req 3',
          category: 'Perceivable',
          regulatoryFramework: 'dos',
          objectType: ObjectType.WEB,
          contentType: 'image',
          wcag: '1.1.2',
          en301549: '9.1.1.2',
          statement: 'Test statement',
          why: 'Test why',
          howToTest: 'Test how to test',
        },
        {
          id: '4',
          name: 'Doc Req',
          category: 'Document Category',
          regulatoryFramework: 'dos',
          objectType: ObjectType.DOCUMENT,
          contentType: 'pdf',
          wcag: '1.1.1',
          en301549: '10.1.1.1',
          statement: 'Test statement',
          why: 'Test why',
          howToTest: 'Test how to test',
        },
      ];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: mockRequirements }),
      });

      const result = await RequirementService.getAllRequirementCategories(ObjectType.WEB);

      expect(result).toHaveLength(2);
      expect(result).toContain('Perceivable');
      expect(result).toContain('Operable');
      expect(result).not.toContain('Document Category');
    });

    it('returns unique categories for DOCUMENT object type', async () => {
      const mockRequirements: Requirement[] = [
        {
          id: '1',
          name: 'Web Req',
          category: 'Web Category',
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
          name: 'Doc Req 1',
          category: 'Structure',
          regulatoryFramework: 'dos',
          objectType: ObjectType.DOCUMENT,
          contentType: 'pdf',
          wcag: '1.3.1',
          en301549: '10.1.3.1',
          statement: 'Test statement',
          why: 'Test why',
          howToTest: 'Test how to test',
        },
        {
          id: '3',
          name: 'Doc Req 2',
          category: 'Content',
          regulatoryFramework: 'dos',
          objectType: ObjectType.DOCUMENT,
          contentType: 'pdf',
          wcag: '1.3.2',
          en301549: '10.1.3.2',
          statement: 'Test statement',
          why: 'Test why',
          howToTest: 'Test how to test',
        },
      ];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: mockRequirements }),
      });

      const result = await RequirementService.getAllRequirementCategories(ObjectType.DOCUMENT);

      expect(result).toHaveLength(2);
      expect(result).toContain('Structure');
      expect(result).toContain('Content');
      expect(result).not.toContain('Web Category');
    });

    it('throws error when fetch fails', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(RequirementService.getAllRequirementCategories(ObjectType.WEB)).rejects.toThrow(
        /Failed to load requirement categories/,
      );
    });

    it('throws error when response data is not an array', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: null }),
      });

      await expect(RequirementService.getAllRequirementCategories(ObjectType.WEB)).rejects.toThrow(
        'Invalid requirements data format',
      );
    });

    it('returns empty array when no requirements match object type', async () => {
      const mockRequirements: Requirement[] = [
        {
          id: '1',
          name: 'Doc Req',
          category: 'Document Category',
          regulatoryFramework: 'dos',
          objectType: ObjectType.DOCUMENT,
          contentType: 'pdf',
          wcag: '1.1.1',
          en301549: '10.1.1.1',
          statement: 'Test statement',
          why: 'Test why',
          howToTest: 'Test how to test',
        },
      ];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: mockRequirements }),
      });

      const result = await RequirementService.getAllRequirementCategories(ObjectType.WEB);

      expect(result).toEqual([]);
    });
  });

  describe('getAllRequirementContentTypes', () => {
    it('returns unique content types for WEB object type', async () => {
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
          regulatoryFramework: 'dos',
          objectType: ObjectType.WEB,
          contentType: 'text',
          wcag: '1.3.1',
          en301549: '9.1.3.1',
          statement: 'Test statement',
          why: 'Test why',
          howToTest: 'Test how to test',
        },
        {
          id: '4',
          name: 'Doc Req',
          category: 'Doc Cat',
          regulatoryFramework: 'dos',
          objectType: ObjectType.DOCUMENT,
          contentType: 'pdf',
          wcag: '1.1.1',
          en301549: '10.1.1.1',
          statement: 'Test statement',
          why: 'Test why',
          howToTest: 'Test how to test',
        },
      ];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: mockRequirements }),
      });

      const result = await RequirementService.getAllRequirementContentTypes(ObjectType.WEB);

      expect(result).toHaveLength(2);
      expect(result).toContain('text');
      expect(result).toContain('image');
      expect(result).not.toContain('pdf');
    });

    it('filters out null/undefined content types', async () => {
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
          contentType: '',
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

      const result = await RequirementService.getAllRequirementContentTypes(ObjectType.WEB);

      expect(result).toEqual(['text']);
    });

    it('throws error when fetch fails', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
      });

      await expect(
        RequirementService.getAllRequirementContentTypes(ObjectType.WEB),
      ).rejects.toThrow(/Failed to load requirement content types/);
    });

    it('throws error when response data is not an array', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: { invalid: 'format' } }),
      });

      await expect(
        RequirementService.getAllRequirementContentTypes(ObjectType.WEB),
      ).rejects.toThrow('Invalid requirements data format');
    });

    it('returns empty array when no requirements match object type', async () => {
      const mockRequirements: Requirement[] = [
        {
          id: '1',
          name: 'Doc Req',
          category: 'Doc Cat',
          regulatoryFramework: 'dos',
          objectType: ObjectType.DOCUMENT,
          contentType: 'pdf',
          wcag: '1.1.1',
          en301549: '10.1.1.1',
          statement: 'Test statement',
          why: 'Test why',
          howToTest: 'Test how to test',
        },
      ];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: mockRequirements }),
      });

      const result = await RequirementService.getAllRequirementContentTypes(ObjectType.WEB);

      expect(result).toEqual([]);
    });

    it('returns empty array when all content types are null', async () => {
      const mockRequirements: Requirement[] = [
        {
          id: '1',
          name: 'Req 1',
          category: 'Cat A',
          regulatoryFramework: 'dos',
          objectType: ObjectType.WEB,
          contentType: '',
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

      const result = await RequirementService.getAllRequirementContentTypes(ObjectType.WEB);

      expect(result).toEqual([]);
    });
  });
});
