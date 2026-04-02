# Canvas Engine

> How Meshwork Studio turns drag-and-drop interactions into persistent, performant architecture diagrams.

## Table of Contents

1. [The Big Picture](#the-big-picture)
2. [Node System](#node-system)
3. [Spatial Containment](#spatial-containment)
4. [Database Sync Strategy](#database-sync-strategy)
5. [Data Flow](#data-flow)

---

## The Big Picture

The canvas is the heart of Meshwork Studio. It's where users visually design system architectures by dragging infrastructure components (servers, databases, VPCs, Kubernetes pods) onto an infinite 2D workspace and connecting them with edges.

Under the hood, this is powered by three layers working together:

```
┌──────────────────────────────────────────────────────────────┐
│  REACT FLOW (Visual Layer)                                    │
│  Handles rendering, dragging, zooming, panning, selections   │
├──────────────────────────────────────────────────────────────┤
│  CONTAINMENT ENGINE (Spatial Logic)                           │
│  Determines parent-child nesting (e.g. EC2 inside a VPC)     │
├──────────────────────────────────────────────────────────────┤
│  UPSERT SYNC (Persistence Layer)                              │
│  Efficiently saves only what changed to PostgreSQL            │
└──────────────────────────────────────────────────────────────┘
```

---

## Node System

Every draggable component on the canvas is a **Node**. Meshwork Studio ships with 60+ node types across several categories:

### Node Categories

| Category | Examples | Use Case |
|----------|----------|----------|
| **Compute** | `server`, `lambda`, `worker`, `microservice` | Application services |
| **Data** | `database`, `cache`, `storage`, `search` | Data stores and caches |
| **Networking** | `gateway`, `loadBalancer`, `cdn`, `route53` | Traffic routing |
| **Containers** | `k8s-pod`, `k8s-deployment`, `k8s-service` | Kubernetes resources |
| **Regions** | `vpc`, `region`, `k8s-namespace` | Container boundaries |
| **Annotations** | `note`, `annotation`, `text` | Documentation overlays |

Each node type has a predefined pixel dimension defined in `client/src/features/workspace/utils/dimensions.ts`. For example, a VPC container is `408×312px` while a Lambda function is `120×72px`. These dimensions ensure consistent, professional-looking diagrams regardless of zoom level.

### Database Schema

Nodes are stored in PostgreSQL with this structure:

```sql
CREATE TABLE nodes (
  id          TEXT PRIMARY KEY,        -- React Flow string ID (e.g. "node_abc123")
  workspace_id INTEGER NOT NULL,       -- Which workspace this belongs to
  type        TEXT,                     -- Node type (e.g. "server", "vpc")
  position    JSONB NOT NULL,          -- { x: number, y: number }
  data        JSONB NOT NULL,          -- Label, icon, custom properties
  parent_id   TEXT,                    -- Parent container node (for nesting)
  extent      TEXT                     -- "parent" locks node inside parent bounds
);
```

---

## Spatial Containment

This is the logic that makes dragging an EC2 instance into a VPC actually **nest** it inside that VPC. It lives in `client/src/features/workspace/utils/containment.ts`.

### How It Works

When a user finishes dragging a node, the engine runs a spatial check:

**Step 1: Find all containers on the canvas**
```
Filter nodes where type is "vpc", "region", or "k8s-namespace"
```

**Step 2: Calculate the center point of the dragged node**
```
centerX = node.position.x + (node.width / 2)
centerY = node.position.y + (node.height / 2)
```

**Step 3: Check if that center point falls inside any container's bounding box**
```
Is centerX between container.x and container.x + container.width?
Is centerY between container.y and container.y + container.height?
```

**Step 4: If yes, calculate the local position** (relative to the parent)
```
localX = node.position.x - container.position.x
localY = node.position.y - container.position.y
```

### Visual Example

```
┌─── VPC (0, 0) ──────────────────────────┐
│                                           │
│          ┌─── EC2 (100, 100) ───┐        │
│          │  center: (150, 150)  │        │
│          │  ✓ Inside VPC        │        │
│          └──────────────────────┘        │
│                                           │
│                                    500px  │
└────────────────────── 500px ─────────────┘

Result: parentId = "vpc-1", localPosition = { x: 100, y: 100 }
```

### Edge Case: Already Parented

If a node is already nested inside the container it's being dropped into, the engine returns `undefined` to avoid unnecessary React state updates. This prevents flickering and wasted render cycles.

### Unparenting (Global Position)

When a node is dragged **out** of a container, `calculateGlobalPosition()` converts the local coordinates back to global canvas coordinates:

```
globalX = localPosition.x + parent.position.x
globalY = localPosition.y + parent.position.y
```

---

## Database Sync Strategy

This is where things get interesting. Every time a user moves a node, the entire canvas state needs to be saved. The naive approach would destroy performance. Here's what we built instead.

### The Problem (Before)

The original implementation used a "nuke and rebuild" strategy:

```sql
-- Every single save, even for moving one node 1 pixel:
BEGIN;
  DELETE FROM edges WHERE workspace_id = 42;     -- Drop ALL edges
  DELETE FROM nodes WHERE workspace_id = 42;     -- Drop ALL nodes
  INSERT INTO nodes (...) VALUES (...), (...);   -- Reinsert EVERYTHING
  INSERT INTO edges (...) VALUES (...), (...);   -- Reinsert EVERYTHING
COMMIT;
```

For a diagram with 5,000 nodes and 3,000 edges, that's **16,000 row operations** just because someone nudged a server icon slightly to the left.

### The Solution: Upsert Diffing

We replaced this with an intelligent sync that only touches what actually changed:

```sql
BEGIN;
  -- Step 1: Find what exists in the database
  SELECT id FROM nodes WHERE workspace_id = 42;
  SELECT id FROM edges WHERE workspace_id = 42;

  -- Step 2: Delete only nodes/edges the user actually removed
  DELETE FROM edges WHERE id IN ('edge_deleted_1', 'edge_deleted_2');
  DELETE FROM nodes WHERE id IN ('node_deleted_1');

  -- Step 3: Upsert — insert new nodes, update moved ones
  INSERT INTO nodes (id, workspace_id, type, position, data, parent_id, extent)
  VALUES ('node_1', 42, 'server', '{"x":150,"y":200}', ...)
  ON CONFLICT (id) DO UPDATE SET
    type = EXCLUDED.type,
    position = EXCLUDED.position,
    data = EXCLUDED.data,
    parent_id = EXCLUDED.parent_id,
    extent = EXCLUDED.extent;

  -- Same for edges
  INSERT INTO edges (id, workspace_id, source, target, ...)
  VALUES (...)
  ON CONFLICT (id) DO UPDATE SET
    source = EXCLUDED.source,
    target = EXCLUDED.target,
    ...;
COMMIT;
```

### Performance Impact

| Scenario | Before (Nuke & Rebuild) | After (Upsert Diff) |
|----------|------------------------|---------------------|
| Move 1 node in a 5,000-node diagram | 16,000 row ops | 1 row op |
| Delete 3 nodes | 16,000 row ops | 3 row ops |
| Add 1 new node | 16,000 row ops | 1 row op |
| No changes (idle save) | 16,000 row ops | 0 row ops |

The implementation lives in `server/modules/canvas/storage.ts` in the `CanvasDatabaseStorage.syncCanvas()` method.

---

## Data Flow

Here's the complete journey of a node being dragged on the canvas:

```
User drags node ──► React Flow fires onNodeDragStop
                            │
                            ▼
                   Containment Engine checks
                   if node is inside a container
                            │
                   ┌────────┴────────┐
                   │                 │
              Inside VPC?       Not inside?
                   │                 │
          Set parentId +        Clear parentId,
          local position      use global position
                   │                 │
                   └────────┬────────┘
                            │
                            ▼
                   React Query fires
                   POST /api/workspaces/:id/sync-canvas
                            │
                            ▼
                   Express route validates
                   ownership (IDOR check)
                            │
                            ▼
                   Upsert Sync writes
                   only changed rows to Postgres
                            │
                            ▼
                   Response: { success: true }
```

---

## Key Files

| File | Purpose |
|------|---------|
| `client/src/features/workspace/utils/containment.ts` | Spatial containment math |
| `client/src/features/workspace/utils/dimensions.ts` | Node size definitions (60+ types) |
| `client/src/features/workspace/utils/nodeTypes.ts` | Node component registry |
| `client/src/hooks/use-canvas.ts` | React Query hook for canvas CRUD |
| `server/modules/canvas/storage.ts` | Upsert sync + database operations |
| `server/modules/canvas/routes.ts` | Canvas API endpoints |
| `shared/schema.ts` | Drizzle ORM schema (nodes & edges tables) |
