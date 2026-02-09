import { QueryClient } from '@tanstack/react-query';

// Create QueryClient as a singleton outside of component tree
// This ensures it persists across navigation and HMR updates
let queryClientInstance: QueryClient | undefined;

export function getQueryClient(): QueryClient {
  if (!queryClientInstance) {
    queryClientInstance = new QueryClient({
      defaultOptions: {
        queries: {
          // Default to not refetching aggressively - individual queries can override
          refetchOnWindowFocus: false,
          refetchOnReconnect: false,
          // Keep data in cache for 5 minutes by default
          gcTime: 5 * 60 * 1000,
        },
      },
    });
  }

  return queryClientInstance;
}
