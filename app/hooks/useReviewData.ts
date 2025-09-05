import { useQuery, useMutation, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import React from 'react';
import type { Application, Category, Check, FullReview, Requirement, ReviewSummary, RequirementWithCheck, UpsertCheckInput } from '~/data/types';
import { ReviewService } from '~/data/reviewService';

// All reviews with summary data
export function useReviews(): UseQueryResult<ReviewSummary[], Error> {
    return useQuery<ReviewSummary[], Error>({
        queryKey: ["reviews"],
        queryFn: () => ReviewService.getAllReviewSummaries(),
    });
}

// All requirements
export function useRequirements(path: string = "/tillganglighetslistan.json"): UseQueryResult<Requirement[], Error> {
    return useQuery<Requirement[], Error>({
        queryKey: ["requirements", path],
        queryFn: () => ReviewService.getAllRequirements(path),
    });
}

// All requirement categories
export function useRequirementCategories(path: string = "/tillganglighetslistan.json"): UseQueryResult<string[], Error> {
    return useQuery<string[], Error>({
        queryKey: ["requirementCategories", path],
        queryFn: () => ReviewService.getAllRequirementCategories(path),
    });
}

// Requirements grouped by category
export function useCategoriesWithRequirements(categories: string[] | undefined, requirements: RequirementWithCheck[] | undefined): Category[] {
    if (!categories || !requirements) return [];
    return categories.map(category => ({
        category,
        requirements: requirements.filter(req => req.category === category)
    }));
}

// Full review with requirements and checks
export function useFullReview(reviewId: string): { review?: FullReview; isLoading: boolean } {
    const { data: requirements, isLoading: requirementsLoading } = useRequirements();

    const { data: reviewData, isLoading: reviewLoading } = useQuery<ReviewSummary, Error>({
        queryKey: ["review", reviewId],
        queryFn: () => ReviewService.getReviewById(reviewId),
        enabled: !!reviewId,
    });

    const { data: checks, isLoading: checksLoading } = useQuery<Check[], Error>({
        queryKey: ["checks", reviewId],
        queryFn: () => ReviewService.getChecksForReview(reviewId),
        enabled: !!reviewId,
    });

    const fullReview: FullReview | undefined = React.useMemo(() => {
        if (!reviewData || !requirements) return undefined;

        const reqsWithChecks = requirements.map(req => {
            const check = checks?.find(c => String(c.requirement) === String(req.id));
            return { ...req, check };
        });

        return {
            id: reviewData.id,
            created_at: reviewData.created_at,
            title: reviewData.title,
            application: reviewData.application,
            requirements: reqsWithChecks,
        };
    }, [reviewData, requirements, checks]);

    return { review: fullReview, isLoading: reviewLoading || requirementsLoading || checksLoading };
}

// Update or add check
export function useUpsertCheck() {
    const queryClient = useQueryClient();

    return useMutation<Check, Error, UpsertCheckInput>({
        mutationFn: input => ReviewService.upsertCheck({
            ...input,
            reviewId: String(input.reviewId),
        }),
        onSuccess: (_newCheck, input) => {
            queryClient.invalidateQueries({ queryKey: ["checks", String(input.reviewId)] });
            queryClient.invalidateQueries({ queryKey: ["review", String(input.reviewId)] });
        },
    });
}

// Delete check
export function useDeleteCheck() {
    const queryClient = useQueryClient();

    return useMutation<boolean, Error, string>({
        mutationFn: checkId => ReviewService.deleteCheck(checkId),
        onSuccess: (_, checkId) => {
            queryClient.invalidateQueries({ queryKey: ["checks", checkId] });
            queryClient.invalidateQueries({ queryKey: ["review", checkId] });
        },
    });
}

// Disable multiple checks
export function useDisableChecks() {
    const queryClient = useQueryClient();

    return useMutation<Check[], Error, { reviewId: number; requirements: string[] }>({
        mutationFn: ({ reviewId, requirements }) => ReviewService.disableChecks(reviewId, requirements),
        onSuccess: (_, { reviewId }) => {
            queryClient.invalidateQueries({ queryKey: ["checks", reviewId] });
            queryClient.invalidateQueries({ queryKey: ["review", reviewId] });
        },
    });
}

// All applications
export function useApplications(): UseQueryResult<Application[], Error> {
    return useQuery<Application[], Error>({
        queryKey: ["applications"],
        queryFn: () => ReviewService.getApplications(),
    });
}

// Update or add review
export function useUpsertReview() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: { title: string; application: string; id?: string, excludedContentTypes: string[] }) =>
            ReviewService.upsertReview(input),
        onSuccess: (_newReview, input) => {
            queryClient.invalidateQueries({ queryKey: ["reviews"] });
            if (input.id) {
                queryClient.invalidateQueries({ queryKey: ["review", String(input.id)] });
            }
        },
    });
}

// Delete review and all associated checks
export function useDeleteReview() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (reviewId: number) => {
            // Delete all checks for this review
            await ReviewService.deleteChecksForReview(reviewId);
            // Delete the review itself
            await ReviewService.deleteReview(reviewId);
        },
        onSuccess: (_, reviewId) => {
            queryClient.invalidateQueries({ queryKey: ["reviews"] });
            queryClient.invalidateQueries({ queryKey: ["review", String(reviewId)] });
            queryClient.invalidateQueries({ queryKey: ["checks", String(reviewId)] });
        },
    });
}