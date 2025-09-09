import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { Requirement } from '~/data/types';
import { RequirementService } from '~/data/requirementService';


// All requirements
export function useRequirements(): UseQueryResult<Requirement[], Error> {
    return useQuery<Requirement[], Error>({
        queryKey: ["requirements"],
        queryFn: () => RequirementService.getAllRequirements(),
    });
}

// All requirement categories
export function useRequirementCategories(): UseQueryResult<string[], Error> {
    return useQuery<string[], Error>({
        queryKey: ["requirementCategories"],
        queryFn: () => RequirementService.getAllRequirementCategories(),
    });
}

// All requirement contentTypes
export function useRequirementContentTypes(): UseQueryResult<string[], Error> {
    return useQuery<string[], Error>({
        queryKey: ["requirementContentTypes"],
        queryFn: () => RequirementService.getAllRequirementContentTypes(),
    });
}