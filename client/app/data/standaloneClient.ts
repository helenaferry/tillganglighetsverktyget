import { STANDALONE_CLIENT, USE_EXAMPLE_DATA } from '../../public/standaloneConfiguration.js';
import { ApiError } from './apiClient';
import {
  computeReviewSummary,
  flagToNumber,
  normalizeCheck,
  normalizeReview,
} from './localStorageTransformers';
import { standaloneExampleData } from './standaloneExampleData';
import type { Check, Requirement, Review, ReviewSummary } from './types';

// localStorage keys
const STORAGE_KEY_REVIEWS = 'tillgang_reviews';
const STORAGE_KEY_CHECKS = 'tillgang_checks';
const STORAGE_KEY_NEXT_REVIEW_ID = 'tillgang_next_review_id';
const STORAGE_KEY_NEXT_CHECK_ID = 'tillgang_next_check_id';

// Flag to track if example data initialization has been attempted
let initializationAttempted = false;

/**
 * Check if example data should be initialized
 */
function shouldInitializeExampleData(): boolean {
  if (!STANDALONE_CLIENT || !USE_EXAMPLE_DATA) {
    return false;
  }

  // Check if localStorage already has data
  try {
    const existingData = localStorage.getItem(STORAGE_KEY_REVIEWS);
    // If key exists (even if empty array or null string), don't initialize
    // Only initialize if key doesn't exist at all
    if (existingData !== null) {
      return false; // Data key exists, don't overwrite
    }
  } catch {
    // If we can't check, don't initialize
    return false;
  }

  return true;
}

/**
 * Initialize example data in localStorage if conditions are met
 */
function initializeExampleData(): void {
  if (initializationAttempted) {
    return; // Already attempted initialization
  }

  initializationAttempted = true;

  if (!shouldInitializeExampleData()) {
    return;
  }

  try {
    // Save reviews
    saveReviews(standaloneExampleData.reviews);

    // Save checks (saveChecks handles flag conversion internally)
    // Type assertion needed because example data flags are boolean, matching Check type
    saveChecks(standaloneExampleData.checks as Check[]);

    // Set ID counters
    localStorage.setItem(STORAGE_KEY_NEXT_REVIEW_ID, standaloneExampleData.nextReviewId.toString());
    localStorage.setItem(STORAGE_KEY_NEXT_CHECK_ID, standaloneExampleData.nextCheckId.toString());

    console.log('Example data initialized successfully');
  } catch (error) {
    console.warn('Failed to initialize example data:', error);
    // Don't throw - allow app to continue without example data
  }
}

/**
 * Get all reviews from localStorage
 */
function getReviews(): Review[] {
  // Initialize example data on first access if needed
  initializeExampleData();

  try {
    const data = localStorage.getItem(STORAGE_KEY_REVIEWS);
    if (!data) return [];
    return JSON.parse(data) as Review[];
  } catch (error) {
    console.error('Error reading reviews from localStorage:', error);
    return [];
  }
}

/**
 * Save reviews to localStorage
 */
function saveReviews(reviews: Review[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(reviews));
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      throw new ApiError(507, 'Storage quota exceeded');
    }
    throw new ApiError(500, 'Failed to save reviews to localStorage');
  }
}

/**
 * Get all checks from localStorage
 */
function getChecks(): Check[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_CHECKS);
    if (!data) return [];
    const checks = JSON.parse(data) as Check[];
    // Ensure flag is number | null (Oracle format)
    return checks.map((check) => ({
      ...check,
      flag: typeof check.flag === 'boolean' ? flagToNumber(check.flag) : check.flag,
    }));
  } catch (error) {
    console.error('Error reading checks from localStorage:', error);
    return [];
  }
}

/**
 * Save checks to localStorage
 */
function saveChecks(checks: Check[]): void {
  try {
    // Convert flag from boolean to number for storage
    const checksToSave = checks.map((check) => ({
      ...check,
      flag: typeof check.flag === 'boolean' ? flagToNumber(check.flag) : check.flag,
    }));
    localStorage.setItem(STORAGE_KEY_CHECKS, JSON.stringify(checksToSave));
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      throw new ApiError(507, 'Storage quota exceeded');
    }
    throw new ApiError(500, 'Failed to save checks to localStorage');
  }
}

/**
 * Get next review ID (incremental)
 */
function getNextReviewId(): number {
  try {
    const current = localStorage.getItem(STORAGE_KEY_NEXT_REVIEW_ID);
    const nextId = current ? parseInt(current, 10) + 1 : 1;
    localStorage.setItem(STORAGE_KEY_NEXT_REVIEW_ID, nextId.toString());
    return nextId;
  } catch {
    throw new ApiError(500, 'Failed to generate review ID');
  }
}

/**
 * Get next check ID (incremental)
 */
function getNextCheckId(): number {
  try {
    const current = localStorage.getItem(STORAGE_KEY_NEXT_CHECK_ID);
    const nextId = current ? parseInt(current, 10) + 1 : 1;
    localStorage.setItem(STORAGE_KEY_NEXT_CHECK_ID, nextId.toString());
    return nextId;
  } catch {
    throw new ApiError(500, 'Failed to generate check ID');
  }
}

