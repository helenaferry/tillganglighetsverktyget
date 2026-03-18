// API Client for backend REST API

import type { Requirement } from './types';

const getBaseUrl = (): string => {
  if (window.location.hostname == 'localhost') {
    console.log('localhost');
    return 'http://localhost:3000/api';
  } else {
    console.log('not localhost ');
    return `https://${window.location.hostname}/api`;
  }
};
const API_BASE_URL = getBaseUrl();

console.log(
  'API_BASE_URL: ',
  API_BASE_URL,
  ' window.location.hostname: ',
  window.location.hostname,
);

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(
  baseUrl: string = API_BASE_URL,
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${baseUrl}${endpoint}`;

  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new ApiError(response.status, error.error || `HTTP ${response.status}`);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

export const apiClient = {
  // Requirements endpoints (proxied through server to avoid CORS)
  requirements: {
    getAllRequirements: async (): Promise<Requirement[]> => {
      const response = await fetchApi<{ data: Requirement[] }>(API_BASE_URL, `/requirements`);

      // Validate response structure
      if (!response || !response.data || !Array.isArray(response.data)) {
        throw new ApiError(500, 'Invalid response format: expected { data: Requirement[] }');
      }

      return response.data;
    },
  },

  // Review endpoints
  reviews: {
    getAll: () => fetchApi(API_BASE_URL, '/reviews'),

    getById: (id: string | number) => fetchApi(API_BASE_URL, `/reviews/${id}`),

    create: (data: {
      title: string;
      excludedContentTypes: string[];
      selectedPrefillIds: string;
      objectType: string;
      regulatoryFramework: string;
    }) =>
      fetchApi(API_BASE_URL, '/reviews', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (
      id: string | number,
      data: {
        title: string;
        excludedContentTypes: string[];
        selectedPrefillIds: string;
        objectType: string;
        regulatoryFramework: string;
      },
    ) =>
      fetchApi(API_BASE_URL, `/reviews/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    delete: (id: number) =>
      fetchApi(API_BASE_URL, `/reviews/${id}`, {
        method: 'DELETE',
      }),
  },

  // Check endpoints
  checks: {
    getForReview: (reviewId: string | number) =>
      fetchApi(API_BASE_URL, `/reviews/${reviewId}/checks`),

    getByRequirement: (reviewId: string | number, requirementId: string) =>
      fetchApi(API_BASE_URL, `/reviews/${reviewId}/checks/${requirementId}`),

    upsert: (
      reviewId: string | number,
      data: {
        requirement: string;
        status?: number;
        comment?: string;
        flag?: number;
      },
    ) =>
      fetchApi(API_BASE_URL, `/reviews/${reviewId}/checks`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    delete: (checkId: number) =>
      fetchApi(API_BASE_URL, `/reviews/checks/${checkId}`, {
        method: 'DELETE',
      }),

    bulkDisable: (reviewId: number, requirements: string[]) =>
      fetchApi(API_BASE_URL, `/reviews/${reviewId}/checks/bulk-disable`, {
        method: 'POST',
        body: JSON.stringify({ requirements }),
      }),

    bulkEnable: (reviewId: number, requirements: string[]) =>
      fetchApi(API_BASE_URL, `/reviews/${reviewId}/checks/bulk-enable`, {
        method: 'POST',
        body: JSON.stringify({ requirements }),
      }),

    bulkDelete: (reviewId: number, requirements: string[]) =>
      fetchApi(API_BASE_URL, `/reviews/${reviewId}/checks/bulk-delete`, {
        method: 'POST',
        body: JSON.stringify({ requirements }),
      }),

    bulkPrefill: (
      reviewId: number,
      prefills: Array<{
        status: string;
        ids: string[];
        comment: string;
      }>,
    ) =>
      fetchApi(API_BASE_URL, `/reviews/${reviewId}/checks/bulk-prefill`, {
        method: 'POST',
        body: JSON.stringify({ prefills }),
      }),

    toggleFlag: (reviewId: number, requirementId: string, flag: boolean) =>
      fetchApi(API_BASE_URL, `/reviews/${reviewId}/checks/${requirementId}/toggle-flag`, {
        method: 'POST',
        body: JSON.stringify({ flag }),
      }),
  },
};

export { ApiError };
