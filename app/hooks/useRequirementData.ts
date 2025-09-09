import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { Requirement } from '~/data/types';
import { RequirementService } from '~/data/requirementService';


// All requirements
export function useRequirements(path: string = "/krav.json"): UseQueryResult<Requirement[], Error> {
    return useQuery<Requirement[], Error>({
        queryKey: ["requirements", path],
        queryFn: () => RequirementService.getAllRequirements(path),
    });
}

// All requirement categories
export function useRequirementCategories(path: string = "/krav.json"): UseQueryResult<string[], Error> {
    return useQuery<string[], Error>({
        queryKey: ["requirementCategories", path],
        queryFn: () => RequirementService.getAllRequirementCategories(path),
    });
}

// All requirement contentTypes
export function useRequirementContentTypes(path: string = "/krav.json"): UseQueryResult<string[], Error> {
    return useQuery<string[], Error>({
        queryKey: ["requirementContentTypes", path],
        queryFn: () => RequirementService.getAllRequirementContentTypes(path),
    });
}