import type { Express } from "express";
import { teamStorage } from "./storage";
import { workspaceStorage } from "../workspace/storage";
import { AuthModule } from "../auth";
import { joinTeamSchema, updateMemberRoleSchema } from "@shared/schema";
import { csrfProtection } from "../../middleware/csrf";
import { z } from "zod";

export function registerTeamRoutes(app: Express) {
    const { isAuthenticated } = AuthModule.middleware;

    // ── Create a team ────────────────────────────────────────────────
    app.post("/api/teams", csrfProtection, isAuthenticated, async (req, res) => {
        try {
            const { name } = req.body;
            if (!name || typeof name !== "string" || name.trim().length === 0) {
                return res.status(400).json({ message: "Team name is required" });
            }
            if (name.length > 64) {
                return res.status(400).json({ message: "Team name must be 64 characters or less" });
            }

            const userId = req.user!.id;
            const team = await teamStorage.createTeam(name.trim(), userId);
            res.status(201).json(team);
        } catch (err) {
            res.status(400).json({ message: err instanceof Error ? err.message : "Failed to create team" });
        }
    });

    // ── List user's teams ────────────────────────────────────────────
    app.get("/api/teams", isAuthenticated, async (req, res) => {
        const userId = req.user!.id;
        const teams = await teamStorage.getTeamsByUser(userId);
        res.json(teams);
    });

    // ── Get team details + members ───────────────────────────────────
    app.get("/api/teams/:id", isAuthenticated, async (req, res) => {
        const teamId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const userId = req.user!.id;

        const isMember = await teamStorage.isTeamMember(teamId, userId);
        if (!isMember) return res.status(403).json({ message: "Not a member of this team" });

        const team = await teamStorage.getTeam(teamId);
        if (!team) return res.status(404).json({ message: "Team not found" });

        const members = await teamStorage.getTeamMembers(teamId);
        res.json({ ...team, members });
    });

    // ── Join team via invite code ────────────────────────────────────
    app.post("/api/teams/join", csrfProtection, isAuthenticated, async (req, res) => {
        try {
            const { inviteCode } = joinTeamSchema.parse(req.body);
            const userId = req.user!.id;
            const result = await teamStorage.joinTeam(inviteCode.toUpperCase(), userId);
            res.status(201).json(result);
        } catch (err) {
            if (err instanceof z.ZodError) {
                return res.status(400).json({ message: err.errors[0].message });
            }
            res.status(400).json({ message: err instanceof Error ? err.message : "Failed to join team" });
        }
    });

    // ── Leave / remove member ────────────────────────────────────────
    app.delete("/api/teams/:id/members/:userId", csrfProtection, isAuthenticated, async (req, res) => {
        const teamId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const targetUserId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
        const requesterId = req.user!.id;

        // Can remove yourself, or owner can remove anyone
        const isOwner = await teamStorage.isTeamOwner(teamId, requesterId);
        if (requesterId !== targetUserId && !isOwner) {
            return res.status(403).json({ message: "Only the team owner can remove other members" });
        }

        // Owner cannot remove themselves (must delete team instead)
        if (isOwner && requesterId === targetUserId) {
            return res.status(400).json({ message: "Owner cannot leave. Delete the team instead." });
        }

        await teamStorage.leaveTeam(teamId, targetUserId);
        res.status(204).send();
    });

    // ── Share workspace with team ────────────────────────────────────
    app.post("/api/teams/:id/workspaces", csrfProtection, isAuthenticated, async (req, res) => {
        try {
            const teamId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            const userId = req.user!.id;
            const { workspaceId } = req.body;

            if (!workspaceId || typeof workspaceId !== "number") {
                return res.status(400).json({ message: "workspaceId is required" });
            }

            const isMember = await teamStorage.isTeamMember(teamId, userId);
            if (!isMember) return res.status(403).json({ message: "Not a member" });

            // Only the workspace owner can share it
            const ws = await workspaceStorage.getWorkspace(workspaceId);
            if (!ws || ws.userId !== userId) {
                return res.status(403).json({ message: "You can only share workspaces you own" });
            }

            const tw = await teamStorage.shareWorkspace(teamId, workspaceId);
            res.status(201).json(tw);
        } catch (err) {
            res.status(400).json({ message: err instanceof Error ? err.message : "Failed to share workspace" });
        }
    });

    // ── List team workspaces ─────────────────────────────────────────
    app.get("/api/teams/:id/workspaces", isAuthenticated, async (req, res) => {
        const teamId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const userId = req.user!.id;

        const isMember = await teamStorage.isTeamMember(teamId, userId);
        if (!isMember) return res.status(403).json({ message: "Not a member" });

        const workspaces = await teamStorage.getTeamWorkspaces(teamId);
        res.json(workspaces);
    });

    // ── Unshare workspace ────────────────────────────────────────────
    app.delete("/api/teams/:id/workspaces/:workspaceId", csrfProtection, isAuthenticated, async (req, res) => {
        const teamId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const workspaceId = Number(req.params.workspaceId);
        const userId = req.user!.id;

        const isMember = await teamStorage.isTeamMember(teamId, userId);
        if (!isMember) return res.status(403).json({ message: "Not a member" });

        // Only workspace owner or team owner can unshare
        const ws = await workspaceStorage.getWorkspace(workspaceId);
        const isOwner = await teamStorage.isTeamOwner(teamId, userId);
        if (ws?.userId !== userId && !isOwner) {
            return res.status(403).json({ message: "Only the workspace owner or team owner can unshare" });
        }

        await teamStorage.unshareWorkspace(teamId, workspaceId);
        res.status(204).send();
    });

    // ── Regenerate invite code (owner only) ──────────────────────────
    app.post("/api/teams/:id/regenerate-code", csrfProtection, isAuthenticated, async (req, res) => {
        const teamId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const userId = req.user!.id;

        const isOwner = await teamStorage.isTeamOwner(teamId, userId);
        if (!isOwner) return res.status(403).json({ message: "Only the owner can regenerate the invite code" });

        const team = await teamStorage.regenerateInviteCode(teamId);
        res.json(team);
    });

    // ── Delete team (owner only) ─────────────────────────────────────
    app.delete("/api/teams/:id", csrfProtection, isAuthenticated, async (req, res) => {
        const teamId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const userId = req.user!.id;

        const isOwner = await teamStorage.isTeamOwner(teamId, userId);
        if (!isOwner) return res.status(403).json({ message: "Only the owner can delete the team" });

        await teamStorage.deleteTeam(teamId);
        res.status(204).send();
    });

    // ── Update member role (owner/admin only) ────────────────────────
    app.patch("/api/teams/:id/members/:userId/role", csrfProtection, isAuthenticated, async (req, res) => {
        const teamId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const targetUserId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
        const actorId = req.user!.id;

        try {
            // Validate body
            const { role: newRole } = updateMemberRoleSchema.parse(req.body);

            // Check actor is owner or admin
            const actorRole = await teamStorage.getMemberRole(teamId, actorId);
            if (!actorRole || (actorRole !== 'owner' && actorRole !== 'admin')) {
                return res.status(403).json({ message: "Only owners and admins can change roles" });
            }

            // Can't change the owner's role
            const targetRole = await teamStorage.getMemberRole(teamId, targetUserId);
            if (targetRole === 'owner') {
                return res.status(403).json({ message: "Cannot change the owner's role" });
            }

            // Admins can't promote to admin (only owner can)
            if (actorRole === 'admin' && newRole === 'admin') {
                return res.status(403).json({ message: "Only the owner can promote to admin" });
            }

            const updated = await teamStorage.updateMemberRole(teamId, targetUserId, newRole);
            res.json(updated);
        } catch (err) {
            if (err instanceof z.ZodError) {
                return res.status(400).json({ message: err.errors[0]?.message || "Invalid role" });
            }
            res.status(400).json({ message: err instanceof Error ? err.message : "Failed to update role" });
        }
    });

    // ── Get user's role for a workspace ──────────────────────────────
    app.get("/api/workspaces/:id/role", isAuthenticated, async (req, res) => {
        const workspaceId = Number(req.params.id);
        const userId = req.user!.id;

        if (isNaN(workspaceId)) return res.status(400).json({ message: "Invalid workspace ID" });

        const role = await teamStorage.getWorkspaceRole(workspaceId, userId);
        res.json({ role: role || 'none' });
    });

    // ── Get all members for a workspace (via its team) ──────────────
    app.get("/api/workspaces/:id/members", isAuthenticated, async (req, res) => {
        const workspaceId = Number(req.params.id);
        const userId = req.user!.id;

        if (isNaN(workspaceId)) return res.status(400).json({ message: "Invalid workspace ID" });

        // Check user has access
        const hasAccess = await teamStorage.canAccessWorkspace(userId, workspaceId);
        // Also check if user owns the workspace directly
        const ws = await workspaceStorage.getWorkspace(workspaceId);
        if (!hasAccess && ws?.userId !== userId) {
            return res.status(403).json({ message: "No access to this workspace" });
        }

        // Find which team shares this workspace
        const teams = await teamStorage.getTeamsForWorkspace(workspaceId);
        if (teams.length === 0) {
            return res.json({ teamId: null, members: [] });
        }

        const team = teams[0]; // Use the first team
        const members = await teamStorage.getTeamMembers(team.id);
        res.json({ teamId: team.id, members });
    });
}
