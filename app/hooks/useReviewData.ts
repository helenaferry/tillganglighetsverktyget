import { useQuery, useMutation, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import React from 'react';
import type { Check, FullReview, Requirement, ReviewWithApplication, UpsertCheckInput } from '~/data/types';
import { ReviewService } from '~/data/reviewService';

// Alla granskningar (grunddata + application)
export function useReviews(): UseQueryResult<ReviewWithApplication[], Error> {
    return useQuery<ReviewWithApplication[], Error>({
        queryKey: ["reviews"],
        queryFn: () => ReviewService.getAllReviews(),
    });
}

// Alla krav
export function useRequirementsData(path: string = "/tillganglighetslistan.json"): UseQueryResult<Requirement[], Error> {
    return useQuery<Requirement[], Error>({
        queryKey: ["requirements", path],
        queryFn: () => ReviewService.getAllRequirements(path),
    });
}

// Fullständig granskning med krav och checks
export function useFullReview(reviewId: string): { review?: FullReview; isLoading: boolean } {
    const { data: requirements, isLoading: requirementsLoading } = useRequirementsData();

    const { data: reviewData, isLoading: reviewLoading } = useQuery<ReviewWithApplication, Error>({
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

// Uppdatera eller lägg till check om den inte redan finns
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

// Ta bort en check
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

// Sätt flera checks som irrelevanta
export function useDisableChecks() {
    const queryClient = useQueryClient();

    return useMutation<Check[], Error, { reviewId: string; requirements: string[] }>({
        mutationFn: ({ reviewId, requirements }) => ReviewService.disableChecks(reviewId, requirements),
        onSuccess: (_, { reviewId }) => {
            queryClient.invalidateQueries({ queryKey: ["checks", reviewId] });
            queryClient.invalidateQueries({ queryKey: ["review", reviewId] });
        },
    });
}
