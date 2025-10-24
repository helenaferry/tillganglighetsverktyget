import { useMutation, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';

import { ReviewService } from '~/data/reviewService';
import type {
  Check,
  PrefillRequirement,
  Review,
  ReviewSummary,
  UpsertCheckInput,
} from '~/data/types';

// All reviews with summary data
export function useReviews(): UseQueryResult<ReviewSummary[], Error> {
  return useQuery<ReviewSummary[], Error>({
    queryKey: ['reviews'],
    queryFn: () => ReviewService.getAllReviewSummaries(),
  });
}

// Get a single review by ID
export function useReviewById(reviewId: string): {
  review?: Review;
  isLoading: boolean;
} {
  const { data: reviewData, isLoading } = useQuery<Review, Error>({
    queryKey: ['review', reviewId],
    queryFn: () => ReviewService.getReviewById(reviewId),
    enabled: !!reviewId && reviewId !== 'undefined',
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
  return { review: reviewData, isLoading };
}

// Get checks for a review
export function useChecksForReview(reviewId: string): { checks?: Check[]; isLoading: boolean } {
  const { data: checksData, isLoading } = useQuery<Check[], Error>({
    queryKey: ['checks', String(reviewId)],
    queryFn: () => {
      return ReviewService.getChecksForReview(String(reviewId));
    },
    enabled: !!reviewId,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
  return { checks: checksData, isLoading };
}

// Get a check by reviewId and requirementId
export function useCheck(
  reviewId: string,
  requirementId: string,
): { check?: Check | null; isLoading: boolean } {
  const { data: checkData, isLoading } = useQuery<Check | null, Error>({
    queryKey: ['check', reviewId, requirementId],
    queryFn: () => ReviewService.getCheckById(reviewId, requirementId),
    enabled: !!reviewId && !!requirementId,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
  return { check: checkData, isLoading };
}

// Update or add check
export function useUpsertCheck() {
  const queryClient = useQueryClient();

  return useMutation<Check, Error, UpsertCheckInput>({
    mutationFn: (input) =>
      ReviewService.upsertCheck({
        ...input,
        reviewId: String(input.reviewId),
      }),
    onSuccess: (_newCheck, input) => {
      queryClient.invalidateQueries({ queryKey: ['check'] });
      queryClient.invalidateQueries({ queryKey: ['checks', String(input.reviewId)] });
      queryClient.invalidateQueries({ queryKey: ['review', String(input.reviewId)] });
    },
  });
}

// Delete check
export function useDeleteCheck() {
  const queryClient = useQueryClient();

  return useMutation<boolean, Error, string>({
    mutationFn: (checkId) => ReviewService.deleteCheck(checkId),
    onSuccess: (_, checkId) => {
      queryClient.invalidateQueries({ queryKey: ['checks', checkId] });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
}

// Disable multiple checks
export function useDisableChecks() {
  const queryClient = useQueryClient();

  return useMutation<Check[], Error, { reviewId: number; requirements: string[] }>({
    mutationFn: ({ reviewId, requirements }) => ReviewService.disableChecks(reviewId, requirements),
    onSuccess: (_, { reviewId }) => {
      queryClient.invalidateQueries({ queryKey: ['checks', reviewId] });
      queryClient.invalidateQueries({ queryKey: ['review', reviewId] });
    },
  });
}

// Enable multiple checks
export function useEnableChecks() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { reviewId: number; requirements: string[] }>({
    mutationFn: ({ reviewId, requirements }) => ReviewService.enableChecks(reviewId, requirements),
    onSuccess: (_, { reviewId }) => {
      queryClient.invalidateQueries({ queryKey: ['checks', reviewId] });
      queryClient.invalidateQueries({ queryKey: ['review', reviewId] });
    },
  });
}

// Prefill requirements
export function usePrefillRequirements() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { reviewId: number; prefills: PrefillRequirement[] }>({
    mutationFn: async ({ reviewId, prefills }) => {
      await ReviewService.prefillChecks(reviewId, prefills);
    },
    onSuccess: (_, { reviewId }) => {
      queryClient.invalidateQueries({ queryKey: ['checks', reviewId] });
      queryClient.invalidateQueries({ queryKey: ['review', reviewId] });
    },
  });
}

// Update or add review
export function useUpsertReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      title: string;
      id?: string;
      excludedContentTypes: string[];
      selectedPrefillIds: string;
      objectType: string;
    }) => ReviewService.upsertReview(input),
    onSuccess: (_newReview, input) => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      if (input.id) {
        queryClient.invalidateQueries({ queryKey: ['review', String(input.id)] });
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
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['review', String(reviewId)] });
      queryClient.invalidateQueries({ queryKey: ['checks', String(reviewId)] });
    },
  });
}
