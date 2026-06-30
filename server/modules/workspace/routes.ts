import type { Express } from "express";
import { workspaceStorage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { csrfProtection } from "../../middleware/csrf";
import { createChildLogger } from "../../lib/logger";
import type { AppContext } from "../../lib/registry";

const log = createChildLogger("workspace");

export function registerWorkspaceRoutes(app: Express, context: AppContext) {
    const isAuthenticated = context.registry.get<any>("isAuthenticated");
    const teamStorage = context.registry.get<any>("teamStorage");
    const { eventBus } = context;

    // Collections (Subcollections)
    app.get("/api/v1/collections", isAuthenticated, async (req, res) => {
        const userId = req.user!.id;
        const parentId = req.query.parentId ? Number(req.query.parentId) : null;
        const collections = await workspaceStorage.getCollections(userId, parentId);
        res.json(collections);
    });

    app.post("/api/v1/collections", csrfProtection, isAuthenticated, async (req, res) => {
        try {
            const userId = req.user!.id;
            const collection = await workspaceStorage.createCollection({
                ...req.body,
                userId
            });
            res.status(201).json(collection);
        } catch (err) {
            log.error({ err, userId: req.user!.id }, "Failed to create collection");
            res.status(400).json({ message: "Failed to create collection" });
        }
    });

    app.get("/api/v1/collections/:id", isAuthenticated, async (req, res) => {
        const id = Number(req.params.id);
        const collection = await workspaceStorage.getCollectionById(id);
        if (!collection) return res.status(404).json({ message: "Collection not found" });

        const userId = req.user!.id;
        if (collection.userId !== userId) return res.status(403).json({ message: "You do not have access to this collection" });

        res.json(collection);
    });

    app.put("/api/v1/collections/:id", csrfProtection, isAuthenticated, async (req, res) => {
        const id = Number(req.params.id);
        const existing = await workspaceStorage.getCollectionById(id);
        if (!existing) return res.status(404).json({ message: "Collection not found" });

        const userId = req.user!.id;
        if (existing.userId !== userId) return res.status(403).json({ message: "You do not have access to this collection" });

        const updated = await workspaceStorage.updateCollection(id, req.body);
        res.json(updated);
    });

    app.delete("/api/v1/collections/:id", csrfProtection, isAuthenticated, async (req, res) => {
        const id = Number(req.params.id);
        const existing = await workspaceStorage.getCollectionById(id);
        if (!existing) return res.status(404).json({ message: "Collection not found" });

        const userId = req.user!.id;
        if (existing.userId !== userId) return res.status(403).json({ message: "You do not have access to this collection" });

        await workspaceStorage.deleteCollection(id);
        res.status(204).send();
    });

    // Workspace routes
    app.get(api.workspaces.list.path, isAuthenticated, async (req, res) => {
        const userId = req.user!.id;
        const collectionId = req.query.collectionId ? Number(req.query.collectionId) : null;
        const workspaces = await workspaceStorage.getWorkspaces(userId, collectionId);
        res.json(workspaces);
    });

    app.get(api.workspaces.get.path, isAuthenticated, async (req, res) => {
        const workspace = await workspaceStorage.getWorkspace(Number(req.params.id));
        if (!workspace) return res.status(404).json({ message: 'Workspace not found' });

        const userId = req.user!.id;
        const hasAccess = await teamStorage.canAccessWorkspace(userId, workspace.id);
        if (!hasAccess) return res.status(403).json({ message: "You do not have access to this workspace" });

        res.json(workspace);
    });

    app.post(api.workspaces.create.path, csrfProtection, isAuthenticated, async (req, res) => {
        try {
            const input = api.workspaces.create.input.parse(req.body);
            const userId = req.user!.id;
            const workspace = await workspaceStorage.createWorkspace({
                ...input,
                userId
            });
            res.status(201).json(workspace);
        } catch (err) {
            if (err instanceof z.ZodError) {
                return res.status(400).json({ message: err.errors[0].message });
            }
            log.error({ err, userId: req.user!.id }, "Failed to create workspace");
            throw err;
        }
    });

    app.put(api.workspaces.update.path, csrfProtection, isAuthenticated, async (req, res) => {
        try {
            const input = api.workspaces.update.input.parse(req.body);
            const id = Number(req.params.id);
            const existing = await workspaceStorage.getWorkspace(id);
            if (!existing) return res.status(404).json({ message: "Not found" });

            const userId = req.user!.id;
            const role = await teamStorage.getWorkspaceRole(id, userId);
            if (!role || role === 'viewer') {
                return res.status(403).json({ message: "Forbidden: Viewer access cannot modify workspace metadata" });
            }

            const updated = await workspaceStorage.updateWorkspace(id, input);
            res.json(updated);
        } catch (err) {
            if (err instanceof z.ZodError) {
                return res.status(400).json({ message: err.errors[0].message });
            }
            log.error({ err, userId: req.user!.id, workspaceId: Number(req.params.id) }, "Failed to update workspace");
            throw err;
        }
    });

    app.delete(api.workspaces.delete.path, csrfProtection, isAuthenticated, async (req, res) => {
        const id = Number(req.params.id);
        const existing = await workspaceStorage.getWorkspace(id);
        if (!existing) return res.status(404).json({ message: "Not found" });

        const userId = req.user!.id;
        const role = await teamStorage.getWorkspaceRole(id, userId);
        if (role !== 'workspace-owner' && role !== 'owner' && role !== 'admin') {
            return res.status(403).json({ message: "Forbidden: Only admins and owners can delete this workspace" });
        }

        // Delete canvas data first (nodes and edges)
        eventBus.emit('workspace.deleted', { id });
        
        await workspaceStorage.deleteWorkspace(id);
        res.status(204).send();
    });

    app.post(api.workspaces.duplicate.path, csrfProtection, isAuthenticated, async (req, res) => {
        const id = Number(req.params.id);
        const existing = await workspaceStorage.getWorkspace(id);
        if (!existing) return res.status(404).json({ message: "Not found" });

        const userId = req.user!.id;
        const role = await teamStorage.getWorkspaceRole(id, userId);
        if (role !== 'workspace-owner' && role !== 'owner' && role !== 'admin') {
            return res.status(403).json({ message: "Forbidden: Only admins and owners can duplicate this workspace" });
        }

        const { title } = req.body;
        const duplicated = await workspaceStorage.duplicateWorkspace(id, title);
        
        // Also duplicate the canvas data
        eventBus.emit('workspace.duplicated', { originalId: id, newId: duplicated.id });
        
        res.status(201).json(duplicated);
    });
}
