import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { secureFetch } from "../lib/secure-fetch";
import { useAuth } from "./use-auth";
import { api } from "@shared/routes";
import type { Team, TeamMember, Workspace } from "@shared/schema";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

function getApiUrl(path: string): string {
  if (path.startsWith("http")) return path;
  return `${API_BASE_URL}${path}`;
}

// ─── Types ───────────────────────────────────────────────────────────

export interface TeamWithCount extends Team {
  memberCount: number;
}

export interface TeamDetail extends Team {
  members: (TeamMember & {
    email: string;
    firstName: string | null;
    profileImageUrl: string | null;
  })[];
}

// ─── Queries ─────────────────────────────────────────────────────────

export function useTeams() {
  const { isAuthenticated } = useAuth();

  return useQuery<TeamWithCount[]>({
    queryKey: ["/api/teams"],
    queryFn: async () => {
      const res = await fetch(getApiUrl("/api/teams"), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch teams");
      return res.json();
    },
    enabled: isAuthenticated,
    refetchInterval: 5000,
  });
}

export function useTeam(teamId: string | null) {
  const { isAuthenticated } = useAuth();

  return useQuery<TeamDetail>({
    queryKey: ["/api/teams", teamId],
    queryFn: async () => {
      const res = await fetch(getApiUrl(`/api/teams/${teamId}`), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch team");
      return res.json();
    },
    enabled: isAuthenticated && !!teamId,
    refetchInterval: 5000,
  });
}

export function useTeamWorkspaces(teamId: string | null) {
  const { isAuthenticated } = useAuth();

  return useQuery<Workspace[]>({
    queryKey: ["/api/teams", teamId, "workspaces"],
    queryFn: async () => {
      const res = await fetch(getApiUrl(`/api/teams/${teamId}/workspaces`), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch team workspaces");
      return res.json();
    },
    enabled: isAuthenticated && !!teamId,
    refetchInterval: 5000,
  });
}

// ─── Mutations ───────────────────────────────────────────────────────

export function useCreateTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      const res = await secureFetch(getApiUrl("/api/teams"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Failed to create team");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
    },
  });
}

export function useJoinTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (inviteCode: string) => {
      const res = await secureFetch(getApiUrl("/api/teams/join"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode }),
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Invalid invite code");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      queryClient.invalidateQueries({ queryKey: [api.workspaces.list.path] });
    },
  });
}

export function useLeaveTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ teamId, userId }: { teamId: string; userId: string }) => {
      const res = await secureFetch(getApiUrl(`/api/teams/${teamId}/members/${userId}`), {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Failed to leave team");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      queryClient.invalidateQueries({ queryKey: [api.workspaces.list.path] });
    },
  });
}

export function useDeleteTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (teamId: string) => {
      const res = await secureFetch(getApiUrl(`/api/teams/${teamId}`), {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Failed to delete team");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      queryClient.invalidateQueries({ queryKey: [api.workspaces.list.path] });
    },
  });
}

export function useShareWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ teamId, workspaceId }: { teamId: string; workspaceId: number }) => {
      const res = await secureFetch(getApiUrl(`/api/teams/${teamId}/workspaces`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId }),
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Failed to share workspace");
      }
      return res.json();
    },
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams", teamId, "workspaces"] });
      queryClient.invalidateQueries({ queryKey: [api.workspaces.list.path] });
    },
  });
}

export function useRegenerateInviteCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (teamId: string) => {
      const res = await secureFetch(getApiUrl(`/api/teams/${teamId}/regenerate-code`), {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Failed to regenerate code");
      }
      return res.json();
    },
    onSuccess: (_, teamId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams", teamId] });
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
    },
  });
}
