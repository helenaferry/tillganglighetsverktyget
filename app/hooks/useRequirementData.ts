import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { Requirement, ObjectType } from '~/data/types';
import { RequirementService } from '~/data/requirementService';

// All requirements
export function useRequirements(objectType: ObjectType): UseQueryResult<Requirement[], Error> {
  return useQuery<Requirement[], Error>({
    queryKey: ['requirements', objectType],
    queryFn: () => RequirementService.getAllRequirements(objectType),
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
