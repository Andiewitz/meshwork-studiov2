import { WebSocketServer, WebSocket } from "ws";
import type { Server as HttpServer } from "http";
import type { IncomingMessage } from "http";
import cookie from "cookie";
import { teamStorage } from "./storage";

// ─── Types ───────────────────────────────────────────────────────────

interface PresenceUser {
    userId: string;
    name: string;
    color: string;
    cursor: { x: number; y: number } | null;
    ws: WebSocket;
}

interface ClientMessage {
    type: "join" | "cursor" | "leave";
    workspaceId?: number;
    x?: number;
    y?: number;
}

interface ServerMessage {
    type: "presence" | "cursor" | "joined" | "left" | "error";
    [key: string]: any;
}

// ─── Room Management ─────────────────────────────────────────────────
// Map<workspaceId, Map<userId, PresenceUser>>
const rooms = new Map<number, Map<string, PresenceUser>>();

function broadcastToRoom(workspaceId: number, message: ServerMessage, excludeUserId?: string) {
    const room = rooms.get(workspaceId);
    if (!room) return;

    const payload = JSON.stringify(message);
    for (const [uid, user] of room) {
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
    for (const [workspaceId, room] of rooms) {
        for (const [userId, user] of room) {
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
// We import the session store lazily to avoid circular deps.
let sessionStore: any = null;

async function resolveSession(req: IncomingMessage): Promise<{ id: string; email: string; firstName: string | null } | null> {
    try {
        const cookies = cookie.parse(req.headers.cookie || "");
        const sid = cookies["meshwork.sid"];
        if (!sid) return null;

        // Decode the connect.sid cookie (format: s:<id>.<signature>)
        const rawSid = sid.startsWith("s:") ? sid.slice(2).split(".")[0] : sid;

        // Dynamically import the auth module's session store
        if (!sessionStore) {
            try {
                const { getSessionStore } = await import("../auth/session");
                sessionStore = getSessionStore();
            } catch {
                // Fallback: try to read from pg sessions table directly
                const { db } = await import("../workspace/db");
                const { sessions } = await import("@shared/schema");
                const { eq } = await import("drizzle-orm");

                const [session] = await db.select().from(sessions).where(eq(sessions.sid, rawSid));
                if (!session) return null;

                const sess = session.sess as any;
                if (!sess?.passport?.user) return null;

                return sess.passport.user;
            }
        }

        // Use session store's get method
        return new Promise((resolve) => {
            sessionStore.get(rawSid, (err: any, session: any) => {
                if (err || !session?.passport?.user) {
                    resolve(null);
                    return;
                }
                resolve(session.passport.user);
            });
        });
    } catch {
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

                        // Verify user has access to this workspace (via team membership)
                        const teams = await teamStorage.getTeamsForWorkspace(msg.workspaceId);
                        let memberColor = "#FFFFFF";
                        let hasAccess = false;

                        for (const team of teams) {
                            const isMember = await teamStorage.isTeamMember(team.id, user.id);
                            if (isMember) {
                                hasAccess = true;
                                // Get their color
                                const members = await teamStorage.getTeamMembers(team.id);
                                const me = members.find((m) => m.userId === user.id);
                                if (me) memberColor = me.color;
                                break;
                            }
                        }

                        if (!hasAccess) {
                            ws.send(JSON.stringify({ type: "error", message: "No team access to this workspace" }));
                            ws.close();
                            return;
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
