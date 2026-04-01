import { describe, it, expect } from 'vitest';
import { calculateContainment, calculateGlobalPosition } from '@/features/workspace/utils/containment';
import type { Node } from '@xyflow/react';

describe('Workspace Containment Math (Unit)', () => {

  const createContainer = (id: string, x: number, y: number, w: number, h: number): Node => ({
    id,
    type: 'vpc',
    position: { x, y },
    style: { width: w, height: h },
    data: { label: 'Container' }
  });

  const createNode = (id: string, x: number, y: number, parentId?: string): Node => ({
    id,
    type: 'ec2',
    position: { x, y },
    measured: { width: 100, height: 100 },
    parentId,
    data: { label: 'Instance' }
  });

  describe('calculateContainment', () => {
    it('should snap a node inside a valid container', () => {
      // Container from (0,0) to (500,500)
      const container = createContainer('vpc-1', 0, 0, 500, 500);
      
      // Node dragged to (100, 100). Center is (150, 150) which is inside container
      const node = createNode('node-1', 100, 100);
      
      const result = calculateContainment(node, [container, node]);
      
      expect(result.parentId).toBe('vpc-1');
      expect(result.localPosition).toEqual({ x: 100, y: 100 });
    });

    it('should return undefined when node is dropped outside any container', () => {
      // Container from (0,0) to (500,500)
      const container = createContainer('vpc-1', 0, 0, 500, 500);
      
      // Node dragged to (600, 600). Not in container.
      const node = createNode('node-1', 600, 600);
      
      const result = calculateContainment(node, [container, node]);
      
      expect(result.parentId).toBeUndefined();
      expect(result.localPosition).toBeUndefined();
    });

    it('should not reparent a node if it is already in that exact parent', () => {
      const container = createContainer('vpc-1', 0, 0, 500, 500);
      // Node already parented
      const node = createNode('node-1', 100, 100, 'vpc-1');
      
      const result = calculateContainment(node, [container, node]);
      
      // Should return undefined to prevent unnecessary state updates in ReactFlow
      expect(result.parentId).toBeUndefined();
    });
  });

  describe('calculateGlobalPosition', () => {
    it('should calculate global position correctly when removing from parent', () => {
      // Container at (200, 200)
      const container = createContainer('vpc-1', 200, 200, 500, 500);
      
      // Node local position is (50, 50) inside the container
      const node = createNode('node-1', 50, 50, 'vpc-1');
      
      const result = calculateGlobalPosition(node, [container, node]);
      
      // Global = Parent(x,y) + Local(x,y)
      expect(result).toEqual({ x: 250, y: 250 });
    });

    it('should return undefined if the node has no parent', () => {
      const container = createContainer('vpc-1', 200, 200, 500, 500);
      // Node has no parentId
      const node = createNode('node-1', 250, 250);
      
      const result = calculateGlobalPosition(node, [container, node]);
      
      expect(result).toBeUndefined();
    });
  });
});
