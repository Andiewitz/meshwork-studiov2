import { describe, it, expect, vi, beforeEach } from 'vitest';
import { canvasJsonSchema, importFromJson, exportAsJson } from '@/features/workspace/utils/exportCanvas';

// ─── canvasJsonSchema ────────────────────────────────────────────────

describe('canvasJsonSchema', () => {
    const validPayload = {
        title: 'My Canvas',
        nodes: [
            { id: 'n1', type: 'system', position: { x: 100, y: 200 }, data: { label: 'API' } },
            { id: 'n2', position: { x: 300, y: 400 }, data: {} },
        ],
        edges: [
            { id: 'e1', source: 'n1', target: 'n2' },
        ],
        exportedAt: '2026-05-10T12:00:00.000Z',
        version: 1,
    };

    it('accepts a valid canvas payload', () => {
        expect(canvasJsonSchema.safeParse(validPayload).success).toBe(true);
    });

    it('accepts payload without version (optional)', () => {
        const { version, ...noVersion } = validPayload;
        expect(canvasJsonSchema.safeParse(noVersion).success).toBe(true);
    });

    it('accepts nodes with extra properties (passthrough)', () => {
        const payload = {
            ...validPayload,
            nodes: [{ id: 'n1', position: { x: 0, y: 0 }, data: {}, width: 200, height: 100, customProp: true }],
        };
        expect(canvasJsonSchema.safeParse(payload).success).toBe(true);
    });

    it('accepts edges with extra properties (passthrough)', () => {
        const payload = {
            ...validPayload,
            edges: [{ id: 'e1', source: 'n1', target: 'n2', type: 'step', animated: true }],
        };
        expect(canvasJsonSchema.safeParse(payload).success).toBe(true);
    });

    it('rejects missing title', () => {
        const { title, ...noTitle } = validPayload;
        expect(canvasJsonSchema.safeParse(noTitle).success).toBe(false);
    });

    it('rejects missing nodes', () => {
        const { nodes, ...noNodes } = validPayload;
        expect(canvasJsonSchema.safeParse(noNodes).success).toBe(false);
    });

    it('rejects missing edges', () => {
        const { edges, ...noEdges } = validPayload;
        expect(canvasJsonSchema.safeParse(noEdges).success).toBe(false);
    });

    it('rejects missing exportedAt', () => {
        const { exportedAt, ...noDate } = validPayload;
        expect(canvasJsonSchema.safeParse(noDate).success).toBe(false);
    });

    it('rejects nodes without id', () => {
        const payload = {
            ...validPayload,
            nodes: [{ position: { x: 0, y: 0 }, data: {} }],
        };
        expect(canvasJsonSchema.safeParse(payload).success).toBe(false);
    });

    it('rejects nodes without position', () => {
        const payload = {
            ...validPayload,
            nodes: [{ id: 'n1', data: {} }],
        };
        expect(canvasJsonSchema.safeParse(payload).success).toBe(false);
    });

    it('rejects edges without source', () => {
        const payload = {
            ...validPayload,
            edges: [{ id: 'e1', target: 'n2' }],
        };
        expect(canvasJsonSchema.safeParse(payload).success).toBe(false);
    });

    it('rejects edges without target', () => {
        const payload = {
            ...validPayload,
            edges: [{ id: 'e1', source: 'n1' }],
        };
        expect(canvasJsonSchema.safeParse(payload).success).toBe(false);
    });

    it('accepts empty nodes and edges arrays', () => {
        const payload = { ...validPayload, nodes: [], edges: [] };
        expect(canvasJsonSchema.safeParse(payload).success).toBe(true);
    });
});

// ─── importFromJson ──────────────────────────────────────────────────

