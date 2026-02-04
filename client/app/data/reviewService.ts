import { apiClient } from './apiClient';
import {
  type Check,
  type PrefillRequirement,
  type Review,
  type ReviewSummary,
  Status,
} from './types';

export const ReviewService = {
  async getAllReviewSummaries(): Promise<ReviewSummary[]> {
    const reviews = (await apiClient.reviews.getAll()) as ReviewSummary[];
    return reviews;
  },

  async getReviewById(reviewId: string): Promise<Review> {
    const review = (await apiClient.reviews.getById(reviewId)) as Review;
    return review;
  },

  async getChecksForReview(reviewId: string): Promise<Check[]> {
    const checks = (await apiClient.checks.getForReview(reviewId)) as Check[];
    return checks;
  },

  async upsertCheck(input: {
    reviewId: string;
    requirement: string;
    status?: Status;
    comment?: string;
  }): Promise<Check> {
    const { reviewId, requirement, status, comment } = input;

    const check = (await apiClient.checks.upsert(reviewId, {
      requirement,
      status,
      comment,
    })) as Check;

    return check;
  },

  async getCheckById(reviewId: string, requirementId: string): Promise<Check | null> {
    const check = (await apiClient.checks.getByRequirement(
      reviewId,
      requirementId,
    )) as Check | null;
    return check;
  },

  async deleteCheck(checkId: string): Promise<boolean> {
    await apiClient.checks.delete(Number(checkId));
    return true;
  },

  async deleteChecks(reviewId: number, requirementIds: string[]): Promise<boolean> {
    await apiClient.checks.bulkDelete(reviewId, requirementIds);
    return true;
  },

  async disableChecks(reviewId: number, requirements: string[]): Promise<Check[]> {
    const checks = (await apiClient.checks.bulkDisable(reviewId, requirements)) as Check[];
    return checks;
  },

  async enableChecks(reviewId: number, requirements: string[]): Promise<void> {
    await apiClient.checks.bulkEnable(reviewId, requirements);
  },

  async prefillChecks(reviewId: number, prefills: PrefillRequirement[]): Promise<Check[]> {
    const checks = (await apiClient.checks.bulkPrefill(reviewId, prefills)) as Check[];
    return checks;
  },

  async upsertReview(input: {
    title: string;
    id?: string;
    excludedContentTypes: string[];
    selectedPrefillIds: string;
    objectType: string;
    regulatoryFramework: string;
  }): Promise<Review> {
    const { title, id, excludedContentTypes, selectedPrefillIds, objectType, regulatoryFramework } =
      input;

    const reviewData = {
      title,
      excludedContentTypes,
      selectedPrefillIds,
      objectType,
      regulatoryFramework,
    };

    if (id) {
      const review = (await apiClient.reviews.update(id, reviewData)) as Review;
      return review;
    } else {
      const review = (await apiClient.reviews.create(reviewData)) as Review;
      return review;
    }
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async deleteChecksForReview(reviewId: number): Promise<void> {
    // Checks are deleted automatically via CASCADE constraint in database
    // This method kept for API compatibility
  },

  async deleteReview(reviewId: number): Promise<void> {
    await apiClient.reviews.delete(reviewId);
  },

  async toggleCheckFlag(reviewId: number, requirementId: string, flag: boolean): Promise<Check> {
    const check = (await apiClient.checks.toggleFlag(reviewId, requirementId, flag)) as Check;
    return check;
  },
};
