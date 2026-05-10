import { WebSocketServer, WebSocket } from "ws";
import type { Server as HttpServer } from "http";
import type { IncomingMessage } from "http";
import cookie from "cookie";
import { teamStorage } from "./storage";
import { db } from "../workspace/db";
import { sessions } from "@shared/schema";
import { eq } from "drizzle-orm";

// ─── Types ───────────────────────────────────────────────────────────

interface PresenceUser {
    userId: string;
    name: string;
    color: string;
    cursor: { x: number; y: number } | null;
    ws: WebSocket;
}

interface ClientMessage {
    type: "join" | "cursor" | "leave" | "node-move" | "canvas-saved";
    workspaceId?: number;
    x?: number;
    y?: number;
    nodeId?: string;
    nodeX?: number;
    nodeY?: number;
    parentId?: string | null;
}

interface ServerMessage {
    type: "presence" | "cursor" | "joined" | "left" | "error" | "node-move" | "canvas-saved";
    [key: string]: any;
}

// ─── Room Management ─────────────────────────────────────────────────
// Map<workspaceId, Map<userId, PresenceUser>>
const rooms = new Map<number, Map<string, PresenceUser>>();

function broadcastToRoom(workspaceId: number, message: ServerMessage, excludeUserId?: string) {
    const room = rooms.get(workspaceId);
    if (!room) return;

    const payload = JSON.stringify(message);
    const users = Array.from(room.entries());
    for (let i = 0; i < users.length; i++) {
        const uid = users[i][0];
        const user = users[i][1];
        if (uid === excludeUserId) continue;
        if (user.ws.readyState === WebSocket.OPEN) {
            user.ws.send(payload);
        }
    }
}

function getPresenceList(workspaceId: number): Omit<PresenceUser, "ws">[] {
    const room = rooms.get(workspaceId);
    if (!room) return [];

    return Array.from(room.values()).map(({ ws, ...rest }) => rest);
}

function removeFromAllRooms(ws: WebSocket) {
    const allRooms = Array.from(rooms.entries());
    for (let i = 0; i < allRooms.length; i++) {
        const workspaceId = allRooms[i][0];
        const room = allRooms[i][1];
        const users = Array.from(room.entries());
        for (let j = 0; j < users.length; j++) {
            const userId = users[j][0];
            const user = users[j][1];
            if (user.ws === ws) {
                room.delete(userId);
                broadcastToRoom(workspaceId, { type: "left", userId });

                // Clean up empty rooms
                if (room.size === 0) rooms.delete(workspaceId);
                return { workspaceId, userId };
            }
        }
    }
    return null;
}

// ─── Session Resolver ────────────────────────────────────────────────
// Resolves a session cookie to a user object. Uses the same session
// store as Express (connect-pg-simple / memory).

async function resolveSession(req: IncomingMessage): Promise<{ id: string; email: string; firstName: string | null } | null> {
    try {
        const cookieHeader = req.headers.cookie || "";
        const cookies = cookie.parse(cookieHeader);
        const sid = cookies["meshwork.sid"];
        if (!sid) return null;

        // Decode the connect.sid cookie (format: s:<id>.<signature>)
        const rawSid = sid.startsWith("s:") ? sid.slice(2).split(".")[0] : sid;

        // Read from pg sessions table directly
        const [session] = await db.select().from(sessions).where(eq(sessions.sid, rawSid));
        if (!session) return null;

        const sess = session.sess as any;
        if (!sess?.passport?.user) return null;

        return sess.passport.user;
    } catch (err) {
        console.error("[WebSocket] Session resolution error:", err);
        return null;
    }
}

// ─── WebSocket Server ────────────────────────────────────────────────

