import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { RequirementService } from '~/data/requirementService';
import type { Requirement } from '~/data/types';

// Cache configuration for requirements queries
// Requirements data is relatively static and doesn't change often,
// so we cache it aggressively to avoid unnecessary refetches
const REQUIREMENTS_CACHE_CONFIG = {
  staleTime: Infinity, // Data never becomes stale - requirements rarely change
  gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes after last use (React Query v5)
  refetchOnMount: false, // Don't refetch when component mounts if data exists in cache
  refetchOnWindowFocus: false, // Don't refetch when window regains focus
  refetchOnReconnect: false, // Don't refetch when network reconnects
};

// All requirements
export function useRequirements(
  regulatoryFramework?: string,
  options?: { enabled?: boolean },
): UseQueryResult<Requirement[], Error> {
  // Normalize undefined to empty string for consistent cache keys
  const normalizedFramework =
    regulatoryFramework && regulatoryFramework !== 'none' ? regulatoryFramework : '';

  return useQuery<Requirement[], Error>({
    queryKey: ['requirements', normalizedFramework],
    queryFn: () => RequirementService.getAllRequirements(normalizedFramework),
    ...REQUIREMENTS_CACHE_CONFIG,
    ...(options?.enabled !== undefined ? { enabled: options.enabled } : {}),
  });
}
