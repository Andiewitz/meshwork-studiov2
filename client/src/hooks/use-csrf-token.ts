import { useQuery, useQueryClient } from "@tanstack/react-query";

const CSRF_TOKEN_KEY = "csrfToken";

/**
 * Hook to fetch and manage CSRF token
 * 
 * Usage:
 * ```tsx
 * const { csrfToken, isLoading, error } = useCsrfToken();
 * 
 * // Then in API requests:
 * fetch('/api/auth/register', {
 *   method: 'POST',
 *   headers: {
 *     'X-CSRF-Token': csrfToken,
 *   },
 *   body: JSON.stringify(data),
 * })
 * ```
 */
export function useCsrfToken() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["csrf-token"],
    queryFn: async () => {
      const response = await fetch("/api/csrf-token");
      if (!response.ok) {
        throw new Error("Failed to fetch CSRF token");
      }
      const json = await response.json();
      return json.csrfToken;
    },
    staleTime: Infinity, // Token doesn't become stale
    retry: true,
    retryDelay: 1000,
  });

  return {
    csrfToken: data || "",
    isLoading,
    error,
  };
}

/**
 * Get stored CSRF token from query cache
 * Returns empty string if not available
 */
export function getCsrfTokenSync(): string {
  const queryClient = useQueryClient();
  const cached = queryClient.getQueryData(["csrf-token"]);
  return (cached as string) || "";
}

/**
 * Refresh CSRF token (useful after logout/login)
 */
export async function refreshCsrfToken(): Promise<string> {
  try {
    const response = await fetch("/api/csrf-token");
    if (!response.ok) {
      throw new Error("Failed to refresh CSRF token");
    }
    const json = await response.json();
    return json.csrfToken;
  } catch (error) {
    console.error("[CSRF] Failed to refresh token:", error);
    throw error;
  }
}
