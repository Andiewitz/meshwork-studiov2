import { useEffect } from "react";
import { storeCsrfToken } from "./secure-fetch";

/**
 * Initialize CSRF token on app load
 * Should be called once in App.tsx or a layout component
 */
export function useCsrfTokenInitializer() {
  useEffect(() => {
    // Fetch CSRF token on mount
    const initializeCsrfToken = async () => {
      try {
        const response = await fetch("/api/csrf-token");
        if (response.ok) {
          const data = await response.json();
          if (data.csrfToken) {
            storeCsrfToken(data.csrfToken);
          }
        }
      } catch (error) {
        console.error("[CSRF] Failed to initialize token:", error);
        // Continue anyway - token will be fetched on first use if needed
      }
    };

    initializeCsrfToken();
  }, []);
}
