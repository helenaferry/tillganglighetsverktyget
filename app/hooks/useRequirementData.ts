import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { RequirementService } from '~/data/requirementService';
import type { ObjectType, Requirement } from '~/data/types';

// All requirements
export function useRequirements(): UseQueryResult<Requirement[], Error> {
  return useQuery<Requirement[], Error>({
    queryKey: ['requirements'],
    queryFn: () => RequirementService.getAllRequirements(),
  });
}

// All requirement categories
export function useRequirementCategories(objectType: ObjectType): UseQueryResult<string[], Error> {
  return useQuery<string[], Error>({
    queryKey: ['requirementCategories', objectType],
    queryFn: () => RequirementService.getAllRequirementCategories(objectType),
  });
}

// All requirement contentTypes
export function useRequirementContentTypes(
  objectType: ObjectType,
): UseQueryResult<string[], Error> {
  return useQuery<string[], Error>({
    queryKey: ['requirementContentTypes', objectType],
    queryFn: () => RequirementService.getAllRequirementContentTypes(objectType),
  });
}
