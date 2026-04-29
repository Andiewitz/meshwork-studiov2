import { db } from "./db";
import {
    nodes,
    edges,
    workspaces,
    type Node,
    type Edge,
    type InsertNode,
    type InsertEdge,
} from "@shared/schema";
import { eq, inArray, sql, and } from "drizzle-orm";

export interface ICanvasStorage {
    // Canvas operations
    getNodes(workspaceId: number): Promise<Node[]>;
    getEdges(workspaceId: number): Promise<Edge[]>;
    syncCanvas(workspaceId: number, nodes: InsertNode[], edges: InsertEdge[]): Promise<void>;
    duplicateCanvas(fromWorkspaceId: number, toWorkspaceId: number): Promise<void>;
}

export class CanvasDatabaseStorage implements ICanvasStorage {
    async getNodes(workspaceId: number): Promise<Node[]> {
        return await db.select().from(nodes).where(eq(nodes.workspaceId, workspaceId));
    }

    async getEdges(workspaceId: number): Promise<Edge[]> {
        return await db.select().from(edges).where(eq(edges.workspaceId, workspaceId));
    }

    async syncCanvas(workspaceId: number, newNodes: InsertNode[], newEdges: InsertEdge[]): Promise<void> {
        await db.transaction(async (tx: any) => {
            // 1. Fetch existing IDs
            const existingNodesData = await tx.select({ id: nodes.id }).from(nodes).where(eq(nodes.workspaceId, workspaceId));
            const existingEdgesData = await tx.select({ id: edges.id }).from(edges).where(eq(edges.workspaceId, workspaceId));

            const existingNodeIds = new Set<string>(existingNodesData.map((n: any) => n.id));
            const existingEdgeIds = new Set<string>(existingEdgesData.map((e: any) => e.id));

            const newNodeIds = new Set<string>(newNodes.map(n => n.id));
            const newEdgeIds = new Set<string>(newEdges.map(e => e.id));

            // 2. Identify stale nodes and edges to prune
            const nodesToDelete = Array.from(existingNodeIds).filter(id => !newNodeIds.has(id)) as string[];
            const edgesToDelete = Array.from(existingEdgeIds).filter(id => !newEdgeIds.has(id)) as string[];

            // 3. Delete orphaned entities explicitly
            if (edgesToDelete.length > 0) {
                await tx.delete(edges).where(
                    and(
                        eq(edges.workspaceId, workspaceId),
                        inArray(edges.id, edgesToDelete)
                    )
                );
            }
            if (nodesToDelete.length > 0) {
                await tx.delete(nodes).where(
                    and(
                        eq(nodes.workspaceId, workspaceId),
                        inArray(nodes.id, nodesToDelete)
                    )
                );
            }

            // 4. Safely Upsert
            if (newNodes.length > 0) {
                await tx.insert(nodes).values(newNodes.map(n => ({ ...n, workspaceId })))
                    .onConflictDoUpdate({
                        target: [nodes.id, nodes.workspaceId],
                        set: {
                            type: sql`EXCLUDED.type`,
                            position: sql`EXCLUDED.position`,
                            data: sql`EXCLUDED.data`,
                            parentId: sql`EXCLUDED.parent_id`,
                            extent: sql`EXCLUDED.extent`,
                            style: sql`EXCLUDED.style`,
                            width: sql`EXCLUDED.width`,
                            height: sql`EXCLUDED.height`,
                            measured: sql`EXCLUDED.measured`,
                        }
                    });
            }
            if (newEdges.length > 0) {
                await tx.insert(edges).values(newEdges.map(e => ({ ...e, workspaceId })))
                    .onConflictDoUpdate({
                        target: [edges.id, edges.workspaceId],
                        set: {
                            source: sql`EXCLUDED.source`,
                            target: sql`EXCLUDED.target`,
                            sourceHandle: sql`EXCLUDED.source_handle`,
                            targetHandle: sql`EXCLUDED.target_handle`,
                            type: sql`EXCLUDED.type`,
                            data: sql`EXCLUDED.data`,
                            style: sql`EXCLUDED.style`,
                            markerEnd: sql`EXCLUDED.marker_end`,
                            animated: sql`EXCLUDED.animated`,
                        }
                    });
            }

            // 5. Update workspace updated_at timestamp
            await tx.update(workspaces)
                .set({ updatedAt: new Date() })
                .where(eq(workspaces.id, workspaceId));
        });
    }

    async duplicateCanvas(fromWorkspaceId: number, toWorkspaceId: number): Promise<void> {
        await db.transaction(async (tx: any) => {
            const nodesList = await tx.select().from(nodes).where(eq(nodes.workspaceId, fromWorkspaceId));
            const edgesList = await tx.select().from(edges).where(eq(edges.workspaceId, fromWorkspaceId));

            if (nodesList.length > 0) {
                await tx.insert(nodes).values(nodesList.map((n: any) => ({ ...n, workspaceId: toWorkspaceId })));
            }
            if (edgesList.length > 0) {
                await tx.insert(edges).values(edgesList.map((e: any) => ({ ...e, workspaceId: toWorkspaceId })));
            }
        });
    }
}

// In-memory fallback for Canvas
export class CanvasMemStorage implements ICanvasStorage {
    private nodesMap: Map<string, Node> = new Map();
    private edgesMap: Map<string, Edge> = new Map();

    async getNodes(workspaceId: number): Promise<Node[]> {
        return Array.from(this.nodesMap.values()).filter(n => n.workspaceId === workspaceId);
    }

    async getEdges(workspaceId: number): Promise<Edge[]> {
        return Array.from(this.edgesMap.values()).filter(e => e.workspaceId === workspaceId);
    }

    async syncCanvas(workspaceId: number, newNodes: InsertNode[], newEdges: InsertEdge[]): Promise<void> {
        for (const [id, node] of Array.from(this.nodesMap.entries())) {
            if (node.workspaceId === workspaceId) this.nodesMap.delete(id);
        }
        for (const [id, edge] of Array.from(this.edgesMap.entries())) {
            if (edge.workspaceId === workspaceId) this.edgesMap.delete(id);
        }
        for (const n of newNodes) {
            this.nodesMap.set(`${workspaceId}:${n.id}`, { ...n, workspaceId } as Node);
        }
        for (const e of newEdges) {
            this.edgesMap.set(`${workspaceId}:${e.id}`, { ...e, workspaceId } as Edge);
        }
    }

    async duplicateCanvas(fromWorkspaceId: number, toWorkspaceId: number): Promise<void> {
        const nodesToDuplicate = Array.from(this.nodesMap.values()).filter(n => n.workspaceId === fromWorkspaceId);
        const edgesToDuplicate = Array.from(this.edgesMap.values()).filter(e => e.workspaceId === fromWorkspaceId);

        for (const node of nodesToDuplicate) {
            this.nodesMap.set(`${toWorkspaceId}:${node.id}`, { ...node, workspaceId: toWorkspaceId } as Node);
        }
        for (const edge of edgesToDuplicate) {
            this.edgesMap.set(`${toWorkspaceId}:${edge.id}`, { ...edge, workspaceId: toWorkspaceId } as Edge);
        }
    }
}

export const canvasStorage = process.env.CANVAS_DATABASE_URL || process.env.DATABASE_URL
    ? new CanvasDatabaseStorage()
    : new CanvasMemStorage();
