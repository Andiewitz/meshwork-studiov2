import { db } from "../workspace/db";
import {
    teams,
    teamMembers,
    teamWorkspaces,
    workspaces,
    users,
    CURSOR_COLORS,
    type Team,
    type TeamMember,
    type TeamWorkspace,
    type Workspace,
} from "@shared/schema";
import { eq, and, inArray } from "drizzle-orm";
import crypto from "crypto";

// ─── Invite Code Generator ──────────────────────────────────────────
// Format: MX-XXXX (6 chars after prefix, alphanumeric uppercase)
function generateInviteCode(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // No 0/O/1/I confusion
    let code = "";
    const bytes = crypto.randomBytes(4);
    for (let i = 0; i < 4; i++) {
        code += chars[bytes[i] % chars.length];
    }
    return `MX-${code}`;
}

// Pick the next available cursor color for a new member
async function pickCursorColor(teamId: string): Promise<string> {
    const existing = await db
        .select({ color: teamMembers.color })
        .from(teamMembers)
        .where(eq(teamMembers.teamId, teamId));

    const usedColors = new Set(existing.map((m) => m.color));

    for (const color of CURSOR_COLORS) {
        if (!usedColors.has(color)) return color;
    }
    // All 12 used — wrap around with a slight variation
    return CURSOR_COLORS[existing.length % CURSOR_COLORS.length];
}

// ─── Team Storage ────────────────────────────────────────────────────

export interface ITeamStorage {
    createTeam(name: string, ownerId: string): Promise<Team>;
    getTeamsByUser(userId: string): Promise<(Team & { memberCount: number })[]>;
    getTeam(teamId: string): Promise<Team | undefined>;
    getTeamMembers(teamId: string): Promise<(TeamMember & { email: string; firstName: string | null; profileImageUrl: string | null })[]>;
    joinTeam(inviteCode: string, userId: string): Promise<{ team: Team; member: TeamMember }>;
    leaveTeam(teamId: string, userId: string): Promise<void>;
    deleteTeam(teamId: string): Promise<void>;
    regenerateInviteCode(teamId: string): Promise<Team>;
    shareWorkspace(teamId: string, workspaceId: number): Promise<TeamWorkspace>;
    unshareWorkspace(teamId: string, workspaceId: number): Promise<void>;
    getTeamWorkspaces(teamId: string): Promise<Workspace[]>;
    isTeamMember(teamId: string, userId: string): Promise<boolean>;
    isTeamOwner(teamId: string, userId: string): Promise<boolean>;
    getTeamsForWorkspace(workspaceId: number): Promise<Team[]>;
}

export class TeamDatabaseStorage implements ITeamStorage {
    async createTeam(name: string, ownerId: string): Promise<Team> {
        // Generate a unique invite code (retry on collision)
        let inviteCode = generateInviteCode();
        let attempts = 0;
        while (attempts < 10) {
            const existing = await db
                .select()
                .from(teams)
                .where(eq(teams.inviteCode, inviteCode));
            if (existing.length === 0) break;
            inviteCode = generateInviteCode();
            attempts++;
        }

        const [team] = await db.insert(teams).values({ name, ownerId, inviteCode }).returning();

        // Auto-add owner as a member with brand orange
        await db.insert(teamMembers).values({
            teamId: team.id,
            userId: ownerId,
            role: "owner",
            color: CURSOR_COLORS[0], // Brand orange for owner
        });

        return team;
    }

    async getTeamsByUser(userId: string): Promise<(Team & { memberCount: number })[]> {
        const memberships = await db
            .select({ teamId: teamMembers.teamId })
            .from(teamMembers)
            .where(eq(teamMembers.userId, userId));

        if (memberships.length === 0) return [];

        const teamIds = memberships.map((m) => m.teamId);
        const teamsList = await db
            .select()
            .from(teams)
            .where(inArray(teams.id, teamIds));

        // Get all member counts in one query instead of N+1
        const counts = await db
            .select({ teamId: teamMembers.teamId })
            .from(teamMembers)
            .where(inArray(teamMembers.teamId, teamIds));

        const countMap = new Map<string, number>();
        for (const c of counts) {
            countMap.set(c.teamId, (countMap.get(c.teamId) || 0) + 1);
        }

        return teamsList.map(team => ({
            ...team,
            memberCount: countMap.get(team.id) || 0,
        }));
    }

    async getTeam(teamId: string): Promise<Team | undefined> {
        const [team] = await db.select().from(teams).where(eq(teams.id, teamId));
        return team;
    }

