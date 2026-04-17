import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { secureFetch } from "../lib/secure-fetch";
import type { User } from "@shared/schema";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

function getApiUrl(path: string): string {
  if (path.startsWith("http")) return path;
  return `${API_BASE_URL}${path}`;
}

async function fetchUser(): Promise<User | null> {
  // Local Dev Bypass - Instantly see the Dashboard UI without needing Postgres running
  if (import.meta.env.DEV) {
    return {
      id: 1,
      email: "architect@meshwork.dev",
      username: "Andrei",
      firstName: "Andrei",
      profileImageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuC-JTdi7K7guBlCoOvJJUVsjo1JHj0Ok51Bw9bfewYZRrdCNKm96Vq8Esf03yMGfFjz-Nx1o88diz_-CgrcFlaEuF133QGW6enP8CTOPkZJl0ySRO6ZMe-AtabFmhTdW3EhkAYHkBTt7E6x4Inv5fP6wfSJwJOdn4hFT-PbOCoTdUy5TodHgkAX8Y2V5W259KvjJ4pWnlGmcbEbhGUHJAAa1jiqDuRbbhBIC38ALVGuHswMP4FGj74VLcVH-mj5E5IbO9VuDZn8Vzhf",
      password: "mock",
      hasNotifiedTeam: false,
      readNotificationIds: [],
      createdAt: new Date(),
    } as User;
  }

  try {
    const response = await fetch(getApiUrl("/api/auth/me"), {
      credentials: "include",
    });

    if (response.status === 401) {
      console.log("[AuthHook] Fetch user returned 401 (Not logged in)");
      return null;
    }

    if (!response.ok) {
      const text = await response.text();
      console.error("[AuthHook] Fetch user failed:", response.status, text);
      throw new Error(`${response.status}: ${text}`);
    }

    const userData = await response.json();
    console.log("[AuthHook] User fetched successfully:", userData.id || userData.email);
    return userData;
  } catch (err) {
    console.error("[AuthHook] Error in fetchUser:", err);
    // Return null instead of throwing to prevent infinite loading screen
    return null;
  }
}

async function logout(): Promise<void> {
  const response = await secureFetch(getApiUrl("/api/auth/logout"), {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Logout failed");
  }
}

export function useAuth() {
  const queryClient = useQueryClient();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/me"],
    queryFn: fetchUser,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/me"], null);
      setIsRedirecting(true);
      // Clear all queries to ensure fresh state on next login
      queryClient.clear();
    },
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: async (data: { hasNotifiedTeam?: boolean; readNotificationIds?: number[] }) => {
      const response = await secureFetch(getApiUrl("/api/user/preferences"), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Update preferences failed: ${text}`);
      }
      return response.json();
    },
    onSuccess: (updatedData) => {
      queryClient.setQueryData(["/api/auth/me"], (oldUser: any) => {
        if (!oldUser) return null;
        return { ...oldUser, ...updatedData };
      });
    },
  });

  return {
    user,
    isLoading: isLoading || isRedirecting,
    isAuthenticated: !!user,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
    updatePreferences: updatePreferencesMutation.mutateAsync,
    isUpdatingPreferences: updatePreferencesMutation.isPending,
    isRedirecting,
  };
}
