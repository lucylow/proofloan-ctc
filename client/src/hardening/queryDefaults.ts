import type { QueryClient } from "@tanstack/react-query";
import { shouldRetryQuery } from "./queryError";
import { normalizeAppError } from "./appError";

export function installHardenedQueryDefaults(queryClient: QueryClient) {
  queryClient.setDefaultOptions({
    queries: {
      retry: (failureCount, error) => shouldRetryQuery(error, failureCount),
      retryDelay: attempt => Math.min(2000, 350 * 2 ** attempt),
      staleTime: 15_000,
      gcTime: 10 * 60_000,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: (failureCount, error) => {
        if (failureCount >= 1) return false;
        return normalizeAppError(error, { source: "mutation" }).retryable;
      },
    },
  });
}
