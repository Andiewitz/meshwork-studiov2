import { WebSocketServer, WebSocket } from "ws";
import { createChildLogger } from "../../lib/logger";
import type { Server as HttpServer } from "http";
import type { IncomingMessage } from "http";
import cookie from "cookie";
import { teamStorage } from "./storage";
import { db } from "../workspace/db";
import { sessions, users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { verifyToken } from "../auth/jwt";
import { getRedis, createRedisClient } from "../../lib/redis";
import type { Redis as RedisType } from "ioredis";
import {
  websocketConnectionsActive,
  websocketRoomsActive,
} from "../../lib/metrics";
import crypto from "crypto";

const log = createChildLogger("websocket");

// ─── Redis Pub/Sub Setup ─────────────────────────────────────────────
const ORIGIN_SERVER_ID = crypto.randomUUID();

let redisSub: RedisType | null = null;
let redisPub: RedisType | null = null;

// Initialize Redis subscription lazily
let redisSubInitialized = false;

function initRedisSub() {
  if (redisSubInitialized) return;
  const sub = getRedisSub();
  if (sub) {
    sub.on("message", (channel: string, message: string) => {
      if (!channel.startsWith("ws:room:")) return;
      try {
        const workspaceId = parseInt(channel.split(":")[2]);
        const payload = JSON.parse(message);
        if (payload.originServerId === ORIGIN_SERVER_ID) return;
        broadcastToRoom(workspaceId, payload.data, payload.excludeUserId);
      } catch (err) {
        log.error({ err, channel }, "Error processing pub/sub message");
      }
    });
    redisSubInitialized = true;
  }
}

// Initialize on first publish
function ensureRedisSub() {
  if (!redisSubInitialized) initRedisSub();
}

function getRedisSub() {
  if (!redisSub) redisSub = createRedisClient();
  return redisSub;
}

function getRedisPub() {
  if (!redisPub) redisPub = getRedis();
  return redisPub;
}

function publishToRoom(
  workspaceId: number,
  message: ServerMessage,
  excludeUserId?: string,
) {
  // 1. Always broadcast to local clients on this node
  broadcastToRoom(workspaceId, message, excludeUserId);

  // 2. Publish to Redis for other nodes
  const pub = getRedisPub();
  if (pub) {
    ensureRedisSub(); // Initialize subscription on first publish
    const payload = JSON.stringify({
      originServerId: ORIGIN_SERVER_ID,
      excludeUserId,
      data: message,
    });
    pub.publish(`ws:room:${workspaceId}`, payload).catch((err: Error) => {
      log.error({ err, workspaceId }, "Redis publish failed");
    });
  }
}

// ─── Types ───────────────────────────────────────────────────────────

interface PresenceUser {
  userId: string;
  name: string;
  color: string;
  cursor: { x: number; y: number } | null;
  ws: WebSocket;
}

interface ClientMessage {
  type:
    | "join"
    | "cursor"
    | "leave"
    | "node-move"
    | "canvas-sync"
    | "nodes-change"
    | "edges-change";
  workspaceId?: number;
  x?: number;
  y?: number;
  nodeId?: string;
  nodeX?: number;
  nodeY?: number;
  parentId?: string | null;
  nodes?: Record<string, unknown>[];
  edges?: Record<string, unknown>[];
  changes?: Record<string, unknown>[];
}

interface ServerMessage {
  type:
    | "presence"
    | "cursor"
    | "joined"
    | "left"
    | "error"
    | "node-move"
    | "canvas-sync"
    | "nodes-change"
    | "edges-change";
  [key: string]: unknown;
}

// ─── Room Management ─────────────────────────────────────────────────
// Map<workspaceId, Map<userId, PresenceUser>>
const rooms = new Map<number, Map<string, PresenceUser>>();

function broadcastToRoom(
  workspaceId: number,
  message: ServerMessage,
  excludeUserId?: string,
) {
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
        publishToRoom(workspaceId, { type: "left", userId });

        // Clean up empty rooms
        if (room.size === 0) {
          rooms.delete(workspaceId);
          websocketRoomsActive.set(rooms.size);
          if (redisSub) {
            redisSub
              .unsubscribe(`ws:room:${workspaceId}`)
              .catch((err: Error) =>
                log.error({ err }, "Redis unsubscribe failed"),
              );
          }
        }
        return { workspaceId, userId };
      }
    }
  }
  return null;
}

// ─── Session Resolver ────────────────────────────────────────────────
// Resolves a session cookie to a user object. Uses the JWT access token.
async function resolveSession(
  req: IncomingMessage,
): Promise<{ id: string; email: string; firstName: string | null } | null> {
  try {
    const cookieHeader = req.headers.cookie || "";
    const cookies = cookie.parse(cookieHeader);
    const accessToken = cookies.access_token;

    if (!accessToken) return null;

    const payload = verifyToken(accessToken, "access");
    if (!payload) return null;

    // Fetch user details
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
      })
      .from(users)
      .where(eq(users.id, payload.userId));

    if (!user) return null;

    return user;
  } catch (err) {
    log.error({ err }, "Session resolution error");
    return null;
  }
}

