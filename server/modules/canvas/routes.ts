import type { Express } from "express";
import { canvasStorage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { csrfProtection } from "../../middleware/csrf";
import type { AppContext } from "../../lib/registry";

export function registerCanvasRoutes(app: Express, context: AppContext) {
    const isAuthenticated = context.registry.get<any>("isAuthenticated");
    const workspaceStorage = context.registry.get<any>("workspaceStorage");
    const teamStorage = context.registry.get<any>("teamStorage");

    // Canvas logic routes
    app.get(api.workspaces.getCanvas.path, isAuthenticated, async (req, res) => {
        const id = Number(req.params.id);
        const workspace = await workspaceStorage.getWorkspace(id);
        if (!workspace) return res.status(404).json({ message: "Workspace not found" });

        const userId = req.user!.id;
        const hasAccess = await teamStorage.canAccessWorkspace(userId, workspace.id);
        if (!hasAccess) return res.status(401).json({ message: "Unauthorized" });

        const nodes = await canvasStorage.getNodes(id);
        const edges = await canvasStorage.getEdges(id);
        res.json({ nodes, edges });
    });

    app.post(api.workspaces.syncCanvas.path, csrfProtection, isAuthenticated, async (req, res) => {
        const id = Number(req.params.id);
        const workspace = await workspaceStorage.getWorkspace(id);
        if (!workspace) return res.status(404).json({ message: "Workspace not found" });

        const userId = req.user!.id;
        const role = await teamStorage.getWorkspaceRole(workspace.id, userId);
        if (!role || role === 'viewer') {
            return res.status(403).json({ message: "Forbidden: Viewer access cannot modify canvas" });
        }

        const { nodes, edges } = api.workspaces.syncCanvas.input.parse(req.body);
        await canvasStorage.syncCanvas(id, nodes, edges);
        res.json({ success: true });
    });

    // Duplicate canvas data when duplicating workspace
    app.post("/api/v1/workspaces/:id/duplicate-canvas", csrfProtection, isAuthenticated, async (req, res) => {
        const id = Number(req.params.id);
        const { toWorkspaceId } = req.body;
        
        const workspace = await workspaceStorage.getWorkspace(id);
        if (!workspace) return res.status(404).json({ message: "Source workspace not found" });

        const userId = req.user!.id;
        const role = await teamStorage.getWorkspaceRole(workspace.id, userId);
        if (!role || role === 'viewer') {
            return res.status(403).json({ message: "Forbidden: Viewer access cannot duplicate canvas" });
        }

        // Validate destination workspace — must be owned by the user
        const destWorkspace = await workspaceStorage.getWorkspace(toWorkspaceId);
        if (!destWorkspace || destWorkspace.userId !== userId) {
            return res.status(403).json({ message: "Cannot write to destination workspace" });
        }

        await canvasStorage.duplicateCanvas(id, toWorkspaceId);
        res.json({ success: true });
    });
}