    async getTeamMembers(teamId: string) {
        const members = await db
            .select({
                id: teamMembers.id,
                teamId: teamMembers.teamId,
                userId: teamMembers.userId,
                role: teamMembers.role,
                color: teamMembers.color,
                joinedAt: teamMembers.joinedAt,
                email: users.email,
                firstName: users.firstName,
                profileImageUrl: users.profileImageUrl,
            })
            .from(teamMembers)
            .innerJoin(users, eq(teamMembers.userId, users.id))
            .where(eq(teamMembers.teamId, teamId));

        return members;
    }

    async joinTeam(inviteCode: string, userId: string): Promise<{ team: Team; member: TeamMember }> {
        const [team] = await db.select().from(teams).where(eq(teams.inviteCode, inviteCode));
        if (!team) throw new Error("Invalid invite code");

        // Check if already a member
        const [existing] = await db
            .select()
            .from(teamMembers)
            .where(and(eq(teamMembers.teamId, team.id), eq(teamMembers.userId, userId)));
        if (existing) throw new Error("Already a member of this team");

        const color = await pickCursorColor(team.id);

        const [member] = await db
            .insert(teamMembers)
            .values({ teamId: team.id, userId, role: "member", color })
            .returning();

        return { team, member };
    }

    async leaveTeam(teamId: string, userId: string): Promise<void> {
        await db
            .delete(teamMembers)
            .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId)));
    }

    async deleteTeam(teamId: string): Promise<void> {
        // Cascade will handle teamMembers and teamWorkspaces
        await db.delete(teams).where(eq(teams.id, teamId));
    }

    async regenerateInviteCode(teamId: string): Promise<Team> {
        let inviteCode = generateInviteCode();
        let attempts = 0;
        while (attempts < 10) {
            const existing = await db
                .select()
                .from(teams)
                .where(eq(teams.inviteCode, inviteCode));
            if (existing.length === 0) break;
            inviteCode = generateInviteCode();
            attempts++;
        }

        const [team] = await db
            .update(teams)
            .set({ inviteCode })
            .where(eq(teams.id, teamId))
            .returning();
        return team;
    }

    async shareWorkspace(teamId: string, workspaceId: number): Promise<TeamWorkspace> {
        // Check if already shared
        const [existing] = await db
            .select()
            .from(teamWorkspaces)
            .where(and(eq(teamWorkspaces.teamId, teamId), eq(teamWorkspaces.workspaceId, workspaceId)));
        if (existing) return existing;

        const [tw] = await db
            .insert(teamWorkspaces)
            .values({ teamId, workspaceId })
            .returning();
        return tw;
    }

    async unshareWorkspace(teamId: string, workspaceId: number): Promise<void> {
        await db
            .delete(teamWorkspaces)
            .where(and(eq(teamWorkspaces.teamId, teamId), eq(teamWorkspaces.workspaceId, workspaceId)));
    }

    async getTeamWorkspaces(teamId: string): Promise<Workspace[]> {
        const shared = await db
            .select({ workspaceId: teamWorkspaces.workspaceId })
            .from(teamWorkspaces)
            .where(eq(teamWorkspaces.teamId, teamId));

        if (shared.length === 0) return [];

        return await db
            .select()
            .from(workspaces)
            .where(inArray(workspaces.id, shared.map((s) => s.workspaceId)));
    }

    async isTeamMember(teamId: string, userId: string): Promise<boolean> {
        const [member] = await db
            .select()
            .from(teamMembers)
            .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId)));
        return !!member;
    }

    async isTeamOwner(teamId: string, userId: string): Promise<boolean> {
        const [team] = await db.select().from(teams).where(eq(teams.id, teamId));
        return team?.ownerId === userId;
    }

    async getTeamsForWorkspace(workspaceId: number): Promise<Team[]> {
        const shared = await db
            .select({ teamId: teamWorkspaces.teamId })
            .from(teamWorkspaces)
            .where(eq(teamWorkspaces.workspaceId, workspaceId));

        if (shared.length === 0) return [];

        return await db
            .select()
            .from(teams)
            .where(inArray(teams.id, shared.map((s) => s.teamId)));
    }

    async canAccessWorkspace(userId: string, workspaceId: number): Promise<boolean> {
        // 1. Check if user is the owner
        const [workspace] = await db.select().from(workspaces).where(eq(workspaces.id, workspaceId));
        if (workspace?.userId === userId) return true;

        // 2. Check if workspace is shared with any team the user is in
        const teamsWithAccess = await db
            .select({ teamId: teamWorkspaces.teamId })
            .from(teamWorkspaces)
            .where(eq(teamWorkspaces.workspaceId, workspaceId));
        
        if (teamsWithAccess.length === 0) return false;

        const teamIds = teamsWithAccess.map(t => t.teamId);
        const [membership] = await db
            .select()
            .from(teamMembers)
            .where(and(
                eq(teamMembers.userId, userId),
                inArray(teamMembers.teamId, teamIds)
            ));

        return !!membership;
    }
}

export const teamStorage = new TeamDatabaseStorage();
