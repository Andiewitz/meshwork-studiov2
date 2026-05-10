import { describe, it, expect } from 'vitest';
import {
    SHORTCUTS,
    SHORTCUT_CATEGORIES,
    getShortcutsByCategory,
    type ShortcutDefinition,
} from '@/features/workspace/utils/shortcuts';

describe('Keyboard Shortcuts', () => {

    // ─── Data integrity ────────────────────────────────────────────

    it('has at least 10 shortcuts defined', () => {
        expect(SHORTCUTS.length).toBeGreaterThanOrEqual(10);
    });

    it('has no duplicate key combos', () => {
        const keys = SHORTCUTS.map(s => s.key);
        const unique = new Set(keys);
        expect(unique.size).toBe(keys.length);
    });

    it('has no duplicate labels', () => {
        const labels = SHORTCUTS.map(s => s.label);
        const unique = new Set(labels);
        expect(unique.size).toBe(labels.length);
    });

    it('every shortcut has a non-empty key', () => {
        SHORTCUTS.forEach(s => {
            expect(s.key.trim().length).toBeGreaterThan(0);
        });
    });

    it('every shortcut has a non-empty label', () => {
        SHORTCUTS.forEach(s => {
            expect(s.label.trim().length).toBeGreaterThan(0);
        });
    });

    it('every shortcut belongs to a valid category', () => {
        SHORTCUTS.forEach(s => {
            expect(SHORTCUT_CATEGORIES).toContain(s.category);
        });
    });

    // ─── Category definitions ──────────────────────────────────────

    it('has exactly 4 categories', () => {
        expect(SHORTCUT_CATEGORIES).toHaveLength(4);
    });

    it('includes Navigation, Editing, Canvas, View', () => {
        expect(SHORTCUT_CATEGORIES).toContain('Navigation');
        expect(SHORTCUT_CATEGORIES).toContain('Editing');
        expect(SHORTCUT_CATEGORIES).toContain('Canvas');
        expect(SHORTCUT_CATEGORIES).toContain('View');
    });

    // ─── Grouping ──────────────────────────────────────────────────

    it('getShortcutsByCategory returns all categories', () => {
        const grouped = getShortcutsByCategory();
        for (const cat of SHORTCUT_CATEGORIES) {
            expect(grouped[cat]).toBeDefined();
            expect(Array.isArray(grouped[cat])).toBe(true);
        }
    });

    it('grouped shortcuts total matches SHORTCUTS length', () => {
        const grouped = getShortcutsByCategory();
        const total = Object.values(grouped).reduce((sum, arr) => sum + arr.length, 0);
        expect(total).toBe(SHORTCUTS.length);
    });

    it('each category has at least 2 shortcuts', () => {
        const grouped = getShortcutsByCategory();
        for (const cat of SHORTCUT_CATEGORIES) {
            expect(grouped[cat].length).toBeGreaterThanOrEqual(2);
        }
    });

    // ─── Specific key mappings ─────────────────────────────────────

    it('? key is mapped to show shortcuts', () => {
        const found = SHORTCUTS.find(s => s.key === '?');
        expect(found).toBeDefined();
        expect(found!.label.toLowerCase()).toContain('shortcut');
    });

    it('F11 is mapped to fullscreen', () => {
        const found = SHORTCUTS.find(s => s.key === 'F11');
        expect(found).toBeDefined();
        expect(found!.label.toLowerCase()).toContain('fullscreen');
    });

    it('Ctrl+Z is mapped to undo', () => {
        const found = SHORTCUTS.find(s => s.key === 'Ctrl+Z');
        expect(found).toBeDefined();
        expect(found!.label.toLowerCase()).toContain('undo');
    });

    it('Ctrl+S is mapped to save', () => {
        const found = SHORTCUTS.find(s => s.key === 'Ctrl+S');
        expect(found).toBeDefined();
        expect(found!.label.toLowerCase()).toContain('save');
    });
});
