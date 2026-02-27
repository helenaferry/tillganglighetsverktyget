import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RequirementService } from '~/data/requirementService';
import { ObjectType, type Requirement } from '~/data/types';

import { useRegulatoryFrameworks } from '../useRequirementData';

// Mock the RequirementService
vi.mock('~/data/requirementService', () => ({
  RequirementService: {
    getAllRequirements: vi.fn(),
  },
}));

describe('useRegulatoryFrameworks', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('extracts unique regulatory frameworks from requirements', async () => {
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
        statement: 'Test',
        why: 'Test',
        howToTest: 'Test',
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
        statement: 'Test',
        why: 'Test',
        howToTest: 'Test',
      },
    ];

    vi.mocked(RequirementService.getAllRequirements).mockResolvedValue(mockRequirements);

    const { result } = renderHook(() => useRegulatoryFrameworks(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toContain('dos');
    expect(result.current.data).toContain('lptt');
    expect(result.current.data).toContain('none');
  });

  it('handles comma-separated regulatory frameworks', async () => {
    const mockRequirements: Requirement[] = [
      {
        id: '2',
        name: 'Req 2',
        category: 'Cat B',
        regulatoryFramework: 'dos, lptt',
        objectType: ObjectType.WEB,
        contentType: 'image',
        wcag: '1.2.1',
        en301549: '9.1.2.1',
        statement: 'Test',
        why: 'Test',
        howToTest: 'Test',
      },
    ];

    vi.mocked(RequirementService.getAllRequirements).mockResolvedValue(mockRequirements);

    const { result } = renderHook(() => useRegulatoryFrameworks(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toContain('dos');
    expect(result.current.data).toContain('lptt');
    expect(result.current.data?.length).toBe(2);
  });

  it('trims whitespace from regulatory frameworks', async () => {
    const mockRequirements: Requirement[] = [
      {
        id: '1',
        name: 'Req 1',
        category: 'Cat A',
        regulatoryFramework: ' wcag21 , wcag22 ',
        objectType: ObjectType.WEB,
        contentType: 'text',
        wcag: '1.1.1',
        en301549: '9.1.1.1',
        statement: 'Test',
        why: 'Test',
        howToTest: 'Test',
      },
    ];

    vi.mocked(RequirementService.getAllRequirements).mockResolvedValue(mockRequirements);

    const { result } = renderHook(() => useRegulatoryFrameworks(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toContain('wcag21');
    expect(result.current.data).toContain('wcag22');
    expect(result.current.data).not.toContain(' wcag21 ');
    expect(result.current.data).not.toContain(' wcag22 ');
  });

  it('deduplicates regulatory frameworks', async () => {
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
        statement: 'Test',
        why: 'Test',
        howToTest: 'Test',
      },
      {
        id: '2',
        name: 'Req 2',
        category: 'Cat B',
        regulatoryFramework: 'lptt',
        objectType: ObjectType.WEB,
        contentType: 'image',
        wcag: '1.2.1',
        en301549: '9.1.2.1',
        statement: 'Test',
        why: 'Test',
        howToTest: 'Test',
      },
      {
        id: '3',
        name: 'Req 3',
        category: 'Cat C',
        regulatoryFramework: 'wcag21,wcag21',
        objectType: ObjectType.WEB,
        contentType: 'video',
        wcag: '1.3.1',
        en301549: '9.1.3.1',
        statement: 'Test',
        why: 'Test',
        howToTest: 'Test',
      },
    ];

    vi.mocked(RequirementService.getAllRequirements).mockResolvedValue(mockRequirements);

    const { result } = renderHook(() => useRegulatoryFrameworks(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const wcag21Count = result.current.data?.filter((f) => f === 'wcag21').length;
    expect(wcag21Count).toBe(1);
  });

  it('filters by objectType when provided', async () => {
    const mockRequirements: Requirement[] = [
      {
        id: '1',
        name: 'Web Req',
        category: 'Cat A',
        regulatoryFramework: 'lptt',
        objectType: ObjectType.WEB,
        contentType: 'text',
        wcag: '1.1.1',
        en301549: '9.1.1.1',
        statement: 'Test',
        why: 'Test',
        howToTest: 'Test',
      },
      {
        id: '2',
        name: 'Doc Req',
        category: 'Cat B',
        regulatoryFramework: 'lptt',
        objectType: ObjectType.DOCUMENT,
        contentType: 'pdf',
        wcag: '1.2.1',
        en301549: '10.1.2.1',
        statement: 'Test',
        why: 'Test',
        howToTest: 'Test',
      },
    ];

    vi.mocked(RequirementService.getAllRequirements).mockResolvedValue(mockRequirements);

    const { result } = renderHook(() => useRegulatoryFrameworks(ObjectType.WEB), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toContain('lptt');
    expect(result.current.data).not.toContain('dos');
    expect(result.current.data).toContain('none');
  });

  it('includes all frameworks when no objectType provided', async () => {
    const mockRequirements: Requirement[] = [
      {
        id: '1',
        name: 'Web Req',
        category: 'Cat A',
        regulatoryFramework: 'lptt',
        objectType: ObjectType.WEB,
        contentType: 'text',
        wcag: '1.1.1',
        en301549: '9.1.1.1',
        statement: 'Test',
        why: 'Test',
        howToTest: 'Test',
      },
      {
        id: '2',
        name: 'Doc Req',
        category: 'Cat B',
        regulatoryFramework: 'lptt',
        objectType: ObjectType.DOCUMENT,
        contentType: 'pdf',
        wcag: '1.2.1',
        en301549: '10.1.2.1',
        statement: 'Test',
        why: 'Test',
        howToTest: 'Test',
      },
    ];

    vi.mocked(RequirementService.getAllRequirements).mockResolvedValue(mockRequirements);

    const { result } = renderHook(() => useRegulatoryFrameworks(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toContain('lptt');
    expect(result.current.data).toContain('none');
  });

  it('always includes "none" in the result', async () => {
    const mockRequirements: Requirement[] = [];

    vi.mocked(RequirementService.getAllRequirements).mockResolvedValue(mockRequirements);

    const { result } = renderHook(() => useRegulatoryFrameworks(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toContain('none');
    expect(result.current.data?.length).toBe(1);
  });

  it('handles empty requirements list', async () => {
    vi.mocked(RequirementService.getAllRequirements).mockResolvedValue([]);

    const { result } = renderHook(() => useRegulatoryFrameworks(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(['none']);
  });

  it('handles error from service', async () => {
    vi.mocked(RequirementService.getAllRequirements).mockRejectedValue(new Error('Fetch failed'));

    const { result } = renderHook(() => useRegulatoryFrameworks(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error?.message).toBe('Fetch failed');
  });
});
