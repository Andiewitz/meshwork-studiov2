import { useEffect, useRef, useState, useCallback } from "react";

// ─── Types ───────────────────────────────────────────────────────────

export interface PresenceUser {
  userId: string;
  name: string;
  color: string;
  cursor: { x: number; y: number } | null;
}

interface ServerMessage {
  type: "presence" | "cursor" | "joined" | "left" | "error" | "node-move" | "canvas-saved";
  users?: PresenceUser[];
  userId?: string;
  name?: string;
  color?: string;
  x?: number;
  y?: number;
  message?: string;
  nodeId?: string;
  nodeX?: number;
  nodeY?: number;
  parentId?: string | null;
}

// ─── Hook ────────────────────────────────────────────────────────────

export function usePresence(
  workspaceId: number | null,
  onNodeMove?: (nodeId: string, x: number, y: number, parentId?: string | null) => void,
  onCanvasSaved?: () => void,
) {
  const wsRef = useRef<WebSocket | null>(null);
  const onNodeMoveRef = useRef(onNodeMove);
  onNodeMoveRef.current = onNodeMove;
  const onCanvasSavedRef = useRef(onCanvasSaved);
  onCanvasSavedRef.current = onCanvasSaved;
  const [collaborators, setCollaborators] = useState<Map<string, PresenceUser>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout>>();

  const connect = useCallback(() => {
    if (!workspaceId) return;

    // Build WS URL from current location
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = import.meta.env.VITE_API_URL
      ? new URL(import.meta.env.VITE_API_URL).host
      : window.location.host;
    const url = `${protocol}//${host}/ws`;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      // Authenticate and join the workspace room
      ws.send(JSON.stringify({ type: "join", workspaceId }));
    };

    ws.onmessage = (event) => {
      try {
        const msg: ServerMessage = JSON.parse(event.data);

        switch (msg.type) {
          case "presence": {
            // Full state sync on join
            const map = new Map<string, PresenceUser>();
            for (const user of msg.users || []) {
              map.set(user.userId, user);
            }
            setCollaborators(map);
            break;
          }

          case "joined": {
            if (msg.userId && msg.name && msg.color) {
              setCollaborators((prev) => {
                const next = new Map(prev);
                next.set(msg.userId!, {
                  userId: msg.userId!,
                  name: msg.name!,
                  color: msg.color!,
                  cursor: null,
                });
                return next;
              });
            }
            break;
          }

          case "cursor": {
            if (msg.userId) {
              setCollaborators((prev) => {
                const next = new Map(prev);
                const existing = next.get(msg.userId!);
                if (existing) {
                  next.set(msg.userId!, {
                    ...existing,
                    cursor: { x: msg.x || 0, y: msg.y || 0 },
                  });
                }
                return next;
              });
            }
            break;
          }

          case "left": {
            if (msg.userId) {
              setCollaborators((prev) => {
                const next = new Map(prev);
                next.delete(msg.userId!);
                return next;
              });
            }
            break;
          }

          case "error": {
            console.warn("[Presence] Server error:", msg.message);
            break;
          }

          case "node-move": {
            if (msg.nodeId != null && msg.nodeX != null && msg.nodeY != null) {
              onNodeMoveRef.current?.(msg.nodeId, msg.nodeX, msg.nodeY, msg.parentId);
            }
            break;
          }

          case "canvas-saved": {
            onCanvasSavedRef.current?.();
            break;
          }
        }
      } catch {
        // Ignore malformed messages
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      wsRef.current = null;
      // Reconnect after 3 seconds
      reconnectTimer.current = setTimeout(() => connect(), 3000);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [workspaceId]);

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    connect();

    return () => {
      clearTimeout(reconnectTimer.current);
      if (wsRef.current) {
        wsRef.current.send(JSON.stringify({ type: "leave" }));
        wsRef.current.close();
        wsRef.current = null;
      }
      setCollaborators(new Map());
      setIsConnected(false);
    };
  }, [connect]);

  // Send cursor position (throttled by caller)
  const sendCursor = useCallback((x: number, y: number) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "cursor", x, y }));
    }
  }, []);

  const sendNodeMove = useCallback((nodeId: string, x: number, y: number, parentId?: string | null) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "node-move", nodeId, nodeX: x, nodeY: y, parentId: parentId ?? null }));
    }
  }, []);

  const sendCanvasSaved = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "canvas-saved" }));
    }
  }, []);

  return {
    collaborators: Array.from(collaborators.values()),
    isConnected,
    sendCursor,
    sendNodeMove,
    sendCanvasSaved,
  };
}
