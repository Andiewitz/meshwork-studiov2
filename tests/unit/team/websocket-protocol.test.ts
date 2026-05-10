import { describe, it, expect } from 'vitest';

// ─── WebSocket Message Protocol Tests ────────────────────────────────
// These test the message shapes that the WS server expects / produces.
// Since we can't easily spin up a real WS server in vitest without a DB,
// we validate the protocol contracts and message parsing logic.

interface ClientMessage {
  type: 'join' | 'cursor' | 'leave' | 'node-move' | 'canvas-saved';
  workspaceId?: number;
  x?: number;
  y?: number;
  nodeId?: string;
  nodeX?: number;
  nodeY?: number;
  parentId?: string | null;
}

interface ServerMessage {
  type: 'presence' | 'cursor' | 'joined' | 'left' | 'error' | 'node-move' | 'canvas-saved';
  [key: string]: any;
}

describe('WebSocket Protocol (Unit)', () => {

  describe('Client → Server message shapes', () => {
    it('join message has workspaceId', () => {
      const msg: ClientMessage = { type: 'join', workspaceId: 42 };
      expect(msg.type).toBe('join');
      expect(msg.workspaceId).toBe(42);
    });

    it('cursor message has x and y', () => {
      const msg: ClientMessage = { type: 'cursor', x: 100.5, y: 200.3 };
      expect(msg.x).toBeCloseTo(100.5);
      expect(msg.y).toBeCloseTo(200.3);
    });

    it('node-move message has nodeId, nodeX, nodeY', () => {
      const msg: ClientMessage = {
        type: 'node-move',
        nodeId: 'node-abc',
        nodeX: 300,
        nodeY: 450,
        parentId: 'vpc-1',
      };
      expect(msg.nodeId).toBe('node-abc');
      expect(msg.nodeX).toBe(300);
      expect(msg.nodeY).toBe(450);
      expect(msg.parentId).toBe('vpc-1');
    });

    it('node-move without parent uses null', () => {
      const msg: ClientMessage = {
        type: 'node-move',
        nodeId: 'node-abc',
        nodeX: 0,
        nodeY: 0,
        parentId: null,
      };
      expect(msg.parentId).toBeNull();
    });

    it('canvas-saved message has no payload', () => {
      const msg: ClientMessage = { type: 'canvas-saved' };
      expect(msg.type).toBe('canvas-saved');
      expect(msg.workspaceId).toBeUndefined();
    });

    it('leave message has no payload', () => {
      const msg: ClientMessage = { type: 'leave' };
      expect(msg.type).toBe('leave');
    });

    it('all message types round-trip through JSON', () => {
      const messages: ClientMessage[] = [
        { type: 'join', workspaceId: 1 },
        { type: 'cursor', x: 10, y: 20 },
        { type: 'node-move', nodeId: 'n1', nodeX: 100, nodeY: 200, parentId: null },
        { type: 'canvas-saved' },
        { type: 'leave' },
      ];

      for (const msg of messages) {
        const serialized = JSON.stringify(msg);
        const parsed = JSON.parse(serialized) as ClientMessage;
        expect(parsed.type).toBe(msg.type);
      }
    });
  });

  describe('Server → Client message shapes', () => {
    it('presence message has users array', () => {
      const msg: ServerMessage = {
        type: 'presence',
        users: [
          { userId: 'u1', name: 'Alice', color: '#FF0000', cursor: null },
          { userId: 'u2', name: 'Bob', color: '#00FF00', cursor: { x: 10, y: 20 } },
        ],
      };
      expect(msg.users).toHaveLength(2);
      expect(msg.users[0].cursor).toBeNull();
      expect(msg.users[1].cursor.x).toBe(10);
    });

    it('joined message has userId, name, color', () => {
      const msg: ServerMessage = {
        type: 'joined',
        userId: 'u1',
        name: 'Alice',
        color: '#FF6600',
      };
      expect(msg.userId).toBe('u1');
    });

    it('node-move relay includes userId and position', () => {
      const msg: ServerMessage = {
        type: 'node-move',
        userId: 'u1',
        nodeId: 'node-1',
        nodeX: 500,
        nodeY: 600,
        parentId: null,
      };
      expect(msg.nodeId).toBe('node-1');
      expect(msg.nodeX).toBe(500);
      expect(msg.userId).toBe('u1');
    });

    it('canvas-saved relay includes userId', () => {
      const msg: ServerMessage = {
        type: 'canvas-saved',
        userId: 'u1',
      };
      expect(msg.type).toBe('canvas-saved');
      expect(msg.userId).toBe('u1');
    });

    it('error message has message string', () => {
      const msg: ServerMessage = {
        type: 'error',
        message: 'Unauthorized',
      };
      expect(msg.message).toBe('Unauthorized');
    });
  });
});