export function initializeWebSocket(httpServer: HttpServer) {
    const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

    console.log("[WebSocket] Presence server initialized on /ws");

    wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
        let currentUserId: string | null = null;
        let currentWorkspaceId: number | null = null;

        // Heartbeat
        let alive = true;
        ws.on("pong", () => { alive = true; });

        const heartbeat = setInterval(() => {
            if (!alive) {
                ws.terminate();
                return;
            }
            alive = false;
            ws.ping();
        }, 30000);

        ws.on("message", async (raw) => {
            try {
                const msg: ClientMessage = JSON.parse(raw.toString());

                switch (msg.type) {
                    case "join": {
                        if (!msg.workspaceId) {
                            ws.send(JSON.stringify({ type: "error", message: "workspaceId required" }));
                            return;
                        }

                        // Authenticate from session cookie
                        const user = await resolveSession(req);
                        if (!user) {
                            ws.send(JSON.stringify({ type: "error", message: "Unauthorized" }));
                            ws.close();
                            return;
                        }

                        // Verify user has access to this workspace
                        const hasAccess = await teamStorage.canAccessWorkspace(user.id, msg.workspaceId);

                        if (!hasAccess) {
                            ws.send(JSON.stringify({ type: "error", message: "No access to this workspace" }));
                            ws.close();
                            return;
                        }

                        // Get their cursor color from the first team with this workspace
                        let memberColor = "#FF6600"; // Default owner color
                        const teamsWithAccess = await teamStorage.getTeamsForWorkspace(msg.workspaceId);
                        for (const team of teamsWithAccess) {
                            const members = await teamStorage.getTeamMembers(team.id);
                            const me = members.find((m) => m.userId === user.id);
                            if (me) { memberColor = me.color; break; }
                        }

                        // Remove from previous room if re-joining
                        removeFromAllRooms(ws);

                        currentUserId = user.id;
                        currentWorkspaceId = msg.workspaceId;

                        // Create room if needed
                        if (!rooms.has(msg.workspaceId)) {
                            rooms.set(msg.workspaceId, new Map());
                        }

                        const room = rooms.get(msg.workspaceId)!;
                        room.set(user.id, {
                            userId: user.id,
                            name: user.firstName || user.email.split("@")[0],
                            color: memberColor,
                            cursor: null,
                            ws,
                        });

                        // Notify others
                        broadcastToRoom(msg.workspaceId, {
                            type: "joined",
                            userId: user.id,
                            name: user.firstName || user.email.split("@")[0],
                            color: memberColor,
                        }, user.id);

                        // Send current presence to the joiner
                        ws.send(JSON.stringify({
                            type: "presence",
                            users: getPresenceList(msg.workspaceId),
                        }));

                        break;
                    }

                    case "cursor": {
                        if (!currentUserId || !currentWorkspaceId) return;

                        const room = rooms.get(currentWorkspaceId);
                        if (!room) return;

                        const me = room.get(currentUserId);
                        if (me) {
                            me.cursor = { x: msg.x || 0, y: msg.y || 0 };
                        }

                        // Broadcast cursor to others
                        broadcastToRoom(currentWorkspaceId, {
                            type: "cursor",
                            userId: currentUserId,
                            x: msg.x || 0,
                            y: msg.y || 0,
                        }, currentUserId);

                        break;
                    }

                    case "leave": {
                        removeFromAllRooms(ws);
                        currentUserId = null;
                        currentWorkspaceId = null;
                        break;
                    }

                    case "node-move": {
                        if (!currentUserId || !currentWorkspaceId || !msg.nodeId) return;
                        broadcastToRoom(currentWorkspaceId, {
                            type: "node-move",
                            userId: currentUserId,
                            nodeId: msg.nodeId,
                            nodeX: msg.nodeX,
                            nodeY: msg.nodeY,
                            parentId: msg.parentId,
                        }, currentUserId);
                        break;
                    }

                    case "canvas-saved": {
                        if (!currentUserId || !currentWorkspaceId) return;
                        broadcastToRoom(currentWorkspaceId, {
                            type: "canvas-saved",
                            userId: currentUserId,
                        }, currentUserId);
                        break;
                    }
                }
            } catch (err) {
                console.error("[WebSocket] Message handling error:", err);
            }
        });

        ws.on("close", () => {
            clearInterval(heartbeat);
            removeFromAllRooms(ws);
        });

        ws.on("error", () => {
            clearInterval(heartbeat);
            removeFromAllRooms(ws);
        });
    });

    return wss;
}
