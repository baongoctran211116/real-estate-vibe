// filename: src/app/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

/**
 * Singleton QueryClient exported for use outside React tree
 * (e.g. prefetching, invalidating from Zustand actions)
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});
