import type { Express } from "express";
import { teamStorage } from "./storage";
import { AuthModule } from "../auth";
import { joinTeamSchema } from "@shared/schema";
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
}
