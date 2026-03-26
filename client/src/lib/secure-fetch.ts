import { useQueryClient } from "@tanstack/react-query";

/**
 * Helper to get CSRF token from query cache
 */
function getCsrfTokenFromCache(): string {
  try {
    const queryClient = useQueryClient();
    return (queryClient.getQueryData(["csrf-token"]) as string) || "";
  } catch {
    return "";
  }
}

/**
 * Enhanced fetch function that automatically includes CSRF token
 * 
 * This wraps the native fetch API to automatically add:
 * - X-CSRF-Token header for state-changing requests
 * - Proper error handling
 * 
 * Usage is identical to fetch():
 * ```tsx
 * const response = await secureFetch('/api/auth/register', {
 *   method: 'POST',
 *   body: JSON.stringify(data),
 * });
 * ```
 */
export async function secureFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const method = (init?.method || "GET").toUpperCase();
  
  // Only add CSRF token for state-changing requests
  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    const csrfToken = getCsrfToken();
    
    // Initialize headers if not present
    if (!init) {
      init = {};
    }
    if (!init.headers) {
      init.headers = {};
    }

    // Ensure headers is a plain object (can be HeadersInit)
    const headers = new Headers(init.headers as HeadersInit);
    
    // Add CSRF token
    if (csrfToken) {
      headers.set("X-CSRF-Token", csrfToken);
    }
    
    init.headers = headers;
  }

  return fetch(input, init);
}

/**
 * Get CSRF token from sessionStorage
 */
function getCsrfToken(): string {
  if (typeof window !== "undefined") {
    const stored = sessionStorage.getItem("csrfToken");
    if (stored) {
      console.log("[SecureFetch] Using CSRF token from sessionStorage");
      return stored;
    }
  }
  console.warn("[SecureFetch] No CSRF token found in sessionStorage");
  return "";
}

/**
 * Store CSRF token in session storage
 */
export function storeCsrfToken(token: string): void {
  if (typeof window !== "undefined") {
    sessionStorage.setItem("csrfToken", token);
  }
}

/**
 * Clear CSRF token
 */
export function clearCsrfToken(): void {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("csrfToken");
  }
}
