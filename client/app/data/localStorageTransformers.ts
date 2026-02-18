// Data transformation utilities for localStorage client
// Ensures data matches API format exactly

import type { Check, Review, ReviewSummary } from './types';

/**
 * Converts boolean flag to number (0 or 1) for storage
 */
export function flagToNumber(flag: boolean | null | undefined): number | null {
  if (flag === null || flag === undefined) return null;
  return flag ? 1 : 0;
}

/**
 * Converts number flag (0 or 1) to boolean
 */
export function flagToBoolean(flag: number | null | undefined): boolean | null {
  if (flag === null || flag === undefined) return null;
  return flag === 1;
}

/**
 * Normalizes a Review object to match API format
 */
export function normalizeReview(review: Review): Review {
  return {
    ...review,
    created_at: review.created_at || new Date().toISOString(),
    title: review.title ?? null,
    excludedContentTypes: review.excludedContentTypes ?? null,
    objectType: review.objectType ?? null,
    regulatoryFramework: review.regulatoryFramework ?? null,
    selectedPrefillIds: review.selectedPrefillIds ?? null,
  };
}

/**
 * Normalizes a Check object to match API format
 */
export function normalizeCheck(check: Check): Check {
  return {
    ...check,
    created_at: check.created_at || new Date().toISOString(),
    updated_at: check.updated_at ?? null,
    review: check.review ?? null,
    requirement: check.requirement ?? null,
    status: check.status ?? null,
    comment: check.comment ?? null,
    // Ensure flag is stored as number (0/1) but type system expects boolean
    // We'll handle conversion at storage/retrieval boundaries
    flag: check.flag,
  };
}

/**
 * Computes ReviewSummary fields from a Review and its associated Checks
 * Matches the backend SQL aggregation logic
 */
export function computeReviewSummary(review: Review, checks: Check[]): ReviewSummary {
  const reviewChecks = checks.filter((c) => c.review === review.id);

  // Calculate latestUpdate: max(updated_at) from checks, or created_at from review
  let latestUpdate = review.created_at;
  if (reviewChecks.length > 0) {
    const updates = reviewChecks.map((c) => c.updated_at).filter((u): u is string => u !== null);
    if (updates.length > 0) {
      const sorted = updates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
      latestUpdate = sorted[0];
    }
  }

  // Calculate reviewedCount: checks with status != null and status != 3 (NOT_ASSESSED)
  const reviewedCount = reviewChecks.filter((c) => c.status !== null && c.status !== 3).length;

  // Calculate passCount: checks with status == 1 (PASS)
  const passCount = reviewChecks.filter((c) => c.status === 1).length;

  // Calculate failCount: checks with status == 0 (FAIL)
  const failCount = reviewChecks.filter((c) => c.status === 0).length;

  // Calculate irrelevantCount: checks with status == 2 (IRRELEVANT)
  const irrelevantCount = reviewChecks.filter((c) => c.status === 2).length;

  return {
    ...review,
    latestUpdate,
    reviewedCount,
    passCount,
    failCount,
    irrelevantCount,
  };
}