// ─── WebSocket Server ────────────────────────────────────────────────

export function initializeWebSocket(httpServer: HttpServer) {
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  log.info("Presence server initialized on /ws");

  wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
    websocketConnectionsActive.inc();
    let currentUserId: string | undefined;
    let currentWorkspaceId: number | undefined;

    // Heartbeat
    let alive = true;
    ws.on("pong", () => {
      alive = true;
    });

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
              ws.send(
                JSON.stringify({
                  type: "error",
                  message: "workspaceId required",
                }),
              );
              return;
            }

            // Authenticate from session cookie
            const user = await resolveSession(req);
            if (!user) {
              ws.send(
                JSON.stringify({ type: "error", message: "Unauthorized" }),
              );
              ws.close();
              return;
            }

            // Verify user has access to this workspace
            const hasAccess = await teamStorage.canAccessWorkspace(
              user.id,
              msg.workspaceId,
            );

            if (!hasAccess) {
              ws.send(
                JSON.stringify({
                  type: "error",
                  message: "No access to this workspace",
                }),
              );
              ws.close();
              return;
            }

            // Get their cursor color from the first team with this workspace
            let memberColor = "#FF6600"; // Default owner color
            const teamsWithAccess = await teamStorage.getTeamsForWorkspace(
              msg.workspaceId,
            );
            for (const team of teamsWithAccess) {
              const members = await teamStorage.getTeamMembers(team.id);
              const me = members.find((m) => m.userId === user.id);
              if (me) {
                memberColor = me.color;
                break;
              }
            }

            // Remove from previous room if re-joining
            removeFromAllRooms(ws);

            currentUserId = user.id;
            currentWorkspaceId = msg.workspaceId;

            // Create room if needed
            if (!rooms.has(msg.workspaceId)) {
              rooms.set(msg.workspaceId, new Map());
              websocketRoomsActive.set(rooms.size);
              if (redisSub) {
                redisSub
                  .subscribe(`ws:room:${msg.workspaceId}`)
                  .catch((err: Error) =>
                    log.error({ err }, "Redis subscribe failed"),
                  );
              }
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
            publishToRoom(
              msg.workspaceId,
              {
                type: "joined",
                userId: user.id,
                name: user.firstName || user.email.split("@")[0],
                color: memberColor,
              },
              user.id,
            );

            // Send current presence to the joiner
            ws.send(
              JSON.stringify({
                type: "presence",
                users: getPresenceList(msg.workspaceId),
              }),
            );

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
            publishToRoom(
              currentWorkspaceId,
              {
                type: "cursor",
                userId: currentUserId,
                x: msg.x || 0,
                y: msg.y || 0,
              },
              currentUserId,
            );

            break;
          }

          case "leave": {
            removeFromAllRooms(ws);
            currentUserId = undefined;
            currentWorkspaceId = undefined;
            break;
          }

          case "node-move": {
            if (!currentUserId || !currentWorkspaceId || !msg.nodeId) return;
            publishToRoom(
              currentWorkspaceId,
              {
                type: "node-move",
                userId: currentUserId,
                nodeId: msg.nodeId,
                nodeX: msg.nodeX,
                nodeY: msg.nodeY,
                parentId: msg.parentId,
              },
              currentUserId,
            );
            break;
          }

          case "canvas-sync":
            if (!currentWorkspaceId) return;
            publishToRoom(
              currentWorkspaceId,
              {
                type: "canvas-sync",
                userId: currentUserId,
                nodes: msg.nodes,
                edges: msg.edges,
              },
              currentUserId,
            );
            break;

          case "nodes-change":
            if (!currentWorkspaceId) return;
            publishToRoom(
              currentWorkspaceId,
              {
                type: "nodes-change",
                userId: currentUserId,
                changes: msg.changes,
              },
              currentUserId,
            );
            break;

          case "edges-change":
            if (!currentWorkspaceId) return;
            publishToRoom(
              currentWorkspaceId,
              {
                type: "edges-change",
                userId: currentUserId,
                changes: msg.changes,
              },
              currentUserId,
            );
            break;
        }
      } catch (err) {
        log.error({ err }, "Message handling error");
      }
    });

    ws.on("close", () => {
      websocketConnectionsActive.dec();
      clearInterval(heartbeat);
      removeFromAllRooms(ws);
    });

    ws.on("error", () => {
      websocketConnectionsActive.dec();
      clearInterval(heartbeat);
      removeFromAllRooms(ws);
    });
  });

  return wss;
}
