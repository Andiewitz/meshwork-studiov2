import { type Node } from '@xyflow/react';

/**
 * Calculates if a node is dropped inside a container (VPC, Region, Namespace)
 * and returns the parent ID and new local position if applicable.
 */
export const calculateContainment = (
  draggedNode: Node,
  allNodes: Node[]
): { parentId: string | undefined; localPosition: { x: number; y: number } | undefined } => {
  const containers = allNodes.filter(
    (n) => ['vpc', 'region', 'k8s-namespace'].includes(n.type!) && n.id !== draggedNode.id
  );

  // Current dragged node center
  const w = draggedNode.measured?.width || (draggedNode.style?.width as number) || 120;
  const h = draggedNode.measured?.height || (draggedNode.style?.height as number) || 80;
  const centerX = draggedNode.position.x + w / 2;
  const centerY = draggedNode.position.y + h / 2;

  const parent = containers.find((c) => {
    const cw = (c.style?.width as number) || 0;
    const ch = (c.style?.height as number) || 0;
    return (
      centerX >= c.position.x &&
      centerX <= c.position.x + cw &&
      centerY >= c.position.y &&
      centerY <= c.position.y + ch
    );
  });

  if (parent && draggedNode.parentId !== parent.id) {
    return {
      parentId: parent.id,
      localPosition: {
        x: draggedNode.position.x - parent.position.x,
        y: draggedNode.position.y - parent.position.y,
      },
    };
  }

  return { parentId: undefined, localPosition: undefined };
};

/**
 * Calculates global position when a node is dragged out of a parent.
 */
export const calculateGlobalPosition = (
  node: Node,
  allNodes: Node[]
): { x: number; y: number } | undefined => {
  if (!node.parentId) return undefined;

  const parentNode = allNodes.find((n) => n.id === node.parentId);
  if (parentNode) {
    return {
      x: node.position.x + parentNode.position.x,
      y: node.position.y + parentNode.position.y,
    };
  }
  return undefined;
};
