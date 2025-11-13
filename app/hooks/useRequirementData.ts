import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { RequirementService } from '~/data/requirementService';
import type { ObjectType, Requirement } from '~/data/types';

// All requirements
export function useRequirements(
  regulatoryFramework?: string,
): UseQueryResult<Requirement[], Error> {
  return useQuery<Requirement[], Error>({
    queryKey: ['requirements', regulatoryFramework],
    queryFn: () =>
      RequirementService.getAllRequirements(
        regulatoryFramework && regulatoryFramework !== 'none' ? regulatoryFramework : '',
      ),
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

// All requirement regulatory frameworks
export function useRegulatoryFrameworks(objectType?: ObjectType): UseQueryResult<string[], Error> {
  return useQuery<string[], Error>({
    queryKey: ['requirementRegulatoryFrameworks', objectType],
    queryFn: async () => {
      const requirements = await RequirementService.getAllRequirements('');
      const frameworks = Array.from(
        new Set(
          requirements
            .filter((req) => (objectType ? req.objectType === objectType : true))
            .flatMap((req) => req.regulatoryFramework.split(',').map((f) => f.trim())),
        ),
      );
      return [...frameworks, 'none'];
    },
  });
}