export const standaloneClient = {
  // Requirements endpoints
  requirements: {
    getAllRequirements: async (): Promise<Requirement[]> => {
      const urlToLocalFile = '/krav.json';
      const res = await fetch(urlToLocalFile);
      if (!res.ok) {
        throw new Error(
          `Failed to load requirements from ${urlToLocalFile}: ${res.status} ${res.statusText}`,
        );
      }
      const json: { data: Requirement[] } = await res.json();
      if (!json || !json.data || !Array.isArray(json.data)) {
        throw new Error('Invalid requirements data format: expected { data: Requirement[] }');
      }

      return json.data;
    },
  },

  // Review endpoints
  reviews: {
    getAll: async (): Promise<ReviewSummary[]> => {
      const reviews = getReviews();
      const checks = getChecks();
      return reviews.map((review) => computeReviewSummary(review, checks));
    },

    getById: async (id: string | number): Promise<Review> => {
      const reviews = getReviews();
      const reviewId = typeof id === 'string' ? parseInt(id, 10) : id;
      const review = reviews.find((r) => r.id === reviewId);
      if (!review) {
        throw new ApiError(404, `Review with id ${id} not found`);
      }
      return normalizeReview(review);
    },

    create: async (data: {
      title: string;
      excludedContentTypes: string[];
      selectedPrefillIds: string;
      objectType: string;
      regulatoryFramework: string;
    }): Promise<Review> => {
      const reviews = getReviews();
      const now = new Date().toISOString();
      const newReview: Review = {
        id: getNextReviewId(),
        created_at: now,
        title: data.title,
        excludedContentTypes: data.excludedContentTypes.join(','),
        objectType: data.objectType,
        regulatoryFramework: data.regulatoryFramework,
        selectedPrefillIds: data.selectedPrefillIds,
      };
      reviews.push(newReview);
      saveReviews(reviews);
      return normalizeReview(newReview);
    },

    update: async (
      id: string | number,
      data: {
        title: string;
        excludedContentTypes: string[];
        selectedPrefillIds: string;
        objectType: string;
        regulatoryFramework: string;
      },
    ): Promise<Review> => {
      const reviews = getReviews();
      const reviewId = typeof id === 'string' ? parseInt(id, 10) : id;
      const index = reviews.findIndex((r) => r.id === reviewId);
      if (index === -1) {
        throw new ApiError(404, `Review with id ${id} not found`);
      }
      reviews[index] = {
        ...reviews[index],
        title: data.title,
        excludedContentTypes: data.excludedContentTypes.join(','),
        objectType: data.objectType,
        regulatoryFramework: data.regulatoryFramework,
        selectedPrefillIds: data.selectedPrefillIds,
      };
      saveReviews(reviews);
      return normalizeReview(reviews[index]);
    },

    delete: async (id: number): Promise<void> => {
      const reviews = getReviews();
      const checks = getChecks();
      const reviewId = id;

      // Remove review
      const filteredReviews = reviews.filter((r) => r.id !== reviewId);
      if (filteredReviews.length === reviews.length) {
        throw new ApiError(404, `Review with id ${id} not found`);
      }
      saveReviews(filteredReviews);

      // Remove all associated checks (CASCADE behavior)
      const filteredChecks = checks.filter((c) => c.review !== reviewId);
      saveChecks(filteredChecks);
    },
  },

  // Check endpoints
  checks: {
    getForReview: async (reviewId: string | number): Promise<Check[]> => {
      const checks = getChecks();
      const id = typeof reviewId === 'string' ? parseInt(reviewId, 10) : reviewId;
      return checks.filter((c) => c.review === id).map(normalizeCheck);
    },

    getByRequirement: async (
      reviewId: string | number,
      requirementId: string,
    ): Promise<Check | null> => {
      const checks = getChecks();
      const id = typeof reviewId === 'string' ? parseInt(reviewId, 10) : reviewId;
      const check = checks.find((c) => c.review === id && c.requirement === requirementId);
      return check ? normalizeCheck(check) : null;
    },

    upsert: async (
      reviewId: string | number,
      data: {
        requirement: string;
        status?: number;
        comment?: string;
        flag?: number;
      },
    ): Promise<Check> => {
      const checks = getChecks();
      const id = typeof reviewId === 'string' ? parseInt(reviewId, 10) : reviewId;
      const now = new Date().toISOString();

      // Find existing check
      const existingIndex = checks.findIndex(
        (c) => c.review === id && c.requirement === data.requirement,
      );

      if (existingIndex !== -1) {
        // Update existing
        const existing = checks[existingIndex];
        checks[existingIndex] = {
          ...existing,
          status: data.status !== undefined ? data.status : existing.status,
          comment: data.comment !== undefined ? data.comment : existing.comment,
          flag:
            data.flag !== undefined
              ? typeof data.flag === 'boolean'
                ? flagToNumber(data.flag)
                : data.flag
              : existing.flag,
          updated_at: now,
        };
        saveChecks(checks);
        return normalizeCheck(checks[existingIndex]);
      } else {
        // Create new
        const newCheck: Check = {
          id: getNextCheckId(),
          created_at: now,
          updated_at: now,
          review: id,
          requirement: data.requirement,
          status: data.status ?? null,
          comment: data.comment ?? null,
          flag:
            data.flag !== undefined
              ? typeof data.flag === 'boolean'
                ? flagToNumber(data.flag)
                : data.flag
              : null,
        };
        checks.push(newCheck);
        saveChecks(checks);
        return normalizeCheck(newCheck);
      }
    },

    delete: async (checkId: number): Promise<void> => {
      const checks = getChecks();
      const filtered = checks.filter((c) => c.id !== checkId);
      if (filtered.length === checks.length) {
        throw new ApiError(404, `Check with id ${checkId} not found`);
      }
      saveChecks(filtered);
    },

    bulkDisable: async (reviewId: number, requirements: string[]): Promise<Check[]> => {
      const checks = getChecks();
      const now = new Date().toISOString();
      const updatedChecks: Check[] = [];

      requirements.forEach((requirement) => {
        const existingIndex = checks.findIndex(
          (c) => c.review === reviewId && c.requirement === requirement,
        );

        if (existingIndex !== -1) {
          // Update existing check to IRRELEVANT (status 2)
          checks[existingIndex] = {
            ...checks[existingIndex],
            status: 2, // IRRELEVANT
            comment: checks[existingIndex].comment || '',
            updated_at: now,
          };
          updatedChecks.push(checks[existingIndex]);
        } else {
          // Create new check with IRRELEVANT status
          const newCheck: Check = {
            id: getNextCheckId(),
            created_at: now,
            updated_at: now,
            review: reviewId,
            requirement,
            status: 2, // IRRELEVANT
            comment: '',
            flag: 0,
          };
          checks.push(newCheck);
          updatedChecks.push(newCheck);
        }
      });

      saveChecks(checks);
      return updatedChecks.map(normalizeCheck);
    },

    bulkEnable: async (reviewId: number, requirements: string[]): Promise<void> => {
      const checks = getChecks();
      // Delete checks with IRRELEVANT status (status 2) for the given requirements
      const filtered = checks.filter(
        (c) =>
          !(c.review === reviewId && requirements.includes(c.requirement || '') && c.status === 2),
      );
      saveChecks(filtered);
    },

    bulkDelete: async (reviewId: number, requirements: string[]): Promise<void> => {
      const checks = getChecks();
      const filtered = checks.filter(
        (c) => !(c.review === reviewId && requirements.includes(c.requirement || '')),
      );
      saveChecks(filtered);
    },

    bulkPrefill: async (
      reviewId: number,
      prefills: Array<{
        status: string;
        ids: string[];
        comment: string;
      }>,
    ): Promise<Check[]> => {
      const checks = getChecks();
      const now = new Date().toISOString();
      const statusMap: Record<string, number> = {
        PASS: 1,
        FAIL: 0,
        IRRELEVANT: 2,
        NOT_ASSESSED: 3,
      };
      const updatedChecks: Check[] = [];

      prefills.forEach((prefill) => {
        const statusNum = statusMap[prefill.status] ?? null;
        prefill.ids.forEach((requirementId) => {
          const existingIndex = checks.findIndex(
            (c) => c.review === reviewId && c.requirement === requirementId,
          );

          if (existingIndex !== -1) {
            // Update existing
            checks[existingIndex] = {
              ...checks[existingIndex],
              status: statusNum,
              comment: prefill.comment,
              updated_at: now,
            };
            updatedChecks.push(checks[existingIndex]);
          } else {
            // Create new
            const newCheck: Check = {
              id: getNextCheckId(),
              created_at: now,
              updated_at: now,
              review: reviewId,
              requirement: requirementId,
              status: statusNum,
              comment: prefill.comment,
              flag: 0,
            };
            checks.push(newCheck);
            updatedChecks.push(newCheck);
          }
        });
      });

      saveChecks(checks);
      return updatedChecks.map(normalizeCheck);
    },

    toggleFlag: async (reviewId: number, requirementId: string, flag: boolean): Promise<Check> => {
      const checks = getChecks();
      const now = new Date().toISOString();
      const existingIndex = checks.findIndex(
        (c) => c.review === reviewId && c.requirement === requirementId,
      );

      // Convert boolean to number for storage (Oracle format)
      const flagNumber = flag ? 1 : 0;

      if (existingIndex === -1) {
        // Create check if it doesn't exist (matches backend findOrCreate behavior)
        const newCheck: Check = {
          id: getNextCheckId(),
          created_at: now,
          updated_at: now,
          review: reviewId,
          requirement: requirementId,
          status: 3, // Status.NOT_ASSESSED
          comment: null,
          flag: flagNumber,
        };
        checks.push(newCheck);
        saveChecks(checks);
        return normalizeCheck(newCheck);
      }

      // Update existing check
      checks[existingIndex] = {
        ...checks[existingIndex],
        flag: flagNumber,
        updated_at: now,
      };
      saveChecks(checks);
      return normalizeCheck(checks[existingIndex]);
    },
  },
};
