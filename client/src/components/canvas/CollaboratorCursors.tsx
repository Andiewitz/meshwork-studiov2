import React, { useEffect, useRef, useState } from "react";
import type { PresenceUser } from "@/hooks/use-presence";

// ─── Cursor SVG ──────────────────────────────────────────────────────

function CursorArrow({ color }: { color: string }) {
  return (
    <svg
      width="16"
      height="20"
      viewBox="0 0 16 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: `drop-shadow(0 2px 4px rgba(0,0,0,0.5))` }}
    >
      <path
        d="M1 1L6.5 18L9 10L16 8L1 1Z"
        fill={color}
        stroke="rgba(0,0,0,0.3)"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Single Collaborator Cursor ──────────────────────────────────────

interface CollaboratorCursorProps {
  user: PresenceUser;
}

function CollaboratorCursor({ user }: CollaboratorCursorProps) {
  const [pos, setPos] = useState(user.cursor || { x: 0, y: 0 });
  const targetRef = useRef(user.cursor || { x: 0, y: 0 });
  const animFrameRef = useRef<number>();

  // Smooth lerp animation for cursor movement
  useEffect(() => {
    if (user.cursor) {
      targetRef.current = user.cursor;
    }
  }, [user.cursor]);

  useEffect(() => {
    const lerp = () => {
      setPos((prev) => {
        const dx = targetRef.current.x - prev.x;
        const dy = targetRef.current.y - prev.y;

        // If close enough, snap
        if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) {
          return targetRef.current;
        }

        return {
          x: prev.x + dx * 0.15,
          y: prev.y + dy * 0.15,
        };
      });
      animFrameRef.current = requestAnimationFrame(lerp);
    };

    animFrameRef.current = requestAnimationFrame(lerp);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  if (!user.cursor) return null;

  return (
    <div
      className="pointer-events-none absolute z-[100] transition-opacity duration-300"
      style={{
        left: pos.x,
        top: pos.y,
        willChange: "left, top",
      }}
    >
      <CursorArrow color={user.color} />
      {/* Name label */}
      <div
        className="absolute left-4 top-4 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest whitespace-nowrap shadow-lg"
        style={{
          backgroundColor: user.color,
          color: "#000",
        }}
      >
        {user.name}
      </div>
    </div>
  );
}

// ─── Overlay Component ───────────────────────────────────────────────

interface CollaboratorCursorsProps {
  collaborators: PresenceUser[];
}

export function CollaboratorCursors({ collaborators }: CollaboratorCursorsProps) {
  if (collaborators.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-[100] overflow-hidden">
      {collaborators.map((user) => (
        <CollaboratorCursor key={user.userId} user={user} />
      ))}
    </div>
  );
}

// ─── Presence Indicator (Toolbar) ────────────────────────────────────

interface PresenceIndicatorProps {
  collaborators: PresenceUser[];
  isConnected: boolean;
}

export function PresenceIndicator({ collaborators, isConnected }: PresenceIndicatorProps) {
  if (!isConnected && collaborators.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 glass-card rounded-full">
      {/* Connection dot */}
      <div
        className={`w-1.5 h-1.5 rounded-full ${
          isConnected ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" : "bg-red-400"
        }`}
      />

      {/* Collaborator avatars */}
      <div className="flex -space-x-1.5">
        {collaborators.slice(0, 5).map((user) => (
          <div
            key={user.userId}
            className="w-5 h-5 rounded-full border-2 flex items-center justify-center text-[8px] font-bold"
            style={{
              borderColor: user.color,
              backgroundColor: `${user.color}20`,
              color: user.color,
            }}
            title={user.name}
          >
            {user.name[0]?.toUpperCase()}
          </div>
        ))}
      </div>

      {collaborators.length > 5 && (
        <span className="text-[10px] text-white/40 font-bold">
          +{collaborators.length - 5}
        </span>
      )}

      <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest ml-1">
        Live
      </span>
    </div>
  );
}