describe('importFromJson', () => {
    function makeFile(content: string, name = 'canvas.json'): File {
        return new File([content], name, { type: 'application/json' });
    }

    const validJson = JSON.stringify({
        title: 'Test',
        nodes: [{ id: 'n1', position: { x: 0, y: 0 }, data: { label: 'Node' } }],
        edges: [{ id: 'e1', source: 'n1', target: 'n1' }],
        exportedAt: '2026-01-01T00:00:00Z',
    });

    it('parses a valid JSON file and returns nodes + edges', async () => {
        const result = await importFromJson(makeFile(validJson));
        expect(result.nodes).toHaveLength(1);
        expect(result.edges).toHaveLength(1);
        expect(result.nodes[0].id).toBe('n1');
    });

    it('throws on invalid JSON syntax', async () => {
        await expect(importFromJson(makeFile('{ not valid json }}')))
            .rejects.toThrow('Invalid JSON file');
    });

    it('throws on missing required fields', async () => {
        const noTitle = JSON.stringify({ nodes: [], edges: [], exportedAt: '2026-01-01T00:00:00Z' });
        await expect(importFromJson(makeFile(noTitle)))
            .rejects.toThrow('Invalid canvas file');
    });

    it('throws on non-object input', async () => {
        await expect(importFromJson(makeFile('"just a string"')))
            .rejects.toThrow('Invalid canvas file');
    });

    it('throws on array input', async () => {
        await expect(importFromJson(makeFile('[1,2,3]')))
            .rejects.toThrow('Invalid canvas file');
    });

    it('preserves extra node properties', async () => {
        const json = JSON.stringify({
            title: 'Test',
            nodes: [{ id: 'n1', position: { x: 0, y: 0 }, data: {}, customField: 'hello' }],
            edges: [],
            exportedAt: '2026-01-01T00:00:00Z',
        });
        const result = await importFromJson(makeFile(json));
        expect(result.nodes[0].customField).toBe('hello');
    });
});

// ─── exportAsJson ────────────────────────────────────────────────────

describe('exportAsJson', () => {
    // In node environment, mock the DOM methods that exportAsJson uses
    beforeEach(() => {
        const mockAnchor = { href: '', download: '', click: vi.fn() };

        vi.stubGlobal('URL', {
            createObjectURL: vi.fn(() => 'blob:mock-url'),
            revokeObjectURL: vi.fn(),
        });

        vi.stubGlobal('document', {
            createElement: vi.fn(() => mockAnchor),
            body: {
                appendChild: vi.fn(),
                removeChild: vi.fn(),
            },
        });
    });

    it('creates a Blob and triggers download', () => {
        const nodes = [{ id: 'n1', position: { x: 0, y: 0 }, data: {} }];
        const edges = [{ id: 'e1', source: 'n1', target: 'n2' }];

        exportAsJson(nodes, edges, 'Test Canvas');

        expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
        const blobArg = (URL.createObjectURL as any).mock.calls[0][0] as Blob;
        expect(blobArg).toBeInstanceOf(Blob);
        expect(blobArg.type).toBe('application/json');
    });

    it('triggers anchor click for download', () => {
        exportAsJson([], [], 'Test');

        const anchor = (document.createElement as any).mock.results[0].value;
        expect(anchor.click).toHaveBeenCalled();
        expect(anchor.download).toContain('.json');
    });

    it('uses sanitized filename', () => {
        exportAsJson([], [], 'My Canvas! @#$');

        const anchor = (document.createElement as any).mock.results[0].value;
        expect(anchor.download).toBe('my-canvas.json');
    });

    it('handles empty title gracefully', () => {
        exportAsJson([], [], '');

        const anchor = (document.createElement as any).mock.results[0].value;
        expect(anchor.download).toBe('canvas.json');
    });

    it('includes correct JSON structure in blob', async () => {
        const nodes = [{ id: 'n1', position: { x: 10, y: 20 }, data: { label: 'Test' } }];
        const edges = [{ id: 'e1', source: 'n1', target: 'n2' }];

        exportAsJson(nodes, edges, 'My Project');

        const blobArg = (URL.createObjectURL as any).mock.calls[0][0] as Blob;
        const text = await blobArg.text();
        const parsed = JSON.parse(text);

        expect(parsed.title).toBe('My Project');
        expect(parsed.nodes).toHaveLength(1);
        expect(parsed.edges).toHaveLength(1);
        expect(parsed.version).toBe(1);
        expect(parsed.exportedAt).toBeDefined();
    });
});
